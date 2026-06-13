"use client";

import { createContext, useContext } from "react";
import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";

const GeneralFlashSaleContext = createContext<GeneralFlashSaleContent | null>(null);

export function GeneralFlashSaleProvider({
  config,
  children,
}: {
  config: GeneralFlashSaleContent | null;
  children: React.ReactNode;
}) {
  return (
    <GeneralFlashSaleContext.Provider value={config}>
      {children}
    </GeneralFlashSaleContext.Provider>
  );
}

export function useGeneralFlashSale(): GeneralFlashSaleContent | null {
  return useContext(GeneralFlashSaleContext);
}
