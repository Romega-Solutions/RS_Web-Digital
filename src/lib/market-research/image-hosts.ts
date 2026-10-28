// Which remote hosts next/image may fetch Market Research covers from.
//
// Covers live in the public research-covers bucket of the ticketing Supabase
// project, and their URLs are built from NEXT_PUBLIC_SUPABASE_URL (see
// researchCoverUrl in portal-mapping.ts). The allow-list is built from that
// same variable, so the two always agree and exactly one host is allowed. A
// wildcard such as *.supabase.co would let anyone's Supabase project through.
//
// next.config.ts imports this file, so it must not import anything else from
// the app.

export const RESEARCH_COVERS_PATHNAME = "/storage/v1/object/public/research-covers/**";

export type ResearchCoverPattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

/**
 * The remotePatterns entries for the research-covers bucket. Returns an empty
 * list when the variable is unset, malformed, not http(s), or contains a
 * wildcard host: then no remote image is allowed, which is the safe default
 * (without the variable no cover URL is built either, so no cover is shown).
 */
export function buildResearchCoverPatterns(rawSupabaseUrl: string | undefined): ResearchCoverPattern[] {
  if (!rawSupabaseUrl) return [];

  let origin: URL;
  try {
    origin = new URL(rawSupabaseUrl);
  } catch {
    return [];
  }

  const protocol = origin.protocol.replace(":", "");
  if (protocol !== "http" && protocol !== "https") return [];
  if (!origin.hostname || origin.hostname.includes("*")) return [];

  return [
    {
      protocol,
      hostname: origin.hostname,
      ...(origin.port ? { port: origin.port } : {}),
      pathname: RESEARCH_COVERS_PATHNAME,
    },
  ];
}
