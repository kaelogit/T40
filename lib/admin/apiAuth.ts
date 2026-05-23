import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/auth";

export async function requireAdminApi(): Promise<
  { user: NonNullable<Awaited<ReturnType<typeof requireAdminUser>>> } | NextResponse
> {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return { user };
}
