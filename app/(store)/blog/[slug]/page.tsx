import { notFound } from "next/navigation";
import BlogPostContent from "@/components/blog/BlogPostContent";
import { getBlogPost } from "@/lib/content/blog";
import { DEFAULT_BLOG_POSTS } from "@/lib/content/defaults/blog";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return DEFAULT_BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Not Found | T40 Perfumes" };
  return {
    title: `${post.title} | T40 Journal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-t40-white">
      <div className="t40-container px-4 md:px-8 py-12 lg:py-20 max-w-4xl mx-auto">
        <BlogPostContent post={post} />
      </div>
    </div>
  );
}
