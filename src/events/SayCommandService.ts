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

import { Events } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/SayCommandService");

export default {
    name: Events.MessageCreate,
    execute: async (message) => {
        if (message.author.bot) return;
        // According to the Discord API documentation, and after the 2021 privileged intents update,
        // bots can no longer read message content unless they have the MESSAGE_CONTENT intent enabled.
        // UNLESS... the bot is @mentioned in the message.
        if (!(message.content.includes(`<@${message.client.user?.id}>`) ||
            message.content.includes(`<@!${message.client.user?.id}>`))) {
            return;
        }
        logger.info(`Bot was mentioned in message ${message.id} by user ${message.author.id}`);
        // now we know the bot was mentioned, so we can respond

        // make sure the message STARTS with the mention

        const mentionRegex = new RegExp(`^<@!?${message.client.user?.id}>.`);
        if (!mentionRegex.test(message.content)) {
            logger.info(`Message ${message.id} does not start with a mention of the bot, ignoring.`);
            return;
        }

        logger.info(`Message ${message.id} starts with a mention of the bot, invoking say command.`);
        // now we know the bot was mentioned, so we can respond
        // strip initial mention
        const commandContent = message.content.replace(mentionRegex, "").trim();

        if (commandContent.length === 0) {
            logger.warn(`No command content after mention in message ${message.id}, ignoring.`);
            return;
        }

        await message.channel.send(commandContent);
        await message.delete();
    }
} as EventHandler<Events.MessageCreate>;