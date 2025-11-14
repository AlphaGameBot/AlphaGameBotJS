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
import type { Logger } from "winston";

describe("loadDotenv", () => {
    let mockLogger: Logger;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
        originalNodeEnv = process.env.NODE_ENV;

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
        } as unknown as Logger;

        jest.unstable_mockModule("../logging/logger.js", () => ({
            default: mockLogger,
        }));
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        jest.resetModules();
    });

    it("should not load dotenv in production environment", async () => {
        process.env.NODE_ENV = "production";

        const { loadDotenv } = await import("./dotenv.js");
        await loadDotenv();

        expect(mockLogger.info).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should log error if dotenv import fails", async () => {
        process.env.NODE_ENV = "development";

        const importError = new Error("dotenv not found");
        jest.unstable_mockModule("dotenv/config", () => {
            throw importError;
        });

        // eslint-disable-next-line no-empty-function
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const { loadDotenv } = await import("./dotenv.js");
        await loadDotenv();

        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
