export type GeneralFlashSaleLayout = "featured" | "grid" | "banner" | "rolling";

export type GeneralFlashSaleContent = {
  active: boolean;
  percentOff: number;
  endsAt: string | null;
  eyebrow: string;
  title: string;
  homepageLayout: GeneralFlashSaleLayout;
  excludeGiftSets: boolean;
  updatedAt?: string;
};

export const DEFAULT_GENERAL_FLASH_SALE: GeneralFlashSaleContent = {
  active: false,
  percentOff: 20,
  endsAt: null,
  eyebrow: "Special Offers",
  title: "Site-Wide Flash Sale",
  homepageLayout: "featured",
  excludeGiftSets: true,
};

export const GENERAL_FLASH_SALE_LAYOUT_OPTIONS: {
  value: GeneralFlashSaleLayout;
  label: string;
  description: string;
}[] = [
  {
    value: "featured",
    label: "Featured hero",
    description: "Large spotlight product with smaller offers beside it — bold and editorial.",
  },
  {
    value: "grid",
    label: "Product grid",
    description: "Four equal cards in a clean grid — great when you want variety on show.",
  },
  {
    value: "banner",
    label: "Promo banner",
    description: "Full-width countdown banner with a shop CTA — minimal, high impact.",
  },
  {
    value: "rolling",
    label: "Rolling banner",
    description: "Continuous scrolling ticker with sale headline, discount, and countdown.",
  },
];

export function isGeneralFlashSaleLive(
  config: GeneralFlashSaleContent | null | undefined
): boolean {
  if (!config?.active) return false;
  if (!config.endsAt) return true;
  return new Date(config.endsAt).getTime() > Date.now();
}

export function isProductEligibleForGeneralSale(
  product: { category?: string | null; product_type?: string | null },
  config: GeneralFlashSaleContent
): boolean {
  if (
    config.excludeGiftSets &&
    (product.category === "gift-sets" || product.product_type === "gift_set")
  ) {
    return false;
  }
  return true;
}

export function generalSalePrice(basePrice: number, percentOff: number): number {
  const pct = Math.min(100, Math.max(0, percentOff));
  return Math.round(basePrice * (1 - pct / 100));
}

export function endsAtFromDurationDays(days: number): string {
  const d = Math.max(1, Math.floor(days));
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
}

export function validateGeneralFlashSaleInput(
  input: GeneralFlashSaleContent
): string | null {
  if (!input.active) return null;
  if (input.percentOff < 1 || input.percentOff > 90) {
    return "Discount must be between 1% and 90%.";
  }
  if (!input.title.trim()) return "Sale headline is required.";
  if (!input.endsAt) return "End date and time are required for an active sale.";
  if (new Date(input.endsAt).getTime() <= Date.now()) {
    return "End date must be in the future.";
  }
  return null;
}
