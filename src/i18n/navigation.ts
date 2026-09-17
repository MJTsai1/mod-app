import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware Link/useRouter/redirect/usePathname — use these (instead of
 * next/link and next/navigation) in public-site components so internal
 * navigation stays on the current locale. Do NOT use these in /admin
 * components (English-only, outside the [locale] segment).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
