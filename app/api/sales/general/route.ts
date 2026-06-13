import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_GENERAL_FLASH_SALE,
  isGeneralFlashSaleLive,
  type GeneralFlashSaleContent,
} from "@/lib/sales/generalFlashSale";

const PAGE_KEY = "general_flash_sale";

function parseContent(raw: unknown): GeneralFlashSaleContent {
  if (!raw || typeof raw !== "object") return DEFAULT_GENERAL_FLASH_SALE;
  const c = raw as Partial<GeneralFlashSaleContent>;
  return {
    active: Boolean(c.active),
    percentOff: Number(c.percentOff) || DEFAULT_GENERAL_FLASH_SALE.percentOff,
    endsAt: c.endsAt ?? null,
    eyebrow: c.eyebrow?.trim() || DEFAULT_GENERAL_FLASH_SALE.eyebrow,
    title: c.title?.trim() || DEFAULT_GENERAL_FLASH_SALE.title,
    homepageLayout:
      c.homepageLayout === "featured" ||
      c.homepageLayout === "grid" ||
      c.homepageLayout === "banner" ||
      c.homepageLayout === "rolling"
        ? c.homepageLayout
        : DEFAULT_GENERAL_FLASH_SALE.homepageLayout,
    excludeGiftSets: c.excludeGiftSets !== false,
    updatedAt: c.updatedAt,
  };
}

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content, updated_at")
    .eq("page_key", PAGE_KEY)
    .maybeSingle();

  if (!data?.content) {
    return NextResponse.json({ sale: null });
  }

  const content = parseContent(data.content);
  content.updatedAt = data.updated_at;
  const sale = isGeneralFlashSaleLive(content) ? content : null;
  return NextResponse.json({ sale });
}
