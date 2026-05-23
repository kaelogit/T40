import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { question, answer, sortOrder, categoryId } = (await request.json()) as {
    question?: string;
    answer?: string;
    sortOrder?: number;
    categoryId?: string;
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("faq_items")
    .update({
      ...(question != null ? { question: question.trim() } : {}),
      ...(answer != null ? { answer: answer.trim() } : {}),
      ...(sortOrder != null ? { sort_order: sortOrder } : {}),
      ...(categoryId != null ? { category_id: categoryId } : {}),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("faq_items").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
