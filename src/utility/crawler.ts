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

import { ChatInputCommandInteraction, Collection, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";

export async function crawlCommands() {
    const foldersPath = path.join("src", "commands");
    const commandFolders = readdirSync(foldersPath);
    const commands = new Collection<string, { data: SlashCommandBuilder, execute: (interaction: ChatInputCommandInteraction) => Promise<void> }>();

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            // Dynamically import the command module
            // import command from `../commands/${folder}/${file}`; (not async)
            const command = await import(path.resolve(filePath));

            if ("data" in command && "execute" in command) {
                commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    return commands;
}