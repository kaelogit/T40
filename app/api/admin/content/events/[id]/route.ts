import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { deleteEvent, updateEvent, type EventFormInput } from "@/lib/content/events";
import { revalidateStorefront } from "@/lib/content/revalidateStorefront";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = (await request.json()) as EventFormInput;

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    await updateEvent(id, body);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await deleteEvent(id);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete event." }, { status: 400 });
  }
}
