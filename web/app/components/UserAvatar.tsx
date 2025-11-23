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

"use client";

import type { User } from "discord.js";
import { useEffect, useState } from "react";

export default function UserAvatar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
                setUser(data.user);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <div>
                {loading ? (
                    <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                ) : user ? (
                    <div className="relative inline-block group p-1 -m-1">
                        <img
                            src={
                                user.avatar
                                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}`
                                    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
                            }
                            alt={`${user.username} avatar`}
                            className="w-10 h-10 rounded-full border cursor-pointer block"
                        />

                        <div className="absolute right-0 mt-1 w-72 bg-white dark:bg-gray-800 border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-1 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto z-20">
                            <div className="p-3 flex items-center gap-3">
                                <img
                                    src={
                                        user.avatar
                                            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}`
                                            : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
                                    }
                                    alt={`${user.username} avatar`}
                                    className="w-10 h-10 rounded-full border"
                                />
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {user.username}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        #{user.discriminator}
                                    </div>
                                    <div className="text-xs text-gray-400 break-all">
                                        ID: {user.id}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t px-3 py-3 flex gap-2">
                                <a
                                    href="/api/auth/logout"
                                    className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Sign out
                                </a>
                                <a
                                    href="/profile"
                                    className="flex-1 text-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Profile
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <a
                        href="/api/auth/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Sign in with Discord
                    </a>
                )}
            </div>
        </>
    );
}