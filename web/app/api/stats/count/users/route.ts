// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use server";

import client from "@/app/lib/database";

export async function GET() {
    const count = await client.user_stats.count();

    return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
    });
}