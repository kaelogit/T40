/** Flash sale is active only while `on_sale` is true and the end time has not passed. */
export function isSaleActive(product: {
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
}): boolean {
  if (!product.on_sale) return false;
  if (!product.sale_ends_at) return true;
  return new Date(product.sale_ends_at).getTime() > Date.now();
}

export function activeSaleOrFilter(isoNow: string): string {
  return `sale_ends_at.is.null,sale_ends_at.gt.${isoNow}`;
}
