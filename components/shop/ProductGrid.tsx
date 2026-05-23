"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, SlidersHorizontal, AlertCircle } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import type { Tables } from "@/types/database";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";
import { useBrandOptions } from "@/hooks/useBrandOptions";
import { useShopFilters } from "@/hooks/useShopFilters";
import { applyShopFilters, applyShopFiltersToQuery } from "@/lib/shop/buildProductQuery";
import { isFeaturedSort } from "@/lib/shop/sortOptions";
import { shuffleWithSeed } from "@/lib/shop/shuffle";

const supabase = createClient();
const ITEMS_PER_PAGE = 12;

type Props = {
  viewMode?: "grid" | "list";
  onCountChange?: (count: number) => void;
};

export default function ProductGrid({ viewMode = "grid", onCountChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useShopFilters();
  const randomSeed = searchParams.get("seed") ?? "featured";
  const { slugToName: brandSlugToName } = useBrandOptions();
  const [t40SubcategorySlugs, setT40SubcategorySlugs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/subcategories?parent=t40-exclusives")
      .then((r) => r.json())
      .then((d) => {
        const slugs = (d.subcategories ?? [])
          .map((s: { slug: string }) => s.slug)
          .filter(Boolean);
        setT40SubcategorySlugs(slugs);
      })
      .catch(() => {});
  }, []);

  const filtersWithT40 = useMemo(
    () => ({ ...filters, t40SubcategorySlugs }),
    [filters, t40SubcategorySlugs]
  );

  const filtersKey = JSON.stringify({ filters: filtersWithT40, brandSlugToName, randomSeed });

  const [products, setProducts] = useState<ReturnType<typeof normalizeProduct>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const fetchProducts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const from = 0;
      const to = page * ITEMS_PER_PAGE - 1;

      if (isFeaturedSort(filtersWithT40.sort)) {
        let idQuery = supabase.from("products").select("id", { count: "exact" });
        idQuery = applyShopFiltersToQuery(idQuery, filtersWithT40, brandSlugToName);

        const { data: idRows, error: idError, count } = await idQuery;
        if (controller.signal.aborted) return;
        if (idError) throw idError;

        const shuffledIds = shuffleWithSeed(
          ((idRows as { id: string }[]) ?? []).map((row) => row.id),
          randomSeed
        );
        const pageIds = shuffledIds.slice(0, page * ITEMS_PER_PAGE);

        if (pageIds.length === 0) {
          setProducts([]);
          setTotalCount(count ?? 0);
          onCountChange?.(count ?? 0);
          return;
        }

        const { data, error: supaError } = await supabase
          .from("products")
          .select("*")
          .in("id", pageIds);

        if (controller.signal.aborted) return;
        if (supaError) throw supaError;

        const byId = new Map(((data as Tables<"products">[]) ?? []).map((row) => [row.id, row]));
        const ordered = pageIds
          .map((id) => byId.get(id))
          .filter((row): row is Tables<"products"> => Boolean(row));

        const normalized = ordered.map(normalizeProduct);
        const safe = await enrichProductsWithVariantsClient(normalized, supabase);

        setProducts(safe);
        const total = count ?? safe.length;
        setTotalCount(total);
        onCountChange?.(total);
        return;
      }

      const { data, error: supaError, count } = await applyShopFilters(
        supabase,
        filtersWithT40,
        { from, to },
        brandSlugToName
      );

      if (controller.signal.aborted) return;
      if (supaError) throw supaError;

      const normalized = ((data as Tables<"products">[]) || []).map(normalizeProduct);
      const safe = await enrichProductsWithVariantsClient(normalized, supabase);

      setProducts(safe);
      const total = count ?? safe.length;
      setTotalCount(total);
      onCountChange?.(total);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to load products");
      onCountChange?.(0);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filtersWithT40, filtersKey, page, onCountChange, brandSlugToName, randomSeed]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const hasMore = totalCount > page * ITEMS_PER_PAGE;
  const loadMore = () => setPage((p) => p + 1);

  const clearFilters = () => router.push("/shop");

  if (loading && products.length === 0) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
            : "flex flex-col gap-6"
        }
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-sm" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-[#d94625]" />
        </div>
        <h3 className="text-lg font-black font-heading uppercase tracking-widest text-t40-black mb-2">
          Something went wrong
        </h3>
        <p className="text-neutral-400 text-sm max-w-sm mb-6">{error}</p>
        <Button variant="outline" onClick={fetchProducts}>
          Try Again
        </Button>
      </motion.div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 lg:py-32 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <SlidersHorizontal size={32} className="text-neutral-300" />
        </div>
        <h3 className="text-xl md:text-2xl font-black font-heading uppercase tracking-tighter text-t40-black mb-3">
          No matches found
        </h3>
        <p className="text-neutral-400 text-sm max-w-xs mb-8 leading-relaxed">
          Try adjusting your filters or browse the full collection to find what you are looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw size={14} className="mr-2" /> Clear Filters
          </Button>
          <Button href="/shop">View All Products</Button>
        </div>
      </motion.div>
    );
  }

  const gridClasses =
    viewMode === "grid"
      ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
      : "flex flex-col gap-6";

  return (
    <div>
      <div className={gridClasses}>
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
            >
              <ProductCard product={product} viewMode={viewMode} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12 lg:mt-16">
          <Button
            variant="outline"
            onClick={loadMore}
            isLoading={loading}
            className="min-w-[200px]"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {!hasMore && products.length > ITEMS_PER_PAGE && (
        <p className="text-center mt-12 text-[11px] text-neutral-300 font-heading uppercase tracking-widest">
          You have reached the end
        </p>
      )}
    </div>
  );
}
