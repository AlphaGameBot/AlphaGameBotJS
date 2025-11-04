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

import { Octokit } from "@octokit/rest";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Guild, User, type ChatInputCommandInteraction } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../../utility/database.js";
import { getLogger } from "../../../utility/logging/logger.js";

const logger = getLogger("events/CommandError");
const ghLogger = getLogger("github");

const GH_PAT = process.env.GITHUB_PAT;
if (!GH_PAT) {
    logger.warning("GitHub Personal Access Token (GITHUB_PAT) is not set. Error reporting via GitHub will be disabled.");
}

const octokit = new Octokit({
    auth: GH_PAT,
    userAgent: 'AlphaGameBot/4.0.0',
    timeZone: "America/Los_Angeles",
    baseUrl: 'https://api.github.com',

    log: {
        debug: (...args: unknown[]) => (ghLogger.debug as any)(...args),
        info: (...args: unknown[]) => (ghLogger.info as any)(...args),
        warn: (...args: unknown[]) => (ghLogger.warn as any)(...args),
        error: (...args: unknown[]) => (ghLogger.error as any)(...args),
    }
});

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
        await interaction.deferReply({ ephemeral: true });

        const query = await prisma.error_reports.create({
            data: {
                user_id: errorInfo.caller.id,
                guild_id: errorInfo.guild?.id ?? null,
                error_msg: typeof errorInfo.error === "string" ? errorInfo.error : JSON.stringify(errorInfo.error),
            }
        });

        // for id, add padding like [AGB-0001]
        const issueID = `[AGB-${query.id.toString().padStart(4, '0')}]`;

        const issue = {
            title: `${issueID} Error Report from ${errorInfo.caller.username}#${errorInfo.caller.discriminator}`,
            body: `**User:** ${errorInfo.caller.username}#${errorInfo.caller.discriminator} (ID: ${errorInfo.caller.id})\n` +
                `**Guild:** ${errorInfo.guild ? `${errorInfo.guild.name} (ID: ${errorInfo.guild.id})` : "DM"}\n` +
                `**Timestamp:** <t:${Math.floor(errorInfo.timestamp / 1000)}:F>\n\n` +
                `**Error Details:**\n\`\`\`json\n${typeof errorInfo.error === "string" ? errorInfo.error : JSON.stringify(errorInfo.error, null, 2)}\n\`\`\``

        };

        await octokit.issues.create({
            owner: 'AlphaGameDeveloper',
            repo: 'AlphaGameBotJS',
            title: issue.title,
            body: issue.body
        });

        await interaction.editReply({
            content: ":white_check_mark: Thank you! The error has been reported to the development team.",
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
        } catch (inner) {
            logger.error("Also failed to notify user about reporting failure:", inner);
        }
    }

    // Log the error details for developers to review.
    logger.error(`User ${interaction.user.tag} reported an error (ID: ${errorId}) from guild ${errorInfo.guild?.name ?? "DM"}:`, errorInfo.error);
}