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

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { getAllPostRoutes, getPostWithNavigation } from '../../../../lib/posts';

type Props = {
    params: { year: string; month: string; slug: string };
};

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
    const routes = getAllPostRoutes();
    return routes
        // Filter out posts without valid dates
        .filter((route) => route.year && route.month)
        .map((route) => ({
            year: route.year!,
            month: route.month!,
            slug: route.slug,
        }));
}

export default async function PostPage({ params }: Props) {
    const { year, month, slug } = await params;
    const post = getPostWithNavigation(year, month, slug);
    if (!post) return notFound();

    const html = String(post.content || '');

    // Custom link component to handle external links
    const LinkRenderer = ({ href, children, ...props }: any) => {
        const isInternal = (
            href?.startsWith('/') ||
            href?.startsWith('#') ||
            href?.match(/^https?:\/\/(www\.)?alphagamebot\.com(\/|$)/)
        );

        if (isInternal) {
            return <Link href={href} {...props}>{children}</Link>;
        } else {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    {...props}
                >
                    {children}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block"
                    >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            );
        }
    };

    return (
        <main className="container py-12">
            {/* Back to Blog Link */}
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 mb-8 text-primary-500 hover:text-primary-600 transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Blog
            </Link>

            {/* Blog Post Header */}
            <header className="mb-12">
                <h1 className="mb-4 pb-5 text-5xl font-bold gradient-text">
                    {post.title}
                </h1>
                <div className="flex items-center gap-4 text-text-muted">
                    <time className="text-sm font-medium">
                        {post.date ? new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'No date'}
                    </time>
                    {typeof post.author === 'string' && post.author && (
                        <>
                            <span>•</span>
                            <span className="text-sm">By {post.author}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Blog Post Content */}
            <article className="card">
                <div className="prose max-w-none">
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                            a: LinkRenderer,
                        }}
                    >
                        {html}
                    </Markdown>
                </div>
            </article>

            {/* Previous/Next Navigation */}
            {(post.previous || post.next) && (
                <nav className="mt-12 pt-8 border-t border-border">
                    <div className="flex justify-between items-center gap-4">
                        {post.previous ? (
                            <Link
                                href={`/blog/${post.previous.year}/${post.previous.month}/${post.previous.slug}`}
                                className="group flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover:-translate-x-1 transition-transform"
                                >
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs text-text-muted uppercase tracking-wide">Previous</div>
                                    <div className="font-semibold">{post.previous.title}</div>
                                </div>
                            </Link>
                        ) : (
                            <div />
                        )}

                        {post.next ? (
                            <Link
                                href={`/blog/${post.next.year}/${post.next.month}/${post.next.slug}`}
                                className="group flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors ml-auto"
                            >
                                <div className="text-right">
                                    <div className="text-xs text-text-muted uppercase tracking-wide">Next</div>
                                    <div className="font-semibold">{post.next.title}</div>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover:translate-x-1 transition-transform"
                                >
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </Link>
                        ) : null}
                    </div>
                </nav>
            )}

            {/* Back to Blog Footer Link */}
            <div className="mt-12 pt-8 border-t border-border">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to all posts
                </Link>
            </div>
        </main>
    );
}
