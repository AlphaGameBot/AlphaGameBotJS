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

import { ActivityType } from "discord.js";
import { client } from "../client.js";
import { getLogger } from "../utility/logger.js";

interface StatusItem {
    type: ActivityType,
    text: string
}

const statuses: StatusItem[] = [
    {
        type: ActivityType.Playing,
        text: "With the Discord API!"
    },
    {
        type: ActivityType.Watching,
        text: "over {guilds} servers"
    },
    {
        type: ActivityType.Listening,
        text: "to all of you!"
    },
    {
        type: ActivityType.Playing,
        text: "with version {version}"
    },
    {
        type: ActivityType.Watching,
        text: "for new updates!"
    },
    {
        type: ActivityType.Playing,
        text: "in the Python interpreter"
    },
    {
        type: ActivityType.Watching,
        text: "over {guilds} guilds."
    },
    {
        type: ActivityType.Playing,
        text: "with new features!"
    },
    {
        type: ActivityType.Watching,
        text: "GitHub/AlphaGameBot"
    },
    {
        type: ActivityType.Watching,
        text: "over my {users} users"
    },
    {
        type: ActivityType.Playing,
        text: "Among Us"
    },
    {
        type: ActivityType.Watching,
        text: "alphagamebot.alphagame.dev"
    },
    {
        type: ActivityType.Listening,
        text: "to my {commands} commands"
    }
]
export async function rotatingStatus() {
    const logger = getLogger("rotatingStatus");
    logger.info("Setting rotating status...");
    if (!client.user) {
        logger.error("Client user is not defined.");
        return;
    }
    client.user?.setActivity('activity', { type: ActivityType.Playing });
}