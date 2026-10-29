// Response headers sent with every page and API reply.
//
// Enforced: the four that cannot break a page that already works (no sniffing,
// no framing, a trimmed Referer, a short list of browser features turned off).
// Report-only: the Content-Security-Policy. It is sent in Content-Security-Policy-Report-Only,
// so a browser logs what it would have blocked in the console and blocks nothing.
// There is deliberately no report endpoint. Turn the header into an enforced
// one only after a Preview has been browsed with the console open and is quiet.
//
// Strict-Transport-Security is not set here; the host (Vercel) already sends it
// and changing it affects every subdomain, so that stays a deliberate, separate decision.
//
// next.config.ts imports this file, so it must not import anything from the app.

export type SecurityHeader = { key: string; value: string };

export const CHALLENGES_ORIGIN = "https://challenges.cloudflare.com";
// Vercel Web Analytics and Speed Insights load their script from here on Vercel
// deployments (and from the site's own /_vercel/ path, which 'self' covers).
export const VERCEL_SCRIPTS_ORIGIN = "https://va.vercel-scripts.com";

// Microsoft Clarity (session analytics, production only and only after the
// visitor accepts the banner) loads its tag from www.clarity.ms, then a script
// from a numbered *.clarity.ms host, and sends its data to *.clarity.ms and
// c.bing.com, partly as image beacons.
export const CLARITY_ORIGINS = {
  script: ["https://www.clarity.ms", "https://*.clarity.ms"],
  connect: ["https://*.clarity.ms", "https://c.bing.com"],
  img: ["https://*.clarity.ms", "https://c.bing.com"],
} as const;

// The footer map (Leaflet) draws OpenStreetMap tiles and takes its marker
// pictures from unpkg. Both are images only.
export const MAP_TILES_ORIGIN = "https://*.tile.openstreetmap.org";
export const MAP_MARKER_ORIGIN = "https://unpkg.com";

export const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
].join(", ");

export type CspOptions = {
  /** `next dev` needs eval for its refresh runtime; a production build does not. */
  development?: boolean;
};

export function buildContentSecurityPolicy({ development = false }: CspOptions = {}): string {
  const scriptSrc = [
    "'self'",
    // Next.js writes small inline scripts into every page (the hydration data).
    // Without a per-request nonce, which would make every page dynamic, the
    // only way to allow them is 'unsafe-inline'. So this policy limits where
    // scripts may come from, not inline scripts. It is noted in the docs.
    "'unsafe-inline'",
    CHALLENGES_ORIGIN,
    VERCEL_SCRIPTS_ORIGIN,
    ...CLARITY_ORIGINS.script,
    ...(development ? ["'unsafe-eval'"] : []),
  ];

  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    ["script-src", scriptSrc],
    // Inline style attributes are used across the site's components.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    // Remote images go through /_next/image, so they are same-origin here. The
    // footer map is the exception: its tiles and marker are loaded by Leaflet.
    // Clarity also sends some of its data as image beacons.
    [
      "img-src",
      ["'self'", "data:", "blob:", MAP_TILES_ORIGIN, MAP_MARKER_ORIGIN, ...CLARITY_ORIGINS.img],
    ],
    // next/font serves its files from the site itself.
    ["font-src", ["'self'", "data:"]],
    ["media-src", ["'self'"]],
    [
      "connect-src",
      [
        "'self'",
        CHALLENGES_ORIGIN,
        ...CLARITY_ORIGINS.connect,
        ...(development ? ["ws:", "wss:"] : []),
      ],
    ],
    ["frame-src", [CHALLENGES_ORIGIN]],
    ["worker-src", ["'self'", "blob:"]],
    ["manifest-src", ["'self'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
  ];

  return directives.map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
}

export function buildSecurityHeaders(options: CspOptions = {}): SecurityHeader[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Content-Security-Policy-Report-Only", value: buildContentSecurityPolicy(options) },
  ];
}
