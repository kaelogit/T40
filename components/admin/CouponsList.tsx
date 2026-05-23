"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";
import { formatCouponExpiry, isCouponExpired } from "@/lib/admin/couponForm";

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

function discountLabel(c: CouponRow): string {
  if (c.discount_type === "percent") {
    const cap =
      c.max_discount != null ? `, max ${formatPrice(Number(c.max_discount))}` : "";
    return `${c.discount_value}%${cap}`;
  }
  return formatPrice(Number(c.discount_value));
}

export default function CouponsList() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setLoadError(d.error);
        else setCoupons(d.coupons ?? []);
      })
      .catch(() => setLoadError("Could not load coupons."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((c) => c.filter((x) => x.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors"
        >
          Add coupon
        </Link>
      </div>

      {loadError && (
        <p className="mb-4 p-4 border border-red-200 bg-red-50 text-sm text-red-800">{loadError}</p>
      )}

      {coupons.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {loadError ? "Fix the error above and refresh." : "No coupons yet."}
        </p>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min order</th>
                <th className="text-left p-4">Uses</th>
                <th className="text-left p-4">Expires</th>
                <th className="text-left p-4">Status</th>
                <th className="p-4 w-24" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = isCouponExpired(c.expires_at);
                const exhausted =
                  c.max_uses != null && c.used_count >= c.max_uses;
                return (
                  <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                    <td className="p-4">
                      <p className="font-bold text-xs">{c.code}</p>
                      {c.description && (
                        <p className="text-[10px] text-neutral-400 mt-0.5">{c.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold">{discountLabel(c)}</td>
                    <td className="p-4 text-xs">
                      {Number(c.min_order) > 0 ? formatPrice(Number(c.min_order)) : "—"}
                    </td>
                    <td className="p-4 text-xs">
                      {c.used_count}
                      {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={expired ? "text-neutral-400 line-through" : ""}>
                        {formatCouponExpiry(c.expires_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-1 ${
                          !c.active || expired || exhausted
                            ? "bg-neutral-100 text-neutral-500"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {!c.active
                          ? "Inactive"
                          : expired
                            ? "Expired"
                            : exhausted
                              ? "Used up"
                              : "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/coupons/${c.id}`}
                          className="p-2 hover:bg-neutral-200 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(c.id, c.code)}
                          disabled={deleting === c.id}
                          className="p-2 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                          aria-label="Delete"
                        >
                          {deleting === c.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
