"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CouponFormInput } from "@/lib/admin/couponForm";
import { formatPrice } from "@/lib/products/pricing";

const emptyForm: CouponFormInput = {
  code: "",
  description: null,
  discount_type: "percent",
  discount_value: 10,
  max_discount: null,
  min_order: 0,
  max_uses: null,
  active: true,
  expires_at: null,
};

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

type Props = {
  couponId?: string;
  initial?: CouponFormInput;
};

export default function CouponForm({ couponId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CouponFormInput>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CouponFormInput>(key: K, value: CouponFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons";
    const method = couponId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not save coupon.");
      setSaving(false);
      return;
    }

    router.push("/admin/coupons");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      <div>
        <label className={labelClass}>Code</label>
        <input
          required
          value={form.code}
          onChange={(e) => set("code", e.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className={inputClass}
          disabled={Boolean(couponId)}
        />
        {couponId && (
          <p className="text-[10px] text-neutral-400 mt-1">Code cannot be changed after creation.</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Description (optional)</label>
        <input
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          placeholder="10% off your first order"
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Discount type</label>
          <select
            value={form.discount_type}
            onChange={(e) => set("discount_type", e.target.value as "percent" | "fixed")}
            className={inputClass}
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed amount (₦)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            {form.discount_type === "percent" ? "Percent off" : "Amount off (₦)"}
          </label>
          <input
            required
            type="number"
            min={1}
            max={form.discount_type === "percent" ? 100 : undefined}
            value={form.discount_value || ""}
            onChange={(e) => set("discount_value", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {form.discount_type === "percent" && (
        <div>
          <label className={labelClass}>Max discount cap (₦, optional)</label>
          <input
            type="number"
            min={1}
            value={form.max_discount ?? ""}
            onChange={(e) =>
              set("max_discount", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="e.g. 5000 — limits how much % discount can take off"
            className={inputClass}
          />
          <p className="text-[10px] text-neutral-400 mt-1">
            Example: 10% off with a {formatPrice(5000)} cap means large orders never save more than{" "}
            {formatPrice(5000)}.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Minimum order (₦)</label>
          <input
            type="number"
            min={0}
            value={form.min_order || ""}
            onChange={(e) => set("min_order", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Usage limit (optional)</label>
          <input
            type="number"
            min={1}
            value={form.max_uses ?? ""}
            onChange={(e) =>
              set("max_uses", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Unlimited"
            className={inputClass}
          />
        </div>
      </div>

      <div className="border border-neutral-200 bg-neutral-50/50 p-5 space-y-3">
        <div>
          <label className={labelClass}>Expiration date (optional)</label>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Leave blank for a coupon that never expires. After this date and time, customers
            cannot use the code at checkout.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="datetime-local"
              value={form.expires_at ?? ""}
              onChange={(e) => set("expires_at", e.target.value || null)}
              className={`${inputClass} flex-1 min-w-[220px] bg-white`}
            />
            {form.expires_at && (
              <button
                type="button"
                onClick={() => set("expires_at", null)}
                className="px-4 py-2.5 border border-neutral-300 text-[10px] font-bold uppercase tracking-widest hover:border-black bg-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-bold">Active</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#d94625] transition-colors"
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Saving...
          </span>
        ) : couponId ? (
          "Update coupon"
        ) : (
          "Create coupon"
        )}
      </button>
    </form>
  );
}
