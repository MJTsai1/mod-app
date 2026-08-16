import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: `Apply — ${siteConfig.serverName} Moderator Applications`,
  description: `Apply to become a moderator on ${siteConfig.serverName}.`,
};

export default async function ApplyPage(props: PageProps<"/apply">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();
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

      {!session ? (
        <div className="card-elevated mx-auto max-w-2xl p-8 text-center">
          {searchParams.error === "auth" && (
            <p className="field-error mb-4">Sign-in failed or was cancelled. Please try again.</p>
          )}
          <p className="mb-6 text-[var(--color-text-muted)]">
            Sign in with Discord to apply. This confirms your Discord identity for your
            application — no separate account or password needed.
          </p>
          <DiscordSignInButton next="/apply" />
        </div>
      ) : (
        <ApplicationForm
          turnstileSiteKey={turnstileSiteKey}
          discordUsername={session.discordUsername}
          discordUserId={session.discordUserId}
        />
      )}
    </div>
  );
}
