import Link from "next/link";
import { getStaffSession } from "@/lib/staffAuth";
import { siteConfig } from "@/lib/config";

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
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
