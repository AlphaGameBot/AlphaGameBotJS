// /* eslint-disable no-trailing-spaces */
// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free softws are: you can redistribute it and/or modify
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
// /* eslint-enable no-trailing-spaces */


import { Client, Events, GatewayIntentBits, type ClientEvents } from "discord.js";
import { existsSync } from "node:fs";
import { Metrics, metricsManager } from "./services/metrics/metrics.js";
import { crawlEvents } from "./utility/crawler.js";
import { loadDotenv } from "./utility/debug/dotenv.js";
import logger from "./utility/logger.js";

await loadDotenv();

// is there the 'dist' folder in cwd?
const weHaveDist = existsSync("./dist");

if (weHaveDist) {
    logger.verbose("I can see that we have a 'dist' folder, changing cwd to it.");
    process.chdir("./dist");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Ready! Logged in as ${readyClient.user.username}`);
});

// when quit signal is received, log out the bot
process.on("SIGINT", async () => {
    logger.info("SIGINT received, logging out...");
    await client.destroy();
    process.exit(0);
});

const token = process.env.TOKEN;
if (!token) {
    logger.error("Error: TOKEN environment variable is not set.");
    process.exit(1);
}

const events = await crawlEvents();
for (const event of events) {
    const wrapper = async (...args: unknown[]) => {
        logger.verbose(`Fired event: ${event.name} (${args})`);

        // count execution time in milliseconds
        const start = Date.now();
        await event.execute(...args as ClientEvents[typeof event.name]);
        metricsManager.submitMetric<Metrics.EVENT_EXECUTED>(Metrics.EVENT_EXECUTED, {
            event: event.name as Events,
            durationMs: Date.now() - start
        });
    };
    if (event.once) {
        client.once(event.name, wrapper);
    } else {
        client.on(event.name, wrapper);
    }
}

client.login(token);