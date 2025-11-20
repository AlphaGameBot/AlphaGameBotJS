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

import { markdownToTxt } from 'markdown-to-txt';
import Link from 'next/link';

type Post = {
    id: string;
    title?: string;
    date?: string;
    content?: string;
    category?: string;
    permalink: string;
    [key: string]: unknown;
};

type LatestBlogPostsProps = {
    posts: Post[];
};

export default function LatestBlogPosts({ posts }: LatestBlogPostsProps) {
    const latestPosts = posts.slice(0, 3);

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'announcement':
                return 'var(--primary-500)';
            case 'tutorial':
                return 'var(--success-500)';
            case 'update':
                return 'var(--info-500)';
            case 'outage':
                return 'var(--danger-500)';
            default:
                return 'var(--text-muted)';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getExcerpt = (content: string, maxLength = 150) => {
        const plainText = markdownToTxt(content);
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength).trim() + '...';
    };

    return (
        <section className="py-20" style={{ background: 'var(--surface-100)' }}>
            <div className="container">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <div className="reveal-on-scroll mb-4">
                        <span className="badge badge-primary">Latest Updates</span>
                    </div>
                    <h2 className="reveal-on-scroll mb-4 text-4xl font-bold md:text-5xl">
                        From the Blog
                    </h2>
                    <p className="reveal-on-scroll text-lg" style={{ color: 'var(--text-muted)' }}>
                        Stay up to date with the latest news, updates, and announcements
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latestPosts.map((post) => (
                        <Link
                            href={post.permalink}
                            key={post.id}
                            className="reveal-on-scroll group"
                        >
                            <article
                                className="card h-full flex flex-col transition-all duration-300 hover:shadow-xl"
                                style={{
                                    borderColor: 'var(--border)',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Category Badge */}
                                <div className="mb-3 flex items-center gap-2">
                                    <span
                                        className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                                        style={{
                                            background: `${getCategoryColor(post.category || 'unknown')}15`,
                                            color: getCategoryColor(post.category || 'unknown'),
                                        }}
                                    >
                                        {(post.category || 'unknown').toUpperCase()}
                                    </span>
                                    {post.date && (
                                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {formatDate(post.date)}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3
                                    className="mb-3 text-xl font-bold group-hover:text-primary-500 transition-colors"
                                    style={{ color: 'var(--text-default)' }}
                                >
                                    {post.title || 'Untitled Post'}
                                </h3>

                                {/* Excerpt */}
                                <p
                                    className="mb-4 grow text-sm leading-relaxed"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {post.content ? getExcerpt(post.content) : 'No content available'}
                                </p>

                                {/* Read More Link */}
                                <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--primary-500)' }}>
                                    <span>Read More</span>
                                    <svg
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {/* View All Link */}
                <div className="reveal-on-scroll mt-12 text-center">
                    <Link href="/blog" className="btn btn-secondary">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        View All Blog Posts
                    </Link>
                </div>
            </div>
        </section>
    );
}
