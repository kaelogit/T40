import type { ProductDetail } from "@/types/product";
import type { Tables } from "@/types/database";

export function normalizeProduct(row: Tables<"products">): ProductDetail {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    product_type: (row.product_type === "gift_set" ? "gift_set" : "single") as "single" | "gift_set",
    price: Number(row.price) || 0,
    sale_price: row.sale_price != null ? Number(row.sale_price) : undefined,
    on_sale: row.on_sale ?? false,
    images: row.images?.length ? row.images : [],
    category: row.category ?? undefined,
    subcategory: row.subcategory ?? undefined,
    audience: row.audience ?? undefined,
    brand: row.brand ?? undefined,
    badge: (row.badge as ProductDetail["badge"]) ?? null,
    notes: row.notes ?? undefined,
    occasion: row.occasion ?? undefined,
    in_stock: row.in_stock ?? true,
    stock_quantity: row.stock_quantity != null ? Number(row.stock_quantity) : undefined,
    low_stock_threshold: row.low_stock_threshold ?? undefined,
    is_new_arrival: row.is_new_arrival ?? false,
    sale_ends_at: row.sale_ends_at ?? undefined,
    description: row.description ?? undefined,
  };
}
