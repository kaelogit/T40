/** Stock helpers — quantity tracking is optional per product (null = manual in_stock only). */

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export type StockFields = {
  in_stock?: boolean | null;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
};

export function isTrackedStock(product: StockFields): boolean {
  return product.stock_quantity != null;
}

export function effectiveInStock(product: StockFields): boolean {
  if (isTrackedStock(product)) {
    return (product.stock_quantity ?? 0) > 0;
  }
  return product.in_stock !== false;
}

export function isLowStock(product: StockFields): boolean {
  if (!isTrackedStock(product)) return false;
  const qty = product.stock_quantity ?? 0;
  const threshold = product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  return qty > 0 && qty <= threshold;
}

export function stockLabel(product: StockFields): string {
  if (!effectiveInStock(product)) return "Out of stock";
  if (isLowStock(product)) return `Low stock (${product.stock_quantity} left)`;
  if (isTrackedStock(product)) return `${product.stock_quantity} in stock`;
  return "In stock";
}
