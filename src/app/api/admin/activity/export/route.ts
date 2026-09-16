import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { getRecentActivity } from "@/lib/activityLog";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const ENTITY_LABELS = {
  application: "Application",
  report: "Report",
  appeal: "Ban Appeal",
  support: "Support Request",
} as const;

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const entries = await getRecentActivity(5000);

  const csv = toCsv(
    ["Entity Type", "Entity ID", "Detail", "Actor", "Actor Type", "Timestamp"],
    entries.map((entry) => [
      ENTITY_LABELS[entry.entityType],
      entry.entityId,
      entry.detail,
      entry.actorName,
      entry.actorType,
      entry.createdAt,
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="activity-${Date.now()}.csv"`,
    },
  });
}
