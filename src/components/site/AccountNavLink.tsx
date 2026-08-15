"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AccountNavLink() {
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setDiscordUsername(data?.discordUsername ?? null);
      })
      .catch(() => {
        // Not signed in / network hiccup — just don't show the link.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!discordUsername) return null;

  return (
    <Link
      href="/account"
      className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:inline-block"
    >
      {discordUsername}
    </Link>
  );
}
