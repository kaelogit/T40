import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FaqCategory } from "./types";
import { DEFAULT_FAQ_CATEGORIES } from "./defaults/faq";

function mapCategories(
  categories: { id: string; title: string; sort_order: number }[],
  items: { id: string; category_id: string; question: string; answer: string; sort_order: number }[]
): FaqCategory[] {
  return categories
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => ({
      id: cat.id,
      title: cat.title,
      sortOrder: cat.sort_order,
      items: items
        .filter((i) => i.category_id === cat.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({
          id: i.id,
          question: i.question,
          answer: i.answer,
          sortOrder: i.sort_order,
        })),
    }));
}

export async function getFaqCategories(): Promise<FaqCategory[]> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("faq_categories")
    .select("id, title, sort_order")
    .order("sort_order", { ascending: true });

  if (!categories?.length) return DEFAULT_FAQ_CATEGORIES;

  const { data: items } = await supabase
    .from("faq_items")
    .select("id, category_id, question, answer, sort_order");

  return mapCategories(categories, items ?? []);
}

export async function getFaqCategoriesAdmin(): Promise<FaqCategory[]> {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("faq_categories")
    .select("id, title, sort_order")
    .order("sort_order", { ascending: true });

  if (!categories?.length) return DEFAULT_FAQ_CATEGORIES;

  const { data: items } = await supabase
    .from("faq_items")
    .select("id, category_id, question, answer, sort_order");

  return mapCategories(categories, items ?? []);
}

export async function importDefaultFaqIfEmpty(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("faq_categories")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) return 0;

  for (const [ci, cat] of DEFAULT_FAQ_CATEGORIES.entries()) {
    const { data: row } = await supabase
      .from("faq_categories")
      .insert({ title: cat.title, sort_order: ci })
      .select("id")
      .single();

    if (!row) continue;

    await supabase.from("faq_items").insert(
      cat.items.map((item, ii) => ({
        category_id: row.id,
        question: item.question,
        answer: item.answer,
        sort_order: ii,
      }))
    );
  }

  return DEFAULT_FAQ_CATEGORIES.length;
}

export type { FaqCategory, FaqItem } from "./types";
