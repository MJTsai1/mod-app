import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LegalSection as Section } from "@/components/site/LegalSection";

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.serverName}`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">
        These terms cover your use of this website — moderator applications, member reports, ban
        appeals, and related pages — for {siteConfig.serverName}. By using this site, you agree
        to them.
      </p>

      <Section title="What this site is">
        <p>
          This is a community-run tool for {siteConfig.serverName}, a Discord server. It is not
          affiliated with, endorsed by, or operated by Discord Inc. or Roblox Corporation.
          &ldquo;Discord&rdquo; and &ldquo;Roblox&rdquo; are trademarks of their respective
          owners.
        </p>
      </Section>

      <Section title="Signing in">
        <p>
          Some pages require signing in with your Discord account (via Discord&apos;s own login
          screen — we never see or store your Discord password). Staff pages require a separate
          account created directly by an administrator. You&apos;re responsible for keeping
          access to your own Discord account secure.
        </p>
      </Section>

      <Section title="What you agree to when submitting something">
        <ul className="list-disc space-y-2 pl-5">
          <li>The information you submit is accurate and truthful to the best of your knowledge.</li>
          <li>You won&apos;t submit false reports, false ban appeals, or knowingly misleading information.</li>
          <li>You won&apos;t use the report or appeal system to harass, spam, or target another member in bad faith.</li>
          <li>You won&apos;t attempt to disrupt, overload, or gain unauthorised access to the site or its systems.</li>
        </ul>
        <p>
          Submissions that violate these terms may be dismissed without review, and repeated
          abuse may result in your access to these systems being revoked.
        </p>
      </Section>

      <Section title="No guaranteed outcome">
        <p>
          Submitting a moderator application, report, or ban appeal does not guarantee any
          particular outcome. Decisions — acceptance, rejection, resolution, or denial — are made
          at the sole discretion of {siteConfig.serverName} staff.
        </p>
      </Section>

      <Section title="Third-party content">
        <p>
          The homepage displays videos from YouTube channels we don&apos;t control the operation
          of. Linked or embedded content belongs to its respective creators and is subject to
          YouTube&apos;s own terms, not these ones.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          This site is provided &ldquo;as is,&rdquo; run on a best-effort basis by community
          volunteers. We don&apos;t guarantee it will always be available, error-free, or
          uninterrupted.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          These terms may be updated from time to time as the site changes. Continuing to use the
          site after an update means you accept the revised terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms can be sent to server administration at{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-[var(--color-accent-soft)] underline underline-offset-2"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
