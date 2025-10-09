// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free softws are: you can redistribute it and/or modify
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

import { ChatInputCommandInteraction, Events } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import { crawlCommands } from "../utility/crawler.js";

const commands = await crawlCommands();

export default {
    name: Events.InteractionCreate,
    execute: async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction as ChatInputCommandInteraction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
        }
    }
} as EventHandler<Events.InteractionCreate>;