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

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import { GitHubReporter } from "../../integrations/github.js";
import { getLogger } from "../../utility/logging/logger.js";
import type { ErrorReportOptions } from "./interfaces.js";

const logger = getLogger("subsystems/error-reporting");

function findTemplateFile(): string {
    // Go up two levels from this file to reach project root, then into assets/
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, "../../../assets/error-report-template.md.njk");
    logger.debug("[debug] looking for: " + templatePath);

    if (!existsSync(templatePath)) {
        throw new Error(`Error report template not found at path: ${templatePath}`);
    }

    return templatePath;
}

let ERROR_REPORT_TEMPLATE_FILE = findTemplateFile();
if (!existsSync(ERROR_REPORT_TEMPLATE_FILE)) {
    logger.warn(`Error report template not found after searching parent directories: ${ERROR_REPORT_TEMPLATE_FILE}`);
}


const GH_PAT = process.env.GITHUB_PAT;

if (!GH_PAT) {
    logger.warn("GitHub Personal Access Token (GITHUB_PAT) is not set. Error reporting via GitHub will be disabled.");
}

const templatesDir = path.dirname(ERROR_REPORT_TEMPLATE_FILE);
nunjucks.configure(templatesDir, { autoescape: false });


const github = new GitHubReporter({
    owner: "AlphaGameBot",
    repo: "Issues",
    token: GH_PAT || ""
});

/**
 * Reports an issue to GitHub.
 * 
 * @param args Options for reporting the issue.
 */
export default async function reportIssueViaGitHub(args: ErrorReportOptions): Promise<{ number: number; url: string }> {
    // If no GH token is configured, log and return a dummy success so callers
    // (UI interactions) don't fail for end users in development environments.
    logger.error("Reporting issue to GitHub...", args);
    ERROR_REPORT_TEMPLATE_FILE = findTemplateFile();
    if (!GH_PAT) {
        logger.warn("GITHUB_PAT not set — skipping actual GitHub report and returning dummy response.");

        // Return a dummy issue number/URL so callers can proceed.
        return { number: -1, url: "" };
    }

    if (!existsSync(ERROR_REPORT_TEMPLATE_FILE)) {
        throw new Error(`Error report template fimle not found at path: ${ERROR_REPORT_TEMPLATE_FILE}`);
    }

    const templateContent = await nunjucks.render("error-report-template.md.njk", {
        report: args.databaseRow,
        user: args.user,
        guild: args.guild,
        error: args.error,
        comments: args.userComments
    });

    logger.info(`Reporting issue to GitHub for error report ID: ${args.databaseRow.id}`);
    logger.info(templateContent);

    // dummy return
    return { number: 0, url: "" };
}