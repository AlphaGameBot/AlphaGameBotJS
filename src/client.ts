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

import { Client, GatewayIntentBits } from "discord.js";
import logger from "./utility/logging/logger.js";

const intents: GatewayIntentBits[] = [
    // default
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
];

export const client = new Client({

    intents: intents
});

export async function gracefulExit(sig: string | null = null) {
    const start = performance.now();
    if (sig) {
        logger.info(`Received ${sig}, shutting down gracefully...`);
    } else {
        logger.info("Shutting down...");
    }
    await client.destroy();
    logger.info(`Bot shut down in ${(performance.now() - start).toFixed(2)}ms`);
    process.exit(0);
}