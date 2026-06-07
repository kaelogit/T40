import { createAdminClient } from "@/lib/supabase/admin";
import type { EventScheduleItem, StoreEvent } from "./types";
import { DEFAULT_EVENTS } from "./defaults/events";
import { isEventUpcoming, normalizeSchedule } from "@/lib/events/format";
import { nameToSlug } from "@/lib/products/slug";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  venue_name: string;
  venue_address: string;
  city: string;
  starts_at: string;
  ends_at: string | null;
  schedule: unknown;
  image_url: string;
  ticket_url: string;
  ticket_cta_label: string;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

function mapRow(row: EventRow): StoreEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    city: row.city,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    schedule: normalizeSchedule(row.schedule),
    imageUrl: row.image_url,
    ticketUrl: row.ticket_url,
    ticketCtaLabel: row.ticket_cta_label,
    published: row.published,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

function sortEvents(events: StoreEvent[]): StoreEvent[] {
  return [...events].sort((a, b) => {
    const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (order !== 0) return order;
    return a.startsAt.localeCompare(b.startsAt);
  });
}

async function fetchAllEvents(publishedOnly: boolean): Promise<StoreEvent[] | null> {
  const supabase = createAdminClient();
  let query = supabase.from("events").select("*").order("sort_order", { ascending: true });

  if (publishedOnly) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error || !data?.length) return null;
  return sortEvents((data as EventRow[]).map(mapRow));
}

export async function getEvents(publishedOnly = true): Promise<StoreEvent[]> {
  const fromDb = await fetchAllEvents(publishedOnly);
  if (fromDb?.length) return fromDb;

  const defaults = publishedOnly
    ? DEFAULT_EVENTS.filter((e) => e.published !== false)
    : DEFAULT_EVENTS;
  return sortEvents(defaults);
}

export async function getUpcomingEvents(): Promise<StoreEvent[]> {
  const events = await getEvents(true);
  return events.filter((e) => isEventUpcoming(e));
}

export async function getPastEvents(): Promise<StoreEvent[]> {
  const events = await getEvents(true);
  return events.filter((e) => !isEventUpcoming(e));
}

export async function getEventBySlug(slug: string): Promise<StoreEvent | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();

  if (data) return mapRow(data as EventRow);

  return DEFAULT_EVENTS.find((e) => e.slug === slug) ?? null;
}

export async function getEventsAdmin(): Promise<StoreEvent[]> {
  const fromDb = await fetchAllEvents(false);
  if (fromDb?.length) return fromDb;
  return sortEvents(DEFAULT_EVENTS);
}

export type EventFormInput = Omit<StoreEvent, "id" | "updatedAt">;

export function eventFormToRow(input: EventFormInput) {
  return {
    slug: input.slug.trim() || nameToSlug(input.title),
    title: input.title.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    venue_name: input.venueName.trim(),
    venue_address: input.venueAddress.trim(),
    city: input.city.trim() || "Lagos",
    starts_at: input.startsAt,
    ends_at: input.endsAt?.trim() || null,
    schedule: input.schedule.filter((s) => s.label.trim() && s.time.trim()),
    image_url: input.imageUrl.trim(),
    ticket_url: input.ticketUrl.trim(),
    ticket_cta_label: input.ticketCtaLabel.trim() || "Get tickets",
    published: input.published !== false,
    sort_order: input.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function importDefaultEventsIfEmpty(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase.from("events").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return 0;

  for (const [i, event] of DEFAULT_EVENTS.entries()) {
    await supabase.from("events").insert(eventFormToRow({ ...event, sortOrder: i }));
  }

  return DEFAULT_EVENTS.length;
}

export async function createEvent(input: EventFormInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert(eventFormToRow(input))
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create event.");
  return data.id;
}

export async function updateEvent(id: string, input: EventFormInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").update(eventFormToRow(input)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
