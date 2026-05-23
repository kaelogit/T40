import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/content/BlogPostForm";
import { getBlogPostAdmin } from "@/lib/content/blog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPostAdmin(id);
  return { title: post ? `Edit ${post.title} | T40 Perfumes` : "Edit Post | T40 Perfumes" };
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPostAdmin(id);
  if (!post?.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit post</h1>
      <BlogPostForm postId={id} initial={post} />
    </div>
  );
}
