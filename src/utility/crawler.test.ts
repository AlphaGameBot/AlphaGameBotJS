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

import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { Collection } from "discord.js";
import { crawlCommands, crawlEvents } from "./crawler.js";

/**
 * Integration tests for the crawler module.
 * These tests verify the crawler can discover and load actual commands/events from the workspace.
 * Note: These tests run against real files in the commands/events directories.
 */

// Mock the logger to silence output during tests
beforeAll(async () => {
    const loggerModule = await import("./logger.js");
    jest.spyOn(loggerModule.default, "debug").mockImplementation(() => loggerModule.default);
    jest.spyOn(loggerModule.default, "info").mockImplementation(() => loggerModule.default);
    jest.spyOn(loggerModule.default, "warn").mockImplementation(() => loggerModule.default);
});

describe("crawlCommands", () => {
    it("should return a Collection instance", async () => {
        const commands = await crawlCommands();
        expect(commands).toBeInstanceOf(Collection);
    });

    it("should load commands with proper structure", async () => {
        const commands = await crawlCommands();

        // Each command should have data and execute properties
        commands.forEach((command, name) => {
            expect(command).toHaveProperty("data");
            expect(command).toHaveProperty("execute");
            expect(typeof command.execute).toBe("function");
            expect(command.data.name).toBe(name);
        });
    });

    it("should load the hworld test command if it exists", async () => {
        const commands = await crawlCommands();

        // Check if our test command is loaded (it should be in test/hworld/)
        const hworldCommand = commands.get("hworld");
        if (hworldCommand) {
            expect(hworldCommand.data.name).toBe("hworld");
            expect(hworldCommand.data.description).toBe("Replies with Hello, World!");
        }
    });

    it("should discover commands from nested category/commandname folders", async () => {
        const commands = await crawlCommands();

        // Verify we found at least some commands from the new structure
        expect(commands.size).toBeGreaterThan(0);

        // All commands should have valid names
        commands.forEach((command) => {
            expect(command.data.name).toBeTruthy();
            expect(command.data.name.length).toBeGreaterThan(0);
        });
    });
});

describe("crawlEvents", () => {
    it("should return an Array", async () => {
        const events = await crawlEvents();
        expect(Array.isArray(events)).toBe(true);
    });

    it("should load events with proper structure", async () => {
        const events = await crawlEvents();

        // Each event should have name, once, and execute properties
        events.forEach((event) => {
            expect(event).toHaveProperty("name");
            expect(event).toHaveProperty("once");
            expect(event).toHaveProperty("execute");
            expect(typeof event.execute).toBe("function");
            expect(typeof event.once).toBe("boolean");
        });
    });

    it("should load the InteractionCreate event if it exists", async () => {
        const events = await crawlEvents();

        // Check if InteractionCreate event is loaded
        const interactionCreateEvent = events.find(e => e.name === "interactionCreate");
        if (interactionCreateEvent) {
            expect(interactionCreateEvent.name).toBe("interactionCreate");
            expect(typeof interactionCreateEvent.execute).toBe("function");
        }
    });
});