import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { localizedPath } from "@/i18n/routing";
import { getUserSession } from "@/lib/userAuth";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { SupportRequestForm } from "@/components/support/SupportRequestForm";

export const metadata: Metadata = {
  title: `Support Request — ${siteConfig.serverName}`,
  description: `Contact a moderator on ${siteConfig.serverName} with a support request.`,
};

export default async function SupportPage(props: PageProps<"/[locale]/support">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();
  const locale = await getLocale();
  const t = await getTranslations("support");
  const tCommon = await getTranslations("common");

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">{t("intro")}</p>
      </div>

      <div className="mx-auto max-w-2xl">
        {!session ? (
          <div className="card-elevated p-8 text-center">
            {searchParams.error === "auth" && (
              <p className="field-error mb-4">{t("signInFailed")}</p>
            )}
            <p className="mb-6 text-[var(--color-text-muted)]">{t("signInPrompt")}</p>
            <DiscordSignInButton
              next={localizedPath(locale, "/support")}
              label={tCommon("signInWithDiscord")}
            />
          </div>
        ) : (
          <SupportRequestForm />
        )}
      </div>
    </div>
  );
}
