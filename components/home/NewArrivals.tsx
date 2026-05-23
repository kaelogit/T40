"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard, { type Product } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import type { Tables } from "@/types/database";

const supabase = createClient();
const PAGE_SIZE = 8; // We will load 8 products at a time

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNewArrivals = async (pageNumber: number) => {
    if (pageNumber === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    // Calculate the range for Supabase (e.g., page 0 is 0-7, page 1 is 8-15)
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("badge", "NEW")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data && !error) {
      const normalized = data.map((p) => normalizeProduct(p as Tables<"products">));
      const safeData = await enrichProductsWithVariantsClient(normalized, supabase);

      if (pageNumber === 0) {
        setProducts(safeData);
      } else {
        setProducts((prev) => [...prev, ...safeData]);
      }

      // If we got fewer than 8 items back, it means we've hit the end of the database
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } else {
      // Hide the button if there's an error so it doesn't get stuck
      setHasMore(false);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  };

  // Initial load
  useEffect(() => {
    fetchNewArrivals(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNewArrivals(nextPage);
  };

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-t40-light py-24 lg:py-32 relative">
      <div className="t40-container px-4 md:px-8">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative">
          
          {/* =========================================
              LEFT: EDITORIAL TEXT (Sticky on Desktop)
             ========================================= */}
          <div className="w-full lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:sticky lg:top-32"
            >
              <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 font-heading flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#d94625] rounded-full animate-pulse" />
                Fresh in store
              </p>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading leading-none mb-6">
                New <br className="hidden lg:block"/> Arrivals
              </h2>
              
              <p className="text-t40-grey text-sm lg:text-base leading-relaxed mb-10 max-w-md">
                Recently added to our shop. Discover fragrances that are new to our shelves — grab
                your favourites while stock lasts.
              </p>

              {/* DESKTOP ONLY: View Full Drop Button */}
              <Link 
                href="/shop/new-arrivals"
                className="group relative hidden lg:inline-flex items-center justify-center gap-4 bg-t40-black text-t40-white px-8 py-4 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-[#d94625] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                <span className="relative text-xs font-bold uppercase tracking-[0.2em] font-heading flex items-center gap-3">
                  View all new arrivals <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* =========================================
              RIGHT: PRODUCT GRID & LOAD MORE
             ========================================= */}
          <div className="w-full lg:w-2/3">
            {isLoading ? (
              <div className="flex justify-center items-center py-40">
                <Loader2 className="animate-spin text-t40-grey" size={32} />
              </div>
            ) : (
              <div className="pb-12">
                {/* 2 columns on mobile, 2 columns on desktop */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-16 lg:gap-x-8">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`transform ${index % 2 !== 0 ? 'lg:translate-y-12' : ''}`}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* DYNAMIC LOAD MORE BUTTON */}
                {hasMore && (
                  <div className="mt-20 lg:mt-32 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="group flex items-center gap-3 border border-t40-black text-t40-black px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] font-heading hover:bg-t40-black hover:text-t40-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}

                {/* MOBILE ONLY: View Full Drop Button at the bottom */}
                <div className="mt-12 flex justify-center lg:hidden">
                  <Link 
                    href="/shop/new-arrivals"
                    className="group relative inline-flex items-center justify-center gap-4 bg-t40-black text-t40-white px-8 py-4 w-full sm:w-auto overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full bg-[#d94625] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <span className="relative text-xs font-bold uppercase tracking-[0.2em] font-heading flex items-center gap-3">
                      View all new arrivals <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}