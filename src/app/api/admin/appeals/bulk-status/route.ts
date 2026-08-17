import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { appealStatusValues } from "@/lib/validation/appeal";
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

  const parsed = bulkStatusSchema(appealStatusValues).safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await bulkUpdateStatus(parsed.data.ids, parsed.data.status, session.staff.id, {
    table: "ban_appeals",
    entityType: "appeal",
  });

  return NextResponse.json(result);
}
