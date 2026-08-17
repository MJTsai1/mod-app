import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: `${siteConfig.serverName} Moderator Applications`,
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.serverName,
    title: `${siteConfig.serverName} Community Hub`,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
