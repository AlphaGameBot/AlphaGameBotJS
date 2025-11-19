import Link from 'next/link';
import { getSortedPostsData } from '../lib/posts';

export default function BlogPage() {
    const posts = getSortedPostsData();

    return (
        <main className="container py-12">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="mb-4 text-5xl font-bold gradient-text">Blog</h1>
                <p className="text-xl text-text-muted max-w-2xl">
                    Explore our latest articles, tutorials, and updates from the AlphaGameBot team.
                </p>
            </div>

            {/* Blog Posts Grid */}
            {posts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-text-muted text-lg">No blog posts yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post: any) => {
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
                            <article key={post.id} className="card group hover:border-primary-500 transition-all duration-300">
                                {/* Post Date Badge */}
                                <div className="mb-4">
                                    <span className="badge badge-primary text-xs">
                                        {formattedDate}
                                    </span>
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
                                    {excerpt}
                                </p>

                                {/* Read More Link */}
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
                                        className="group-hover/link:translate-x-1 transition-transform"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
