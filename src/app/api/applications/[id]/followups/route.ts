import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/userAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addApplicantFollowupSchema } from "@/lib/validation/followup";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = addApplicantFollowupSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id, applicant_id, status")
    .eq("id", id)
    .maybeSingle();

  // Respond identically to "not found" whether the row is missing or just
  // not theirs, so we don't leak existence of other people's applications.
  if (!application || application.applicant_id !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (application.status !== "needs_info") {
    return NextResponse.json(
      { error: "Staff aren't currently waiting on a reply for this application." },
      { status: 400 }
    );
  }

  const { data: followup, error } = await supabase
    .from("application_followups")
    .insert({ application_id: id, author_type: "applicant", message: parsed.data.message })
    .select("id, message, created_at")
    .single();

  if (error || !followup) {
    console.error("Failed to add applicant follow-up message:", error?.message);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  // Bounce it back to "reviewing" so staff see it needs another look instead
  // of sitting silently in "needs_info" until someone happens to check back.
  const { error: statusError } = await supabase
    .from("applications")
    .update({ status: "reviewing" })
    .eq("id", id);
  if (statusError) {
    console.error("Failed to move application back to reviewing:", statusError.message);
  }

  logActivity({
    entityType: "application",
    entityId: id,
    actorType: "applicant",
    detail: "Replied to staff's message",
  }).catch(() => {});

  return NextResponse.json(
    {
      message: {
        id: followup.id,
        message: followup.message,
        authorType: "applicant",
        authorName: "You",
        createdAt: followup.created_at,
      },
      status: "reviewing",
    },
    { status: 201 }
  );
}
