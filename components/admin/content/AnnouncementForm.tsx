"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { AnnouncementContent } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

export default function AnnouncementForm() {
  const router = useRouter();
  const [form, setForm] = useState<AnnouncementContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content/announcement")
      .then((r) => r.json())
      .then((d) => setForm(d.announcement))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  const set = <K extends keyof AnnouncementContent>(key: K, value: AnnouncementContent[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/content/announcement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Could not save.");
    else {
      setMessage("Announcement saved.");
      router.refresh();
    }
    setSaving(false);
  };

  const updateLink = (index: number, field: "label" | "href", value: string) => {
    const links = [...form.links];
    links[index] = { ...links[index], [field]: value };
    set("links", links);
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-bold">Show announcement bar on storefront</span>
      </label>

      <div>
        <label className={labelClass}>Badge label</label>
        <input
          value={form.badgeLabel}
          onChange={(e) => set("badgeLabel", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Message (mobile / short)</label>
        <input
          value={form.messageShort}
          onChange={(e) => set("messageShort", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Message (desktop / full)</label>
        <textarea
          rows={3}
          value={form.messageFull}
          onChange={(e) => set("messageFull", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Read more link label</label>
          <input
            value={form.readLinkLabel}
            onChange={(e) => set("readLinkLabel", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Read more link URL</label>
          <input
            value={form.readLinkHref}
            onChange={(e) => set("readLinkHref", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="border border-neutral-200 p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Quick links (desktop)
        </p>
        {form.links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              placeholder="Label"
              className={`${inputClass} flex-1`}
            />
            <input
              value={link.href}
              onChange={(e) => updateLink(i, "href", e.target.value)}
              placeholder="/product/slug"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => set("links", form.links.filter((_, j) => j !== i))}
              className="p-2 text-red-600 hover:bg-red-50"
              aria-label="Remove link"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("links", [...form.links, { label: "", href: "" }])}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} /> Add link
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save announcement"}
      </button>
    </form>
  );
}
