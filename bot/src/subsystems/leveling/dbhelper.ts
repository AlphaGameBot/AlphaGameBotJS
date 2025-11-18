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

import prisma from "../../utility/database.js";
import logger from "../../utility/logging/logger.js";
import { calculateLevelFromPoints, calculatePoints } from "./math.js";


export async function addMessage(userId: string, guildId: string) {
    logger.verbose(`Adding message for user ${userId} in guild ${guildId}`);

    await prisma.userStats.upsert({
        where: {
            user_id_guild_id: {
                user_id: userId,
                guild_id: guildId
            }
        },
        update: {
            messages_sent: { increment: 1 }
        },
        create: {
            user_id: userId,
            guild_id: guildId,
            messages_sent: 1,
            commands_ran: 0
        }
    });
}

export async function addCommand(userId: string, guildId: string) {
    logger.verbose(`Adding command for user ${userId} in guild ${guildId}`);

    // Guild-scoped stats

    // use upsert instead
    await prisma.userStats.upsert({
        where: {
            user_id_guild_id: {
                user_id: userId,
                guild_id: guildId
            }
        },
        update: {
            commands_ran: { increment: 1 }
        },
        create: {
            user_id: userId,
            guild_id: guildId,
            messages_sent: 0,
            commands_ran: 1
        }
    });
}

export async function getUserLevel(userId: string, guildId: string) {
    logger.verbose(`Getting level for user ${userId} in guild ${guildId}`);
    const user = await prisma.userStats.findFirst({ where: { user_id: userId, guild_id: guildId } });

    if (!user) return -1;

    const points = calculatePoints(user.messages_sent, user.commands_ran);
    return calculateLevelFromPoints(points);
}