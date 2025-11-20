/* eslint-disable no-undef */
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

/**
 * Generates the humans.txt content
 * @param {Object} data
 * @param {Array} data.contributors - List of contributors
 * @param {Array} data.prodDeps - Production dependencies
 * @param {Array} data.devDeps - Development dependencies
 * @param {string} data.quote - Random quote
 * @returns {string}
 */
function generateHumansTxt({ contributors, prodDeps, devDeps, quote, gitHash, gitHashDate, gitBranch, webVersion, botVersion }) {
    const depsStr = prodDeps
        .map(dep => {
            const usedByStr = dep.usedBy.join(", ");
            return `\t\t${dep.name} (Used by: ${usedByStr})`;
        })
        .join("\n");

    const devDepsStr = devDeps
        .map(dep => {
            const usedByStr = dep.usedBy.join(", ");
            return `\t\t${dep.name} (Used by: ${usedByStr})`;
        })
        .join("\n");

    const contributorsStr = contributors
        .filter(c => !c.name.includes("bot"))
        .map(c => {
            const email = c.email
                .replace("@", " (at) ")
                .replace(".", " (dot) ");
            return `\t${c.name} <${email}> with ${c.commits} commits`;
        })
        .join("\n");

    const quoteFormatted = quote
        .split("\n")
        .map(line => " * " + line)
        .join("\n");

    return `
  ______   __            __                   ______                                     _______               __     
 /      \\ /  |          /  |                 /      \\                                   /       \\             /  |    
/$$$$$$  |$$ |  ______  $$ |____    ______  /$$$$$$  |  ______   _____  ____    ______  $$$$$$$  |  ______   _$$ |_   
$$ |__$$ |$$ | /      \\ $$      \\  /      \\ $$ | _$$/  /      \\ /     \\/    \\  /      \\ $$ |__$$ | /      \\ / $$   |  
$$    $$ |$$ |/$$$$$$  |$$$$$$$  | $$$$$$  |$$ |/    | $$$$$$  |$$$$$$ $$$$  |/$$$$$$  |$$    $$< /$$$$$$  |$$$$$$/   
$$$$$$$$ |$$ |$$ |  $$ |$$ |  $$ | /    $$ |$$ |$$$$ | /    $$ |$$ | $$ | $$ |$$    $$ |$$$$$$$  |$$ |  $$ |  $$ | __ 
$$ |  $$ |$$ |$$ |__$$ |$$ |  $$ |/$$$$$$$ |$$ \\__$$ |/$$$$$$$ |$$ | $$ | $$ |$$$$$$$$/ $$ |__$$ |$$ \\__$$ |  $$ |/  |
$$ |  $$ |$$ |$$    $$/ $$ |  $$ |$$    $$ |$$    $$/ $$    $$ |$$ | $$ | $$ |$$       |$$    $$/ $$    $$/   $$  $$/ 
$$/   $$/ $$/ $$$$$$$/  $$/   $$/  $$$$$$$/  $$$$$$/   $$$$$$$/ $$/  $$/  $$/  $$$$$$$/ $$$$$$$/   $$$$$$/     $$$$/  
              $$ |    
              $$ |    Web Version: ${webVersion}
              $$/     Bot Version: ${botVersion}
              $/      Git: ${gitBranch}@${gitHash}, dated ${gitHashDate}

  Also, make sure to check out the humans.html file! It's way cooler.
 ______________________________________
< Made on earth by humans, for humans. >
 --------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||


/*
${quoteFormatted}
*/

/* PROJECT LEAD */
    Damien Boisvert <damien (at) alphagame (dot) dev>

/* CONTRIBUTORS */
${contributorsStr}

/* THANKS TO */
    The creators of the open source projects we use.
    ... and you, for using AlphaGameBot!

/* DEPENDENCIES */
    /* Production Dependencies */
${depsStr}
    /* Development Dependencies */
${devDepsStr}

Made with ♥ in Novato, California, and wherever our contributors are.
`;
}

module.exports = { generateHumansTxt };
