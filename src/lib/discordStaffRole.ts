import "server-only";

/** Checks Discord directly so a removed server role revokes access immediately. */
export async function hasDiscordStaffRole(discordUserId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !staffRoleId || !botToken) {
    console.error("Discord staff authorization is not configured.");
    return false;
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}`,
    { headers: { Authorization: `Bot ${botToken}` }, cache: "no-store" }
  );

  if (!response.ok) {
    // A 404 means the person is not in the server. Any error must deny access.
    console.error(`Discord staff role lookup failed: ${response.status}`);
    return false;
  }

  const member = (await response.json()) as { roles?: unknown };
  return Array.isArray(member.roles) && member.roles.includes(staffRoleId);
}

export function isBootstrapAdmin(discordUserId: string): boolean {
  return (process.env.DISCORD_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(discordUserId);
}
