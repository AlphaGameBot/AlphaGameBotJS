// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function GotABigServer() {
    return (
        <section className="py-20" style={{ background: 'var(--surface-200)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
                <div className="mx-auto max-w-3xl">
                    <div className="reveal-on-scroll mb-8">
                        <span className="badge badge-primary">🚀 Testing for Large Servers</span>
                    </div>
                    <h2 className="reveal-on-scroll mb-6 text-3xl font-bold md:text-4xl">
                        Got a big server?  No problem.
                    </h2>
                    <div className="reveal-on-scroll space-y-4 text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        <p>
                            That&apos;s even better.  I am currently looking for large servers to partner with to help test and improve AlphaGameBot&apos;s performance at scale.
                            If you have a server with 1,000+ members and would like to help out, please
                            {" "}<a href="/contact" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>get in touch</a>.
                        </p>
                        <p>
                            Also, I know that large servers often have unique needs when it comes to bot functionality and performance.
                            If you have specific needs or problems that you&apos;d like to see addressed, please don&apos;t hesitate to reach out.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}