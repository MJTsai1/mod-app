import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { SupportRequestForm } from "@/components/support/SupportRequestForm";

export const metadata: Metadata = {
  title: `Support Request — ${siteConfig.serverName}`,
  description: `Contact a moderator on ${siteConfig.serverName} with a support request.`,
};

export default async function SupportPage(props: PageProps<"/support">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact <span className="gradient-text">Support</span>
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Need help with something that isn&apos;t a report or a ban appeal? Send a message directly
          to the staff team.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {!session ? (
          <div className="card-elevated p-8 text-center">
            {searchParams.error === "auth" && (
              <p className="field-error mb-4">Sign-in failed or was cancelled. Please try again.</p>
            )}
            <p className="mb-6 text-[var(--color-text-muted)]">
              Sign in with Discord to submit a support request. Staff will reply directly, and
              you&apos;ll see the conversation on your Account page.
            </p>
            <DiscordSignInButton next="/support" />
          </div>
        ) : (
          <SupportRequestForm />
        )}
      </div>
    </div>
  );
}
