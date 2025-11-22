"use server";

import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    const redirectUri = (base || '') + '/api/auth/callback';
    const scope = encodeURIComponent('identify');

    if (!clientId || !process.env.NEXT_PUBLIC_BASE_URL) {
        console.table({ clientId, processEnv: process.env.NEXT_PUBLIC_BASE_URL });
        return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
    }

    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&prompt=none`;
    return NextResponse.redirect(url);
}
