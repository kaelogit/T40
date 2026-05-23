import { NextResponse } from "next/server";
import { getSubcategoriesForCategory } from "@/lib/catalog/subcategories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parent = searchParams.get("parent") ?? "t40-exclusives";

  const subcategories = await getSubcategoriesForCategory(parent, true, { usedOnly: true });
  return NextResponse.json({ subcategories });
}
