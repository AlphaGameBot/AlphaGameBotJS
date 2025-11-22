// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = { id: string; username: string; discriminator: string; avatar: string | null } | null;

export default function Header() {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetch('/api/auth/session')
            .then(r => r.json())
            .then((d) => { if (mounted) setUser(d.user ?? null); })
            .catch(() => { if (mounted) setUser(null); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    function avatarUrl(u: NonNullable<User>) {
        if (!u.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(u.discriminator) % 5}.png`;
        const isAnimated = u.avatar.startsWith('a_');
        const ext = isAnimated ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}`;
    }

    return (
        <header className="py-6">
            <div className="container flex items-center justify-between mt-4">
                {/* left - name (moved here so both sides share the same height) */}
                <Link href="/">
                    <h3 className="text-2xl font-bold md:text-2xl">
                        AlphaGame<span style={{ color: 'var(--primary-500)' }}>Bot</span>
                    </h3>
                </Link>
                <nav>
                    <ul className="flex gap-6 items-center">
                        <li>
                            <Link href="/blog" className="text-lg">Blog</Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-lg">About</Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-lg">Contact</Link>
                        </li>
                        <li>
                            {loading ? null : user ? (
                                <div className="flex items-center gap-3">
                                    <img src={avatarUrl(user)} alt={`${user.username} avatar`} className="w-9 h-9 rounded-full border" />
                                    <span className="hidden sm:inline text-sm">{user.username}#{user.discriminator}</span>
                                    <a href="/api/auth/logout" className="ml-3 text-sm text-red-600">Sign out</a>
                                </div>
                            ) : (
                                <a href="/api/auth/login" className="text-sm">Sign in</a>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}