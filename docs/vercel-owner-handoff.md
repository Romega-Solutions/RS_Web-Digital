# Vercel Owner Handoff

Updated: 2026-05-17  
Branch: `redesign/ui-audit-fixes`  
Latest evidence command: `pnpm run report:readiness`

This handoff is for the Vercel owner scope `kpg782s-projects`. The local Codex session is authenticated as `iron-mark` under `iron-marks-projects`, so it cannot inspect protected deployments, failed duplicate-project logs, production domain settings, or owner-scope environment variables.

## Current Evidence

- Run `pnpm run report:readiness` after pulling the latest `redesign/ui-audit-fixes` branch. It records the current branch, head commit, GitHub Actions status, Vercel commit statuses, and remaining blockers under ignored `reports/release-readiness/` files.
- Run `pnpm run report:owner-unblock` to write the latest Vercel owner-scope unblock evidence under ignored `reports/owner-unblock/` files, including the active Vercel login, failed duplicate context target URL, and whether this checkout can inspect the failed deployment.
- Current-head code QA evidence: GitHub Actions CI passed on Node.js 20 for commit `4c0725acb1def0d7b6538bc9cd6be10beccac9ac` in push run `25979351220` and pull-request run `25979351651`.
- CI passed `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, Playwright Chromium install, `pnpm run audit:responsive`, `pnpm run audit:a11y`, `pnpm run audit:keyboard`, `pnpm run audit:product`, and `pnpm run audit:visual`.
- The branch CI now runs `pnpm run check:env:production` with placeholder-valid values to prevent the env checker from breaking. Real production values still require owner-scope `vercel env pull .env.vercel.local` plus `pnpm run check:env:production`.
- `docs/submission-checklist.md` is the review checklist for this branch and lists repo-controlled gates separately from Vercel-owner gates.
- Current-head Vercel commit statuses succeeded for `romega-digitals` and `romega-digital`, while duplicate `rs-web-digital` failed and keeps the aggregate commit status failed; use the latest status targets from `pnpm run report:readiness`.
- If a future Vercel target URL contains `upgradeToPro=build-rate-limit`, the owning Vercel team has hit the build quota before a deployment could start. Wait for quota reset, reduce duplicate project builds, or upgrade the Vercel plan, then redeploy the latest branch head.
- Public alias `https://romega-digitals.vercel.app` is reachable. The branch removes the footer low-contrast CSS pattern locally, but `pnpm run audit:live` must pass against the alias after Vercel serves the latest commit before the alias is valid final release evidence.
- Current production domain `https://www.romega-solutions.com` is still attached to a stale app until moved or refreshed in Vercel.

## Owner Actions

1. Open Vercel under the `kpg782s-projects` team.
2. Keep `romega-digitals` as the intended project for RS_Web-Digital.
3. Disconnect or archive the duplicate `rs-web-digital` Git integration if it is not intentionally used.
4. Confirm or add production environment variables on `romega-digitals`:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_SITE_URL=https://www.romega-solutions.com`
   - `RECAPTCHA_SECRET_KEY` if contact-form spam protection is required
   - `JOBS_API_URL` if the fallback careers endpoint should be replaced
5. Pull and validate production env locally without printing secret values:

```powershell
vercel env pull .env.vercel.local
pnpm run check:env:production
```

6. Generate or select a Vercel Deployment Protection automation bypass secret for `romega-digitals`.
   - Vercel reference: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation/
7. Run the protected preview audit against the latest successful `romega-digitals` deployment URL from `pnpm run report:readiness` or the Vercel dashboard:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<latest-romega-digitals-deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

Vercel also exposes the selected automation bypass secret as `VERCEL_AUTOMATION_BYPASS_SECRET` when configured for the project, and `pnpm run audit:live` reads that variable automatically. The audit report records only whether a bypass was configured, not the secret value.

8. Move or assign production domains to `romega-digitals`:
   - `romega-solutions.com`
   - `www.romega-solutions.com`
9. Promote or redeploy the latest successful `romega-digitals` deployment.
10. Run the public production verification commands:

```powershell
$base = "https://www.romega-solutions.com"
Invoke-WebRequest -UseBasicParsing "$base/" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/about" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/services" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/talent" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/careers" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/contact" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/privacy" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/terms" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/api/careers/jobs" -MaximumRedirection 5
$env:RESPONSIVE_AUDIT_BASE_URL=$base; pnpm run audit:responsive
$env:ACCESSIBILITY_AUDIT_BASE_URL=$base; pnpm run audit:a11y
$env:KEYBOARD_AUDIT_BASE_URL=$base; pnpm run audit:keyboard
$env:PRODUCT_AUDIT_BASE_URL=$base; pnpm run audit:product
$env:VISUAL_AUDIT_BASE_URL=$base; pnpm run audit:visual
$env:LIVE_AUDIT_BASE_URL=$base; pnpm run audit:live
$env:CONTACT_AUDIT_BASE_URL=$base; $env:CONTACT_AUDIT_CONFIRM_SEND="true"; pnpm run audit:contact:delivery
pnpm run report:readiness
```

11. After the public production checks, protected deployment audit, and real contact-form delivery test all pass, generate the final readiness report with evidence flags:

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

The readiness report reads `reports/live-deployment-audit/live-deployment-audit.json`; do not set `READINESS_PRODUCTION_DOMAIN_VERIFIED=true` until `LIVE_AUDIT_BASE_URL=https://www.romega-solutions.com pnpm run audit:live` has passed in the same checkout.
It also reads `reports/contact-delivery-audit/contact-delivery-audit.json`; do not set `READINESS_CONTACT_DELIVERY_VERIFIED=true` until `CONTACT_AUDIT_BASE_URL=https://www.romega-solutions.com CONTACT_AUDIT_CONFIRM_SEND=true pnpm run audit:contact:delivery` has passed in the same checkout.

## Pass Criteria

- The aggregate GitHub commit status no longer fails because of `rs-web-digital`.
- The intended `romega-digitals` deployment is auditable with either public access or the automation bypass secret.
- `https://www.romega-solutions.com` serves the latest app, including `/terms` and `/api/careers/jobs`.
- `pnpm run audit:live` passes on the public production domain.
- `ACCESSIBILITY_AUDIT_BASE_URL=https://www.romega-solutions.com pnpm run audit:a11y` passes on the public production domain.
- A real browser contact-form success path is verified with production email provider variables configured.
- `pnpm run report:readiness` reports no remaining blockers.
