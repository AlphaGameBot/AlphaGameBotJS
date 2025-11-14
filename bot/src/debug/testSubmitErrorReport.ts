/* eslint-disable no-console */
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

import type { Guild, Interaction, User } from "discord.js";
import reportIssueViaGitHub from "../subsystems/error-reporting/issue.js";

const testError = new Error("This is a test error from the debug script");
testError.stack = `Error: This is a test error from the debug script
    at Object.<anonymous> (/home/damien/Documents/AlphaGameBotJS/src/debug/testSubmitErrorReport.ts:23:19)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1310:10)`;

const testErrorReport = {
    databaseRow: {
        id: 69,
        user_id: "123456789012345678",
        guild_id: "987654321098765432",
        error_msg: testError.message,
        created_at: new Date()
    },
    user: {
        id: "123456789012345678",
        username: "TestUser",
        discriminator: "0001",
        tag: "TestUser#0001"
    } as User,
    guild: {
        id: "987654321098765432",
        name: "Test Guild"
    } as Guild,
    interaction: {
        commandName: "test-command",
        id: "1234567890123456789",
        type: 2,
        channelId: "987654321098765432",
        guildId: "987654321098765432",
        applicationId: "111111111111111111",
        user: {
            id: "123456789012345678",
            username: "TestUser",
            discriminator: "0001"
        },
        createdTimestamp: Date.now()
    } as Interaction,
    error: testError,
    userComments: {
        whatHappened: "This is a test error report submitted via the debug script. Please ignore this issue!"
    }
};

try {
    const result = await reportIssueViaGitHub(testErrorReport);
    console.log("✅ Issue reported successfully!");
    console.log(`Issue Number: ${result.number}`);
    console.log(`Issue URL: ${result.url}`);
    process.exit(0);
} catch (error) {
    console.error("❌ Failed to report issue:", error);
    process.exit(1);
}