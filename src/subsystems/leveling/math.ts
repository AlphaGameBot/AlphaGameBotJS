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

export function calculateRequiredPoints(level: number): number {
    // XP needed = 5L^2 + 15L + 20
    return 5 * level * level + 15 * level + 20;
}

export function calculateLevelFromPoints(points: number): number {
    // L = ( -15 + sqrt(225 - 4 * (20 - XP)) ) / 10
    return Math.floor((-15 + Math.sqrt(225 - 4 * (20 - points))) / 10);
}

export function calculatePoints(messages: number, commands: number): number {
    return messages + commands * 5;
}
