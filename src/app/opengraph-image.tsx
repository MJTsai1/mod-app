import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.serverName} Community Hub`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0812",
          backgroundImage: `radial-gradient(ellipse 80% 80% at 50% 0%, ${siteConfig.accentColor}55, transparent 70%)`,
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: siteConfig.accentColorSoft,
            marginBottom: 24,
          }}
        >
          {siteConfig.serverName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#f5f3ff",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Community Hub
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#a89fc2",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Moderator applications, member reports, ban appeals, and more
        </div>
      </div>
    ),
    { ...size }
  );
}
