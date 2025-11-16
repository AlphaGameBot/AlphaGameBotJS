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

import type { MetricConfiguration } from "../../interfaces/metrics/MetricConfiguration.js";
import { getLogger, LoggerNames } from "../../utility/logging/logger.js";

const logger = getLogger(LoggerNames.METRICS);

/**
 * Central registry for all metric configurations.
 * This allows metrics to be self-describing and automatically processed.
 */
export class MetricRegistry {
    private configurations = new Map<string, MetricConfiguration>();

    /**
     * Register a metric configuration
     * @param config The metric configuration to register
     */
    register(config: MetricConfiguration): void {
        if (this.configurations.has(config.name)) {
            logger.warn(`Metric configuration for "${config.name}" is already registered. Overwriting.`);
        }
        
        this.configurations.set(config.name, config);
        logger.verbose(`Registered metric configuration: ${config.name}`);
    }

    /**
     * Get a metric configuration by name
     * @param name The metric name
     * @returns The metric configuration, or undefined if not found
     */
    get(name: string): MetricConfiguration | undefined {
        return this.configurations.get(name);
    }

    /**
     * Get all registered metric configurations
     * @returns All metric configurations
     */
    getAll(): Map<string, MetricConfiguration> {
        return new Map(this.configurations);
    }

    /**
     * Check if a metric is registered
     * @param name The metric name
     * @returns True if the metric is registered
     */
    has(name: string): boolean {
        return this.configurations.has(name);
    }
}

export const metricRegistry = new MetricRegistry();
