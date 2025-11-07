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

import type { error_reports } from "@prisma/client";
import type { Guild, Interaction, User } from "discord.js";

export interface UserComments {
    whatHappened?: string;
    stepsToReproduce?: string;
    additionalInfo?: string;
}

export interface ErrorReportOptions {
    databaseRow: error_reports,
    user: User,
    interaction?: Interaction | undefined,
    guild?: Guild | null,
    error: unknown,
    userComments?: UserComments
}

export interface TemplateOptions {
    report: {
        id: string;
    };
    reporter: {
        username: string;
        discriminator: string;
        id: string;
    };
    guild: {
        de: string;
    };
    environment: {
        nodeVersion: string;
        nodeEnv: string;
        discordJsVersion: string;
    };
    userComments: UserComments;
    timestamp: string;
    databaseRecordId: string;
    errorType: string;
    errorMessage: string;
    errorStack: string;
}