import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffDisplayName } from "@/lib/staffLookup";
import { getActivityHistory } from "@/lib/activityLog";
import { siteConfig } from "@/lib/config";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActivityHistoryList } from "@/components/admin/ActivityHistoryList";
import { ApplicationReviewPanel } from "./ApplicationReviewPanel";

export const metadata: Metadata = {
  title: `Application — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function AnswerBlock({ question, answer }: { question: string; answer: string | null }) {
  return (
    <div className="border-b border-[var(--color-border)] py-4 last:border-0">
      <p className="text-sm font-semibold text-[var(--color-text)]">{question}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
        {answer?.trim() || "—"}
      </p>
    </div>
  );
}

export default async function ApplicationDetailPage(
  props: PageProps<"/admin/dashboard/[id]">
) {
  const session = await requireStaffSession();
  const { id } = await props.params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application) notFound();

  const [reviewedBy, claimedByName, activity] = await Promise.all([
    getStaffDisplayName(application.last_updated_by),
    getStaffDisplayName(application.claimed_by),
    getActivityHistory("application", application.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {application.discord_username}
          </h1>
          <p className="font-mono text-sm text-[var(--color-text-subtle)]">
            {application.reference_code}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="card mb-6 grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
        <DetailRow label="Discord User ID" value={application.discord_user_id} />
        <DetailRow label="Age" value={application.age} />
        <DetailRow label="Country" value={application.country} />
        <DetailRow label="Timezone" value={application.timezone} />
        <DetailRow label="Time in server" value={application.time_in_server} />
        <DetailRow
          label="Submitted"
          value={new Date(application.created_at).toLocaleString()}
        />
        <DetailRow label="Activity level" value={application.activity_level} />
        <DetailRow label="Online times" value={application.online_times} />
        <DetailRow label="Weekly hours" value={application.weekly_hours} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Experience</h2>
        <AnswerBlock
          question="Moderated a Discord server before?"
          answer={application.has_moderated_before ? "Yes" : "No"}
        />
        <AnswerBlock question="Previous moderation experience" answer={application.previous_experience} />
        <AnswerBlock question="Bots/tools used" answer={application.bots_tools_used} />
        <AnswerBlock question="Previous staff positions" answer={application.previous_staff_positions} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Scenarios</h2>
        <AnswerBlock
          question="A member repeatedly breaks the rules but claims they didn't know. What would you do?"
          answer={application.scenario_unaware_rules}
        />
        <AnswerBlock
          question="Two members are arguing and it's becoming toxic. How would you handle it?"
          answer={application.scenario_toxic_conflict}
        />
        <AnswerBlock question="A friend of yours breaks a server rule. What would you do?" answer={application.scenario_friend_breaks_rule} />
        <AnswerBlock
          question="You discover another moderator abusing their permissions. What would you do?"
          answer={application.scenario_staff_abuse}
        />
        <AnswerBlock
          question="Someone reports a member you personally dislike. How do you stay fair?"
          answer={application.scenario_biased_report}
        />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Motivation</h2>
        <AnswerBlock question="Why do you want to become a moderator?" answer={application.motivation_why} />
        <AnswerBlock question="What makes you suitable for the role?" answer={application.motivation_suitable} />
        <AnswerBlock question="What makes a good moderator?" answer={application.motivation_good_moderator} />
        <AnswerBlock question="What could you improve about the server?" answer={application.motivation_improve_server} />
        <AnswerBlock question="Anything else?" answer={application.additional_info} />
      </div>

      <ApplicationReviewPanel
        applicationId={application.id}
        initialStatus={application.status}
        initialNotes={application.staff_notes ?? ""}
        reviewedBy={reviewedBy}
        claimedBy={application.claimed_by}
        claimedByName={claimedByName}
        currentStaffId={session.staff.id}
      />

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Activity History</h2>
        <ActivityHistoryList entries={activity} />
      </div>
    </div>
  );
}
