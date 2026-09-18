import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { AccountNavLink } from "@/components/site/AccountNavLink";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--color-text)]"
        >
          <Image
            src="/logo.jpg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            priority
          />
          <span className="hidden sm:inline">{siteConfig.serverName}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/faq"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] lg:inline-block"
          >
            {t("faq")}
          </Link>
          <Link
            href="/report"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] lg:inline-block"
          >
            {t("report")}
          </Link>
          <Link
            href="/appeal"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] lg:inline-block"
          >
            {t("appeal")}
          </Link>

          {siteConfig.donationUrl && (
            <a
              href={siteConfig.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] md:inline-flex"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[var(--color-danger)]" aria-hidden>
                <path
                  d="M10 17s-6.5-3.9-6.5-8.5C3.5 5.9 5.4 4 7.7 4c1.3 0 2.4.6 3.1 1.6.7-1 1.8-1.6 3.1-1.6 2.3 0 4.2 1.9 4.2 4.5 0 4.6-6.5 8.5-6.5 8.5z"
                  fill="currentColor"
                />
              </svg>
              {t("supportUs")}
            </a>
          )}

          <ThemeToggle label={tCommon("toggleTheme")} />

          <LanguageSwitcher className="field-input hidden w-auto px-2 py-1.5 text-sm sm:block" />

          <AccountNavLink />

          <Link href="/admin/login" className="btn btn-secondary px-3 py-2 text-sm sm:px-4">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M3.5 17c1-3.5 4-5 6.5-5s5.5 1.5 6.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">{t("staffLogin")}</span>
          </Link>
          <Link href="/apply" className="btn btn-primary text-sm">
            {t("applyNow")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
