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

const { writeFileSync } = require("node:fs");
const path = require("node:path");

// Import our modular components
const { getContributors } = require("./humans-generator/contributors.js");
const { getDependencies } = require("./humans-generator/dependencies.js");
const { getRandomQuote } = require("./humans-generator/quotes.js");
const { generateHumansTxt } = require("./humans-generator/txt-generator.js");
const { generateHumansHtml } = require("./humans-generator/html-generator.js");

function main() {
    const publicDir = path.join(process.cwd(), "public");
    const humansTxtPath = path.join(publicDir, "humans.txt");
    const humansHtmlPath = path.join(publicDir, "humans.html");

    console.log("🔍 Gathering project data...");

    // Collect all the data
    const contributors = getContributors();
    console.log(`✓ Found ${contributors.length} contributors`);

    const { prodDeps, devDeps } = getDependencies(process.cwd());
    console.log(`✓ Found ${prodDeps.length} production dependencies`);
    console.log(`✓ Found ${devDeps.length} development dependencies`);

    const quote = getRandomQuote();
    console.log(`✓ Selected quote`);

    const data = {
        contributors,
        prodDeps,
        devDeps,
        quote
    };

    // Generate humans.txt
    console.log("\n📝 Generating humans.txt...");
    const humansTxtContent = generateHumansTxt(data);
    writeFileSync(humansTxtPath, humansTxtContent, "utf-8");
    console.log(`✓ Generated ${humansTxtPath}`);

    // Generate humans.html
    console.log("\n🌐 Generating humans.html...");
    const humansHtmlContent = generateHumansHtml(data);
    writeFileSync(humansHtmlPath, humansHtmlContent, "utf-8");
    console.log(`✓ Generated ${humansHtmlPath}`);

    console.log("\n✨ All done! Files generated successfully.");
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
