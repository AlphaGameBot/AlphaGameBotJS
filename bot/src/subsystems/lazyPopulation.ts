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

import type { User } from "discord.js";
import { existsSync, readFileSync } from "node:fs";
import { client } from "../client.js";
import { Features, Metrics, metricsManager } from "../services/metrics/metrics.js";
import prisma from "../utility/database.js";
import { ensureUser } from "../utility/dbHelpers.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("subsystems/lazyPopulation");

interface Stats {
    messages_sent: number;
    commands_ran: number;
    last_announced_level: number;
}

interface LazyPopulationUser {
    global: Stats;
    guilds: Record<string, Stats>;
}
// Does the file /lazy_population.json exist?
const lazyPopulationFileExists = existsSync("/lazy_population.json");

if (!lazyPopulationFileExists) {
    console.warn("Warning: lazy_population.json file does not exist. Lazy population is disabled.");
    console.warn("To enable lazy population, create the file /lazy_population.json with the appropriate configuration.");
    console.warn("Refer to the documentation for more details.");
}

var lazyPopulationConfig: Record<string, LazyPopulationUser>;
if (lazyPopulationFileExists) {
    // load the file sync
    lazyPopulationConfig = JSON.parse(
        // eslint-disable-next-line node/no-sync
        readFileSync("/lazy_population.json", "utf-8")
    ) as Record<string, LazyPopulationUser>;
    logger.info("Lazy population configuration loaded from /lazy_population.json");
} else {
    lazyPopulationConfig = {};
}


/**
 * Trigger warning: really bad code ahead.
 * 
 * Basically, we migrated from MySQL to PostgreSQL, and we can't migrate well because of the
 * radically different schemas. Fuck me.
 */
export async function lazyPopulateUser(user: User) {
    // Never lazy-populate bot accounts.
    if (user.bot) return;

    // does the user exist in the lazy population config?
    if (!lazyPopulationConfig[user.id]) {
        return;
    }

    const userConfig = lazyPopulationConfig[user.id];

    if (!userConfig) return;

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (currentUser?.wasLazyPopulated) {
        logger.debug(`User ${user.id} (${user.username}#${user.discriminator}) was already lazy populated.`);
        return;
    }

    logger.info(`Lazy populating user ${user.id} (${user.username}#${user.discriminator})`);
    metricsManager.submitMetric(Metrics.FEATURE_USED, { feature: Features.LAZY_POPULATION });

    await prisma.$transaction(async (tx) => {
        // Use shared helper to ensure the user exists; helper will skip bots.
        await ensureUser(tx, user);

        for (const [guildId, stats] of Object.entries(userConfig.guilds)) {
            // client - get guild info from id
            const guild = await client.guilds.fetch(guildId).catch(() => null);

            let guildName;
            if (!guild) {
                logger.warn(`Guild ${guildId} not found while lazy populating user ${user.id}`);
                guildName = "Unknown (Lazy Population)";
                continue;
            }

            guildName = guild.name;
            await tx.guild.upsert({
                where: { id: guildId },
                create: { id: guildId, name: guildName },
                update: { name: guildName }
            })

            await tx.userStats.upsert({
                where: {
                    user_id_guild_id: {
                        user_id: user.id,
                        guild_id: guildId
                    }
                },
                create: {
                    user_id: user.id,
                    guild_id: guildId,
                    messages_sent: stats.messages_sent,
                    commands_ran: stats.commands_ran,
                    last_announced_level: stats.last_announced_level
                },
                update: {
                    messages_sent: stats.messages_sent,
                    commands_ran: stats.commands_ran,
                    last_announced_level: stats.last_announced_level
                }
            })
        }

        logger.info(`Lazy populated user ${user.id} (${user.username}#${user.discriminator}) from lazy_population.json`);
    });
}