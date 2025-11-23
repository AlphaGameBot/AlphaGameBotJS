// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

import { useEffect, useState } from "react";

export default function InlineLoginStatus() {
    const [account, setAccount] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await fetch("/api/auth/session");
                if (!mounted) return;
                if (!res.ok) {
                    setAccount(null);
                    return;
                }
                const payload = await res.json();
                setAccount(payload?.user ?? null);
            } catch {
                if (mounted) setAccount(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    /**
     * This component is intended for the mobile menu: compact, stacked actions
     * when the user is signed in, or a full-width sign-in button when not.
     */
    return (
        <div>
            {loading ? (
                <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : account ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={
                                account.avatar
                                    ? `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.${account.avatar?.startsWith("a_") ? "gif" : "png"}`
                                    : `https://cdn.discordapp.com/embed/avatars/${Number(account.discriminator) % 5}.png`
                            }
                            alt={`${account.username} avatar`}
                            className="w-9 h-9 rounded-full border"
                        />
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{account.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">#{account.discriminator}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <a
                            href="/profile"
                            className="block w-full text-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            View profile
                        </a>
                        <a
                            href="/api/auth/logout"
                            className="block w-full text-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Sign out
                        </a>
                    </div>
                </div>
            ) : (
                <a
                    href="/api/auth/login"
                    className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Sign in with Discord
                </a>
            )}
        </div>
    );
}