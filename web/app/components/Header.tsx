// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use client";

import Link from "next/link";
import { useState } from "react";
import UserAvatar from "./UserAvatar";

// page header * navbar
export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="py-6">
            <div className="container flex items-center justify-between mt-4">
                {/* left - name */}
                <Link href="/">
                    <h3 className="text-xl font-bold md:text-2xl">
                        AlphaGame<span style={{ color: 'var(--primary-500)' }}>Bot</span>
                    </h3>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <ul className="flex gap-8 items-center m-0 p-0 list-none">
                        <li>
                            <Link href="/blog" className="text-lg">Blog</Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-lg">About</Link>
                        </li>
                        <li>
                            <Link href="/contact" className="text-lg">Contact</Link>
                        </li>
                    </ul>
                    <UserAvatar showSignIn={true} />
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden flex items-center justify-center w-10 h-10"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4">
                    <nav className="container">
                        <ul className="flex flex-col gap-4 m-0 p-0 list-none">
                            <li>
                                <Link 
                                    href="/blog" 
                                    className="block text-lg py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/about" 
                                    className="block text-lg py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/contact" 
                                    className="block text-lg py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact
                                </Link>
                            </li>
                            <li className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                <UserAvatar showSignIn={true} />
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    );
}