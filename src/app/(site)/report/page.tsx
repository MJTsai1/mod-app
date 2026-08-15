import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { ReportForm } from "@/components/report/ReportForm";

export const metadata: Metadata = {
  title: `Report a Member — ${siteConfig.serverName}`,
  description: `Report a member for breaking the rules on ${siteConfig.serverName}.`,
};

export default async function ReportPage(props: PageProps<"/report">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Report a <span className="gradient-text">Member</span>
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Breaking the rules? Let the staff team know so we can look into it.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {!session ? (
          <div className="card-elevated p-8 text-center">
            {searchParams.error === "auth" && (
              <p className="field-error mb-4">Sign-in failed or was cancelled. Please try again.</p>
            )}
            <p className="mb-6 text-[var(--color-text-muted)]">
              Sign in with Discord to file a report. This lets our staff team follow up with you if
              they need more information.
            </p>
            <DiscordSignInButton next="/report" />
          </div>
        ) : (
          <ReportForm />
        )}
      </div>
    </div>
  );
}
