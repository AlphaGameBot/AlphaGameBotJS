// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert
// 
//     Licensed under the GNU GPL v3 or later.
//     See <https://www.gnu.org/licenses/>.

import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "node:async_hooks";
import { Metrics, metricsManager } from "../services/metrics/metrics.js";
import { formatTime } from "./formatTime.js";
import { getLogger } from "./logging/logger.js";

const logger = getLogger("prisma/client");
const base = new PrismaClient();

/**
 * AsyncLocalStorage flag to prevent re-entrant Prisma instrumentation.
 * Used to detect when the call stack is already inside a Prisma query.
 */
const prismaCallContext = new AsyncLocalStorage<boolean>();

export interface PrismaQueryContext {
    model?: string;
    operation: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: (args: any) => Promise<any>;
}

/**
 * Extended Prisma client with query instrumentation.
 * Measures duration, emits metrics, and logs queries.
 */
const prisma = base.$extends({
    query: {
        async $allOperations(args: PrismaQueryContext) {
            // Prevent re-entrant calls (e.g. if logging or metrics call Prisma again)
            if (prismaCallContext.getStore()) {
                // Note: Damien: November 13, 2025
                // -> It is absolutely crucial that we bind the query function to the base client here.
                //    Failing to do so causes infinite recursion because `args.query` would call
                //    back into this extended client, triggering the instrumentation again.
                //    This'll overflow the stack and lead to infinite regress.
                //    DO NOT remove this binding!
                return await args.query.bind(base)(args);
            }

            return await prismaCallContext.run(true, async () => {
                const start = performance.now();

                // 🧠 FIX: Run on the *base client*, not `args.query`, to avoid recursion
                // model may be undefined — coerce to string for lookup and metrics
                const model = String(args.model ?? "unknown");

                // operation comes in as string; ensure it's a key of the model client at runtime
                const operationKey = String(args.operation);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const modelClient = (base as any)[model];

                if (!modelClient || typeof modelClient[operationKey] !== "function") {
                    // If the model or operation doesn't exist on the client, log and call through
                    logger.warn(`Prisma client missing model/operation: ${operationKey} on ${model}`);

                    // Call the original query as a fallback and then record duration/metrics
                    const fallbackResult = await args.query(args);
                    const duration = performance.now() - start;

                    metricsManager.submitMetric<Metrics.DATABASE_OPERATION>(
                        Metrics.DATABASE_OPERATION,
                        {
                            model,
                            operation: operationKey,
                            durationMs: duration,
                        }
                    );

                    logger.verbose(
                        `Executed Prisma query: ${String(operationKey)} on ${String(model)} in ${formatTime(duration)}ms`,
                        {
                            model,
                            operation: operationKey,
                            duration,
                            args: args.args,
                        }
                    );

                    return fallbackResult;
                }

                const result = await modelClient[operationKey](args.args);

                const duration = performance.now() - start;

                // Emit metrics
                metricsManager.submitMetric<Metrics.DATABASE_OPERATION>(
                    Metrics.DATABASE_OPERATION,
                    {
                        model,
                        operation: operationKey,
                        durationMs: duration,
                    }
                );

                // Verbose logging (safe — doesn’t contain query text or huge data)
                logger.verbose(
                    `Executed Prisma query: ${String(operationKey)} on ${String(model)} in ${formatTime(duration)}`,
                    {
                        model,
                        operation: operationKey,
                        duration,
                        args: args.args,
                    }
                );

                return result;
            });
        },
    },
});

export default prisma;
