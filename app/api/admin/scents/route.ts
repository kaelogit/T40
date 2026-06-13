import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { scentToSlug } from "@/lib/shop/scents";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scents")
    .select("id, name, slug, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scents: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name } = (await request.json()) as { name?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Scent name required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const trimmed = name.trim();
    const { data, error } = await supabase
      .from("scents")
      .insert({ name: trimmed, slug: scentToSlug(trimmed), is_active: true })
      .select("id, name, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: existing } = await supabase
          .from("scents")
          .select("id, name, slug")
          .eq("slug", scentToSlug(trimmed))
          .maybeSingle();
        if (existing) return NextResponse.json({ scent: existing });
        return NextResponse.json({ error: "Scent already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scent: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
