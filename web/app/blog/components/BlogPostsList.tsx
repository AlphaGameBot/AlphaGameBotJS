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

'use client';

import { markdownToTxt } from 'markdown-to-txt';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import BlogControls from './BlogControls';
import PostTypeBadge, { PostType } from './PostTypeBadge';

type Post = {
    id: string;
    title?: string;
    date?: string;
    content?: string;
    category?: string;
    permalink: string;
    [key: string]: unknown;
};

type BlogPostsListProps = {
    posts: Post[];
};

export default function BlogPostsList({ posts }: BlogPostsListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        posts.forEach((post) => {
            if (post.category) {
                cats.add(post.category as string);
            }
        });
        return Array.from(cats).sort();
    }, [posts]);

    // Filter and sort posts
    const filteredAndSortedPosts = useMemo(() => {
        let filtered = posts;

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = posts.filter((post) => post.category === selectedCategory);
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [posts, selectedCategory, sortOrder]);

    return (
        <>
            {/* Controls */}
            <div className="mb-8">
                <BlogControls
                    categories={categories}
                    onFilterChange={setSelectedCategory}
                    onSortChange={setSortOrder}
                />
            </div>

            {/* Blog Posts Grid */}
            {filteredAndSortedPosts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-text-muted text-lg">
                        {selectedCategory !== 'all'
                            ? `No posts found in category "${selectedCategory}".`
                            : 'No blog posts yet. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedPosts.map((post: Post) => {
                        const excerpt = post.content
                            ? String(post.content).substring(0, 150).replace(/[#*_`]/g, '').trim() + '...'
                            : 'Click to read more...';

                        const formattedDate = post.date
                            ? new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            : 'No date';

                        return (
                            <article key={post.id} className="card group hover:border-primary-500 transition-all duration-300 flex flex-col">
                                {/* Post Date Badge */}
                                <div className="flex-1 mb-4">
                                    <PostTypeBadge type={(post.category || 'unknown') as PostType} />
                                </div>

                                {/* Post Title */}
                                <h2 className="mb-3">
                                    <Link
                                        href={post.permalink}
                                        className="text-2xl font-bold text-text-default group-hover:text-primary-500 transition-colors"
                                    >
                                        {post.title || post.id}
                                    </Link>
                                </h2>

                                {/* Post Excerpt */}
                                <p className="text-text-muted mb-6 line-clamp-3">
                                    {markdownToTxt(excerpt)}
                                </p>

                                {/* Read More Link - put at bottom of card */}
                                <div className="mt-auto pt-4 border-t border-transparent">
                                    <Link
                                        href={post.permalink}
                                        className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors group/link"
                                    >
                                        Read more
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="ml-1 group-hover/link:translate-x-1 transition-transform"
                                        >
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </>
    );
}
