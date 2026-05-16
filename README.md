# Romega Digital

Romega Digital is the public Next.js site for Romega Solutions. It presents the company home page, service catalog, talent showcase, careers page, contact form, and legal pages.

## Stack

- Next.js 16 App Router
- React 19
- CSS Modules with Tailwind CSS v4 references
- Resend for contact form email delivery
- Playwright-based local audit scripts for responsive layout, WCAG checks, and Lighthouse

## Package Manager

Use npm for this repo. The authoritative lockfile is `package-lock.json`.

```bash
npm ci
```

## Environment

Copy `.env.example` to `.env.local` for local development.

Required for production contact submissions:

- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

Optional:

- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_TIMEOUT_MS`
- `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY`
- `EMAIL_CONTACT_FALLBACK_ENABLED` for local-only form capture without Resend

Do not commit real `.env*` secret values.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Key routes:

- `/`
- `/about`
- `/services`
- `/talent`
- `/careers`
- `/contact`
- `/privacy`
- `/terms`

## Verification

Run the standard local gates:

```bash
npm run lint
npm run typecheck
npm run build
```

For rendered-page QA, start the dev server first:

```bash
npm run dev
```

Then run:

```bash
$env:AUDIT_BASE_URL="http://localhost:3000"
npm run audit:responsive
npm run audit:wcag
npm run audit:lighthouse
```

`audit:responsive` covers `/`, `/about`, `/services`, `/talent`, `/careers`, and `/contact` across 320px mobile through 1920px wide desktop. It writes screenshots and `results.json` to `playwright-audit/`.

`audit:wcag` runs Axe checks on mobile, tablet, and desktop for the same route set.

`audit:lighthouse` writes JSON reports to `lighthouse-audit/`.

## Contact Form Behavior

`POST /api/contact` validates JSON requests, checks required fields, applies honeypot and suspicious-content checks, deduplicates repeated submissions, and sends mail through Resend when `RESEND_API_KEY` is configured.

If `RESEND_API_KEY` is missing in production, the route returns a service-unavailable response. Local development can use `EMAIL_CONTACT_FALLBACK_ENABLED=true` to avoid sending email while testing form UX.

## Careers

Careers listings are currently served from `src/lib/mock-careers.ts` through `/api/careers/jobs`. Job cards link to the configured `applyUrl`, currently Romega's LinkedIn jobs page. There is no `/careers/[id]` detail route.

## Docker

```bash
docker build -t romega-digital .
docker run --rm -p 3000:3000 romega-digital
```

The Dockerfile uses npm and `package-lock.json`, matching CI.

## Production Readiness Checklist

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Route smoke checks return 200 for the key public routes
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:responsive`
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:wcag`
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:lighthouse`
- Required production env vars are present in the deployment platform
