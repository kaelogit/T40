"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqCategory } from "@/lib/content/types";

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openId, setOpenId] = useState<string | null>(
    categories[0]?.items[0]?.id ?? "0-0"
  );

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-16">
      {categories.map((category, ci) => (
        <div key={category.id ?? category.title}>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-t40-black mb-6 pb-4 border-b border-t40-light">
            {category.title}
          </h2>
          <ul className="divide-y divide-t40-light">
            {category.items.map((item, ii) => {
              const id = item.id ?? `${ci}-${ii}`;
              const isOpen = openId === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="w-full flex items-start justify-between gap-4 py-6 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold font-heading text-t40-black group-hover:text-[#d94625] transition-colors pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-t40-grey transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-sm text-t40-grey font-body leading-relaxed pr-8">
                      {item.answer}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
