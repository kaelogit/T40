import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { getAnnouncementAdmin, saveAnnouncement } from "@/lib/content/announcement";
import type { AnnouncementFormInput } from "@/lib/content/announcement";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const data = await getAnnouncementAdmin();
  return NextResponse.json({ announcement: data });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as AnnouncementFormInput;
    if (!body.messageShort?.trim() || !body.messageFull?.trim()) {
      return NextResponse.json({ error: "Announcement messages are required." }, { status: 400 });
    }
    await saveAnnouncement(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
