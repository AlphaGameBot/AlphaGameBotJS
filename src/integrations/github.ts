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

import { Octokit } from "@octokit/rest";
import { getLogger } from "../utility/logging/logger.js";

export interface GitHubReporterOptions {
    owner: string;
    repo: string;
    token: string;
}

const ghLogger = getLogger("github");
const logger = getLogger("integrations/GitHubReporter");

export class GitHubReporter {
    private owner: string;
    private repo: string;
    private octokit: Octokit;

    constructor({ owner, repo, token }: GitHubReporterOptions) {
        this.owner = owner;
        this.repo = repo;
        this.octokit = new Octokit({
            auth: token,
            userAgent: "AlphaGameBot (spam@alphagamebot.com); curl/8.4.0",
            log: {
                debug: (msg: string) => ghLogger.debug(msg),
                info: (msg: string) => ghLogger.info(msg),
                warn: (msg: string) => ghLogger.warn(msg),
                error: (msg: string) => ghLogger.error(msg),
            }
        });
    }

    async createIssue(title: string, body: string, labels: string[] = ["auto-report"]): Promise<{ number: number; url: string }> {
        logger.debug(`Creating GitHub issue: ${title}`);
        const { data } = await this.octokit.rest.issues.create({
            owner: this.owner,
            repo: this.repo,
            title,
            body,
            labels,
        });
        logger.info(`Created GitHub issue #${data.number}: "${data.title}" - ${data.html_url}`, { metadata: data });
        return {
            number: data.number,
            url: data.html_url,
        };
    }
}