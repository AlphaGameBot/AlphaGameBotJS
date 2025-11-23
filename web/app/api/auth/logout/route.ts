import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';

export async function GET(req: NextRequest) {
    const res = NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL || '/');
    // delete session from db
    // get session id from cookie
    const sessionId = req.cookies.get('agb_session')?.value;

    if (sessionId) {
        await db.session.delete({
            where: {
                id: sessionId
            }
        });
    }

    res.headers.append('Set-Cookie', 'agb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;');
    return res;
}
