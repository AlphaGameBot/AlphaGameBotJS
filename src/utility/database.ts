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

// Note: @prisma/client is generated. Make sure to run `npx prisma generate` after modifying the schema.
import { PrismaClient } from "@prisma/client";
import { formatTime } from "./formatTime.js";
import { getLogger } from "./logging/logger.js";

const logger = getLogger("prisma/client");
const base: PrismaClient = new PrismaClient();


const prisma = base.$extends({
    query: {
        async $allOperations({ operation, model, args, query }) {
            const start = performance.now();
            const result = await query(args);
            const end = performance.now();
            const time = end - start;
            logger.verbose(`Executed Prisma query: ${operation} on ${model} in ${formatTime(time)}ms`, { operation, model, args, duration: time });
            return result;
        },
    }
});
export default prisma;