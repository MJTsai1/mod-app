import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.serverName}. Not
          affiliated with Discord Inc.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="transition hover:text-[var(--color-text)]">
            Privacy Notice
          </Link>
          {siteConfig.socialLinks.discord && (
            <a
              href={siteConfig.socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--color-text)]"
            >
              Discord
            </a>
          )}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="transition hover:text-[var(--color-text)]"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
