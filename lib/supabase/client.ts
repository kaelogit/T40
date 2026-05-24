import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { resolvePublicSupabaseConfig } from "./config";

export function createClient() {
  const { url, anonKey } = resolvePublicSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}
