import { getUpcomingEvents } from "@/lib/content/events";
import EventSectionClient from "@/components/home/EventSection";

export default async function EventSection() {
  const events = await getUpcomingEvents();
  if (!events.length) return null;
  return <EventSectionClient events={events} />;
}
