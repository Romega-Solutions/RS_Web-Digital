# Domain Cutover Checklist

Updated: 2026-05-17  
Branch: `redesign/ui-audit-fixes`

For the current owner-scope action list, see `docs/vercel-owner-handoff.md`.
For the review and final release gate list, see `docs/submission-checklist.md`.

## Historical Verified State

This section is historical context only. Before acting on domain status, re-run the verification commands below and regenerate `pnpm run report:readiness`.

Previously verified pushed commit:

```text
8863f65ae4e93dd57b1f9f83d1ea2b313a3c487d
```

Working deployment:

- `https://romega-digitals.vercel.app/` returns `200`
- `https://romega-digitals.vercel.app/terms` returns `200`
- `https://romega-digitals.vercel.app/api/careers/jobs` returns `200`

Run `pnpm run report:readiness` for the current branch head, latest GitHub Actions run, current Vercel status targets, and direct production-domain probes before cutover.

Latest branch-head status must come from a fresh `pnpm run report:readiness` run because each handoff docs commit creates a new branch head and can change Vercel status outcomes. As of this handoff, the recurring owner-scope blockers are:

- Duplicate `Vercel - rs-web-digital` may keep aggregate commit status failed until disconnected or archived.
- `Vercel - romega-digitals` can be build-rate-limited when the owner team quota is exhausted.
- Production domain cutover, production responsive/accessibility/live audit artifacts, protected deployment audit, and real contact delivery are still owner-scope blockers.

Current production domain mismatch:

- `https://www.romega-solutions.com/` returns `200`, but serves an older app with title `Home`
- `https://www.romega-solutions.com/terms` returns `404`
- `https://romega-solutions.com/terms` returns `404`

Access blocker:

- The local Vercel CLI account can access `iron-marks-projects`
- The active deployment URLs belong to `kpg782s-projects`
- Domain inspection for `romega-solutions.com` is blocked without access to that Vercel scope

## Dashboard Steps

Use the Vercel dashboard account/team that owns `kpg782s-projects`.

1. Open the `romega-digitals` project.
2. Go to **Settings > Domains**.
3. Add or move these domains to `romega-digitals`:
   - `romega-solutions.com`
   - `www.romega-solutions.com`
4. If Vercel says the domain is already assigned to another project, remove it from the old project first.
5. Confirm production environment variables on `romega-digitals`:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_SITE_URL=https://www.romega-solutions.com`
   - `RECAPTCHA_SECRET_KEY` if reCAPTCHA is intended for contact submissions
   - `JOBS_API_URL` if the hardcoded fallback should be replaced
6. Pull and validate production env without printing secret values:

   ```powershell
   vercel env pull .env.vercel.local
   pnpm run check:env:production
   ```
7. Promote or redeploy the latest successful `romega-digitals` deployment.
8. Disconnect duplicate Git integrations if they are not intentionally used, or explicitly mark them as non-blocking in the release process. Keep `romega-digitals` as the intended project unless the owner decides otherwise:
   - `rs-web-digital`
   - `romega-digital`

## Verification Commands

Run after the domain move:

```powershell
$base = "https://www.romega-solutions.com"
Invoke-WebRequest -UseBasicParsing "$base/" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/about" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/services" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/talent" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/careers" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/contact" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/terms" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/privacy" -MaximumRedirection 5
Invoke-WebRequest -UseBasicParsing "$base/api/careers/jobs" -MaximumRedirection 5
$env:PRODUCTION_QA_BASE_URL=$base; pnpm run qa:production
Remove-Item Env:PRODUCTION_QA_BASE_URL
```

If the target URL is a protected Vercel preview instead of a public alias or production domain, add the project automation bypass secret before the live audit:

```powershell
$env:LIVE_AUDIT_BASE_URL="https://<deployment>.vercel.app"
$env:LIVE_AUDIT_VERCEL_BYPASS_SECRET="<redacted>"
pnpm run audit:live
Remove-Item Env:LIVE_AUDIT_VERCEL_BYPASS_SECRET
```

Expected:

- All listed routes return `200`
- `/terms` title includes `Terms and Conditions`
- `/api/careers/jobs` returns JSON
- The product-flow audit passes against the cutover domain
- The responsive audit passes against the cutover domain and writes a current-head production-domain summary artifact
- The accessibility audit passes against the cutover domain and writes a current-head production-domain summary artifact
- The keyboard audit passes against the cutover domain
- The visual render audit passes against the cutover domain
- The live deployment audit passes against the cutover domain with no auth wall, stale CSS, route-content, or careers API failures
- `pnpm run qa:production` clears stale per-gate production artifacts, writes a current-head, passing `reports/production-qa/` artifact for the same production base URL, verifies every expected gate artifact, records the post-final, recorded-artifact, published-artifact, and artifact-confirmation readiness evidence, and leaves the readiness report displaying that confirmation
- The readiness report production-domain probe passes for `/`, `/terms`, `/contact`, and `/api/careers/jobs`
- The readiness report shows no remaining blockers
- Contact form submission no longer fails due to missing or invalid email provider configuration

## Known Caveat

If `RECAPTCHA_SECRET_KEY` is set, direct API smoke tests without a valid reCAPTCHA token should return `400 recaptcha_required`. That is expected. Verify full contact success through the browser form after the client-side token flow is confirmed.
