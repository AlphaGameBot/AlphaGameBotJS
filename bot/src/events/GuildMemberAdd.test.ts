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
import { Events, type GuildMember, type User, type Guild } from 'discord.js';
import GuildMemberAddHandler from './GuildMemberAdd.js';

// Mock the database module
jest.mock('../utility/database.js', () => ({
    default: {
        $transaction: jest.fn()
    }
}));

// Import the mocked prisma after mocking
import prisma from '../utility/database.js';

describe('GuildMemberAdd event handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have correct event name', () => {
        expect(GuildMemberAddHandler.name).toBe(Events.GuildMemberAdd);
    });

    it('should register both user and guild in database', async () => {
        const mockMember = {
            user: {
                id: '987654321',
                username: 'TestUser',
                discriminator: '1234',
                bot: false
            } as User,
            guild: {
                id: '123456789',
                name: 'Test Guild'
            } as Guild
        } as GuildMember;

        const mockTx = {
            guild: {
                upsert: jest.fn().mockResolvedValue({})
            },
            user: {
                upsert: jest.fn().mockResolvedValue({})
            }
        };

        const mockTransaction = jest.fn().mockImplementation(async (callback) => {
            return await callback(mockTx as never);
        });
        (prisma.$transaction as jest.Mock) = mockTransaction;

        await GuildMemberAddHandler.execute(mockMember);

        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockTx.guild.upsert).toHaveBeenCalledWith({
            where: { id: '123456789' },
            create: { 
                id: '123456789', 
                name: 'Test Guild' 
            },
            update: { 
                name: 'Test Guild' 
            }
        });
        expect(mockTx.user.upsert).toHaveBeenCalledWith({
            where: { id: '987654321' },
            create: { 
                id: '987654321', 
                username: 'TestUser',
                discriminator: '1234'
            },
            update: { 
                username: 'TestUser',
                discriminator: '1234'
            }
        });
    });

    it('should skip bot users', async () => {
        const mockMember = {
            user: {
                id: '987654321',
                username: 'BotUser',
                discriminator: '0000',
                bot: true
            } as User,
            guild: {
                id: '123456789',
                name: 'Test Guild'
            } as Guild
        } as GuildMember;

        const mockTransaction = jest.fn();
        (prisma.$transaction as jest.Mock) = mockTransaction;
        
        await GuildMemberAddHandler.execute(mockMember);

        expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
        const mockMember = {
            user: {
                id: '987654321',
                username: 'TestUser',
                discriminator: '1234',
                bot: false
            } as User,
            guild: {
                id: '123456789',
                name: 'Test Guild'
            } as Guild
        } as GuildMember;

        const mockTransaction = jest.fn().mockRejectedValue(new Error('Database error'));
        (prisma.$transaction as jest.Mock) = mockTransaction;

        // Should not throw
        await expect(GuildMemberAddHandler.execute(mockMember)).resolves.not.toThrow();
    });
});
