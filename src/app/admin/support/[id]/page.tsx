import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffDisplayName } from "@/lib/staffLookup";
import { getActivityHistory } from "@/lib/activityLog";
import { getCaseNotes } from "@/lib/caseNotes";
import { getSupportMessages } from "@/lib/supportMessages";
import { siteConfig } from "@/lib/config";
import { SupportStatusBadge } from "@/components/admin/StatusBadge";
import { ActivityHistoryList } from "@/components/admin/ActivityHistoryList";
import { NotesThread } from "@/components/admin/NotesThread";
import { FollowupThread } from "@/components/site/FollowupThread";
import { SupportReviewPanel } from "./SupportReviewPanel";

export const metadata: Metadata = {
  title: `Support Request — ${siteConfig.serverName} Staff Dashboard`,
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

export default async function SupportDetailPage(props: PageProps<"/admin/support/[id]">) {
  const session = await requireStaffSession();
  const { id } = await props.params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: supportRequest } = await supabase
    .from("support_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!supportRequest) notFound();

  const [reviewedBy, claimedByName, activity, notes, messages] = await Promise.all([
    getStaffDisplayName(supportRequest.last_updated_by),
    getStaffDisplayName(supportRequest.claimed_by),
    getActivityHistory("support", supportRequest.id),
    getCaseNotes("support", supportRequest.id),
    getSupportMessages(supportRequest.id, { viewerRole: "staff" }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {supportRequest.subject}
          </h1>
          <p className="font-mono text-sm text-[var(--color-text-subtle)]">
            {supportRequest.reference_code}
          </p>
        </div>
        <SupportStatusBadge status={supportRequest.status} />
      </div>

      <div className="card mb-6 grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
        <DetailRow label="From" value={supportRequest.discord_username} />
        <DetailRow label="Submitted" value={new Date(supportRequest.created_at).toLocaleString()} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Original Request</h2>
        <p className="whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
          {supportRequest.message}
        </p>
      </div>

      <SupportReviewPanel
        supportRequestId={supportRequest.id}
        initialStatus={supportRequest.status}
        reviewedBy={reviewedBy}
        claimedBy={supportRequest.claimed_by}
        claimedByName={claimedByName}
        currentStaffId={session.staff.id}
      />

      <div className="card mt-6 p-6">
        <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">Conversation</h2>
        <p className="field-hint mb-4">Visible to the member on their Account page.</p>
        <FollowupThread
          endpoint={`/api/admin/support-requests/${supportRequest.id}/messages`}
          initialMessages={messages}
          placeholder="Reply to the member… (visible to them)"
          submitLabel="Send reply"
        />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Staff Notes</h2>
        <NotesThread endpoint={`/api/admin/support-requests/${supportRequest.id}/notes`} initialNotes={notes} />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Activity History</h2>
        <ActivityHistoryList entries={activity} />
      </div>
    </div>
  );
}
