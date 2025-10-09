/* eslint-disable no-console */
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

import { REST, User } from "discord.js";
import { crawlCommands } from "./utility/crawler.js";
import { loadDotenv } from "./utility/debug/dotenv.js";

await loadDotenv();
const commands = await crawlCommands();

const token = process.env.TOKEN;
if (!token) {
    console.error("No token provided. Please set the TOKEN environment variable.");
    process.exit(1);
}
const rest = new REST().setToken(token);

// get client id from token
const clientID = (await rest.get("/users/@me") as User).id;

(async () => {
    try {
        console.log(`Started refreshing ${commands.size} application (/) commands.`);

        // Convert commands to JSON format that Discord expects
        const commandsData = commands.map(command => command.data.toJSON());
        console.log("Commands:");
        for (const command of commands) {
            console.log(`- ${command[1].data.name}`);
        }

        // Register commands globally
        await rest.put(
            `/applications/${clientID}/commands`,
            { body: commandsData },
        );

        console.log(`Successfully reloaded ${commands.size} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();