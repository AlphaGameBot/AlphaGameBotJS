import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { getAllPostRoutes, getPostByRoute } from '../../../../lib/posts';

type Props = {
    params: { year: string; month: string; slug: string };
};

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
    const routes = getAllPostRoutes();
    return routes
        .filter((route) => route.year && route.month) // Filter out posts without valid dates
        .map((route) => ({
            year: route.year!,
            month: route.month!,
            slug: route.slug,
        }));
}

export default async function PostPage({ params }: Props) {
    const { year, month, slug } = await params;
    const post = getPostByRoute(year, month, slug);
    if (!post) return notFound();

    const html = String(post.content || '');

    // Custom link component to handle external links
    const LinkRenderer = ({ href, children, ...props }: any) => {
        const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
        const isInternal = href?.startsWith('/') || href?.startsWith('#');

        if (isExternal) {
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

        if (isInternal) {
            return <Link href={href} {...props}>{children}</Link>;
        }

        return <a href={href} {...props}>{children}</a>;
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
                <h1 className="mb-4 text-5xl font-bold gradient-text">
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
