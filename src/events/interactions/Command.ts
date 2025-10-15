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

import { Events, type ChatInputCommandInteraction } from "discord.js";
import { Metrics, metricsManager } from "../../services/metrics/metrics.js";
import { addCommand } from "../../subsystems/leveling/dbhelper.js";
import { crawlCommands } from "../../utility/crawler.js";
import { getLogger } from "../../utility/logging/logger.js";

const commands = await crawlCommands();
const logger = getLogger("command");

export default async function handleInteractionCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const start = Date.now();
    const command = commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.  What the hell.`);
        return;
    }

    try {
        await addCommand(interaction.user.id, interaction.guildId ?? "0");
        await command.execute(interaction as ChatInputCommandInteraction);
        const durationMs = Date.now() - start;
        metricsManager.submitMetric<Metrics.COMMAND_EXECUTED>(Metrics.COMMAND_EXECUTED, {
            event: Events.InteractionCreate,
            commandName: interaction.commandName,
            durationMs: durationMs
        });
    } catch (error) {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: ":x: There was an error while executing this command!", ephemeral: true });
        } else {
            await interaction.reply({ content: ":x: There was an error while executing this command!", ephemeral: true });
        }
        logger.error(`Error executing command ${interaction.commandName}:`, error);
    }
}
