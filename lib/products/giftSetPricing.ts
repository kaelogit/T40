export type GiftSetBundleItem = {
  price: number;
  quantity: number;
};

export function giftSetIndividualTotal(items: GiftSetBundleItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function giftSetSavings(individualTotal: number, setPrice: number) {
  if (individualTotal <= setPrice) {
    return { amount: 0, percent: 0 };
  }
  const amount = individualTotal - setPrice;
  const percent = Math.round((amount / individualTotal) * 100);
  return { amount, percent };
}
