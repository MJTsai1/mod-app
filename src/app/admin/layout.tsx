import Link from "next/link";
import { getStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Applications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/appeals", label: "Ban Appeals" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();

  return (
    <div className="min-h-dvh">
      {session && (
        <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/admin/dashboard" className="font-bold text-[var(--color-text)]">
              {siteConfig.serverName} <span className="text-[var(--color-text-muted)]">Staff Dashboard</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
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
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              >
                {link.label}
              </Link>
            ))}
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
      <main>{children}</main>
    </div>
  );
}
