// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use server";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.redirect(new URL('https://discord.com/api/oauth2/authorize?client_id=946533554953809930', request.url));
}