import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { buildResearchCoverPatterns } from "./src/lib/market-research/image-hosts.ts";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    // Cover images uploaded in the portal live in the public research-covers
    // bucket of the ticketing Supabase project. Only the host that
    // NEXT_PUBLIC_SUPABASE_URL points at is allowed (the hosted project, a
    // custom domain, or a local test server); other Supabase projects are not.
    remotePatterns: buildResearchCoverPatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
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
