# Production Readiness

Updated: 2026-05-17
Branch: `redesign/ui-audit-fixes`

## Verified Locally

Current release evidence should be generated with `pnpm run report:readiness` after pulling the latest branch head. The commit-by-commit notes below are historical proof points, not a substitute for the current readiness report.

Commands run after merging `origin/main` into the redesign branch:

```bash
pnpm install --frozen-lockfile
pnpm run qa:local
```

`pnpm run qa:local` runs the local gates sequentially to avoid Playwright audit port collisions, starts a temporary production server for the local live audit, and regenerates the release-readiness and owner-unblock reports. Each step is bounded by `LOCAL_QA_STEP_TIMEOUT_MS`, defaulting to 300000 ms, and timeout cleanup kills the Windows process tree so timed-out Playwright children do not continue into later gates. It archives localhost audit outputs under ignored `reports/local-qa/latest/`, then restores any pre-existing production-domain audit artifacts before readiness reports are generated. That keeps local QA from replacing production-domain evidence with `127.0.0.1` artifacts. It may use non-secret placeholder values for the env-shape check when owner-scope Vercel env values are not available locally; that does not replace the real production env pull and validation before release.

Individual gate commands:

```bash
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
$env:LIVE_AUDIT_BASE_URL="http://127.0.0.1:3008"; pnpm run audit:live
$env:RESPONSIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:responsive
$env:PRODUCT_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:product
$env:LIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:live
```

After the latest branch head is available on a public production URL, use `$env:PRODUCTION_QA_BASE_URL="https://www.romega-solutions.com"; pnpm run qa:production` to run the production responsive, accessibility, keyboard, product-flow, visual, and live deployment gates together. The runner clears the six expected per-gate production artifacts before starting, completes all non-contact gates, writes ignored summary artifacts under `reports/production-qa/`, `reports/keyboard-audit/`, `reports/product-flow-audit/`, and `reports/visual-render-audit/`, verifies every expected gate artifact is current-head/passing/for the same base URL, records initial, refresh, final, post-final, recorded-artifact, and published-artifact readiness-sync results, records a readiness artifact confirmation in the production QA report, and runs one more readiness sync so the readiness report displays that confirmation. Each gate is bounded by `PRODUCTION_QA_STEP_TIMEOUT_MS`, defaulting to 300000 ms, so a stuck production route is recorded as a failed gate instead of leaving no report or stale evidence from another URL; timeout cleanup kills the Windows process tree so later gates remain readable. Final readiness blocks unless that production QA artifact is current-head, passing, for `READINESS_PRODUCTION_BASE_URL`, includes all six passing artifact checks, and records passing final, post-final, recorded-artifact, and published-artifact readiness syncs. The real contact delivery audit remains separate because it sends a production contact submission.

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

Generate a local evidence summary after the branch is clean and pushed:

```powershell
pnpm run report:readiness
```

The report writes ignored artifacts to `reports/release-readiness/` and summarizes branch, CI, Vercel commit statuses, GitHub deployment environment URLs, current-head responsive/accessibility/keyboard/product-flow/visual/live/contact audit evidence, direct production-domain route probes for `/`, `/terms`, `/contact`, and `/api/careers/jobs`, and remaining blockers.

Use `docs/submission-checklist.md` as the final review checklist. It is intentionally split between repo-controlled gates and Vercel-owner gates.

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
- Responsive audit covers the main public routes from ultra-small 280px mobile through 1920px wide desktop against the built app, enforces 44px mobile/tablet touch targets, and CI runs that audit on the redesign branch under Node.js 20
- Accessibility audit blocks critical and serious axe violations on the main public routes
- Keyboard audit covers skip-link behavior, desktop dropdown focus/escape handling, and mobile menu focus containment
- Product-flow audit covers the careers API response contract and contact API validation/error behavior without requiring production email-provider secrets
- Visual render audit covers route-specific titles, h1s, app shell landmarks, visible visual assets, and auth-wall detection across mobile, tablet, and desktop viewports
- Live deployment audit covers public route freshness, careers API JSON shape, Vercel authentication-wall leakage, stale footer CSS bundles on a running URL, and optional Vercel automation-bypass auth for protected preview URLs
- Vercel ignored-build config skips future docs-only commits through `scripts/vercel-ignore-build.mjs`, while app, config, workflow, package, and script changes still trigger builds
- Production env check validates required Vercel env shape without exposing secret values; CI runs it with placeholder-valid values to protect the checker, and owner-scope Vercel env pull must still verify the real production values
- Readiness report summarizes current branch, GitHub Actions, commit status contexts, intended Vercel contexts, GitHub deployment environment URLs, current-head responsive/accessibility/keyboard/product-flow/visual/live/contact audit artifacts, direct production-domain route probe results, and known production blockers into ignored local artifacts
- Production QA runner bundles the production-domain responsive, accessibility, keyboard, product-flow, visual, live, and readiness gates behind `pnpm run qa:production`; it clears stale per-gate production artifacts before starting, records the full bundle under `reports/production-qa/`, refreshes the per-gate summary artifacts, verifies those artifacts match the same current head and base URL, records the post-final, recorded-artifact, published-artifact, and artifact-confirmation readiness evidence, runs all non-contact gates before failing, and final readiness blocks unless that bundle is current-head, passing, for the expected production URL, and has passing final/post-final/recorded/published readiness syncs. Contact delivery remains separately guarded.
- Commit `669c5d8df307ae5f1c458cd491c79e7f887e92c7` passed GitHub Actions CI on Node.js 20
- Commit `57a1de52bb284e15576be1c795115cb369b2c8f6` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, and keyboard audits
- Commit `7b8f536852f73c47eac03625c8489ddf70d5ad35` passed GitHub Actions CI on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `5c99754c5713f669aabd1c05705785ec27ba4518` passed GitHub Actions CI run `25973058941` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, and product-flow audits
- Commit `6f363a94cce05cac7a2a66bfc043d864f4efd883` passed GitHub Actions CI run `25973495064` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `c03dee20ada83f9636807ef3f359701e8f135cde` passed GitHub Actions CI run `25973797941` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` passed GitHub Actions CI run `25974097469` on Node.js 20 with lint, typecheck, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `8f52e25add18abcd4a75f402974f2be3205866db` passed GitHub Actions CI run `25974770926` on Node.js 20 with lint, typecheck, production env checker, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `aa9f8f00458b4cbbd5bc78342b71aba703053275` passed GitHub Actions CI run `25975616207` on Node.js 20 with lint, typecheck, production env checker, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- Commit `d3138b3a73379af714910f6ae8d3c6ef07530ba2` passed GitHub Actions CI runs `25981751682` and `25981752318` on Node.js 20 with lint, typecheck, production env checker, build, responsive, axe accessibility, keyboard, product-flow, and visual render audits
- On 2026-05-17, the current uncommitted QA-runner working tree passed local `pnpm run qa:local` from the shared shell with bounded per-step process-tree cleanup. The run covered lint, typecheck, production env-shape validation with non-secret placeholder values, build, responsive, axe accessibility, keyboard, product-flow, visual render, local live deployment audit, release-readiness report, and owner-unblock report. A focused runtime-target rerun using temporary `node@20.20.2` also passed direct script syntax checks, ESLint for the changed QA/report scripts, `tsc --noEmit`, and `next build`.
- Commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d` deployed successfully to the intended `Vercel - romega-digitals` context at `https://romega-digitals-2ph3v77qv-kpg782s-projects.vercel.app`, but that immutable URL returns Vercel Authentication `401` to unauthenticated checks without a Vercel automation bypass secret
- `https://romega-digitals.vercel.app` passes basic route probes for `/`, `/about`, `/services`, `/talent`, `/careers`, `/contact`, `/privacy`, `/terms`, and `/api/careers/jobs`, and the product-flow audit passes against that alias.
- `https://romega-digitals.vercel.app` is not final release evidence yet: `pnpm run audit:live` still fails on older footer contrast CSS, `pnpm run audit:a11y` still fails on older footer color-contrast issues across the public routes, and the live responsive audit still reports stale deployed tap-target and carousel overflow issues. Re-run these audits after the latest branch deployment is confirmed on that alias.
- Latest successful immutable Vercel deployment URLs under `kpg782s-projects` are protected by Vercel Authentication from this session, so public live accessibility evidence must come from the alias after it is refreshed or from an owner-scope check using `LIVE_AUDIT_VERCEL_BYPASS_SECRET` / `VERCEL_AUTOMATION_BYPASS_SECRET`
- Dockerfile uses pnpm and runs the standard Next.js production server

For commit-specific current Vercel status targets and deployment environment URLs, run `pnpm run report:readiness`. Avoid treating the hardcoded older deployment URLs above as the latest deployment after new commits are pushed.

## External Release Blockers

These items require dashboard, account, or live-service access:

- Move `romega-solutions.com` and `www.romega-solutions.com` to the intended `romega-digitals` Vercel project.
- Confirm production Vercel environment variables: `RESEND_API_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and optional `RECAPTCHA_SECRET_KEY` / `JOBS_API_URL`.
- Run `pnpm run check:env:production` after owner-scope `vercel env pull .env.vercel.local`.
- Remove or intentionally document duplicate Vercel project integrations.
- Re-run live route checks after domain cutover.
- Run contact form success testing with the real email provider configured.
- Inspect latest Vercel deployment logs from the owning `kpg782s-projects` Vercel scope.
- Re-run `RESPONSIVE_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:responsive` after the latest redesign branch deployment is available; the current public alias still reflects older tap-target and carousel overflow behavior even though the current branch passes responsive checks locally and in CI.
- Re-run `ACCESSIBILITY_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:a11y` after the latest redesign branch deployment is available; the current public preview still reflects older footer contrast styles and fails the public-route a11y gate.
- Re-run `LIVE_AUDIT_BASE_URL=https://romega-digitals.vercel.app pnpm run audit:live` after the latest redesign branch deployment is available. The branch now removes the footer low-contrast CSS pattern locally, but the public alias must serve the new deployment before it can be used as release evidence.
- Re-run `pnpm run audit:live` against the protected immutable `romega-digitals` URL from the owner scope with `LIVE_AUDIT_VERCEL_BYPASS_SECRET` or `VERCEL_AUTOMATION_BYPASS_SECRET` set.
- Fix or disconnect the duplicate Vercel integration: `rs-web-digital` currently remains a blocking duplicate context. Run `pnpm run report:readiness` for the current commit-specific intended and duplicate Vercel status outcomes.
- Follow `docs/vercel-owner-handoff.md` for the exact owner-scope production cutover and verification sequence.
- Follow `docs/submission-checklist.md` for the branch review and final production submission checklist.

## Known Local Caveat

The 2026-05-17 full local `pnpm run qa:local` verification was run from a shell using Node.js `v25.2.1`, while the project pins Node.js `20.x`. The changed QA/report scripts, TypeScript project, and Next production build were also rerun locally with temporary Node.js `20.20.2`, and GitHub Actions CI for pushed head `d3138b3a73379af714910f6ae8d3c6ef07530ba2` runs on Node.js 20. Final release verification still requires owner-scope Vercel production env, domain, protected-deployment, and contact-delivery checks.
