"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  name: string;
};

const SWIPE_THRESHOLD = 48;

export default function ProductImages({ images, name }: Props) {
  const gallery = images.length > 0 ? images : ["/placeholder.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(gallery.length - 1, index)));
    },
    [gallery.length]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (zoomed || gallery.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || zoomed) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || zoomed) return;
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) goNext();
    else if (touchDeltaX.current >= SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="space-y-4 select-none">
      <div className="relative group">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden bg-t40-light touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {gallery.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className={`relative h-full w-full shrink-0 block ${
                  zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                aria-label={zoomed ? "Zoom out image" : "Zoom in image"}
              >
                <Image
                  src={src}
                  alt={index === activeIndex ? name : ""}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`object-cover transition-transform duration-500 ${
                    zoomed && index === activeIndex ? "scale-125" : "scale-100"
                  }`}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 border border-neutral-200 text-t40-black opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hidden sm:flex"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === gallery.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 border border-neutral-200 text-t40-black opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hidden sm:flex"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`relative h-20 w-16 shrink-0 snap-start overflow-hidden border-2 transition-colors ${
                activeIndex === index
                  ? "border-t40-black"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
