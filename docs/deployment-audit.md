# Deployment Audit — RS_Web-Digital (Vercel)

**Audited:** 2026-05-06  
**Repo remediation pass:** 2026-05-13
**Live deploy verification:** 2026-05-13
**Redesign branch merge verification:** 2026-05-17
**Latest branch deployment check:** 2026-05-17
**Stack:** Next.js 16.2.6 · React 19.2.5 · Tailwind v4 · pnpm 9.15.9
**Vercel project:** `romega-digitals` (`prj_4hyRbwLN9UAJN96JK58MyCyOTnpb`)  
**Symptom:** Project builds locally but deployment on Vercel fails or behaves incorrectly.

---

## Issue Summary

| # | Severity | Area | Status |
|---|----------|------|--------|
| 1 | 🔴 Critical | `output: standalone` in Next.js config | ✅ Fixed in `f6c0da2` |
| 2 | 🔴 Critical | Missing env vars in Vercel dashboard | ❌ External action required |
| 3 | 🟠 High | `romega-video.mp4` (91 MB) in `public/` | ✅ Fixed |
| 4 | 🟡 Medium | Dual lockfiles (`npm` + `pnpm`) | ✅ Fixed |
| 5 | 🟡 Medium | Dockerfile broken post-standalone removal | ✅ Config fixed in repo |
| 6 | 🟡 Medium | `JOBS_API_URL` missing from `.env.example` | ✅ Fixed |
| 7 | 🔵 Low | Stale zip files in `public/` | ✅ Fixed |
| 8 | 🔵 Low | `sw.js` service worker — orphaned | ✅ Fixed |
| 9 | 🔵 Low | Node.js version mismatch (CI=20, Vercel default=24) | ✅ Fixed |
| 10 | 🔵 Low | `experimental.viewTransition` enabled | ⚠️ Monitor |
| 11 | 🟠 High | Production custom domain attached to stale app | ❌ External action required |
| 12 | 🟡 Medium | Duplicate Vercel projects connected to same repo | ❌ External action required |

---

## 0. Live Deployment Verification — 2026-05-13

Commit verified: `8863f65ae4e93dd57b1f9f83d1ea2b313a3c487d`

GitHub/Vercel statuses for this commit:

| Vercel context | GitHub status | Verified URL behavior |
|---|---:|---|
| `Vercel – romega-digitals` | success | `https://romega-digitals.vercel.app/` = 200, `/terms` = 200, `/api/careers/jobs` = 200 |
| `Vercel – romega-digital` | success | `https://romega-digital.vercel.app/` = 200, `/terms` = 200, `/api/careers/jobs` = 200 |
| `Vercel – rs-web-digital` | failure | `https://rs-web-digital.vercel.app/` = 404, `/terms` = 404 |
| `www.romega-solutions.com` | stale live domain | `/` = 200 with old title `Home`, `/terms` = 404 |

Access blocker:

- The current Vercel CLI account is `iron-mark` under `iron-marks-projects`.
- The successful GitHub deployment records and URLs are under `kpg782s-projects`.
- `vercel domains inspect romega-solutions.com` fails from the current account because it does not have access to the domain owner scope.
- Failed deployment logs for `rs-web-digital` cannot be inspected from the current account for the same reason.

Conclusion:

- The latest app is deployed and route-verified on `romega-digitals.vercel.app`.
- The public production domain is still attached to a stale/different Vercel project and needs a dashboard-level domain move to `romega-digitals`.

---

## 0.1 Local Redesign Branch Verification — 2026-05-17

Branch verified: `redesign/ui-audit-fixes` after merging `origin/main`.

Local checks:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run build
$env:RESPONSIVE_AUDIT_BASE_URL="http://localhost:3000"; pnpm run audit:responsive
pnpm run audit:a11y
pnpm run audit:keyboard
pnpm run audit:product
pnpm run audit:visual
$env:LIVE_AUDIT_BASE_URL="http://127.0.0.1:3008"; pnpm run audit:live
```

Protected Vercel previews can be audited from the owning project scope by adding the project automation bypass secret:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

The script also accepts Vercel's `VERCEL_AUTOMATION_BYPASS_SECRET` system env var and does not write the secret value to `reports/live-deployment-audit/live-deployment-audit.json`.

Results:

- Architecture validation and ESLint passed.
- TypeScript passed with `tsc --noEmit`.
- Next.js production build passed and generated all app routes.
- Responsive Playwright audit passed for `/`, `/about`, `/services`, `/talent`, `/careers`, `/contact`, `/privacy`, and `/terms` across mobile, tablet, desktop, and wide desktop viewports.
- Local route smoke checks returned `200` for all key pages listed above.
- GitHub Actions CI passed on Node.js 20 for commit `669c5d8df307ae5f1c458cd491c79e7f887e92c7`, including `pnpm install --frozen-lockfile`, lint, typecheck, build, Playwright browser install, and the responsive audit.
- The public Vercel preview host `https://romega-digitals.vercel.app` passed the same responsive audit across the listed routes and viewport sizes.
- A follow-up branch gate adds axe-backed accessibility smoke coverage for the same public routes, blocking critical and serious findings.
- A keyboard smoke gate covers the skip link, desktop dropdown focus/escape behavior, and mobile menu focus containment.
- A product-flow smoke gate covers the careers API response shape and contact API validation/error behavior without requiring Resend, reCAPTCHA, or live email delivery.
- A visual render smoke gate covers route-specific titles, h1s, app shell landmarks, visible visual assets, interactive controls, and Vercel auth-wall leakage across 320, 390, 768, and 1440 pixel widths.
- A live deployment audit checks the public route freshness contract, careers API JSON shape, Vercel auth-wall leakage, stale footer CSS bundles on any running URL through `LIVE_AUDIT_BASE_URL`, and protected Vercel preview URLs when a project automation bypass secret is supplied.
- Latest branch commit `57a1de52bb284e15576be1c795115cb369b2c8f6` passed GitHub Actions CI on Node.js 20, including responsive, axe accessibility, and keyboard audits.
- Product-flow audit commit `7b8f536852f73c47eac03625c8489ddf70d5ad35` passed GitHub Actions CI run `25972988285` on Node.js 20, including responsive, axe accessibility, keyboard, and product-flow audits.
- Latest branch docs commit `5c99754c5713f669aabd1c05705785ec27ba4518` passed GitHub Actions CI run `25973058941` on Node.js 20, including responsive, axe accessibility, keyboard, and product-flow audits.
- Visual render audit commit `6f363a94cce05cac7a2a66bfc043d864f4efd883` passed GitHub Actions CI run `25973495064` on Node.js 20, including responsive, axe accessibility, keyboard, product-flow, and visual render audits.
- Live deployment audit commit `c03dee20ada83f9636807ef3f359701e8f135cde` passed GitHub Actions CI run `25973797941` on Node.js 20, including responsive, axe accessibility, keyboard, product-flow, and visual render audits.
- Protected preview audit commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` passed GitHub Actions CI run `25974097469` on Node.js 20, including responsive, axe accessibility, keyboard, product-flow, and visual render audits.
- GitHub commit statuses for `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` show `Vercel - romega-digitals` and `Vercel - romega-digital` succeeded. The duplicate `Vercel - rs-web-digital` integration still fails and causes the aggregate GitHub commit status to read `failure`.
- The successful `romega-digitals` immutable deployment URL for `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` is `https://romega-digitals-2ph3v77qv-kpg782s-projects.vercel.app`, but unauthenticated live audit and route probes return Vercel Authentication `401`.
- The `https://romega-digitals.vercel.app` alias returns `200` for `/`, `/terms`, and `/api/careers/jobs`; it passes live responsive, keyboard, and product-flow audits, but live axe and `LIVE_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:live` still report older footer contrast CSS. Treat the alias as not fully refreshed for the latest accessibility patch until both live gates pass.
- The immutable successful deployment URL for `romega-digitals` is protected by Vercel Authentication from this session, so unauthenticated Playwright audits hit Vercel's auth page instead of the app. Owner-scope access plus `LIVE_AUDIT_VERCEL_BYPASS_SECRET` or `VERCEL_AUTOMATION_BYPASS_SECRET` is required to audit that immutable deployment directly.

Local caveat:

- The local Codex shell was running Node.js `v25.2.1`; the repo, CI, Dockerfile, and intended Vercel runtime are pinned to Node.js `20.x`. Re-run the same gates on Node 20 before treating local evidence as a final release artifact.

Deployment-status caveat:

- GitHub commit statuses for the latest pushed redesign commit show success for `romega-digitals` and `romega-digital`, and failure for the duplicate `rs-web-digital` project.
- The local Vercel CLI account is `iron-mark`, which cannot inspect the `kpg782s-projects` deployments linked from those statuses.
- The public alias can be route-, responsiveness-, keyboard-, and product-flow-verified publicly, but deployment logs, failed duplicate-project logs, and protected immutable deployment audits require access to the owning Vercel scope.
- Exact owner-scope cutover and verification commands are maintained in `docs/vercel-owner-handoff.md`.

---

## 1. 🔴 `output: standalone` — FIXED

**File:** `next.config.ts`  
**Commit:** `f6c0da2` — removed on 2026-05-06

`output: 'standalone'` is a Docker/self-hosted mode that packages a self-contained Node.js server into `.next/standalone/`. Vercel does **not** use this mode — it manages its own serverless function packaging. When standalone is set:

- Vercel's build output API receives an incompatible artifact
- The deployment either fails at the routing layer or returns 404s for all routes

**Current state:** Removed. `next.config.ts` is now clean.

```ts
// next.config.ts — current (correct)
const nextConfig: NextConfig = {
  images: { qualities: [75, 85] },
  experimental: { viewTransition: true },
};
```

---

## 2. 🔴 Missing Environment Variables in Vercel Dashboard

**This is the most likely cause of "builds but doesn't work in production."**

The contact form and SEO metadata rely on env vars that must be set in the Vercel dashboard. They are **not** committed to the repo (correctly), but Vercel has no way to infer them — you must add them manually under **Project → Settings → Environment Variables**.

### Required (will break features without these)

| Variable | Used In | Effect if Missing |
|----------|---------|-------------------|
| `RESEND_API_KEY` | `/api/contact` | Contact form submissions are silently dropped in production |
| `ADMIN_EMAIL` | `/api/contact` | Falls back to `info@romega-solutions.com` — usually OK, but should be explicit |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo.ts`, all metadata | Falls back to `https://www.romega-solutions.com` — OK in prod, but must be set if domain differs |

### Optional (degraded experience without these)

| Variable | Used In | Effect if Missing |
|----------|---------|-------------------|
| `RECAPTCHA_SECRET_KEY` | `/api/contact` | reCAPTCHA verification skipped — spam protection disabled |
| `JOBS_API_URL` | `/api/careers/jobs` | Falls back to hardcoded Google Apps Script URL (see Issue 6) |
| `EMAIL_CONTACT_FALLBACK_ENABLED` | `/api/contact` | Only relevant in dev — set to `false` in Vercel |

### How to add them

```bash
# Via CLI (preferred)
vercel env add RESEND_API_KEY production
vercel env add ADMIN_EMAIL production
vercel env add NEXT_PUBLIC_SITE_URL production

# Or pull .env to check what's currently set
vercel env pull .env.vercel.local
pnpm run check:env:production
```

**Important:** `NEXT_PUBLIC_*` variables are baked into the client bundle at **build time**. If you add or change them in the dashboard, you must redeploy — a restart is not enough.

`pnpm run check:env:production` reports configured/missing status and validation errors only. It must not be used to print or share secret values.

---

## 3. 🟠 Large Video File in `public/` (91 MB)

**Status:** Fixed in repo. `public/romega-video.mp4` has been removed. The site still uses the compressed `public/romega-video-web.mp4` asset.

**Original finding:** `public/romega-video.mp4` — **91 MB**
**Also:** `public/romega-video-web.mp4` — 12 MB

Every deployment uploads all files in `public/` to Vercel's CDN. The 91 MB file:

- Significantly slows deploy times (uploaded fresh on each deploy, unless unchanged)
- Pushes toward Vercel's deployment size limits
- Serves directly from Vercel's CDN without adaptive bitrate streaming

**Recommendation:** If video size becomes a deployment or performance issue again, move video assets to a dedicated video host or Vercel Blob storage, then reference the external URL in the component.

```tsx
// Instead of:
<video src="/romega-video.mp4" />

// Use:
<video src="https://your-blob-or-cdn-url/romega-video.mp4" />
```

If the video must stay in `public/`, keep only the compressed web version (`romega-video-web.mp4`) and remove the 91 MB original.

---

## 4. 🟡 Dual Lockfiles — npm + pnpm

**Files:** `package-lock.json` (npm) + `pnpm-lock.yaml` (pnpm)

Vercel auto-detects the package manager by looking for lockfiles. With both present, Vercel prioritizes `pnpm-lock.yaml` and installs with pnpm — which is the correct behavior here. But the presence of both files creates ambiguity:

- CI uses pnpm (correct)
- Dockerfile uses npm (`npm ci`) → may install different dependency versions
- Contributors may accidentally run `npm install`, regenerating `package-lock.json` with drift

**Status:** Fixed in repo. `package-lock.json` has been removed, `package.json` now pins `packageManager: pnpm@9.15.9`, and the Dockerfile uses pnpm.

```bash
rm package-lock.json
git add -A && git commit -m "chore: remove npm lockfile, standardize on pnpm"
```

---

## 5. 🟡 Dockerfile Broken After Standalone Removal

**File:** `Dockerfile`

The Dockerfile copies from `.next/standalone` — a directory that only exists when `output: 'standalone'` is configured. Since that option was removed (Issue 1), a Docker build will now fail at the COPY step:

```dockerfile
# This will fail — .next/standalone does not exist
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

**Status:** Config fixed in repo. The Dockerfile now installs with pnpm and runs the normal Next.js production server with `pnpm start` instead of copying `.next/standalone`.

---

## 6. 🟡 `JOBS_API_URL` Not in `.env.example`

**File:** `src/app/api/careers/jobs/route.ts` (line 3–5)

The careers route accepts a `JOBS_API_URL` env var with a hardcoded Google Apps Script URL as fallback:

```ts
const JOBS_API_URL =
  process.env.JOBS_API_URL ||
  "https://script.google.com/macros/s/AKfycbwu.../exec"; // hardcoded
```

Two problems:

1. The Google Apps Script URL is **public in the source code** — anyone can hit it directly
2. `JOBS_API_URL` is not documented in `.env.example`, so it's invisible to future developers

**Status:** Fixed in repo. `JOBS_API_URL` is now documented in `.env.example`.

```bash
# Google Apps Script endpoint for live job listings
JOBS_API_URL=your-google-apps-script-url
```

---

## 7. 🔵 Stale Zip Files in `public/`

**Files:**
- `public/season-webfont.zip` — 28 KB
- `public/season.zip` — 28 KB

These are development artifacts (the zip archives used to install the Season font). The actual font file is already extracted to `public/season-webfont/Season-BF651e732546f7d.woff`. The zips are publicly accessible at `/season-webfont.zip` and `/season.zip` but serve no purpose.

**Status:** Fixed in repo. Both zip files have been deleted.

```bash
rm public/season-webfont.zip public/season.zip
```

---

## 8. 🔵 `sw.js` Service Worker — Origin Unknown

**File:** `public/sw.js`

A `sw.js` file exists in `public/` but there is no corresponding service worker registration in the codebase (`navigator.serviceWorker.register` is not called anywhere). This suggests it is a leftover from a previous PWA setup.

An unregistered service worker is harmless, but a stale one cached in a visitor's browser can cause hard-to-debug caching issues.

**Status:** Fixed in repo. `public/sw.js` has been deleted because no service worker registration exists in the codebase.

---

## 9. 🔵 Node.js Version Mismatch

| Environment | Node.js Version |
|-------------|-----------------|
| CI (`.github/workflows/ci.yml`) | 20 |
| Dockerfile | 20 (`node:20-alpine`) |
| Vercel default | **24** (LTS as of 2026) |

Vercel runs Node.js 24 by default. The CI and Docker environments run Node.js 20. This mismatch can cause subtle behavior differences (crypto, URL parsing, stream handling).

**Status:** Fixed in repo. `package.json` now pins Node.js to `20.x`, matching CI and the Docker base image.

**Fix:** Pin the Node.js version in `package.json` so Vercel uses the same version as CI:

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

Or upgrade CI and Dockerfile to Node.js 24 to match Vercel.

---

## 10. 🔵 `experimental.viewTransition` in Next.js Config

**File:** `next.config.ts`

```ts
experimental: {
  viewTransition: true,
}
```

The View Transition API flag is experimental in Next.js 16. Experimental flags can change behavior across patch releases without a semver bump. If a Next.js patch update changes the flag's behavior, it could silently break page transitions in production.

**Recommendation:** Monitor the [Next.js changelog](https://nextjs.org/blog) for when this graduates from experimental. No immediate action needed unless transitions break after a dependency update.

---

## 11. 🟠 Production Custom Domain Attached To Stale App

**Verified:** `https://www.romega-solutions.com/terms` returns `404`, while `https://romega-digitals.vercel.app/terms` returns `200`.

This means the custom domain is not serving the latest successful `romega-digitals` deployment.

**Fix:** In the Vercel dashboard scope that owns `kpg782s-projects`, move both domains to the `romega-digitals` project:

- `romega-solutions.com`
- `www.romega-solutions.com`

After moving the domains, redeploy or promote the latest successful `romega-digitals` deployment and recheck:

```bash
Invoke-WebRequest -UseBasicParsing https://www.romega-solutions.com/terms
Invoke-WebRequest -UseBasicParsing https://www.romega-solutions.com/api/careers/jobs
```

---

## 12. 🟡 Duplicate Vercel Projects Connected To Same Repo

Three Vercel contexts reported statuses for the same GitHub commit:

- `romega-digitals` succeeded and appears to be the intended target.
- `romega-digital` succeeded but `/api/contact` returned `503 send_failed` during live probing.
- `rs-web-digital` failed and causes the aggregate GitHub commit status to read `failure`.

**Fix:** In Vercel, keep the intended `romega-digitals` Git integration and disconnect or archive stale duplicate project integrations if they are not needed.

---

## Vercel Dashboard Checklist

Before the next production deployment, verify the following in the Vercel dashboard:

- [ ] `RESEND_API_KEY` is set for Production environment
- [ ] `ADMIN_EMAIL` is set for Production environment  
- [ ] `NEXT_PUBLIC_SITE_URL` is set to `https://www.romega-solutions.com`
- [ ] `RECAPTCHA_SECRET_KEY` is set (for spam protection)
- [ ] `pnpm run check:env:production` passes after `vercel env pull .env.vercel.local`
- [ ] Framework preset is **Next.js** (auto-detected)
- [ ] Build command is `pnpm run build` (or auto)
- [ ] Install command is `pnpm install` (or auto)
- [ ] Node.js version is pinned to match CI
- [ ] `romega-solutions.com` is assigned to `romega-digitals`
- [ ] `www.romega-solutions.com` is assigned to `romega-digitals`
- [ ] Duplicate Git integrations are removed or intentionally documented

---

## Recommended Fix Order

1. **Now:** Move `romega-solutions.com` and `www.romega-solutions.com` to `romega-digitals`.
2. **Now:** Verify required env vars in the `romega-digitals` Vercel dashboard, then redeploy or promote the latest successful deployment.
3. **Now:** Remove or disconnect stale duplicate Vercel projects from the GitHub repo.
4. **Next:** Recheck live production routes and contact form behavior.
5. **Later:** Monitor `experimental.viewTransition` during Next.js upgrades.
