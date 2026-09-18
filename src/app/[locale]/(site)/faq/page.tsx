import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { localeAlternates } from "@/i18n/routing";

export const metadata: Metadata = {
  title: `FAQ — ${siteConfig.serverName}`,
  description: `Frequently asked questions about ${siteConfig.serverName}.`,
  alternates: { languages: localeAlternates("/faq") },
};

export default async function FaqPage() {
  const t = await getTranslations("faq");

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {siteConfig.faqIds.map((id) => (
          <div key={id} className="card p-6">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {t(`items.${id}.question`)}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t(`items.${id}.answer`)}
            </p>
            {id === "stillNeedSupport" && (
              <Link
                href="/support"
                className="mt-3 inline-block text-sm font-medium text-[var(--color-accent-soft)] hover:underline"
              >
                {t(`items.${id}.linkLabel`)} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
