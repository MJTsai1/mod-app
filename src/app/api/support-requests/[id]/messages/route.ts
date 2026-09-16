import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/userAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addMemberSupportMessageSchema } from "@/lib/validation/supportMessage";
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

  const parsed = addMemberSupportMessageSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: supportRequest } = await supabase
    .from("support_requests")
    .select("id, requester_id, status")
    .eq("id", id)
    .maybeSingle();

  // Respond identically to "not found" whether the row is missing or just
  // not theirs, so we don't leak existence of other people's requests.
  if (!supportRequest || supportRequest.requester_id !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (supportRequest.status === "withdrawn") {
    return NextResponse.json(
      { error: "This support request has been withdrawn." },
      { status: 400 }
    );
  }

  const { data: message, error } = await supabase
    .from("support_messages")
    .insert({ support_request_id: id, author_type: "applicant", message: parsed.data.message })
    .select("id, message, created_at")
    .single();

  if (error || !message) {
    console.error("Failed to add support message:", error?.message);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  let newStatus: string | undefined;
  if (supportRequest.status === "resolved") {
    // Bounce back to open so staff see it needs another look instead of
    // sitting silently under "resolved".
    const { error: statusError } = await supabase
      .from("support_requests")
      .update({ status: "open" })
      .eq("id", id);
    if (statusError) {
      console.error("Failed to reopen support request:", statusError.message);
    } else {
      newStatus = "open";
    }
  }

  logActivity({
    entityType: "support",
    entityId: id,
    actorType: "applicant",
    detail: "Replied to staff's message",
  }).catch(() => {});

  return NextResponse.json(
    {
      message: {
        id: message.id,
        message: message.message,
        authorType: "applicant",
        authorName: "You",
        createdAt: message.created_at,
      },
      ...(newStatus ? { status: newStatus } : {}),
    },
    { status: 201 }
  );
}
