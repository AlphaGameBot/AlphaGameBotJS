/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { MetricsHTTPServer } from "./MetricsHTTPServer.js";

describe("MetricsHTTPServer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a server instance", () => {
        const server = new MetricsHTTPServer(async () => "");
        expect(server).toBeInstanceOf(MetricsHTTPServer);
    });

    it("should initialize without errors", () => {
        expect(() => new MetricsHTTPServer(async () => "")).not.toThrow();
    });

    it("should export a startServer function", () => {
        const server = new MetricsHTTPServer(async () => "");
        expect(typeof server.startServer).toBe("function");
    });

    it("should register routes correctly", () => {
        const server = new MetricsHTTPServer(async () => "");
        // eslint-disable-next-line no-empty-function
        const mockHandler = jest.fn(async () => { });

        server.registerRoute("GET", "/test", mockHandler);

        // @ts-expect-error Accessing a protected method
        const routeKey = server.getRouteKey("GET", "/test");

        // @ts-expect-error Accessing a protected property
        expect(server.routeMap.get(routeKey)).toBe(mockHandler);
    });

    it("should start the server without errors", async () => {
        const server = new MetricsHTTPServer(async () => "");
        expect(() => server.startServer()).not.toThrow();
    });

    it("should handle not found routes", async () => {
        const server = new MetricsHTTPServer(async () => "");
        const req: any = { method: "GET", url: "/nonexistent", socket: { remoteAddress: "127.0.0.1" } };
        const res = new (class {
            statusCode = 200;
            headers: Record<string, string> = {};
            setHeader(key: string, value: string) {
                this.headers[key] = value;
            }
            writeHead(statusCode: number) {
                this.statusCode = statusCode;
            }
            end = jest.fn((data?: any) => {
                // no-op
                return;
            });
        })();

        // @ts-expect-error using custom class
        await server.handleRequest(req, res);

        expect(res.statusCode).toBe(404);
    });
});