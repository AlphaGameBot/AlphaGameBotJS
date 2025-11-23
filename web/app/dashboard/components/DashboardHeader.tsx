// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Link from "next/link";
import UserAvatar from "@/app/components/UserAvatar";

export default function DashboardHeader() {
    return (
        <header className="py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="container flex items-center justify-between">
                {/* Left - Dashboard Title */}
                <Link href="/app/dashboard">
                    <h3 className="text-xl font-bold">
                        Dashboard
                    </h3>
                </Link>

                {/* Center - Dashboard Navigation */}
                <nav className="flex items-center gap-4">
                    <ul className="flex gap-6 items-center m-0 p-0 list-none">
                        <li>
                            <Link href="/app/dashboard" className="text-base hover:text-primary-500">
                                Overview
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/dashboard/servers" className="text-base hover:text-primary-500">
                                Servers
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/dashboard/settings" className="text-base hover:text-primary-500">
                                Settings
                            </Link>
                        </li>
                        <li>
                            <Link href="/" className="text-base hover:text-primary-500">
                                ← Back to Site
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Right - User Avatar */}
                <UserAvatar showSignIn={true} />
            </div>
        </header>
    );
}
