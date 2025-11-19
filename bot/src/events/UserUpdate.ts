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

import { Events, type User } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import prisma from "../utility/database.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/UserUpdate");

export default {
    name: Events.UserUpdate,
    execute: async (oldUser: User, newUser: User) => {
        // Skip bots
        if (newUser.bot) return;
        
        logger.verbose(`User updated: ${newUser.username} (${newUser.id})`);
        
        // Update the user in the database
        await prisma.user.upsert({
            where: { id: newUser.id },
            create: { 
                id: newUser.id, 
                username: newUser.username,
                discriminator: newUser.discriminator
            },
            update: { 
                username: newUser.username,
                discriminator: newUser.discriminator
            }
        }).catch((error) => {
            logger.error(`Failed to update user ${newUser.id} (${newUser.username}):`, error);
        });
    }
} as EventHandler<Events.UserUpdate>;
