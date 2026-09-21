import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { ADMIN_LOCALE_HEADER, defaultAdminLocale, isAdminLocale } from "@/i18n/adminLocales";

export default getRequestConfig(async ({ requestLocale }) => {
  // /admin has its own cookie-based locale (set as a request header by
  // src/proxy.ts, since admin URLs have no [locale] segment) and its own
  // message dictionary — entirely separate from the public site's
  // URL-prefixed locale resolution below.
  const headersList = await headers();
  const adminLocaleHeader = headersList.get(ADMIN_LOCALE_HEADER);
  if (isAdminLocale(adminLocaleHeader)) {
    return {
      locale: adminLocaleHeader,
      messages: (await import(`../../messages/admin/${adminLocaleHeader}.json`)).default,
    };
  }
  if (adminLocaleHeader) {
    return {
      locale: defaultAdminLocale,
      messages: (await import(`../../messages/admin/${defaultAdminLocale}.json`)).default,
    };
  }

  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
