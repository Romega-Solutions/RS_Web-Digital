# Production Readiness

Updated: 2026-05-17
Branch: `redesign/ui-audit-fixes`

## Verified Locally

Commands run after merging `origin/main` into the redesign branch:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run audit:responsive
pnpm run audit:a11y
pnpm run audit:keyboard
pnpm run audit:product
pnpm run audit:visual
$env:RESPONSIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:responsive
$env:PRODUCT_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:product
```

Route smoke checks returned `200` locally for:

- `/`
- `/about`
- `/services`
- `/talent`
- `/careers`
- `/contact`
- `/privacy`
- `/terms`

## Current Release Gates

- Package manager: pnpm `9.15.9`
- Runtime target: Node.js `20.x`
- Framework: Next.js `16.2.6`
- React: `19.2.5`
- Lint includes architecture validation through `scripts/validate-architecture.mjs`
- Responsive audit covers the main public routes and viewport sizes against the built app, and CI runs that audit on the redesign branch under Node.js 20
- Accessibility audit blocks critical and serious axe violations on the main public routes
- Keyboard audit covers skip-link behavior, desktop dropdown focus/escape handling, and mobile menu focus containment
- Product-flow audit covers the careers API response contract and contact API validation/error behavior without requiring production email-provider secrets
- Visual render audit covers route-specific titles, h1s, app shell landmarks, visible visual assets, and auth-wall detection across mobile, tablet, and desktop viewports
- Commit `669c5d8df307ae5f1c458cd491c79e7f887e92c7` passed GitHub Actions CI on Node.js 20
- Commit `57a1de52bb284e15576be1c795115cb369b2c8f6` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, and keyboard audits
- Commit `7b8f536852f73c47eac03625c8489ddf70d5ad35` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `5c99754c5713f669aabd1c05705785ec27ba4518` passed GitHub Actions CI run `25973058941` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `6f363a94cce05cac7a2a66bfc043d864f4efd883` passed GitHub Actions CI run `25973495064` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- `https://romega-digitals.vercel.app` passed live responsive auditing for the main public routes
- `https://romega-digitals.vercel.app` passed live keyboard and product-flow auditing, but live axe auditing still fails on older footer contrast CSS and should be rerun after the latest branch deployment is confirmed on that alias
- Latest successful immutable Vercel deployment URLs under `kpg782s-projects` are protected by Vercel Authentication from this session, so public live accessibility evidence must come from the alias after it is refreshed or from an authenticated owner-scope check
- Dockerfile uses pnpm and runs the standard Next.js production server

## External Release Blockers

These items require dashboard, account, or live-service access:

- Move `romega-solutions.com` and `www.romega-solutions.com` to the intended `romega-digitals` Vercel project.
- Confirm production Vercel environment variables: `RESEND_API_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and optional `RECAPTCHA_SECRET_KEY` / `JOBS_API_URL`.
- Remove or intentionally document duplicate Vercel project integrations.
- Re-run live route checks after domain cutover.
- Run contact form success testing with the real email provider configured.
- Inspect latest Vercel deployment logs from the owning `kpg782s-projects` Vercel scope.
- Re-run `ACCESSIBILITY_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:a11y` after the latest redesign branch deployment is available; the current public preview still reflects older footer contrast styles.
- Fix or disconnect the duplicate Vercel integration: `rs-web-digital` currently reports failed on the latest commit status. `romega-digitals` and `romega-digital` report success for commit `6f363a94cce05cac7a2a66bfc043d864f4efd883`.

## Known Local Caveat

The 2026-05-17 local verification was run from a shell using Node.js `v25.2.1`, while the project pins Node.js `20.x`. The successful checks are still useful for code correctness, but final release verification should be repeated under Node 20 or in CI/Vercel.
