import "server-only";

export interface ServerWidgetInfo {
  name: string;
  presenceCount: number;
}

/**
 * Fetches live member presence from Discord's public server widget API —
 * no bot or token required. Requires the target server to have "Server
 * Widget" enabled under Server Settings -> Widget. Returns null on any
 * failure (widget disabled, network issue, no guild id configured) so the
 * homepage can just hide the stat rather than error.
 */
export async function getServerWidget(guildId: string | null): Promise<ServerWidgetInfo | null> {
  if (!guildId) return null;

  try {
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { name?: string; presence_count?: number };
    if (typeof data.presence_count !== "number") return null;

    return { name: data.name ?? "", presenceCount: data.presence_count };
  } catch (error) {
    console.error("Failed to fetch Discord server widget:", error);
    return null;
  }
}
