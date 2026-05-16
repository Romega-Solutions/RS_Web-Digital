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
pnpm run check:env:production
$env:LIVE_AUDIT_BASE_URL="http://127.0.0.1:3008"; pnpm run audit:live
$env:RESPONSIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:responsive
$env:PRODUCT_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:product
$env:LIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:live
```

For protected immutable Vercel preview URLs, run the live audit from the owner scope with a project automation bypass secret:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

`pnpm run audit:live` also reads Vercel's `VERCEL_AUTOMATION_BYPASS_SECRET` system env var when present. The generated report only records whether a bypass was configured, not the secret value.

For production env validation after owner-scope Vercel env pull:

```powershell
vercel env pull .env.vercel.local
pnpm run check:env:production
```

The command validates required keys and common production mistakes without printing secret values.

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
- Live deployment audit covers public route freshness, careers API JSON shape, Vercel authentication-wall leakage, stale footer CSS bundles on a running URL, and optional Vercel automation-bypass auth for protected preview URLs
- Production env check validates required Vercel env shape without exposing secret values
- Commit `669c5d8df307ae5f1c458cd491c79e7f887e92c7` passed GitHub Actions CI on Node.js 20
- Commit `57a1de52bb284e15576be1c795115cb369b2c8f6` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, and keyboard audits
- Commit `7b8f536852f73c47eac03625c8489ddf70d5ad35` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `5c99754c5713f669aabd1c05705785ec27ba4518` passed GitHub Actions CI run `25973058941` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `6f363a94cce05cac7a2a66bfc043d864f4efd883` passed GitHub Actions CI run `25973495064` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `c03dee20ada83f9636807ef3f359701e8f135cde` passed GitHub Actions CI run `25973797941` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` passed GitHub Actions CI run `25974097469` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` deployed successfully to the intended `Vercel - romega-digitals` context at `https://romega-digitals-2ph3v77qv-kpg782s-projects.vercel.app`, but that immutable URL returns Vercel Authentication `401` to unauthenticated checks without a Vercel automation bypass secret
- `https://romega-digitals.vercel.app` passed live responsive auditing for the main public routes
- `https://romega-digitals.vercel.app` passed live keyboard and product-flow auditing, but live axe auditing and `pnpm run audit:live` still fail on older footer contrast CSS and should be rerun after the latest branch deployment is confirmed on that alias
- Latest successful immutable Vercel deployment URLs under `kpg782s-projects` are protected by Vercel Authentication from this session, so public live accessibility evidence must come from the alias after it is refreshed or from an owner-scope check using `LIVE_AUDIT_VERCEL_BYPASS_SECRET` / `VERCEL_AUTOMATION_BYPASS_SECRET`
- Dockerfile uses pnpm and runs the standard Next.js production server

## External Release Blockers

These items require dashboard, account, or live-service access:

- Move `romega-solutions.com` and `www.romega-solutions.com` to the intended `romega-digitals` Vercel project.
- Confirm production Vercel environment variables: `RESEND_API_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and optional `RECAPTCHA_SECRET_KEY` / `JOBS_API_URL`.
- Run `pnpm run check:env:production` after owner-scope `vercel env pull .env.vercel.local`.
- Remove or intentionally document duplicate Vercel project integrations.
- Re-run live route checks after domain cutover.
- Run contact form success testing with the real email provider configured.
- Inspect latest Vercel deployment logs from the owning `kpg782s-projects` Vercel scope.
- Re-run `ACCESSIBILITY_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:a11y` after the latest redesign branch deployment is available; the current public preview still reflects older footer contrast styles.
- Re-run `LIVE_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:live` after the latest redesign branch deployment is available; the current public alias still serves the stale footer CSS bundle.
- Re-run `pnpm run audit:live` against the protected immutable `romega-digitals` URL from the owner scope with `LIVE_AUDIT_VERCEL_BYPASS_SECRET` or `VERCEL_AUTOMATION_BYPASS_SECRET` set.
- Fix or disconnect the duplicate Vercel integration: `rs-web-digital` currently reports failed on the latest commit status. `romega-digitals` and `romega-digital` report success for commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d`.
- Follow `docs/vercel-owner-handoff.md` for the exact owner-scope production cutover and verification sequence.

## Known Local Caveat

The 2026-05-17 local verification was run from a shell using Node.js `v25.2.1`, while the project pins Node.js `20.x`. The successful checks are still useful for code correctness, but final release verification should be repeated under Node 20 or in CI/Vercel.
