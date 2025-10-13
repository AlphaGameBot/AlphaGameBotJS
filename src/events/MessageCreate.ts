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
import { addMessage } from "../subsystems/leveling/modifiers.js";

export default {
    name: Events.MessageCreate,
    execute: async (message: Message) => {
        // Ignore messages from bots
        if (message.author.bot) return;

        await addMessage(Number(message.author.id), Number(message.guildId ?? 0));
    }
} as EventHandler<Events.MessageCreate>;