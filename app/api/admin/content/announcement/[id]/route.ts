import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  deleteAnnouncement,
  updateAnnouncement,
  type AnnouncementFormInput,
} from "@/lib/content/announcement";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = (await request.json()) as AnnouncementFormInput;

    if (!body.messageShort?.trim() || !body.messageFull?.trim()) {
      return NextResponse.json({ error: "Announcement messages are required." }, { status: 400 });
    }

    await updateAnnouncement(id, body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save announcement." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await deleteAnnouncement(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete announcement." }, { status: 400 });
  }
}
