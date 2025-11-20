/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
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

const { execSync } = require("node:child_process");

/**
 * Gets contributors from git history with commit counts
 * @returns {Array<{name: string, email: string, commits: number}>}
 */
function getContributors() {
    const raw = execSync(
        `git log --format="%aN <%aE>" --no-merges --all | sort | uniq -c | sort -nr`,
        { encoding: "utf8" }
    );

    const lines = raw
        .trim()
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    const contributors = lines.map(line => {
        // Extract count, name, and email
        // e.g. "153 Damien Boisvert <email>"
        const match = line.match(/^(\d+)\s+(.*)\s+<(.*)>$/);

        if (!match) return null;

        const commits = parseInt(match[1], 10);
        const name = match[2].trim();
        const email = match[3].trim();

        return { name, email, commits };
    }).filter(Boolean);

    return contributors;
}

module.exports = { getContributors };
