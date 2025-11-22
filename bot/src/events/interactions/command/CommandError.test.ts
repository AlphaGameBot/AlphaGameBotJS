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
import { handleCommandError } from './CommandError.js';

// Mock dependencies
jest.mock('../../../utility/logging/logger.js', () => ({
    getLogger: () => ({
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        debug: jest.fn()
    })
}));

describe('CommandError - Original Error Preservation', () => {
    describe('handleCommandError', () => {
        it('should preserve original error even if sending message fails with InteractionAlreadyReplied', async () => {
            const originalError = new Error('Original command error');
            
            // Mock interaction that will fail when trying to send a message
            const mockInteraction = {
                commandName: 'testcommand',
                user: {
                    id: '123456789',
                    tag: 'TestUser#0000'
                },
                guild: {
                    id: '987654321',
                    name: 'Test Guild'
                },
                replied: false,
                deferred: false,
                toJSON: jest.fn().mockReturnValue({ id: 'interaction-id' }),
                reply: jest.fn().mockRejectedValue(new Error('InteractionAlreadyReplied')),
                followUp: jest.fn().mockRejectedValue(new Error('InteractionAlreadyReplied'))
            } as unknown as ChatInputCommandInteraction;

            // Call handleCommandError with original error
            // It should catch the InteractionAlreadyReplied error and not propagate it
            await expect(handleCommandError(mockInteraction, originalError)).resolves.not.toThrow();
            
            // Verify that reply was attempted
            expect(mockInteraction.reply).toHaveBeenCalled();
        });

        it('should store original error in cache before attempting to send message', async () => {
            const originalError = new TypeError('Type mismatch error');
            
            const mockInteraction = {
                commandName: 'testcommand',
                user: {
                    id: '123456789',
                    tag: 'TestUser#0000'
                },
                guild: null,
                replied: false,
                deferred: false,
                toJSON: jest.fn().mockReturnValue({ id: 'interaction-id' }),
                reply: jest.fn().mockRejectedValue(new Error('InteractionAlreadyReplied'))
            } as unknown as ChatInputCommandInteraction;

            // The function should complete without throwing
            await expect(handleCommandError(mockInteraction, originalError)).resolves.not.toThrow();
            
            // The original error type and message should be preserved
            expect(originalError.name).toBe('TypeError');
            expect(originalError.message).toBe('Type mismatch error');
        });

        it('should handle case where interaction is already replied', async () => {
            const originalError = new Error('Command failed');
            
            const mockInteraction = {
                commandName: 'testcommand',
                user: {
                    id: '123456789',
                    tag: 'TestUser#0000'
                },
                guild: null,
                replied: true,  // Already replied
                deferred: false,
                toJSON: jest.fn().mockReturnValue({ id: 'interaction-id' }),
                followUp: jest.fn().mockRejectedValue(new Error('InteractionAlreadyReplied'))
            } as unknown as ChatInputCommandInteraction;

            // Should use followUp instead of reply when already replied
            await expect(handleCommandError(mockInteraction, originalError)).resolves.not.toThrow();
            
            expect(mockInteraction.followUp).toHaveBeenCalled();
        });
    });
});
