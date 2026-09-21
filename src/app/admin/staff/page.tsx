import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";
import { StaffManagementClient } from "./StaffManagementClient";

export const metadata: Metadata = {
  title: `Manage Staff — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function StaffPage() {
  const session = await requireStaffSession();
  if (session.staff.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const t = await getTranslations("staffPage");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
      <p className="field-hint mb-6">{t("subtitle")}</p>
      <StaffManagementClient currentStaffId={session.staff.id} />
    </div>
  );
}
