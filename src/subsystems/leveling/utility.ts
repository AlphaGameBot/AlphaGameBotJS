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
import logger from "../../utility/logger.js";
import { calculateLevelFromPoints, calculatePoints } from "./math.js";

export async function userNeedsLevelUpAnnouncement(userId: string, guildId: string): Promise<boolean> {
    const currentData = await prisma.guild_user_stats.findUnique({
        where: {
            user_id_guild_id: { user_id: userId, guild_id: guildId }
        }
    });
    const points = calculatePoints(currentData?.messages_sent || 0, currentData?.commands_ran || 0);
    const level = await calculateLevelFromPoints(points);

    logger.debug(`User ${userId} in guild ${guildId} is level ${level} with ${points} points`);
    const data = await prisma.guild_user_stats.findUnique({
        where: {
            user_id_guild_id: { user_id: userId, guild_id: guildId }
        }
    });

    logger.debug(`User ${userId} in guild ${guildId} last announced level is ${data?.last_announced_level}`);
    if (!data) return false;

    return data.last_announced_level < level;
}