import { isSaleActive } from "@/lib/products/sale";
import type { ProductVariant } from "@/lib/products/variants";
import {
  generalSalePrice,
  isGeneralFlashSaleLive,
  isProductEligibleForGeneralSale,
  type GeneralFlashSaleContent,
} from "./generalFlashSale";

export type EffectiveSaleSource = "product" | "general" | null;

export type EffectiveSaleState = {
  active: boolean;
  endsAt: string | null;
  source: EffectiveSaleSource;
  percentOff?: number;
};

type SaleProduct = {
  price: number | string;
  sale_price?: number | string | null;
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
  category?: string | null;
  product_type?: string | null;
};

export function getEffectiveSaleState(
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): EffectiveSaleState {
  if (isSaleActive(product)) {
    return {
      active: true,
      endsAt: product.sale_ends_at ?? null,
      source: "product",
    };
  }

  if (
    generalSale &&
    isGeneralFlashSaleLive(generalSale) &&
    isProductEligibleForGeneralSale(product, generalSale)
  ) {
    return {
      active: true,
      endsAt: generalSale.endsAt,
      source: "general",
      percentOff: generalSale.percentOff,
    };
  }

  return { active: false, endsAt: null, source: null };
}

export function effectiveProductUnitPrice(
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): { price: number; compareAt: number | null; sale: EffectiveSaleState } {
  const base = Number(product.price) || 0;
  const sale = getEffectiveSaleState(product, generalSale);

  if (!sale.active) {
    return { price: base, compareAt: null, sale };
  }

  if (sale.source === "product") {
    const unit =
      product.sale_price != null && Number(product.sale_price) > 0
        ? Number(product.sale_price)
        : base;
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  if (sale.source === "general" && generalSale) {
    const unit = generalSalePrice(base, generalSale.percentOff);
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  return { price: base, compareAt: null, sale };
}

export function effectiveVariantUnitPrice(
  variant: ProductVariant,
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): { price: number; compareAt: number | null; sale: EffectiveSaleState } {
  const base = variant.price;
  const sale = getEffectiveSaleState(product, generalSale);

  if (!sale.active) {
    return { price: base, compareAt: null, sale };
  }

  if (sale.source === "product") {
    const unit =
      variant.sale_price != null && variant.sale_price > 0 ? variant.sale_price : base;
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  if (sale.source === "general" && generalSale) {
    const unit = generalSalePrice(base, generalSale.percentOff);
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  return { price: base, compareAt: null, sale };
}
