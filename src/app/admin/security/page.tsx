import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";
import { SecurityClient } from "./SecurityClient";

export const metadata: Metadata = {
  title: `Security — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function SecurityPage() {
  await requireStaffSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Security</h1>
      <p className="field-hint mb-6">
        Add two-factor authentication to your account using an authenticator app (e.g. Google
        Authenticator, 1Password, Authy).
      </p>
      <SecurityClient />
    </div>
  );
}
