import type { Product } from "@/components/product/ProductCard";

import type { ProductVariant } from "@/lib/products/variants";

export type ProductDetail = Product & {
  slug: string | null;
  product_type?: "single" | "gift_set";
  sale_ends_at?: string | null;
  description?: string | null;
  brand?: string | null;
  notes?: string | null;
  occasion?: string | null;
  variants?: ProductVariant[];
  defaultVariant?: ProductVariant;
  bundleItems?: {
    id: string;
    name: string;
    slug: string | null;
    brand: string | null;
    images: string[];
    price: number;
    quantity: number;
    in_stock?: boolean;
  }[];
};

/** @deprecated Use product.variants from DB — kept for VolumeSelector shape */
export type VolumeOption = {
  size: string;
  label: string;
  price: number;
  compareAt?: number | null;
  variantId: string;
};
