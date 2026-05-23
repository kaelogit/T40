"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Award, Sparkles } from "lucide-react";
import type { AboutPageData } from "@/lib/content/types";
import { Button } from "@/components/ui/Button";

export default function AboutPageContent({ data }: { data: AboutPageData }) {
  const { content, awardProducts } = data;
  const heroTitleLines = content.hero.title.split("\n");

  return (
    <div className="bg-t40-white">
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <Image
          src={content.hero.imageUrl}
          alt="T40 Perfumes"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-t40-black via-t40-black/50 to-transparent" />
        <div className="relative t40-container px-4 md:px-8 pb-16 lg:pb-24 pt-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 font-heading">
              {content.hero.eyebrow}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-t40-white uppercase tracking-tighter font-heading leading-[0.95] mb-6">
              {heroTitleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < heroTitleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-t40-white/70 text-base md:text-lg font-body leading-relaxed max-w-xl">
              {content.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading">
              {content.origin.eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-heading text-t40-black mb-8 whitespace-pre-line">
              {content.origin.title}
            </h2>
          </div>
          <div className="space-y-6 text-t40-grey font-body text-base leading-relaxed">
            {content.origin.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="awards" className="bg-t40-black text-t40-white py-20 lg:py-32 scroll-mt-24">
        <div className="t40-container px-4 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#d94625] mb-4">
                <Award size={18} />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] font-heading">
                  {content.awards.eyebrow}
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter font-heading leading-tight whitespace-pre-line">
                {content.awards.title}
              </h2>
            </div>
            <p className="text-t40-white/60 font-body text-sm md:text-base leading-relaxed max-w-md lg:text-right">
              {content.awards.description}
            </p>
          </div>

          {content.awards.highlights && content.awards.highlights.length > 0 && (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
              {content.awards.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border border-t40-white/10 bg-t40-white/5 px-4 py-3 text-sm text-t40-white/80 font-body leading-snug"
                >
                  <Award size={14} className="text-[#d94625] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {awardProducts.map((product, i) => (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/product/${product.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden mb-5">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#d94625] text-t40-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest font-heading">
                      Award winning
                    </div>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider font-heading group-hover:text-[#d94625] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-t40-white/50 text-sm font-body mt-2">{product.tagline}</p>
                  <span className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest font-heading text-t40-white/70 group-hover:text-t40-white transition-colors">
                    Discover <ArrowRight size={12} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 py-20 lg:py-32">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading text-center">
          {content.values.eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-heading text-center text-t40-black mb-16">
          {content.values.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {content.values.items.map((v) => (
            <div key={v.title} className="text-center md:text-left border-t border-t40-light pt-8">
              <Sparkles size={20} className="text-[#d94625] mx-auto md:mx-0 mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest font-heading mb-4">
                {v.title}
              </h3>
              <p className="text-t40-grey font-body text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-t40-light/50 border-y border-t40-light py-20 lg:py-32">
        <div className="t40-container px-4 md:px-8 max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading text-center">
            {content.milestones.eyebrow}
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter font-heading text-center text-t40-black mb-12">
            {content.milestones.title}
          </h2>
          <ul className="space-y-0">
            {content.milestones.items.map((m, i) => (
              <li
                key={m.year}
                className={`flex gap-8 py-8 ${i < content.milestones.items.length - 1 ? "border-b border-t40-light" : ""}`}
              >
                <span className="text-2xl font-black font-heading text-[#d94625] shrink-0 w-16">
                  {m.year}
                </span>
                <p className="text-t40-grey font-body text-sm leading-relaxed pt-1">{m.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 py-20 lg:py-28 text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter font-heading text-t40-black mb-6">
          {content.cta.title}
        </h2>
        <p className="text-t40-grey font-body mb-10 max-w-md mx-auto">{content.cta.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={content.cta.primaryHref} size="lg">
            {content.cta.primaryLabel}
          </Button>
          <Link
            href={content.cta.secondaryHref}
            className="inline-flex items-center justify-center px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] font-heading border border-t40-black hover:bg-t40-black hover:text-t40-white transition-colors"
          >
            {content.cta.secondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
