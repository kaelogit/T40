import type { ProductDetail } from "@/types/product";
import { isSaleActive } from "@/lib/products/sale";
import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";
import { effectiveInStock } from "@/lib/products/stock";
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
  "id" | "name" | "price" | "sale_price" | "on_sale" | "sale_ends_at" | "variants" | "category" | "product_type"
>;

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
  options?: { isGiftSet?: boolean }
): CartLinePayload | null {
  if (!product.id) return null;

  const saleActive = isSaleActive(product);
  const isGiftSet = options?.isGiftSet ?? isGiftSetProduct(product);
  const variants = getActiveVariants(product);
  const variant = variants.length
    ? getCardVariant(variants) ?? getDefaultVariant(variants)
    : null;

  if (variant) {
    const price = variantEffectivePrice(variant, saleActive);
    const compareAt = variantCompareAtPrice(variant, saleActive, price);
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

  const unitPrice = saleActive && product.sale_price ? product.sale_price : price;
  const compareAtPrice =
    saleActive && product.sale_price && unitPrice < price ? price : undefined;
  const sizeLabel = isGiftSet ? "Gift set" : "";

  return {
    id: `${product.id}::${sizeLabel}`,
    productId: product.id,
    name: product.name,
    price: unitPrice,
    compareAtPrice,
    size: sizeLabel || undefined,
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
