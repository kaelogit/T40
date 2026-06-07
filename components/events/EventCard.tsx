import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { StoreEvent } from "@/lib/content/types";
import { formatEventShortDate } from "@/lib/events/format";

type Props = {
  event: StoreEvent;
  variant?: "card" | "compact";
};

export default function EventCard({ event, variant = "card" }: Props) {
  const href = `/events/${event.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group block border border-t40-light bg-t40-white hover:border-[#d94625]/40 transition-colors"
      >
        <div className="grid sm:grid-cols-[140px_1fr] gap-0">
          <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[120px] bg-t40-light">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                sizes="140px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#d94625]/20 to-t40-light" />
            )}
          </div>
          <div className="p-4 flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#d94625] mb-1 font-heading">
              {formatEventShortDate(event)}
            </p>
            <p className="text-sm font-black uppercase tracking-wide font-heading text-t40-black group-hover:text-[#d94625] transition-colors">
              {event.title}
            </p>
            <p className="text-[10px] text-t40-grey mt-1 font-body line-clamp-1">
              {event.venueName}, {event.city}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group h-full flex flex-col bg-t40-white border border-t40-light overflow-hidden hover:border-[#d94625]/30 transition-colors">
      <Link href={href} className="relative block aspect-[16/10] bg-t40-light overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#d94625]/15 via-t40-light to-t40-white" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 bg-[#d94625] text-t40-white text-[9px] font-bold uppercase tracking-[0.2em] font-heading">
            {formatEventShortDate(event)}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6 lg:p-8">
        {event.tagline && (
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d94625] mb-3 font-heading line-clamp-2">
            {event.tagline}
          </p>
        )}
        <Link href={href}>
          <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight font-heading text-t40-black group-hover:text-[#d94625] transition-colors mb-4">
            {event.title}
          </h3>
        </Link>

        <ul className="space-y-2 text-[11px] text-t40-grey font-body mb-6">
          <li className="flex items-start gap-2">
            <Calendar size={14} className="shrink-0 mt-0.5 text-t40-black" />
            {formatEventShortDate(event)}
          </li>
          <li className="flex items-start gap-2">
            <MapPin size={14} className="shrink-0 mt-0.5 text-t40-black" />
            <span>
              {event.venueName}
              {event.venueAddress ? ` — ${event.venueAddress}` : ""}, {event.city}
            </span>
          </li>
        </ul>

        <div className="mt-auto flex flex-wrap gap-3">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] transition-colors"
          >
            Event details
            <ArrowRight size={14} />
          </Link>
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-t40-black text-t40-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors"
            >
              {event.ticketCtaLabel || "Get tickets"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
