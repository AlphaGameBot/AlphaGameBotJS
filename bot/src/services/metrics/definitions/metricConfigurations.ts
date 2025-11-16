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

import type { Gauge, Histogram } from "prom-client";
import type { MetricDataMap } from "../../../interfaces/metrics/MetricDataMap.js";
import { type MetricConfiguration, PrometheusMetricType } from "../../../interfaces/metrics/MetricConfiguration.js";
import { Metrics } from "../metrics.js";

/**
 * Metric configurations for all supported metrics.
 * Adding a new metric only requires adding a new configuration here.
 */
export const metricConfigurations: MetricConfiguration[] = [
    {
        name: Metrics.INTERACTIONS_RECEIVED,
        description: "Number of interactions received",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_interactions_received",
        prometheusHelp: "Number of interactions received",
        prometheusLabels: ["event"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.INTERACTIONS_RECEIVED];
            (metric as Gauge).inc({ event: String(typedData.event) });
        }
    },
    {
        name: Metrics.EVENT_EXECUTED,
        description: "Duration of event execution",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_event_executed_duration_ms",
        prometheusHelp: "Duration of event execution in ms",
        prometheusLabels: ["event", "eventFile"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.EVENT_EXECUTED];
            (metric as Gauge).set(
                { event: String(typedData.event), eventFile: String(typedData.eventFile) },
                Number(typedData.durationMs)
            );
        }
    },
    {
        name: Metrics.COMMAND_EXECUTED,
        description: "Duration of command execution",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_command_executed_duration_ms",
        prometheusHelp: "Duration of command execution in ms",
        prometheusLabels: ["event", "commandName"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.COMMAND_EXECUTED];
            (metric as Gauge).set(
                { event: String(typedData.event), commandName: String(typedData.commandName) },
                Number(typedData.durationMs)
            );
        }
    },
    {
        name: Metrics.RAW_EVENT_RECEIVED,
        description: "Number of raw events received",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_raw_event_received",
        prometheusHelp: "Number of raw events received",
        prometheusLabels: ["event"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.RAW_EVENT_RECEIVED];
            (metric as Gauge).inc({ event: String(typedData.event) });
        }
    },
    {
        name: Metrics.METRICS_QUEUE_LENGTH,
        description: "Current length of the metrics queue",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_metrics_queue_length",
        prometheusHelp: "Current length of the metrics queue",
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.METRICS_QUEUE_LENGTH];
            (metric as Gauge).set(Number(typedData.length));
        }
    },
    {
        name: Metrics.METRICS_QUEUE_LENGTH_BY_METRIC,
        description: "Current length of the metrics queue by metric",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_metrics_queue_length_by_metric",
        prometheusHelp: "Current length of the metrics queue by metric",
        prometheusLabels: ["metric"],
        processData: () => {
            // This metric is handled specially in the exporter
        }
    },
    {
        name: Metrics.METRICS_GENERATION_TIME,
        description: "Time taken to generate metrics",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_metrics_generation_time_ms",
        prometheusHelp: "Time taken to generate metrics in ms",
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.METRICS_GENERATION_TIME];
            (metric as Gauge).set(Number(typedData.durationMs));
        }
    },
    {
        name: Metrics.EVENT_RECEIVED,
        description: "Events received",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_event_received",
        prometheusHelp: "Events Received",
        prometheusLabels: ["event"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.EVENT_RECEIVED];
            (metric as Gauge).inc({ event: String(typedData.event) });
        }
    },
    {
        name: Metrics.DISCORD_LATENCY,
        description: "Discord API latency",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_discord_latency_ms",
        prometheusHelp: "Discord API Latency in ms",
        processData: () => {
            // This metric is handled specially in the exporter
        }
    },
    {
        name: Metrics.APPLICATION_ERROR,
        description: "Number of application errors",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_application_error",
        prometheusHelp: "Number of application errors",
        prometheusLabels: ["event"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.APPLICATION_ERROR];
            (metric as Gauge).inc({ event: String(typedData.name) });
        }
    },
    {
        name: Metrics.INTERACTION_RECEIVED,
        description: "Number of interactions received by type",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_interaction_received",
        prometheusHelp: "Number of interactions received by type",
        prometheusLabels: ["interactionType"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.INTERACTION_RECEIVED];
            (metric as Gauge).inc({ interactionType: String(typedData.interactionType) });
        }
    },
    {
        name: Metrics.FEATURE_USED,
        description: "Features used",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_feature_used",
        prometheusHelp: "Features Used",
        prometheusLabels: ["feature"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.FEATURE_USED];
            (metric as Gauge).inc({ feature: String(typedData.feature) });
        }
    },
    {
        name: Metrics.METRICS_HTTP_SERVER_REQUESTS,
        description: "HTTP server requests for metrics",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_metrics_http_server_requests",
        prometheusHelp: "HTTP server requests for metrics",
        prometheusLabels: ["method", "url", "remoteAddress", "statusCode"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.METRICS_HTTP_SERVER_REQUESTS];
            (metric as Gauge).inc({
                method: String(typedData.method),
                url: String(typedData.url),
                remoteAddress: String(typedData.remoteAddress),
                statusCode: String(typedData.statusCode)
            });
        }
    },
    {
        name: Metrics.DATABASE_OPERATION,
        description: "Database operation duration",
        prometheusType: PrometheusMetricType.HISTOGRAM,
        prometheusName: "alphagamebot_database_operation_duration_seconds",
        prometheusHelp: "Database operation duration in seconds",
        prometheusLabels: ["model", "operation"],
        prometheusBuckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.DATABASE_OPERATION];
            (metric as Histogram).observe(
                { model: String(typedData.model), operation: String(typedData.operation) },
                Number(typedData.durationMs) / 1000
            );
        }
    }
];
