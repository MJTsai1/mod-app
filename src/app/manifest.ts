import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.serverName} Community Hub`,
    short_name: siteConfig.serverName,
    description:
      "Your hub for the community — quick links, moderator applications, member support, and the latest from our YouTube channel.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: siteConfig.accentColor,
    icons: [
      {
        src: "/logo.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
  };
}
