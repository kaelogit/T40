import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";

const STATIC_PATHS = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/faq",
  "/blog",
  "/terms",
  "/privacy",
  "/shipping",
  "/careers",
  "/shop/t40-exclusives",
  "/shop/women",
  "/shop/men",
  "/shop/unisex",
  "/shop/scent",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = await createClient();

    const { data: products } = await supabase
      .from("products")
      .select("slug, created_at")
      .not("slug", "is", null);

    for (const product of products ?? []) {
      if (!product.slug) continue;
      entries.push({
        url: `${base}/product/${product.slug}`,
        lastModified: product.created_at ? new Date(product.created_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("published", true);

    for (const post of posts ?? []) {
      if (!post.slug) continue;
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : post.published_at
            ? new Date(post.published_at)
            : now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Sitemap still returns static routes if Supabase is unavailable at build time.
  }

  return entries;
}
