"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { mergeShopFilters, type ShopQueryFilters } from "@/lib/shop/buildProductQuery";

export function useShopFilters(): ShopQueryFilters {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(
    () => mergeShopFilters(pathname, searchParams),
    [pathname, searchParams]
  );
}
