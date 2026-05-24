"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard, { type Product } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import type { Tables } from "@/types/database";

const supabase = createClient();

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("badge", "BEST SELLER") 
        .limit(10); 

      if (data && !error) {
        const normalized = data.map((p) => normalizeProduct(p as Tables<"products">));
        setProducts(await enrichProductsWithVariantsClient(normalized, supabase));
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 1024 ? window.innerWidth * 0.8 : window.innerWidth * 0.3;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!isLoading && products.length === 0) {
    return null;
  }

  const useCarousel = products.length >= 4;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, 
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  return (
    <section className="w-full py-24 bg-t40-white overflow-hidden relative group">
      <div className="t40-container px-4 md:px-8">
        
        {/* SECTION HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center mb-16"
        >
          <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 font-heading">
            Our Favourites
          </p>
          <h2 className="text-3xl md:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading">
            Best Sellers
          </h2>
          <div className="w-16 h-[2px] bg-t40-black mt-8" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-t40-grey" size={32} />
          </div>
        ) : (
          <div className="relative">
            {useCarousel && (
              <>
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-t40-white border border-t40-light rounded-full items-center justify-center text-t40-black shadow-lg opacity-0 group-hover:opacity-100 hover:bg-t40-black hover:text-t40-white hover:scale-110 transition-all duration-300"
                  aria-label="Scroll best sellers left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-t40-white border border-t40-light rounded-full items-center justify-center text-t40-black shadow-lg opacity-0 group-hover:opacity-100 hover:bg-t40-black hover:text-t40-white hover:scale-110 transition-all duration-300"
                  aria-label="Scroll best sellers right"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <motion.div
              ref={useCarousel ? scrollRef : undefined}
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className={
                useCarousel
                  ? "flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  : `grid gap-6 justify-items-center mx-auto pb-8 pt-4 px-2 ${
                      products.length === 1
                        ? "grid-cols-1 max-w-sm"
                        : products.length === 2
                          ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
                    }`
              }
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  className={
                    useCarousel
                      ? "flex-shrink-0 w-[85vw] sm:w-[45vw] lg:w-[30vw] xl:w-[23%] snap-start"
                      : "w-full max-w-[320px]"
                  }
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}

              {useCarousel && <div className="flex-shrink-0 w-[4vw] lg:w-0" />}
            </motion.div>
          </div>
        )}

        {/* BOTTOM CTA */}
        {!isLoading && products.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 flex justify-center"
          >
            <Link 
              href="/shop/best-sellers"
              className="group relative inline-flex items-center gap-4 text-t40-black"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] font-heading">
                View All Best Sellers
              </span>
              <div className="w-12 h-[1px] bg-t40-black group-hover:w-16 transition-all duration-300" />
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
}