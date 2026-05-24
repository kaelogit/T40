import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost } from "./types";
import { DEFAULT_BLOG_POSTS } from "./defaults/blog";
import { nameToSlug } from "@/lib/products/slug";

function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
  read_minutes: number;
  category: string;
  body: string;
  published: boolean;
}): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    author: row.author,
    publishedAt: row.published_at,
    readMinutes: row.read_minutes,
    category: row.category,
    body: row.body,
    published: row.published,
  };
}

export async function getBlogPostsSorted(publishedOnly = true): Promise<BlogPost[]> {
  if (!hasPublicSupabaseConfig()) {
    return publishedOnly
      ? DEFAULT_BLOG_POSTS.filter((p) => p.published !== false)
      : DEFAULT_BLOG_POSTS;
  }

  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (publishedOnly) {
    query = query.eq("published", true);
  }

  const { data } = await query;
  if (!data?.length) {
    return publishedOnly
      ? DEFAULT_BLOG_POSTS.filter((p) => p.published !== false)
      : DEFAULT_BLOG_POSTS;
  }
  return data.map(mapRow);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const fallback = DEFAULT_BLOG_POSTS.find((p) => p.slug === slug) ?? null;

  if (!hasPublicSupabaseConfig()) {
    return fallback;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();

  if (data) return mapRow(data);

  return fallback;
}

export async function getBlogPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (!data?.length) return DEFAULT_BLOG_POSTS;
  return data.map(mapRow);
}

export async function getBlogPostAdmin(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return data ? mapRow(data) : null;
}

export type BlogFormInput = Omit<BlogPost, "id"> & { id?: string };

export function blogFormToRow(input: BlogFormInput) {
  return {
    slug: input.slug.trim() || nameToSlug(input.title),
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    cover_image: input.coverImage,
    author: input.author.trim() || "T40 Editorial",
    published_at: input.publishedAt,
    read_minutes: input.readMinutes || 5,
    category: input.category.trim() || "The House",
    body: input.body.trim(),
    published: input.published !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function importDefaultBlogPosts(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) return 0;

  const rows = DEFAULT_BLOG_POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image: p.coverImage,
    author: p.author,
    published_at: p.publishedAt,
    read_minutes: p.readMinutes,
    category: p.category,
    body: p.body,
    published: true,
  }));

  await supabase.from("blog_posts").insert(rows);
  return rows.length;
}
