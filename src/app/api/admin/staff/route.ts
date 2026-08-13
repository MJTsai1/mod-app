import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertStaffAuthUser } from "@/lib/supabase/staffAdmin";
import { createStaffSchema } from "@/lib/validation/staff";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.staff.role !== "admin") {
    return NextResponse.json({ error: "Only admins can manage staff." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to list staff:", error.message);
    return NextResponse.json({ error: "Failed to load staff list." }, { status: 500 });
  }

  return NextResponse.json({ staff: data });
}

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (session.staff.role !== "admin") {
      return NextResponse.json({ error: "Only admins can manage staff." }, { status: 403 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = createStaffSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Some fields need attention.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, displayName, role } = parsed.data;
    const authUserId = await upsertStaffAuthUser(email, password);

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("staff_members")
      .upsert(
        { id: authUserId, email, display_name: displayName || null, role },
        { onConflict: "id" }
      )
      .select("id, email, display_name, role, created_at")
      .single();

    if (error) {
      console.error("Failed to upsert staff_members row:", error.message);
      return NextResponse.json({ error: "Failed to save the staff member." }, { status: 500 });
    }

    return NextResponse.json({ staff: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error creating staff account:", error);
    return NextResponse.json(
      { error: "Something went wrong creating that account. Please try again." },
      { status: 500 }
    );
  }
}
