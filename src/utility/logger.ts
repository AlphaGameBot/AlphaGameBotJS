// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free softws are: you can redistribute it and/or modify
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

import { createLogger, format, Logger, transports } from "winston";

export enum LoggerNames {
    METRICS = "metrics"
}

const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    // [file:line] [level]: message
    format: format.combine(
        process.env.NODE_ENV !== "production" ? format.colorize() : format.uncolorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...metadata }): string => {
            const shouldIncludeTimestamp = process.env.NODE_ENV !== "production";

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
        new (transports.Console)()
    ]
});

export function getLogger(name: string): Logger {
    return logger.child({ label: name });
}

export default logger;