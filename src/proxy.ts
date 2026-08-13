import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.has(pathname);

  if (isAdminRoute && !isPublicAdminPath && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: we deliberately do NOT redirect away from /admin/login just
  // because a Supabase session cookie exists here — that would only be an
  // optimistic (non-DB) check. A signed-in user who isn't in staff_members
  // must still be able to land on /admin/login (that's where the dashboard
  // sends them). The DB-backed "already staff, skip the form" redirect
  // lives in src/app/admin/login/page.tsx instead.

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
