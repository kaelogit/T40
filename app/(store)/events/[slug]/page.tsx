import { notFound } from "next/navigation";
import EventDetailContent from "@/components/events/EventDetailContent";
import { getEventBySlug } from "@/lib/content/events";
import { buildPageMetadata } from "@/lib/site/metadata";
import { DEFAULT_EVENTS } from "@/lib/content/defaults/events";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return DEFAULT_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event | T40 Perfumes" };
  return buildPageMetadata({
    title: `${event.title} | T40 Events`,
    description: event.tagline || event.description.slice(0, 160),
    path: `/events/${event.slug}`,
    image: event.imageUrl || undefined,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || event.published === false) notFound();

  return (
    <div className="min-h-screen bg-t40-white">
      <div className="t40-container px-4 md:px-8 py-12 lg:py-20 max-w-6xl mx-auto">
        <EventDetailContent event={event} />
      </div>
    </div>
  );
}
