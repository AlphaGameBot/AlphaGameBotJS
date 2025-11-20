#! /usr/bin/env node
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

const { writeFileSync, readFileSync } = require("node:fs");
const path = require("node:path");

// Import our modular components
const { getContributors } = require("./humans-generator/contributors.js");
const { getDependencies } = require("./humans-generator/dependencies.js");
const { getRandomQuote } = require("./humans-generator/quotes.js");
const { generateHumansTxt } = require("./humans-generator/txt-generator.js");
const { generateHumansHtml } = require("./humans-generator/html-generator.js");
const { execSync } = require("node:child_process");

function verbose(...args) {
    if (process.env.VERBOSE_HUMANS_GENERATION) {
        console.log(...args);
    }
}
function main() {
    if (process.env.SKIP_HUMANS_GENERATION) {
        console.log("⚠️  Skipping humans.txt and humans.html generation due to SKIP_HUMANS_GENERATION env variable.");
        return;
    }

    const publicDir = path.join(process.cwd(), "public");
    const humansTxtPath = path.join(publicDir, "humans.txt");
    const humansHtmlPath = path.join(publicDir, "humans.html");

    verbose("🔍 Gathering project data...");

    // Collect all the data
    const contributors = getContributors();
    verbose(`✓ Found ${contributors.length} contributors`);

    // read from argv, otherwise use defaults
    const webPackageJsonPath = process.argv[2] || path.join(process.cwd(), "package.json");
    const botPackageJsonPath = process.argv[3] || path.join(process.cwd(), "..", "bot", "package.json");
    const rootPackageJsonPath = process.argv[4] || path.join(process.cwd(), "..", "package.json");

    const webVersion = JSON.parse(readFileSync(webPackageJsonPath, "utf-8")).version;
    const botVersion = JSON.parse(readFileSync(botPackageJsonPath, "utf-8")).version;
    const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const rawGitDate = execSync(`git show -s --format=%ci ${gitHash}`, { encoding: "utf8" }).trim();
    let gitHashDate = rawGitDate;
    const m = rawGitDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
        const [, year, month, day] = m;
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        gitHashDate = `${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`;
    }
    const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();

    const { prodDeps, devDeps } = getDependencies(process.cwd(),
        webPackageJsonPath,
        botPackageJsonPath,
        rootPackageJsonPath
    );
    verbose(`✓ Found ${prodDeps.length} production dependencies`);
    verbose(`✓ Found ${devDeps.length} development dependencies`);

    const quote = getRandomQuote();
    verbose(`✓ Selected quote`);

    const data = {
        contributors,
        prodDeps,
        devDeps,
        quote,
        gitHash,
        gitHashDate,
        gitBranch,
        webVersion,
        botVersion
    };

    // Generate humans.txt
    verbose("\n📝 Generating humans.txt...");
    const humansTxtContent = generateHumansTxt(data);
    writeFileSync(humansTxtPath, humansTxtContent, "utf-8");
    console.log(`✓ Generated ${humansTxtPath}`);

    // Generate humans.html
    verbose("\n🌐 Generating humans.html...");
    const humansHtmlContent = generateHumansHtml(data);
    writeFileSync(humansHtmlPath, humansHtmlContent, "utf-8");
    console.log(`✓ Generated ${humansHtmlPath}`);

    verbose("\n✨ All done! Files generated successfully.");
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
