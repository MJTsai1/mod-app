import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--color-text)]"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
            aria-hidden
          >
            {siteConfig.serverName.trim().charAt(0) || "M"}
          </span>
          <span className="hidden sm:inline">{siteConfig.serverName}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/#requirements"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:inline-block"
          >
            Requirements
          </Link>
          <Link
            href="/privacy"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:inline-block"
          >
            Privacy
          </Link>
          <Link href="/apply" className="btn btn-primary text-sm">
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
