# Submission Checklist

Updated: 2026-05-17  
Branch: `redesign/ui-audit-fixes`

This checklist is the branch-level handoff for review, merge, and production cutover. It separates repo-controlled readiness from Vercel-owner actions so the branch can be reviewed without overstating production status.

## Repo-Controlled Gates

Run from `RS_Web-Digital`:

```powershell
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run audit:responsive
pnpm run audit:a11y
pnpm run audit:keyboard
pnpm run audit:product
pnpm run audit:visual
pnpm run check:env:production
pnpm run report:readiness
```

Expected result:

- Architecture validation and ESLint pass.
- TypeScript passes with `tsc --noEmit`.
- Next.js production build completes.
- Responsive audit passes across the main public routes and ultra-small mobile, common mobile, tablet, desktop, and wide desktop viewports.
- Accessibility audit has no critical or serious axe violations.
- Keyboard audit passes skip-link, desktop menu, and mobile menu flows.
- Product audit passes careers API and contact API validation/error checks.
- Visual audit confirms route-specific titles, h1s, shell landmarks, visible assets, and no Vercel auth wall.
- Production env checker passes with real production values after owner-scope env pull, or with CI placeholder-valid values when only testing the checker.
- Readiness report is generated under ignored `reports/release-readiness/` artifacts.

## Live Deployment Gates

Run after the latest deployment is available on a public URL or with Vercel automation bypass access:

```powershell
$base = "https://www.romega-solutions.com"
$env:RESPONSIVE_AUDIT_BASE_URL=$base; pnpm run audit:responsive
$env:ACCESSIBILITY_AUDIT_BASE_URL=$base; pnpm run audit:a11y
$env:KEYBOARD_AUDIT_BASE_URL=$base; pnpm run audit:keyboard
$env:PRODUCT_AUDIT_BASE_URL=$base; pnpm run audit:product
$env:VISUAL_AUDIT_BASE_URL=$base; pnpm run audit:visual
$env:LIVE_AUDIT_BASE_URL=$base; pnpm run audit:live
pnpm run report:readiness
```

For a protected immutable Vercel deployment:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

Expected result:

- Public routes return app content, not a Vercel Authentication page.
- `/terms`, `/privacy`, and `/api/careers/jobs` are reachable.
- `pnpm run audit:live` passes with no stale CSS, auth-wall, route-content, or careers API failures.
- Real contact-form success is verified in a browser with production email-provider variables configured.
- `pnpm run report:readiness` reports `Submission ready: yes`.

## External Owner Actions

These remain outside this local session because the active Vercel login is not in the owning `kpg782s-projects` scope:

- Keep `romega-digitals` as the intended Vercel project for this app.
- Disconnect or archive duplicate Vercel Git integrations that keep reporting failed status, especially `rs-web-digital`.
- Confirm production env vars on the intended Vercel project:
  - `RESEND_API_KEY`
  - `ADMIN_EMAIL`
  - `NEXT_PUBLIC_SITE_URL=https://www.romega-solutions.com`
  - `RECAPTCHA_SECRET_KEY` if spam protection is required
  - `JOBS_API_URL` if live careers data should replace the fallback
- Move or assign `romega-solutions.com` and `www.romega-solutions.com` to `romega-digitals`.
- Re-run live production verification after the domain cutover.

## Submission Decision

The branch is ready for code review when local gates and GitHub Actions are green.

It is ready for production submission only after the Vercel-owner actions are complete and `pnpm run report:readiness` reports no blockers.
