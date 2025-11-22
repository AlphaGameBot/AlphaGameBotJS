// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function AboutPage() {
    const [activeUsers, setActiveUsers] = useState(800);
    const [guilds, setGuilds] = useState(20);

    useEffect(() => {
        // Reveal on scroll animation
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
            observer.observe(el);
        });

        fetch("/api/stats/count/users").then((res) => res.json()).then((data) => {
            setActiveUsers(data.count);
        });

        fetch("/api/stats/count/guilds").then((res) => res.json()).then((data) => {
            setGuilds(data.count);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="container">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="reveal-on-scroll mb-6 text-5xl font-bold leading-tight md:text-7xl text-center">
                            Discord bots have a <strong style={{ color: 'var(--primary-500)' }}>stagnation</strong> problem.
                        </h1>
                        <p className="reveal-on-scroll mb-10 text-lg md:text-xl text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            AlphaGameBot is built for Discord communities that want more than just another leveling bot.
                            We focus on <strong style={{ color: 'var(--text-default)' }}>customization</strong>, <strong style={{ color: 'var(--text-default)' }}>privacy</strong>, and <strong style={{ color: 'var(--text-default)' }}>performance</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Origin Story Section */}
            <section className="reveal-on-scroll py-20" style={{ background: 'var(--surface-100)', borderTop: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            Why This Bot Exists
                            <span className="block mt-2 text-sm md:text-base font-normal" style={{ color: 'var(--text-muted)' }}>
                                AKA, my villain origin story.
                            </span>
                        </h2>
                        <div className="space-y-4 text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            <p>
                                Here&apos;s the thing—<br />
                                I have gotten absolutely fed up with Discord bots that are bloated, slow, and steal your data.
                            </p>
                            <p>
                                The thing is that when a Discord bot becomes popular, and inevitably gets sold to a larger company or has ads shoved in your face, the quality of the bot goes down the drain.
                                Features get added for the sake of monetization rather than user experience, and performance takes a backseat.
                            </p>
                            <p>
                                So I decided to build AlphaGameBot as a labor of love— a bot that prioritizes user experience, privacy, and performance above all else.
                                I use this bot in my own communities, and I am committed to keeping it fast, reliable, and free from unnecessary bloat.
                            </p>
                            <p>
                                I also believe in transparency, which is why I am so open about my development process, and all the code can be found on my GitHub. At the end
                                of the day, this bot is my favorite project, as it has been for the last... three years now? Time flies when you&apos;re having fun!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Grid */}
            <section className="reveal-on-scroll py-20">
                <div className="container">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl text-center">
                            What We Stand For
                        </h2>
                        <p className="mb-12 text-lg text-center" style={{ color: 'var(--text-muted)' }}>
                            These aren&apos;t just buzzwords. They&apos;re promises.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Privacy First */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">🔒</div>
                                <h3 className="mb-3 text-xl font-bold">Privacy First</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Your data stays yours. No tracking, no selling, no shady business. We collect only what&apos;s needed to make the bot work.
                                </p>
                            </div>

                            {/* Lightning Fast */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">⚡</div>
                                <h3 className="mb-3 text-xl font-bold">Lightning Fast</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Built from the ground up for speed. Built with the well-maintained Discord.js library and optimized for low latency and high throughput.
                                </p>
                            </div>

                            {/* Community Driven */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">💬</div>
                                <h3 className="mb-3 text-xl font-bold">Community Driven</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Every feature is shaped by real feedback. Join our Discord and help build the bot you actually want to use.
                                </p>
                            </div>

                            {/* Open Source */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">📖</div>
                                <h3 className="mb-3 text-xl font-bold">Open Source</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Full transparency. Check the code, suggest improvements, or even contribute. It&apos;s all on GitHub.
                                </p>
                            </div>

                            {/* No Bloat */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">🎯</div>
                                <h3 className="mb-3 text-xl font-bold">No Bloat</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Every feature has a purpose. No gimmicks, no filler. Just powerful tools that enhance your Discord experience.
                                </p>
                            </div>

                            {/* Always Free */}
                            <div className="p-8 rounded-2xl" style={{ background: 'var(--surface-100)', border: '1px solid var(--border)' }}>
                                <div className="mb-4 text-4xl">🎁</div>
                                <h3 className="mb-3 text-xl font-bold">Always Free</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Core features will never be paywalled. This is a passion project, not a cash grab.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Showcase */}
            <section className="reveal-on-scroll py-20" style={{ background: 'var(--surface-100)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="mx-auto max-w-5xl">
                        <h2 className="mb-12 text-3xl font-bold md:text-4xl text-center">
                            By The Numbers
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="mb-2 text-4xl md:text-5xl font-bold" style={{ color: 'var(--primary-500)' }}>
                                    {activeUsers}+
                                </div>
                                <div className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                                    Active Users
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-4xl md:text-5xl font-bold" style={{ color: 'var(--secondary-500)' }}>
                                    {guilds}+
                                </div>
                                <div className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                                    Servers Served
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-4xl md:text-5xl font-bold" style={{ color: 'var(--secondary-500)' }}>
                                    3+
                                </div>
                                <div className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                                    Years in Development
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-4xl md:text-5xl font-bold" style={{ color: 'var(--accent-500)' }}>
                                    100%
                                </div>
                                <div className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                                    Open Source
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Journey Timeline */}
            <section className="reveal-on-scroll py-20">
                <div className="container">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl text-center">
                            The Journey So Far
                        </h2>
                        <p className="mb-12 text-lg text-center" style={{ color: 'var(--text-muted)' }}>
                            From a weekend experiment to a growing community.
                        </p>
                        <div className="space-y-8">
                            {/* Timeline Item 1 */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full" style={{ background: 'var(--primary-500)' }}></div>
                                    <div className="w-0.5 h-full" style={{ background: 'var(--border)' }}></div>
                                </div>
                                <div className="pb-8">
                                    <div className="mb-1 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>
                                        2023
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">The Beginning</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        Starting as a personal project to learn Pycord and to make a custom bot for my friend group Discord server, AlphaGameBot was born.
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full" style={{ background: 'var(--secondary-500)' }}></div>
                                    <div className="w-0.5 h-full" style={{ background: 'var(--border)' }}></div>
                                </div>
                                <div className="pb-8">
                                    <div className="mb-1 text-sm font-semibold" style={{ color: 'var(--secondary-500)' }}>
                                        2024
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">Going Public</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        Released the first public instance, gained initial users, and being built along with my friend&apos;s bot, <Link style={{ textDecoration: "underline" }} href="https://github.com/CombineSoldier14/CombineBot">CombineBot</Link>.

                                        Friendly competition helped push development forward quickly, and I started quickly outgrowing the initial library, Pycord.
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Item 3 */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full" style={{ background: 'var(--color-orange-300)' }}></div>
                                    <div className="w-0.5 h-full" style={{ background: 'var(--border)' }}></div>
                                </div>
                                <div className="pb-8">
                                    <div className="mb-1 text-sm font-semibold" style={{ color: 'var(--color-orange-300)' }}>
                                        Mid 2024
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">Leveling Up</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        Added major features like the leveling system, database integration, and mini-games for increased engagement.
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Item 4 */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full" style={{ background: 'var(--accent-500)' }}></div>
                                    <div className="w-0.5 h-full" style={{ background: 'var(--border)' }}></div>
                                </div>
                                <div className="pb-8">
                                    <div className="mb-1 text-sm font-semibold" style={{ color: 'var(--accent-500)' }}>
                                        2025
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">Full-scale Rewrite</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        Rewrote the entire codebase in TypeScript using Discord.js for better performance, scalability, and maintainability, providing much more low-level control, and allowing for
                                        better performance optimizations.  Alongside that, I rewrote the website. I was very busy!
                                    </p>
                                </div>
                            </div>


                            {/* Timeline Item 5 */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full" style={{ background: 'var(--primary-500)' }}></div>
                                </div>
                                <div>
                                    <div className="mb-1 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>
                                        2026 & Beyond
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">The Future</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        {/* styled quote */}
                                        <span style={{ fontStyle: "italic", display: "block", marginBottom: "0.5rem" }}>
                                            The trouble with the future is that it usually arrives before we are ready for it.
                                        </span>
                                        — Arnold H. Glasow
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="reveal-on-scroll py-20" style={{ background: 'var(--surface-100)', borderTop: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl text-center">
                            Built With Modern Tech
                        </h2>
                        <p className="mb-12 text-lg text-center" style={{ color: 'var(--text-muted)' }}>
                            We use cutting-edge tools to deliver the best experience.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <h3 className="mb-2 text-lg font-bold">
                                    <Image src="/images/typescript.png" alt="TypeScript logo" width={24} height={24} className="inline-block mr-2 h-full" loading="lazy" />TypeScript</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Typesafe, modern JavaScript that ensures code quality and maintainability across the entire codebase.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <h3 className="mb-2 text-lg font-bold">
                                    <Image src="/images/mysql.png" alt="MySQL logo" width={24} height={24} className="inline-block mr-2 h-full" loading="lazy" />MySQL</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Reliable, scalable database that keeps your server data safe and accessible with great performance.
                                </p>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Planning to migrate to PostgreSQL in the future for advanced features and scalability.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <h3 className="mb-2 text-lg font-bold">
                                    <Image src="/images/nodejs.svg" alt="Node.js logo" width={24} height={24} className="inline-block mr-2 h-full" loading="lazy" />Discord.js</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Powerful JavaScript library for Discord that gives us direct control over every interaction and optimization.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <h3 className="mb-2 text-lg font-bold">
                                    <Image src="/images/self-hosted.svg" alt="Self Hosted logo" width={24} height={24} className="inline-block mr-2 h-full" loading="lazy" />Self Hosted</h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    We run our own servers to ensure maximum control, privacy, and performance for all users.
                                </p>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Planning to migrate to cloud infrastructure in the future for better scalability and reliability.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community CTA */}
            <section className="reveal-on-scroll py-20">
                <div className="container">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-6 text-3xl font-bold md:text-5xl">
                            Join The Community
                        </h2>
                        <p className="mb-8 text-lg md:text-xl" style={{ color: 'var(--text-muted)' }}>
                            We&apos;re building something special, and we&apos;d love to have you along for the ride. Get early access to new features,
                            influence development decisions, and connect with other community members.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://discord.gg/alphagamebot"
                                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                                style={{
                                    background: 'var(--primary-500)',
                                    color: 'white',
                                }}
                            >
                                Join Discord Server
                            </a>
                            <a
                                href="https://github.com/AlphaGameDeveloper"
                                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                                style={{
                                    background: 'var(--surface-100)',
                                    color: 'var(--text-default)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Quote Section */}
            <section className="reveal-on-scroll py-20" style={{ background: 'var(--surface-100)', borderTop: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="mx-auto max-w-3xl text-center">
                        <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-6">
                            &quot;This bot is my favorite project, and it has been for the last three years.
                            It&apos;s a labor of love, and I&apos;m committed to making it the best it can be.&quot;
                        </blockquote>
                        <cite className="text-lg" style={{ color: 'var(--text-muted)' }}>
                            — Damien Boisvert, Creator of AlphaGameBot
                        </cite>
                    </div>
                </div>
            </section>
        </main>
    );
}