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

/**
 * Formats a time duration into a human-readable string.
 * 
 * - Durations less than 1 ms are shown in microseconds (μs).
 * - Durations from 1 ms to less than 1000 ms are shown in milliseconds (ms) with two decimal places.
 * - Durations of 1000 ms and above are shown in seconds (s) with two decimal places.
 * 
 * @param duration Time, in milliseconds. (floating-point allowed)
 * @returns A formatted time string.
 */
export function formatTime(duration: number): string {
    const absDuration = Math.abs(duration);
    if (absDuration < 1) {
        return `${(duration * 1000).toFixed(0)}μs`;
    } else if (absDuration < 1000) {
        return `${duration.toFixed(2)}ms`;
    } else {
        return `${(duration / 1000).toFixed(2)}s`;
    }
};