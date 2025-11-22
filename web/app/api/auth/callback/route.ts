import type { User } from 'discord.js';
import { NextRequest, NextResponse } from 'next/server';

async function fetchToken(code: string) {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: (process.env.NEXT_PUBLIC_BASE_URL || '') + '/api/auth/callback'
    });

    const res = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    return res.json();
}

async function fetchUser(access_token: string) {
    const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` }
    });
    return res.json() as unknown as User;
}

function createSessionCookie(user: User) {
    // Minimal session using JSON cookie. Keep small and short-lived.
    const payload = JSON.stringify({ user, iat: Date.now() });
    // Base64 encode
    const val = Buffer.from(payload).toString('base64');
    return `agb_session=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24};`;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/', req.url));

    try {
        const token = await fetchToken(code);
        if (token.error) throw token;

        const user = await fetchUser(token.access_token);

        const res = NextResponse.redirect(new URL('/', req.url));
        const cookie = createSessionCookie(user);
        res.headers.append('Set-Cookie', cookie);
        return res;
    } catch (err) {
        return NextResponse.json({ error: 'OAuth callback failed', detail: JSON.stringify(err) }, { status: 500 });
    }
}
