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

import winston, { createLogger, format, Logger, transports } from "winston";
import LokiTransport from "winston-loki-strict";
import { loadDotenv } from "../debug/dotenv.js";
import { EngineeringOpsTransport } from "./customTransport.js";

await loadDotenv();

// Winston's default logger levels are bullshit.
const logConfig = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 4,
        debug: 3,
        silly: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'magenta',
    },
};
export enum LoggerNames {
    METRICS = "metrics"
}

function shouldWeUseColors(): boolean {
    return process.stdout.isTTY && !(process.env.NO_COLOR);
}

let loki: LokiTransport | null = null;

if (process.env.LOKI_URL) {
    loki = new LokiTransport({
        host: process.env.LOKI_URL ? process.env.LOKI_URL : "",
        json: false,
        format: format.combine(
            format.uncolorize(),
            format.json()
        ),
        batching: true,
        level: "debug",
        replaceTimestamp: true,
        labels: { service_name: "AlphaGameBot" }
    });
}

winston.addColors(logConfig.colors);

const rootLogger = createLogger({
    levels: logConfig.levels,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    // [file:line] [level]: message
    format: format.combine(
        shouldWeUseColors() ? format.colorize() : format.uncolorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...metadata }): string => {
            const shouldIncludeTimestamp = process.env.NODE_ENV === "production";

            let msg = "";

            if (shouldIncludeTimestamp) {
                msg += `[${timestamp}] `;
            }

            let levelText = "";

            if (metadata.label) {
                levelText += `[${metadata.label}/${level}]`;
            } else {
                levelText += `[${level}]`;
            }
            msg += `${levelText}: ${message}`;

            return msg;
        })
    ),
    transports: [
        new (transports.Console)({
            silent: process.env.NODE_ENV === "test"
        }),
        new (EngineeringOpsTransport)({
            level: "warn",
            format: format.uncolorize()
        }),
        new (EngineeringOpsTransport)({
            level: "error",
            format: format.uncolorize()
        }),
        ...((process.env.LOKI_URL && loki) ? [loki] : [])
    ]
});

const lokiLogger = createLogger({
    level: "debug",
    levels: logConfig.levels,
    format: format.combine(
        format.uncolorize(),
        format.timestamp(),
        format.json()
    ),
    transports: [
        ...(loki ? [loki] : [])
    ]
});

export function getLogger(name: string, ...options: unknown[]): Logger {
    return rootLogger.child({ label: name, ...options });
}

export function getLokiLogger(name: string, ...options: unknown[]): Logger {
    return lokiLogger.child({ label: name, ...options });
}
const logger = getLogger("root");

if (!loki) logger.warn("Loki logger is not configured.  Logs sent will be black-holed.");

logger.info("Using loki instance: " + (process.env.LOKI_URL ?? "none") + "  (THIS SHOULD NOT HAVE A TRAILING SLASH!)");
if (!process.stdout.isTTY) logger.warn("Output doesn't seem to be a TTY.  Several features have been disabled.");
if (!process.env.LOKI_URL && process.env.NODE_ENV === "production") logger.warn("LOKI_URL is not set.  Loki logging is disabled.");

export default logger;