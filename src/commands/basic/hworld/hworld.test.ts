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

import { describe, expect, it, jest } from '@jest/globals';
import type { ChatInputCommandInteraction } from 'discord.js';
import hworld from './hworld.js';

describe('hworld command', () => {
    it('should have correct command data', () => {
        expect(hworld.data.name).toBe('helloworld');
        expect(hworld.data.description).toBe('Replies with Hello, World!');
    });

    it('should reply with "Hello, World!"', async () => {
        const mockInteraction = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reply: jest.fn<() => Promise<any>>().mockResolvedValue(undefined)
        } as unknown as ChatInputCommandInteraction;

        await hworld.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith('Hello, World!');
        expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    });

    it('should have both data and execute properties', () => {
        expect(hworld).toHaveProperty('data');
        expect(hworld).toHaveProperty('execute');
        expect(typeof hworld.execute).toBe('function');
    });
});