import type { MetadataRoute } from "next";
import { locales, localizedPath, localeAlternates } from "@/i18n/routing";

const ROUTES = ["", "/faq", "/privacy", "/terms", "/apply", "/report", "/appeal", "/support"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    const languages = localeAlternates(route);
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}${localizedPath(locale, route)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route === "" ? 1 : 0.5,
        alternates: { languages },
      });
    }
  }

  return entries;
}
