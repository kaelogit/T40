import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandToSlug } from "@/lib/shop/brands";
import { getGiftSetItemIds, syncGiftSetItems, getGiftSetsContainingProduct, formatGiftSetDeleteBlockMessage } from "@/lib/products/giftSets";
import { ensureScentByName, getProductScentSlugs, syncProductScents } from "@/lib/products/productScents";
import { pruneT40SubcategoryAfterProductChange, pruneT40SubcategoryIfUnused } from "@/lib/catalog/subcategories";
import { syncProductVariants } from "@/lib/products/variants.admin";
import { mapDbVariants } from "@/lib/products/variants";
import {
  productFormToRow,
  rowToProductFormWithGiftIds,
  validateProductForm,
  type ProductFormInput,
} from "@/lib/admin/productForm";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const giftSetProductIds =
    data.category === "gift-sets" || data.product_type === "gift_set"
      ? await getGiftSetItemIds(id)
      : [];

  const scentSlugs =
    data.category === "gift-sets" || data.product_type === "gift_set"
      ? []
      : await getProductScentSlugs(supabase, id);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return NextResponse.json({
    product: data,
    form: rowToProductFormWithGiftIds(data, giftSetProductIds, mapDbVariants(variants ?? []), scentSlugs),
  });
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = (await request.json()) as ProductFormInput & {
      newBrandName?: string;
      newScentName?: string;
    };
    const validationError = validateProductForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("products")
      .select("category, subcategory")
      .eq("id", id)
      .maybeSingle();

    if (body.newBrandName?.trim()) {
      const name = body.newBrandName.trim();
      await supabase.from("brands").upsert(
        { name, slug: brandToSlug(name), is_active: true },
        { onConflict: "slug" }
      );
    }

    const row = productFormToRow(body);
    const { data, error } = await supabase
      .from("products")
      .update(row)
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already in use." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      if (body.category === "gift-sets") {
        await syncGiftSetItems(id, body.giftSetProductIds ?? []);
      } else {
        await syncGiftSetItems(id, []);
      }
    } catch (syncError) {
      const message =
        syncError instanceof Error ? syncError.message : "Failed to save gift set perfumes.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    await syncProductVariants(id, body.variants, { onSale: body.flash_sale });

    if (body.category !== "gift-sets") {
      try {
        let scentSlugs = [...(body.scentSlugs ?? [])];
        if (body.newScentName?.trim()) {
          const slug = await ensureScentByName(supabase, body.newScentName.trim());
          if (!scentSlugs.includes(slug)) scentSlugs.push(slug);
        }
        await syncProductScents(supabase, id, scentSlugs);
      } catch (syncError) {
        const message =
          syncError instanceof Error ? syncError.message : "Failed to save scent profiles.";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    try {
      await pruneT40SubcategoryAfterProductChange(
        supabase,
        {
          category: existing?.category,
          subcategory: existing?.subcategory,
        },
        {
          category: body.category,
          subcategory: body.subcategory,
        }
      );
    } catch {
      // Product saved; subcategory cleanup is best-effort.
    }

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("products")
    .select("category, subcategory")
    .eq("id", id)
    .maybeSingle();

  const usedInGiftSets = await getGiftSetsContainingProduct(id);
  if (usedInGiftSets.length > 0) {
    return NextResponse.json(
      { error: formatGiftSetDeleteBlockMessage(usedInGiftSets), giftSets: usedInGiftSets },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This product is linked elsewhere and cannot be deleted. Remove it from any gift sets first.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    if (existing?.category === "t40-exclusives" && existing.subcategory) {
      await pruneT40SubcategoryIfUnused(supabase, existing.subcategory);
    }
  } catch {
    // Product deleted; subcategory cleanup is best-effort.
  }

  return NextResponse.json({ ok: true });
}
