// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import client from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    const ok = await client.$executeRaw`SELECT 1`.catch(() => null);
    if (ok === null) {
        return NextResponse.json({ status: "degraded" });
    }
    return NextResponse.json({ status: "operational" });
}