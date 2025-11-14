/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Metrics, MetricsManager, metricsManager } from "./metrics.js";

interface ImplementsClearOldMetrics {
    clearOldMetrics: (maxAge: number) => void;
}

describe("MetricsManager", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        try {
            metricsManager.getMetrics().clear();
        // eslint-disable-next-line no-empty
        } catch { }
    });

    it("should set up interval to clear old metrics every 10 minutes", () => {
        const setIntervalSpy = jest.spyOn(global, "setInterval");

        // Import will trigger constructor
        new MetricsManager();

        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function),
            10 * 60 * 1000
        );

        setIntervalSpy.mockRestore();
    });

    it("should call clearOldMetrics with 1 hour maxAge when interval triggers", () => {
        const manager = new MetricsManager();

        const clearOldMetricsSpy = jest.spyOn(manager as unknown as ImplementsClearOldMetrics, "clearOldMetrics");

        // Fast-forward 10 minutes
        jest.advanceTimersByTime(10 * 60 * 1000);

        expect(clearOldMetricsSpy).toHaveBeenCalledWith(60 * 60 * 1000);

        clearOldMetricsSpy.mockRestore();
    });

    it("should trigger cleanup multiple times when interval elapses repeatedly", () => {
        const manager = new MetricsManager();

        const clearOldMetricsSpy = jest.spyOn(manager as unknown as ImplementsClearOldMetrics, "clearOldMetrics");

        // Fast-forward 30 minutes (3 intervals)
        jest.advanceTimersByTime(30 * 60 * 1000);

        expect(clearOldMetricsSpy).toHaveBeenCalledTimes(3);

        clearOldMetricsSpy.mockRestore();
    });

    it("should set up interval to clear old metrics every 10 minutes", () => {
        const setIntervalSpy = jest.spyOn(global, "setInterval");

        // Import will trigger constructor
        new MetricsManager();

        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function),
            10 * 60 * 1000
        );

        setIntervalSpy.mockRestore();
    });

    it("should call clearOldMetrics with 1 hour maxAge when interval triggers", () => {
        const manager = new MetricsManager();

        const clearOldMetricsSpy = jest.spyOn(manager as unknown as ImplementsClearOldMetrics, "clearOldMetrics");

        // Fast-forward 10 minutes
        jest.advanceTimersByTime(10 * 60 * 1000);

        expect(clearOldMetricsSpy).toHaveBeenCalledWith(60 * 60 * 1000);

        clearOldMetricsSpy.mockRestore();
    });

    it("should trigger cleanup multiple times when interval elapses repeatedly", () => {
        const manager = new MetricsManager();

        const clearOldMetricsSpy = jest.spyOn(manager as unknown as ImplementsClearOldMetrics, "clearOldMetrics");

        // Fast-forward 30 minutes (3 intervals)
        jest.advanceTimersByTime(30 * 60 * 1000);

        expect(clearOldMetricsSpy).toHaveBeenCalledTimes(3);

        clearOldMetricsSpy.mockRestore();
    });

    it("submitMetric should store entries and increment IDs", () => {
        const manager = new MetricsManager();

        const key = Metrics.FEATURE_USED as unknown as any;
        manager.submitMetric(key, { feature: "test" } as any);
        manager.submitMetric(key, { feature: "test2" } as any);

        const metrics = manager.getMetrics();
        expect(metrics.has(key)).toBe(true);

        const entries = metrics.get(key) as Array<any>;
        expect(entries).toBeDefined();
        expect(entries.length).toBe(2);
        expect(entries[0].id).toBeLessThan(entries[1].id);
        expect(entries[0].type).toBe(key);
        expect(entries[1].data.feature).toBe("test2");
    });

    it("should remove old metric entries when interval runs", () => {
        const manager = new MetricsManager();
        const key = Metrics.FEATURE_USED as unknown as any;

        manager.submitMetric(key, { foo: "bar" } as any);

        // Manually age the entry to simulate an old metric (2 hours old)
        const metrics = manager.getMetrics();
        const entries = metrics.get(key) as Array<any>;
        expect(entries).toBeDefined();
        entries[0].timestamp = Date.now() - (2 * 60 * 60 * 1000);

        // Trigger the interval which calls clearOldMetrics
        jest.advanceTimersByTime(10 * 60 * 1000);

        expect(metrics.has(key)).toBe(false);
    });

    it("should handle Map data being submitted without throwing", () => {
        const manager = new MetricsManager();
        const key = Metrics.METRICS_QUEUE_LENGTH_BY_METRIC as unknown as any;

        const m = new Map<string, number>();
        m.set("a", 1);
        expect(() => manager.submitMetric(key, m as any)).not.toThrow();

        const metrics = manager.getMetrics();
        const entries = metrics.get(key) as Array<any>;
        expect(entries).toBeDefined();
        expect(entries.length).toBe(1);
    });

    it("unhandledRejection handler should submit an APPLICATION_ERROR metric with message for string reason", () => {
        // Ensure global metrics are clear
        metricsManager.getMetrics().clear();

        // Emit an unhandledRejection with a string reason
        const reason = "something bad happened";
        // @ts-expect-error Testing purposes
        process.emit("unhandledRejection", reason);

        const globalMetrics = metricsManager.getMetrics();
        const appErrors = globalMetrics.get(Metrics.APPLICATION_ERROR as unknown as any) as Array<any>;
        expect(appErrors).toBeDefined();
        expect(appErrors.length).toBeGreaterThanOrEqual(1);
        const last = appErrors[appErrors.length - 1];
        expect(last.data).toBeDefined();
        expect(last.data.message).toBe(reason);
    });

    it("uncaughtException handler should submit an APPLICATION_ERROR metric with message for Error", () => {
        // Ensure global metrics are clear
        metricsManager.getMetrics().clear();

        const err = new Error("boom!");
        process.emit("uncaughtException", err);

        const globalMetrics = metricsManager.getMetrics();
        const appErrors = globalMetrics.get(Metrics.APPLICATION_ERROR as unknown as any) as Array<any>;
        expect(appErrors).toBeDefined();
        expect(appErrors.length).toBeGreaterThanOrEqual(1);
        const last = appErrors[appErrors.length - 1];
        expect(last.data).toBeDefined();
        expect(last.data.message).toBe("boom!");
    });
});
