"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadFilterGroups, type FilterGroupConfig } from "@/lib/shop/loadFilterOptions";
import { parseShopSlug, shopPathFromFilters } from "@/lib/shop/resolveShopPath";
import { T40_ACCENT, T40_PARENT_SLUG } from "@/lib/shop/t40Exclusives";
import { useScentOptions } from "@/hooks/useScentOptions";
import { DEFAULT_SCENT_FILTER_OPTIONS } from "@/lib/shop/scents";

type T40Subcategory = { name: string; slug: string };

const supabase = createClient();

const QUERY_FILTER_IDS = new Set(["price", "brand", "occasion"]);

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
    />
  );
}

export default function FilterSidebar({
  isOpen,
  onClose,
  resultCount = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  resultCount?: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filterGroups, setFilterGroups] = useState<FilterGroupConfig[]>([]);
  const [t40Subcategories, setT40Subcategories] = useState<T40Subcategory[]>([]);
  const [t40Expanded, setT40Expanded] = useState(true);
  const [scentExpanded, setScentExpanded] = useState(true);
  const [pending, setPending] = useState<Record<string, string[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLElement>(null);
  const { options: scentOptions } = useScentOptions();
  const scentFilterOptions =
    scentOptions.length > 0 ? scentOptions : DEFAULT_SCENT_FILTER_OPTIONS;

  useEffect(() => {
    loadFilterGroups(supabase).then((groups) => {
      setFilterGroups(groups);
      setExpandedGroups(new Set(groups.map((g) => g.id)));
    });
    fetch("/api/subcategories?parent=t40-exclusives")
      .then((r) => r.json())
      .then((d) => setT40Subcategories(d.subcategories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const pathFilters = parseShopSlug(
      pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean)
    );
    if (pathFilters.category === T40_PARENT_SLUG) {
      setT40Expanded(true);
    }
    if (pathFilters.scentHub || pathFilters.scent) {
      setScentExpanded(true);
    }
  }, [pathname]);

  useEffect(() => {
    const pathFilters = parseShopSlug(
      pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean)
    );
    const initial: Record<string, string[]> = {};

    if (pathFilters.collection) initial.collection = [pathFilters.collection];

    filterGroups.forEach((group) => {
      if (group.id === "collection") return;
      const raw = searchParams.getAll(group.id);
      if (raw.length) initial[group.id] = raw;
    });

    setPending(initial);
  }, [searchParams, pathname, filterGroups]);

  const applyFilters = useCallback(
    (newPending: Record<string, string[]>) => {
      const pathFilters = parseShopSlug(
        pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean)
      );

      const collection = newPending.collection?.[0];
      let basePath = "/shop";

      if (collection) {
        basePath = `/shop/${collection}`;
        pathFilters.collection = undefined;
      } else if (pathFilters.collection) {
        basePath = shopPathFromFilters({
          category: pathFilters.category,
          subcategory: pathFilters.subcategory,
          brand: pathFilters.brand,
          scent: pathFilters.scent,
        });
      } else {
        basePath =
          pathname.startsWith("/shop/") && pathname !== "/shop"
            ? pathname.split("?")[0]
            : "/shop";
      }

      const params = new URLSearchParams();
      const sort = searchParams.get("sort");
      const seed = searchParams.get("seed");
      const q = searchParams.get("q");
      const sale = searchParams.get("sale");
      if (sort) params.set("sort", sort);
      if (seed) params.set("seed", seed);
      if (q) params.set("q", q);
      if (sale) params.set("sale", sale);

      Object.entries(newPending).forEach(([key, values]) => {
        if (key === "collection" || !QUERY_FILTER_IDS.has(key)) return;
        values.forEach((v) => params.append(key, v));
      });

      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleFilter = (groupId: string, value: string, type: "single" | "multi") => {
    const current = pending[groupId] || [];
    const nextPending = { ...pending };

    if (type === "single") {
      nextPending[groupId] = current.includes(value) ? [] : [value];
    } else {
      nextPending[groupId] = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    }

    setPending(nextPending);

    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      applyFilters(nextPending);
    }
  };

  const clearAll = () => {
    setPending({});
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const seed = searchParams.get("seed");
    const q = searchParams.get("q");
    if (sort) params.set("sort", sort);
    if (seed) params.set("seed", seed);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    onClose();
  };

  const clearGroup = (groupId: string) => {
    const newPending = { ...pending, [groupId]: [] };
    setPending(newPending);
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      applyFilters(newPending);
    }
  };

  const pathFilters = parseShopSlug(
    pathname.replace(/^\/shop\/?/, "").split("/").filter(Boolean)
  );

  const isT40Path = pathFilters.category === T40_PARENT_SLUG;
  const activeT40Sub = isT40Path ? pathFilters.subcategory : undefined;
  const isScentPath = Boolean(pathFilters.scentHub || pathFilters.scent);
  const activeScent = pathFilters.scent;

  const preserveQueryParams = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const seed = searchParams.get("seed");
    const q = searchParams.get("q");
    const sale = searchParams.get("sale");
    if (sort) params.set("sort", sort);
    if (seed) params.set("seed", seed);
    if (q) params.set("q", q);
    if (sale) params.set("sale", sale);
    Object.entries(pending).forEach(([key, values]) => {
      if (QUERY_FILTER_IDS.has(key)) {
        values.forEach((v) => params.append(key, v));
      }
    });
    return params;
  };

  const navigateT40 = (subcategorySlug?: string) => {
    const base = subcategorySlug
      ? `/shop/${T40_PARENT_SLUG}/${subcategorySlug}`
      : `/shop/${T40_PARENT_SLUG}`;
    const params = preserveQueryParams();
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base, { scroll: false });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const clearT40 = () => {
    const params = preserveQueryParams();
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const navigateScent = (scentSlug?: string) => {
    const base = scentSlug ? `/shop/scent/${scentSlug}` : "/shop/scent";
    const params = preserveQueryParams();
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base, { scroll: false });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const clearScent = () => {
    const params = preserveQueryParams();
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const getSelectedForGroup = (groupId: string) => {
    if (groupId === "collection" && pathFilters.collection) {
      return [pathFilters.collection];
    }
    return pending[groupId] || [];
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <Backdrop onClick={onClose} />}
      </AnimatePresence>

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[360px] bg-t40-white z-50 
          lg:static lg:h-auto lg:w-72 lg:max-w-none lg:z-0 lg:bg-transparent
          flex flex-col transform ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        `}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-t40-light lg:hidden shrink-0">
          <h2 className="font-heading font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <SlidersHorizontal size={16} /> Filters
          </h2>
          <button onClick={onClose} className="p-1" aria-label="Close filters">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-0 lg:py-0 space-y-10">
          {/* T40 Exclusives — path-based, accent like navbar */}
          <div
            className={`border p-4 -mx-2 lg:mx-0 ${
              isT40Path
                ? "border-[#d94625]/40 bg-[#d94625]/5"
                : "border-neutral-200 bg-neutral-50/50"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1 gap-3">
              <button
                type="button"
                onClick={() => setT40Expanded((v) => !v)}
                className="flex items-center justify-between flex-1 min-w-0"
              >
                <h3
                  className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading"
                  style={{ color: T40_ACCENT }}
                >
                  T40 Exclusives
                </h3>
                <ChevronDown
                  size={14}
                  className={`text-[#d94625] transition-transform shrink-0 ${t40Expanded ? "rotate-180" : ""}`}
                />
              </button>
              {isT40Path && (
                <button
                  type="button"
                  onClick={clearT40}
                  className="text-[9px] text-t40-grey hover:text-[#d94625] font-heading uppercase shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {t40Expanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-3">
                <button
                  type="button"
                  onClick={() => navigateT40()}
                  className="flex items-center justify-between w-full group text-left"
                >
                  <span
                    className={`text-[11px] font-heading uppercase tracking-widest transition-colors ${
                      isT40Path && !activeT40Sub
                        ? "font-bold"
                        : "text-t40-grey hover:text-t40-black"
                    }`}
                    style={isT40Path && !activeT40Sub ? { color: T40_ACCENT } : undefined}
                  >
                    All T40 Exclusives
                  </span>
                </button>
                {t40Subcategories.map((sub) => {
                  const isActive = activeT40Sub === sub.slug;
                  return (
                    <button
                      key={sub.slug}
                      type="button"
                      onClick={() => navigateT40(sub.slug)}
                      className="flex items-center justify-between w-full group text-left pl-2 border-l-2 border-transparent"
                      style={isActive ? { borderColor: T40_ACCENT } : undefined}
                    >
                      <span
                        className={`text-[11px] font-heading uppercase tracking-widest transition-colors ${
                          isActive ? "font-bold" : "text-t40-grey hover:text-t40-black"
                        }`}
                        style={isActive ? { color: T40_ACCENT } : undefined}
                      >
                        {sub.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Shop by Scent — path-based */}
          <div
            className={`border p-4 -mx-2 lg:mx-0 ${
              isScentPath
                ? "border-neutral-300 bg-neutral-50"
                : "border-neutral-200 bg-neutral-50/50"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1 gap-3">
              <button
                type="button"
                onClick={() => setScentExpanded((v) => !v)}
                className="flex items-center justify-between flex-1 min-w-0"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black">
                  Shop by Scent
                </h3>
                <ChevronDown
                  size={14}
                  className={`text-t40-grey transition-transform shrink-0 ${scentExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isScentPath && (
                <button
                  type="button"
                  onClick={clearScent}
                  className="text-[9px] text-t40-grey hover:text-[#d94625] font-heading uppercase shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {scentExpanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-3">
                <button
                  type="button"
                  onClick={() => navigateScent()}
                  className="flex items-center justify-between w-full group text-left"
                >
                  <span
                    className={`text-[11px] font-heading uppercase tracking-widest transition-colors ${
                      pathFilters.scentHub
                        ? "font-bold text-t40-black"
                        : "text-t40-grey hover:text-t40-black"
                    }`}
                  >
                    All scent families
                  </span>
                </button>
                {scentFilterOptions.map((opt) => {
                  const isActive = activeScent === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => navigateScent(opt.value)}
                      className="flex items-center justify-between w-full group text-left pl-2 border-l-2 border-transparent"
                      style={isActive ? { borderColor: T40_ACCENT } : undefined}
                    >
                      <span
                        className={`text-[11px] font-heading uppercase tracking-widest transition-colors ${
                          isActive ? "font-bold" : "text-t40-grey hover:text-t40-black"
                        }`}
                        style={isActive ? { color: T40_ACCENT } : undefined}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {filterGroups.length === 0 ? (
            <p className="text-[11px] text-t40-grey font-heading uppercase tracking-widest">
              Loading filters…
            </p>
          ) : (
            filterGroups.map((group) => {
              const selected = getSelectedForGroup(group.id);
              const isExpanded = expandedGroups.has(group.id);

              return (
                <div key={group.id}>
                  <div className="flex items-center justify-between w-full mb-4 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.id)) next.delete(group.id);
                          else next.add(group.id);
                          return next;
                        })
                      }
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black">
                        {group.title}
                      </h3>
                      <ChevronDown
                        size={14}
                        className={`text-t40-grey transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {selected.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearGroup(group.id)}
                        className="text-[9px] text-t40-grey hover:text-[#d94625] font-heading uppercase shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      {group.options.map((opt) => {
                        const isActive = selected.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleFilter(group.id, opt.value, group.type)}
                            className="flex items-center justify-between w-full group text-left"
                          >
                            <span
                              className={`text-[11px] font-heading uppercase tracking-widest transition-colors ${
                                isActive
                                  ? "text-t40-black font-bold"
                                  : "text-t40-grey hover:text-t40-black"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-t40-light lg:hidden bg-t40-white">
          <button
            type="button"
            onClick={() => {
              applyFilters(pending);
              onClose();
            }}
            className="w-full bg-t40-black text-t40-white py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors"
          >
            Show {resultCount > 0 ? `${resultCount} ` : ""}Results
          </button>
        </div>
      </aside>
    </>
  );
}
