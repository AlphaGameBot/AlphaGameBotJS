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

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, type ChatInputCommandInteraction, type Interaction } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import type InternalErrorInfo from "../../../interfaces/InternalError.js";
import reportIssueViaGitHub from "../../../subsystems/error-reporting/issue.js";
import prisma from "../../../utility/database.js";
import { getLogger } from "../../../utility/logging/logger.js";

const logger = getLogger("events/CommandError");
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

    const errorInfo: InternalErrorInfo = {
        error,
        caller: interaction.user,
        guild: interaction.guild ?? null,
        timestamp: Date.now()
    };

    if (interaction.toJSON) {
        errorInfo.originalInteraction = interaction.toJSON() as Record<string, unknown>;
    }

    internalErrorCache.set(errorId, errorInfo);

    const buttonID = `report-error-button_${errorId}`;
    logger.debug("Generated error report button ID: " + buttonID, { errorId, commandName: interaction.commandName, userId: interaction.user.id });

    const reportErrorButton = new ButtonBuilder()
        .setLabel("📢 Report Error")
        .setCustomId(buttonID)
        .setStyle(ButtonStyle.Danger);

    // Keep the ActionRowBuilder instance (don't call toJSON()).
    // Passing the builder directly avoids subtle runtime/component issues
    // and keeps the customId intact.
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(reportErrorButton);

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
    logger.info(`User ${interaction.user.tag} pressed error report button for error ID: ${errorId}`);
    const errorInfo = internalErrorCache.get(errorId);
    if (!errorInfo) {
        logger.warn(`No error info found for error ID: ${errorId}`);
        await interaction.reply({
            content: ":x: Unable to find error details. It may have expired.",
            ephemeral: true
        });
        return;
    }
    // Defer the interaction immediately to avoid hitting the 3s acknowledgement window
    // while we perform DB / GitHub calls.
    try {
        // Create a new ErrorReport row using the updated Prisma model name `errorReport`.
        const query = await prisma.errorReport.create({
            data: {
                user_id: errorInfo.caller.id,
                guild_id: errorInfo.guild?.id ?? null,
                error_msg: typeof errorInfo.error === "string"
                    ? errorInfo.error
                    : JSON.stringify(errorInfo.error),
            }
        });

        const safeStringify = (obj: unknown) => {
            try {
                if (typeof obj === "string") return obj;
                return JSON.stringify(obj, (_k, v) =>
                    typeof v === "bigint" ? v.toString() : v, 2);
            } catch {
                try {
                    return String(obj);
                } catch { return "<unserializable>"; }
            }
        };

        await reportIssueViaGitHub({
            databaseRow: query,
            user: errorInfo.caller,
            guild: errorInfo.guild ?? null,
            interaction: errorInfo.originalInteraction
                ? errorInfo.originalInteraction as unknown as Interaction
                : undefined,
            error: safeStringify(errorInfo.error),
        });

        // Edit the original message's button to show it was reported
        const currentButton = ButtonBuilder.from(interaction.component)
            .setLabel("✅ Error Reported")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);


        const updatedRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(currentButton);

        await interaction.update({
            components: [updatedRow]
        });
    } catch (e) {
        logger.error(`Failed to report error ID ${errorId}:`, e);
        // Attempt to notify the user of the failure. If the interaction was deferred,
        // edit the reply; otherwise, try a reply.
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: ":x: Failed to report the error. Please try again later." });
            } else {
                await interaction.reply({ content: ":x: Failed to report the error. Please try again later.", ephemeral: true });
            }
            logger.error("Also failed to notify user about reporting failure:" + e);
        } catch (inner) {
            logger.error("Also failed to notify user about reporting failure:", inner);
        }
    }

    // Log the error details for developers to review.
    logger.info(`User ${interaction.user.tag} reported an error (ID: ${errorId}) from guild ${errorInfo.guild?.name ?? "DM"}:`, errorInfo.error);
}