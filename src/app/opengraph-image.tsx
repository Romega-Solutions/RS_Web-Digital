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
          background: "linear-gradient(135deg, #1c5fa5 0%, #123458 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at top right, rgba(254, 189, 24, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(53, 141, 240, 0.1), transparent 40%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.1,
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 72px",
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
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "12px",
                }}
              >
                <img src={logoSrc} width={180} height={52} style={{ objectFit: "contain" }} alt="" />
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 999,
                  backgroundColor: "rgba(254, 189, 24, 0.15)",
                  color: "#febd18",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(254, 189, 24, 0.3)",
                }}
              >
                Strategic Growth Partner
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.7)",
                letterSpacing: "0.02em",
              }}
            >
              romega-solutions.com
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 920,
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#febd18",
              }}
            >
              Talent • Brand • Operations
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 78,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Build stronger teams and steadier growth.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.4,
                color: "rgba(255, 255, 255, 0.85)",
                maxWidth: 820,
                fontWeight: 500,
              }}
            >
              {siteConfig.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {["Talent Acquisition", "Brand Growth", "Strategic Operations"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "12px 24px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
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
