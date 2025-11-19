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

import { Events, type Guild } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import prisma from "../utility/database.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/GuildCreate");

export default {
    name: Events.GuildCreate,
    execute: async (guild: Guild) => {
        logger.info(`Bot joined guild: ${guild.name} (${guild.id})`);
        
        // Ensure the guild exists in the database
        await prisma.guild.upsert({
            where: { id: guild.id },
            create: { 
                id: guild.id, 
                name: guild.name 
            },
            update: { 
                name: guild.name 
            }
        }).catch((error) => {
            logger.error(`Failed to upsert guild ${guild.id} (${guild.name}):`, error);
        });
    }
} as EventHandler<Events.GuildCreate>;
