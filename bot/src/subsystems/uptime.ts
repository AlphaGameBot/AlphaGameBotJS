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

import type { Logger } from "winston";
import { getLogger } from "../utility/logging/logger.js";

export class UptimeSubsystem {
    pollUrl: string;
    logger: Logger
    interval: number;
    job: NodeJS.Timeout | null = null;

    constructor() {
        this.logger = getLogger("subsystems/uptime");
        const url = process.env.UPTIME_POLL_URL;
        if (!url) {
            this.logger.warn("UPTIME_POLL_URL is not set; uptime polling will be disabled.");
            throw new Error("UPTIME_POLL_URL is not set");
        }
        this.pollUrl = url;

        const intervalEnv = process.env.UPTIME_POLL_INTERVAL_SECONDS;
        this.interval = intervalEnv ? parseInt(intervalEnv, 10) * 1000 : 30 * 1000; // default to 30 seconds
    }

    async begin() {
        this.logger.info(`Beginning uptime polling to ${this.pollUrl}`);
        await this.poll(); // Initial poll
        this.job = setInterval(() => {
            this.poll();
        }, this.interval);
    }

    close() {
        if (this.job) clearInterval(this.job);
        this.logger.info("Uptime polling stopped.");
    }

    async poll() {
        const data = {
            status: "up",
            msg: "AlphaGameBot is running",
            ping: ""
        }
        try {
            const queryParams = new URLSearchParams(data).toString();
            const url = `${this.pollUrl}?${queryParams}`;
            const response = await fetch(url, { method: "GET" });
            if (response.ok) {
                this.logger.debug(`Successfully polled uptime URL: ${url}`);
            } else {
                this.logger.warn(`Uptime polling to ${url} returned status ${response.status}`);
            }
        } catch (error) {
            this.logger.error(`Error polling uptime URL ${this.pollUrl}:`, error);
        }
    }
}