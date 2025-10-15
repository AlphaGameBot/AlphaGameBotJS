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
import { getLogger } from "../utility/logging/logger.js";

interface StatusItem {
    type: ActivityType,
    text: string
}

const intervalMs = 10000;

const statuses: StatusItem[] = [
    {
        type: ActivityType.Playing,
        text: "With the Discord API!"
    },
    {
        type: ActivityType.Watching,
        text: "over {{ guilds }} servers"
    },
    {
        type: ActivityType.Listening,
        text: "to all of you!"
    },
    {
        type: ActivityType.Playing,
        text: "with version {{ version }}"
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
        text: "over {{ guilds }} guilds."
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
        text: "over my {{ users }} users"
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
        text: "to my {{ commands }} commands"
    }
];

/**
 * Rotates the bot's status messages using recursive setTimeout calls.
 *
 * The status messages cycle through a predefined list, updating every 10 seconds.
 * Each status can include dynamic data such as the number of guilds, users, bot version, and commands.
 * 
 * @param index - The current index in the status array (defaults to 0)
 * @returns A promise that resolves after setting the current status and scheduling the next rotation.
 */
export async function rotatingStatus(index: number = 0): Promise<void> {
    const logger = getLogger("rotatingStatus");

    const advanceToNextStatus = () => { rotatingStatus(index + 1); };
    if (!client.user) {
        logger.error("Client user is not defined.");
        return;
    }
    const status = statuses[index % statuses.length];
    if (!status) {
        logger.warn("No status found for index " + index + " (With mod, that's " + (index % statuses.length) + ").  Scheduling next in " + intervalMs + "ms.");
        setTimeout(advanceToNextStatus, intervalMs);
        return;
    }

    logger.verbose("Setting status to: " + status.text);
    const data = {
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        version: process.env.npm_package_version || "unknown",
        commands: client.application?.commands.cache.size || 0
    };
    client.user?.setActivity(
        status.text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(data[key as keyof typeof data] || "")),
        { type: status.type }
    );
    setTimeout(advanceToNextStatus, intervalMs);
}