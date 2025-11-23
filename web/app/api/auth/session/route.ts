import crypto from 'crypto';
import type { User } from 'discord.js';
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';

function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(req: NextRequest) {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('agb_session='));
    if (!match) return NextResponse.json({ user: null });

    try {
        const raw = match.replace('agb_session=', '');
        const hashed = hashToken(raw);
        const session = await db.session.findFirst({ where: { hashedId: hashed }, include: { user: true } });
        if (!session) return NextResponse.json({ user: null });
        if (new Date(session.expires_at) < new Date()) {
            // expired
            await db.session.deleteMany({ where: { hashedId: hashed } });
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user: { ...session.user_json as unknown as User } });
    } catch {
        return NextResponse.json({ user: null, error: 'Internal error' }, { status: 500 });
    }
}
