type SaleProductRow = {
  price?: number | string | null;
  sale_price?: number | string | null;
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
};

/** Flash sale is active only while `on_sale` is true and the end time has not passed. */
export function isSaleActive(product: {
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
}): boolean {
  if (!product.on_sale) return false;
  if (!product.sale_ends_at) return true;
  return new Date(product.sale_ends_at).getTime() > Date.now();
}

/** Per-product flash sale with a real discounted price (not a stale `on_sale` flag). */
export function hasProductLevelFlashSale(product: SaleProductRow): boolean {
  if (!isSaleActive(product)) return false;
  const base = Number(product.price) || 0;
  const salePrice = product.sale_price != null ? Number(product.sale_price) : 0;
  return salePrice > 0 && salePrice < base;
}
export function activeSaleOrFilter(isoNow: string): string {
  return `sale_ends_at.is.null,sale_ends_at.gt.${isoNow}`;
}
