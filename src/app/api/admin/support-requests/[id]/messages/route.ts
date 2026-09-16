import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addStaffSupportMessageSchema } from "@/lib/validation/supportMessage";
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

  const parsed = addStaffSupportMessageSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: supportRequest } = await supabase
    .from("support_requests")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!supportRequest) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: message, error } = await supabase
    .from("support_messages")
    .insert({
      support_request_id: id,
      author_type: "staff",
      staff_id: session.staff.id,
      message: parsed.data.message,
    })
    .select("id, message, created_at")
    .single();

  if (error || !message) {
    console.error("Failed to add support message:", error?.message);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  let newStatus: string | undefined;
  if (supportRequest.status === "open") {
    // First staff reply — move it out of the unanswered queue automatically.
    const { error: statusError } = await supabase
      .from("support_requests")
      .update({ status: "answered", last_updated_by: session.staff.id })
      .eq("id", id);
    if (statusError) {
      console.error("Failed to mark support request answered:", statusError.message);
    } else {
      newStatus = "answered";
    }
  }

  logActivity({
    entityType: "support",
    entityId: id,
    actorType: "staff",
    staffId: session.staff.id,
    detail: "Sent a message to the member",
  }).catch(() => {});

  return NextResponse.json(
    {
      message: {
        id: message.id,
        message: message.message,
        authorType: "staff",
        authorName: session.staff.display_name || session.staff.email,
        createdAt: message.created_at,
      },
      ...(newStatus ? { status: newStatus } : {}),
    },
    { status: 201 }
  );
}
