"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Sweet Noble",
    tagline: "Floral & warm",
    badge: "Customer favourite",
    description:
      "Soft flowers and warm amber. An easy everyday scent that stays on skin for hours.",
    image: "/hero/sweet-noble.jpg",
    link: "/product/sweet-noble",
    accent: "#c9a96e",
  },
  {
    id: 2,
    title: "24th Oud",
    tagline: "Oud & leather",
    badge: "Internationally awarded",
    description:
      "Rich oud, leather, and spice. A deeper scent for evenings, events, and cooler days.",
    image: "/hero/24th-oud.jpg",
    link: "/product/24th-oud",
    accent: "#8b6f47",
  },
  {
    id: 3,
    title: "Re'Venge",
    tagline: "Bold & lasting",
    badge: "Internationally awarded",
    description:
      "A strong scent people notice. Long-lasting and confident — built to stay with you all day.",
    image: "/hero/revenge.jpg",
    link: "/product/revenge",
    accent: "#d94625",
  },
];

const AUTO_SLIDE_MS = 6000;

export default function Hero() {
  const [[activeIndex, direction], setSlide] = useState([0, 1]);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback((index: number) => {
    setSlide(([prev]) => [index, index > prev ? 1 : -1]);
  }, []);

  const advance = useCallback(() => {
    setSlide(([prev]) => {
      const next = (prev + 1) % SLIDES.length;
      return [next, 1];
    });
  }, []);

  useEffect(() => {
    if (paused || shouldReduceMotion) return;

    const timer = setInterval(advance, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [activeIndex, paused, shouldReduceMotion, advance]);

  const current = SLIDES[activeIndex];
  const imageFirst = activeIndex % 2 === 0;

  const slideVariants = {
    enter: ({ dir, mobile }: { dir: number; mobile: boolean }) => ({
      x: mobile ? 0 : dir > 0 ? "100%" : "-100%",
      y: mobile ? (dir > 0 ? "100%" : "-100%") : 0,
      opacity: 0,
    }),
    center: { x: 0, y: 0, opacity: 1 },
    exit: ({ dir, mobile }: { dir: number; mobile: boolean }) => ({
      x: mobile ? 0 : dir > 0 ? "-100%" : "100%",
      y: mobile ? (dir > 0 ? "-100%" : "100%") : 0,
      opacity: 0,
    }),
  };

  return (
    <section
      className="relative w-full min-h-[100svh] bg-black overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={{ dir: direction, mobile: isMobile }} mode="popLayout">
        <motion.div
          key={current.id}
          custom={{ dir: direction, mobile: isMobile }}
          variants={shouldReduceMotion ? undefined : slideVariants}
          initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
          animate={shouldReduceMotion ? { opacity: 1 } : "center"}
          exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.65,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 min-h-[100svh]"
        >
          <div
            className={`relative h-[42svh] sm:h-[45svh] lg:h-full overflow-hidden order-1 ${
              imageFirst ? "lg:order-1" : "lg:order-2"
            }`}
          >
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              className={`absolute inset-0 hidden lg:block pointer-events-none ${
                imageFirst
                  ? "bg-gradient-to-r from-transparent via-black/20 to-black"
                  : "bg-gradient-to-l from-transparent via-black/20 to-black"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 h-[38%] sm:h-[34%] lg:hidden bg-gradient-to-t from-black via-black/55 to-transparent pointer-events-none" />
          </div>

          <div
            className={`relative flex flex-col justify-center px-6 pb-28 pt-6 lg:px-16 lg:py-12 lg:pb-12 bg-black order-2 -mt-px ${
              imageFirst ? "lg:order-2 lg:mt-0" : "lg:order-1 lg:mt-0"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 mb-5 w-fit"
            >
              <Award size={13} style={{ color: current.accent }} />
              <span className="text-white/90 text-[9px] font-bold uppercase tracking-[0.25em] font-heading">
                {current.badge}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 font-heading"
              style={{ color: current.accent }}
            >
              {current.tagline}
            </motion.p>

            <div className="overflow-hidden mb-5">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold md:font-black text-white uppercase leading-[0.95] tracking-tighter font-heading"
              >
                {current.title}
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="text-white/65 text-sm sm:text-base max-w-md leading-relaxed mb-8 font-body"
            >
              {current.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.45 }}
            >
              <Link
                href={current.link}
                className="group inline-flex items-center gap-3 text-white"
              >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] font-heading border-b border-white/30 pb-0.5 group-hover:border-white transition-colors">
                  View this fragrance
                </span>
                <span className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowRight size={15} strokeWidth={1.5} />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-5 lg:px-12 lg:py-7 flex items-end justify-between pointer-events-none">
        <div className="hidden lg:flex items-center gap-8 pointer-events-auto">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              className="group flex flex-col gap-2 text-left"
              aria-current={i === activeIndex ? "true" : undefined}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.18em] transition-colors font-heading ${
                  i === activeIndex ? "text-white" : "text-white/35 group-hover:text-white/60"
                }`}
              >
                {slide.title}
              </span>
              <div className="h-px w-12 overflow-hidden bg-white/15">
                {i === activeIndex && (
                  <motion.div
                    key={`progress-${activeIndex}`}
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTO_SLIDE_MS / 1000, ease: "linear" }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex lg:hidden items-center gap-2.5 pointer-events-auto">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "bg-white w-7" : "bg-white/35 w-1.5"
              }`}
              aria-label={`Show ${slide.title}`}
              aria-current={i === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
