import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = `${siteConfig.name} | Talent, Brand, and Operations Support`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  // siteConfig.logo starts with /, so we remove it for join
  const logoPath = siteConfig.logo.startsWith("/") ? siteConfig.logo.slice(1) : siteConfig.logo;
  const logo = await readFile(join(process.cwd(), "public", logoPath), "base64");
  const logoSrc = `data:image/png;base64,${logo}`;

  // next/og renders standard img tags inside ImageResponse.
  /* eslint-disable @next/next/no-img-element */
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #f7f2e8 0%, #efe5d2 42%, #d6e4f0 100%)",
          color: "#123458",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at top right, rgba(249, 189, 46, 0.22), transparent 34%), radial-gradient(circle at bottom left, rgba(18, 52, 88, 0.14), transparent 38%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <img src={logoSrc} width={220} height={64} alt="" />
              <div
                style={{
                  display: "flex",
                  padding: "10px 16px",
                  borderRadius: 999,
                  backgroundColor: "rgba(18, 52, 88, 0.08)",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Strategic Growth Partner
              </div>
            </div>

            <div
              style={{
                display: "flex",
                borderRadius: 999,
                border: "2px solid rgba(18, 52, 88, 0.12)",
                padding: "10px 18px",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              www.romega-solutions.com
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 860,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#f5a000",
              }}
            >
              Talent. Brand. Operations.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
              }}
            >
              Build stronger teams and steadier business growth.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.3,
                color: "rgba(18, 52, 88, 0.86)",
                maxWidth: 800,
              }}
            >
              {siteConfig.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            {["Talent Solutions", "Brand Growth Support", "Strategic Operations"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: 999,
                  backgroundColor: "#123458",
                  color: "#f7f2e8",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
  /* eslint-enable @next/next/no-img-element */
}
