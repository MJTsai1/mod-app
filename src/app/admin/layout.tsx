import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getStaffSession } from "@/lib/staffAuth";
import { getPendingCounts } from "@/lib/pendingCounts";
import { siteConfig } from "@/lib/config";
import { ToastProvider } from "@/components/site/ToastProvider";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { hasSection } from "@/lib/permissions";

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-semibold"
      style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}
    >
      {count}
    </span>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  const counts = session ? await getPendingCounts() : null;
  const locale = await getLocale();
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/admin/dashboard", label: t("applications"), count: counts?.applications ?? 0, section: "applications" as const },
    { href: "/admin/reports", label: t("reports"), count: counts?.reports ?? 0, section: "reports" as const },
    { href: "/admin/appeals", label: t("appeals"), count: counts?.appeals ?? 0, section: "appeals" as const },
    { href: "/admin/support", label: t("support"), count: counts?.support ?? 0, section: "support" as const },
    { href: "/admin/my-claims", label: t("myClaims"), count: 0, section: null },
    { href: "/admin/activity", label: t("activity"), count: 0, section: null },
    { href: "/admin/stats", label: t("stats"), count: 0, section: null },
  ].filter((link) => link.section === null || (session && hasSection(session.staff, link.section)));

  return (
    <NextIntlClientProvider locale={locale}>
      <div className="min-h-dvh">
        {session && (
          <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <Link href="/admin/dashboard" className="shrink-0 font-bold text-[var(--color-text)]">
                {siteConfig.serverName} <span className="text-[var(--color-text-muted)]">Staff Dashboard</span>
              </Link>
              <div className="hidden md:block">
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <AdminLanguageSwitcher />
                <ThemeToggle label={t("toggleTheme")} />
                <span className="hidden sm:inline">{session.email}</span>
                <span className="badge" style={{ background: "var(--color-info-bg)", color: "var(--color-info)" }}>
                  {session.staff.role}
                </span>
                <form action="/api/admin/logout" method="POST">
                  <button type="submit" className="btn btn-ghost px-3 py-1.5 text-sm">
                    {t("signOut")}
                  </button>
                </form>
              </div>
            </div>
            <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 md:hidden">
              <GlobalSearch />
            </div>
            <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                >
                  {link.label}
                  <NavBadge count={link.count} />
                </Link>
              ))}
              <Link
                href="/admin/security"
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              >
                {t("security")}
              </Link>
              {session.staff.role === "admin" && (
                <Link
                  href="/admin/staff"
                  className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                >
                  {t("manageStaff")}
                </Link>
              )}
            </nav>
          </header>
        )}
        <ToastProvider>
          <main>{children}</main>
        </ToastProvider>
      </div>
    </NextIntlClientProvider>
  );
}
