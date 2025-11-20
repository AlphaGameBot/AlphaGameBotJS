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

const quotes = [
    "If you want to go fast, go alone\nIf you want to go far, go together.\n-- African Proverb",
    "Alone we can do so little; together we can do so much.\n-- Helen Keller",
    "It is the long history of mankind...\n\nthat those who learned to collaborate and improvise\nmost effectively have prevailed.\n-- Charles Darwin",
    "Coming together is a beginning;\nkeeping together is progress;\nworking together is success.\n-- Henry Ford",
    "The best way to predict the future is to create it together.\n-- Joe Echevarria",
];

/**
 * Get a random inspirational quote
 * @returns {string}
 */
function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

module.exports = { getRandomQuote, quotes };
