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

/* eslint-disable no-console */

// Global test setup to suppress console output during tests
const originalConsoleLog = console.log;
const originalConsoleDebug = console.debug;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Suppress console output during tests
beforeAll(() => {
    console.log = (): void => {
        // Suppressed
    };
    console.debug = (): void => {
        // Suppressed
    };
    console.info = (): void => {
        // Suppressed
    };
    console.warn = (): void => {
        // Suppressed
    };
    console.error = (): void => {
        // Suppressed
    };
});

// Restore console methods after all tests
afterAll(() => {
    console.log = originalConsoleLog;
    console.debug = originalConsoleDebug;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});
