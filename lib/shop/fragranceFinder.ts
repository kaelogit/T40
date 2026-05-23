import type { SupabaseClient } from "@supabase/supabase-js";
import { scentSlugToMatchTerms } from "./scents";

export type FinderAnswers = {
  gender: string;
  scent: string;
  occasion: string;
};

export type FinderMatchQuality = "strong" | "partial" | "fallback";

export const FINDER_STEPS = [
  {
    key: "gender" as const,
    question: "Who is this fragrance for?",
    options: [
      { label: "Women", value: "women" },
      { label: "Men", value: "men" },
      { label: "Unisex / anyone", value: "unisex" },
    ],
  },
  {
    key: "scent" as const,
    question: "What kind of scent do you like?",
    options: [
      { label: "Floral", value: "floral" },
      { label: "Woody & earthy", value: "woody-earthy" },
      { label: "Fresh & citrus", value: "fresh-citrus" },
      { label: "Amber & spice", value: "amber-spice" },
      { label: "Oud & leather", value: "oud-leather" },
      { label: "Sweet & gourmand", value: "gourmand" },
    ],
  },
  {
    key: "occasion" as const,
    question: "When will they wear it?",
    options: [
      { label: "Everyday", value: "everyday" },
      { label: "Office", value: "office" },
      { label: "Evening", value: "evening" },
      { label: "Date night", value: "date" },
    ],
  },
];

function matchesGender(category: string | null | undefined, gender: string): boolean {
  if (!gender || gender === "unisex") return true;
  const cat = (category ?? "").toLowerCase();
  if (!cat) return true;
  if (cat === gender || cat === "unisex" || cat === "t40-exclusives") return true;
  return false;
}

function matchesScent(notes: string | null | undefined, scentSlug: string): boolean {
  if (!scentSlug) return true;
  const hay = (notes ?? "").toLowerCase();
  if (!hay) return false;
  return scentSlugToMatchTerms(scentSlug).some((term) => hay.includes(term.toLowerCase()));
}

function matchesOccasion(occasion: string | null | undefined, target: string): boolean {
  if (!target) return true;
  return (occasion ?? "").toLowerCase() === target.toLowerCase();
}

/** Score 0–8: gender (3) + scent (3) + occasion (2). Returns -1 if hard-excluded by gender. */
export function scoreFinderProduct(
  product: {
    category?: string | null;
    notes?: string | null;
    occasion?: string | null;
  },
  answers: FinderAnswers
): number {
  if (answers.gender && answers.gender !== "unisex" && !matchesGender(product.category, answers.gender)) {
    return -1;
  }

  let score = 0;
  if (answers.gender && matchesGender(product.category, answers.gender)) score += 3;
  if (answers.scent && matchesScent(product.notes, answers.scent)) score += 3;
  if (answers.occasion && matchesOccasion(product.occasion, answers.occasion)) score += 2;

  return score;
}

export async function fetchFinderResults(
  supabase: SupabaseClient,
  answers: FinderAnswers
): Promise<{ products: Record<string, unknown>[]; matchQuality: FinderMatchQuality }> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sales_count", { ascending: false })
    .limit(80);

  if (error || !data?.length) {
    return { products: [], matchQuality: "fallback" };
  }

  const ranked = data
    .map((product) => ({
      product,
      score: scoreFinderProduct(product, answers),
    }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score);

  const withPoints = ranked.filter((row) => row.score > 0);
  const top = (withPoints.length ? withPoints : ranked).slice(0, 4).map((row) => row.product);

  const bestScore = withPoints[0]?.score ?? 0;
  let matchQuality: FinderMatchQuality = "fallback";
  if (bestScore >= 6) matchQuality = "strong";
  else if (bestScore >= 3) matchQuality = "partial";

  return { products: top, matchQuality };
}

export function finderShopHref(answers: FinderAnswers): string {
  const params = new URLSearchParams();
  if (answers.gender && answers.gender !== "unisex") {
    return `/shop/${answers.gender}`;
  }
  if (answers.scent) return `/shop/scent/${answers.scent}`;
  return "/shop";
}

export function resultHeadline(quality: FinderMatchQuality, count: number): string {
  if (count === 0) return "No matches yet";
  if (quality === "strong") return `${count} ${count === 1 ? "match" : "matches"} for you`;
  if (quality === "partial") return `${count} close ${count === 1 ? "match" : "matches"}`;
  return `${count} picks from our collection`;
}

export function resultSubtext(quality: FinderMatchQuality): string {
  if (quality === "strong") return "Based on your answers, these are our best fits.";
  if (quality === "partial") return "We widened the search slightly — these are the nearest fits in stock.";
  return "Browse these popular fragrances or try different answers.";
}
