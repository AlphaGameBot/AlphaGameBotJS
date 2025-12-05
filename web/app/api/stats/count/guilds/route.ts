// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import client from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    const count = await client.guild.count();
    return NextResponse.json({ count });
}