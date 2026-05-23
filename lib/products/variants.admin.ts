import { createAdminClient } from "@/lib/supabase/admin";
import type { VariantFormInput } from "./variants";

export async function syncProductVariants(
  productId: string,
  variants: VariantFormInput[],
  options: { onSale: boolean }
): Promise<void> {
  const supabase = createAdminClient();

  const normalized = variants.map((v, i) => ({
    ...v,
    label: v.label.trim(),
    sort_order: i,
    sale_price: options.onSale ? v.sale_price : null,
  }));

  const defaultCount = normalized.filter((v) => v.is_default).length;
  if (defaultCount !== 1 && normalized.length > 0) {
    normalized.forEach((v, i) => {
      v.is_default = i === 0;
    });
    normalized[0].is_default = true;
  }

  const { data: existing } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  const existingIds = new Set((existing ?? []).map((r) => r.id));
  const keptIds = new Set<string>();

  for (const v of normalized) {
    const row = {
      product_id: productId,
      label: v.label,
      price: v.price,
      sale_price: v.sale_price,
      stock_quantity: null,
      low_stock_threshold: v.low_stock_threshold || 5,
      sort_order: v.sort_order,
      is_default: v.is_default,
      is_active: true,
    };

    if (v.id && existingIds.has(v.id)) {
      await supabase.from("product_variants").update(row).eq("id", v.id);
      keptIds.add(v.id);
    } else {
      const { data: inserted } = await supabase
        .from("product_variants")
        .insert(row)
        .select("id")
        .single();
      if (inserted) keptIds.add(inserted.id);
    }
  }

  const toDeactivate = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDeactivate.length) {
    await supabase
      .from("product_variants")
      .update({ is_active: false, is_default: false })
      .in("id", toDeactivate);
  }

  const defaultV = normalized.find((v) => v.is_default) ?? normalized[0];
  if (defaultV) {
    await supabase
      .from("products")
      .update({
        price: defaultV.price,
        sale_price: options.onSale ? defaultV.sale_price : null,
      })
      .eq("id", productId);
  }
}
