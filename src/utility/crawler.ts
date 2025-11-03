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

import { Collection, type ClientEvents } from "discord.js";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../interfaces/Command.js";
import type { EventHandler, LoadedEventHandler } from "../interfaces/Event.js";
import { getLogger } from "./logging/logger.js";

// Cached project root for resolving src/dist paths
const projectRoot = process.cwd();
const logger = getLogger("crawler");

/**
 * Crawls the command directories and collects all command modules.
 * 
 * @returns A collection of commands mapped by their names.
 */
export async function crawlCommands() {
    // Prefer built files in `dist` when running the compiled output. Fall back to `src` during dev.
    const distCommandsPath = path.join(projectRoot, "dist", "commands");
    const srcCommandsPath = path.join(projectRoot, "src", "commands");
    const commandsPath = existsSync(distCommandsPath) ? distCommandsPath : srcCommandsPath;
    const isDist = commandsPath.includes(path.join(path.sep, "dist", path.sep)) || commandsPath.endsWith(path.join(path.sep, "dist"));

    const commands = new Collection<string, Command>();

    logger.debug(`Crawling commands in: ${commandsPath}`);

    // Read category folders (e.g., test/, utility/)
    const categoryFolders = readdirSync(commandsPath);

    for (const category of categoryFolders) {
        const categoryPath = path.join(commandsPath, category);

        // Skip if not a directory
        if (!statSync(categoryPath).isDirectory()) continue;

        // Read command folders within each category (e.g., hworld/, ping/)
        const commandFolders = readdirSync(categoryPath).filter(folder => !folder.endsWith(".d.ts"));
        logger.debug(`- Category: ${category} (${commandFolders.length} command folders)`);

        for (const commandFolder of commandFolders) {
            const commandFolderPath = path.join(categoryPath, commandFolder);

            // Skip if not a directory
            if (!statSync(commandFolderPath).isDirectory()) continue;

            // Look for the command file inside the folder (e.g., hworld.ts or hworld.js)
            const commandFiles = readdirSync(commandFolderPath).filter(file => {
                if (file.includes('.test.')) return false;
                if (isDist) return file.endsWith(".js");
                else return file.endsWith(".ts") || file.endsWith(".js");
            });

            for (const file of commandFiles) {
                const filePath = path.join(commandFolderPath, file);
                // Build a file:// URL for Node to import the correct compiled JS when running from dist.
                const importTarget = pathToFileURL(filePath).href;
                // Dynamically import the command module
                const commandModule = await import(importTarget);
                // support both default and named exports
                const command: Command = (commandModule && commandModule.default) ? commandModule.default : commandModule;

                if ("data" in command && "execute" in command) {
                    commands.set(command.data.name, command);
                    logger.debug(`  - ${category}/${commandFolder}/${file} (Implements command: ${command.data.name})`);
                } else {
                    logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
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
    // 10/26/2025 - damien - man i hate the typescript bullshit sometimes
    const distEventsPath = path.join(projectRoot, "dist", "events");
    const srcEventsPath = path.join(projectRoot, "src", "events");
    const eventsPath = existsSync(distEventsPath) ? distEventsPath : srcEventsPath;
    const eventsIsDist = eventsPath.includes(path.join(path.sep, "dist", path.sep)) || eventsPath.endsWith(path.join(path.sep, "dist"));
    const eventFiles = readdirSync(eventsPath).filter(file => eventsIsDist ? file.endsWith(".js") : file.endsWith(".ts") || file.endsWith(".js"));
    const events: Array<LoadedEventHandler<keyof ClientEvents>> = [];

    logger.debug(`Crawling events in: ${eventsPath}`);
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const importTarget = pathToFileURL(filePath).href;
        // Dynamically import the event module
        const eventModule = await import(importTarget);
        const event = ((eventModule && eventModule.default) ? eventModule.default : eventModule) as EventHandler<keyof ClientEvents>;

        if ("name" in event && "execute" in event) {
            const fileName = path.basename(filePath);
            logger.info("Loading event: " + event.name);
            events.push({
                name: event.name,
                once: event.once ? true : false,
                eventFile: fileName,
                execute: event.execute
            } as LoadedEventHandler<keyof ClientEvents>);
            logger.debug(`- ${file} (Implements event: ${event.name})`);

        } else {
            logger.warn(`The event at ${filePath} is missing a required "name", "event" or "execute" property.`);
        }
    }

    return events;
}
