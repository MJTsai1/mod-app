import "server-only";

/**
 * Thin wrapper around Supabase's GoTrue Admin API for provisioning staff
 * accounts with an admin-assigned password (no self-service signup, no
 * email verification flow). Used only from admin-only, server-side API
 * routes — see src/app/api/admin/staff/route.ts.
 */

interface GoTrueUser {
  id: string;
  email?: string;
}

function authAdminUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  return `${base}/auth/v1/admin${path}`;
}

function authHeaders(): HeadersInit {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function findAuthUserByEmail(email: string): Promise<GoTrueUser | null> {
  const response = await fetch(authAdminUrl(`/users?email=${encodeURIComponent(email)}`), {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to look up user (${response.status}): ${await response.text()}`);
  }
  const body = (await response.json()) as { users?: GoTrueUser[] };
  return body.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * Creates a new auth user with the given password, or resets the password
 * on an existing one (e.g. re-provisioning someone previously removed).
 * Returns the auth user's id.
 */
export async function upsertStaffAuthUser(email: string, password: string): Promise<string> {
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const response = await fetch(authAdminUrl(`/users/${existing.id}`), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update user password (${response.status}): ${await response.text()}`);
    }
    return existing.id;
  }

  const response = await fetch(authAdminUrl("/users"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user (${response.status}): ${await response.text()}`);
  }
  const created = (await response.json()) as GoTrueUser;
  return created.id;
}
