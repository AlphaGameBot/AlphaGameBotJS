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

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Events, type Guild } from 'discord.js';
import GuildCreateHandler from './GuildCreate.js';

// Mock the database module
jest.mock('../utility/database.js', () => ({
    default: {
        guild: {
            upsert: jest.fn()
        }
    }
}));

// Import the mocked prisma after mocking
import prisma from '../utility/database.js';

describe('GuildCreate event handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have correct event name', () => {
        expect(GuildCreateHandler.name).toBe(Events.GuildCreate);
    });

    it('should register guild in database when bot joins', async () => {
        const mockGuild = {
            id: '123456789',
            name: 'Test Guild'
        } as Guild;

        const mockUpsert = jest.fn().mockResolvedValue({});
        (prisma.guild.upsert as jest.Mock) = mockUpsert;

        await GuildCreateHandler.execute(mockGuild);

        expect(mockUpsert).toHaveBeenCalledWith({
            where: { id: '123456789' },
            create: { 
                id: '123456789', 
                name: 'Test Guild' 
            },
            update: { 
                name: 'Test Guild' 
            }
        });
        expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
        const mockGuild = {
            id: '123456789',
            name: 'Test Guild'
        } as Guild;

        const mockUpsert = jest.fn().mockRejectedValue(new Error('Database error'));
        (prisma.guild.upsert as jest.Mock) = mockUpsert;

        // Should not throw
        await expect(GuildCreateHandler.execute(mockGuild)).resolves.not.toThrow();
    });
});
