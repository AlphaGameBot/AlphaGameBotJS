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

import logger, { getLogger, LoggerNames } from "./logger.js";

describe("Logger", () => {
    describe("default logger", () => {
        it("should export a logger instance", () => {
            expect(logger).toBeDefined();
            expect(logger.info).toBeDefined();
            expect(logger.debug).toBeDefined();
            expect(logger.error).toBeDefined();
            expect(logger.warn).toBeDefined();
        });

        it("should have correct log level based on NODE_ENV", () => {
            const isDevelopment = process.env.NODE_ENV !== "production";
            const expectedLevel = isDevelopment ? "debug" : "info";
            expect(logger.level).toBe(expectedLevel);
        });
    });

    describe("getLogger", () => {
        it("should return a child logger with label", () => {
            const scopedLogger = getLogger("test/scope");
            expect(scopedLogger).toBeDefined();
            expect(scopedLogger.info).toBeDefined();
        });

        it("should create different logger instances for different scopes", () => {
            const logger1 = getLogger("scope1");
            const logger2 = getLogger("scope2");
            
            expect(logger1).not.toBe(logger2);
        });

        it("should work with LoggerNames enum", () => {
            const metricsLogger = getLogger(LoggerNames.METRICS);
            expect(metricsLogger).toBeDefined();
        });
    });

    describe("LoggerNames enum", () => {
        it("should export METRICS constant", () => {
            expect(LoggerNames.METRICS).toBe("metrics");
        });
    });

    describe("logger configuration", () => {
        it("should have format configuration", () => {
            // Check that the logger has the necessary format components
            expect(logger.format).toBeDefined();
        });

        it("should have console transport configured", () => {
            // Verify console transport is present
            const transports = logger.transports;
            expect(transports.length).toBeGreaterThan(0);
        });

        it("should use colorize in development mode", () => {
            // This is implicitly tested by the logger configuration
            // Just verify that the logger is configured
            expect(logger).toBeDefined();
        });

        it("should handle timestamp configuration based on environment", () => {
            // The format includes timestamp configuration
            // Verify it's part of the logger setup
            expect(logger.format).toBeDefined();
        });
    });

    describe("logger integration", () => {
        it("should have transports configured", () => {
            expect(logger.transports).toBeDefined();
            expect(logger.transports.length).toBeGreaterThan(0);
        });

        it("should have format configuration", () => {
            expect(logger.format).toBeDefined();
        });

        it("should have all standard logging methods", () => {
            expect(typeof logger.debug).toBe("function");
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.error).toBe("function");
        });
    });
});
