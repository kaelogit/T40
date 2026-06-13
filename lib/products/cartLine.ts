import type { ProductDetail } from "@/types/product";
import { isSaleActive } from "@/lib/products/sale";
import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";
import { effectiveInStock } from "@/lib/products/stock";
import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";
import { getEffectiveSaleState, effectiveProductUnitPrice } from "@/lib/sales/effectivePricing";
import {
  getActiveVariants,
  getCardVariant,
  getDefaultVariant,
  lineDisplayName,
  variantEffectivePrice,
  variantCompareAtPrice,
  variantInStock,
} from "./variants";

type CartProduct = Pick<
  ProductDetail,
  "id" | "name" | "price" | "sale_price" | "on_sale" | "sale_ends_at" | "variants" | "category"
> & {
  product_type?: string | null;
  in_stock?: boolean | null;
  stock_quantity?: number | null;
};

export type CartLinePayload = {
  id: string;
  variantId?: string;
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  size?: string;
};

export function buildCartLinePayload(
  product: CartProduct,
  options?: { isGiftSet?: boolean; generalSale?: GeneralFlashSaleContent | null }
): CartLinePayload | null {
  if (!product.id) return null;

  const generalSale = options?.generalSale ?? null;
  const saleActive = generalSale
    ? getEffectiveSaleState(product, generalSale).active
    : isSaleActive(product);
  const isGiftSet = options?.isGiftSet ?? isGiftSetProduct(product);
  const variants = getActiveVariants(product);
  const variant = variants.length
    ? getCardVariant(variants) ?? getDefaultVariant(variants)
    : null;

  if (variant) {
    const price = variantEffectivePrice(variant, saleActive, generalSale, product);
    const compareAt = variantCompareAtPrice(variant, saleActive, price, generalSale, product);
    return {
      id: variant.id,
      variantId: variant.id,
      productId: product.id,
      name: isGiftSet ? product.name : lineDisplayName(product.name, variant.label),
      price,
      compareAtPrice: compareAt ?? undefined,
      size: isGiftSet ? "Gift set" : variant.label.trim() || undefined,
    };
  }

  const price = Number(product.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  if (generalSale) {
    const { price: unitPrice, compareAt } = effectiveProductUnitPrice(product, generalSale);
    const legacyKey = isGiftSet ? "Gift set" : "default";
    return {
      id: `${product.id}::${legacyKey}`,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      compareAtPrice: compareAt ?? undefined,
      size: isGiftSet ? "Gift set" : undefined,
    };
  }

  const unitPrice = saleActive && product.sale_price ? product.sale_price : price;
  const compareAtPrice =
    saleActive && product.sale_price && unitPrice < price ? price : undefined;
  const legacyKey = isGiftSet ? "Gift set" : "default";

  return {
    id: `${product.id}::${legacyKey}`,
    productId: product.id,
    name: product.name,
    price: unitPrice,
    compareAtPrice,
    size: isGiftSet ? "Gift set" : undefined,
  };
}

export function canAddProductToCart(product: CartProduct): boolean {
  const line = buildCartLinePayload(product);
  if (!line) return false;

  const variants = getActiveVariants(product);
  const variant = variants.length
    ? getCardVariant(variants) ?? getDefaultVariant(variants)
    : null;

  if (variant) return variantInStock(variant, product);
  return effectiveInStock(product);
}
