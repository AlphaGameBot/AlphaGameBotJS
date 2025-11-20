/* eslint-disable @typescript-eslint/no-require-imports */
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

const { quotes } = require("./quotes");

/**
 * Generates the humans.html content with interactive features
 * @param {Object} data
 * @param {Array} data.contributors - List of contributors
 * @param {Array} data.prodDeps - Production dependencies
 * @param {Array} data.devDeps - Development dependencies
 * @param {string} data.quote - Random quote
 * @returns {string}
 */
function generateHumansHtml({ contributors, prodDeps, devDeps, quote }) {
    const contributorRows = contributors
        .filter(c => !c.name.includes("bot"))
        .map(c => {
            const emailLink = `mailto:${c.email}`;
            return `
            <tr>
                <td>${c.name}</td>
                <td><a href="${emailLink}">${c.email}</a></td>
                <td>${c.commits}</td>
            </tr>`;
        })
        .join("");

    const prodDepsRows = prodDeps
        .map(dep => {
            const npmLink = `https://www.npmjs.com/package/${dep.name}`;
            const badges = dep.usedBy
                .map(pkg => `<span class="badge">${pkg}</span>`)
                .join(" ");
            return `
            <tr>
                <td><a href="${npmLink}" target="_blank" rel="noopener">${dep.name}</a></td>
                <td>${dep.version}</td>
                <td>${badges}</td>
            </tr>`;
        })
        .join("");

    const devDepsRows = devDeps
        .map(dep => {
            const npmLink = `https://www.npmjs.com/package/${dep.name}`;
            const badges = dep.usedBy
                .map(pkg => `<span class="badge">${pkg}</span>`)
                .join(" ");
            return `
            <tr>
                <td><a href="${npmLink}" target="_blank" rel="noopener">${dep.name}</a></td>
                <td>${dep.version}</td>
                <td>${badges}</td>
            </tr>`;
        })
        .join("");

    const quoteHtml = quote
        .split("\n")
        .map(line => line.trim() ? `<p>${line}</p>` : "")
        .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlphaGameBot - Humans</title>
    <style>
        body {
            font-family: monospace;
            max-width: 900px;
            margin: 2rem auto;
            padding: 1rem;
            line-height: 1.6;
        }
        h1, h2 { margin-top: 2rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
        th { font-weight: bold; }
        details { margin: 1rem 0; }
        summary { cursor: pointer; font-weight: bold; font-size: 1.1rem; }
        .badge { padding: 2px 6px; margin-right: 4px; border: 1px solid #666; border-radius: 3px; font-size: 0.85rem; }
        input { padding: 0.5rem; width: 100%; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <h1>AlphaGameBot - Humans</h1>
    <p><em>Made on Earth by humans, for humans</em></p>
    
    <blockquote id="quote">
        ${quoteHtml}
    </blockquote>
    
    <h2>Project Lead</h2>
    <p>Damien Boisvert - <a href="mailto:damien@alphagame.dev">damien@alphagame.dev</a></p>
    
    <details open>
        <summary>Contributors (${contributors.filter(c => !c.name.includes("bot")).length})</summary>
        <input type="text" id="contributor-search" placeholder="Search contributors...">
        <table id="contributors-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Commits</th>
                </tr>
            </thead>
            <tbody>
                ${contributorRows}
            </tbody>
        </table>
    </details>
    
    <details open>
        <summary>Production Dependencies (${prodDeps.length})</summary>
        <input type="text" id="prod-deps-search" placeholder="Search dependencies...">
        <table id="prod-deps-table">
            <thead>
                <tr>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Used By</th>
                </tr>
            </thead>
            <tbody>
                ${prodDepsRows}
            </tbody>
        </table>
    </details>
    
    <details>
        <summary>Development Dependencies (${devDeps.length})</summary>
        <input type="text" id="dev-deps-search" placeholder="Search dependencies...">
        <table id="dev-deps-table">
            <thead>
                <tr>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Used By</th>
                </tr>
            </thead>
            <tbody>
                ${devDepsRows}
            </tbody>
        </table>
    </details>
    
    <hr>
    <p><strong>Thanks to:</strong> The creators of the open source projects we use, and you, for using AlphaGameBot!</p>
    <p><em>Made with ♥ in Novato, California, and wherever our contributors are.</em></p>
    
    <script>
        function setupSearch(searchId, tableId) {
            const searchBox = document.getElementById(searchId);
            const table = document.getElementById(tableId);
            
            searchBox.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const quotes = ${JSON.stringify(quotes)};
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('quote').innerHTML = randomQuote.replace(/\\n/g, '<br>');
        });

        setupSearch('contributor-search', 'contributors-table');
        setupSearch('prod-deps-search', 'prod-deps-table');
        setupSearch('dev-deps-search', 'dev-deps-table');
    </script>
</body>
</html>`;
}

module.exports = { generateHumansHtml };
