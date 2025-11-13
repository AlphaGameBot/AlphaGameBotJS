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

import { collectDefaultMetrics, Gauge, Histogram, Registry } from "prom-client";
import { client } from "../../../client.js";
import { formatTime } from "../../../utility/formatTime.js";
import { getLogger } from "../../../utility/logging/logger.js";
import { Metrics, metricsManager } from "../metrics.js";
import { MetricsHTTPServer } from "./http/MetricsHTTPServer.js";

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "alphagamebot_" });
const logger = getLogger("prometheus");
const METRICS_HTTP_SERVER_PORT = process.env.METRICS_HTTP_SERVER_PORT || "9100";

type MetricTypeMap = {
    [Metrics.INTERACTIONS_RECEIVED]: Gauge,
    [Metrics.EVENT_EXECUTED]: Gauge,
    [Metrics.COMMAND_EXECUTED]: Gauge,
    [Metrics.RAW_EVENT_RECEIVED]: Gauge,
    [Metrics.METRICS_QUEUE_LENGTH]: Gauge,
    [Metrics.METRICS_QUEUE_LENGTH_BY_METRIC]: Gauge,
    [Metrics.METRICS_GENERATION_TIME]: Gauge,
    [Metrics.EVENT_RECEIVED]: Gauge,
    [Metrics.DISCORD_LATENCY]: Gauge,
    [Metrics.APPLICATION_ERROR]: Gauge,
    [Metrics.INTERACTION_RECEIVED]: Gauge,
    [Metrics.FEATURE_USED]: Gauge,
    [Metrics.METRICS_HTTP_SERVER_REQUESTS]: Gauge,
    [Metrics.DATABASE_OPERATION]: Histogram
}

// Define gauges for each metric type
const gauges: { [K in keyof MetricTypeMap]: MetricTypeMap[K] } = {
    [Metrics.INTERACTIONS_RECEIVED]: new Gauge({
        name: "alphagamebot_interactions_received",
        help: "Number of interactions received",
        labelNames: ["event"]
    }),
    [Metrics.EVENT_EXECUTED]: new Gauge({
        name: "alphagamebot_event_executed_duration_ms",
        help: "Duration of event execution in ms",
        labelNames: ["event", "eventFile"]
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
    [Metrics.METRICS_QUEUE_LENGTH_BY_METRIC]: new Gauge({
        name: "alphagamebot_metrics_queue_length_by_metric",
        help: "Current length of the metrics queue by metric",
        labelNames: ["metric"]
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
    }),
    [Metrics.INTERACTION_RECEIVED]: new Gauge({
        name: "alphagamebot_interaction_received",
        help: "Number of interactions received by type",
        labelNames: ["interactionType"]
    }),
    [Metrics.FEATURE_USED]: new Gauge({
        name: "alphagamebot_feature_used",
        help: "Features Used",
        labelNames: ["feature"]
    }),
    [Metrics.METRICS_HTTP_SERVER_REQUESTS]: new Gauge({
        name: "alphagamebot_metrics_http_server_requests",
        help: "HTTP server requests for metrics",
        labelNames: ["method", "url", "remoteAddress", "statusCode"]
    }),
    [Metrics.DATABASE_OPERATION]: new Histogram({
        name: "alphagamebot_database_operation_duration_seconds",
        help: "Database operation duration in seconds",
        labelNames: ["model", "operation"],
        buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
    }),
};

Object.values(gauges).forEach(g => registry.registerMetric(g));

async function exportMetricsToPrometheus() {
    // Clear previous gauge values
    const startTime = performance.now();
    Object.values(gauges).forEach(g => g.reset());
    logger.verbose("Exporting metrics...");
    let queueLength = 0;
    let someMetricsFailed = false;
    const queueLengthByMetric: Map<Metrics, number> = new Map();

    const metricsMap = metricsManager.getMetrics();
    for (const [metric, entries] of metricsMap.entries()) {
        queueLengthByMetric.set(metric, entries.length);
        gauges[Metrics.METRICS_QUEUE_LENGTH_BY_METRIC].set({ metric: metric }, entries.length);
        logger.verbose(`Processing ${entries.length} entries for metric ${metric}`);
        for (const entry of entries) {
            queueLength++;
            const metricEntry = entry as { data: unknown };
            const data = (metricEntry.data ?? {}) as Record<string, unknown>;

            switch (metric) {
                case Metrics.INTERACTIONS_RECEIVED: {
                    (gauges[metric] as Gauge).inc({ event: String(data.event) });
                    break;
                }

                case Metrics.EVENT_EXECUTED: {
                    (gauges[metric] as Gauge).set({ event: String(data.event) }, Number(data.durationMs));
                    break;
                }

                case Metrics.COMMAND_EXECUTED: {
                    (gauges[metric] as Gauge).set({ event: String(data.event), commandName: String(data.commandName) }, Number(data.durationMs));
                    break;
                }

                case Metrics.RAW_EVENT_RECEIVED: {
                    (gauges[metric] as Gauge).inc({ event: String(data.event) });
                    break;
                }

                case Metrics.METRICS_QUEUE_LENGTH: {
                    // Handled after the loop
                    break;
                }

                case Metrics.METRICS_GENERATION_TIME: {
                    // Handled after the loop
                    break;
                }

                case Metrics.EVENT_RECEIVED: {
                    (gauges[metric] as Gauge).inc({ event: String(data.event) });
                    break;
                }

                case Metrics.APPLICATION_ERROR: {
                    (gauges[metric] as Gauge).inc({ event: String(data.event) });
                    break;
                }

                case Metrics.INTERACTION_RECEIVED: {
                    (gauges[metric] as Gauge).inc({ interactionType: String(data.interactionType) });
                    break;
                }

                case Metrics.FEATURE_USED: {
                    (gauges[metric] as Gauge).inc({ feature: String(data.feature) });
                    break;
                }

                case Metrics.METRICS_HTTP_SERVER_REQUESTS: {
                    (gauges[metric] as Gauge).inc({
                        method: String(data.method),
                        url: String(data.url),
                        remoteAddress: String(data.remoteAddress),
                        statusCode: String(data.statusCode)
                    });
                    break;
                }

                case Metrics.DATABASE_OPERATION: {
                    (gauges[metric] as Histogram).observe(
                        { model: String(data.model), operation: String(data.operation) },
                        Number(data.durationMs) / 1000
                    );
                    break;
                }

                default: {
                    // Exhaustiveness check - using the variable to avoid "assigned but never used"
                    const _exhaustive: never = metric;
                    void _exhaustive;
                    someMetricsFailed = true;
                    logger.error(`No exporter defined for metric type: ${String(metric)}! This should never happen!`);
                    break;
                }
            }
        }
    }

    if (someMetricsFailed) logger.error("Some metrics failed to export due to missing gauge/histogram definitions.");

    const durationMs = performance.now() - startTime;
    logger.verbose(`Metrics generation took ${durationMs}ms, queue length is ${queueLength}`);


    gauges[Metrics.METRICS_GENERATION_TIME].set(durationMs);
    gauges[Metrics.METRICS_QUEUE_LENGTH].set(queueLength);
    gauges[Metrics.DISCORD_LATENCY].set(client.ws.ping);

    // return data for prometheus, as a string
    return await registry.metrics();
}

const httpLogger = getLogger("metrics/http");


export function startPrometheusExporter() {
    logger.info(`Starting Prometheus metrics HTTP server on port ${METRICS_HTTP_SERVER_PORT}`);
    const server = new MetricsHTTPServer(exportMetricsToPrometheus);
    server.startServer(Number(METRICS_HTTP_SERVER_PORT), () => {
        httpLogger.info(`Prometheus metrics HTTP server is running on port ${METRICS_HTTP_SERVER_PORT}. Time since start: ${formatTime(performance.now())}`);
        if (process.env.NODE_ENV !== "production") {
            httpLogger.info(`You can view metrics at http://localhost:${METRICS_HTTP_SERVER_PORT}/metrics`);
        }
    });
}
