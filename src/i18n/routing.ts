import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "es", "it", "zh-TW", "id", "de"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  "zh-TW": "繁體中文",
  id: "Bahasa Indonesia",
  de: "Deutsch",
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
