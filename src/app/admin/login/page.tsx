import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getStaffSession } from "@/lib/staffAuth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: `Staff Sign In — ${siteConfig.serverName}`,
  robots: { index: false },
};

export default async function AdminLoginPage() {
  // Real (DB-backed) check: only skip the form if this session actually
  // belongs to a staff_members row. A signed-in-but-not-staff user must
  // still land here — see src/proxy.ts for why that distinction matters.
  const session = await getStaffSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6">
      <div className="card-elevated relative w-full max-w-sm p-8">
        <Link
          href="/"
          aria-label="Close and return home"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-subtle)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Staff Sign In</h1>
        <p className="field-hint mb-6">
          {siteConfig.serverName} moderator application dashboard.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
