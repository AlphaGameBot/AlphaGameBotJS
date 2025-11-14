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

export async function loadDotenv(): Promise<void> {
    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "deploy") {
        try {
            await import("dotenv/config");
            // block until the import is done
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to load dotenv",
                err instanceof Error ? err.message : err);
        }
    }
}
