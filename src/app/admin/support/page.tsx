import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";
import { SupportClient } from "./SupportClient";

export const metadata: Metadata = {
  title: `Support Requests — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function SupportPage() {
  const session = await requireStaffSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Support Requests</h1>
      <p className="field-hint mb-6">Search, filter, and reply to member support requests.</p>
      <SupportClient currentStaffId={session.staff.id} />
    </div>
  );
}
