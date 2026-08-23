import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addStaffFollowupSchema } from "@/lib/validation/followup";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = addStaffFollowupSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: followup, error } = await supabase
    .from("application_followups")
    .insert({
      application_id: id,
      author_type: "staff",
      staff_id: session.staff.id,
      message: parsed.data.message,
    })
    .select("id, message, created_at")
    .single();

  if (error || !followup) {
    console.error("Failed to add follow-up message:", error?.message);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  logActivity({
    entityType: "application",
    entityId: id,
    actorType: "staff",
    staffId: session.staff.id,
    detail: "Sent a message to the applicant",
  }).catch(() => {});

  return NextResponse.json(
    {
      message: {
        id: followup.id,
        message: followup.message,
        authorType: "staff",
        authorName: session.staff.display_name || session.staff.email,
        createdAt: followup.created_at,
      },
    },
    { status: 201 }
  );
}
