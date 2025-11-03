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

import type { ClientEvents } from "discord.js";

/**
 * This interface represents a Discord event handler.
 * 
 * Each event handler must specify the event name it listens to,
 * whether it should be executed only once, and the execute function
 * that contains the logic to be run when the event is triggered.
 * 
 * @template K - The key of the event in ClientEvents that this handler listens to.
 */
export interface EventHandler<K extends keyof ClientEvents> {
    name: K;
    once?: boolean;
    execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

export interface LoadedEventHandler<K extends keyof ClientEvents = keyof ClientEvents> extends EventHandler<K> {
    eventFile: string;
}
