"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatViewCount } from "@/lib/formatViewCount";
import type { YoutubeVideo } from "@/lib/youtube";

const DISPLAY_COUNT = 4;

export function YoutubeVideoGrid({ videos }: { videos: YoutubeVideo[] }) {
  const t = useTranslations("home");
  const [tab, setTab] = useState<"recent" | "viewed">("recent");
  const tabs = [
    { id: "recent" as const, label: t("mostRecent") },
    { id: "viewed" as const, label: t("mostViewed") },
  ];

  const sorted = useMemo(() => {
    if (tab === "viewed") {
      return [...videos].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }
    return videos;
  }, [videos, tab]);

  const shown = sorted.slice(0, DISPLAY_COUNT);

  return (
    <div>
      <div role="tablist" aria-label={t("latestUploads")} className="mt-8 flex justify-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className="rounded-full px-4 py-2 text-sm font-medium transition"
            style={
              tab === item.id
                ? { background: "var(--color-accent)", color: "white" }
                : { background: "var(--color-surface-hover)", color: "var(--color-text-muted)" }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, not worth Next/Image's remote-pattern config for a homepage widget */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-medium text-[var(--color-text)]">
                {video.title}
              </p>
              {video.viewCount !== null && (
                <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                  {formatViewCount(video.viewCount)} {t("views")}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
