import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { deleteSubcategory, updateSubcategory } from "@/lib/catalog/subcategories";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    sort_order?: number;
    is_active?: boolean;
  };

  try {
    await updateSubcategory(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    await deleteSubcategory(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
