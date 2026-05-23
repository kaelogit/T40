import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  getContactContentAdmin,
  saveContactContent,
  importDefaultContactIfEmpty,
} from "@/lib/content/contact";
import type { ContactContent } from "@/lib/content/types";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const content = await getContactContentAdmin();
  return NextResponse.json({ content });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as ContactContent;
    await saveContactContent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const imported = await importDefaultContactIfEmpty();
  return NextResponse.json({ imported });
}
