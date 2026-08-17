import { NextResponse } from "next/server";
import { reportSchema } from "@/lib/validation/report";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateReferenceCode } from "@/lib/applicationId";
import { getClientIp, hashIp, checkAndRecordReportAttempt } from "@/lib/rateLimit";
import { notifyDiscordOfNewReport } from "@/lib/discord";
import { getUserSession } from "@/lib/userAuth";
import type { ReportInsert } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20_000;
const MAX_INSERT_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    return await handleSubmission(request);
  } catch (error) {
    console.error("Unexpected error handling report submission:", error);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again in a moment." },
      { status: 500 }
    );
  }
}

async function handleSubmission(request: Request): Promise<NextResponse> {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in with Discord before submitting a report." },
      { status: 401 }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof rawBody !== "object" || rawBody === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  const rateLimitResult = await checkAndRecordReportAttempt(ipHash);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "You've submitted the maximum number of reports allowed for now. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = reportSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some fields need attention.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const insertPayload: ReportInsert = {
    reference_code: "",
    reporter_id: session.id,
    reporter_discord_username: session.discordUsername,
    reported_discord_username: data.reportedDiscordUsername,
    reported_discord_user_id: data.reportedDiscordUserId || null,
    category: data.category,
    description: data.description,
    evidence_links: data.evidenceLinks || null,
    submitted_ip_hash: ipHash,
  };

  const supabase = createSupabaseAdminClient();

  for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt++) {
    const referenceCode = generateReferenceCode("RPT");

    const { data: inserted, error } = await supabase
      .from("reports")
      .insert({ ...insertPayload, reference_code: referenceCode })
      .select("id, reference_code")
      .single();

    if (!error && inserted) {
      notifyDiscordOfNewReport({
        ...insertPayload,
        id: inserted.id,
        reference_code: inserted.reference_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "pending",
        staff_notes: null,
        last_updated_by: null,
        claimed_by: null,
        claimed_at: null,
      }).catch(() => {
        // notifyDiscordOfNewReport already logs its own errors
      });

      return NextResponse.json(
        { id: inserted.id, referenceCode: inserted.reference_code },
        { status: 201 }
      );
    }

    if (error?.code === "23505" && error.message.includes("reference_code")) {
      continue;
    }

    console.error("Failed to insert report:", error?.message);
    return NextResponse.json(
      { error: "We couldn't save your report right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { error: "We couldn't save your report right now. Please try again." },
    { status: 502 }
  );
}
