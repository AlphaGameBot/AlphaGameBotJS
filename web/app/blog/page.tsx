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

import { getSortedPostsData } from '../lib/posts';
import BlogPostsList from './components/BlogPostsList';

export default function BlogPage() {
    const posts = getSortedPostsData();

    return (
        <main className="container py-12">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="mb-4 text-5xl pb-5 font-bold gradient-text">Blog</h1>
                <p className="text-xl text-text-muted max-w-2xl">
                    Explore our latest articles, tutorials, and updates from the AlphaGameBot team.
                </p>
            </div>

            {/* Blog Posts List with Controls */}
            <BlogPostsList posts={posts} />
        </main>
    );
}
