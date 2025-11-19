"use client";

import { useEffect, useState } from "react";
import Feature from "./components/Feature";
import GotABigServer from "./components/sections/GotABigServer";
import Philosophy from "./components/sections/Philosophy";
import GitHub from "./components/svg/GitHub";

export default function Home() {
    const [currentUsers, setCurrentUsers] = useState<number | null>(null);
    const [guilds, setGuilds] = useState<number>(20);
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

        fetch('/api/stats/count/users').then(res => res.json()).then(data => {
            setCurrentUsers(data.count);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="container">
                    <div className="mx-auto max-w-4xl">
                        {/* Hero Heading */}
                        <h1 className="reveal-on-scroll mb-6 text-5xl font-bold leading-tight md:text-7xl text-center">
                            Not Another Bloated{" "}
                            <span style={{ color: 'var(--primary-500)' }}>Discord Bot</span>
                        </h1>

                        {/* Hero Description */}
                        <p className="reveal-on-scroll mb-10 text-lg md:text-xl text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            AlphaGameBot is built for Discord communities that want more than just another leveling bot.
                            We focus on <strong style={{ color: 'var(--text-default)' }}>customization</strong>, <strong style={{ color: 'var(--text-default)' }}>privacy</strong>, and <strong style={{ color: 'var(--text-default)' }}>performance</strong>.
                        </p>

                        <p className="reveal-on-scroll mb-10 text-base md:text-lg text-center" style={{ color: 'var(--text-muted)' }}>
                            We&apos;re a small community right now — <strong style={{ color: 'var(--primary-500)' }}>~800 users strong</strong> — but every feature is built with heart and feedback from real users.
                            Join us early and help shape the bot before it blows up.
                        </p>

                        {/* CTA Buttons */}
                        <div className="reveal-on-scroll flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/api/addTheBot"
                                className="btn btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Add to Discord
                            </a>
                            <a
                                href="https://github.com/AlphaGameBot"
                                className="btn btn-secondary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GitHub />
                                View Source Code
                            </a>
                        </div>

                        {/* Stats Row - Simplified */}
                        <div className="reveal-on-scroll mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 max-w-2xl mx-auto">
                            <div className="card text-center">
                                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
                                    {currentUsers !== null ? `~${currentUsers}` : '~800'}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Users</div>
                            </div>
                            <div className="card text-center">
                                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>100%</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Open Source</div>
                            </div>
                            <div className="card text-center md:col-span-1 col-span-2">
                                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--success-500)' }}>Active</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Development</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle Background Glow - Much more subtle */}
                <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: 'var(--primary-500)' }}></div>
            </section>

            <Philosophy />

            {/* Features Section */}
            <section className="py-20">
                <div className="container">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <div className="reveal-on-scroll mb-4">
                            <span className="badge badge-primary">What You Get</span>
                        </div>
                        <h2 className="reveal-on-scroll mb-4 text-4xl font-bold md:text-5xl">
                            Fast, Lightweight, & Focused
                        </h2>
                        <p className="reveal-on-scroll text-lg" style={{ color: 'var(--text-muted)' }}>
                            Core features that matter, without the bloat (and subscriptions)
                        </p>
                    </div>

                    <div className="grid-auto">
                        {/* Feature 1 */}
                        <Feature
                            title="User Leveling System"
                            description="Track activity with XP gains and leveling. Members earn experience for participating in your community."
                            icon={
                                <svg className="h-6 w-6" style={{ color: 'var(--primary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            }
                        />

                        {/* Feature 2 */}
                        <Feature
                            title="Global Leaderboards"
                            description="Rankings across all servers. Foster friendly competition and see who&apos;s leading."
                            icon={
                                <svg className="h-6 w-6" style={{ color: 'var(--primary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />

                        {/* Feature 3 */}
                        <Feature
                            title="Customizable Rewards"
                            description="Role rewards when members reach milestones. Configure it your way."
                            icon={
                                <svg className="h-6 w-6" style={{ color: 'var(--primary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            }
                        />

                        {/* Feature 4 */}
                        <Feature
                            title="Open-Source & Transparent"
                            description="Audit the code anytime. Your data stays secure and under your control."
                            icon={<svg className="h-6 w-6" style={{ color: 'var(--success-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>}
                        />

                        <Feature
                            title="Optimized Performance"
                            description="Instant responses and real-time tracking without lag or bloat."
                            icon={
                                <svg className="h-6 w-6" style={{ color: 'var(--warning-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                        />

                        {/* Feature 6 */}
                        <Feature
                            title="Advanced Analytics"
                            description="Gain insights into user behavior and engagement."
                            icon={
                                <svg className="h-6 w-6" style={{ color: 'var(--primary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </section>

            <GotABigServer />

            {/* CTA Section */}
            <section className="py-20" style={{ background: 'var(--surface-100)' }}>
                <div className="container">
                    <div className="reveal-on-scroll card mx-auto max-w-3xl text-center" style={{ padding: '3rem', border: '2px solid var(--border-strong)' }}>
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Ready to Try Something Different?
                        </h2>
                        <p className="mb-8 text-base md:text-lg" style={{ color: 'var(--text-muted)' }}>
                            Join our small but growing community. Be part of building a better Discord bot from the ground up.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/api/addTheBot"
                                className="btn btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Add to Discord
                            </a>
                            <a
                                href="https://github.com/AlphaGameBot"
                                className="btn btn-secondary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GitHub />
                                View Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
