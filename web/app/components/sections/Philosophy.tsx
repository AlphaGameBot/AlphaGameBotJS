// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function Philosophy() {
    return (
        <section className="py-20" style={{ background: 'var(--surface-100)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
                <div className="mx-auto max-w-3xl">
                    <div className="reveal-on-scroll mb-8">
                        <span className="badge badge-primary">💻 Built by a Developer Who Uses It</span>
                    </div>
                    <h2 className="reveal-on-scroll mb-6 text-3xl font-bold md:text-4xl">
                            Designed and maintained by a developer who actually uses it
                    </h2>
                    <div className="reveal-on-scroll space-y-4 text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        <p>
                                AlphaGameBot focuses on <strong style={{ color: 'var(--text-default)' }}>performance</strong>, <strong style={{ color: 'var(--text-default)' }}>transparency</strong>, and <strong style={{ color: 'var(--text-default)' }}>open-source principles</strong>.
                                It&apos;s built to scale, improve, and stay community-driven.
                        </p>
                        <p>
                                We&apos;re not chasing numbers — we&apos;re chasing <strong style={{ color: 'var(--primary-500)' }}>better code</strong> and <strong style={{ color: 'var(--primary-500)' }}>better experiences</strong>.
                        </p>
                        <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>
                                ~800 users strong — and every one of them is part of something that&apos;s actually improving Discord bots instead of copying them.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}