import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.staff.role !== "admin") {
    return NextResponse.json({ error: "Only admins can manage staff." }, { status: 403 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (id === session.staff.id) {
    return NextResponse.json(
      { error: "You can't remove your own access. Ask another admin to do it." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("staff_members").delete().eq("id", id);

  if (error) {
    console.error("Failed to remove staff member:", error.message);
    return NextResponse.json({ error: "Failed to remove staff access." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
