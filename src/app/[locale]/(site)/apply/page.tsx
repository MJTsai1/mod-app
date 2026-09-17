import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { localizedPath } from "@/i18n/routing";
import { getUserSession } from "@/lib/userAuth";
import { countryNameFromCode } from "@/lib/geo";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: `Apply — ${siteConfig.serverName} Moderator Applications`,
  description: `Apply to become a moderator on ${siteConfig.serverName}.`,
};

export default async function ApplyPage(props: PageProps<"/[locale]/apply">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();
  const locale = await getLocale();
  const t = await getTranslations("apply");
  const tCommon = await getTranslations("common");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Vercel's edge network sets this header automatically on production
  // deployments; it's absent locally, so detection just no-ops in dev.
  const requestHeaders = await headers();
  const detectedCountry = countryNameFromCode(requestHeaders.get("x-vercel-ip-country"));

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">{t("taglineQuoted")}</p>
        <p className="field-hint mt-3">{t("saveHint")}</p>
      </div>

      {!session ? (
        <div className="card-elevated mx-auto max-w-2xl p-8 text-center">
          {searchParams.error === "auth" && (
            <p className="field-error mb-4">{t("signInFailed")}</p>
          )}
          <p className="mb-6 text-[var(--color-text-muted)]">{t("signInPrompt")}</p>
          <DiscordSignInButton
            next={localizedPath(locale, "/apply")}
            label={tCommon("signInWithDiscord")}
          />
        </div>
      ) : (
        <ApplicationForm
          turnstileSiteKey={turnstileSiteKey}
          detectedCountry={detectedCountry}
          discordUsername={session.discordUsername}
          discordUserId={session.discordUserId}
        />
      )}
    </div>
  );
}
