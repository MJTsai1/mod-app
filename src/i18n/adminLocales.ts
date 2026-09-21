/**
 * The staff dashboard (/admin) has its own, separate locale mechanism from
 * the public site's URL-prefixed locales (src/i18n/routing.ts) — admin URLs
 * stay unprefixed (staff bookmarks, the CRON_SECRET-protected nudge links,
 * etc. all point at plain /admin/... paths), so the language preference is
 * stored in a dedicated cookie instead of the URL, and resolved into a
 * request header by src/proxy.ts for src/i18n/request.ts to read.
 */
export const adminLocales = ["en", "fr"] as const;
export type AdminLocale = (typeof adminLocales)[number];

export const adminLocaleLabels: Record<AdminLocale, string> = {
  en: "English",
  fr: "Français",
};

export const defaultAdminLocale: AdminLocale = "en";
export const ADMIN_LOCALE_COOKIE = "admin-locale";
export const ADMIN_LOCALE_HEADER = "x-admin-locale";

export function isAdminLocale(value: string | undefined | null): value is AdminLocale {
  return !!value && (adminLocales as readonly string[]).includes(value);
}
