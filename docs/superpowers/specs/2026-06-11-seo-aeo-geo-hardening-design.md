# SEO, AEO, and GEO Hardening Design

## Goal

Improve Romega Solutions' production search and AI crawler readiness for `https://www.romega-solutions.com` without changing the public visual experience.

## Constraints

- The canonical domain remains `https://www.romega-solutions.com`.
- Work stays focused on technical SEO, AEO, and GEO signals: metadata, canonical URLs, crawl files, sitemap coverage, structured data, and automated checks.
- Existing FAQ/schema copy may be corrected when it conflicts with the current talent, brand, and operations positioning.
- No keyword stuffing or unsupported "rank first" claims. The implementation follows crawlability and machine-readable content best practices.
- Existing Next.js App Router metadata conventions stay in use.

## Recommended Approach

Use a centralized SEO route/catalog module and have `robots.ts`, `sitemap.ts`, `llms.txt`, metadata helpers, and the SEO audit consume that shared source of truth. This avoids drift between crawler files and page metadata while keeping the change small.

Alternatives considered:

- Edit each SEO file independently. This is faster short term but makes future drift likely.
- Add a large content/landing-page rewrite. That may help rankings later, but it is outside the current technical SEO request and changes the site experience.

## Architecture

- `src/lib/seo.ts` remains the main metadata and structured-data helper.
- A new `src/lib/seo-routes.ts` owns canonical page definitions, service anchors, AI crawler user agents, page image assets, and public document routes.
- `src/app/robots.ts`, `src/app/sitemap.ts`, and `src/app/llms.txt/route.ts` consume shared route/crawler definitions.
- Application detail pages get canonical metadata, breadcrumbs, and JobPosting data when the position is open.
- Contact FAQ content stays aligned with the current services so FAQ schema does not publish stale service categories.
- A new Node audit script checks the static SEO contract without requiring a running server.

## Data Flow

1. `siteConfig.url` normalizes `NEXT_PUBLIC_SITE_URL` or falls back to the production domain.
2. Shared route definitions build canonical sitemap and `llms.txt` entries through `absoluteUrl()`.
3. Page metadata uses `createMetadata()` for title, description, canonical, Open Graph, Twitter, and robots behavior.
4. The SEO audit imports the route handlers and helper data after TypeScript is compiled by `next build`.

## Error Handling

- Dynamic careers sitemap entries continue to fail open: if Supabase/job data is unavailable, static routes still render.
- Invalid application IDs continue to return `notFound()`.
- Closed application pages remain viewable but are marked `noindex` in metadata.

## Testing

- Add `pnpm run audit:seo`.
- The audit must verify the canonical production domain, root metadata title behavior, robots AI/search crawler allowances, sitemap coverage, route images, `llms.txt` coverage, and public asset existence.
- The audit must reject outdated FAQ/schema positioning on contact content.
- Existing verification remains: `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build`.

## Self-Review

- No placeholders or TBDs remain.
- Scope is limited to technical SEO/AEO/GEO; no unrelated UI work is included.
- The recommended approach matches the existing Next.js App Router metadata architecture.
