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

import { jest } from "@jest/globals";
import { PrometheusMetricType } from "../../interfaces/metrics/MetricConfiguration.js";
import { MetricRegistry } from "./MetricRegistry.js";

describe("MetricRegistry", () => {
    let registry: MetricRegistry;

    beforeEach(() => {
        registry = new MetricRegistry();
    });

    it("should register a metric configuration", () => {
        const config = {
            name: "test_metric",
            description: "Test metric",
            prometheusType: PrometheusMetricType.GAUGE,
            prometheusName: "test_metric",
            prometheusHelp: "Test metric",
            processData: jest.fn()
        };

        registry.register(config);

        expect(registry.has("test_metric")).toBe(true);
        expect(registry.get("test_metric")).toBe(config);
    });

    it("should warn when registering a duplicate metric", () => {
        const config1 = {
            name: "test_metric",
            description: "Test metric 1",
            prometheusType: PrometheusMetricType.GAUGE,
            prometheusName: "test_metric",
            prometheusHelp: "Test metric",
            processData: jest.fn()
        };

        const config2 = {
            name: "test_metric",
            description: "Test metric 2",
            prometheusType: PrometheusMetricType.GAUGE,
            prometheusName: "test_metric",
            prometheusHelp: "Test metric",
            processData: jest.fn()
        };

        registry.register(config1);
        registry.register(config2);

        // Second config should overwrite the first
        expect(registry.get("test_metric")).toBe(config2);
    });

    it("should return undefined for non-existent metric", () => {
        expect(registry.get("non_existent")).toBeUndefined();
    });

    it("should return all registered configurations", () => {
        const config1 = {
            name: "metric1",
            description: "Metric 1",
            prometheusType: PrometheusMetricType.GAUGE,
            prometheusName: "metric1",
            prometheusHelp: "Metric 1",
            processData: jest.fn()
        };

        const config2 = {
            name: "metric2",
            description: "Metric 2",
            prometheusType: PrometheusMetricType.COUNTER,
            prometheusName: "metric2",
            prometheusHelp: "Metric 2",
            processData: jest.fn()
        };

        registry.register(config1);
        registry.register(config2);

        const all = registry.getAll();
        expect(all.size).toBe(2);
        expect(all.get("metric1")).toBe(config1);
        expect(all.get("metric2")).toBe(config2);
    });

    it("should check if a metric is registered", () => {
        const config = {
            name: "test_metric",
            description: "Test metric",
            prometheusType: PrometheusMetricType.GAUGE,
            prometheusName: "test_metric",
            prometheusHelp: "Test metric",
            processData: jest.fn()
        };

        expect(registry.has("test_metric")).toBe(false);
        registry.register(config);
        expect(registry.has("test_metric")).toBe(true);
    });
});
