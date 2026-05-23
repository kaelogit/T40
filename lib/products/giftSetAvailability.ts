export type GiftSetAvailabilityInput = {
  name: string;
  in_stock?: boolean | null;
};

export type GiftSetAvailability = {
  total: number;
  available: number;
  minRequired: number;
  canPurchase: boolean;
  availableNames: string[];
  unavailableNames: string[];
  isPartial: boolean;
};

/** Sets with 3+ items need all but one in stock (e.g. 2 of 3). Two-item sets need both. */
export function giftSetMinRequired(totalCount: number): number {
  if (totalCount <= 2) return totalCount;
  return totalCount - 1;
}

export function computeGiftSetAvailability(
  items: GiftSetAvailabilityInput[]
): GiftSetAvailability {
  const total = items.length;
  const availableItems = items.filter((i) => i.in_stock !== false);
  const unavailableItems = items.filter((i) => i.in_stock === false);
  const available = availableItems.length;
  const minRequired = giftSetMinRequired(total);
  const canPurchase = available >= minRequired && total >= 2;

  return {
    total,
    available,
    minRequired,
    canPurchase,
    availableNames: availableItems.map((i) => i.name),
    unavailableNames: unavailableItems.map((i) => i.name),
    isPartial: canPurchase && available < total,
  };
}

export function giftSetAvailabilityLabel(availability: GiftSetAvailability): string {
  if (availability.available === 0) return "Out of stock";
  if (availability.available === availability.total) {
    return `All ${availability.total} fragrances in stock`;
  }
  return `${availability.available} of ${availability.total} fragrances in stock`;
}
