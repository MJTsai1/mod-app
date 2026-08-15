"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  next?: string;
  className?: string;
  label?: string;
}

export function DiscordSignInButton({ next, className, label = "Sign in with Discord" }: Props) {
  async function handleClick() {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: redirectTo.toString() },
    });
  }

  return (
    <button type="button" onClick={handleClick} className={className ?? "btn btn-primary"}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M20.3 5.3A17.6 17.6 0 0015.7 4l-.3.6a13 13 0 014 1.6 16 16 0 00-15 0 12 12 0 014-1.6L8 4a17.6 17.6 0 00-4.6 1.3C1 9.6.4 13.8.7 18a17.8 17.8 0 005.4 2.7l.9-1.4a11 11 0 01-1.9-.9l.5-.4a12.7 12.7 0 0010.8 0l.5.4c-.6.4-1.2.6-1.9.9l.9 1.4A17.7 17.7 0 0023.3 18c.4-4.9-.9-9-3-12.7zM9 15c-.9 0-1.6-.9-1.6-2s.7-2 1.6-2 1.7.9 1.6 2c0 1.1-.7 2-1.6 2zm6 0c-.9 0-1.6-.9-1.6-2s.7-2 1.6-2 1.6.9 1.6 2-.7 2-1.6 2z" />
      </svg>
      {label}
    </button>
  );
}
