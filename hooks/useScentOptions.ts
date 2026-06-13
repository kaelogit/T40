"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadScentOptions } from "@/lib/shop/scents";
import type { FilterOption } from "@/lib/shop/loadFilterOptions";

const supabase = createClient();

export function useScentOptions() {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadScentOptions(supabase).then((scents) => {
      if (cancelled) return;
      setOptions(scents);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading };
}
