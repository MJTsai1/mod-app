import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Notice — ${siteConfig.serverName}`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[var(--color-text-muted)]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Notice</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">
        This notice explains what information {siteConfig.serverName} collects when you submit a
        moderator application, and how it is used.
      </p>

      <Section title="What information is collected">
        <p>
          When you submit an application, we collect your Discord username, Discord User ID,
          age, country, timezone, activity details, moderation experience, and your written
          answers to the application questions.
        </p>
        <p>
          We also record a one-way cryptographic hash of the IP address used to submit your
          application (not the raw IP) solely to prevent spam and abuse of the application
          system.
        </p>
      </Section>

      <Section title="Why it is collected">
        <p>
          This information is used only to evaluate your suitability for a moderator role on{" "}
          {siteConfig.serverName} and to contact you about your application. We do not collect
          more information than is needed to review your application.
        </p>
      </Section>

      <Section title="How it is stored">
        <p>
          Applications are stored in a secured, access-controlled database. They are never
          publicly accessible, and applicants cannot view other applicants&apos; submissions.
        </p>
      </Section>

      <Section title="Who can access applications">
        <p>
          Only authorised staff members of {siteConfig.serverName}, signed in through the staff
          dashboard, can view submitted applications. Access is limited to what is required to
          review applications and manage the moderator recruitment process.
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
          to ask what data we hold about you or to request that it be deleted.
        </p>
      </Section>
    </div>
  );
}
