"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import type { AnnouncementContent } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

const EMPTY_ANNOUNCEMENT = (): AnnouncementContent => ({
  active: true,
  badgeLabel: "",
  messageShort: "",
  messageFull: "",
  readLinkLabel: "Learn more",
  readLinkHref: "/",
  sortOrder: 0,
  links: [],
});

export default function AnnouncementsAdmin() {
  const router = useRouter();
  const [items, setItems] = useState<AnnouncementContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/content/announcement")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.announcements ?? []) as AnnouncementContent[];
        setItems(list);
        if (list.length && !expandedId) setExpandedId(list[0].id ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const importDefaults = async () => {
    setImporting(true);
    setError(null);
    const res = await fetch("/api/admin/content/announcement", { method: "PUT" });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Could not import defaults.");
    else {
      setMessage(data.imported ? "Default announcements imported." : "Announcements already exist.");
      setLoading(true);
      load();
    }
    setImporting(false);
  };

  const updateItem = (id: string | undefined, patch: Partial<AnnouncementContent>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id || (!id && !item.id) ? { ...item, ...patch } : item))
    );
  };

  const updateLink = (
    announcementId: string | undefined,
    index: number,
    field: "label" | "href",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== announcementId) return item;
        const links = [...item.links];
        links[index] = { ...links[index], [field]: value };
        return { ...item, links };
      })
    );
  };

  const saveItem = async (item: AnnouncementContent) => {
    if (!item.messageShort?.trim() || !item.messageFull?.trim()) {
      setError("Short and full messages are required.");
      return;
    }

    setSavingId(item.id ?? "new");
    setError(null);
    setMessage(null);

    const payload = {
      active: item.active,
      badgeLabel: item.badgeLabel,
      messageShort: item.messageShort,
      messageFull: item.messageFull,
      readLinkLabel: item.readLinkLabel,
      readLinkHref: item.readLinkHref,
      sortOrder: item.sortOrder ?? 0,
      links: item.links.filter((l) => l.label.trim() && l.href.trim()),
    };

    const res = item.id
      ? await fetch(`/api/admin/content/announcement/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/content/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
    } else {
      setMessage(item.id ? "Announcement saved." : "Announcement created.");
      setLoading(true);
      load();
      router.refresh();
    }
    setSavingId(null);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    setError(null);
    const res = await fetch(`/api/admin/content/announcement/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not delete.");
      return;
    }
    setMessage("Announcement deleted.");
    setLoading(true);
    load();
    router.refresh();
  };

  const addNew = async () => {
    setCreating(true);
    setError(null);
    const draft = {
      ...EMPTY_ANNOUNCEMENT(),
      sortOrder: items.length,
      badgeLabel: "New announcement",
      messageShort: "Short message for mobile",
      messageFull: "Full message for desktop",
    };

    const res = await fetch("/api/admin/content/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create announcement.");
    } else {
      setMessage("New announcement created — edit and save below.");
      setExpandedId(data.id ?? null);
      setLoading(true);
      load();
    }
    setCreating(false);
  };

  const toggleActive = async (item: AnnouncementContent) => {
    const next = { ...item, active: !item.active };
    updateItem(item.id, { active: next.active });
    if (item.id) await saveItem(next);
  };

  const needsImport = items.length > 0 && items.every((a) => !a.id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-neutral-500 font-body max-w-xl">
          Create multiple announcements and toggle each on or off. Active ones rotate in the
          storefront banner every few seconds.
        </p>
        <div className="flex flex-wrap gap-2">
          {(items.length === 0 || needsImport) && (
            <button
              type="button"
              onClick={importDefaults}
              disabled={importing}
              className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
            >
              {importing ? "Importing..." : "Import defaults"}
            </button>
          )}
          <button
            type="button"
            onClick={addNew}
            disabled={creating}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            <Plus size={14} />
            {creating ? "Creating..." : "New announcement"}
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 p-6">
          No announcements yet. Import the defaults (awards + free Lagos shipping) or create a new
          one.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, itemIndex) => {
          const open = expandedId === item.id;
          return (
            <div key={item.id ?? itemIndex} className="border border-neutral-200 bg-white">
              <div className="flex items-center gap-3 p-4">
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={() => toggleActive(item)}
                    className="w-4 h-4"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Live
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : (item.id ?? null))}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-sm font-bold truncate">
                    {item.badgeLabel || "Untitled announcement"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{item.messageShort}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : (item.id ?? null))}
                  className="p-2 text-neutral-400 hover:text-black"
                  aria-label={open ? "Collapse" : "Expand"}
                >
                  {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {item.id && (
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id!)}
                    className="p-2 text-red-600 hover:bg-red-50"
                    aria-label="Delete announcement"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {open && (
                <div className="border-t border-neutral-200 p-5 space-y-5">
                  <div>
                    <label className={labelClass}>Sort order</label>
                    <input
                      type="number"
                      min={0}
                      value={item.sortOrder ?? 0}
                      onChange={(e) =>
                        updateItem(item.id, { sortOrder: Number(e.target.value) || 0 })
                      }
                      className={`${inputClass} max-w-[120px]`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Badge label</label>
                    <input
                      value={item.badgeLabel}
                      onChange={(e) => updateItem(item.id, { badgeLabel: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Message (mobile / short)</label>
                    <input
                      value={item.messageShort}
                      onChange={(e) => updateItem(item.id, { messageShort: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Message (desktop / full)</label>
                    <textarea
                      rows={3}
                      value={item.messageFull}
                      onChange={(e) => updateItem(item.id, { messageFull: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Read more link label</label>
                      <input
                        value={item.readLinkLabel}
                        onChange={(e) => updateItem(item.id, { readLinkLabel: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Read more link URL</label>
                      <input
                        value={item.readLinkHref}
                        onChange={(e) => updateItem(item.id, { readLinkHref: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="border border-neutral-200 p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Quick links (desktop)
                    </p>
                    {item.links.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={link.label}
                          onChange={(e) => updateLink(item.id, i, "label", e.target.value)}
                          placeholder="Label"
                          className={`${inputClass} flex-1`}
                        />
                        <input
                          value={link.href}
                          onChange={(e) => updateLink(item.id, i, "href", e.target.value)}
                          placeholder="/product/slug"
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(item.id, {
                              links: item.links.filter((_, j) => j !== i),
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50"
                          aria-label="Remove link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(item.id, {
                          links: [...item.links, { label: "", href: "" }],
                        })
                      }
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Plus size={14} /> Add link
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveItem(item)}
                    disabled={savingId === (item.id ?? "new")}
                    className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {savingId === (item.id ?? "new") ? "Saving..." : "Save announcement"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
