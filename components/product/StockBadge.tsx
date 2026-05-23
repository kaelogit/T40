type Props = {
  inStock: boolean;
  lowStock?: boolean;
  stockQuantity?: number | null;
};

export default function StockBadge({ inStock, lowStock, stockQuantity }: Props) {
  if (!inStock) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-[#d94625]">
        Out of stock
      </span>
    );
  }

  if (lowStock) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-amber-700">
        {stockQuantity != null ? `Only ${stockQuantity} left` : "Low stock"}
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-emerald-700">
      In stock
    </span>
  );
}
