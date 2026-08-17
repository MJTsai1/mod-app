import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addCaseNoteSchema } from "@/lib/validation/caseNote";
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

  const parsed = addCaseNoteSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid note.", fieldErrors: parsed.error.flatten().fieldErrors },
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

  const { data: note, error } = await supabase
    .from("case_notes")
    .insert({ entity_type: "application", entity_id: id, staff_id: session.staff.id, note: parsed.data.note })
    .select("id, note, created_at")
    .single();

  if (error || !note) {
    console.error("Failed to add case note:", error?.message);
    return NextResponse.json({ error: "Failed to add note." }, { status: 500 });
  }

  logActivity({
    entityType: "application",
    entityId: id,
    actorType: "staff",
    staffId: session.staff.id,
    detail: "Added a note",
  }).catch(() => {});

  return NextResponse.json(
    {
      note: {
        id: note.id,
        note: note.note,
        authorName: session.staff.display_name || session.staff.email,
        createdAt: note.created_at,
      },
    },
    { status: 201 }
  );
}
