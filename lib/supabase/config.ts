/** Public Supabase env — safe to read on server and client. */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function hasPublicSupabaseConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Stub credentials so prerender/build does not throw when env is missing. */
export const SUPABASE_BUILD_STUB_URL = "http://127.0.0.1:54321";
export const SUPABASE_BUILD_STUB_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export function resolvePublicSupabaseConfig() {
  return {
    url: getSupabaseUrl() ?? SUPABASE_BUILD_STUB_URL,
    anonKey: getSupabaseAnonKey() ?? SUPABASE_BUILD_STUB_ANON_KEY,
  };
}
