import Image from "next/image";
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
          <Link
            href="/admin/login"
            className="btn btn-secondary px-3 py-2 text-sm sm:px-4"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M3.5 17c1-3.5 4-5 6.5-5s5.5 1.5 6.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Staff Login</span>
          </Link>
          <Link href="/apply" className="btn btn-primary text-sm">
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
