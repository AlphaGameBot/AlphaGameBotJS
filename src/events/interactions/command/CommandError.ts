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

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Guild, User, type ChatInputCommandInteraction } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { getLogger } from "../../../utility/logging/logger.js";

const logger = getLogger("events/CommandError");

interface InternalErrorInfo {
    error: unknown;
    caller: User;
    guild?: Guild | null;
    timestamp: number;

}
const internalErrorCache = new Map<string, InternalErrorInfo>();
/**
 * Handles errors that occur during command execution.
 * 
 * tl;dr sends a message to the user indicating an error occurred, and provides a button to report the issue.
 * 
 * @param interaction Context for the application error
 * @param error The error that occurred
 */
export async function handleCommandError(interaction: ChatInputCommandInteraction, error: unknown): Promise<void> {
    logger.warn(`Error executing command ${interaction.commandName}:`, error);
    // button w/ message

    const errorId = uuidv4();

    internalErrorCache.set(errorId, {
        error,
        caller: interaction.user,
        guild: interaction.guild ?? null,
        timestamp: Date.now()
    });

    const buttonID = `report-error-button_${errorId}`;
    logger.debug("Generated error report button ID: " + buttonID, { errorId, commandName: interaction.commandName, userId: interaction.user.id });

    const reportErrorButton = new ButtonBuilder()
        .setLabel("📢 Report Error")
        .setCustomId(buttonID)
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(reportErrorButton)
        .toJSON();

    // Bind the methods so we preserve the interaction `this` context when calling them.
    const sendIt = (interaction.replied || interaction.deferred)
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);

    await sendIt({
        content: ":x: Whoops. Something went really wrong there.  My bad.\n-# Please report this issue with the button below!",
        components: [row],
        ephemeral: true
    });
}

export async function handleButtonPressReportError(interaction: ButtonInteraction, errorId: string): Promise<void> {
    const errorInfo = internalErrorCache.get(errorId);
    if (!errorInfo) {
        logger.warn(`No error info found for error ID: ${errorId}`);
        await interaction.reply({
            content: ":x: Unable to find error details. It may have expired.",
            ephemeral: true
        });
        return;
    }
    await interaction.reply({
        content: ":white_check_mark: Thank you! The error has been reported to the development team.",
        ephemeral: true
    });

    // Log the error details for developers to review.
    logger.error(`User ${interaction.user.tag} reported an error (ID: ${errorId}) from guild ${errorInfo.guild?.name ?? "DM"}:`, errorInfo.error);
}