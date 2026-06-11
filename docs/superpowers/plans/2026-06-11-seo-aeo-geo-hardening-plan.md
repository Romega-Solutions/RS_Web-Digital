# SEO, AEO, and GEO Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Romega Solutions site for crawlability, AI retrieval, and local/business search signals on the production canonical domain.

**Architecture:** Centralize route and crawler definitions, consume them from Next metadata routes, and add a deterministic audit script. Keep existing App Router metadata conventions and avoid visual changes.

**Tech Stack:** Next.js App Router 16, TypeScript, Node ESM scripts, Schema.org JSON-LD, `pnpm` scripts.

---

## File Structure

- Create: `src/lib/seo-routes.ts` for canonical static pages, service anchors, AI crawler user agents, and public document route definitions.
- Modify: `src/lib/seo.ts` for non-duplicated page titles, canonical URL handling, robots defaults, and organization schema improvements.
- Modify: `src/app/robots.ts` to consume shared crawler definitions and expose sitemap plus `llms.txt`.
- Modify: `src/app/sitemap.ts` to consume shared route definitions and include image hints.
- Modify: `src/app/llms.txt/route.ts` to consume shared route definitions and include stronger machine-readable coverage.
- Modify: `src/app/apply/[positionId]/page.tsx` to add application-page metadata controls and structured data.
- Modify: `src/app/contact/page.tsx` to align FAQ/schema content with current services.
- Modify: `src/app/opengraph-image.tsx` to remove an unused lint suppression found during final verification.
- Create: `scripts/seo-audit.mjs` to verify the SEO contract.
- Modify: `package.json` to add `audit:seo`.

### Task 1: Audit Contract

**Files:**
- Create: `scripts/seo-audit.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing audit**

```js
// scripts/seo-audit.mjs
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

const expectedDomain = "https://www.romega-solutions.com";
const seo = await import("../.next/server/chunks/ssr/src_lib_seo_ts.js");
const robotsRoute = await import("../.next/server/app/robots.txt/route.js");
const sitemapRoute = await import("../.next/server/app/sitemap.xml/route.js");
const llmsRoute = await import("../.next/server/app/llms.txt/route.js");

assert.equal(seo.siteConfig.url.origin, expectedDomain);
assert.equal(seo.createMetadata({ title: "Services", description: "Example", path: "/services" }).title, "Services");

const robots = robotsRoute.default();
assert.ok(robots.sitemap.includes(`${expectedDomain}/sitemap.xml`));
assert.ok(JSON.stringify(robots.rules).includes("GPTBot"));
assert.ok(JSON.stringify(robots.rules).includes("Google-Extended"));

const sitemap = await sitemapRoute.default();
assert.ok(sitemap.some((entry) => entry.url === `${expectedDomain}/`));
assert.ok(sitemap.some((entry) => entry.url === `${expectedDomain}/llms.txt`));
assert.ok(sitemap.every((entry) => entry.url.startsWith(`${expectedDomain}/`)));
assert.ok(sitemap.some((entry) => Array.isArray(entry.images) && entry.images.length > 0));

const llmsResponse = llmsRoute.GET();
const llmsText = await llmsResponse.text();
assert.ok(llmsText.includes(`${expectedDomain}/sitemap.xml`));
assert.ok(llmsText.includes("Talent Solutions"));
assert.ok(llmsText.includes("Strategic Operations"));

assert.ok(existsSync("public/favicon.png"));
assert.ok(existsSync("public/apple-touch-icon.png"));
assert.ok(existsSync("public/RS_Logo-Blue.png"));
```

- [ ] **Step 2: Add the npm script**

```json
"audit:seo": "node scripts/seo-audit.mjs"
```

- [ ] **Step 3: Run the audit to verify it fails**

Run: `pnpm run build && pnpm run audit:seo`

Expected: audit fails because `createMetadata()` returns a title with the site name already appended and because `/llms.txt` is not in the sitemap yet.

### Task 2: Shared SEO Source of Truth

**Files:**
- Create: `src/lib/seo-routes.ts`
- Modify: `src/lib/seo.ts`

- [ ] **Step 1: Implement shared route and crawler definitions**

```ts
export const aiCrawlerUserAgents = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
] as const;

export const staticSeoRoutes = [
  { path: "/", title: "Home", priority: 1, changeFrequency: "weekly", image: "/opengraph-image" },
  { path: "/about", title: "About", priority: 0.85, changeFrequency: "monthly", image: "/prompt-images/romega-about-hero.png" },
  { path: "/services", title: "Services", priority: 0.9, changeFrequency: "monthly", image: "/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp" },
  { path: "/careers", title: "Careers", priority: 0.8, changeFrequency: "weekly", image: "/prompt-images/romega-talent.png" },
  { path: "/talent", title: "Talent", priority: 0.8, changeFrequency: "weekly", image: "/prompt-images/romega-talent.png" },
  { path: "/contact", title: "Contact", priority: 0.8, changeFrequency: "monthly", image: "/contact_page.png" },
  { path: "/privacy", title: "Privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms", title: "Terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/llms.txt", title: "LLMs", priority: 0.3, changeFrequency: "weekly" },
] as const;
```

- [ ] **Step 2: Update metadata helper behavior**

Return `title` as the raw page title so the root layout template appends the site name once. Add a `robots` parameter for noindex pages and keep canonical URLs absolute through `absoluteUrl(path)`.

- [ ] **Step 3: Run typecheck**

Run: `pnpm run typecheck`

Expected: no TypeScript errors.

### Task 3: Robots, Sitemap, and LLMs

**Files:**
- Modify: `src/app/robots.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/llms.txt/route.ts`

- [ ] **Step 1: Update robots**

Use `aiCrawlerUserAgents` for AI crawler allow rules and expose both sitemap and `llms.txt` in comments.

- [ ] **Step 2: Update sitemap**

Map `staticSeoRoutes` into sitemap entries, include absolute image URLs when present, and keep dynamic application routes.

- [ ] **Step 3: Update llms.txt**

Generate services and key page lists from shared definitions and add sitemap, robots, and canonical domain references.

- [ ] **Step 4: Run audit**

Run: `pnpm run build && pnpm run audit:seo`

Expected: audit passes.

### Task 4: Dynamic Apply Page Structured Data

**Files:**
- Modify: `src/app/apply/[positionId]/page.tsx`

- [ ] **Step 1: Metadata behavior**

For invalid or unavailable positions, return noindex metadata. For closed positions, return noindex metadata. For open positions, include the job title, location-aware description, and canonical `/apply/:id`.

- [ ] **Step 2: Structured data**

Add breadcrumb JSON-LD for all valid application pages and JobPosting JSON-LD for open positions.

- [ ] **Step 3: Run typecheck**

Run: `pnpm run typecheck`

Expected: no TypeScript errors.

### Task 5: Contact FAQ Schema Alignment

**Files:**
- Modify: `src/app/contact/page.tsx`
- Modify: `scripts/seo-audit.mjs`

- [ ] **Step 1: Add audit expectations**

Assert that built contact HTML includes current service terms: `talent acquisition`, `brand and growth support`, and `strategic operations`. Assert that old service terms such as `HR, IT, administrative support` and `social media management services` are absent.

- [ ] **Step 2: Update FAQ answers**

Replace outdated FAQ answers with copy focused on talent acquisition, brand and growth support, strategic operations, engagement pricing, brand strategy support, and Romega's integrated growth model.

- [ ] **Step 3: Run audit after build**

Run: `pnpm run build && pnpm run audit:seo`

Expected: contact FAQ/schema checks pass.

### Task 6: Verification and Publish

**Files:**
- All modified files

- [ ] **Step 1: Run final checks**

Run:

```bash
pnpm run audit:seo
pnpm run typecheck
pnpm run lint
pnpm run build
```

Expected: every command exits 0.

- [ ] **Step 2: Remove verification warning cleanup**

Remove the unused `@next/next/no-img-element` eslint suppression in `src/app/opengraph-image.tsx` so final lint output has no warnings.

- [ ] **Step 3: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-06-11-seo-aeo-geo-hardening-design.md docs/superpowers/plans/2026-06-11-seo-aeo-geo-hardening-plan.md scripts/seo-audit.mjs package.json src/lib/seo-routes.ts src/lib/seo.ts src/app/robots.ts src/app/sitemap.ts src/app/llms.txt/route.ts src/app/contact/page.tsx src/app/opengraph-image.tsx 'src/app/apply/[positionId]/page.tsx'
git commit -m "feat: harden SEO and crawler metadata"
```

- [ ] **Step 4: Push main**

Run:

```bash
git push origin main
```

## Self-Review

- Spec coverage: each design requirement maps to one task above.
- Placeholder scan: no TBD/TODO/fill-in language remains.
- Type consistency: file names, function names, and package scripts match the current repo conventions.
