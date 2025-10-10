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
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../interfaces/Command.js";
import type { EventHandler } from "../interfaces/Event.js";
import logger from "./logger.js";

// Cached project root for resolving src/dist paths
const projectRoot = process.cwd();


/**
 * Crawls the command directories and collects all command modules.
 * 
 * @returns A collection of commands mapped by their names.
 */
export async function crawlCommands() {
    // Prefer built files in `dist` when running the compiled output. Fall back to `src` during dev.
    const distCommandsPath = path.join(projectRoot, "dist", "commands");
    const foldersPath = existsSync(distCommandsPath) ? distCommandsPath : ".";
    const commandFolders = readdirSync(foldersPath);
    const commands = new Collection<string, Command>();

    logger.debug(`Crawling commands in: ${foldersPath}`);
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const isDist = foldersPath.includes(path.join(path.sep, "dist", path.sep)) || foldersPath.endsWith(path.join(path.sep, "dist"));
        // In dist we only want .js files. In src we may have .ts files.
        const commandFiles = readdirSync(commandsPath).filter(file => isDist ? file.endsWith(".js") : file.endsWith(".ts") || file.endsWith(".js"));
        logger.debug(`- ${folder} (Includes ${commandFiles.length} commands)`);

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            // Build a file:// URL for Node to import the correct compiled JS when running from dist.
            const importTarget = pathToFileURL(filePath).href;
            // Dynamically import the command module
            const commandModule = await import(importTarget);
            // support both default and named exports
            const command: Command = (commandModule && commandModule.default) ? commandModule.default : commandModule;

            if ("data" in command && "execute" in command) {
                commands.set(command.data.name, command);
                logger.debug(`  - ${file} (Implements command: ${command.data.name})`);
            } else {
                logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
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
    const events: Array<EventHandler<keyof ClientEvents>> = [];

    logger.debug(`Crawling events in: ${eventsPath}`);
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const importTarget = pathToFileURL(filePath).href;
        // Dynamically import the event module
        const eventModule = await import(importTarget);
        const event = (eventModule && eventModule.default) ? eventModule.default : eventModule;
        if ("name" in event && "execute" in event) {
            logger.info("Loading event: " + event.name);
            events.push({
                name: event.name,
                once: event.once ? true : false,
                execute: event.execute
            } as EventHandler<keyof ClientEvents>);
            logger.debug(`- ${file} (Implements event: ${event.name})`);

        } else {
            logger.warn(`The event at ${filePath} is missing a required "name", "event" or "execute" property.`);
        }
    }

    return events;
}
