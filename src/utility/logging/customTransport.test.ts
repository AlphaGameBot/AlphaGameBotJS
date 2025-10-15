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

import { EngineeringOpsTransport } from "./customTransport.js";
import { jest } from "@jest/globals";

// Mock fetch globally
global.fetch = jest.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        return { ok: true, status: 200 } as Response;
    }
) as typeof fetch;

describe("EngineeringOpsTransport", () => {
    let transport: EngineeringOpsTransport;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        (global.fetch as jest.Mock).mockClear();
        ((global.fetch as jest.Mock).mockResolvedValue as jest.Mock)(({
            ok: true,
            status: 200
        } as Response));
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("constructor", () => {
        it("should throw error if ERROR_WEBHOOK_URL not set in production", () => {
            process.env.NODE_ENV = "production";
            delete process.env.ERROR_WEBHOOK_URL;

            expect(() => new EngineeringOpsTransport()).toThrow("ERROR_WEBHOOK_URL is not set");
        });

        it("should not throw error if ERROR_WEBHOOK_URL not set in development", () => {
            process.env.NODE_ENV = "development";
            delete process.env.ERROR_WEBHOOK_URL;

            expect(() => new EngineeringOpsTransport()).not.toThrow();
        });

        it("should construct successfully with ERROR_WEBHOOK_URL set", () => {
            process.env.ERROR_WEBHOOK_URL = "https://discord.com/api/webhooks/test";
            process.env.NODE_ENV = "production";

            expect(() => new EngineeringOpsTransport()).not.toThrow();
        });
    });

    describe("log", () => {
        beforeEach(() => {
            process.env.ERROR_WEBHOOK_URL = "https://discord.com/api/webhooks/test";
            process.env.NODE_ENV = "production";
            transport = new EngineeringOpsTransport();
        });

        it("should emit 'logged' event", async () => {
            const emitSpy = jest.spyOn(transport, "emit");
            const info = { level: "info", message: "test message" };

            await transport.log(info, jest.fn());

            expect(emitSpy).toHaveBeenCalledWith("logged", info);
        });

        it("should send webhook for error level", async () => {
            const info = { level: "error", message: "test error", meta: { foo: "bar" } };

            await transport.log(info, jest.fn());

            expect(global.fetch).toHaveBeenCalledWith(
                process.env.ERROR_WEBHOOK_URL,
                expect.objectContaining({
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })
            );
        });

        it("should send webhook for warn level", async () => {
            const info = { level: "warn", message: "test warning" };

            await transport.log(info, jest.fn());

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it("should not send webhook for info level", async () => {
            const info = { level: "info", message: "test info" };

            await transport.log(info, jest.fn());

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("should not send webhook if ERROR_WEBHOOK_URL is not set", async () => {
            delete process.env.ERROR_WEBHOOK_URL;
            const info = { level: "error", message: "test error" };

            await transport.log(info, jest.fn());

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("should not send webhook if NODE_ENV is not production", async () => {
            process.env.NODE_ENV = "development";
            const info = { level: "error", message: "test error" };

            await transport.log(info, jest.fn());

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("should include ping for errors when ENGINEERING_OPS_DISCORD_ID is set", async () => {
            process.env.ENGINEERING_OPS_DISCORD_ID = "123456789";
            const info = { level: "error", message: "test error" };

            await transport.log(info, jest.fn());

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.content).toBe(" <@123456789> ");
        });

        it("should not include ping for warnings", async () => {
            process.env.ENGINEERING_OPS_DISCORD_ID = "123456789";
            const info = { level: "warn", message: "test warning" };

            await transport.log(info, jest.fn());

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.content).toBe("");
        });

        it("should create embed with correct structure", async () => {
            const info = { level: "error", message: "test error", extra: "data" };

            await transport.log(info, jest.fn());

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.embeds).toHaveLength(1);
            expect(body.embeds[0].title).toContain("ERROR");
            expect(body.embeds[0].description).toBe("test error");
            expect(body.embeds[0].fields).toHaveLength(1);
            expect(body.embeds[0].fields[0].name).toBe("Meta");
        });

        it("should include meta data in embed", async () => {
            const info = { level: "error", message: "test", foo: "bar", baz: 123 };

            await transport.log(info, jest.fn());

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            const metaField = JSON.parse(body.embeds[0].fields[0].value);
            expect(metaField.foo).toBe("bar");
            expect(metaField.baz).toBe(123);
        });
    });
});
