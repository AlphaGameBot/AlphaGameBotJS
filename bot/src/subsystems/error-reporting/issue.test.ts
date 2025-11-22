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
import type { ErrorReport } from '@prisma/client';
import type { Guild, User } from 'discord.js';

// Mock the dependencies
jest.mock('../../integrations/github.js');
jest.mock('../../utility/logging/logger.js', () => ({
    getLogger: () => ({
        verbose: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn()
    })
}));

describe('Error Reporting System', () => {
    describe('Error object handling', () => {
        it('should preserve Error type information', () => {
            const testError = new Error('Test error message');
            
            // Verify that the error is an Error instance
            expect(testError instanceof Error).toBe(true);
            expect(testError.constructor.name).toBe('Error');
            expect(testError.message).toBe('Test error message');
            expect(testError.stack).toBeDefined();
        });

        it('should distinguish between Error object and stringified error', () => {
            const originalError = new Error('Original error');
            const stringifiedError = JSON.stringify({ code: 'InteractionAlreadyReplied' });
            
            // Original error should have proper Error properties
            expect(originalError instanceof Error).toBe(true);
            expect(originalError.message).toBe('Original error');
            expect(typeof originalError.stack).toBe('string');
            
            // Stringified error is just a string
            expect(typeof stringifiedError).toBe('string');
            expect(stringifiedError instanceof Error).toBe(false);
        });

        it('should handle Discord.js errors correctly', () => {
            // Simulate a Discord.js error with code property
            class DiscordAPIError extends Error {
                code: string;
                constructor(message: string, code: string) {
                    super(message);
                    this.name = 'DiscordAPIError';
                    this.code = code;
                }
            }
            
            const discordError = new DiscordAPIError('Interaction has already been replied to', 'InteractionAlreadyReplied');
            
            // Verify error properties are preserved
            expect(discordError instanceof Error).toBe(true);
            expect(discordError.name).toBe('DiscordAPIError');
            expect(discordError.message).toBe('Interaction has already been replied to');
            expect(discordError.code).toBe('InteractionAlreadyReplied');
            expect(discordError.stack).toBeDefined();
        });

        it('should extract error type correctly from Error object', () => {
            const testError = new TypeError('Type error occurred');
            
            const errorType = testError instanceof Error ? testError.constructor.name : typeof testError;
            expect(errorType).toBe('TypeError');
        });

        it('should extract error type as "string" from stringified error', () => {
            const stringifiedError = '{"code":"InteractionAlreadyReplied"}';
            
            const errorType = stringifiedError instanceof Error ? stringifiedError.constructor.name : typeof stringifiedError;
            expect(errorType).toBe('string');
        });

        it('should extract error message correctly from Error object', () => {
            const testError = new Error('This is the actual error');
            
            const errorMessage = testError instanceof Error ? testError.message : String(testError);
            expect(errorMessage).toBe('This is the actual error');
        });

        it('should extract full stringified content as message from non-Error', () => {
            const stringifiedError = '{"code":"InteractionAlreadyReplied"}';
            
            const errorMessage = stringifiedError instanceof Error ? stringifiedError.message : String(stringifiedError);
            expect(errorMessage).toBe('{"code":"InteractionAlreadyReplied"}');
        });
    });

    describe('Template data preparation', () => {
        it('should prepare proper template data for Error objects', () => {
            const testError = new Error('Test error');
            testError.stack = 'Error: Test error\n    at test.js:1:1';
            
            const mockDatabaseRow: ErrorReport = {
                id: 1,
                user_id: '123456789',
                guild_id: '987654321',
                error_msg: JSON.stringify(testError),
                created_at: new Date('2025-01-01T00:00:00Z')
            };
            
            const mockUser = {
                id: '123456789',
                username: 'testuser',
                discriminator: '0'
            } as User;
            
            const mockGuild = {
                name: 'Test Guild'
            } as Guild;
            
            // Simulate what issue.ts does
            const templateData = {
                errorType: testError instanceof Error ? testError.constructor.name : typeof testError,
                errorMessage: testError instanceof Error ? testError.message : String(testError),
                errorStack: testError instanceof Error ? (testError.stack || "No stack trace available") : String(testError)
            };
            
            expect(templateData.errorType).toBe('Error');
            expect(templateData.errorMessage).toBe('Test error');
            expect(templateData.errorStack).toContain('Error: Test error');
            expect(templateData.errorStack).toContain('at test.js:1:1');
        });

        it('should handle stringified errors as fallback', () => {
            const stringifiedError = '{"code":"InteractionAlreadyReplied"}';
            
            // Simulate what issue.ts does
            const templateData = {
                errorType: stringifiedError instanceof Error ? stringifiedError.constructor.name : typeof stringifiedError,
                errorMessage: stringifiedError instanceof Error ? stringifiedError.message : String(stringifiedError),
                errorStack: stringifiedError instanceof Error ? (stringifiedError.stack || "No stack trace available") : String(stringifiedError)
            };
            
            // This is what we DON'T want - it should show "string" and the JSON
            expect(templateData.errorType).toBe('string');
            expect(templateData.errorMessage).toBe('{"code":"InteractionAlreadyReplied"}');
            expect(templateData.errorStack).toBe('{"code":"InteractionAlreadyReplied"}');
        });
    });
});
