import { ReactNode } from "react";

type BadgeColor = "black" | "red" | "gold" | "green" | "gray";
type BadgeVariant = "solid" | "outline" | "dot";

export function Badge({
  children,
  color = "black",
  variant = "solid",
  className = "",
}: {
  children: ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  className?: string;
}) {
  const colors: Record<BadgeColor, Record<BadgeVariant, string>> = {
    black: {
      solid: "bg-t40-black text-white",
      outline: "border border-t40-black text-t40-black",
      dot: "bg-t40-black",
    },
    red: {
      solid: "bg-[#d94625] text-white",
      outline: "border border-[#d94625] text-[#d94625]",
      dot: "bg-[#d94625]",
    },
    gold: {
      solid: "bg-[#c9a96e] text-white",
      outline: "border border-[#c9a96e] text-[#c9a96e]",
      dot: "bg-[#c9a96e]",
    },
    green: {
      solid: "bg-green-600 text-white",
      outline: "border border-green-600 text-green-600",
      dot: "bg-green-600",
    },
    gray: {
      solid: "bg-neutral-300 text-neutral-700",
      outline: "border border-neutral-300 text-neutral-500",
      dot: "bg-neutral-300",
    },
  };

  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest font-heading rounded-sm";

  if (variant === "dot") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-heading text-neutral-600 ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors[color].dot}`} />
        {children}
      </span>
    );
  }

  return (
    <span className={`${base} ${colors[color][variant]} ${className}`}>
      {children}
    </span>
  );
}