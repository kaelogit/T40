import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/content/types";

type Props = {
  post: BlogPost;
  featured?: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogCard({ post, featured }: Props) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden bg-t40-light">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d94625] mb-3 font-heading">
            {post.category} · {post.readMinutes} min read
          </p>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter font-heading text-t40-black group-hover:text-[#d94625] transition-colors leading-tight mb-4">
            {post.title}
          </h2>
          <p className="text-t40-grey font-body text-sm leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>
          <span className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-black">
            {formatDate(post.publishedAt)} — Read article →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden bg-t40-light mb-5">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#d94625] mb-2 font-heading">
        {post.category}
      </p>
      <h3 className="text-base font-black uppercase tracking-wide font-heading text-t40-black group-hover:text-[#d94625] transition-colors line-clamp-2 mb-2">
        {post.title}
      </h3>
      <p className="text-xs text-t40-grey font-body line-clamp-2 mb-3">{post.excerpt}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-grey">
        {formatDate(post.publishedAt)}
      </p>
    </Link>
  );
}
