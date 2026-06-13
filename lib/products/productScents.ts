import type { SupabaseClient } from "@supabase/supabase-js";
import { scentSlugsToNotes, scentToSlug } from "@/lib/shop/scents";

export async function getProductScentSlugs(
  supabase: SupabaseClient,
  productId: string
): Promise<string[]> {
  const { data: links, error: linkError } = await supabase
    .from("product_scents")
    .select("scent_id")
    .eq("product_id", productId);

  if (linkError) throw new Error(linkError.message);

  const scentIds = (links ?? []).map((row) => row.scent_id).filter(Boolean);
  if (!scentIds.length) return [];

  const { data: scents, error: scentError } = await supabase
    .from("scents")
    .select("slug")
    .in("id", scentIds);

  if (scentError) throw new Error(scentError.message);

  return (scents ?? []).map((row) => row.slug).filter(Boolean);
}

export async function ensureScentByName(
  supabase: SupabaseClient,
  name: string
): Promise<string> {
  const trimmed = name.trim();
  const slug = scentToSlug(trimmed);
  const { error } = await supabase
    .from("scents")
    .upsert({ name: trimmed, slug, is_active: true }, { onConflict: "slug" });

  if (error) throw new Error(error.message);
  return slug;
}

export async function syncProductScents(
  supabase: SupabaseClient,
  productId: string,
  scentSlugs: string[]
): Promise<void> {
  const uniqueSlugs = [...new Set(scentSlugs.map((s) => s.trim()).filter(Boolean))];

  await supabase.from("product_scents").delete().eq("product_id", productId);

  if (!uniqueSlugs.length) {
    await supabase.from("products").update({ notes: null }).eq("id", productId);
    return;
  }

  const { data: scentRows, error: scentError } = await supabase
    .from("scents")
    .select("id, slug")
    .in("slug", uniqueSlugs);

  if (scentError) throw new Error(scentError.message);

  const slugToId = new Map((scentRows ?? []).map((row) => [row.slug, row.id]));
  const inserts = uniqueSlugs
    .filter((slug) => slugToId.has(slug))
    .map((slug) => ({
      product_id: productId,
      scent_id: slugToId.get(slug)!,
    }));

  if (inserts.length) {
    const { error: insertError } = await supabase.from("product_scents").insert(inserts);
    if (insertError) throw new Error(insertError.message);
  }

  await supabase
    .from("products")
    .update({ notes: scentSlugsToNotes(uniqueSlugs) })
    .eq("id", productId);
}
