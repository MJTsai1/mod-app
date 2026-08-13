import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation/application";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateReferenceCode } from "@/lib/applicationId";
import { getClientIp, hashIp, checkAndRecordSubmissionAttempt } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { notifyDiscordOfNewApplication } from "@/lib/discord";
import type { ApplicationInsert } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 50_000;
const MAX_INSERT_ATTEMPTS = 3;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 }
    );
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

  const { turnstileToken, ...applicationInput } = rawBody as Record<string, unknown>;

  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  const isHuman = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : undefined,
    clientIp
  );
  if (!isHuman) {
    return NextResponse.json(
      { error: "Captcha verification failed. Please try again." },
      { status: 400 }
    );
  }

  const rateLimitResult = await checkAndRecordSubmissionAttempt(ipHash);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error:
          "You've submitted the maximum number of applications allowed for now. Please try again later.",
      },
      { status: 429 }
    );
  }

  const parsed = applicationSchema.safeParse(applicationInput);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields need attention.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const insertPayload: ApplicationInsert = {
    reference_code: "", // set per attempt below
    discord_username: data.discordUsername,
    discord_user_id: data.discordUserId,
    age: data.age,
    country: data.country,
    timezone: data.timezone,
    time_in_server: data.timeInServer,
    activity_level: data.activityLevel,
    online_times: data.onlineTimes,
    weekly_hours: data.weeklyHours,
    has_moderated_before: data.hasModeratedBefore,
    previous_experience: data.previousExperience || null,
    bots_tools_used: data.botsToolsUsed || null,
    previous_staff_positions: data.previousStaffPositions || null,
    scenario_unaware_rules: data.scenarioUnawareRules,
    scenario_toxic_conflict: data.scenarioToxicConflict,
    scenario_friend_breaks_rule: data.scenarioFriendBreaksRule,
    scenario_staff_abuse: data.scenarioStaffAbuse,
    scenario_biased_report: data.scenarioBiasedReport,
    motivation_why: data.motivationWhy,
    motivation_suitable: data.motivationSuitable,
    motivation_good_moderator: data.motivationGoodModerator,
    motivation_improve_server: data.motivationImproveServer,
    additional_info: data.additionalInfo || null,
    confirmed_accurate: data.confirmedAccurate,
    submitted_ip_hash: ipHash,
  };

  const supabase = createSupabaseAdminClient();

  for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt++) {
    const referenceCode = generateReferenceCode();

    const { data: inserted, error } = await supabase
      .from("applications")
      .insert({ ...insertPayload, reference_code: referenceCode })
      .select("id, reference_code")
      .single();

    if (!error && inserted) {
      notifyDiscordOfNewApplication({
        ...insertPayload,
        id: inserted.id,
        reference_code: inserted.reference_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "pending",
        staff_notes: null,
        last_updated_by: null,
      }).catch(() => {
        // notifyDiscordOfNewApplication already logs its own errors
      });

      return NextResponse.json(
        { id: inserted.id, referenceCode: inserted.reference_code },
        { status: 201 }
      );
    }

    // Reference code collision (astronomically unlikely) — retry with a new one.
    if (error?.code === "23505" && error.message.includes("reference_code")) {
      continue;
    }

    console.error("Failed to insert application:", error?.message);
    return NextResponse.json(
      {
        error:
          "We couldn't save your application right now. Please try again in a moment.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { error: "We couldn't save your application right now. Please try again." },
    { status: 502 }
  );
}
