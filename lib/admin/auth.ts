import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function requireAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const ok = await isAdminUser(user.id);
  return ok ? user : null;
}
