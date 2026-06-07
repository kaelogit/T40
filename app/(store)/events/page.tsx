import Link from "next/link";
import { getPastEvents, getUpcomingEvents } from "@/lib/content/events";
import EventCard from "@/components/events/EventCard";
import { buildPageMetadata } from "@/lib/site/metadata";

export const metadata = buildPageMetadata({
  title: "Events | T40 Perfumes",
  description:
    "Pop-up shows, fragrance experiences, and T40 events across Nigeria. RSVP and get your complimentary tickets.",
  path: "/events",
});

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <div className="min-h-screen bg-t40-white">
      <div className="t40-container px-4 md:px-8 py-12 lg:py-20">
        <header className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
            Experience T40
          </p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-heading text-t40-black mb-4">
            Events
          </h1>
          <p className="text-sm text-t40-grey font-body leading-relaxed">
            Pop-up shows, red carpets, and fragrance experiences. Confirm your attendance and
            meet the T40 team in person.
          </p>
        </header>

        {upcoming.length === 0 && past.length === 0 && (
          <p className="text-sm text-t40-grey font-body border border-dashed border-t40-light p-8">
            No events scheduled right now. Check back soon or follow us on social for updates.
          </p>
        )}

        {upcoming.length > 0 && (
          <section className="mb-16 lg:mb-24">
            <h2 className="text-lg font-black uppercase tracking-wider font-heading text-t40-black mb-8">
              Upcoming
            </h2>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {upcoming.map((event) => (
                <EventCard key={event.id ?? event.slug} event={event} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider font-heading text-t40-grey mb-8">
              Past events
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map((event) => (
                <EventCard key={event.id ?? event.slug} event={event} variant="compact" />
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 pt-8 border-t border-t40-light">
          <Link
            href="/shop"
            className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] transition-colors"
          >
            Shop fragrances →
          </Link>
        </div>
      </div>
    </div>
  );
}
