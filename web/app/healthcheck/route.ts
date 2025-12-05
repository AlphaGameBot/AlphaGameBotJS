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

import client from "../lib/database";

interface HealthcheckResponse {
    status: string;
    msg: string;
    version: string;
    git_sha: string;
    uptime: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    },
    since_last_build: {
        timestamp: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }
    components: Array<{
        name: string;
        status: string;
        error?: string;
    }>;
}

export async function GET() {
    const data: HealthcheckResponse = {
        status: "ok",
        msg: "AlphaGameBot web is running",
        version: process.env.VERSION || "unknown",
        git_sha: process.env.GIT_SHA || "unknown",
        components: [],
        uptime: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        },
        since_last_build: {
            timestamp: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    };

    data.uptime.seconds = Math.floor(process.uptime());
    data.uptime.minutes = Math.floor(data.uptime.seconds / 60);
    data.uptime.hours = Math.floor(data.uptime.minutes / 60);
    data.uptime.days = Math.floor(data.uptime.hours / 24);
    data.uptime.seconds %= 60;
    data.uptime.minutes %= 60;
    data.uptime.hours %= 24;

    const buildTimestamp = process.env.BUILD_TIMESTAMP ? parseInt(process.env.BUILD_TIMESTAMP, 10) : null;
    if (buildTimestamp) {
        const sinceBuildSeconds = Math.floor(Date.now() / 1000) - buildTimestamp;
        data.since_last_build.seconds = sinceBuildSeconds;
        data.since_last_build.minutes = Math.floor(sinceBuildSeconds / 60);
        data.since_last_build.hours = Math.floor(data.since_last_build.minutes / 60);
        data.since_last_build.days = Math.floor(data.since_last_build.hours / 24);
        data.since_last_build.seconds %= 60;
        data.since_last_build.minutes %= 60;
        data.since_last_build.hours %= 24;
    }
    // test database connection
    try {
        const dbResult = await client.$queryRaw`SELECT 1`;
        if (dbResult) {
            data.components.push({ name: "database", status: "ok" });
        }
    } catch (error) {
        data.components.push({ name: "database", status: "error", error: (error as Error).message });
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}