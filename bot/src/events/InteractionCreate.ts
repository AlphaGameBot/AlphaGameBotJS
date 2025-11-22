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

import { ButtonInteraction, ChatInputCommandInteraction, Events, InteractionType } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import { Metrics, metricsManager } from "../services/metrics/metrics.js";
import { getLogger } from "../utility/logging/logger.js";
import handleInteractionButton from "./interactions/Button.js";
import handleInteractionCommand from "./interactions/Command.js";

const logger = getLogger("events/InteractionCreate");

export default {
    name: Events.InteractionCreate,
    execute: async (interaction) => {
        let interactionType: string = "Unknown";

        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                interactionType = "ApplicationCommand";
                break;
            }
            case InteractionType.MessageComponent: {
                interactionType = "MessageComponent";
                // TODO: Add handling for message components
                break;
            }
            case InteractionType.ApplicationCommandAutocomplete: {
                interactionType = "ApplicationCommandAutocomplete";
                // need to find a good way to handle this generically
                break;
            }
            case InteractionType.ModalSubmit: {
                interactionType = "ModalSubmit";
                // TODO: Add handling for modal submissions
                break;
            }
        }
        metricsManager.submitMetric<Metrics.INTERACTION_RECEIVED>(Metrics.INTERACTION_RECEIVED, {
            interactionType: interactionType
        });

        logger.verbose(`Received interaction of type: ${interaction.type} (${interactionType})`);
        if (interaction.isCommand()) {
            await handleInteractionCommand(interaction as ChatInputCommandInteraction);
            return;
        } if (interaction.isButton()) {
            await handleInteractionButton(interaction as ButtonInteraction);
            return;
        } else {
            logger.warn(`Received unknown command interaction type: ${interaction.type}`);
        }
    }
} as EventHandler<Events.InteractionCreate>;