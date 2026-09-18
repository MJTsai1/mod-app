import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "es", "it", "zh-CN", "zh-HK", "id", "de", "jp", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  "zh-CN": "简体中文",
  "zh-HK": "繁體中文（香港）",
  id: "Bahasa Indonesia",
  de: "Deutsch",
  jp: "日本語",
  ko: "한국어",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // English stays unprefixed (/apply) so existing shared links keep
  // working; every other locale is prefixed (/fr/apply, /es/apply, ...).
  localePrefix: "as-needed",
});

/** Prefixes a path with the locale, matching the "as-needed" strategy above (no prefix for the default locale). Use for raw strings outside Link/useRouter, e.g. OAuth redirect targets. */
export function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

/**
 * Builds the `alternates.languages` map for a public page's metadata (and
 * for sitemap entries) — one absolute URL per locale, plus "x-default"
 * pointing at the unprefixed (English) version. Pass the unprefixed path,
 * e.g. "/faq" or "" for the homepage.
 */
export function localeAlternates(path: string): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${siteUrl}${localizedPath(locale, path)}`;
  }
  languages["x-default"] = `${siteUrl}${path}`;
  return languages;
}
