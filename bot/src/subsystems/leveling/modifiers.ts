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

export async function addMessage(userId: string, guildId: string) {
    logger.verbose(`Adding message for user ${userId} in guild ${guildId}`);
    const global = await prisma.userStats.findFirst({ where: { user_id: userId, guild_id: null } });
    if (global) {
        await prisma.userStats.update({ where: { id: global.id }, data: { messages_sent: { increment: 1 } } });
    } else {
        await prisma.userStats.create({ data: { user_id: userId, guild_id: null, messages_sent: 1, commands_ran: 0 } });
    }

    const guildRow = await prisma.userStats.findFirst({ where: { user_id: userId, guild_id: guildId } });
    if (guildRow) {
        return await prisma.userStats.update({ where: { id: guildRow.id }, data: { messages_sent: { increment: 1 } } });
    }

    return await prisma.userStats.create({ data: { user_id: userId, guild_id: guildId, messages_sent: 1, commands_ran: 0 } });
}

export async function addCommand(userId: string, guildId: string) {
    logger.verbose(`Adding command for user ${userId} in guild ${guildId}`);
    const global = await prisma.userStats.findFirst({ where: { user_id: userId, guild_id: null } });
    if (global) {
        await prisma.userStats.update({ where: { id: global.id }, data: { commands_ran: { increment: 1 } } });
    } else {
        await prisma.userStats.create({ data: { user_id: userId, guild_id: null, commands_ran: 1, messages_sent: 0 } });
    }

    const guildRow = await prisma.userStats.findFirst({ where: { user_id: userId, guild_id: guildId } });
    if (guildRow) {
        return await prisma.userStats.update({ where: { id: guildRow.id }, data: { commands_ran: { increment: 1 } } });
    }

    return await prisma.userStats.create({ data: { user_id: userId, guild_id: guildId, messages_sent: 0, commands_ran: 1 } });
}