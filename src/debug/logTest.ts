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

import { loadDotenv } from "../utility/debug/dotenv.js";
import logger, { getLokiLogger } from "../utility/logging/logger.js";

await loadDotenv();
logger.verbose("This is a verbose log message.");
logger.debug("This is a debug log message.");
logger.http("This is an http log message.");
logger.info("This is an info log message.");
logger.warn("This is a warn log message.");
logger.error("This is an error log message.");

const lokiLogger = getLokiLogger("test");

lokiLogger.verbose("This is a verbose log message to Loki.");
lokiLogger.debug("This is a debug log message to Loki.");
lokiLogger.http("This is an http log message to Loki.");
lokiLogger.info("This is an info log message to Loki.");
lokiLogger.warn("This is a warn log message to Loki.");
lokiLogger.error("This is an error log message to Loki.");