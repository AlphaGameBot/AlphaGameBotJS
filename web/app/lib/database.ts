// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PrismaClient } from "@prisma/client";

declare global {
    interface Window {
        _prismaClient?: PrismaClient;
    }
}

const client = new PrismaClient();

export default client;