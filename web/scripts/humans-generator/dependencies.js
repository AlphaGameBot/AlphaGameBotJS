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

const { readFileSync } = require("node:fs");

/**
 * @typedef {Object} DependencyInfo
 * @property {string} name - Dependency name
 * @property {string[]} usedBy - Array of packages using this dependency
 * @property {string} version - Version string
 */

/**
 * Collects dependencies from all package.json files in the monorepo
 * @param {string} webDir - Path to web directory
 * @returns {{prodDeps: DependencyInfo[], devDeps: DependencyInfo[]}}
 */
function getDependencies(webDir, webPackageJsonPath, botPackageJsonPath, rootPackageJsonPath) {
    const dependencyMap = new Map();

    /**
     * Add dependencies to the map
     * @param {Object} deps - Dependencies object
     * @param {string} packageName - Name of the package
     * @param {boolean} isDev - Whether these are dev dependencies
     */
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
        const botPackageJson = JSON.parse(
            readFileSync(botPackageJsonPath, "utf-8")
        );
        addDependencies(botPackageJson.dependencies, "bot", false);
        addDependencies(botPackageJson.devDependencies, "bot", true);
    } catch (error) {
        console.error("Error reading bot package.json:", error);
    }

    // Read web package.json
    try {
        const webPackageJson = JSON.parse(
            readFileSync(webPackageJsonPath, "utf-8")
        );
        addDependencies(webPackageJson.dependencies, "web", false);
        addDependencies(webPackageJson.devDependencies, "web", true);
    } catch (error) {
        console.error("Error reading web package.json:", error);
    }

    // Read root package.json
    try {
        const rootPackageJson = JSON.parse(
            readFileSync(rootPackageJsonPath, "utf-8")
        );
        addDependencies(rootPackageJson.dependencies, "root", false);
        addDependencies(rootPackageJson.devDependencies, "root", true);
    } catch (error) {
        console.error("Error reading root package.json:", error);
    }

    // Separate dependencies into prod and dev
    const prodDeps = [];
    const devDeps = [];

    for (const [depName, info] of dependencyMap.entries()) {
        const dep = { name: depName, usedBy: info.usedBy, version: info.version };
        if (info.isDev) {
            devDeps.push(dep);
        } else {
            prodDeps.push(dep);
        }
    }

    // Sort alphabetically
    prodDeps.sort((a, b) => a.name.localeCompare(b.name));
    devDeps.sort((a, b) => a.name.localeCompare(b.name));

    return { prodDeps, devDeps };
}

module.exports = { getDependencies };
