"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductHref } from "@/lib/products/urls";
import { formatPrice, getProductPricing } from "@/lib/products/pricing";
import { normalizeProduct } from "@/lib/products/normalize";
import type { Tables } from "@/types/database";
import { loadScentOptions } from "@/lib/shop/scents";
import {
  FINDER_STEPS,
  fetchFinderResults,
  finderShopHref,
  resultHeadline,
  resultSubtext,
  type FinderAnswers,
  type FinderMatchQuality,
} from "@/lib/shop/fragranceFinder";

const supabase = createClient();

type ResultProduct = ReturnType<typeof normalizeProduct>;

const emptyAnswers: FinderAnswers = { gender: "", scent: "", occasion: "" };

export default function FragranceFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FinderAnswers>(emptyAnswers);
  const [results, setResults] = useState<ResultProduct[]>([]);
  const [matchQuality, setMatchQuality] = useState<FinderMatchQuality>("fallback");
  const [loading, setLoading] = useState(false);
  const [finderSteps, setFinderSteps] = useState(FINDER_STEPS);

  useEffect(() => {
    loadScentOptions(supabase).then((opts) => {
      if (!opts.length) return;
      setFinderSteps([
        FINDER_STEPS[0],
        {
          ...FINDER_STEPS[1],
          options: opts.map((o) => ({ label: o.label, value: o.value })),
        },
        FINDER_STEPS[2],
      ]);
    });
  }, []);

  const handleSelect = async (key: keyof FinderAnswers, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setStep(4);
    const { products, matchQuality: quality } = await fetchFinderResults(supabase, newAnswers);
    setResults(products.map((p) => normalizeProduct(p as Tables<"products">)));
    setMatchQuality(quality);
    setLoading(false);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers(emptyAnswers);
    setResults([]);
    setMatchQuality("fallback");
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const currentStep = step >= 1 && step <= 3 ? finderSteps[step - 1] : null;

  return (
    <section className="w-full py-20 lg:py-28 border-t border-t40-grey/10 bg-t40-white">
      <div className="t40-container px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left — intro */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading">
              Not sure where to start?
            </p>
            <h2 className="font-heading text-2xl md:text-4xl font-bold md:font-black uppercase text-t40-black tracking-tighter mb-4">
              Fragrance Finder
            </h2>
            <p className="text-sm text-t40-grey leading-relaxed mb-6">
              Answer three quick questions. We&apos;ll suggest fragrances from our shop that fit
              your preferences.
            </p>
            {step >= 1 && step <= 3 && (
              <div className="hidden lg:flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey">
                {finderSteps.map((s, i) => (
                  <span
                    key={s.key}
                    className={step > i ? "text-[#d94625]" : step === i + 1 ? "text-t40-black" : ""}
                  >
                    {i + 1}. {s.question}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right — quiz panel */}
          <div className="lg:col-span-8">
            <div className="bg-t40-light/60 border border-t40-grey/10 min-h-[420px] flex flex-col justify-center p-6 md:p-10 lg:p-12">
              {step === 0 && (
                <div className="text-center max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-t40-white border border-t40-grey/10 mb-6">
                    <Sparkles size={24} className="text-[#d94625]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black font-heading uppercase tracking-tight text-t40-black mb-3">
                    Find a scent in under a minute
                  </h3>
                  <p className="text-sm text-t40-grey leading-relaxed mb-8">
                    No account needed. Pick who it&apos;s for, the scent style, and when
                    they&apos;ll wear it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-t40-black text-t40-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors"
                  >
                    Start
                  </button>
                </div>
              )}

              {currentStep && (
                <div className="w-full max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={step === 1}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey hover:text-t40-black disabled:invisible"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            s <= step ? "w-8 bg-[#d94625]" : "w-2 bg-t40-grey/25"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey w-12 text-right">
                      {step}/3
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black font-heading text-t40-black mb-6 leading-snug">
                    {currentStep.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(currentStep.key, opt.value)}
                        className="bg-t40-white border border-t40-grey/15 py-4 px-5 text-left text-[11px] font-bold uppercase tracking-wider font-heading text-t40-black hover:border-t40-black hover:bg-t40-black hover:text-t40-white transition-all group flex items-center justify-between gap-2"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight
                          size={14}
                          className="opacity-40 group-hover:opacity-100 shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && loading && (
                <div className="flex flex-col items-center py-12">
                  <div className="h-10 w-10 border-2 border-t40-grey/20 border-t-[#d94625] rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey">
                    Searching the collection…
                  </p>
                </div>
              )}

              {step === 4 && !loading && (
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-t40-grey/15">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-[#d94625] mb-1">
                        Your results
                      </p>
                      <h3 className="text-lg font-black font-heading text-t40-black uppercase">
                        {resultHeadline(matchQuality, results.length)}
                      </h3>
                      <p className="text-sm text-t40-grey mt-2">{resultSubtext(matchQuality)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-[0.2em] font-heading flex items-center gap-2 text-t40-grey hover:text-t40-black bg-t40-white px-4 py-2.5 border border-t40-grey/15"
                    >
                      <RefreshCw size={12} /> Start over
                    </button>
                  </div>

                  {results.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                        {results.map((product) => {
                          const { unitPrice, compareAt } = getProductPricing(product);
                          const image =
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop";
                          return (
                            <Link
                              key={product.id}
                              href={getProductHref(product)}
                              className="group bg-t40-white border border-t40-grey/10 hover:border-t40-black transition-colors"
                            >
                              <div className="relative aspect-square bg-t40-light overflow-hidden">
                                <Image
                                  src={image}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <div className="p-3 space-y-1">
                                {product.brand && (
                                  <p className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-grey truncate">
                                    {product.brand}
                                  </p>
                                )}
                                <p className="text-[11px] font-bold uppercase font-heading text-t40-black truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs font-bold text-[#d94625]">
                                  {formatPrice(unitPrice)}
                                  {compareAt != null && compareAt > unitPrice && (
                                    <span className="ml-1.5 text-[10px] text-t40-grey line-through font-normal">
                                      {formatPrice(compareAt)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-8 text-center">
                        <Link
                          href={finderShopHref(answers)}
                          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-black border-b border-t40-black pb-0.5 hover:text-[#d94625] hover:border-[#d94625] transition-colors"
                        >
                          Browse more in shop <ArrowRight size={14} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-t40-grey mb-6">
                        We couldn&apos;t find products yet. Try again or browse the full shop.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={resetQuiz}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest font-heading border border-t40-black"
                        >
                          Try again
                        </button>
                        <Link
                          href="/shop"
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest font-heading bg-t40-black text-t40-white hover:bg-[#d94625] transition-colors"
                        >
                          View all products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
