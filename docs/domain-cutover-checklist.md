# Domain Cutover Checklist

Date prepared: 2026-05-13

## Verified State

Latest pushed commit:

```text
8863f65ae4e93dd57b1f9f83d1ea2b313a3c487d
```

Working deployment:

- `https://romega-digitals.vercel.app/` returns `200`
- `https://romega-digitals.vercel.app/terms` returns `200`
- `https://romega-digitals.vercel.app/api/careers/jobs` returns `200`

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
6. Promote or redeploy the latest successful `romega-digitals` deployment.
7. Disconnect stale Git integrations if they are not needed:
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
$env:PRODUCT_AUDIT_BASE_URL=$base; pnpm run audit:product
$env:VISUAL_AUDIT_BASE_URL=$base; pnpm run audit:visual
```

Expected:

- All listed routes return `200`
- `/terms` title includes `Terms and Conditions`
- `/api/careers/jobs` returns JSON
- The product-flow audit passes against the cutover domain
- The visual render audit passes against the cutover domain
- Contact form submission no longer fails due to missing or invalid email provider configuration

## Known Caveat

If `RECAPTCHA_SECRET_KEY` is set, direct API smoke tests without a valid reCAPTCHA token should return `400 recaptcha_required`. That is expected. Verify full contact success through the browser form after the client-side token flow is confirmed.
