import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";
import { ReportsClient } from "./ReportsClient";

export const metadata: Metadata = {
  title: `Reports — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function ReportsPage() {
  await requireStaffSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Reports</h1>
      <p className="field-hint mb-6">Search, filter, and review member reports.</p>
      <ReportsClient />
    </div>
  );
}
