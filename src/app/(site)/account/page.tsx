import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getFollowups } from "@/lib/followups";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import { SubmissionRow } from "@/components/site/SubmissionRow";
import { StatusBadge, ReportStatusBadge, AppealStatusBadge } from "@/components/admin/StatusBadge";
import type { ReportListItem, BanAppealListItem, ApplicationListItem } from "@/lib/supabase/types";

const NON_WITHDRAWABLE: Record<"applications" | "reports" | "appeals", string[]> = {
  applications: ["accepted", "rejected", "withdrawn"],
  reports: ["resolved", "dismissed", "withdrawn"],
  appeals: ["approved", "denied", "withdrawn"],
};

export const metadata: Metadata = {
  title: `My Account — ${siteConfig.serverName}`,
  robots: { index: false },
};

export default async function AccountPage(props: PageProps<"/account">) {
  const searchParams = await props.searchParams;
  const session = await getUserSession();

  if (!session) {
    return (
      <div className="px-4 py-16 sm:px-6">
        <div className="card-elevated mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">My Account</h1>
          {searchParams.error === "auth" && (
            <p className="field-error mt-4">Sign-in failed or was cancelled. Please try again.</p>
          )}
          <p className="mb-6 mt-3 text-[var(--color-text-muted)]">
            Sign in with Discord to see the status of your reports and ban appeals.
          </p>
          <DiscordSignInButton next="/account" />
        </div>
      </div>
    );
  }

  const supabase = createSupabaseAdminClient();

  const [{ data: applications }, { data: reports }, { data: appeals }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, reference_code, created_at, updated_at, discord_username, discord_user_id, status, age, country")
      .eq("applicant_id", session.id)
      .order("created_at", { ascending: false })
      .returns<ApplicationListItem[]>(),
    supabase
      .from("reports")
      .select("id, reference_code, created_at, updated_at, reporter_discord_username, reported_discord_username, category, status")
      .eq("reporter_id", session.id)
      .order("created_at", { ascending: false })
      .returns<ReportListItem[]>(),
    supabase
      .from("ban_appeals")
      .select("id, reference_code, created_at, updated_at, discord_username, discord_user_id, status")
      .eq("appellant_id", session.id)
      .order("created_at", { ascending: false })
      .returns<BanAppealListItem[]>(),
  ]);

  // Only applications currently awaiting a reply need their thread fetched.
  const needsInfoApplications = (applications ?? []).filter((a) => a.status === "needs_info");
  const followupsByApplication = new Map(
    await Promise.all(
      needsInfoApplications.map(
        async (a) => [a.id, await getFollowups(a.id, { viewerRole: "applicant" })] as const
      )
    )
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">My Account</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Signed in as {session.discordUsername}
          </p>
        </div>
        <form action="/api/account/logout" method="POST">
          <button type="submit" className="btn btn-ghost px-3 py-1.5 text-sm">
            Sign out
          </button>
        </form>
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">My Applications</h2>
        {!applications || applications.length === 0 ? (
          <p className="text-sm text-[var(--color-text-subtle)]">You haven&apos;t submitted any applications.</p>
        ) : (
          applications.map((application) => (
            <SubmissionRow
              key={application.id}
              id={application.id}
              reference={application.reference_code}
              statusBadge={<StatusBadge status={application.status} />}
              updatedAt={application.updated_at}
              date={application.created_at}
              detail="Moderator application"
              withdrawEndpoint={`/api/applications/${application.id}/withdraw`}
              canWithdraw={!NON_WITHDRAWABLE.applications.includes(application.status)}
              followup={
                application.status === "needs_info"
                  ? {
                      endpoint: `/api/applications/${application.id}/followups`,
                      initialMessages: followupsByApplication.get(application.id) ?? [],
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">My Reports</h2>
        {!reports || reports.length === 0 ? (
          <p className="text-sm text-[var(--color-text-subtle)]">You haven&apos;t filed any reports.</p>
        ) : (
          reports.map((report) => (
            <SubmissionRow
              key={report.id}
              id={report.id}
              reference={report.reference_code}
              statusBadge={<ReportStatusBadge status={report.status} />}
              updatedAt={report.updated_at}
              date={report.created_at}
              detail={`Reported ${report.reported_discord_username}`}
              withdrawEndpoint={`/api/reports/${report.id}/withdraw`}
              canWithdraw={!NON_WITHDRAWABLE.reports.includes(report.status)}
            />
          ))
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">My Ban Appeals</h2>
        {!appeals || appeals.length === 0 ? (
          <p className="text-sm text-[var(--color-text-subtle)]">You haven&apos;t submitted any ban appeals.</p>
        ) : (
          appeals.map((appeal) => (
            <SubmissionRow
              key={appeal.id}
              id={appeal.id}
              reference={appeal.reference_code}
              statusBadge={<AppealStatusBadge status={appeal.status} />}
              updatedAt={appeal.updated_at}
              date={appeal.created_at}
              detail={appeal.discord_username}
              withdrawEndpoint={`/api/appeals/${appeal.id}/withdraw`}
              canWithdraw={!NON_WITHDRAWABLE.appeals.includes(appeal.status)}
            />
          ))
        )}
      </div>
    </div>
  );
}
