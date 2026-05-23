import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactContent } from "./types";
import { DEFAULT_CONTACT_CONTENT } from "./types";

export async function getContactContent(): Promise<ContactContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("page_key", "contact")
    .maybeSingle();

  return (data?.content as ContactContent | null) ?? DEFAULT_CONTACT_CONTENT;
}

export async function getContactContentAdmin(): Promise<ContactContent> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("page_key", "contact")
    .maybeSingle();

  return (data?.content as ContactContent | null) ?? DEFAULT_CONTACT_CONTENT;
}

export async function saveContactContent(content: ContactContent) {
  const supabase = createAdminClient();
  await supabase.from("site_pages").upsert({
    page_key: "contact",
    content,
    updated_at: new Date().toISOString(),
  });
}

export async function importDefaultContactIfEmpty(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_pages")
    .select("page_key")
    .eq("page_key", "contact")
    .maybeSingle();

  if (data) return false;

  await supabase.from("site_pages").insert({
    page_key: "contact",
    content: DEFAULT_CONTACT_CONTENT,
  });
  return true;
}
