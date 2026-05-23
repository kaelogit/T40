"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const BRAND_STORY_IMAGE = "/brand/brand-story.jpg";

export default function BrandStory() {
  return (
    <section className="w-full bg-t40-white border-t border-t40-grey/10">
      <div className="flex flex-col lg:flex-row w-full lg:min-h-[680px]">
        <div className="w-full lg:w-1/2 relative min-h-[360px] sm:min-h-[420px] lg:min-h-full bg-t40-light">
          <Image
            src={BRAND_STORY_IMAGE}
            alt="The T40 Perfumes story"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 xl:p-24 bg-t40-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-md w-full"
          >
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 font-heading">
              About T40
            </p>

            <h2 className="text-2xl md:text-5xl font-bold md:font-black uppercase tracking-tighter font-heading mb-8 leading-tight text-t40-black">
              Fragrances chosen <br /> with care
            </h2>

            <div className="space-y-6 text-t40-grey text-sm md:text-base leading-relaxed mb-12">
              <p>
                We stock scents that smell good and last on skin — from trusted brands and our own
                T40 Exclusives line.
              </p>
              <p>
                We would rather carry fewer perfumes we stand behind than hundreds we do not. Whether
                you are shopping for yourself or buying a gift, that is the standard we hold ourselves to.
              </p>
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] transition-colors"
            >
              About us{" "}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
