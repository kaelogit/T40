import { Gift } from "lucide-react";

type Props = {
  includes?: string[];
  unavailable?: string[];
  partial?: boolean;
  compact?: boolean;
};

export default function GiftSetLineDetails({
  includes,
  unavailable,
  partial,
  compact = false,
}: Props) {
  if (!includes?.length) return null;

  const textSize = compact ? "text-[9px]" : "text-[10px]";
  const badgeSize = compact ? "text-[8px] px-1 py-0.5" : "text-[9px] px-1.5 py-0.5";

  return (
    <div className={`mt-2 space-y-1.5 ${compact ? "" : "mt-2"}`}>
      <span
        className={`inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-black uppercase tracking-widest ${badgeSize}`}
      >
        <Gift size={compact ? 10 : 11} strokeWidth={2.25} />
        Gift set
      </span>
      <ul className={`${textSize} text-t40-grey font-body normal-case tracking-normal leading-snug space-y-0.5 pl-0 list-none`}>
        {includes.map((name) => (
          <li key={name}>• {name}</li>
        ))}
      </ul>
      {unavailable && unavailable.length > 0 && (
        <p className={`${textSize} text-amber-700 font-body normal-case leading-snug`}>
          Temporarily unavailable: {unavailable.join(", ")}
        </p>
      )}
      {partial && (!unavailable || unavailable.length === 0) && (
        <p className={`${textSize} text-amber-700 font-body normal-case leading-snug`}>
          Partial set — some items may ship when back in stock.
        </p>
      )}
    </div>
  );
}
