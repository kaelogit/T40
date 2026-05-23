import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  blogFormToRow,
  getBlogPostsAdmin,
  importDefaultBlogPosts,
  type BlogFormInput,
} from "@/lib/content/blog";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const posts = await getBlogPostsAdmin();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as BlogFormInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body.coverImage?.trim()) {
      return NextResponse.json({ error: "Cover image is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const row = blogFormToRow(body);
    const { data, error } = await supabase.from("blog_posts").insert(row).select("id, slug").single();

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

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const count = await importDefaultBlogPosts();
  return NextResponse.json({ imported: count });
}
