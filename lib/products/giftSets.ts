import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GiftSetIncludedProduct = {
  id: string;
  name: string;
  slug: string | null;
  brand: string | null;
  images: string[];
  price: number;
  quantity: number;
  in_stock: boolean;
};

export async function getGiftSetContents(
  supabase: SupabaseClient,
  giftSetId: string
): Promise<GiftSetIncludedProduct[]> {
  const { data: rows, error: rowsError } = await supabase
    .from("gift_set_items")
    .select("quantity, sort_order, product_id")
    .eq("gift_set_id", giftSetId)
    .order("sort_order", { ascending: true });

  if (rowsError || !rows?.length) return [];

  const productIds = [...new Set(rows.map((row) => row.product_id as string))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, brand, images, price, in_stock")
    .in("id", productIds);

  if (productsError || !products?.length) return [];

  const byId = new Map(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        images: (p.images as string[] | null) ?? [],
        price: Number(p.price),
        in_stock: p.in_stock !== false,
      },
    ])
  );

  return rows
    .map((row) => {
      const p = byId.get(row.product_id as string);
      if (!p) return null;
      return {
        ...p,
        quantity: row.quantity as number,
      };
    })
    .filter(Boolean) as GiftSetIncludedProduct[];
}

export async function syncGiftSetItems(giftSetId: string, productIds: string[]) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("gift_set_items")
    .delete()
    .eq("gift_set_id", giftSetId);

  if (deleteError) {
    throw new Error(`Failed to update gift set items: ${deleteError.message}`);
  }

  if (productIds.length === 0) return;

  const rows = productIds.map((product_id, index) => ({
    gift_set_id: giftSetId,
    product_id,
    quantity: 1,
    sort_order: index,
  }));

  const { error: insertError } = await supabase.from("gift_set_items").insert(rows);
  if (insertError) {
    throw new Error(`Failed to save gift set perfumes: ${insertError.message}`);
  }
}

export async function getGiftSetItemIds(giftSetId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gift_set_items")
    .select("product_id")
    .eq("gift_set_id", giftSetId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((r) => r.product_id);
}

export type GiftSetReference = { id: string; name: string; slug: string | null };

/** Gift sets that include this perfume (blocks delete until unlinked). */
export async function getGiftSetsContainingProduct(
  productId: string
): Promise<GiftSetReference[]> {
  const supabase = createAdminClient();

  const { data: links, error: linksError } = await supabase
    .from("gift_set_items")
    .select("gift_set_id")
    .eq("product_id", productId);

  if (linksError || !links?.length) return [];

  const giftSetIds = [...new Set(links.map((row) => row.gift_set_id as string))];
  const { data: giftSets, error: giftSetsError } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("id", giftSetIds);

  if (giftSetsError || !giftSets?.length) return [];

  return giftSets.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
  }));
}

export function formatGiftSetDeleteBlockMessage(giftSets: GiftSetReference[]): string {
  const count = giftSets.length;
  const noun = count === 1 ? "gift set" : "gift sets";
  const names = giftSets.map((g) => g.name).join(", ");
  return `This perfume is used in ${count} ${noun} (${names}) — remove it from those gift sets first.`;
}

export function formatGiftSetLineName(
  setName: string,
  includes: { name: string }[]
): string {
  if (includes.length === 0) return setName;
  const names = includes.map((p) => p.name).join(", ");
  return `${setName} — includes: ${names}`;
}
