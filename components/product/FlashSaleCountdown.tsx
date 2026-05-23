"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  endsAt: string;
  onExpired?: () => void;
  /** light = product page; dark = homepage flash sale cards */
  theme?: "light" | "dark";
  className?: string;
};

export default function FlashSaleCountdown({
  endsAt,
  onExpired,
  theme = "light",
  className = "",
}: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const difference = new Date(endsAt).getTime() - Date.now();
      if (difference <= 0) {
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpired?.();
        return false;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
      return true;
    };

    if (!tick()) return;
    const timer = setInterval(() => {
      if (!tick()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, onExpired]);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const expiredClass = isDark
    ? "text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-white/60"
    : "text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey";

  if (expired) {
    return <span className={`${expiredClass} ${className}`}>Offer ended</span>;
  }

  const timerText = (
    <>
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m{" "}
      {String(timeLeft.seconds).padStart(2, "0")}s
    </>
  );

  if (isDark) {
    return (
      <div
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-white/90 ${className}`}
      >
        <Clock size={12} className="text-[#d94625]" />
        <span className="text-[#d94625]">Ends In:</span>
        <span>{timerText}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 border border-[#d94625]/25 bg-[#d94625]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${className}`}
    >
      <Clock size={12} className="text-[#d94625] shrink-0" />
      <span className="text-[#d94625]">Flash sale ends in</span>
      <span className="text-t40-black tabular-nums">{timerText}</span>
    </div>
  );
}
