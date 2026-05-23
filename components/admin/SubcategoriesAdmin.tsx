"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/catalog/productCategories";
import type { ProductSubcategory } from "@/lib/catalog/subcategories";

type EditDraft = {
  name: string;
  slug: string;
  sort_order: number;
};

export default function SubcategoriesAdmin() {
  const [items, setItems] = useState<ProductSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState("t40-exclusives");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ name: "", slug: "", sort_order: 0 });
  const [deleteTarget, setDeleteTarget] = useState<ProductSubcategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoadError(null);
    fetch("/api/admin/subcategories")
      .then(async (r) => {
        let d: { subcategories?: ProductSubcategory[]; error?: string };
        try {
          d = await r.json();
        } catch {
          setLoadError(`Could not load subcategories (${r.status}). The admin API may be misconfigured.`);
          setItems([]);
          return;
        }
        if (!r.ok || d.error) {
          setLoadError(d.error ?? `Could not load subcategories (${r.status}).`);
          setItems([]);
          return;
        }
        setItems(d.subcategories ?? []);
      })
      .catch(() => setLoadError("Could not load subcategories."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setActionError(null);
    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent_category: parent,
        name: name.trim(),
        sort_order: items.filter((i) => i.parent_category === parent).length,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setName("");
      load();
    } else {
      setActionError(data.error ?? "Could not add subcategory.");
    }
    setSaving(false);
  };

  const startEdit = (item: ProductSubcategory) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      slug: item.slug,
      sort_order: item.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft.name.trim() || !editDraft.slug.trim()) return;
    setSaving(true);
    setActionError(null);
    const res = await fetch(`/api/admin/subcategories/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name.trim(),
        slug: editDraft.slug.trim(),
        sort_order: editDraft.sort_order,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      setActionError(data.error ?? "Could not save subcategory.");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await fetch(`/api/admin/subcategories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    setDeleteLoading(false);
    load();
  };

  const toggleActive = async (item: ProductSubcategory) => {
    await fetch(`/api/admin/subcategories/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  const grouped = PRODUCT_CATEGORIES.filter((c) => c.hasSubcategories).map((cat) => ({
    ...cat,
    items: items.filter((i) => i.parent_category === cat.value),
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Subcategories</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Manage T40 Exclusives subcategories. These are the same items under Shop → T40 Exclusives
          in your navigation — edits here update the storefront navbar immediately.
        </p>
      </div>

      {loadError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-sm text-red-800">{loadError}</div>
      )}

      {actionError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-sm text-red-800">{actionError}</div>
      )}

      <div className="border border-neutral-200 p-5 mb-10 space-y-3 bg-neutral-50/50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Add subcategory
        </p>
        <div className="flex flex-wrap gap-2">
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="border border-neutral-200 px-3 py-2.5 text-sm"
          >
            {PRODUCT_CATEGORIES.filter((c) => c.hasSubcategories).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Oud Perfume"
            className="flex-1 min-w-[180px] border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={add}
            disabled={saving || !name.trim()}
            className="px-4 py-2.5 bg-black text-white disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {grouped.map(({ label, value, items: subItems }) => (
        <section key={value} className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-wider mb-4">{label}</h2>
          {subItems.length === 0 ? (
            <p className="text-sm text-neutral-400">No subcategories yet.</p>
          ) : (
            <ul className="border border-neutral-200 divide-y divide-neutral-100">
              {subItems.map((item) => (
                <li key={item.id} className="p-4 text-sm">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                            Name
                          </span>
                          <input
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                            className="mt-1 w-full border border-neutral-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                            Slug (URL)
                          </span>
                          <input
                            value={editDraft.slug}
                            onChange={(e) => setEditDraft((d) => ({ ...d, slug: e.target.value }))}
                            className="mt-1 w-full border border-neutral-200 px-3 py-2 text-sm font-mono"
                          />
                        </label>
                      </div>
                      <label className="block max-w-[120px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                          Sort order
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={editDraft.sort_order}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              sort_order: Number.parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="mt-1 w-full border border-neutral-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <p className="text-xs text-neutral-500">
                        Changing the slug updates shop URLs. Products already assigned this subcategory
                        keep their stored slug until you edit each product.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={saving || !editDraft.name.trim() || !editDraft.slug.trim()}
                          className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">{item.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          className={`text-[9px] font-bold uppercase px-2 py-1 ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {item.is_active ? "Active" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="bg-white border border-neutral-200 shadow-xl max-w-md w-full p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-subcategory-title"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2
                id="delete-subcategory-title"
                className="text-sm font-black uppercase tracking-wider"
              >
                Delete subcategory?
              </h2>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-neutral-400 hover:text-black"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-neutral-600 mb-2">
              You are about to delete <strong>{deleteTarget.name}</strong> (
              <code className="text-xs">{deleteTarget.slug}</code>).
            </p>
            <p className="text-xs text-neutral-500 mb-6">
              This removes it from the navbar. Products already using this subcategory keep their
              stored slug — they will not be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/admin/products"
        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
      >
        ← Back to products
      </Link>
    </div>
  );
}
