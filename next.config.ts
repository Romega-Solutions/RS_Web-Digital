import createMDX from "@next/mdx";
import type { NextConfig } from "next";

function readOrigin(raw: string | undefined): URL | null {
  try {
    return raw ? new URL(raw) : null;
  } catch {
    return null;
  }
}

const supabaseOrigin = readOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    // Cover images uploaded in the portal live in the public research-covers
    // bucket of the ticketing Supabase project: the hosted *.supabase.co
    // domain, plus whatever host NEXT_PUBLIC_SUPABASE_URL points at (a custom
    // domain, or a local test server).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/research-covers/**",
      },
      ...(supabaseOrigin
        ? [
            {
              protocol: supabaseOrigin.protocol.replace(":", "") as "http" | "https",
              hostname: supabaseOrigin.hostname,
              ...(supabaseOrigin.port ? { port: supabaseOrigin.port } : {}),
              pathname: "/storage/v1/object/public/research-covers/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    viewTransition: true,
  },
  // The Market Research pages are fully static, but the sitemap regenerates on
  // the server (it also lists live Careers positions) and reads the posts from
  // disk. Next's tracer misses those files for the sitemap, and a per-route
  // key ("/sitemap.xml", "/sitemap.xml/route") does not match it, so the
  // global key is used. Without this, the posts would drop out of the sitemap
  // after its first regeneration.
  outputFileTracingIncludes: {
    "/*": ["./src/content/market-research/**/*"],
  },
};

// Plugins are given by name (not imported) so the same config works for both
// the webpack build and Turbopack in `next dev`.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
  },
});

export default withMDX(nextConfig);
