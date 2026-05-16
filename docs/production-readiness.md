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
$env:RESPONSIVE_AUDIT_BASE_URL="http://localhost:3000"; pnpm run audit:responsive
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
- Responsive audit covers the main public routes and viewport sizes
- Dockerfile uses pnpm and runs the standard Next.js production server

## External Release Blockers

These items require dashboard, account, or live-service access:

- Move `romega-solutions.com` and `www.romega-solutions.com` to the intended `romega-digitals` Vercel project.
- Confirm production Vercel environment variables: `RESEND_API_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and optional `RECAPTCHA_SECRET_KEY` / `JOBS_API_URL`.
- Remove or intentionally document duplicate Vercel project integrations.
- Re-run live route checks after domain cutover.
- Run contact form success testing with the real email provider configured.

## Known Local Caveat

The 2026-05-17 local verification was run from a shell using Node.js `v25.2.1`, while the project pins Node.js `20.x`. The successful checks are still useful for code correctness, but final release verification should be repeated under Node 20 or in CI/Vercel.
