import { notFound } from "next/navigation";
import EventForm from "@/components/admin/content/EventForm";
import { getEventsAdmin } from "@/lib/content/events";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const events = await getEventsAdmin();
  const event = events.find((e) => e.id === id);
  return { title: event ? `Edit ${event.title} | T40` : "Edit event | T40" };
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const events = await getEventsAdmin();
  const event = events.find((e) => e.id === id);
  if (!event?.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit event</h1>
      <EventForm eventId={event.id} initial={event} />
    </div>
  );
}
