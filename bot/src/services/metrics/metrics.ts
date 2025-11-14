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
import { getLogger, LoggerNames } from "../../utility/logging/logger.js";
import { safeStringify } from "../../utility/safeStringify.js";

export enum Metrics {
    DATABASE_OPERATION = "database_operation",
    METRICS_HTTP_SERVER_REQUESTS = "metrics_http_server_requests",
    INTERACTIONS_RECEIVED = "interactions_received",
    COMMAND_EXECUTED = "command_executed",
    EVENT_EXECUTED = "event_executed",
    RAW_EVENT_RECEIVED = "raw_event_received",
    METRICS_QUEUE_LENGTH = "metrics_queue_length",
    METRICS_GENERATION_TIME = "metrics_generation_time",
    METRICS_QUEUE_LENGTH_BY_METRIC = "metrics_queue_length_by_metric",
    EVENT_RECEIVED = "event_received",
    DISCORD_LATENCY = "discord_latency",
    APPLICATION_ERROR = "application_error",
    INTERACTION_RECEIVED = "interaction_received",
    FEATURE_USED = "feature_used"
}

export enum Features {
    SAY_COMMAND = "say_command"
}

interface MetricEntry<T extends keyof MetricDataMap> {
    timestamp: number;
    id: number;
    type: T;
    data: MetricDataMap[T];
}

const logger = getLogger(LoggerNames.METRICS);

export class MetricsManager {
    private metrics = new Map<keyof MetricDataMap, Array<MetricEntry<keyof MetricDataMap>>>();
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

    /**
     * Submits a metric for tracking.
     * Adds the metric entry to the queue, which will be sent next time metrics are flushed.
     * 
     * @param metric The metric to submit.
     * @param data The data associated with the metric.
     */
    public submitMetric<T extends keyof MetricDataMap>(metric: T, data: MetricDataMap[T]) {
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

        if (logger.isVerboseEnabled()) {
            // Safely serialize metric data to avoid errors or deep recursion when objects contain
            // circular references. Fall back to a simple string when serialization fails.
        
            const serialized = data instanceof Map ? safeStringify(Object.fromEntries(data)) : safeStringify(data);
            logger.verbose("Metric submitted: " + metric + " with data: " + serialized);
        }
    }

    public getMetrics() {
        return this.metrics;
    }
}

export const metricsManager = new MetricsManager();

process.on("unhandledRejection", (reason: unknown) => {
    // Normalize to an Error-like object
    const err = reason instanceof Error
        ? reason
        : new Error(
            typeof reason === "string" ? reason
                : reason === undefined ? "Unhandled rejection: undefined"
                    : JSON.stringify(reason)
        );

    // Prepare a safe serializable payload
    const payload = {
        name: err.name,
        message: err.message,
        stack: err.stack ? err.stack : undefined
    };

    // Submit metric (cast to any if MetricDataMap shape doesn't match)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricsManager.submitMetric<Metrics.APPLICATION_ERROR>(Metrics.APPLICATION_ERROR, payload as any);

    logger.error("Unhandled rejection caught", err);
});

process.on("uncaughtException", (err: Error) => {
    // Prepare a safe serializable payload
    const payload = {
        name: err.name,
        message: err.message,
        stack: err.stack ? err.stack : undefined
    };

    // Submit metric (cast to any if MetricDataMap shape doesn't match)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricsManager.submitMetric<Metrics.APPLICATION_ERROR>(Metrics.APPLICATION_ERROR, payload as any);

    logger.error("Uncaught exception caught", err);
});