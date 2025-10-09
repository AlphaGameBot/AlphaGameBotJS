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

import { Collection, type ClientEvents } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";
import type { Command } from "../interfaces/Command.js";
import type { EventHandler } from "../interfaces/Event.js";

/**
 * Crawls the command directories and collects all command modules.
 * 
 * @returns A collection of commands mapped by their names.
 */
export async function crawlCommands() {
    const foldersPath = path.join("src", "commands");
    const commandFolders = readdirSync(foldersPath);
    const commands = new Collection<string, Command>();

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            // Dynamically import the command module
            // import command from `../commands/${folder}/${file}`; (not async)
            const command: Command = await import(path.resolve(filePath));

            if ("data" in command && "execute" in command) {
                commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    return commands;
}


/**
 * Crawls the event directories and collects all event modules.
 * 
 * @returns An array of event handlers.
 */
export async function crawlEvents() {
    const eventsPath = path.join("src", "events");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    const events: Array<EventHandler<keyof ClientEvents>> = [];

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        // Dynamically import the event module
        // import event from `../events/${file}`; (not async)
        const event = await import(path.resolve(filePath));
        if ("name" in event && "event" in event && "execute" in event) {
            events.push({
                name: event.name,
                once: event.once ? true : false,
                event: event.event,
                execute: event.execute
            } as EventHandler<keyof ClientEvents>);
        } else {
            console.log(`[WARNING] The event at ${filePath} is missing a required "name", "event" or "execute" property.`);
        }
    }

    return events;
}