import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  // /admin is English-only staff tooling, outside the [locale] segment —
  // unchanged from before locale routing was added.
  if (isAdminRoute) {
    const { supabaseResponse, user } = await updateSupabaseSession(request);
    const isPublicAdminPath = PUBLIC_ADMIN_PATHS.has(pathname);

    if (!isPublicAdminPath && !user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: we deliberately do NOT redirect away from /admin/login just
    // because a Supabase session cookie exists here — that would only be an
    // optimistic (non-DB) check. A signed-in user who isn't in staff_members
    // must still be able to land on /admin/login (that's where the
    // dashboard sends them). The DB-backed "already staff, skip the form"
    // redirect lives in src/app/admin/login/page.tsx instead.

    return supabaseResponse;
  }

  // Every other matched path is part of the public, locale-routed site.
  return intlMiddleware(request);
}

export const config = {
  // /stats is a standalone, English-only public page outside the [locale]
  // segment (like /admin) — excluded here so next-intl's locale-detection
  // redirect never sends a visitor to a non-existent /fr/stats etc.
  matcher: ["/admin/:path*", "/((?!api|auth|stats|_next|_vercel|.*\\..*).*)"],
};
