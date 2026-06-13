"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_GENERAL_FLASH_SALE,
  GENERAL_FLASH_SALE_LAYOUT_OPTIONS,
  endsAtFromDurationDays,
  type GeneralFlashSaleContent,
} from "@/lib/sales/generalFlashSale";
import {
  GENERAL_SALE_LAGOS_FLAT_FEE,
  GENERAL_SALE_LAGOS_FREE_MIN,
} from "@/lib/shipping/promotions";
import { formatPrice } from "@/lib/products/pricing";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

const DURATION_PRESETS = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
];

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function GeneralFlashSaleAdmin() {
  const router = useRouter();
  const [form, setForm] = useState<GeneralFlashSaleContent>(DEFAULT_GENERAL_FLASH_SALE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content/general-flash-sale")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setForm(d.content);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  const setEndsAtFromLocal = (value: string) => {
    setForm((f) => ({ ...f, endsAt: fromDatetimeLocalValue(value) }));
  };

  const applyDuration = (days: number) => {
    setForm((f) => ({ ...f, endsAt: endsAtFromDurationDays(days) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/content/general-flash-sale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
    } else {
      setMessage(form.active ? "General flash sale is live on the storefront." : "Flash sale saved.");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      <div className="border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 space-y-2">
        <p>
          Apply one discount to every eligible product at once — no need to edit each perfume
          individually. Prices update across the shop, cart, and checkout while the sale is active.
        </p>
        <p className="text-[11px] text-neutral-500">
          Lagos delivery during the sale: free on orders over{" "}
          {formatPrice(GENERAL_SALE_LAGOS_FREE_MIN)};{" "}
          {formatPrice(GENERAL_SALE_LAGOS_FLAT_FEE)} flat rate below that (Lagos only).
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => {
            const active = e.target.checked;
            setForm((f) => ({
              ...f,
              active,
              endsAt: active && !f.endsAt ? endsAtFromDurationDays(7) : f.endsAt,
            }));
          }}
          className="h-4 w-4"
        />
        <span className="text-sm font-bold uppercase tracking-wider">Activate general flash sale</span>
      </label>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Discount (% off)</label>
          <input
            type="number"
            min={1}
            max={90}
            value={form.percentOff}
            onChange={(e) =>
              setForm((f) => ({ ...f, percentOff: Number(e.target.value) || 0 }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Exclude gift sets</label>
          <label className="flex items-center gap-2 mt-3 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={form.excludeGiftSets}
              onChange={(e) => setForm((f) => ({ ...f, excludeGiftSets: e.target.checked }))}
            />
            Do not discount gift sets
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className={labelClass}>Sale ends</label>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => applyDuration(days)}
              className="px-3 py-1.5 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:border-black transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="datetime-local"
          value={toDatetimeLocalValue(form.endsAt)}
          onChange={(e) => setEndsAtFromLocal(e.target.value)}
          className={inputClass}
        />
        <p className="text-[10px] text-neutral-400">
          Use a quick duration above or pick an exact end date and time.
        </p>
      </div>

      <div>
        <label className={labelClass}>Homepage eyebrow</label>
        <input
          value={form.eyebrow}
          onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
          placeholder="Special Offers"
          className={inputClass}
        />
        <p className="text-[10px] text-neutral-400 mt-1">Small label above the main headline.</p>
      </div>

      <div>
        <label className={labelClass}>Homepage headline</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Summer Sale — 20% Off Everything"
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <label className={labelClass}>Homepage design</label>
        <div className="grid gap-3">
          {GENERAL_FLASH_SALE_LAYOUT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex gap-4 border p-4 cursor-pointer transition-colors ${
                form.homepageLayout === opt.value
                  ? "border-black bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="homepageLayout"
                value={opt.value}
                checked={form.homepageLayout === opt.value}
                onChange={() => setForm((f) => ({ ...f, homepageLayout: opt.value }))}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-black uppercase tracking-wider">{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save flash sale"}
      </button>
    </form>
  );
}
