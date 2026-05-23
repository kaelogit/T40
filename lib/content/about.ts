import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AboutContent, AboutPageData, AboutAwardProduct } from "./types";
import { DEFAULT_ABOUT_CONTENT } from "./types";

const AWARD_FALLBACK_IMAGES: Record<string, { tagline: string; image: string }> = {
  revenge: {
    tagline: "A statement scent with an unforgettable trail",
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop",
  },
  "sweet-noble": {
    tagline: "Floral amber mastery from the T40 house",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
  },
  "24th-oud": {
    tagline: "Dark oud and leather, distilled with precision",
    image:
      "https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=800&auto=format&fit=crop",
  },
};

const ABOUT_HERO_IMAGE = "/about/hero.jpg";

function normalizeAboutContent(raw: AboutContent): AboutContent {
  const url = raw.hero.imageUrl?.trim() ?? "";
  if (!url || url.includes("unsplash.com")) {
    return { ...raw, hero: { ...raw.hero, imageUrl: ABOUT_HERO_IMAGE } };
  }
  return raw;
}

async function resolveAwardProducts(
  slugs: string[],
  supabase: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>
): Promise<AboutAwardProduct[]> {
  const products: AboutAwardProduct[] = [];

  for (const slug of slugs) {
    const { data } = await supabase
      .from("products")
      .select("name, slug, description, images")
      .eq("slug", slug)
      .maybeSingle();

    const fallback = AWARD_FALLBACK_IMAGES[slug];
    products.push({
      name: data?.name ?? slug.replace(/-/g, " "),
      slug,
      tagline: data?.description?.slice(0, 80) ?? fallback?.tagline ?? "",
      image: data?.images?.[0] ?? fallback?.image ?? "/placeholder.jpg",
    });
  }

  return products;
}

export async function getAboutPageData(): Promise<AboutPageData> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("page_key", "about")
    .maybeSingle();

  const content = normalizeAboutContent(
    (data?.content as AboutContent | null) ?? DEFAULT_ABOUT_CONTENT
  );
  const awardProducts = await resolveAwardProducts(content.awards.productSlugs, supabase);

  return { content, awardProducts };
}

export async function getAboutContentAdmin(): Promise<AboutContent> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("page_key", "about")
    .maybeSingle();

  return (data?.content as AboutContent | null) ?? DEFAULT_ABOUT_CONTENT;
}

export async function saveAboutContent(content: AboutContent) {
  const supabase = createAdminClient();
  await supabase.from("site_pages").upsert({
    page_key: "about",
    content,
    updated_at: new Date().toISOString(),
  });
}

export async function importDefaultAboutIfEmpty(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("page_key")
    .eq("page_key", "about")
    .maybeSingle();

  if (data) return false;

  await supabase.from("site_pages").insert({
    page_key: "about",
    content: DEFAULT_ABOUT_CONTENT,
  });
  return true;
}
