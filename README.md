# RS Web Digital

Romega Solutions public website built with Next.js 16 App Router, React 19, CSS Modules, Tailwind v4, and pnpm.

## Requirements

- Node.js `20.x`
- pnpm `9.15.9`

The repo pins both in `package.json` so CI, Vercel, and local installs use the same runtime family.

## Local Development

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Verification

Run the standard checks before shipping changes:

```bash
pnpm run qa:local
```

`pnpm run qa:local` runs the local release gates sequentially: lint, typecheck, production env-shape validation, build, responsive audit, axe accessibility audit, keyboard audit, product-flow audit, visual render audit, local live audit, release-readiness report, and Vercel owner-unblock report. The Playwright audits share a default server port, so the combined runner intentionally runs them one at a time. If no pulled production env file or required env vars are available, it uses non-secret placeholder values only for the local env-shape gate; owner-scope production env still needs real Vercel validation before release.

`vercel.json` uses `node scripts/vercel-ignore-build.mjs` as Vercel's ignored build step. Future commits that only touch `README.md` or files under `docs/` should skip Vercel builds to reduce owner-scope quota burn; app, config, workflow, package, and script changes still build.

For targeted checks, run individual commands:

```bash
pnpm run lint
pnpm run typecheck
pnpm run check:env:production
pnpm run build
pnpm run audit:responsive
pnpm run audit:a11y
pnpm run audit:keyboard
pnpm run audit:product
pnpm run audit:visual
pnpm run audit:live
pnpm run report:readiness
pnpm run report:owner-unblock
```

`pnpm run lint` runs the repo architecture validator before ESLint. `next build` does not run lint automatically in Next.js 16. The Playwright audits start the built app on `http://127.0.0.1:3007` by default, so run `pnpm run build` first. Override with `RESPONSIVE_AUDIT_BASE_URL`, `ACCESSIBILITY_AUDIT_BASE_URL`, `KEYBOARD_AUDIT_BASE_URL`, `PRODUCT_AUDIT_BASE_URL`, or `VISUAL_AUDIT_BASE_URL` when checking a separate running app or deployment.

For public alias or production-domain freshness, run:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://romega-digitals.vercel.app"; pnpm run audit:live
```

The live audit checks route content, the careers API contract, Vercel auth-wall leakage, and stale footer CSS bundles. It is intentionally not part of local CI because it depends on the external deployment being refreshed.

For protected Vercel preview URLs, set the project automation bypass secret before running the same command:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

The audit also reads Vercel's `VERCEL_AUTOMATION_BYPASS_SECRET` env var when available. The secret value is never written to the audit report.

For production environment readiness after pulling Vercel env locally:

```powershell
vercel env pull .env.vercel.local
pnpm run check:env:production
```

The env check reports only configured/missing status and validation failures. It does not print secret values.

To verify real production contact delivery after owner-scope env setup, run the guarded delivery audit:

```powershell
$env:CONTACT_AUDIT_BASE_URL="https://www.romega-solutions.com"
$env:CONTACT_AUDIT_CONFIRM_SEND="true"
pnpm run audit:contact:delivery
Remove-Item Env:CONTACT_AUDIT_BASE_URL
Remove-Item Env:CONTACT_AUDIT_CONFIRM_SEND
```

This sends a real contact submission to the configured production recipient and writes an ignored report under `reports/contact-delivery-audit/`. If production reCAPTCHA is enabled, provide `CONTACT_AUDIT_RECAPTCHA_TOKEN` from a real browser session.

To generate a local release-readiness summary from git, GitHub Actions, and commit status evidence:

```powershell
pnpm run report:readiness
```

The report is written to ignored files under `reports/release-readiness/` and records known external blockers without exposing secrets.

To generate a Vercel owner-scope unblock report from the current commit status:

```powershell
pnpm run report:owner-unblock
```

The report is written to ignored files under `reports/owner-unblock/`. It records the active Vercel login, intended and duplicate Vercel contexts, failed duplicate deployment IDs, and whether the current account can inspect the owner-scope deployment.

For review and release handoff, use `docs/submission-checklist.md`. It separates repo-controlled gates from Vercel-owner actions so the branch can be reviewed before production domain and environment access is available.

## Environment Variables

Required for production:

- `RESEND_API_KEY`: sends `/api/contact` email through Resend.
- `ADMIN_EMAIL`: destination for contact form submissions.
- `NEXT_PUBLIC_SITE_URL`: canonical site URL used in metadata and structured data.

Optional:

- `RECAPTCHA_SECRET_KEY`: server-side reCAPTCHA verification. Set only after the client sends a token.
- `RECAPTCHA_TIMEOUT_MS`: timeout for reCAPTCHA verification. Defaults to `5000`.
- `JOBS_API_URL`: Google Apps Script endpoint for live job listings. The API route has a fallback.
- `EMAIL_CONTACT_FALLBACK_ENABLED`: local-only contact capture without Resend. Ignored in production.

Run `pnpm run check:env:production` after `vercel env pull .env.vercel.local` to validate production env shape without printing secret values.

Use `.env.example` as the template. Do not commit real secret values.

## Docker

The Dockerfile uses pnpm and starts the normal Next.js production server.

Build the image:

```bash
docker build -t romega-digital .
```

Run the container:

```bash
docker run --rm -p 3000:3000 romega-digital
```

Docker was not available in the latest local Codex environment, so verify the image build on a machine with Docker before relying on this path.

## Deployment Notes

The primary deployment target is Vercel. See `docs/deployment-audit.md` for the current deployment-readiness checklist and known external requirements.

Current verified state:

- Owner-scope Vercel handoff is in `docs/vercel-owner-handoff.md`.
- Review and submission handoff is in `docs/submission-checklist.md`.
- Latest app routes are publicly reachable on `https://romega-digitals.vercel.app`, but that alias can lag the latest redesign branch deployment. The current branch removes the footer low-contrast CSS pattern that `pnpm run audit:live` catches; re-run the live audit after Vercel serves the latest commit before using the alias as final release evidence.
- `www.romega-solutions.com` is still serving a stale Vercel app until the domain is moved in the owning Vercel scope.
- Use `docs/domain-cutover-checklist.md` for the dashboard steps and post-cutover verification commands.
