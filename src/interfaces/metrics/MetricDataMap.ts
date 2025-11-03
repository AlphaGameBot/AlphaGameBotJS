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

import type { Events } from "discord.js";
import type { Metrics } from "../../services/metrics/metrics.js";

export interface MetricDataMap {
    [Metrics.INTERACTIONS_RECEIVED]: {
        // TODO: add interaction tracker
        event: Events
    },
    [Metrics.EVENT_EXECUTED]: {
        event: Events,
        eventFile: string,
        durationMs: number
    },
    [Metrics.COMMAND_EXECUTED]: {
        event: Events,
        commandName: string,
        durationMs: number
    },
    [Metrics.RAW_EVENT_RECEIVED]: {
        event: Events
    },
    [Metrics.METRICS_QUEUE_LENGTH]: {
        length: number
    },
    [Metrics.METRICS_GENERATION_TIME]: {
        durationMs: number
    },
    [Metrics.EVENT_RECEIVED]: {
        event: string
    },
    [Metrics.APPLICATION_ERROR]: {
        name: string,
        message: string,
        stack?: string
    },
    [Metrics.FEATURE_USED]: {
        feature: string
    }
}