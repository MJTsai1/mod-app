import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireStaffSession } from "@/lib/staffAuth";
import { hasSection } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffDisplayName } from "@/lib/staffLookup";
import { getActivityHistory } from "@/lib/activityLog";
import { getCaseNotes } from "@/lib/caseNotes";
import { siteConfig } from "@/lib/config";
import { AppealStatusBadge } from "@/components/admin/StatusBadge";
import { ActivityHistoryList } from "@/components/admin/ActivityHistoryList";
import { NotesThread } from "@/components/admin/NotesThread";
import { AppealReviewPanel } from "./AppealReviewPanel";

export const metadata: Metadata = {
  title: `Ban Appeal — ${siteConfig.serverName} Staff Dashboard`,
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

export default async function AppealDetailPage(props: PageProps<"/admin/appeals/[id]">) {
  const session = await requireStaffSession();
  if (!hasSection(session.staff, "appeals")) notFound();
  const { id } = await props.params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: appeal } = await supabase
    .from("ban_appeals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!appeal) notFound();

  const t = await getTranslations("detail");
  const tCommon = await getTranslations("common");
  const dash = tCommon("dash");

  const [reviewedBy, claimedByName, activity, notes] = await Promise.all([
    getStaffDisplayName(appeal.last_updated_by),
    getStaffDisplayName(appeal.claimed_by),
    getActivityHistory("appeal", appeal.id),
    getCaseNotes("appeal", appeal.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{appeal.discord_username}</h1>
          <p className="font-mono text-sm text-[var(--color-text-subtle)]">{appeal.reference_code}</p>
        </div>
        <AppealStatusBadge status={appeal.status} />
      </div>

      <div className="card mb-6 grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
        <DetailRow label={t("discordUserId")} value={appeal.discord_user_id} />
        <DetailRow label={t("submitted")} value={new Date(appeal.created_at).toLocaleString()} />
      </div>

      <div className="card mb-6 p-6">
        <AnswerBlock question={t("banReasonQuestion")} answer={appeal.ban_reason} dash={dash} />
        <AnswerBlock question={t("appealReasonQuestion")} answer={appeal.appeal_reason} dash={dash} />
        <AnswerBlock question={t("appealAdditionalInfo")} answer={appeal.additional_info} dash={dash} />
      </div>

      <AppealReviewPanel
        appealId={appeal.id}
        initialStatus={appeal.status}
        reviewedBy={reviewedBy}
        claimedBy={appeal.claimed_by}
        claimedByName={claimedByName}
        currentStaffId={session.staff.id}
      />

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t("staffNotes")}</h2>
        <NotesThread endpoint={`/api/admin/appeals/${appeal.id}/notes`} initialNotes={notes} />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t("activityHistory")}</h2>
        <ActivityHistoryList entries={activity} />
      </div>
    </div>
  );
}
