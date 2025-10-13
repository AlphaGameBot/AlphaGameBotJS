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
import { MetricsManager } from "./metrics.js";

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
});
