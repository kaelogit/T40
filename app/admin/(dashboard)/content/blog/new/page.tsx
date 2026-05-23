import BlogPostForm from "@/components/admin/content/BlogPostForm";

export const metadata = { title: "New Blog Post | T40 Perfumes" };

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">New blog post</h1>
      <BlogPostForm />
    </div>
  );
}
