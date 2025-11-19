import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'blog');

type Post = {
    id: string;
    title?: string;
    date?: string;
    content?: string;
    [key: string]: unknown;
};

function pad(n: number) {
    return String(n).padStart(2, '0');
}

function makePermalink(dateStr: string | undefined, slug: string) {
    if (!dateStr) return `/blog/${slug}`;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return `/blog/${slug}`;
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    return `/blog/${year}/${month}/${slug}`;
}

export function getSortedPostsData(): Post[] {
    // Get file names under /blog
    if (!fs.existsSync(postsDirectory)) return [];
    const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'));
    const allPostsData: Post[] = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id / slug
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        const date = (matterResult.data && String(matterResult.data.date)) || undefined;

        // Combine the data with the id and permalink
        return {
            id,
            content: matterResult.content,
            permalink: makePermalink(date, id),
            ...matterResult.data,
        } as Post;
    });
    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });
}

export function getAllPostRoutes() {
    const posts = getSortedPostsData();
    return posts.map((p) => {
        const d = p.date ? new Date(p.date) : null;
        const year = d ? String(d.getFullYear()) : undefined;
        const month = d ? pad(d.getMonth() + 1) : undefined;
        return {
            year,
            month,
            slug: p.id,
        };
    });
}

export function getPostByRoute(year: string, month: string, slug: string) {
    const posts = getSortedPostsData();
    return posts.find((p) => {
        if (p.id !== slug) return false;
        if (!p.date) return false;
        const d = new Date(p.date);
        if (isNaN(d.getTime())) return false;
        return String(d.getFullYear()) === year && pad(d.getMonth() + 1) === month;
    });
}

export function getPostContent(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
        id: slug,
        content: matterResult.content,
        ...matterResult.data,
    };
}