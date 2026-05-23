"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";

import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";

type PickableProduct = {
  id: string;
  name: string;
  brand: string | null;
  images: string[] | null;
  price: number;
  category?: string | null;
  product_type?: string | null;
};

type Props = {
  selectedIds: string[];
  onChange: (ids: string[], suggestedPrice: number) => void;
  /** When editing a gift set, exclude it from the picker */
  excludeProductId?: string;
};

function sumSelectedPrices(catalog: PickableProduct[], ids: string[]): number {
  return ids.reduce((sum, id) => {
    const product = catalog.find((p) => p.id === id);
    return sum + (product?.price ?? 0);
  }, 0);
}

export default function GiftSetPicker({ selectedIds, onChange, excludeProductId }: Props) {
  const [catalog, setCatalog] = useState<PickableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickId, setPickId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (excludeProductId) params.set("exclude", excludeProductId);
    const qs = params.toString();

    fetch(`/api/admin/products/pickable${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        const singles = (d.products ?? []).filter(
          (p: PickableProduct) => !isGiftSetProduct(p)
        );
        setCatalog(singles);
      })
      .finally(() => setLoading(false));
  }, [excludeProductId]);

  const selected = selectedIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter(Boolean) as PickableProduct[];

  const add = () => {
    if (!pickId || selectedIds.includes(pickId)) return;
    const nextIds = [...selectedIds, pickId];
    onChange(nextIds, sumSelectedPrices(catalog, nextIds));
    setPickId("");
  };

  const remove = (id: string) => {
    const nextIds = selectedIds.filter((x) => x !== id);
    onChange(nextIds, sumSelectedPrices(catalog, nextIds));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-neutral-500 text-sm py-4">
        <Loader2 size={16} className="animate-spin" /> Loading perfumes...
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 p-5 space-y-4 bg-neutral-50/50">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1">
          Gift set combo
        </p>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Pick the individual perfumes in this set. Customers see all of them on the product page;
          checkout shows one combined line with every name listed.
        </p>
      </div>

      {selected.length > 0 && (
        <ul className="space-y-2">
          {selected.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 bg-white border border-neutral-200 p-2"
            >
              <div className="relative w-10 h-10 bg-neutral-100 shrink-0">
                <Image
                  src={p.images?.[0] || "/placeholder.jpg"}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="flex-1 text-xs font-bold">{p.name}</span>
              <span className="text-[10px] text-neutral-500 tabular-nums">
                ₦{p.price.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="p-1 text-neutral-400 hover:text-red-600"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <select
          value={pickId}
          onChange={(e) => setPickId(e.target.value)}
          className="flex-1 border border-neutral-200 px-3 py-2.5 text-sm"
        >
          <option value="">Add a perfume...</option>
          {catalog
            .filter((p) => !selectedIds.includes(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand ? `${p.brand} — ` : ""}
                {p.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={!pickId}
          className="px-4 py-2.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          aria-label="Add perfume"
        >
          <Plus size={16} />
        </button>
      </div>

      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <p className="text-xs text-amber-700">Add at least 2 perfumes for a gift set.</p>
      )}
    </div>
  );
}
