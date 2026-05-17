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
- Responsive audit passes across the main public routes and ultra-small mobile, common mobile, tablet, desktop, and wide desktop viewports, including 44px touch-target checks on mobile and tablet controls.
- Accessibility audit has no critical or serious axe violations.
- Keyboard audit passes skip-link, desktop menu, and mobile menu flows.
- Product audit passes careers API and contact API validation/error checks.
- Visual audit confirms route-specific titles, h1s, shell landmarks, visible assets, and no Vercel auth wall.
- Production env checker passes with real production values after owner-scope env pull, or with CI placeholder-valid values when only testing the checker.
- Readiness report is generated under ignored `reports/release-readiness/` artifacts.

By default, `pnpm run report:readiness` treats only `Vercel - romega-digitals` as the intended Vercel project. If the owner intentionally keeps another Vercel project as part of production, pass it explicitly:

```powershell
$env:READINESS_INTENDED_VERCEL_CONTEXTS="Vercel - romega-digitals,Vercel - romega-digital"
pnpm run report:readiness
Remove-Item Env:READINESS_INTENDED_VERCEL_CONTEXTS
```

The report expects this review branch by default and treats `Vercel - rs-web-digital` as a blocking duplicate. After merge or after the duplicate integration is removed, override those assumptions only when the current release state proves it:

```powershell
$env:READINESS_EXPECTED_BRANCH="main"
$env:READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS="none"
pnpm run report:readiness
Remove-Item Env:READINESS_EXPECTED_BRANCH
Remove-Item Env:READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS
```

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
$env:CONTACT_AUDIT_BASE_URL=$base; $env:CONTACT_AUDIT_CONFIRM_SEND="true"; pnpm run audit:contact:delivery
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

After the owner-scope checks pass, set the evidence flags only for the final readiness report:

```powershell
$env:READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS="none"
$env:READINESS_PRODUCTION_BASE_URL="https://www.romega-solutions.com"
$env:READINESS_PRODUCTION_DOMAIN_VERIFIED="true"
$env:READINESS_PROTECTED_DEPLOYMENT_AUDIT_PASSED="true"
$env:READINESS_CONTACT_DELIVERY_VERIFIED="true"
pnpm run report:readiness
Remove-Item Env:READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS
Remove-Item Env:READINESS_PRODUCTION_BASE_URL
Remove-Item Env:READINESS_PRODUCTION_DOMAIN_VERIFIED
Remove-Item Env:READINESS_PROTECTED_DEPLOYMENT_AUDIT_PASSED
Remove-Item Env:READINESS_CONTACT_DELIVERY_VERIFIED
```

The production-domain flag is accepted only when the latest `reports/live-deployment-audit/live-deployment-audit.json` artifact is passing for `READINESS_PRODUCTION_BASE_URL`. Run `LIVE_AUDIT_BASE_URL=$base pnpm run audit:live` immediately before the final report.
The contact-delivery flag is accepted only when the latest `reports/contact-delivery-audit/contact-delivery-audit.json` artifact is passing for the same production base URL. The contact audit sends a real contact submission, so run it only after the owner confirms production email-provider env is configured.

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
