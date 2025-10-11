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