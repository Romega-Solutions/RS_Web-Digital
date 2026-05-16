# Production Readiness

Last updated: 2026-05-17

Branch: `redesign/ui-audit-fixes`

## Current Status

RS Web Digital is a public marketing site for Romega Solutions. The current branch is focused on production polish, especially responsive behavior from smallest mobile screens to wide desktop.

## Verified Gates

- `npm run lint`
- `npm run build`
- Route smoke checks on local dev server for `/`, `/about`, `/services`, `/talent`, `/careers`, and `/contact`
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:responsive`
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:wcag`
- `AUDIT_BASE_URL=http://localhost:3000 npm run audit:lighthouse`
- `npm audit --omit=dev`

## Responsive QA Result

The responsive audit passed for all tested routes at:

- `320x568`
- `568x320`
- `375x812`
- `812x375`
- `430x932`
- `932x430`
- `768x1024`
- `1024x768`
- `1366x768`
- `1440x900`
- `1920x1080`

Every route reported `overflowX=0` and `offenders=0`.

## Production Checklist

- [x] Public routes return 200 locally.
- [x] No horizontal overflow found in automated responsive audit.
- [x] Automated WCAG audit reports zero non-minor violations.
- [x] Careers job cards link to existing external application URLs instead of missing detail routes.
- [x] CI uses npm and `package-lock.json`, matching Docker.
- [x] Next.js is updated to latest stable `16.2.6`.
- [x] README documents setup, env, QA commands, Docker, and limitations.
- [x] Local Lighthouse audit passes configured thresholds for accessibility, best practices, SEO, and performance.
- [ ] Production deployment env vars are configured and verified.
- [ ] Manual keyboard and assistive-technology QA is recorded.
- [ ] Lighthouse audit is run against the final deployment target after deployment.

## Known Limitations

- Careers listings are mock-backed through `src/lib/mock-careers.ts`.
- Contact email delivery requires `RESEND_API_KEY` and `ADMIN_EMAIL` in production.
- reCAPTCHA enforcement is optional and depends on `RECAPTCHA_SECRET_KEY`.
- Rate limiting and duplicate submission checks are in-memory, so they reset on process restart and are not shared across scaled instances.
- `npm audit --omit=dev` still reports two moderate Next/PostCSS advisories on the latest stable Next.js release. npm's current `latest` dist-tag is `16.2.6`; upgrading to canary was intentionally avoided for production stability.
- Manual screen-reader QA has not been captured yet.
