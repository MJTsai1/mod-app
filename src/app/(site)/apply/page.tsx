import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: `Apply — ${siteConfig.serverName} Moderator Applications`,
  description: `Apply to become a moderator on ${siteConfig.serverName}.`,
};

export default function ApplyPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Moderator <span className="gradient-text">Application</span>
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">&ldquo;{siteConfig.tagline}&rdquo;</p>
        <p className="field-hint mt-3">
          Take your time — your answers are saved as you go, so it&apos;s safe to move between
          steps.
        </p>
      </div>
      <ApplicationForm turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
