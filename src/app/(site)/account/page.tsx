import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getUserSession } from "@/lib/userAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DiscordSignInButton } from "@/components/site/DiscordSignInButton";
import type { ReportListItem, BanAppealListItem, ApplicationListItem } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: `My Account — ${siteConfig.serverName}`,
  robots: { index: false },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="badge"
      style={{ background: "var(--color-info-bg)", color: "var(--color-info)" }}
    >
      {children}
    </span>
  );
}

function SubmissionRow({
  reference,
  status,
  date,
  detail,
}: {
  reference: string;
  status: string;
  date: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] py-3 last:border-0">
      <div>
        <p className="font-mono text-sm text-[var(--color-text)]">{reference}</p>
        <p className="text-xs text-[var(--color-text-subtle)]">
          {detail} · {new Date(date).toLocaleDateString()}
        </p>
      </div>
      <Pill>{status}</Pill>
    </div>
  );
}

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
      .select("id, reference_code, created_at, reporter_discord_username, reported_discord_username, category, status")
      .eq("reporter_id", session.id)
      .order("created_at", { ascending: false })
      .returns<ReportListItem[]>(),
    supabase
      .from("ban_appeals")
      .select("id, reference_code, created_at, discord_username, discord_user_id, status")
      .eq("appellant_id", session.id)
      .order("created_at", { ascending: false })
      .returns<BanAppealListItem[]>(),
  ]);

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
              reference={application.reference_code}
              status={application.status}
              date={application.created_at}
              detail="Moderator application"
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
              reference={report.reference_code}
              status={report.status}
              date={report.created_at}
              detail={`Reported ${report.reported_discord_username}`}
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
              reference={appeal.reference_code}
              status={appeal.status}
              date={appeal.created_at}
              detail={appeal.discord_username}
            />
          ))
        )}
      </div>
    </div>
  );
}
