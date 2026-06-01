"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AnnouncementContent } from "@/lib/content/types";

const STORAGE_KEY = "t40-announcement-dismissed";
const ROTATE_MS = 6000;

function slideVersion(slide: AnnouncementContent): string {
  if (slide.updatedAt) return `${slide.id ?? ""}:${slide.updatedAt}`;
  return [
    slide.id,
    slide.badgeLabel,
    slide.messageShort,
    slide.messageFull,
    slide.readLinkHref,
    ...slide.links.map((l) => `${l.label}:${l.href}`),
  ].join("|");
}

function announcementsVersion(items: AnnouncementContent[]): string {
  return items
    .map(slideVersion)
    .sort()
    .join("||");
}

type Props = {
  announcements: AnnouncementContent[];
};

export default function AnnouncementBar({ announcements }: Props) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const version = announcementsVersion(announcements);
  const count = announcements.length;
  const current = announcements[index] ?? announcements[0];

  useEffect(() => {
    const dismissedFor = localStorage.getItem(STORAGE_KEY);
    setVisible(dismissedFor !== version);
  }, [version]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count, version]);

  useEffect(() => {
    setIndex(0);
  }, [version]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, version);
    setVisible(false);
  };

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  if (!visible || !current) return null;

  return (
    <div className="relative bg-t40-black text-t40-white border-b border-t40-white/10">
      <div className="t40-container px-4 md:px-8 py-3 flex items-center gap-2 md:gap-4">
        {count > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="hidden sm:flex p-1 text-t40-white/40 hover:text-t40-white transition-colors shrink-0"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <Award size={16} className="text-[#d94625] shrink-0 hidden sm:block" />

        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            key={current.id ?? index}
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] font-heading leading-relaxed animate-in fade-in duration-500"
          >
            <span className="text-[#d94625] mr-1.5">{current.badgeLabel}</span>
            <span className="text-t40-white/90 hidden md:inline">{current.messageFull}</span>
            <span className="text-t40-white/90 md:hidden">{current.messageShort}</span>
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {current.links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/70 hover:text-[#d94625] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={current.readLinkHref}
            className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white hover:text-[#d94625] transition-colors whitespace-nowrap underline underline-offset-4"
          >
            {current.readLinkLabel}
          </Link>
        </div>

        {count > 1 && (
          <div className="hidden md:flex items-center gap-1 shrink-0" aria-hidden>
            {announcements.map((item, i) => (
              <span
                key={item.id ?? i}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-4 bg-[#d94625]" : "w-1 bg-t40-white/30"
                }`}
              />
            ))}
          </div>
        )}

        <Link
          href={current.readLinkHref}
          className="lg:hidden text-[9px] font-bold uppercase tracking-widest font-heading text-[#d94625] shrink-0"
        >
          Read
        </Link>

        {count > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="hidden sm:flex p-1 text-t40-white/40 hover:text-t40-white transition-colors shrink-0"
            aria-label="Next announcement"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="p-1 text-t40-white/50 hover:text-t40-white transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
