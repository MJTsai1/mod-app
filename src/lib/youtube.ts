import "server-only";

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
}

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, (match) => ENTITY_MAP[match] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function extract(pattern: RegExp, source: string): string | null {
  return pattern.exec(source)?.[1] ?? null;
}

/**
 * Fetches recent uploads via YouTube's public Atom feed — no API key or
 * Google Cloud project required. Returns an empty array on any failure
 * (network issue, channel renamed, feed format change) so a homepage widget
 * failure never breaks the page.
 */
export async function getRecentYoutubeVideos(
  channelId: string,
  limit: number = 4
): Promise<YoutubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return [];

    const xml = await response.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

    return entries.slice(0, limit).map((entry) => {
      const id = extract(/<yt:videoId>(.*?)<\/yt:videoId>/, entry) ?? "";
      const rawTitle = extract(/<title>(.*?)<\/title>/, entry) ?? "Untitled";
      const publishedAt = extract(/<published>(.*?)<\/published>/, entry) ?? "";
      const thumbnailUrl =
        extract(/<media:thumbnail url="(.*?)"/, entry) ??
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      return {
        id,
        title: decodeXmlEntities(rawTitle),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnailUrl,
        publishedAt,
      };
    });
  } catch (error) {
    console.error("Failed to fetch YouTube uploads:", error);
    return [];
  }
}
