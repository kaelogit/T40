import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  getGeneralFlashSaleAdmin,
  saveGeneralFlashSale,
} from "@/lib/content/generalFlashSale";
import { revalidateStorefront } from "@/lib/content/revalidateStorefront";
import {
  validateGeneralFlashSaleInput,
  type GeneralFlashSaleContent,
} from "@/lib/sales/generalFlashSale";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const content = await getGeneralFlashSaleAdmin();
  return NextResponse.json({ content });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as GeneralFlashSaleContent;
    const validationError = validateGeneralFlashSaleInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await saveGeneralFlashSale(body);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save flash sale." }, { status: 400 });
  }
}
