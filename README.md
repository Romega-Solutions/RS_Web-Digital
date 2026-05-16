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
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run audit:responsive
```

`pnpm run lint` runs the repo architecture validator before ESLint. `next build` does not run lint automatically in Next.js 16. `pnpm run audit:responsive` expects the app to be running and defaults to `http://localhost:3000`; override with `RESPONSIVE_AUDIT_BASE_URL` when checking a different deployment.

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

- Latest app routes are live on `https://romega-digitals.vercel.app`.
- `www.romega-solutions.com` is still serving a stale Vercel app until the domain is moved in the owning Vercel scope.
- Use `docs/domain-cutover-checklist.md` for the dashboard steps and post-cutover verification commands.
