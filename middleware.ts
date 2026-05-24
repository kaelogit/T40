import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasPublicSupabaseConfig, resolvePublicSupabaseConfig } from "@/lib/supabase/config";

const ADMIN_HOSTS = (process.env.ADMIN_HOSTS ?? "admin.t40perfumesng.com,admin.localhost:3000")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

function isAdminHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return ADMIN_HOSTS.some(
    (h) => normalized === h.toLowerCase() || normalized.startsWith(`${h.toLowerCase()}:`)
  );
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const adminHost = isAdminHost(host);
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  if (hasPublicSupabaseConfig()) {
    try {
      const { url, anonKey } = resolvePublicSupabaseConfig();
      const supabase = createServerClient<Database>(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      await supabase.auth.getUser();
    } catch {
      // Keep the site reachable if Supabase is misconfigured or unreachable.
    }
  }

  // Subdomain: admin.t40perfumesng.com → /admin/*
  if (adminHost) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Main site: block direct /admin access in production
  if (
    pathname.startsWith("/admin") &&
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_ADMIN_ON_MAIN_HOST
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
