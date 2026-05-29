"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Search, Trash2, ExternalLink, Barcode } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";
import { getAbsoluteProductUrl } from "@/lib/products/storeUrl";
import { effectiveInStock, isLowStock, stockLabel } from "@/lib/products/stock";
import { PRODUCT_CATEGORIES } from "@/lib/catalog/productCategories";
import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  product_type?: string | null;
  price: number;
  on_sale: boolean | null;
  badge: string | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  images: string[] | null;
};

const TYPE_FILTERS = [
  { value: "all", label: "All products" },
  { value: "perfumes", label: "Perfumes only" },
  { value: "gift-sets", label: "Gift sets only" },
];

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

export default function ProductsList() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState("all");
  const [stock, setStock] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoadError(null);
    fetch("/api/admin/products")
      .then(async (r) => {
        let d: { products?: ProductRow[]; error?: string };
        try {
          d = await r.json();
        } catch {
          setLoadError(`Could not load products (${r.status}). The admin API may be misconfigured.`);
          setProducts([]);
          return;
        }
        if (!r.ok || d.error) {
          setLoadError(d.error ?? `Could not load products (${r.status}).`);
          setProducts([]);
          return;
        }
        setProducts(d.products ?? []);
      })
      .catch(() => setLoadError("Could not load products. Check your connection and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const giftSet = isGiftSetProduct(p);
      if (productType === "gift-sets" && !giftSet) return false;
      if (productType === "perfumes" && giftSet) return false;
      if (category !== "all" && p.category !== category) return false;
      if (stock === "in" && !effectiveInStock(p)) return false;
      if (stock === "out" && effectiveInStock(p)) return false;
      if (stock === "low" && (!effectiveInStock(p) || !isLowStock(p))) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [products, query, category, productType, stock]);

  const { giftSetRows, perfumeRows } = useMemo(() => {
    const giftSetRows = filtered.filter((p) => isGiftSetProduct(p));
    const perfumeRows = filtered.filter((p) => !isGiftSetProduct(p));
    return { giftSetRows, perfumeRows };
  }, [filtered]);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setProducts((p) => p.filter((x) => x.id !== id));
    } else {
      alert(data.error ?? "Could not delete this product.");
    }
    setDeleting(null);
  };

  const inputClass =
    "border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white";

  const categoryLabel = (p: ProductRow) => {
    if (isGiftSetProduct(p)) return "Gift set";
    return PRODUCT_CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category ?? "—";
  };

  const renderRow = (p: ProductRow) => {
    const giftSet = isGiftSetProduct(p);
    const label = stockLabel(p);
    const out = !effectiveInStock(p);
    const low = isLowStock(p);

    return (
      <tr
        key={p.id}
        className={`border-b border-neutral-100 hover:bg-neutral-50/50 ${
          giftSet ? "bg-amber-50/40" : ""
        }`}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images?.[0] ?? "/placeholder.jpg"}
              alt=""
              className={`w-10 h-10 object-cover bg-neutral-100 shrink-0 ${
                giftSet ? "ring-2 ring-amber-400/60" : ""
              }`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-xs uppercase tracking-wide truncate">{p.name}</p>
                {giftSet && (
                  <span className="shrink-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-200 text-amber-950">
                    Gift set
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 truncate">{p.slug}</p>
            </div>
          </div>
        </td>
        <td className="p-4 text-xs hidden sm:table-cell">{p.brand ?? "—"}</td>
        <td className="p-4 text-xs hidden md:table-cell">
          {categoryLabel(p)}
          {p.badge && (
            <span className="block text-[9px] text-[#d94625] font-bold uppercase mt-0.5">
              {p.badge}
            </span>
          )}
        </td>
        <td className="p-4 text-xs font-bold whitespace-nowrap">{formatPrice(Number(p.price))}</td>
        <td className="p-4">
          <span
            className={`text-[9px] font-bold uppercase px-2 py-1 whitespace-nowrap ${
              out
                ? "bg-red-100 text-red-700"
                : low
                  ? "bg-amber-100 text-amber-800"
                  : p.on_sale
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {out ? "Out of stock" : p.on_sale ? `On sale · ${label}` : label}
          </span>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-1">
            <a
              href={getAbsoluteProductUrl(p)}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-neutral-200 transition-colors text-neutral-500 hover:text-black"
              aria-label="View on store"
              title="View on store"
            >
              <ExternalLink size={14} />
            </a>
            <a
              href={`/admin/products/${p.id}/barcode`}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-neutral-200 transition-colors text-neutral-500 hover:text-black"
              aria-label="Barcode"
              title="Print barcode"
            >
              <Barcode size={14} />
            </a>
            <Link
              href={`/admin/products/${p.id}`}
              className="p-2 hover:bg-neutral-200 transition-colors"
              aria-label="Edit"
            >
              <Pencil size={14} />
            </Link>
            <button
              type="button"
              onClick={() => remove(p.id, p.name)}
              disabled={deleting === p.id}
              className="p-2 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
              aria-label="Delete"
            >
              {deleting === p.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderTable = (rows: ProductRow[], sectionTitle?: string) => (
    <div className={sectionTitle ? "border border-neutral-200 overflow-x-auto bg-white" : ""}>
      {sectionTitle && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          {sectionTitle}
        </p>
      )}
      <table className="w-full text-sm">
        {!sectionTitle && (
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4 hidden sm:table-cell">Brand</th>
              <th className="text-left p-4 hidden md:table-cell">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Status</th>
              <th className="p-4 w-44" />
            </tr>
          </thead>
        )}
        {sectionTitle && (
          <thead>
            <tr className="border-b border-neutral-100 bg-white text-[9px] font-bold uppercase tracking-widest text-neutral-400">
              <th className="text-left p-3 pl-4">Product</th>
              <th className="text-left p-3 hidden sm:table-cell">Brand</th>
              <th className="text-left p-3 hidden md:table-cell">Type</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3 w-44" />
            </tr>
          </thead>
        )}
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new?type=gift-set"
            className="border border-amber-700 text-amber-950 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-100 transition-colors"
          >
            Add gift set
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors"
          >
            Add perfume
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-sm text-red-800">
          <p className="font-bold mb-1">Could not load products</p>
          <p>{loadError}</p>
          <p className="mt-2 text-xs text-red-700">
            If this mentions a missing column, run{" "}
            <code className="bg-red-100 px-1">20260606000000_fix_subcategories_policy_and_stock.sql</code>{" "}
            in Supabase SQL Editor.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 border border-neutral-200 bg-white">
        <div className="sm:col-span-2">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Search
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, brand, or slug..."
              className={`${inputClass} w-full pl-9`}
            />
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Product type
          </label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className={`${inputClass} w-full`}
          >
            {TYPE_FILTERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} w-full`}
          >
            <option value="all">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Stock
          </label>
          <select value={stock} onChange={(e) => setStock(e.target.value)} className={`${inputClass} w-full`}>
            {STOCK_FILTERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {loadError ? "Fix the error above, then refresh." : "No products yet."}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500 text-sm py-12 text-center border border-neutral-200 bg-white">
          No products match your filters.
        </p>
      ) : (
        <div className="space-y-6">
          <p className="text-[10px] text-neutral-400">
            {filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}
            {productType === "all" && giftSetRows.length > 0 && perfumeRows.length > 0 && (
              <span>
                {" "}
                · {giftSetRows.length} gift set{giftSetRows.length !== 1 ? "s" : ""},{" "}
                {perfumeRows.length} perfume{perfumeRows.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>

          {productType === "all" && giftSetRows.length > 0 && perfumeRows.length > 0 ? (
            <>
              {renderTable(giftSetRows, `Gift sets (${giftSetRows.length})`)}
              {renderTable(perfumeRows, `Perfumes (${perfumeRows.length})`)}
            </>
          ) : (
            <div className="border border-neutral-200 overflow-x-auto bg-white">
              {renderTable(filtered)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
