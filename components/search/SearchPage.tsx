"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowDownUp, SlidersHorizontal, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { searchProducts, type SearchSort } from "@/lib/search/searchProducts";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_OPTIONS,
  isFeaturedSort,
  normalizeProductSort,
} from "@/lib/shop/sortOptions";
import { createShopRandomSeed } from "@/lib/shop/shuffle";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const supabase = createClient();
const PAGE_SIZE = 12;

const SORT_OPTIONS = PRODUCT_SORT_OPTIONS;

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qParam = searchParams.get("q") ?? "";
  const currentSort = normalizeProductSort(searchParams.get("sort"));
  const randomSeed = searchParams.get("seed") ?? "featured";

  const [inputValue, setInputValue] = useState(qParam);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof searchProducts>>["products"]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    setInputValue(qParam);
  }, [qParam]);

  useEffect(() => {
    if (!qParam.trim()) return;
    if (!isFeaturedSort(searchParams.get("sort"))) return;
    if (searchParams.get("seed")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", createShopRandomSeed());
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [qParam, searchParams, router]);

  useEffect(() => {
    setPage(1);
  }, [qParam, currentSort, randomSeed]);

  useEffect(() => {
    const term = qParam.trim();
    if (!term) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const { products: rows, count, error: err } = await searchProducts(supabase, term, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        sort: currentSort,
        seed: randomSeed,
      });

      if (cancelled) return;

      if (err) {
        setError(err);
        if (page === 1) setProducts([]);
      } else if (page === 1) {
        setProducts(rows);
      } else {
        setProducts((prev) => [...prev, ...rows]);
      }

      setTotalCount(count);
      setLoading(false);
      setLoadingMore(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [qParam, currentSort, page, randomSeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      router.push("/search");
      return;
    }
    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (currentSort !== DEFAULT_PRODUCT_SORT) params.set("sort", currentSort);
    if (isFeaturedSort(currentSort)) params.set("seed", createShopRandomSeed());
    router.push(`/search?${params.toString()}`);
  };

  const handleSort = (value: SearchSort) => {
    const params = new URLSearchParams();
    const q = qParam.trim();
    if (q) params.set("q", q);
    if (value !== DEFAULT_PRODUCT_SORT) params.set("sort", value);
    if (value === DEFAULT_PRODUCT_SORT) params.set("seed", createShopRandomSeed());
    router.push(params.toString() ? `/search?${params.toString()}` : "/search");
    setSortOpen(false);
  };

  const hasMore = totalCount > page * PAGE_SIZE;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-100">
        <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
            Discover
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading mb-8">
            Search
          </h1>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by name, brand, or scent..."
                className="w-full pl-12 pr-4 py-3.5 border border-neutral-200 text-sm font-heading focus:outline-none focus:border-t40-black transition-colors"
                autoFocus
              />
            </div>
            <Button type="submit" className="sm:shrink-0">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
        {!qParam.trim() ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-neutral-200 mb-6" />
            <p className="text-t40-grey text-sm font-body max-w-md mx-auto">
              Enter a fragrance name, brand, or scent note to explore the collection.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <p className="text-[11px] text-neutral-400 font-heading uppercase tracking-widest">
                {loading
                  ? "Searching..."
                  : `${totalCount} ${totalCount === 1 ? "result" : "results"} for "${qParam}"`}
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-[11px] font-bold uppercase tracking-widest font-heading hover:border-t40-black transition-colors"
                >
                  <ArrowDownUp size={14} />
                  {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 shadow-xl z-40 py-2"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSort(opt.value)}
                            className={`w-full text-left px-4 py-2.5 text-[11px] font-heading uppercase tracking-wider transition-colors ${
                              currentSort === opt.value
                                ? "bg-neutral-50 text-t40-black font-bold"
                                : "text-neutral-500 hover:bg-neutral-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-[#d94625] text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={() => setPage(1)}>
                  Try again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-20 text-center"
              >
                <SlidersHorizontal size={32} className="text-neutral-300 mb-6" />
                <h2 className="text-xl font-black font-heading uppercase tracking-tighter text-t40-black mb-3">
                  No matches found
                </h2>
                <p className="text-neutral-400 text-sm max-w-sm mb-8">
                  Try a different spelling, brand name, or browse the full shop.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => router.push("/shop")}>
                    <RotateCcw size={14} className="mr-2" />
                    Browse shop
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.24) }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      isLoading={loadingMore}
                      className="min-w-[200px]"
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <SearchPageInner />
    </Suspense>
  );
}
