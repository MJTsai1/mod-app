import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `${siteConfig.serverName} — Moderator Applications`,
  description: siteConfig.description,
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0 text-[var(--color-accent-soft)]"
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 10.2l2.2 2.2 4.8-4.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(139,92,246,0.25), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
            {siteConfig.serverName}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            <span className="gradient-text">Moderator Applications</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-[var(--color-text-muted)] sm:text-xl">
            &ldquo;{siteConfig.tagline}&rdquo;
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/apply" className="btn btn-primary w-full px-8 py-4 text-base sm:w-auto">
              Apply Now
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                <path
                  d="M4 10h12M11 5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            {siteConfig.socialLinks.discord && (
              <a
                href={siteConfig.socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full px-8 py-4 text-base sm:w-auto"
              >
                Join our Discord
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About the role */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {siteConfig.aboutRole.heading}
            </h2>
            <p className="mt-4 text-[var(--color-text-muted)]">{siteConfig.aboutRole.intro}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.aboutRole.responsibilities.map((item) => (
              <div key={item} className="card flex items-start gap-3 p-5">
                <CheckIcon />
                <p className="text-sm text-[var(--color-text)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Requirements</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">
              We&apos;re looking for members who meet the following, before anything else.
            </p>
          </div>

          <div className="card-elevated mx-auto mt-12 max-w-2xl p-6 sm:p-8">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {siteConfig.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-sm text-[var(--color-text)]">{requirement}</span>
                </li>
              ))}
            </ul>
            {siteConfig.minAge !== null && (
              <p className="field-hint mt-6 border-t border-[var(--color-border)] pt-4">
                Minimum age to apply: {siteConfig.minAge}+
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="card-elevated mx-auto max-w-4xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to join the team?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--color-text-muted)]">
            The application takes about 10&ndash;15 minutes. Take your time and answer honestly.
          </p>
          <Link href="/apply" className="btn btn-primary mt-8 px-8 py-4 text-base">
            Apply Now
          </Link>
        </div>
      </section>
    </>
  );
}
