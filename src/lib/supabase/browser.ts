import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser-side Supabase client. Only used for the staff login page to call
 * `supabase.auth.signInWithOtp`. The anon key it uses is public by design
 * (safe to ship to the client) and is subject to Row Level Security, which
 * grants it no access to `applications` — see supabase/migrations/0001_init.sql.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
