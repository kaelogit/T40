import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandToSlug } from "@/lib/shop/brands";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, is_active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brands: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name } = (await request.json()) as { name?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const trimmed = name.trim();
    const { data, error } = await supabase
      .from("brands")
      .insert({ name: trimmed, slug: brandToSlug(trimmed), is_active: true })
      .select("id, name, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Brand already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ brand: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
