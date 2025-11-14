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

import { describe, expect, it } from "@jest/globals";
import { formatTime } from "./formatTime.js";

describe("formatTime", () => {
    describe("formatTime", () => {
        it("is a function", () => {
            expect(typeof formatTime).toBe("function");
        });

        it("handles zero and negative durations correctly", () => {
            expect(formatTime(0)).toBe("0μs");
        });
        
        it("returns microseconds for durations less than 1 ms", () => {
            expect(formatTime(0)).toBe("0μs");
            expect(formatTime(0.4)).toBe("400μs");
            expect(formatTime(0.999)).toBe("999μs");
            expect(formatTime(-0.456)).toBe("-456μs");
        });

        it("formats milliseconds with two decimal places for values >= 1 and < 1000", () => {
            expect(formatTime(1)).toBe("1.00ms");
            expect(formatTime(12.345)).toBe("12.35ms");
            expect(formatTime(999.499)).toBe("999.50ms");
            expect(formatTime(-12.3)).toBe("-12.30ms");
        });

        it("formats seconds with two decimal places for values >= 1000", () => {
            expect(formatTime(1000)).toBe("1.00s");
            expect(formatTime(12345)).toBe("12.35s");
            expect(formatTime(1500)).toBe("1.50s");
            expect(formatTime(-1500)).toBe("-1.50s");
        });
    });
});