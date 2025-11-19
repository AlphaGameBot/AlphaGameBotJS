import { notFound } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { getPostByRoute } from '../../../../lib/posts';

type Props = {
    params: { year: string; month: string; slug: string };
};

export default async function PostPage({ params }: Props) {
    const { year, month, slug } = await params;
    const post = getPostByRoute(year, month, slug);
    if (!post) return notFound();

    const html = String(post.content || '');

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
                    <path d="m15 18-6-6 6-6"/>
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
                    {post.author && typeof post.author === 'string' && (
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
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Back to all posts
                </Link>
            </div>
        </main>
    );
}
