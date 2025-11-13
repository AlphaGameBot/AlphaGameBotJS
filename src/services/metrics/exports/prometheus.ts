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

import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";
import { client } from "../../../client.js";
import { formatTime } from "../../../utility/formatTime.js";
import { getLogger } from "../../../utility/logging/logger.js";
import { Metrics, metricsManager } from "../metrics.js";
import { MetricsHTTPServer } from "./http/MetricsHTTPServer.js";

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "alphagamebot_" });
const logger = getLogger("prometheus");
const METRICS_HTTP_SERVER_PORT = process.env.METRICS_HTTP_SERVER_PORT || "9100";

type MetricType = Gauge | Histogram | Counter;

// Define gauges for each metric type
const gauges: Record<Metrics, MetricType> = {
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
        name: "database_operation_duration_seconds",
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
        if (gauges[Metrics.METRICS_QUEUE_LENGTH_BY_METRIC] instanceof Gauge) {
            gauges[Metrics.METRICS_QUEUE_LENGTH_BY_METRIC].set({ metric: metric }, entries.length);
        }
        logger.verbose(`Processing ${entries.length} entries for metric ${metric}`);
        for (const entry of entries) {
            queueLength++;
            const metricEntry = entry as { data: unknown };
            const data = (metricEntry.data ?? {}) as Record<string, unknown>;
            if (metric === Metrics.INTERACTIONS_RECEIVED && gauges[metric] && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.EVENT_EXECUTED && gauges[metric] instanceof Gauge) {
                // For duration metrics, set the gauge value
                gauges[metric].set({ event: String(data.event) }, Number(data.durationMs));
            } else if (metric === Metrics.COMMAND_EXECUTED && gauges[metric] instanceof Gauge) {
                gauges[metric].set({ event: String(data.event), commandName: String(data.commandName) }, Number(data.durationMs));
            } else if (metric === Metrics.RAW_EVENT_RECEIVED && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.METRICS_QUEUE_LENGTH) {
                // Handled after the loop
            } else if (metric === Metrics.METRICS_GENERATION_TIME) {
                // Handled after the loop
            } else if (metric === Metrics.EVENT_RECEIVED && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.APPLICATION_ERROR && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ event: String(data.event) });
            } else if (metric === Metrics.FEATURE_USED && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ feature: String(data.feature) });
            } else if (metric === Metrics.METRICS_HTTP_SERVER_REQUESTS && gauges[metric] instanceof Gauge) {
                gauges[metric].inc({ method: String(data.method), url: String(data.url), remoteAddress: String(data.remoteAddress), statusCode: String(data.statusCode) });
            } else if (metric === Metrics.DATABASE_OPERATION && gauges[metric] instanceof Histogram) {
                // We have to divide ms by 1000 to get seconds for Prometheus histograms
                // What the fuck Prometheus
                gauges[metric].observe({ model: String(data.model), operation: String(data.operation) }, Number(data.durationMs) / 1000);
            } else {
                logger.warn(`No gauge or histogram defined for metric type ${metric}`);
                someMetricsFailed = true;
            }
        }
    }

    if (someMetricsFailed) logger.error("Some metrics failed to export due to missing gauge/histogram definitions.");

    const durationMs = performance.now() - startTime;
    logger.verbose(`Metrics generation took ${durationMs}ms, queue length is ${queueLength}`);


    // these should always be true. Just to satisfy TypeScript
    if (gauges[Metrics.METRICS_GENERATION_TIME] instanceof Gauge) {
        gauges[Metrics.METRICS_GENERATION_TIME].set(durationMs);
    }

    if (gauges[Metrics.METRICS_QUEUE_LENGTH] instanceof Gauge) {
        gauges[Metrics.METRICS_QUEUE_LENGTH].set(queueLength);
    }

    if (gauges[Metrics.DISCORD_LATENCY] instanceof Gauge) {
        gauges[Metrics.DISCORD_LATENCY].set(client.ws.ping);
    }

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
