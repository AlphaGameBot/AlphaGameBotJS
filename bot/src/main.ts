// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.
import { loadDotenv } from "./utility/debug/dotenv.js";
await loadDotenv();

import { Events, User, type ClientEvents } from "discord.js";
import { existsSync } from "node:fs";
import { client, gracefulExit } from "./client.js";
import type { WebhookMetadata } from "./interfaces/WebhookMetadata.js";
import { startPrometheusExporter } from "./services/metrics/exports/prometheus.js";
import { Metrics, metricsManager } from "./services/metrics/metrics.js";
import { lazyPopulateUser } from "./subsystems/lazyPopulation.js";
import { rotatingStatus } from "./subsystems/rotatingStatus.js";
import { UptimeSubsystem } from "./subsystems/uptime.js";
import { crawlEvents } from "./utility/crawler.js";
import prisma from "./utility/database.js";
import { ensureUser } from "./utility/dbHelpers.js";
import logger, { getLogger, getLokiLogger } from "./utility/logging/logger.js";

// Ensure the database is loaded before we do anything else
// Pretty important!
await import("./utility/database.js").then(() => {
    logger.verbose("Database module loaded.");
}).catch((e) => {
    logger.error("Error loading database module:", e);
    process.exit(1);
});


// is there the 'dist' folder in cwd?
const weHaveDist = existsSync("./dist");

if (weHaveDist) {
    logger.verbose("I can see that we have a 'dist' folder, changing cwd to it.");
    process.chdir("./dist");
}

// Initialize the uptime subsystem
try {
    const uptimeSystem = new UptimeSubsystem();
    uptimeSystem.begin();
} catch { } // We don't really care if it fails, and if it does, the subsystem already logged it.


// Note, client is imported from client.ts
//       this is to make it accessible to other modules
client.once(Events.ClientReady, async (readyClient) => {
    logger.info(`Ready! Logged in as ${readyClient.user.username}`);
    startPrometheusExporter();
    await rotatingStatus();
});

if (process.env.ERROR_WEBHOOK_URL) {
    fetch(process.env.ERROR_WEBHOOK_URL).then(async (res) => {
        if (!res.ok) {
            logger.error(`Failed to fetch webhook metadata: HTTP ${res.status} ${res.statusText}`);
            return;
        }
        const json: WebhookMetadata = await res.json() as unknown as WebhookMetadata;
        logger.info(`ERROR_WEBHOOK_URL is set up, and is working. Name: ${json.name}, ID: ${json.id}`);
    }).catch((e) => {
        logger.error("Error fetching webhook metadata:", e);
    });
} else {
    logger.warn("ERROR_WEBHOOK_URL is not set, error logging via Discord webhook is disabled.");
}

// when quit signal is received, log out the bot
// SIGINT  (Signal Interrupt) is sent from terminal on Ctrl+C
// SIGTERM (Signal Terminate) is sent from terminal on kill command (or asking to stop politely)
process.on("SIGINT", async () => { gracefulExit("SIGINT"); });
process.on("SIGTERM", async () => { gracefulExit("SIGTERM"); });
process.on("uncaughtException", async (e) => {
    await client.destroy();
    logger.error("Uncaught Exception:", e);
    process.exit(1);
});

const token = process.env.TOKEN;
if (!token) {
    logger.error("Error: TOKEN environment variable is not set.");
    process.exit(1);
}

// client: on *any event*
const allEvents = Object.values(Events);
const eventLogger = getLogger("events");
client.on("raw", (event) => {
    metricsManager.submitMetric<Metrics.RAW_EVENT_RECEIVED>(Metrics.RAW_EVENT_RECEIVED, {
        event: event.t
    });

    if (allEvents.includes(event.t as Events)) {
        eventLogger.verbose(`Raw event received: ${event.t} (${JSON.stringify(event.d)})`);
    } else {
        eventLogger.verbose(`Raw event received: ${event.t} (not in Events enum, data contains ${Object.keys(event.d).length} keys)`);
    }
});

// on raw, attempt to add the user to the database (if not already present)
client.on("raw", async (event) => {
    const data = event.d;
    if (!data) return; // no data, nothing to do
    // we use event.d.au
    if (!event.author && !data.user) return; // no author, nothing to do

    const user = (event.author ? event.author : data.user) as User;

    // Never add bot accounts to the DB.
    if (user && (user as any).bot) return;

    await prisma.$transaction(async (tx) => {
        return await ensureUser(tx, user);
    }).catch((e) => {
        logger.error(`Error upserting user ${user.id} (${user.username}#${user.discriminator}):` + e);
    });

    await lazyPopulateUser(user);
});

const djsLogger = getLokiLogger("discordjs", { level: "debug" });
client
    .on("debug", (info) => { djsLogger.debug(info); })
    .on("error", (info) => { djsLogger.error(info); })
    .on("warn", (info) => { djsLogger.warn(info); });

const events = await crawlEvents();
for (const event of events) {
    logger.debug(`Registering event handler for event: ${event.name}`);
    const wrapper = async (...args: unknown[]) => {
        // Avoid forcing string coercion of potentially circular event args (can cause deep recursion).
        logger.verbose(`Fired event: ${event.name}`, { args });

        // count execution time in milliseconds
        const start = performance.now();
        try {
            await event.execute(...args as ClientEvents[typeof event.name]);
        } catch (e) {
            // Log stack explicitly to avoid any implicit coercion of complex objects
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errAny = e as any;
            logger.error(`Error executing event ${event.name}: ${errAny && errAny.stack ? errAny.stack : String(e)}`);
        } finally {
            const durationMs = performance.now() - start;
            logger.verbose(`Event ${event.name} executed in ${durationMs.toFixed(2)}ms`, { durationMs });
            // Submit metric without the "event" label to match the initial labelset
            metricsManager.submitMetric<Metrics.EVENT_EXECUTED>(Metrics.EVENT_EXECUTED, {
                event: event.name as Events,
                durationMs: durationMs,
                eventFile: event.eventFile
            });

            if (durationMs > 1000) {
                logger.warn(`Event ${event.name} took a long time to execute: ${durationMs.toFixed(2)}ms (${(durationMs / 1000).toFixed(2)}s)`, { event, duration: durationMs, eventExecData: args });
            }
        }
    };
    if (event.once) {
        client.once(event.name, wrapper);
    } else {
        client.on(event.name, wrapper);
    }
}

// for all events in the Events enum, count them
for (const eventName of Object.values(Events)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client.on(eventName as keyof ClientEvents, (...args) => {
        metricsManager.submitMetric<Metrics.EVENT_RECEIVED>(Metrics.EVENT_RECEIVED, {
            event: eventName as Events
        });
    });
}

logger.info("Logging in to Discord...");
await client.login(token);