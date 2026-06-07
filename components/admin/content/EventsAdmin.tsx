"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { StoreEvent } from "@/lib/content/types";
import { formatEventShortDate, isEventUpcoming } from "@/lib/events/format";

export default function EventsAdmin() {
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/content/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const importDefaults = async () => {
    setImporting(true);
    await fetch("/api/admin/content/events", { method: "PUT" });
    setLoading(true);
    load();
    setMessage("Default events imported.");
    setImporting(false);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/admin/content/events/${id}`, { method: "DELETE" });
    setLoading(true);
    load();
  };

  const needsImport = events.length > 0 && events.every((e) => !e.id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <p className="text-sm text-neutral-500 font-body max-w-xl">
          Add pop-ups and shows. Upcoming events appear on the homepage and at{" "}
          <code className="text-xs">/events</code>. Past events move to an archive section
          automatically — unpublish or delete when you no longer want them listed.
        </p>
        <div className="flex flex-wrap gap-2">
          {(events.length === 0 || needsImport) && (
            <button
              type="button"
              onClick={importDefaults}
              disabled={importing}
              className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
            >
              {importing ? "Importing..." : "Import Lagos show"}
            </button>
          )}
          <Link
            href="/admin/content/events/new"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
          >
            <Plus size={14} />
            New event
          </Link>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-700 mb-6">{message}</p>}

      {events.length === 0 ? (
        <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 p-6">
          No events yet. Import the Lagos pop-up show or create a new event.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const upcoming = isEventUpcoming(event);
            return (
              <div
                key={event.id ?? event.slug}
                className="border border-neutral-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {event.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="w-full sm:w-24 h-32 sm:h-20 object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-black uppercase tracking-wide truncate">
                      {event.title}
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                        upcoming ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {upcoming ? "Upcoming" : "Past"}
                    </span>
                    {!event.published && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-800">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatEventShortDate(event)}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin size={12} />
                      {event.venueName}, {event.city}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {event.id && (
                    <>
                      <Link
                        href={`/admin/content/events/${event.id}`}
                        className="inline-flex items-center gap-1 border border-neutral-300 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-black"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id!)}
                        className="p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
