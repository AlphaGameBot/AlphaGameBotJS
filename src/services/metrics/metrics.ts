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

import type { MetricDataMap } from "../../interfaces/metrics/MetricDataMap.js";
import { getLogger, LoggerNames } from "../../utility/logger.js";

export enum Metrics {
    INTERACTIONS_RECEIVED = "interactions_received",
    COMMAND_EXECUTED = "command_executed",
    EVENT_EXECUTED = "event_executed"
}

interface MetricEntry<T extends Metrics> {
    timestamp: number;
    id: number;
    type: T;
    data: MetricDataMap[T];
}

const logger = getLogger(LoggerNames.METRICS);

class MetricsManager {
    private metrics = new Map<Metrics, Array<MetricEntry<Metrics>>>();
    private currentMetricID = 0;
    constructor() {
        // every 10 minutes, clear metrics older than 1 hour (3600000 ms)
        setInterval(() => {
            this.clearOldMetrics(60 * 60 * 1000);
        }, 10 * 60 * 1000);
    }

    private clearOldMetrics(maxAgeMs: number) {
        const cutoff = Date.now() - maxAgeMs;
        for (const [metric, entries] of Array.from(this.metrics.entries())) {
            const kept = entries.filter(entry => {
                if (entry.timestamp < cutoff) {
                    logger.verbose(`Clearing old metric entry ID ${entry.id} of type ${entry.type}`);
                    return false;
                }
                return true;
            });

            if (kept.length === 0) {
                this.metrics.delete(metric);
                logger.verbose(`Deleted metric ${metric} as it had no recent entries.`);
            } else {
                this.metrics.set(metric, kept);
            }
        }
    }

    public submitMetric<T extends Metrics>(metric: T, data: MetricDataMap[T]) {
        if (!this.metrics.has(metric)) {
            this.metrics.set(metric, []);
        }

        const metricData = this.metrics.get(metric);
        if (!metricData) {
            throw new Error("Metric data is undefined for metric: " + metric);
        }

        const entry: MetricEntry<T> = {
            timestamp: Date.now(),
            id: this.currentMetricID++,
            type: metric,
            data
        } as MetricEntry<T>;

        metricData.push(entry);

        const serialized = data instanceof Map ? JSON.stringify(Object.fromEntries(data)) : JSON.stringify(data);
        logger.verbose("Metric submitted: " + metric + " with data: " + serialized);
    }
}

export const metricsManager = new MetricsManager();