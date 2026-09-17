import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("copyright", { year: new Date().getFullYear(), serverName: siteConfig.serverName })}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/#requirements" className="transition hover:text-[var(--color-text)]">
            {t("requirements")}
          </Link>
          <Link href="/faq" className="transition hover:text-[var(--color-text)]">
            {t("faq")}
          </Link>
          <Link href="/report" className="transition hover:text-[var(--color-text)]">
            {t("report")}
          </Link>
          <Link href="/appeal" className="transition hover:text-[var(--color-text)]">
            {t("appeal")}
          </Link>
          <Link href="/privacy" className="transition hover:text-[var(--color-text)]">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="transition hover:text-[var(--color-text)]">
            {t("terms")}
          </Link>
          {siteConfig.socialLinks.discord && (
            <a
              href={siteConfig.socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--color-text)]"
            >
              {t("discord")}
            </a>
          )}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="transition hover:text-[var(--color-text)]"
          >
            {t("contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
