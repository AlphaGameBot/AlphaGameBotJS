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

import { Events, type Message } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import { addMessage, getUserLevel } from "../subsystems/leveling/dbhelper.js";
import { userNeedsLevelUpAnnouncement } from "../subsystems/leveling/utility.js";
import prisma from "../utility/database.js";
import logger from "../utility/logger.js";

export default {
    name: Events.MessageCreate,
    execute: async (message: Message) => {
        // Ignore messages from bots
        if (message.author.bot) return;

        await addMessage(message.author.id, message.guildId ?? "0");

        if (await userNeedsLevelUpAnnouncement(message.author.id, message.guildId ?? "0")) {
            logger.debug(`User ${message.author.id} in guild ${message.guildId} needs level up announcement.`);
            // Can only send announcements in guild text channels
            const newLevel = await getUserLevel(message.author.id, message.guildId ?? "0");
            if (!message.guild) return;

            // Check if we have permission to send messages
            if (message.channel.isTextBased() &&
                !message.channel.isDMBased() &&
                message.guild.members.me &&
                message.channel.permissionsFor(message.guild.members.me)?.has("SendMessages")) {

                const replyMessage = await message.reply(`:tada: Congrats, <@${message.author.id}>! You just advanced to level **${newLevel}**! Nice!`);
                setTimeout(async () => { await replyMessage.delete().catch(() => { }); }, 15000);

                await prisma.guild_user_stats.update({
                    where: {
                        user_id_guild_id: { user_id: message.author.id, guild_id: message.guildId ?? "0" }
                    },
                    data: {
                        last_announced_level: newLevel
                    }
                });
            } else {
                logger.warn(`Cannot send level up announcement in channel ${message.channel.id} of guild ${message.guild.id} due to missing permissions or invalid channel type.`);
            }
        }
    }
} as EventHandler<Events.MessageCreate>;