import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateApplicationAiReport } from "@/lib/aiReport";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const supabase = createSupabaseAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application) return NextResponse.json({ error: "Not found." }, { status: 404 });

  try {
    const report = await generateApplicationAiReport(application, session.staff.id);

    logActivity({
      entityType: "application",
      entityId: id,
      actorType: "staff",
      staffId: session.staff.id,
      detail: "Generated an AI report",
    }).catch(() => {});

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Failed to generate AI report:", error);
    return NextResponse.json(
      { error: "Failed to generate AI report. Please try again." },
      { status: 502 }
    );
  }
}
