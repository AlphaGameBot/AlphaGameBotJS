// /* eslint-disable no-trailing-spaces */
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
// /* eslint-enable no-trailing-spaces */


import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { crawlCommands } from "./utility/crawler.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.username}`);
});

// when quit signal is received, log out the bot
process.on("SIGINT", async () => {
    console.log("SIGINT received, logging out...");
    await client.destroy();
    process.exit(0);
});

const token = process.env.TOKEN;
if (!token) {
    console.error("Error: TOKEN environment variable is not set.");
    process.exit(1);
}

const commands = await crawlCommands();

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    console.log(`Interaction received: ${interaction.commandName}`);
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
    }
});

client.login(token);