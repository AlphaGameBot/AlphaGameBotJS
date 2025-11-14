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

import { getRandomValues } from "node:crypto";
import { loadDotenv } from "../utility/debug/dotenv.js";
import logger, { getLokiLogger } from "../utility/logging/logger.js";
await loadDotenv();

const randomHex = (len = 8) =>
    Array.from(getRandomValues(new Uint8Array(len / 2 || 4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, len);

const createRandomMeta = (): Record<string, unknown> => ({
    traceId: `trace-${randomHex(16)}`,
    requestId: `req-${randomHex(12)}`,
    sessionId: `sess-${randomHex(10)}`,
    user: {
        id: `u-${Math.floor(Math.random() * 1_000_000)}`,
        name: `user${Math.floor(Math.random() * 10000)}`,
    },
    tags: ["debug", "random", `tag-${Math.floor(Math.random() * 100)}`],
    timestamp: new Date().toISOString(),
    samplingScore: Math.random(),
});

logger.verbose("This is a verbose log message.", createRandomMeta());
logger.debug("This is a debug log message.", createRandomMeta());
logger.info("This is an info log message.", createRandomMeta());
logger.warn("This is a warn log message.", createRandomMeta());
logger.error("This is an error log message.", createRandomMeta());

const lokiLogger = getLokiLogger("test");

lokiLogger.verbose("This is a verbose log message to Loki.", createRandomMeta());
lokiLogger.debug("This is a debug log message to Loki.", createRandomMeta());
lokiLogger.info("This is an info log message to Loki.", createRandomMeta());
lokiLogger.warn("This is a warn log message to Loki.", createRandomMeta());
lokiLogger.error("This is an error log message to Loki.", createRandomMeta());