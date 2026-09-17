import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/config";
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
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
