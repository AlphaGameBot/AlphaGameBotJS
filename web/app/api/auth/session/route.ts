import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('agb_session='));
    if (!match) return NextResponse.json({ user: null });

    try {
        const val = match.replace('agb_session=', '');
        const payload = Buffer.from(val, 'base64').toString('utf-8');
        const parsed = JSON.parse(payload);
        return NextResponse.json({ user: parsed.user });
    } catch (err) {
        return NextResponse.json({ user: null });
    }
}
