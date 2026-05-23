/** True when a product row represents a gift set (bundle), not a single perfume. */
export function isGiftSetProduct(product: {
  category?: string | null;
  product_type?: string | null;
}): boolean {
  return product.category === "gift-sets" || product.product_type === "gift_set";
}
