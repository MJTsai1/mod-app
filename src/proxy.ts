import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";
import { ADMIN_LOCALE_COOKIE, ADMIN_LOCALE_HEADER, defaultAdminLocale, isAdminLocale } from "@/i18n/adminLocales";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  // /admin stays outside the [locale] URL segment (staff bookmarks, cron
  // links, etc. must keep working unprefixed), but staff can still pick a
  // language — that preference lives in its own cookie and is forwarded to
  // Server Components as a request header for src/i18n/request.ts to read.
  if (isAdminRoute) {
    const cookieLocale = request.cookies.get(ADMIN_LOCALE_COOKIE)?.value;
    const adminLocale = isAdminLocale(cookieLocale) ? cookieLocale : defaultAdminLocale;

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

    // Rebuild the response with the resolved admin locale as an explicit
    // request-header override — mutating request.headers in place does not
    // propagate through to the page render, only a fresh
    // NextResponse.next({ request: { headers } }) does. Any Set-Cookie from
    // the Supabase session refresh above still needs to ride along.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ADMIN_LOCALE_HEADER, adminLocale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
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
