import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffMemberRow } from "@/lib/supabase/types";

export interface StaffSession {
  userId: string;
  email: string | undefined;
  staff: StaffMemberRow;
}

/**
 * Secure (database-backed) staff check. Verifies the caller's Supabase
 * session against Supabase Auth, then confirms the user has a row in
 * `staff_members` — the row is fetched using the *user's own* session via
 * RLS ("staff can read own row"), so this is a real authorization check,
 * not just an optimistic cookie read. Applicants who sign up for a Supabase
 * account but have no staff_members row will always get `null` here.
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  // If this staff member has an MFA factor enrolled, the session must have
  // actually completed that challenge (aal2) — a password-only session
  // (aal1) for an MFA-enrolled account is not a fully authenticated staff
  // session. Fails open on an unexpected error from this call itself (so a
  // transient Supabase hiccup can't lock every staff member out at once);
  // only denies for the well-defined "MFA required but not completed" case.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return null;
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff_members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (staffError || !staff) return null;

  return { userId: user.id, email: user.email, staff };
}

/** Use in Server Components / Route Handlers that require a signed-in staff member. */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
