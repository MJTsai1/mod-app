import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireStaffSession } from "@/lib/staffAuth";
import { hasSection } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffDisplayName } from "@/lib/staffLookup";
import { getActivityHistory } from "@/lib/activityLog";
import { getCaseNotes } from "@/lib/caseNotes";
import { getFollowups } from "@/lib/followups";
import { siteConfig } from "@/lib/config";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActivityHistoryList } from "@/components/admin/ActivityHistoryList";
import { NotesThread } from "@/components/admin/NotesThread";
import { FollowupThread } from "@/components/site/FollowupThread";
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

function AnswerBlock({ question, answer, dash }: { question: string; answer: string | null; dash: string }) {
  return (
    <div className="border-b border-[var(--color-border)] py-4 last:border-0">
      <p className="text-sm font-semibold text-[var(--color-text)]">{question}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
        {answer?.trim() || dash}
      </p>
    </div>
  );
}

export default async function ApplicationDetailPage(
  props: PageProps<"/admin/dashboard/[id]">
) {
  const session = await requireStaffSession();
  if (!hasSection(session.staff, "applications")) notFound();
  const { id } = await props.params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application) notFound();

  const t = await getTranslations("detail");
  const tCommon = await getTranslations("common");
  const tThread = await getTranslations("thread");

  const [reviewedBy, claimedByName, activity, notes, followups] = await Promise.all([
    getStaffDisplayName(application.last_updated_by),
    getStaffDisplayName(application.claimed_by),
    getActivityHistory("application", application.id),
    getCaseNotes("application", application.id),
    getFollowups(application.id, { viewerRole: "staff" }),
  ]);

  const dash = tCommon("dash");

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
        <DetailRow label={t("discordUserId")} value={application.discord_user_id} />
        <DetailRow label={t("age")} value={application.age} />
        <DetailRow label={t("country")} value={application.country} />
        <DetailRow label={t("timezone")} value={application.timezone} />
        <DetailRow label={t("timeInServer")} value={application.time_in_server} />
        <DetailRow
          label={t("submitted")}
          value={new Date(application.created_at).toLocaleString()}
        />
        <DetailRow label={t("activityLevel")} value={application.activity_level} />
        <DetailRow label={t("onlineTimes")} value={application.online_times} />
        <DetailRow label={t("weeklyHours")} value={application.weekly_hours} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{t("experience")}</h2>
        <AnswerBlock
          question={t("hasModeratedBefore")}
          answer={application.has_moderated_before ? tCommon("yes") : tCommon("no")}
          dash={dash}
        />
        <AnswerBlock question={t("previousExperience")} answer={application.previous_experience} dash={dash} />
        <AnswerBlock question={t("botsToolsUsed")} answer={application.bots_tools_used} dash={dash} />
        <AnswerBlock question={t("previousStaffPositions")} answer={application.previous_staff_positions} dash={dash} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{t("scenarios")}</h2>
        <AnswerBlock
          question={t("scenarioUnawareRules")}
          answer={application.scenario_unaware_rules}
          dash={dash}
        />
        <AnswerBlock
          question={t("scenarioToxicConflict")}
          answer={application.scenario_toxic_conflict}
          dash={dash}
        />
        <AnswerBlock question={t("scenarioFriendBreaksRule")} answer={application.scenario_friend_breaks_rule} dash={dash} />
        <AnswerBlock
          question={t("scenarioStaffAbuse")}
          answer={application.scenario_staff_abuse}
          dash={dash}
        />
        <AnswerBlock
          question={t("scenarioBiasedReport")}
          answer={application.scenario_biased_report}
          dash={dash}
        />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{t("motivation")}</h2>
        <AnswerBlock question={t("motivationWhy")} answer={application.motivation_why} dash={dash} />
        <AnswerBlock question={t("motivationSuitable")} answer={application.motivation_suitable} dash={dash} />
        <AnswerBlock question={t("motivationGoodModerator")} answer={application.motivation_good_moderator} dash={dash} />
        <AnswerBlock question={t("motivationImproveServer")} answer={application.motivation_improve_server} dash={dash} />
        <AnswerBlock question={t("additionalInfo")} answer={application.additional_info} dash={dash} />
      </div>

      <ApplicationReviewPanel
        applicationId={application.id}
        initialStatus={application.status}
        reviewedBy={reviewedBy}
        claimedBy={application.claimed_by}
        claimedByName={claimedByName}
        currentStaffId={session.staff.id}
      />

      <div className="card mt-6 p-6">
        <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">{t("messageToApplicant")}</h2>
        <p className="field-hint mb-4">{t("messageToApplicantHint")}</p>
        <FollowupThread
          endpoint={`/api/admin/applications/${application.id}/followups`}
          initialMessages={followups}
          placeholder={t("askApplicantPlaceholder")}
          submitLabel={t("sendMessage")}
          noMessagesLabel={tThread("noMessages")}
          sendingLabel={tThread("sending")}
          sendErrorLabel={tThread("sendFailed")}
          networkErrorLabel={tCommon("networkError")}
        />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t("staffNotes")}</h2>
        <NotesThread endpoint={`/api/admin/applications/${application.id}/notes`} initialNotes={notes} />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t("activityHistory")}</h2>
        <ActivityHistoryList entries={activity} />
      </div>
    </div>
  );
}
