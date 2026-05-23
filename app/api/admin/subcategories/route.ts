import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  createSubcategory,
  getAllSubcategoriesAdmin,
  getSubcategoriesForCategory,
  pruneAllUnusedT40Subcategories,
  syncT40SubcategoriesFromCategories,
} from "@/lib/catalog/subcategories";
import { PRODUCT_CATEGORY_SLUGS } from "@/lib/catalog/productCategories";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const parent = searchParams.get("parent");

  if (parent) {
    const items = await getSubcategoriesForCategory(parent, false);
    return NextResponse.json({ subcategories: items });
  }

  try {
    await syncT40SubcategoriesFromCategories();
    await pruneAllUnusedT40Subcategories();
  } catch {
    // Legacy nav rows are optional; product_subcategories is the source of truth.
  }

  const items = await getAllSubcategoriesAdmin();
  return NextResponse.json({ subcategories: items });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      parent_category?: string;
      name?: string;
      slug?: string;
      sort_order?: number;
    };

    if (!body.parent_category || !(PRODUCT_CATEGORY_SLUGS as readonly string[]).includes(body.parent_category)) {
      return NextResponse.json({ error: "Invalid parent category." }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const row = await createSubcategory({
      parent_category: body.parent_category,
      name: body.name,
      slug: body.slug,
      sort_order: body.sort_order,
    });

    return NextResponse.json({ subcategory: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create subcategory.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const items = await getAllSubcategoriesAdmin();
  return NextResponse.json({ synced: true, subcategories: items });
}
