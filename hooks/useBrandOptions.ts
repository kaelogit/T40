"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildBrandSlugMap, loadBrandOptions } from "@/lib/shop/brands";
import type { FilterOption } from "@/lib/shop/loadFilterOptions";

const supabase = createClient();

export function useBrandOptions() {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [slugToName, setSlugToName] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadBrandOptions(supabase).then((brands) => {
      if (cancelled) return;
      setOptions(brands);
      setSlugToName(buildBrandSlugMap(brands));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, slugToName, loading };
}
