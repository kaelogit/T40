"use client";

import { useMemo } from "react";
import { Clock, Zap } from "lucide-react";
import type { VariantFormInput } from "@/lib/products/variants";
import { formatPrice } from "@/lib/products/pricing";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black";

const DURATION_PRESETS = [
  { label: "24 hours", days: 1 },
  { label: "3 days", days: 3 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
] as const;

type Props = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  days: number;
  onDaysChange: (days: number) => void;
  variants: VariantFormInput[];
  onVariantsChange: (variants: VariantFormInput[]) => void;
  hideSizeFields?: boolean;
};

function saleDiscountPercent(price: number, salePrice: number | null): number | null {
  if (!salePrice || salePrice <= 0 || price <= 0 || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

function variantLabel(row: VariantFormInput, hideSizeFields: boolean, index: number): string {
  if (hideSizeFields) return "Gift set price";
  const label = row.label.trim();
  if (label) return label;
  return index === 0 ? "Standard price" : `Size ${index + 1}`;
}

export default function FlashSaleEditor({
  enabled,
  onEnabledChange,
  days,
  onDaysChange,
  variants,
  onVariantsChange,
  hideSizeFields = false,
}: Props) {
  const endPreview = useMemo(() => {
    const safeDays = Math.max(1, Math.min(30, days || 7));
    const end = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
    return end.toLocaleString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [days]);

  const setSalePrice = (index: number, salePrice: number | null) => {
    onVariantsChange(
      variants.map((v, i) => (i === index ? { ...v, sale_price: salePrice } : v))
    );
  };

  const handleToggle = (next: boolean) => {
    onEnabledChange(next);
    if (!next) {
      onVariantsChange(variants.map((v) => ({ ...v, sale_price: null })));
    }
  };

  const configuredCount = variants.filter(
    (v) => v.sale_price != null && v.sale_price > 0 && v.sale_price < v.price
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-[#d94625]" />
            Flash sale
          </h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-xl">
            Limited-time pricing with a countdown on the product page, homepage{" "}
            <strong>Limited Time Sale</strong> section, and the shop sale filter.
          </p>
        </div>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer border border-neutral-200 px-3 py-2 bg-white">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest">On</span>
        </label>
      </div>

      {!enabled && (
        <p className="text-xs text-neutral-400 border border-dashed border-neutral-200 px-4 py-6 text-center">
          Turn on flash sale to set a sale price and countdown for this product.
        </p>
      )}

      {enabled && (
        <div className="border border-[#d94625]/25 bg-[#d94625]/[0.04] p-5 sm:p-6 space-y-6">
          <div>
            <p className={labelClass}>How long should the sale run?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => onDaysChange(preset.days)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                    days === preset.days
                      ? "border-[#d94625] bg-[#d94625] text-white"
                      : "border-neutral-200 bg-white hover:border-neutral-400"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className={labelClass}>Custom duration (days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) =>
                    onDaysChange(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600 pb-2.5">
                <Clock size={14} className="text-[#d94625] shrink-0" />
                <span>
                  Countdown ends around{" "}
                  <strong className="text-neutral-900">{endPreview}</strong>
                  {configuredCount === 0 && (
                    <span className="block text-amber-800 mt-1">
                      Set at least one sale price below before saving.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className={labelClass}>Sale prices</p>
            <p className="text-xs text-neutral-500 mb-3">
              {hideSizeFields
                ? "Enter the discounted gift set price. It must be lower than the regular price."
                : variants.length > 1
                  ? "Set a sale price for each size you want on offer."
                  : "Enter the discounted price — must be lower than the regular price."}
            </p>

            <ul className="space-y-3">
              {variants.map((row, index) => {
                const name = variantLabel(row, hideSizeFields, index);
                const discount = saleDiscountPercent(row.price, row.sale_price);
                const invalidSale =
                  row.sale_price != null &&
                  row.sale_price > 0 &&
                  (row.sale_price >= row.price || row.price <= 0);

                return (
                  <li
                    key={row.id ?? `flash-${index}`}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-white border border-neutral-200 p-4"
                  >
                    <div className="sm:col-span-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                        {name}
                      </p>
                      <p className="text-sm font-bold tabular-nums">
                        Was {formatPrice(row.price || 0)}
                      </p>
                    </div>
                    <div className="sm:col-span-4">
                      <label className={labelClass}>Flash sale price (₦)</label>
                      <input
                        type="number"
                        min={1}
                        value={row.sale_price ?? ""}
                        onChange={(e) =>
                          setSalePrice(index, e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder={`e.g. ${row.price ? Math.round(row.price * 0.85) : ""}`}
                        className={`${inputClass} ${invalidSale ? "border-red-400" : ""}`}
                      />
                      {invalidSale && (
                        <p className="text-[10px] text-red-600 mt-1">
                          Must be less than {formatPrice(row.price)}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-5 flex flex-wrap items-center gap-2 pb-1">
                      {discount != null && discount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-[#d94625] text-white">
                          −{discount}% off
                        </span>
                      )}
                      {row.sale_price != null && row.sale_price > 0 && discount == null && !invalidSale && (
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                          Enter a lower price to show savings
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="text-[10px] text-neutral-500 uppercase tracking-wider leading-relaxed border-t border-[#d94625]/15 pt-4">
            Saving starts the countdown from today. Customers see the timer on the product page and
            in homepage flash sale cards.
          </div>
        </div>
      )}
    </section>
  );
}
