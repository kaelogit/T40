import type { EventScheduleItem, StoreEvent } from "@/lib/content/types";

export function parseEventDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** End of event day in local time — used to treat multi-day events as upcoming until the last day ends. */
export function eventEndDate(event: Pick<StoreEvent, "startsAt" | "endsAt">): Date {
  const endIso = event.endsAt?.trim() || event.startsAt;
  const end = parseEventDate(endIso);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isEventUpcoming(event: Pick<StoreEvent, "startsAt" | "endsAt">, now = new Date()): boolean {
  return eventEndDate(event) >= now;
}

export function formatEventDateRange(event: Pick<StoreEvent, "startsAt" | "endsAt">): string {
  const start = parseEventDate(event.startsAt);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const startStr = start.toLocaleDateString("en-GB", opts);

  if (!event.endsAt || event.endsAt === event.startsAt) {
    return startStr;
  }

  const end = parseEventDate(event.endsAt);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()}–${end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
  }

  return `${startStr} – ${end.toLocaleDateString("en-GB", opts)}`;
}

export function formatEventShortDate(event: Pick<StoreEvent, "startsAt" | "endsAt">): string {
  const start = parseEventDate(event.startsAt);
  if (!event.endsAt || event.endsAt === event.startsAt) {
    return start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  const end = parseEventDate(event.endsAt);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
  }
  return formatEventDateRange(event);
}

export function normalizeSchedule(raw: unknown): EventScheduleItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is EventScheduleItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as EventScheduleItem).label === "string" &&
        typeof (item as EventScheduleItem).time === "string"
      );
    })
    .map((item) => ({ label: item.label.trim(), time: item.time.trim() }))
    .filter((item) => item.label && item.time);
}
