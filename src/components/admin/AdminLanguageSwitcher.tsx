"use client";

import { useLocale, useTranslations } from "next-intl";
import { adminLocales, adminLocaleLabels, ADMIN_LOCALE_COOKIE, type AdminLocale } from "@/i18n/adminLocales";

export function AdminLanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");

  function handleChange(next: AdminLocale) {
    document.cookie = `${ADMIN_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <select
      aria-label={t("language")}
      value={adminLocales.includes(locale as AdminLocale) ? locale : "en"}
      onChange={(event) => handleChange(event.target.value as AdminLocale)}
      className={className ?? "field-input w-auto py-1.5 text-sm"}
    >
      {adminLocales.map((l) => (
        <option key={l} value={l}>
          {adminLocaleLabels[l]}
        </option>
      ))}
    </select>
  );
}
