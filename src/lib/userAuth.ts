import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UserSession {
  id: string;
  email: string | undefined;
  discordUsername: string;
  discordUserId: string | null;
  avatarUrl: string | null;
}

/**
 * Community member session (signed in with Discord via Supabase Auth OAuth).
 * Distinct from getStaffSession() in staffAuth.ts — this has nothing to do
 * with dashboard access, it just identifies who's submitting a report or
 * appeal so they can look up their own submissions later.
 */
export async function getUserSession(): Promise<UserSession | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const customClaims = (metadata.custom_claims ?? {}) as Record<string, unknown>;
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");
  const identityData = (discordIdentity?.identity_data ?? {}) as Record<string, unknown>;

  const discordUsername =
    (customClaims.global_name as string | undefined) ||
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    (identityData.username as string | undefined) ||
    user.email ||
    "Discord user";

  const discordUserId =
    (metadata.provider_id as string | undefined) ||
    (identityData.id as string | undefined) ||
    null;

  const avatarUrl = (metadata.avatar_url as string | undefined) || null;

  return {
    id: user.id,
    email: user.email,
    discordUsername,
    discordUserId,
    avatarUrl,
  };
}
