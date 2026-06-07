import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  createEvent,
  getEventsAdmin,
  importDefaultEventsIfEmpty,
  type EventFormInput,
} from "@/lib/content/events";
import { revalidateStorefront } from "@/lib/content/revalidateStorefront";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const events = await getEventsAdmin();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as EventFormInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body.startsAt?.trim()) {
      return NextResponse.json({ error: "Start date is required." }, { status: 400 });
    }

    const id = await createEvent(body);
    revalidateStorefront();
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const count = await importDefaultEventsIfEmpty();
    revalidateStorefront();
    return NextResponse.json({ ok: true, imported: count });
  } catch {
    return NextResponse.json({ error: "Could not import defaults." }, { status: 400 });
  }
}
