import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFaqCategoriesAdmin, importDefaultFaqIfEmpty } from "@/lib/content/faq";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const categories = await getFaqCategoriesAdmin();
  return NextResponse.json({ categories });
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const count = await importDefaultFaqIfEmpty();
  return NextResponse.json({ imported: count });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    type: "category" | "item";
    title?: string;
    categoryId?: string;
    question?: string;
    answer?: string;
    sortOrder?: number;
  };

  const supabase = createAdminClient();

  if (body.type === "category") {
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Category title required." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("faq_categories")
      .insert({ title: body.title.trim(), sort_order: body.sortOrder ?? 0 })
      .select("id, title, sort_order")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data });
  }

  if (!body.categoryId || !body.question?.trim() || !body.answer?.trim()) {
    return NextResponse.json({ error: "Category, question, and answer required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("faq_items")
    .insert({
      category_id: body.categoryId,
      question: body.question.trim(),
      answer: body.answer.trim(),
      sort_order: body.sortOrder ?? 0,
    })
    .select("id, category_id, question, answer, sort_order")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
