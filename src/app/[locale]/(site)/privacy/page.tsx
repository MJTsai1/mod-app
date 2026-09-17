import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { LegalSection as Section } from "@/components/site/LegalSection";

export const metadata: Metadata = {
  title: `Privacy Notice — ${siteConfig.serverName}`,
};

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">
        {t("intro", { serverName: siteConfig.serverName })}
      </p>

      <Section title={t("whatIsCollected.title")}>
        <p>
          <strong className="text-[var(--color-text)]">{t("whatIsCollected.applicationsLabel")}</strong>{" "}
          {t("whatIsCollected.applications")}
        </p>
        <p>
          <strong className="text-[var(--color-text)]">{t("whatIsCollected.signingInLabel")}</strong>{" "}
          {t("whatIsCollected.signingIn")}
        </p>
        <p>
          <strong className="text-[var(--color-text)]">{t("whatIsCollected.reportsLabel")}</strong>{" "}
          {t("whatIsCollected.reports")}
        </p>
        <p>
          <strong className="text-[var(--color-text)]">{t("whatIsCollected.appealsLabel")}</strong>{" "}
          {t("whatIsCollected.appeals")}
        </p>
        <p>{t("whatIsCollected.ipHash")}</p>
      </Section>

      <Section title={t("why.title")}>
        <p>{t("why.body")}</p>
      </Section>

      <Section title={t("howStored.title")}>
        <p>{t("howStored.body")}</p>
      </Section>

      <Section title={t("whoCanAccess.title")}>
        <p>{t("whoCanAccess.body", { serverName: siteConfig.serverName })}</p>
      </Section>

      <Section title={t("yourRights.title")}>
        <p>{t("yourRights.contactMethod")}</p>
        <p>
          {t("yourRights.reachAt")}{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-[var(--color-accent-soft)] underline underline-offset-2"
          >
            {siteConfig.contactEmail}
          </a>{" "}
          {t("yourRights.body")}
        </p>
      </Section>
    </div>
  );
}
