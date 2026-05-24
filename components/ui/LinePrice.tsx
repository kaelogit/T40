import { formatPrice } from "@/lib/products/pricing";

type Props = {
  price: number;
  compareAt?: number | null;
  quantity?: number;
  align?: "left" | "right";
  size?: "sm" | "md";
  showEach?: boolean;
};

export default function LinePrice({
  price,
  compareAt,
  quantity = 1,
  align = "right",
  size = "sm",
  showEach = true,
}: Props) {
  const unitCompare = compareAt != null && compareAt > price ? compareAt : null;
  const lineTotal = price * quantity;
  const lineCompare = unitCompare != null ? unitCompare * quantity : null;
  const alignClass = align === "right" ? "text-right" : "text-left";
  const totalClass = size === "md" ? "text-sm font-bold" : "text-sm font-bold";
  const compareClass =
    size === "md" ? "text-xs text-neutral-400 line-through" : "text-[10px] text-t40-grey line-through";

  return (
    <div className={alignClass}>
      {lineCompare != null && (
        <p className={`${compareClass} decoration-1`}>{formatPrice(lineCompare)}</p>
      )}
      <p className={`${totalClass} ${unitCompare != null ? "text-[#d94625]" : "text-t40-black"}`}>
        {formatPrice(lineTotal)}
      </p>
      {showEach && quantity > 1 && (
        <p className="text-[10px] text-t40-grey font-heading mt-0.5">
          {unitCompare != null && (
            <span className="line-through mr-1.5">{formatPrice(unitCompare)}</span>
          )}
          {formatPrice(price)} each
        </p>
      )}
    </div>
  );
}
