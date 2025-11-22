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

import { EmbedBuilder } from "discord.js";
import TransportStream from "winston-transport";

function safeJSONStringify(value: unknown): string {
    try {
        return JSON.stringify(value, (_key, val) => typeof val === 'bigint' ? val.toString() : val, 2) ?? '';
    } catch (err) {
        try {
            return String(value);
        } catch {
            return '<unserializable>';
        }
    }
}

function level2emoji(level: string): string {
    switch (level) {
        case "error": return "🔴";
        case "warn": return "🟠";
        case "info": return "🔵";
        case "http": return "🟣";
        case "debug": return "🟢";
        case "verbose": return "⚪";
        default: return "⚫";
    }
}

export class EngineeringOpsTransport extends TransportStream {
    constructor(opts?: TransportStream.TransportStreamOptions) {
        if (!process.env.ERROR_WEBHOOK_URL && process.env.NODE_ENV === "production") {
            throw new Error("ERROR_WEBHOOK_URL is not set");
        }
        super(opts);
    }


    async log(info: { level: string; message: string; meta?: Record<string, unknown> }, callback: () => void): Promise<void> {
        this.emit('logged', info);

        const { level, message, ...meta } = info;

        // Only attempt webhook for warn/error in production when URL is set
        if (level.includes("error") || level.includes("warn")) {
            if (!process.env.ERROR_WEBHOOK_URL || process.env.NODE_ENV !== "production") {
                // Still signal completion to Winston
                callback();
                return;
            }

            let ping = "";
            if (process.env.ENGINEERING_OPS_DISCORD_ID && level.includes('error')) {
                ping = ` <@${process.env.ENGINEERING_OPS_DISCORD_ID}> `;
            }
            const embed = new EmbedBuilder()
                .setTitle(level2emoji(level) + " " + level.toUpperCase())
                .setDescription(message)
                .addFields(
                    { name: 'Meta', value: safeJSONStringify(meta) }
                )
                .toJSON();

            try {
                await fetch(process.env.ERROR_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        // fire off the embed 
                        embeds: [embed],
                        content: ping
                    })
                });
            } catch (err) {
                // Prevent transport errors from breaking the app/logging pipeline
                // eslint-disable-next-line no-console
                console.error("EngineeringOpsTransport: webhook send failed:", err);
            } finally {
                // Always call the callback so Winston knows the transport finished
                try { callback(); } catch {
                    /* noop */
                }
            }
        } else {
            // For non-warn/error levels, just finish immediately
            try { callback(); } catch {
                /* noop */
            }
        }
    }
}
