import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { getAboutContentAdmin, saveAboutContent, importDefaultAboutIfEmpty } from "@/lib/content/about";
import type { AboutContent } from "@/lib/content/types";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const content = await getAboutContentAdmin();
  return NextResponse.json({ content });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as AboutContent;
    await saveAboutContent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const imported = await importDefaultAboutIfEmpty();
  return NextResponse.json({ imported });
}
