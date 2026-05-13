# Deployment Audit — RS_Web-Digital (Vercel)

**Audited:** 2026-05-06  
**Repo remediation pass:** 2026-05-13
**Stack:** Next.js 16.2.4 · React 19 · Tailwind v4 · pnpm  
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
```

**Important:** `NEXT_PUBLIC_*` variables are baked into the client bundle at **build time**. If you add or change them in the dashboard, you must redeploy — a restart is not enough.

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

## Vercel Dashboard Checklist

Before the next production deployment, verify the following in the Vercel dashboard:

- [ ] `RESEND_API_KEY` is set for Production environment
- [ ] `ADMIN_EMAIL` is set for Production environment  
- [ ] `NEXT_PUBLIC_SITE_URL` is set to `https://www.romega-solutions.com`
- [ ] `RECAPTCHA_SECRET_KEY` is set (for spam protection)
- [ ] Framework preset is **Next.js** (auto-detected)
- [ ] Build command is `pnpm run build` (or auto)
- [ ] Install command is `pnpm install` (or auto)
- [ ] Node.js version is pinned to match CI

---

## Recommended Fix Order

1. **Now:** Verify required env vars in the Vercel dashboard, then redeploy.
2. **Now:** Run local and CI checks from the pnpm-only setup.
3. **Later:** Monitor `experimental.viewTransition` during Next.js upgrades.
