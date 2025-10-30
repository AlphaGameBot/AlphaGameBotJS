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
import { client } from "../../../client.js";
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
    }),
    [Metrics.EVENT_RECEIVED]: new Gauge({
        name: "alphagamebot_event_received",
        help: "Events Received",
        labelNames: ["event"]
    }),
    [Metrics.DISCORD_LATENCY]: new Gauge({
        name: "alphagamebot_discord_latency_ms",
        help: "Discord API Latency in ms"
    }),
    [Metrics.APPLICATION_ERROR]: new Gauge({
        name: "alphagamebot_application_error",
        help: "Number of application errors",
        labelNames: ["event"]
    })
};

Object.values(gauges).forEach(g => registry.registerMetric(g));

function exportMetricsToPrometheus() {
    // Clear previous gauge values
    const startTime = performance.now();
    Object.values(gauges).forEach(g => g.reset());
    logger.verbose("Firing metrics export to Prometheus Pushgateway at " + pushgatewayUrl);
    // Access private metrics map via type assertion
    // q: what is type assertion?
    // a: It tells TypeScript to treat a value as a different type than it infers.
    // q: how does this allow access to private members?
    // a: TypeScript's access modifiers (like private) are only enforced at compile time.
    //    At runtime, all properties are accessible. By asserting the type to include
    //    the private member, we can access it in our code.
    // q: is this safe? Isn't it better to have proper public methods?
    // a: It's generally better to use public methods for encapsulation and maintainability.
    //    However, in some cases, like this one, accessing private members may be necessary
    //    for functionality not exposed by the class. Just be cautious as it can lead to
    //    brittle code if the class implementation changes.
    let queueLength = 0;
    const metricsMap = (metricsManager as unknown as { metrics: Map<Metrics, Array<unknown>> }).metrics;
    for (const [metric, entries] of metricsMap.entries()) {
        logger.verbose(`Processing ${entries.length} entries for metric ${metric}`);
        for (const entry of entries) {
            queueLength++;
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
            } else if (metric === Metrics.METRICS_QUEUE_LENGTH) {
                // Handled after the loop
            } else if (metric === Metrics.METRICS_GENERATION_TIME) {
                // Handled after the loop
            } else if (metric === Metrics.EVENT_RECEIVED && gauges[metric]) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.APPLICATION_ERROR && gauges[metric]) {
                gauges[metric].inc({ event: String(data.event) });
            } else {
                logger.warn(`No gauge defined for metric type ${metric}`);
            }
        }
    }

    const durationMs = performance.now() - startTime;
    logger.verbose(`Metrics generation took ${durationMs}ms, queue length is ${queueLength}`);

    gauges[Metrics.METRICS_GENERATION_TIME].set(durationMs);
    gauges[Metrics.METRICS_QUEUE_LENGTH].set(queueLength);
    gauges[Metrics.DISCORD_LATENCY].set(client.ws.ping);

    pushgateway.pushAdd({ jobName: "alphagamebot" }).catch((err: unknown) => {

        logger.error("Failed to push metrics to Prometheus: " + String(err));
    }).then(() => {
        logger.verbose("Successfully pushed metrics to Prometheus Pushgateway (generation time: " + durationMs.toPrecision(2) + "ms)");
    });
}

function exportWrapper() {
    try {
        exportMetricsToPrometheus();
    } catch (e) {
        logger.error("Error exporting metrics to Prometheus:", e);
    }
}
export function startPrometheusExporter() {
    const intervalMs = Number(process.env.PROMETHEUS_EXPORT_INTERVAL_MS || "15000");
    if (isNaN(intervalMs) || intervalMs <= 0) {
        logger.error("Invalid PROMETHEUS_EXPORT_INTERVAL_MS value, must be a positive number.");
        return;
    }
    logger.info(`Starting Prometheus exporter, pushing to ${pushgatewayUrl} every ${intervalMs}ms`);
    // Initial export
    exportWrapper();
    // Set interval for periodic exports
    setInterval(exportWrapper, intervalMs);
}
