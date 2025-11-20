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

const { execSync } = require("node:child_process");
const { writeFileSync, readFileSync } = require("node:fs");
const path = require("node:path");


const publicDir = path.join(process.cwd(), "public");
const humansFilePath = path.join(publicDir, "humans.txt");

// Get commit counts per author/email pair
const raw = execSync(
    `git log --format="%aN <%aE>" --no-merges --all | sort | uniq -c | sort -nr`,
    { encoding: "utf8" }
);

// Map to track which packages use each dependency
// Structure: { "dependency-name": { usedBy: ["bot", "web"], isDev: boolean } }
const dependencyMap = new Map();

// Helper function to add dependencies to the map
function addDependencies(deps, packageName, isDev) {
    if (!deps) return;

    for (const [depName, version] of Object.entries(deps)) {
        if (!dependencyMap.has(depName)) {
            dependencyMap.set(depName, { usedBy: [], isDev, version });
        }
        const entry = dependencyMap.get(depName);
        if (!entry.usedBy.includes(packageName)) {
            entry.usedBy.push(packageName);
        }
        // If any package uses it as a prod dep, mark it as prod
        if (!isDev) {
            entry.isDev = false;
        }
    }
}

// Read bot package.json
try {
    const agb_package_json_text = readFileSync(path.join(process.cwd(), "..", "bot", "package.json"), "utf-8");
    const agb_package_json = JSON.parse(agb_package_json_text);
    addDependencies(agb_package_json.dependencies, "bot", false);
    addDependencies(agb_package_json.devDependencies, "bot", true);
} catch (error) {
    console.error("Error reading bot package.json:", error);
}

// Read web package.json
try {
    const web_package_json_text = readFileSync(path.join(process.cwd(), "..", "web", "package.json"), "utf-8");
    const web_package_json = JSON.parse(web_package_json_text);
    addDependencies(web_package_json.dependencies, "web", false);
    addDependencies(web_package_json.devDependencies, "web", true);
} catch (error) {
    console.error("Error reading web package.json:", error);
}

// Read root package.json
try {
    const root_package_json_text = readFileSync(path.join(process.cwd(), "..", "package.json"), "utf-8");
    const root_package_json = JSON.parse(root_package_json_text);
    addDependencies(root_package_json.dependencies, "root", false);
    addDependencies(root_package_json.devDependencies, "root", true);
} catch (error) {
    console.error("Error reading root package.json:", error);
}

// Each line looks like: "  153  Damien Boisvert <email>"
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

// Separate dependencies into prod and dev
const prodDeps = [];
const devDeps = [];

for (const [depName, info] of dependencyMap.entries()) {
    if (info.isDev) {
        devDeps.push({ name: depName, usedBy: info.usedBy });
    } else {
        prodDeps.push({ name: depName, usedBy: info.usedBy });
    }
}

// Sort alphabetically
prodDeps.sort((a, b) => a.name.localeCompare(b.name));
devDeps.sort((a, b) => a.name.localeCompare(b.name));

let depsStr = "";
for (const dep of prodDeps) {
    const usedByStr = dep.usedBy.join(", ");
    depsStr += `\t\t${dep.name} (Used by: ${usedByStr})\n`;
}

let devDepsStr = "";
for (const dep of devDeps) {
    const usedByStr = dep.usedBy.join(", ");
    devDepsStr += `\t\t${dep.name} (Used by: ${usedByStr})\n`;
}

const quotes = [
    "If you want to go fast, go alone\nIf you want to go far, go together.\n-- African Proverb",
    "Alone we can do so little; together we can do so much.\n-- Helen Keller",
    "It is the long history of mankind...\n\nthat those who learned to collaborate and improvise\nmost effectively have prevailed.\n-- Charles Darwin",
    "Coming together is a beginning;\nkeeping together is progress;\nworking together is success.\n-- Henry Ford",
    "The best way to predict the future is to create it together.\n-- Joe Echevarria",
]

const humansFileContent = `
 ______________________________________
< Made on earth by humans, for humans. >
 --------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||


/*
${quotes[Math.floor(Math.random() * quotes.length)].split("\n").map(line => " * " + line).join("\n")}
*/

/* PROJECT LEAD */
    Damien Boisvert <damien (at) alphagame (dot) dev>

/* CONTRIBUTORS */
${contributors.filter(c => !c.name.includes("bot")).map(c => `\t${c.name} <${c.email
    .replace("@", " (at) ")
    .replace(".", " (dot) ")}> with ${c.commits} commits`).join("\n")}

/* THANKS TO */
    The creators of the open source projects we use.
    ... and you, for using AlphaGameBot!

/* DEPENDENCIES */
    /* Production Dependencies */
${depsStr}
    /* Development Dependencies */
${devDepsStr}

Made with ♥ in Novato, California, and wherever our contributors are.
    `.trim();

writeFileSync(humansFilePath, humansFileContent, "utf-8");
console.log(`Generated humans.txt with ${contributors.length} contributors.`);