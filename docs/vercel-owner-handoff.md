# Vercel Owner Handoff

Updated: 2026-05-17  
Branch: `redesign/ui-audit-fixes`  
Latest verified commit: `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d`

This handoff is for the Vercel owner scope `kpg782s-projects`. The local Codex session is authenticated as `iron-mark` under `iron-marks-projects`, so it cannot inspect protected deployments, failed duplicate-project logs, production domain settings, or owner-scope environment variables.

## Current Evidence

- GitHub Actions CI run `25974097469` passed on Node.js 20 for commit `313df7f485b2b48e4c60b5d6d3871b3c6e4bee9d`.
- CI passed `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, Playwright Chromium install, `pnpm run audit:responsive`, `pnpm run audit:a11y`, `pnpm run audit:keyboard`, `pnpm run audit:product`, and `pnpm run audit:visual`.
- Intended Vercel project `romega-digitals` deployed successfully:
  - `https://romega-digitals-2ph3v77qv-kpg782s-projects.vercel.app`
- Secondary Vercel project `romega-digital` also deployed successfully:
  - `https://romega-digital-as1lgga7j-kpg782s-projects.vercel.app`
- Duplicate Vercel project `rs-web-digital` failed:
  - `https://rs-web-digital-pyj3kst6e-kpg782s-projects.vercel.app`
  - Vercel log command from the owning scope: `npx vercel inspect dpl_G54pvowbWdRunXjSjHxPzz4U7Rzb --logs`
- Public alias `https://romega-digitals.vercel.app` is reachable but still serves stale footer CSS, so it is not valid final release evidence yet.
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
7. Run the protected preview audit against the successful immutable deployment:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://romega-digitals-2ph3v77qv-kpg782s-projects.vercel.app"
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
```

## Pass Criteria

- The aggregate GitHub commit status no longer fails because of `rs-web-digital`.
- The intended `romega-digitals` deployment is auditable with either public access or the automation bypass secret.
- `https://www.romega-solutions.com` serves the latest app, including `/terms` and `/api/careers/jobs`.
- `pnpm run audit:live` passes on the public production domain.
- `ACCESSIBILITY_AUDIT_BASE_URL=https://www.romega-solutions.com pnpm run audit:a11y` passes on the public production domain.
- A real browser contact-form success path is verified with production email provider variables configured.
