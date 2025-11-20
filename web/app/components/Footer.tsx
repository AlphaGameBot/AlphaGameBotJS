// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use client";

import SystemStatus from "./parts/SystemStatus";

export default function Footer() {
    return (
        <footer className="py-12" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="container">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-center md:text-left">
                        <div className="mb-2 text-xl font-bold" style={{ color: 'var(--primary-500)' }}>AlphaGameBot</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            © 2025 AlphaGameBot. Some Rights Reserved. <br />
                            Another far-minded project by{" "}
                            <a href="https://linkedin.com/in/damienboisvert" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Damien Boisvert</a>.

                        </p>
                    </div>

                    <SystemStatus />

                    <div className="flex gap-6">
                        <a
                            href="https://github.com/AlphaGameBot"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://discord.gg/alphagamebot"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Discord
                        </a>
                        <a
                            href="/docs"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Docs
                        </a>
                    </div>
                </div>
            </div>
        </footer >
    );
}