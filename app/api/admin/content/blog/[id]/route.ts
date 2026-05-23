import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogFormToRow, getBlogPostAdmin, type BlogFormInput } from "@/lib/content/blog";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const post = await getBlogPostAdmin(id);
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = (await request.json()) as BlogFormInput;
    const supabase = createAdminClient();
    const row = blogFormToRow(body);
    const { data, error } = await supabase
      .from("blog_posts")
      .update(row)
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already in use." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
