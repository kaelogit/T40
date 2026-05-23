"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, X } from "lucide-react";
import type { AnnouncementContent } from "@/lib/content/types";

const STORAGE_KEY = "t40-announcement-dismissed";

function announcementVersion(data: AnnouncementContent): string {
  if (data.updatedAt) return data.updatedAt;
  return [
    data.badgeLabel,
    data.messageShort,
    data.messageFull,
    data.readLinkHref,
    ...data.links.map((l) => `${l.label}:${l.href}`),
  ].join("|");
}

export default function AnnouncementBar({ data }: { data: AnnouncementContent }) {
  const [visible, setVisible] = useState(false);
  const version = announcementVersion(data);

  useEffect(() => {
    const dismissedFor = localStorage.getItem(STORAGE_KEY);
    setVisible(dismissedFor !== version);
  }, [version]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, version);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-t40-black text-t40-white border-b border-t40-white/10">
      <div className="t40-container px-4 md:px-8 py-3 flex items-center gap-3 md:gap-6">
        <Award size={16} className="text-[#d94625] shrink-0 hidden sm:block" />

        <p className="flex-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] font-heading leading-relaxed">
          <span className="text-[#d94625] mr-1.5">{data.badgeLabel}</span>
          <span className="text-t40-white/90 hidden md:inline">{data.messageFull}</span>
          <span className="text-t40-white/90 md:hidden">{data.messageShort}</span>
        </p>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {data.links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/70 hover:text-[#d94625] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={data.readLinkHref}
            className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white hover:text-[#d94625] transition-colors whitespace-nowrap underline underline-offset-4"
          >
            {data.readLinkLabel}
          </Link>
        </div>

        <Link
          href={data.readLinkHref}
          className="lg:hidden text-[9px] font-bold uppercase tracking-widest font-heading text-[#d94625] shrink-0"
        >
          Read
        </Link>

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
