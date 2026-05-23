import BlogCard from "@/components/blog/BlogCard";
import { getBlogPostsSorted } from "@/lib/content/blog";

export const metadata = {
  title: "Journal | T40 Perfumes",
  description: "Stories from the house — fragrance craft, award milestones, and the world of T40.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPostsSorted();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-t40-white">
      <section className="t40-container px-4 md:px-8 pt-16 lg:pt-24 pb-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading">
          The Journal
        </p>
        <h1 className="text-4xl md:text-6xl font-black text-t40-black uppercase tracking-tighter font-heading">
          Stories & Scent
        </h1>
      </section>

      {featured && (
        <section className="t40-container px-4 md:px-8 pb-16 lg:pb-24 border-b border-t40-light">
          <BlogCard post={featured} featured />
        </section>
      )}

      <section className="t40-container px-4 md:px-8 py-16 lg:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
