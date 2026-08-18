import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AiReportRow, ApplicationRow } from "@/lib/supabase/types";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const REPORT_TOOL = {
  name: "submit_report",
  description: "Submit the structured application analysis.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "A 2-3 sentence overview of the applicant, for a staff member skimming quickly.",
      },
      answer_quality: {
        type: "string",
        description:
          "Assessment of the thoughtfulness, clarity, and effort in the scenario and motivation answers.",
      },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "Specific positive signals found in the application.",
      },
      concerns: {
        type: "array",
        items: { type: "string" },
        description:
          "Specific concerns: red flags, vague or copy-pasted-sounding answers, contradictions, or anything that warrants a closer look. Empty array if none.",
      },
      consistency_notes: {
        type: "string",
        description: "Whether the answers are internally consistent with each other and with the applicant's stated experience.",
      },
      history_notes: {
        type: "string",
        description:
          "Notes on the applicant's history from prior applications/reports/appeals provided in context, if any. State plainly if no prior history was provided.",
      },
    },
    required: [
      "summary",
      "answer_quality",
      "strengths",
      "concerns",
      "consistency_notes",
      "history_notes",
    ],
  },
} as const;

export interface AiReport {
  id: number;
  model: string;
  summary: string;
  answerQuality: string;
  strengths: string[];
  concerns: string[];
  consistencyNotes: string;
  historyNotes: string;
  requestedByName: string;
  createdAt: string;
}

function mapRow(row: AiReportRow, requestedByName: string): AiReport {
  return {
    id: row.id,
    model: row.model,
    summary: row.summary,
    answerQuality: row.answer_quality,
    strengths: row.strengths,
    concerns: row.concerns,
    consistencyNotes: row.consistency_notes,
    historyNotes: row.history_notes,
    requestedByName,
    createdAt: row.created_at,
  };
}

async function resolveRequesterName(staffId: string | null): Promise<string> {
  if (!staffId) return "A staff member";
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("staff_members")
    .select("display_name, email")
    .eq("id", staffId)
    .maybeSingle();
  return data?.display_name || data?.email || "A staff member";
}

/** Fetches the most recently generated AI report for an application, if one exists. */
export async function getLatestAiReport(applicationId: string): Promise<AiReport | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("entity_type", "application")
    .eq("entity_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const requestedByName = await resolveRequesterName(data.requested_by);
  return mapRow(data, requestedByName);
}

async function fetchApplicantHistory(
  application: ApplicationRow
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const discordUserId = application.discord_user_id;

  const [{ data: pastApplications }, { data: reports }, { data: appeals }] = await Promise.all([
    supabase
      .from("applications")
      .select("reference_code, status, created_at")
      .eq("discord_user_id", discordUserId)
      .neq("id", application.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reports")
      .select("reference_code, category, status, created_at")
      .eq("reported_discord_user_id", discordUserId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("ban_appeals")
      .select("reference_code, status, created_at")
      .eq("discord_user_id", discordUserId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const lines: string[] = [];

  if (pastApplications && pastApplications.length > 0) {
    lines.push("Prior applications from this Discord user ID:");
    for (const row of pastApplications) {
      lines.push(`- ${row.status}, submitted ${row.created_at} (ref ${row.reference_code})`);
    }
  } else {
    lines.push("No prior applications found from this Discord user ID.");
  }

  if (reports && reports.length > 0) {
    lines.push("Reports filed against this Discord user ID (as the reported member):");
    for (const row of reports) {
      lines.push(`- ${row.category}, status ${row.status}, filed ${row.created_at} (ref ${row.reference_code})`);
    }
  } else {
    lines.push("No reports on file against this Discord user ID.");
  }

  if (appeals && appeals.length > 0) {
    lines.push("Ban appeals from this Discord user ID:");
    for (const row of appeals) {
      lines.push(`- status ${row.status}, submitted ${row.created_at} (ref ${row.reference_code})`);
    }
  } else {
    lines.push("No ban appeals found from this Discord user ID.");
  }

  return lines.join("\n");
}

function buildPrompt(application: ApplicationRow, historyText: string): string {
  return `You are assisting a Discord server's staff team by analyzing a moderator application. Be objective, specific, and concise. Do not invent information that isn't present in the application or history below. This analysis is one input into a human staff member's decision — you are not approving or rejecting anyone.

## Application

Discord username: ${application.discord_username}
Age: ${application.age}
Country: ${application.country}
Timezone: ${application.timezone}
Time in server: ${application.time_in_server}
Activity level: ${application.activity_level}
Weekly hours available: ${application.weekly_hours}
Has moderated before: ${application.has_moderated_before ? "Yes" : "No"}
Previous moderation experience: ${application.previous_experience ?? "(none provided)"}
Bots/tools used: ${application.bots_tools_used ?? "(none provided)"}
Previous staff positions: ${application.previous_staff_positions ?? "(none provided)"}

Scenario — member repeatedly breaks rules but claims ignorance: ${application.scenario_unaware_rules}
Scenario — toxic conflict between two members: ${application.scenario_toxic_conflict}
Scenario — a friend breaks a rule: ${application.scenario_friend_breaks_rule}
Scenario — discovering another moderator abusing permissions: ${application.scenario_staff_abuse}
Scenario — report against someone they personally dislike: ${application.scenario_biased_report}

Why they want to be a moderator: ${application.motivation_why}
What makes them suitable: ${application.motivation_suitable}
What they think makes a good moderator: ${application.motivation_good_moderator}
What they'd improve about the server: ${application.motivation_improve_server}
Anything else: ${application.additional_info ?? "(none provided)"}

## Applicant history on file

${historyText}

Call the submit_report tool with your analysis.`;
}

/** Generates a fresh AI analysis for an application via the Anthropic API and persists it. */
export async function generateApplicationAiReport(
  application: ApplicationRow,
  requestedByStaffId: string
): Promise<AiReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not configured.");
  }

  const historyText = await fetchApplicantHistory(application);
  const prompt = buildPrompt(application, historyText);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1500,
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: "submit_report" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const body = await response.json();
  const toolUse = (body.content as Array<{ type: string; input?: unknown }> | undefined)?.find(
    (block) => block.type === "tool_use"
  );

  if (!toolUse?.input) {
    throw new Error("Anthropic response did not include a tool_use block.");
  }

  const input = toolUse.input as {
    summary: string;
    answer_quality: string;
    strengths: string[];
    concerns: string[];
    consistency_notes: string;
    history_notes: string;
  };

  const supabase = createSupabaseAdminClient();
  const { data: saved, error } = await supabase
    .from("ai_reports")
    .insert({
      entity_type: "application",
      entity_id: application.id,
      requested_by: requestedByStaffId,
      model: ANTHROPIC_MODEL,
      summary: input.summary,
      answer_quality: input.answer_quality,
      strengths: input.strengths ?? [],
      concerns: input.concerns ?? [],
      consistency_notes: input.consistency_notes,
      history_notes: input.history_notes,
    })
    .select("*")
    .single();

  if (error || !saved) {
    throw new Error(`Failed to save AI report: ${error?.message}`);
  }

  const requestedByName = await resolveRequesterName(requestedByStaffId);
  return mapRow(saved, requestedByName);
}
