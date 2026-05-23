"use client";

import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";

export type AppliedCoupon = {
  code: string;
  discountAmount: number;
  description: string | null;
};

type Props = {
  subtotal: number;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onClear: () => void;
};

export default function CouponInput({ subtotal, applied, onApply, onClear }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid coupon.");
      }
      onApply({
        code: data.code,
        discountAmount: data.discountAmount,
        description: data.description,
      });
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply coupon.");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Tag size={14} className="text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 font-heading">
                {applied.code} applied
              </p>
              {applied.description && (
                <p className="text-xs text-emerald-700 mt-1 font-body">{applied.description}</p>
              )}
              <p className="text-xs font-bold text-emerald-800 mt-1 font-heading">
                −{formatPrice(applied.discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-emerald-700 hover:text-emerald-900 transition-colors"
            aria-label="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          placeholder="e.g. WELCOME10"
          className="flex-1 border border-t40-light px-4 py-3 text-sm font-heading uppercase tracking-wider focus:outline-none focus:border-t40-black"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-5 py-3 border border-t40-black text-[10px] font-bold uppercase tracking-widest font-heading hover:bg-t40-black hover:text-white transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 font-body">{error}</p>}
    </div>
  );
}
