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

import { Events, type Client } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import prisma from "../utility/database.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/GuildSync");

/**
 * Event handler that runs once when the bot becomes ready.
 * Ensures all guilds the bot is currently in are registered in the database.
 */
export default {
    name: Events.ClientReady,
    once: true,
    execute: async (client: Client) => {
        logger.info(`Syncing ${client.guilds.cache.size} guilds to database...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Register all guilds the bot is currently in
        for (const [, guild] of client.guilds.cache) {
            try {
                await prisma.guild.upsert({
                    where: { id: guild.id },
                    create: { 
                        id: guild.id, 
                        name: guild.name 
                    },
                    update: { 
                        name: guild.name 
                    }
                });
                successCount++;
            } catch (error) {
                logger.error(`Failed to sync guild ${guild.id} (${guild.name}):`, error);
                errorCount++;
            }
        }
        
        logger.info(`Guild sync complete: ${successCount} successful, ${errorCount} failed`);
    }
} as EventHandler<Events.ClientReady>;
