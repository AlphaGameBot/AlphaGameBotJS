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


import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { collectDefaultMetrics, Gauge, Registry } from "prom-client";
import { client } from "../../../client.js";
import { formatTime } from "../../../utility/formatTime.js";
import { getLogger } from "../../../utility/logging/logger.js";
import { Metrics, metricsManager } from "../metrics.js";

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "alphagamebot_" });
const logger = getLogger("prometheus");
const METRICS_HTTP_SERVER_PORT = process.env.METRICS_HTTP_SERVER_PORT || "5000";


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
    })
};

Object.values(gauges).forEach(g => registry.registerMetric(g));

async function exportMetricsToPrometheus() {
    // Clear previous gauge values
    const startTime = performance.now();
    Object.values(gauges).forEach(g => g.reset());
    logger.verbose("Exporting metrics...");
    let queueLength = 0;
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
            } else if (metric === Metrics.FEATURE_USED && gauges[metric]) {
                gauges[metric].inc({ feature: String(data.feature) });
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

    // return data for prometheus, as a string
    return await registry.metrics();
}

const httpLogger = getLogger("metrics/http");
const server = createServer(async (req, res) => {
    httpLogger.verbose(`${req.method} ${req.url} from ${req.socket.remoteAddress || "unknown address"}`);
    // set Server header
    res.setHeader("Server", `AlphaGameBot/${process.env.VERSION || "unknown"}; NodeJS/${process.version}; node-http`);
    const startTime = performance.now();

    if (req.method === "GET" && req.url === "/metrics") {
        try {
            const metrics = await exportMetricsToPrometheus();
            res.writeHead(200, {
                "Content-Type": registry.contentType,
            });
            res.end(metrics);
        } catch (err) {
            logger.error("Error collecting metrics:", err);
            res.writeHead(500);
            res.end("Error collecting metrics");
        }
    } else {
        httpLogger.warn(`Unknown request: ${req.method} ${req.url}`);
        res.writeHead(404, { "Content-Type": "text/html" });
        const pageContent = readFileSync(process.env.NODE_ENV === "production"
            ? "./assets/metrics-server-404.html"
            : "../assets/metrics-server-404.html");

        // in pageContent, replace {{SERVER}} with the server header value
        res.getHeader("Server");
        const serverHeader = res.getHeader("Server") || "AlphaGameBot/unknown; NodeJS/unknown; node-http";
        const finalPageContent = pageContent.toString()
            .replace("{{SERVER}}", String(serverHeader))
            .replace("{{PATH}}", req.url || "/unknown")
            .replace("{{RENDER_TIME}}", formatTime(performance.now() - startTime));
        res.end(finalPageContent);
    }

    // format time like 120us or 1.23ms, etc

    const duration = performance.now() - startTime;
    httpLogger.debug(`${req.method} ${req.url} ${req.headers["user-agent"] || "UnknownUserAgent/0.0"} - ${res.statusCode} ${formatTime(duration)}`, {
        method: req.method,
        url: req.url,
        userAgent: req.headers["user-agent"] || "UnknownUserAgent/0.0",
        statusCode: res.statusCode,
        durationMs: duration
    });
});

export function startPrometheusExporter() {
    logger.info(`Starting Prometheus metrics HTTP server on port ${METRICS_HTTP_SERVER_PORT}`);
    server.listen(Number(METRICS_HTTP_SERVER_PORT), () => {
        httpLogger.info(`Prometheus metrics HTTP server is running on port ${METRICS_HTTP_SERVER_PORT}. Time since start: ${formatTime(performance.now())}`);
        if (process.env.NODE_ENV !== "production") {
            httpLogger.info(`You can view metrics at http://localhost:${METRICS_HTTP_SERVER_PORT}/metrics`);
        }
    });
}
