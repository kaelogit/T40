import type { ProductDetail } from "@/types/product";
import { isSaleActive } from "@/lib/products/sale";
import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";
import { getEffectiveSaleState, effectiveProductUnitPrice } from "@/lib/sales/effectivePricing";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getProductPricing(
  product: ProductDetail,
  generalSale?: GeneralFlashSaleContent | null
) {
  if (generalSale) {
    const { price: unitPrice, compareAt, sale } = effectiveProductUnitPrice(product, generalSale);
    const basePrice = product.price || 0;
    const discount =
      compareAt && compareAt > 0
        ? Math.round(((compareAt - unitPrice) / compareAt) * 100)
        : sale.percentOff ?? 0;
    return { basePrice, unitPrice, compareAt, discount };
  }

  const basePrice = product.price || 0;
  const onSale = isSaleActive(product);
  const unitPrice =
    onSale && product.sale_price ? product.sale_price : basePrice;

  const compareAt = unitPrice < basePrice ? basePrice : null;
  const discount =
    compareAt && compareAt > 0
      ? Math.round(((compareAt - unitPrice) / compareAt) * 100)
      : 0;

  return { basePrice, unitPrice, compareAt, discount };
}

export function cartLineId(variantId: string): string {
  return variantId;
}
