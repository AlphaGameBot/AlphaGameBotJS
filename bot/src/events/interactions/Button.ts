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

import type { ButtonInteraction } from "discord.js";
import { getLogger } from "../../utility/logging/logger.js";
import { handleButtonPressReportError } from "./command/CommandError.js";

const logger = getLogger("interactions/Button");

export default async function handleInteractionButton(button: ButtonInteraction): Promise<void> {
    logger.info(`Received button interaction with custom ID: ${button.customId}`);

    // fmt: type-here_id
    const [type, id] = button.customId.split("_");

    if (!type || !id) {
        logger.warn(`Invalid button custom ID format: ${button.customId}`);
        await button.reply({ content: "Invalid button action.", ephemeral: true });
        return;
    }

    switch (type) {
        case "report-error-button":
            logger.info(`Handling error report button with ID: ${id} for user ${button.user.id}`);
            await handleButtonPressReportError(button, id);
            break;
        default:
            logger.warn(`Unknown button interaction type: ${type}`);
            await button.reply({ content: "Unknown button action.", ephemeral: true });
            break;
    }
}