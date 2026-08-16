import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LegalSection as Section } from "@/components/site/LegalSection";

export const metadata: Metadata = {
  title: `Privacy Notice — ${siteConfig.serverName}`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Notice</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">
        This notice explains what information {siteConfig.serverName} collects across this site —
        moderator applications, member reports, ban appeals, and signing in with Discord — and how
        it is used.
      </p>

      <Section title="What information is collected">
        <p>
          <strong className="text-[var(--color-text)]">Moderator applications:</strong> your
          Discord username, Discord User ID, age, country, timezone, activity details, moderation
          experience, and your written answers to the application questions. Applications don&apos;t
          require signing in.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Signing in with Discord:</strong> to file a
          report, submit a ban appeal, or check their status on the Account page, you sign in with
          your Discord account. Discord shares your Discord username, user ID, and avatar with us
          — never your Discord password, which we never see.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Reports:</strong> your Discord username (as
          the reporter), the reported member&apos;s Discord username/ID, the category and
          description of what happened, and any evidence links you provide.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Ban appeals:</strong> your Discord username
          and User ID, why you believe you were banned, your appeal reason, and any additional
          information you provide.
        </p>
        <p>
          Across all of these, we also record a one-way cryptographic hash of the IP address used
          to submit (not the raw IP) solely to prevent spam and abuse.
        </p>
      </Section>

      <Section title="Why it is collected">
        <p>
          This information is used only to evaluate moderator applications, investigate reports,
          review ban appeals, and — for signed-in members — to let you see the status of your own
          submissions. We don&apos;t collect more than is needed for these purposes, and we
          don&apos;t use it for advertising or share it with third parties.
        </p>
      </Section>

      <Section title="How it is stored">
        <p>
          Applications, reports, and ban appeals are stored in a secured, access-controlled
          database. They are never publicly accessible, and submitters cannot view anyone else&apos;s
          submissions. Your Discord sign-in session is managed by our authentication provider
          (Supabase) and is separate from Discord&apos;s own systems.
        </p>
      </Section>

      <Section title="Who can access this data">
        <p>
          Only authorised staff members of {siteConfig.serverName}, signed in through the staff
          dashboard, can view submitted applications, reports, and appeals. Access is limited to
          what is required to review submissions. If you&apos;re signed in with Discord, you can see
          the status of your own reports and appeals on the Account page — never anyone else&apos;s.
        </p>
      </Section>

      <Section title="Your data, your rights">
        <p>{siteConfig.privacy.contactMethod}</p>
        <p>
          You can reach server administration at{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-[var(--color-accent-soft)] underline underline-offset-2"
          >
            {siteConfig.contactEmail}
          </a>{" "}
          to ask what data we hold about you or to request that it be deleted. You can also revoke
          this site&apos;s access to your Discord account at any time from Discord&apos;s own
          Authorized Apps settings.
        </p>
      </Section>
    </div>
  );
}
