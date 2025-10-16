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


import { collectDefaultMetrics, Gauge, Pushgateway, Registry } from "prom-client";
import { getLogger } from "../../../utility/logging/logger.js";
import { Metrics, metricsManager } from "../metrics.js";

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "alphagamebot_" });
const pushgatewayUrl = process.env.PUSHGATEWAY_URL || "http://localhost:9091";
const pushgateway = new Pushgateway(pushgatewayUrl, {}, registry);
const logger = getLogger("prometheus");

// Define gauges for each metric type
const gauges: Record<Metrics, Gauge> = {
    [Metrics.INTERACTIONS_RECEIVED]: new Gauge({
        name: "alphagamebot_interactions_received",
        help: "Number of interactions received",
        labelNames: ["event"]
    }),
    [Metrics.EVENT_EXECUTED]: new Gauge({
        name: "alphagamebot_event_executed_duration_ms",
        help: "Duration of event execution in ms",
        labelNames: ["event"]
    }),
    [Metrics.COMMAND_EXECUTED]: new Gauge({
        name: "alphagamebot_command_executed_duration_ms",
        help: "Duration of command execution in ms",
        labelNames: ["event", "commandName"]
    }),
    [Metrics.RAW_EVENT_RECEIVED]: new Gauge({
        name: "alphagamebot_raw_event_received",
        help: "Number of raw events received",
        labelNames: ["event"]
    }),
    [Metrics.METRICS_QUEUE_LENGTH]: new Gauge({
        name: "alphagamebot_metrics_queue_length",
        help: "Current length of the metrics queue"
    }),
    [Metrics.METRICS_GENERATION_TIME]: new Gauge({
        name: "alphagamebot_metrics_generation_time_ms",
        help: "Time taken to generate metrics in ms"
    })
};
Object.values(gauges).forEach(g => registry.registerMetric(g));

function exportMetricsToPrometheus() {
    // Clear previous gauge values
    const startTime = Date.now();
    Object.values(gauges).forEach(g => g.reset());
    logger.verbose("Firing metrics export to Prometheus Pushgateway at " + pushgatewayUrl);
    // Access private metrics map via type assertion
    const metricsMap = (metricsManager as unknown as { metrics: Map<Metrics, Array<unknown>> }).metrics;
    for (const [metric, entries] of metricsMap.entries()) {
        for (const entry of entries) {
            const metricEntry = entry as { data: unknown };
            const data = (metricEntry.data ?? {}) as Record<string, unknown>;
            if (metric === Metrics.INTERACTIONS_RECEIVED && gauges[metric]) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.EVENT_EXECUTED && gauges[metric]) {
                // For duration metrics, set the gauge value
                gauges[metric].set({ event: String(data.event) }, Number(data.durationMs));
            } else if (metric === Metrics.COMMAND_EXECUTED && gauges[metric]) {
                gauges[metric].set({ event: String(data.event), commandName: String(data.commandName) }, Number(data.durationMs));
            } else if (metric === Metrics.RAW_EVENT_RECEIVED && gauges[metric]) {
                gauges[metric].inc({ event: String(data.event) });
            } else {
                logger.warn(`No gauge defined for metric type ${metric}`);
            }
        }

        if (metric === Metrics.METRICS_QUEUE_LENGTH && gauges[metric]) {
            gauges[metric].set(entries.length);
        }
    }

    gauges[Metrics.METRICS_GENERATION_TIME].set(Date.now() - startTime);

    pushgateway.pushAdd({ jobName: "alphagamebot" }).catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.warn("Failed to push metrics to Prometheus: " + String(err));
    });
}


export function startPrometheusExporter() {
    const intervalMs = Number(process.env.PROMETHEUS_EXPORT_INTERVAL_MS || "15000");
    if (isNaN(intervalMs) || intervalMs <= 0) {
        logger.error("Invalid PROMETHEUS_EXPORT_INTERVAL_MS value, must be a positive number.");
        return;
    }
    logger.info(`Starting Prometheus exporter, pushing to ${pushgatewayUrl} every ${intervalMs}ms`);
    // Initial export
    exportMetricsToPrometheus();
    // Set interval for periodic exports
    setInterval(exportMetricsToPrometheus, intervalMs);
}
