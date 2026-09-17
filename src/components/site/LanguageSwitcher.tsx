"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale });
    });
  }

  return (
    <select
      value={locale}
      onChange={(event) => handleChange(event.target.value)}
      disabled={pending}
      aria-label={t("label")}
      className={className ?? "field-input w-auto px-2 py-1.5 text-sm"}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
