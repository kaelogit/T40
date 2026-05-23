import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/content/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderBody(body: string) {
  const blocks = body.split("\n\n");
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-lg font-black uppercase tracking-wider font-heading text-t40-black mt-10 mb-4"
        >
          {block.replace("### ", "")}
        </h3>
      );
    }
    const html = block
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, " ");
    return (
      <p
        key={i}
        className="text-t40-grey font-body text-base leading-relaxed mb-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export default function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <article>
      <header className="mb-10 lg:mb-14">
        <Link
          href="/blog"
          className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors mb-8 inline-block"
        >
          ← Journal
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d94625] mb-4 font-heading">
          {post.category} · {post.readMinutes} min read
        </p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter font-heading text-t40-black leading-tight mb-6">
          {post.title}
        </h1>
        <p className="text-t40-grey font-body text-lg leading-relaxed max-w-2xl mb-6">
          {post.excerpt}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey">
          {post.author} · {formatDate(post.publishedAt)}
        </p>
      </header>

      <div className="relative aspect-[21/9] overflow-hidden bg-t40-light mb-12 lg:mb-16">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="max-w-2xl">{renderBody(post.body)}</div>
    </article>
  );
}
