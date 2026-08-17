import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateApplicationSchema } from "@/lib/validation/application";
import { resolveClaimAction } from "@/lib/claim";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load application:", error.message);
    return NextResponse.json({ error: "Failed to load application." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ application: data });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateApplicationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: current, error: fetchError } = await supabase
    .from("applications")
    .select("status, staff_notes, claimed_by")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const claimResult = resolveClaimAction(
    parsed.data.claim,
    current.claimed_by,
    session.staff.id,
    session.staff.role === "admin"
  );
  if (!claimResult.ok) {
    return NextResponse.json({ error: claimResult.error }, { status: claimResult.status ?? 400 });
  }

  const changes: string[] = [];
  if (parsed.data.status && parsed.data.status !== current.status) {
    changes.push(`Status changed from ${current.status} to ${parsed.data.status}`);
  }
  if (
    parsed.data.staffNotes !== undefined &&
    parsed.data.staffNotes !== (current.staff_notes ?? "")
  ) {
    changes.push("Staff notes updated");
  }
  if (parsed.data.claim === "claim") changes.push("Claimed");
  if (parsed.data.claim === "unclaim") changes.push("Unclaimed");

  const { data, error } = await supabase
    .from("applications")
    .update({
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.staffNotes !== undefined ? { staff_notes: parsed.data.staffNotes } : {}),
      ...(parsed.data.status !== undefined || parsed.data.staffNotes !== undefined
        ? { last_updated_by: session.staff.id }
        : {}),
      ...(claimResult.fields ?? {}),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Failed to update application:", error.message);
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (changes.length > 0) {
    logActivity({
      entityType: "application",
      entityId: id,
      actorType: "staff",
      staffId: session.staff.id,
      detail: changes.join("; "),
    }).catch(() => {});
  }

  return NextResponse.json({ application: data });
}
