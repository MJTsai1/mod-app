import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/userAuth";
import { withdrawOwnSubmission } from "@/lib/withdraw";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const result = await withdrawOwnSubmission(session.id, id, {
    table: "reports",
    entityType: "report",
    ownerColumn: "reporter_id",
    nonWithdrawableStatuses: ["resolved", "dismissed"],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }
  return NextResponse.json({ success: true });
}
