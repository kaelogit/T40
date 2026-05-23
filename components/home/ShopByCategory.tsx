"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "exclusives",
    title: "T40 Exclusives",
    subtitle: "Our own fragrances",
    link: "/shop/t40-exclusives",
    image: "/categories/t40-exclusives.jpg",
    gridClass: "col-span-2 lg:col-span-2 lg:row-span-2",
    mobileClass: "col-span-2 h-[450px]",
    isLarge: true,
    priority: true,
  },
  {
    id: "women",
    title: "Women",
    subtitle: "Fragrances for her",
    link: "/shop/women",
    image: "/categories/women.jpg",
    gridClass: "col-span-1 lg:col-span-1 lg:row-span-1",
    mobileClass: "col-span-1 h-[250px]",
  },
  {
    id: "men",
    title: "Men",
    subtitle: "Fragrances for him",
    link: "/shop/men",
    image: "/categories/men.jpg",
    gridClass: "col-span-1 lg:col-span-1 lg:row-span-1",
    mobileClass: "col-span-1 h-[250px]",
  },
  {
    id: "brands",
    title: "Designer Brands",
    subtitle: "Luxury brands you know",
    link: "/shop",
    image: "/categories/designer-brands.jpg",
    gridClass: "col-span-1 lg:col-span-1 lg:row-span-1",
    mobileClass: "col-span-1 h-[250px]",
  },
  {
    id: "unisex",
    title: "Unisex",
    subtitle: "For everyone",
    link: "/shop/unisex",
    image: "/categories/unisex.jpg",
    gridClass: "col-span-1 lg:col-span-1 lg:row-span-1",
    mobileClass: "col-span-1 h-[250px]",
  },
  {
    id: "scent",
    title: "Shop by Scent",
    subtitle: "Floral, woody, fresh & more",
    link: "/shop/scent",
    image: "/categories/shop-by-scent.jpg",
    gridClass: "col-span-2 lg:col-span-4 lg:row-span-1",
    mobileClass: "col-span-2 h-[300px]",
  },
];

function CategoryCard({
  category,
  index,
  shouldReduceMotion,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const [imgError, setImgError] = useState(false);

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.7, delay: index * 0.08, ease: "easeOut" as const },
      };

  return (
    <motion.article
      {...animationProps}
      className={`relative group overflow-hidden bg-t40-light ${category.mobileClass} ${category.gridClass} lg:h-full`}
    >
      <Link
        href={category.link}
        className="block relative w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d94625] focus-visible:ring-offset-2 focus-visible:ring-offset-t40-white"
        aria-label={`Shop ${category.title} — ${category.subtitle}`}
      >
        {/* Image */}
        {!imgError ? (
          <Image
            src={category.image}
            alt={category.title}
            fill
            sizes={
              category.isLarge
                ? "(max-width: 1024px) 100vw, 50vw"
                : category.id === "scent"
                ? "100vw"
                : "(max-width: 1024px) 50vw, 25vw"
            }
            priority={category.priority}
            loading={category.priority ? undefined : "lazy"}
            className="object-cover transition-transform duration-[2000ms] ease-out will-change-transform group-hover:scale-110 group-active:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-t40-light flex items-center justify-center">
            <span className="text-t40-black/40 text-xs uppercase tracking-widest">
              {category.title}
            </span>
          </div>
        )}

        {/* Overlay: stronger on bottom, subtle everywhere */}
        <div className="absolute inset-0 bg-gradient-to-t from-t40-black/80 via-t40-black/10 to-transparent" />
        <div className="absolute inset-0 bg-t40-black/10 group-hover:bg-t40-black/20 group-active:bg-t40-black/30 transition-colors duration-700" />

        {/* Content */}
        <div className="absolute inset-0 p-5 lg:p-8 flex flex-col justify-end">
          {/* Accent line */}
          <div className="w-8 h-[2px] bg-[#d94625] mb-3 transition-all duration-500 group-hover:w-14 group-active:w-14" />

          {/* Subtitle */}
          <span className="text-t40-white/70 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] mb-1 font-heading">
            {category.subtitle}
          </span>

          {/* Title */}
          <h3
            className={`font-heading text-t40-white uppercase tracking-tighter drop-shadow-sm ${
              category.isLarge
                ? "text-2xl sm:text-4xl lg:text-5xl font-bold md:font-black"
                : "text-lg sm:text-2xl lg:text-3xl font-bold md:font-black"
            }`}
          >
            {category.title}
          </h3>

          {/* CTA — visible on mobile by default, hover-reveal on desktop */}
          <div className="mt-3 overflow-hidden">
            <div className="flex items-center gap-2 text-t40-white text-[10px] font-bold uppercase tracking-[0.2em] font-heading transform transition-transform duration-500 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0">
              Shop now
              <ArrowRight
                size={14}
                className="text-[#d94625] transition-transform duration-300 group-hover:translate-x-1"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function ShopByCategory() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-t40-white py-20 lg:py-28">
      <div className="t40-container px-4 md:px-8">
        {/* HEADER */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 lg:mb-16"
        >
          <div className="text-center sm:text-left">
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading">
              Browse the shop
            </p>
            <h2 className="text-3xl md:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading">
              Shop by category
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-t40-black text-xs font-bold uppercase tracking-[0.2em] font-heading group/link hover:text-[#d94625] transition-colors duration-300"
          >
            View All
            <ArrowRight
              size={16}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* MAGAZINE GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-3 lg:gap-4 lg:h-[900px]">
          {CATEGORIES.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>

        {/* Mobile: View All button below grid */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border border-t40-black text-t40-black px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] font-heading active:bg-t40-black active:text-t40-white transition-colors duration-300"
          >
            View all products
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}