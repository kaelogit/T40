import { createClient } from "@/lib/supabase/server";
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
    homepageLayout: c.homepageLayout ?? DEFAULT_GENERAL_FLASH_SALE.homepageLayout,
    excludeGiftSets: c.excludeGiftSets !== false,
    updatedAt: c.updatedAt,
  };
}

export async function getGeneralFlashSale(): Promise<GeneralFlashSaleContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content, updated_at")
    .eq("page_key", PAGE_KEY)
    .maybeSingle();

  if (!data?.content) return DEFAULT_GENERAL_FLASH_SALE;

  const content = parseContent(data.content);
  content.updatedAt = data.updated_at;
  return content;
}

/** Active config for pricing/display, or null when inactive or expired. */
export async function getLiveGeneralFlashSale(): Promise<GeneralFlashSaleContent | null> {
  const config = await getGeneralFlashSale();
  return isGeneralFlashSaleLive(config) ? config : null;
}

export async function getGeneralFlashSaleAdmin(): Promise<GeneralFlashSaleContent> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content, updated_at")
    .eq("page_key", PAGE_KEY)
    .maybeSingle();

  if (!data?.content) return DEFAULT_GENERAL_FLASH_SALE;

  const content = parseContent(data.content);
  content.updatedAt = data.updated_at;
  return content;
}

export async function saveGeneralFlashSale(content: GeneralFlashSaleContent) {
  const supabase = createAdminClient();
  const payload: GeneralFlashSaleContent = {
    ...content,
    eyebrow: content.eyebrow.trim() || DEFAULT_GENERAL_FLASH_SALE.eyebrow,
    title: content.title.trim() || DEFAULT_GENERAL_FLASH_SALE.title,
    updatedAt: new Date().toISOString(),
  };

  await supabase.from("site_pages").upsert({
    page_key: PAGE_KEY,
    content: payload,
    updated_at: payload.updatedAt,
  });
}

export async function expireGeneralFlashSaleIfNeeded(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("page_key", PAGE_KEY)
    .maybeSingle();

  if (!data?.content) return false;

  const content = parseContent(data.content);
  if (!content.active || !content.endsAt) return false;
  if (new Date(content.endsAt).getTime() > Date.now()) return false;

  await saveGeneralFlashSale({ ...content, active: false });
  return true;
}
