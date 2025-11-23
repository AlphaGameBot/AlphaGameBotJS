import { NextResponse } from 'next/server';

export async function GET() {
    const res = NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL || '/');
    res.headers.append('Set-Cookie', 'agb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;');
    return res;
}
