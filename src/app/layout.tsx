import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  const description = t("siteDescription");
  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: `${siteConfig.serverName} Moderator Applications`,
    description,
    openGraph: {
      type: "website",
      siteName: siteConfig.serverName,
      title: `${siteConfig.serverName} Community Hub`,
      description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
      // The inline theme script below sets data-theme on this element
      // before React hydrates (to avoid a flash of the wrong theme) — that
      // makes the server/client markup legitimately differ on this one
      // attribute, which is exactly what suppressHydrationWarning is for.
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint to avoid a flash of the
            wrong theme — see src/lib/theme.ts and ThemeToggle.tsx. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
