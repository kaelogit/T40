"use client";

import type { VolumeOption } from "@/types/product";

type Props = {
  options: VolumeOption[];
  selected: string;
  onChange: (variantId: string) => void;
  formatVolumePrice: (variantId: string) => string;
};

export default function VolumeSelector({
  options,
  selected,
  onChange,
  formatVolumePrice,
}: Props) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey mb-3">
        Select size
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt.variantId;
          return (
            <button
              key={opt.variantId}
              type="button"
              onClick={() => onChange(opt.variantId)}
              className={`min-w-[88px] px-4 py-3 border text-left transition-colors ${
                isActive
                  ? "border-t40-black bg-t40-black text-white"
                  : "border-neutral-200 text-t40-black hover:border-t40-black"
              }`}
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest font-heading">
                {opt.label}
              </span>
              <span
                className={`block text-[10px] mt-1 font-heading ${
                  isActive ? "text-white/80" : "text-t40-grey"
                }`}
              >
                {formatVolumePrice(opt.variantId)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
