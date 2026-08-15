import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth code exchange for community Discord sign-in (report/appeal/account
 * pages — see DiscordSignInButton.tsx). Staff auth is separate and does not
 * use this route; staff sign in with email + password directly.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const redirectTo = next && next.startsWith("/") ? next : "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
  }

  const failUrl = new URL(redirectTo, url.origin);
  failUrl.searchParams.set("error", "auth");
  return NextResponse.redirect(failUrl);
}
