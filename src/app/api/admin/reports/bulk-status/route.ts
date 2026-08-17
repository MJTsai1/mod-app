import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { reportStatusValues } from "@/lib/validation/report";
import { bulkStatusSchema } from "@/lib/validation/bulk";
import { bulkUpdateStatus } from "@/lib/bulkStatus";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bulkStatusSchema(reportStatusValues).safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await bulkUpdateStatus(parsed.data.ids, parsed.data.status, session.staff.id, {
    table: "reports",
    entityType: "report",
  });

  return NextResponse.json(result);
}
