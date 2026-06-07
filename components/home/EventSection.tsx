"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreEvent } from "@/lib/content/types";
import EventCard from "@/components/events/EventCard";

const ROTATE_MS = 8000;

type Props = {
  events: StoreEvent[];
};

export default function EventSectionClient({ events }: Props) {
  const [index, setIndex] = useState(0);
  const count = events.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section className="py-16 lg:py-24 bg-t40-light/40 border-y border-t40-light">
      <div className="t40-container px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
              Experience T40
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-heading text-t40-black">
              Upcoming events
            </h2>
          </div>
          <Link
            href="/events"
            className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors shrink-0"
          >
            View all events →
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {events.map((event) => (
                <div key={event.id ?? event.slug} className="w-full shrink-0 px-0.5">
                  <div className="max-w-4xl mx-auto">
                    <EventCard event={event} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-6 z-10 p-2 bg-t40-white border border-t40-light shadow-sm hover:border-t40-black transition-colors hidden sm:flex"
                aria-label="Previous event"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-6 z-10 p-2 bg-t40-white border border-t40-light shadow-sm hover:border-t40-black transition-colors hidden sm:flex"
                aria-label="Next event"
              >
                <ChevronRight size={18} />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {events.map((event, i) => (
                  <button
                    key={event.id ?? event.slug}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === index ? "w-8 bg-[#d94625]" : "w-2 bg-t40-grey/30 hover:bg-t40-grey/50"
                    }`}
                    aria-label={`Go to event ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
