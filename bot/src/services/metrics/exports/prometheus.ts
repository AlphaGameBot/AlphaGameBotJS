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
import { PrometheusMetricType } from "../../../interfaces/metrics/MetricConfiguration.js";
import { formatTime } from "../../../utility/formatTime.js";
import { getLogger } from "../../../utility/logging/logger.js";
import { metricConfigurations } from "../definitions/metricConfigurations.js";
import { Metrics, metricsManager } from "../metrics.js";
import { metricRegistry } from "../MetricRegistry.js";
import { MetricsHTTPServer } from "./http/MetricsHTTPServer.js";

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "alphagamebot_" });
const logger = getLogger("prometheus");
const METRICS_HTTP_SERVER_PORT = process.env.METRICS_HTTP_SERVER_PORT || "9100";

// Register all metric configurations
metricConfigurations.forEach(config => metricRegistry.register(config));

// Create Prometheus metrics dynamically from configurations
const prometheusMetrics = new Map<string, Gauge | Counter | Histogram>();

for (const config of metricConfigurations) {
    let metric: Gauge | Counter | Histogram;
    
    switch (config.prometheusType) {
        case PrometheusMetricType.GAUGE:
            metric = new Gauge({
                name: config.prometheusName,
                help: config.prometheusHelp,
                labelNames: config.prometheusLabels || []
            });
            break;
        case PrometheusMetricType.COUNTER:
            metric = new Counter({
                name: config.prometheusName,
                help: config.prometheusHelp,
                labelNames: config.prometheusLabels || []
            });
            break;
        case PrometheusMetricType.HISTOGRAM:
            metric = new Histogram({
                name: config.prometheusName,
                help: config.prometheusHelp,
                labelNames: config.prometheusLabels || [],
                ...(config.prometheusBuckets ? { buckets: config.prometheusBuckets } : {})
            });
            break;
        default:
            throw new Error(`Unknown Prometheus metric type: ${config.prometheusType}`);
    }
    
    prometheusMetrics.set(config.name, metric);
    registry.registerMetric(metric);
}

async function exportMetricsToPrometheus() {
    const startTime = performance.now();
    
    // Reset all metrics
    prometheusMetrics.forEach(metric => metric.reset());
    
    logger.verbose("Exporting metrics...");
    let queueLength = 0;
    const queueLengthByMetric: Map<Metrics, number> = new Map();

    const metricsMap = metricsManager.getMetrics();
    
    for (const [metricName, entries] of metricsMap.entries()) {
        queueLengthByMetric.set(metricName, entries.length);
        
        // Handle the special queue length by metric counter
        const queueLengthByMetricGauge = prometheusMetrics.get(Metrics.METRICS_QUEUE_LENGTH_BY_METRIC) as Gauge;
        if (queueLengthByMetricGauge) {
            queueLengthByMetricGauge.set({ metric: metricName }, entries.length);
        }
        
        logger.verbose(`Processing ${entries.length} entries for metric ${metricName}`);
        
        const config = metricRegistry.get(metricName);
        if (!config) {
            logger.error(`No configuration found for metric: ${metricName}`);
            continue;
        }
        
        const prometheusMetric = prometheusMetrics.get(metricName);
        if (!prometheusMetric) {
            logger.error(`No Prometheus metric found for: ${metricName}`);
            continue;
        }
        
        for (const entry of entries) {
            queueLength++;
            const metricEntry = entry as { data: unknown };
            const data = metricEntry.data;
            
            try {
                config.processData(prometheusMetric, data);
            } catch (error) {
                logger.error(`Error processing metric ${metricName}:`, error);
            }
        }
    }

    const durationMs = performance.now() - startTime;
    logger.verbose(`Metrics generation took ${durationMs}ms, queue length is ${queueLength}`);

    // Set special metrics that aren't based on queue entries
    const metricsGenerationTimeGauge = prometheusMetrics.get(Metrics.METRICS_GENERATION_TIME) as Gauge;
    if (metricsGenerationTimeGauge) {
        metricsGenerationTimeGauge.set(durationMs);
    }
    
    const metricsQueueLengthGauge = prometheusMetrics.get(Metrics.METRICS_QUEUE_LENGTH) as Gauge;
    if (metricsQueueLengthGauge) {
        metricsQueueLengthGauge.set(queueLength);
    }
    
    const discordLatencyGauge = prometheusMetrics.get(Metrics.DISCORD_LATENCY) as Gauge;
    if (discordLatencyGauge) {
        discordLatencyGauge.set(client.ws.ping);
    }

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
