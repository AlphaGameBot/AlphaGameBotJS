// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Link from "next/link";

// page header * navbar
export default function Header() {
    return (
        <header className="py-6">
            <div className="container flex items-center justify-between mt-4">
                {/* left - name (moved here so both sides share the same height) */}
                <Link href="/?s=header">
                    <h3 className="text-2xl font-bold md:text-2xl">
                        AlphaGame<span style={{ color: 'var(--primary-500)' }}>Bot</span>
                    </h3>
                </Link>
                <nav>
                    <ul className="flex gap-8 items-center">
                        <li>
                            <Link href="/features" className="text-lg">Features</Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-lg">About</Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-lg">Contact</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}