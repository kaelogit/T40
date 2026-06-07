import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import type { StoreEvent } from "@/lib/content/types";
import { formatEventDateRange, isEventUpcoming } from "@/lib/events/format";

type Props = {
  event: StoreEvent;
};

export default function EventDetailContent({ event }: Props) {
  const upcoming = isEventUpcoming(event);

  return (
    <article>
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All events
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] bg-t40-light overflow-hidden border border-t40-light">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#d94625]/20 to-t40-light" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 font-heading ${
                upcoming ? "bg-[#d94625] text-white" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {upcoming ? "Upcoming" : "Past event"}
            </span>
          </div>

          {event.tagline && (
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d94625] mb-3 font-heading">
              {event.tagline}
            </p>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter font-heading text-t40-black mb-8">
            {event.title}
          </h1>

          <dl className="space-y-4 mb-8 border-y border-t40-light py-6">
            <div className="flex gap-3">
              <Calendar size={18} className="shrink-0 text-[#d94625] mt-0.5" />
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-t40-grey font-heading">
                  Date
                </dt>
                <dd className="text-sm font-body text-t40-black mt-1">
                  {formatEventDateRange(event)}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin size={18} className="shrink-0 text-[#d94625] mt-0.5" />
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-t40-grey font-heading">
                  Venue
                </dt>
                <dd className="text-sm font-body text-t40-black mt-1">
                  {event.venueName}
                  <br />
                  {event.venueAddress}
                  <br />
                  {event.city}
                </dd>
              </div>
            </div>
            {event.schedule.length > 0 && (
              <div className="flex gap-3">
                <Clock size={18} className="shrink-0 text-[#d94625] mt-0.5" />
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-t40-grey font-heading">
                    Schedule
                  </dt>
                  <dd className="mt-2 space-y-2">
                    {event.schedule.map((item) => (
                      <div
                        key={`${item.label}-${item.time}`}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-body"
                      >
                        <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-t40-black">
                          {item.label}
                        </span>
                        <span className="text-t40-grey">{item.time}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          {event.description && (
            <div className="prose prose-sm max-w-none font-body text-t40-grey leading-relaxed whitespace-pre-line mb-10">
              {event.description}
            </div>
          )}

          {upcoming && event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-t40-black text-t40-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors"
            >
              {event.ticketCtaLabel || "Get tickets"}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
