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

import { Events, type GuildMember } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import prisma from "../utility/database.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/GuildMemberAdd");

export default {
    name: Events.GuildMemberAdd,
    execute: async (member: GuildMember) => {
        // Skip bots
        if (member.user.bot) return;
        
        logger.verbose(`Member joined guild: ${member.user.username} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`);
        
        // Ensure both user and guild exist in the database
        await prisma.$transaction(async (tx) => {
            // Ensure guild exists
            await tx.guild.upsert({
                where: { id: member.guild.id },
                create: { 
                    id: member.guild.id, 
                    name: member.guild.name 
                },
                update: { 
                    name: member.guild.name 
                }
            });
            
            // Ensure user exists
            await tx.user.upsert({
                where: { id: member.user.id },
                create: { 
                    id: member.user.id, 
                    username: member.user.username,
                    discriminator: member.user.discriminator
                },
                update: { 
                    username: member.user.username,
                    discriminator: member.user.discriminator
                }
            });
        }).catch((error) => {
            logger.error(`Failed to upsert user/guild for member ${member.user.id} in guild ${member.guild.id}:`, error);
        });
    }
} as EventHandler<Events.GuildMemberAdd>;
