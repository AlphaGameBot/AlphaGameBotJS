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

import { PrismaClient } from "@prisma/client";
import logger from "../../utility/logger.js";


const prisma = new PrismaClient();

export async function addMessage(userId: number, guildId: number) {
    logger.verbose(`Adding message for user ${userId} in guild ${guildId}`);

    await prisma.user_stats.upsert({
        where: { user_id: BigInt(userId) },
        update: { messages_sent: { increment: 1 } },
        create: { user_id: BigInt(userId), messages_sent: 1, commands_ran: 0 }
    });

    return await prisma.guild_user_stats.upsert({
        where: {
            user_id_guild_id: { user_id: BigInt(userId), guild_id: BigInt(guildId) }
        },
        update: {
            messages_sent: { increment: 1 }
        },
        create: {
            user_id: BigInt(userId),
            guild_id: BigInt(guildId),
            messages_sent: 1,
            commands_ran: 0
        }
    });
}

export async function addCommand(userId: number, guildId: number) {
    logger.verbose(`Adding command for user ${userId} in guild ${guildId}`);
    await prisma.user_stats.upsert({
        where: { user_id: BigInt(userId) },
        update: { commands_ran: { increment: 1 } },
        create: { user_id: BigInt(userId), commands_ran: 1, messages_sent: 0 }
    });

    return await prisma.guild_user_stats.upsert({
        where: {
            user_id_guild_id: { user_id: BigInt(userId), guild_id: BigInt(guildId) }
        },
        update: {
            commands_ran: { increment: 1 }
        },
        create: {
            user_id: BigInt(userId),
            guild_id: BigInt(guildId),
            messages_sent: 0,
            commands_ran: 1
        }
    });
}