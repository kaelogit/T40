"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import type { FaqCategory } from "@/lib/content/types";

export default function FaqAdmin() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ question: "", answer: "" });
  const [editItem, setEditItem] = useState<{ id: string; question: string; answer: string } | null>(
    null
  );

  const load = () => {
    fetch("/api/admin/content/faq")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const importDefaults = async () => {
    setImporting(true);
    await fetch("/api/admin/content/faq", { method: "PUT" });
    setLoading(true);
    load();
    setImporting(false);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/content/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", title: newCategory, sortOrder: categories.length }),
    });
    if (res.ok) {
      setNewCategory("");
      load();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!id || !confirm("Delete this category and all its questions?")) return;
    await fetch(`/api/admin/content/faq/categories/${id}`, { method: "DELETE" });
    load();
  };

  const addItem = async (categoryId: string) => {
    if (!newItem.question.trim() || !newItem.answer.trim()) return;
    const cat = categories.find((c) => c.id === categoryId);
    await fetch("/api/admin/content/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "item",
        categoryId,
        question: newItem.question,
        answer: newItem.answer,
        sortOrder: cat?.items.length ?? 0,
      }),
    });
    setNewItem({ question: "", answer: "" });
    setAddingItemFor(null);
    load();
  };

  const saveItem = async () => {
    if (!editItem) return;
    await fetch(`/api/admin/content/faq/items/${editItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: editItem.question,
        answer: editItem.answer,
      }),
    });
    setEditItem(null);
    load();
  };

  const deleteItem = async (id: string) => {
    if (!id || !confirm("Delete this question?")) return;
    await fetch(`/api/admin/content/faq/items/${id}`, { method: "DELETE" });
    load();
  };

  const needsImport = categories.length > 0 && categories.every((c) => !c.id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">FAQ</h1>
        {(categories.length === 0 || needsImport) && (
          <button
            type="button"
            onClick={importDefaults}
            disabled={importing}
            className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
          >
            {importing ? "Importing..." : "Import default FAQ"}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-10">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category title..."
          className="flex-1 border border-neutral-200 px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={addCategory}
          className="px-4 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat.id ?? cat.title} className="border border-neutral-200 p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-black uppercase tracking-wider">{cat.title}</h2>
              {cat.id && (
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id!)}
                  className="text-red-600 p-1 hover:bg-red-50"
                  aria-label="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <ul className="space-y-4 mb-6">
              {cat.items.map((item) => (
                <li key={item.id ?? item.question} className="border-b border-neutral-100 pb-4">
                  {editItem?.id === item.id && editItem ? (
                    <div className="space-y-2">
                      <input
                        value={editItem.question}
                        onChange={(e) =>
                          setEditItem({ ...editItem, question: e.target.value })
                        }
                        className="w-full border px-3 py-2 text-sm font-bold"
                      />
                      <textarea
                        rows={3}
                        value={editItem.answer}
                        onChange={(e) => setEditItem({ ...editItem, answer: e.target.value })}
                        className="w-full border px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={saveItem} className="p-2 bg-black text-white">
                          <Check size={14} />
                        </button>
                        <button type="button" onClick={() => setEditItem(null)} className="p-2 border">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold mb-1">{item.question}</p>
                        <p className="text-xs text-neutral-600 leading-relaxed">{item.answer}</p>
                      </div>
                      {item.id && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditItem({
                                id: item.id!,
                                question: item.question,
                                answer: item.answer,
                              })
                            }
                            className="p-2 hover:bg-neutral-100"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id!)}
                            className="p-2 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {cat.id && (
              addingItemFor === cat.id ? (
                <div className="space-y-2 bg-neutral-50 p-4">
                  <input
                    value={newItem.question}
                    onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                    placeholder="Question"
                    className="w-full border px-3 py-2 text-sm"
                  />
                  <textarea
                    rows={3}
                    value={newItem.answer}
                    onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                    placeholder="Answer"
                    className="w-full border px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addItem(cat.id!)}
                      className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase"
                    >
                      Add
                    </button>
                    <button type="button" onClick={() => setAddingItemFor(null)} className="px-4 py-2 border text-[10px] font-bold uppercase">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingItemFor(cat.id!)}
                  className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add question
                </button>
              )
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
