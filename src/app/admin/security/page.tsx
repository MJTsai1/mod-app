import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";
import { SecurityClient } from "./SecurityClient";

export const metadata: Metadata = {
  title: `Security — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function SecurityPage() {
  await requireStaffSession();
  const t = await getTranslations("securityPage");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
      <p className="field-hint mb-6">{t("subtitle")}</p>
      <SecurityClient />
    </div>
  );
}
