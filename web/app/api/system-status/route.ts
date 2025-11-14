// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import client from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    if (client.$executeRaw`SELECT 1`.catch(() => null) === null) {
        return NextResponse.json({ status: "degraded" });
    }
    return NextResponse.json({ status: "operational" });
}