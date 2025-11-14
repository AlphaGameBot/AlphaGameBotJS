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

import { readFileSync } from "fs";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { formatTime } from "../../../../utility/formatTime.js";
import { getLogger } from "../../../../utility/logging/logger.js";
import { Metrics, metricsManager } from "../../metrics.js";

const logger = getLogger("metrics/http");

export class MetricsHTTPServer {
    protected server: ReturnType<typeof createServer>;
    protected routeMap: Map<string, (req: IncomingMessage, res: ServerResponse) => Promise<void>>;
    private exportFunction: () => Promise<string>;
    private serverString: string;

    public startServer: typeof this.server.listen;
    constructor(exportFunction: () => Promise<string>) {
        logger.verbose("Initializing MetricsHTTPServer");
        this.routeMap = new Map();
        this.server = createServer();
        this.startServer = this.server.listen.bind(this.server);
        this.exportFunction = exportFunction;
        this.serverString = `AlphaGameBot/${process.env.VERSION || "unknown"}; NodeJS/${process.version}; node-http/${process.version}`;

        this.registerRoute("GET", "/metrics", this.routeMetrics.bind(this));

        this.server.on("request", this.handleRequest.bind(this));
    }

    async handleRequest(req: IncomingMessage, res: ServerResponse) {
        const startTime = performance.now();

        res.setHeader("Server", this.serverString);
        logger.verbose(`${req.method} ${req.url} from ${req.socket.remoteAddress || "unknown address"}`);

        const routeKey = this.getRouteKey(req.method || "GET", req.url || "/");
        const handler = this.routeMap.get(routeKey);

        if (handler) {
            await handler(req, res);
        } else {
            await this.routeNotFound(req, res);
        }
        // Above 200, inclusive, and below 400, exclusive, is considered successful (200 to 399 per HTTP spec)
        // realistically we only serve 200 and 404 here, but future-proofing.
        (res.statusCode >= 200 && res.statusCode < 400
            ? logger.info
            : logger.warn
        )(`${req.method} ${req.url} - ${res.statusCode} - ${formatTime(performance.now() - startTime)}`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            durationMs: performance.now() - startTime
        });

        metricsManager.submitMetric<Metrics.METRICS_HTTP_SERVER_REQUESTS>(Metrics.METRICS_HTTP_SERVER_REQUESTS, {
            method: req.method || "UNKNOWN",
            url: req.url || "UNKNOWN",
            remoteAddress: req.socket.remoteAddress || "UNKNOWN",
            statusCode: res.statusCode || 0,
            durationMs: performance.now() - startTime
        });
    }


    registerRoute(method: string, route: string, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>) {
        this.routeMap.set(
            this.getRouteKey(method, route),
            handler
        );
        logger.verbose(`Registered route: [${method}] ${route}`);
    }

    async routeMetrics(req: IncomingMessage, res: ServerResponse) {
        try {
            const metrics = await this.exportFunction();
            res.writeHead(200, {
                "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
            });
            res.end(metrics);
        } catch (err) {
            logger.error("Error collecting metrics:", err);
            res.writeHead(500);
            res.end("Error collecting metrics");
        }
    }

    async routeNotFound(req: IncomingMessage, res: ServerResponse) {
        const startTime = performance.now();
        res.writeHead(404, {
            "Content-Type": "text/html"
        });

        let templateData: Buffer;
        try {
            templateData = readFileSync(process.env.NODE_ENV === "production"
                ? "./assets/metrics-server-404.html"
                : "../assets/metrics-server-404.html");
        } catch (err) {
            logger.error("Error reading 404 template file:", err);
            res.end("404 Not Found, and additionally, an error occurred while trying to load the 404 page. (Cannot read template file)");
            return;
        }

        const pageContent = templateData.toString()
            .replace("{{SERVER}}", this.serverString)
            .replace("{{PATH}}", req.url || "/unknown")
            .replace("{{RENDER_TIME}}", formatTime(performance.now() - startTime));

        res.end(pageContent);
    }

    protected getRouteKey(method: string, route: string): string {
        return `${method.toUpperCase()}|${route}`;
    }
}