import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasDiscordStaffRole, isBootstrapAdmin } from "@/lib/discordStaffRole";
import type { StaffMemberRow } from "@/lib/supabase/types";

export interface StaffSession {
  userId: string;
  email: string | undefined;
  discordUsername: string;
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

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");
  const identityData = (discordIdentity?.identity_data ?? {}) as Record<string, unknown>;
  const discordUserId =
    (metadata.provider_id as string | undefined) || (identityData.id as string | undefined);

  // This checks Discord's current server membership and role, not a browser claim.
  if (!discordUserId || !(await hasDiscordStaffRole(discordUserId))) return null;

  const discordUsername =
    (metadata.global_name as string | undefined) ||
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    (identityData.global_name as string | undefined) ||
    (identityData.username as string | undefined) ||
    "Discord staff";

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

  const admin = createSupabaseAdminClient();
  const { data: existingStaff, error: staffError } = await admin
    .from("staff_members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (staffError) {
    console.error("Failed to load staff record:", staffError.message);
    return null;
  }

  let staff = existingStaff;
  if (!staff) {
    const { data: created, error: createError } = await admin
      .from("staff_members")
      .insert({
        id: user.id,
        // Discord does not always provide email; this legacy column is non-null.
        email: user.email ?? `discord-${discordUserId}@invalid.local`,
        display_name: discordUsername,
        role: isBootstrapAdmin(discordUserId) ? "admin" : "staff",
      })
      .select("*")
      .single();

    if (createError || !created) {
      console.error("Failed to create staff record:", createError?.message);
      return null;
    }
    staff = created;
  } else if (isBootstrapAdmin(discordUserId) && staff.role !== "admin") {
    // Lets the owner promote their own Discord account after an initial login.
    const { data: promoted, error: promoteError } = await admin
      .from("staff_members")
      .update({ role: "admin" })
      .eq("id", user.id)
      .select("*")
      .single();

    if (promoteError || !promoted) {
      console.error("Failed to promote bootstrap admin:", promoteError?.message);
      return null;
    }
    staff = promoted;
  }

  return { userId: user.id, email: user.email, discordUsername, staff };
}

/** Use in Server Components / Route Handlers that require a signed-in staff member. */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
