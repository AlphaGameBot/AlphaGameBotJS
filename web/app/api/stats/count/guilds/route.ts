// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { NextResponse } from "next/server";

export async function GET() {
    const count = 25;

    return NextResponse.json({ count });
}