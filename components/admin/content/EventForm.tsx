"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { nameToSlug } from "@/lib/products/slug";
import type { EventScheduleItem, StoreEvent } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

const emptyEvent: Omit<StoreEvent, "id"> = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  venueName: "",
  venueAddress: "",
  city: "Lagos",
  startsAt: "",
  endsAt: "",
  schedule: [],
  imageUrl: "",
  ticketUrl: "",
  ticketCtaLabel: "Get tickets",
  published: true,
  sortOrder: 0,
};

type Props = { eventId?: string; initial?: StoreEvent };

export default function EventForm({ eventId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyEvent, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSchedule = (index: number, field: keyof EventScheduleItem, value: string) => {
    const schedule = [...form.schedule];
    schedule[index] = { ...schedule[index], [field]: value };
    set("schedule", schedule);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      slug: form.slug.trim() || nameToSlug(form.title),
      endsAt: form.endsAt?.trim() || null,
    };

    const url = eventId
      ? `/api/admin/content/events/${eventId}`
      : "/api/admin/content/events";
    const method = eventId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      setSaving(false);
      return;
    }

    router.push("/admin/content/events");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published !== false}
          onChange={(e) => set("published", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-bold">Published on storefront</span>
      </label>

      <div>
        <label className={labelClass}>Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
          placeholder="T40 Perfumes Pop Up Show"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-from-title"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder ?? 0}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tagline (short promo line)</label>
        <input
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          className={inputClass}
          placeholder="Your complimentary ticket to the T40 Perfumes Lagos Show"
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
          placeholder="Full event details for the event page..."
        />
      </div>

      <SingleImageUploader
        image={form.imageUrl}
        onChange={(url) => set("imageUrl", url)}
        label="Event image / flyer"
        folder="content"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            required
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date (optional, multi-day)</label>
          <input
            type="date"
            value={form.endsAt ?? ""}
            onChange={(e) => set("endsAt", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Venue name</label>
          <input
            value={form.venueName}
            onChange={(e) => set("venueName", e.target.value)}
            className={inputClass}
            placeholder="Bature Brewery"
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Venue address</label>
        <input
          value={form.venueAddress}
          onChange={(e) => set("venueAddress", e.target.value)}
          className={inputClass}
          placeholder="256 Etim Inyang Crescent, Victoria Island"
        />
      </div>

      <div className="border border-neutral-200 p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Schedule highlights (optional)
        </p>
        {form.schedule.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item.label}
              onChange={(e) => updateSchedule(i, "label", e.target.value)}
              placeholder="Red Carpet"
              className={`${inputClass} flex-1`}
            />
            <input
              value={item.time}
              onChange={(e) => updateSchedule(i, "time", e.target.value)}
              placeholder="2pm"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => set("schedule", form.schedule.filter((_, j) => j !== i))}
              className="p-2 text-red-600 hover:bg-red-50"
              aria-label="Remove schedule item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("schedule", [...form.schedule, { label: "", time: "" }])}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} /> Add time slot
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ticket / RSVP link</label>
          <input
            type="url"
            value={form.ticketUrl}
            onChange={(e) => set("ticketUrl", e.target.value)}
            className={inputClass}
            placeholder="https://eventbrite.com/..."
          />
        </div>
        <div>
          <label className={labelClass}>Button label</label>
          <input
            value={form.ticketCtaLabel}
            onChange={(e) => set("ticketCtaLabel", e.target.value)}
            className={inputClass}
            placeholder="Confirm attendance"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? "Saving..." : eventId ? "Save event" : "Create event"}
      </button>
    </form>
  );
}
