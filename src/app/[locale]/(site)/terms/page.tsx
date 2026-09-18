import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { localeAlternates } from "@/i18n/routing";
import { LegalSection as Section } from "@/components/site/LegalSection";

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.serverName}`,
  alternates: { languages: localeAlternates("/terms") },
};

interface TermsSection {
  title: string;
  body?: string;
  list?: string[];
}

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as TermsSection[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">
        {t("intro", { serverName: siteConfig.serverName })}
      </p>

      {sections.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.list && (
            <ul className="list-disc space-y-2 pl-5">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.body && <p>{section.body.replaceAll("{serverName}", siteConfig.serverName)}</p>}
        </Section>
      ))}

      <Section title={t("contact.title")}>
        <p>
          {t("contact.body")}{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-[var(--color-accent-soft)] underline underline-offset-2"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
