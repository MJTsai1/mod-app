import Link from "next/link";
import { getStaffSession } from "@/lib/staffAuth";
import { getPendingCounts } from "@/lib/pendingCounts";
import { siteConfig } from "@/lib/config";
import { ToastProvider } from "@/components/site/ToastProvider";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
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

  const navLinks = [
    { href: "/admin/dashboard", label: "Applications", count: counts?.applications ?? 0, section: "applications" as const },
    { href: "/admin/reports", label: "Reports", count: counts?.reports ?? 0, section: "reports" as const },
    { href: "/admin/appeals", label: "Ban Appeals", count: counts?.appeals ?? 0, section: "appeals" as const },
    { href: "/admin/support", label: "Support", count: counts?.support ?? 0, section: "support" as const },
    { href: "/admin/my-claims", label: "My Claims", count: 0, section: null },
    { href: "/admin/activity", label: "Activity", count: 0, section: null },
    { href: "/admin/stats", label: "Stats", count: 0, section: null },
  ].filter((link) => link.section === null || (session && hasSection(session.staff, link.section)));

  return (
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
              <ThemeToggle />
              <span className="hidden sm:inline">{session.email}</span>
              <span className="badge" style={{ background: "var(--color-info-bg)", color: "var(--color-info)" }}>
                {session.staff.role}
              </span>
              <form action="/api/admin/logout" method="POST">
                <button type="submit" className="btn btn-ghost px-3 py-1.5 text-sm">
                  Sign out
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
              Security
            </Link>
            {session.staff.role === "admin" && (
              <Link
                href="/admin/staff"
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              >
                Manage Staff
              </Link>
            )}
          </nav>
        </header>
      )}
      <ToastProvider>
        <main>{children}</main>
      </ToastProvider>
    </div>
  );
}
