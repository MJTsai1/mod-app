"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";

export function AccountNavLink() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.discordUsername) {
          setDiscordUsername(data.discordUsername);
          setStatus("signed-in");
        } else {
          setStatus("signed-out");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return null;

  if (status === "signed-in") {
    return (
      <Link
        href="/account"
        className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:inline-block"
      >
        {discordUsername}
      </Link>
    );
  }

  return (
    <DiscordSignInButton
      next={pathname}
      label="Sign In"
      className="btn btn-secondary px-3 py-2 text-sm sm:px-4"
    />
  );
}
