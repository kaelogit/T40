"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductGrid from "@/components/shop/ProductGrid";
import { SlidersHorizontal, LayoutGrid, List, ArrowDownUp, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseShopSlug } from "@/lib/shop/resolveShopPath";
import { T40_ACCENT, T40_PARENT_SLUG } from "@/lib/shop/t40Exclusives";
import { DEFAULT_SCENT_FILTER_OPTIONS } from "@/lib/shop/scents";
import type { FilterOption } from "@/lib/shop/loadFilterOptions";
import { useScentOptions } from "@/hooks/useScentOptions";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_OPTIONS,
  isFeaturedSort,
  normalizeProductSort,
} from "@/lib/shop/sortOptions";
import { createShopRandomSeed } from "@/lib/shop/shuffle";

const SORT_OPTIONS = PRODUCT_SORT_OPTIONS;

const PAGE_TITLES: Record<string, string> = {
  women: "Women",
  men: "Men",
  unisex: "Unisex",
  scent: "Shop by Scent",
  "t40-exclusives": "T40 Exclusives",
  trending: "Trending",
  "new-arrivals": "New Arrivals",
  "best-sellers": "Best Sellers",
  "flash-sales": "Flash Sales",
  "gift-sets": "Gift Sets",
};

function getPageTitle(pathname: string, scentOptions: FilterOption[] = DEFAULT_SCENT_FILTER_OPTIONS): string {
  const slug = pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean);
  if (slug.length === 0) return "Shop";
  if (slug[0] === "brand" && slug[1]) {
    return slug[1].replace(/-/g, " ");
  }
  if (slug[0] === "scent") {
    if (!slug[1]) return "Shop by Scent";
    const match = scentOptions.find((s) => s.value === slug[1]);
    return match?.label ?? slug[1].replace(/-/g, " ");
  }
  if (slug.length === 2) {
    return slug[1].replace(/-/g, " ");
  }
  return PAGE_TITLES[slug[0]] ?? slug[0].replace(/-/g, " ");
}

function ShopPageInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pathFilters = parseShopSlug(
    pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean)
  );
  const { options: scentOptions } = useScentOptions();

  const queryFilterEntries = Array.from(searchParams.entries()).filter(
    ([key]) => !["sort", "page", "q", "sale", "seed"].includes(key)
  );

  const pathFilterCount =
    (pathFilters.category ? 1 : 0) +
    (pathFilters.subcategory ? 1 : 0) +
    (pathFilters.collection ? 1 : 0) +
    (pathFilters.brand ? 1 : 0) +
    (pathFilters.scent ? 1 : 0) +
    (pathFilters.scentHub ? 1 : 0);

  const activeFilterCount = queryFilterEntries.length + pathFilterCount;

  const currentSort = normalizeProductSort(searchParams.get("sort"));
  const pageTitle = getPageTitle(pathname, scentOptions);
  const isT40Page = pathFilters.category === T40_PARENT_SLUG;
  const isScentPage = Boolean(pathFilters.scentHub || pathFilters.scent);

  useEffect(() => {
    if (!isFeaturedSort(searchParams.get("sort"))) return;
    if (searchParams.get("seed")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", createShopRandomSeed());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_PRODUCT_SORT) {
      params.delete("sort");
      params.set("seed", createShopRandomSeed());
    } else {
      params.set("sort", value);
      params.delete("seed");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setSortOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    else params.delete("q");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(key);
    params.delete(key);
    values.filter((v) => v !== value).forEach((v) => params.append(key, v));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearQueryFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const seed = searchParams.get("seed");
    const q = searchParams.get("q");
    const sale = searchParams.get("sale");
    if (sort) params.set("sort", sort);
    if (seed) params.set("seed", seed);
    if (q) params.set("q", q);
    if (sale) params.set("sale", sale);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const seed = searchParams.get("seed");
    const q = searchParams.get("q");
    if (sort) params.set("sort", sort);
    if (seed) params.set("seed", seed);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const onCountChange = useCallback((count: number) => {
    setResultCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-100">
        <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading"
                style={{ color: isT40Page ? T40_ACCENT : isScentPage ? undefined : T40_ACCENT }}
              >
                {isT40Page
                  ? "Our own fragrances"
                  : isScentPage
                    ? "Find by scent type"
                    : "Browse the shop"}
              </p>
              <h1
                className={`text-4xl md:text-5xl font-black uppercase tracking-tighter font-heading ${
                  isT40Page ? "" : "text-t40-black"
                }`}
                style={isT40Page ? { color: T40_ACCENT } : undefined}
              >
                {pageTitle}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-neutral-200 text-sm font-heading focus:outline-none focus:border-t40-black transition-colors"
                />
              </form>

              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center border border-neutral-200 rounded-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-t40-black text-white" : "text-neutral-400 hover:text-t40-black"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-t40-black text-white" : "text-neutral-400 hover:text-t40-black"}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-[11px] font-bold uppercase tracking-widest font-heading hover:border-t40-black transition-colors"
                  >
                    <ArrowDownUp size={14} />
                    {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 shadow-xl z-40 py-2"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSort(opt.value)}
                              className={`w-full text-left px-4 py-2.5 text-[11px] font-heading uppercase tracking-wider transition-colors ${
                                currentSort === opt.value ? "bg-neutral-50 text-t40-black font-bold" : "text-neutral-500 hover:bg-neutral-50"
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

                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-[11px] font-bold uppercase tracking-widest font-heading"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#d94625] text-white text-[9px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {queryFilterEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap items-center gap-2 mt-6"
            >
              {queryFilterEntries.map(([key, value]) => (
                <button
                  key={`${key}-${value}`}
                  onClick={() => removeFilter(key, value)}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-[10px] font-bold uppercase tracking-wider font-heading text-neutral-600 hover:bg-neutral-200 transition-colors"
                >
                  <span className="text-neutral-400">{key}:</span>
                  {value.replace(/-/g, " ")}
                  <X size={12} className="text-neutral-400 group-hover:text-[#d94625] transition-colors" />
                </button>
              ))}
              <button
                onClick={clearQueryFilters}
                className="text-[10px] font-bold uppercase tracking-widest font-heading text-[#d94625] hover:text-red-700 transition-colors ml-2"
              >
                Clear filters
              </button>
              {pathname !== "/shop" && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-widest font-heading text-neutral-500 hover:text-t40-black transition-colors"
                >
                  View all products
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
        <div className="flex gap-8 lg:gap-12">
          <FilterSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            resultCount={resultCount}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <p className="text-[11px] text-neutral-400 font-heading uppercase tracking-widest">
                {resultCount} {resultCount === 1 ? "Product" : "Products"}
              </p>
            </div>
            <ProductGrid viewMode={viewMode} onCountChange={onCountChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <ShopPageInner />
    </Suspense>
  );
}
