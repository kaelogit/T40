"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";

const GeneralFlashSaleContext = createContext<GeneralFlashSaleContent | null>(null);

export function GeneralFlashSaleProvider({
  config: initialConfig,
  children,
}: {
  config: GeneralFlashSaleContent | null;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<GeneralFlashSaleContent | null>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    fetch("/api/sales/general")
      .then((r) => r.json())
      .then((d) => setConfig((d.sale as GeneralFlashSaleContent | null) ?? null))
      .catch(() => {});
  }, []);

  return (
    <GeneralFlashSaleContext.Provider value={config}>
      {children}
    </GeneralFlashSaleContext.Provider>
  );
}

export function useGeneralFlashSale(): GeneralFlashSaleContent | null {
  return useContext(GeneralFlashSaleContext);
}
