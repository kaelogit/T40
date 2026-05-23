"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ProductCard, { type Product } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import type { Tables } from "@/types/database";

const supabase = createClient();

// Helper function to randomly shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function TrendingNow() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      
      // Fetch ALL products tagged as 'TRENDING' without a limit
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("badge", "TRENDING");

      if (data && !error) {
        const normalized = data.map((p) => normalizeProduct(p as Tables<"products">));
        const safeData = await enrichProductsWithVariantsClient(normalized, supabase);
        const randomizedSelection = shuffleArray(safeData).slice(0, 4);
        
        setProducts(randomizedSelection);
      }
      setIsLoading(false);
    };

    fetchTrending();
  }, []);

  if (!isLoading && products.length === 0) {
    return null; // Gracefully hide if no trending products exist
  }

  return (
    <section className="w-full bg-t40-light py-20 lg:py-32 border-t border-t40-grey/20">
      <div className="t40-container px-4 md:px-8">
        
        {/* HEADER */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading">
              Most Wanted
            </p>
            <h2 className="text-3xl md:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading max-w-lg">
              Trending Now
            </h2>
          </motion.div>
        </div>

        {/* TOP CHART GRID */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-t40-grey" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="relative"
              >
                {/* 
                  The massive background number (01, 02, etc.) 
                  This creates that high-end editorial top-chart feel.
                */}
                <div className="absolute -top-12 -left-4 text-[120px] font-black text-t40-white tracking-tighter z-0 pointer-events-none drop-shadow-sm font-heading select-none opacity-80">
                  0{index + 1}
                </div>

                {/* The Product Card sitting on top of the number */}
                <div className="relative z-10 pt-8">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}