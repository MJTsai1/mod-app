import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaffSession } from "@/lib/staffAuth";
import { hasSection } from "@/lib/permissions";
import { siteConfig } from "@/lib/config";
import { AppealsClient } from "./AppealsClient";

export const metadata: Metadata = {
  title: `Ban Appeals — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function AppealsPage() {
  const session = await requireStaffSession();
  if (!hasSection(session.staff, "appeals")) {
    redirect("/admin/my-claims");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Ban Appeals</h1>
      <p className="field-hint mb-6">Search, filter, and review ban appeals.</p>
      <AppealsClient currentStaffId={session.staff.id} />
    </div>
  );
}
