import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { AppealForm } from "@/components/appeal/AppealForm";

export const metadata: Metadata = {
  title: `Ban Appeal — ${siteConfig.serverName}`,
  description: `Appeal a ban on ${siteConfig.serverName}.`,
};

export default async function AppealPage(props: PageProps<"/appeal">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ban <span className="gradient-text">Appeal</span>
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Think you were banned unfairly, or deserve a second chance? Tell us why.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {!session ? (
          <div className="card-elevated p-8 text-center">
            {searchParams.error === "auth" && (
              <p className="field-error mb-4">Sign-in failed or was cancelled. Please try again.</p>
            )}
            <p className="mb-6 text-[var(--color-text-muted)]">
              Sign in with Discord to submit a ban appeal. This lets our staff team follow up with
              you if they need more information.
            </p>
            <DiscordSignInButton next="/appeal" />
          </div>
        ) : (
          <AppealForm />
        )}
      </div>
    </div>
  );
}
