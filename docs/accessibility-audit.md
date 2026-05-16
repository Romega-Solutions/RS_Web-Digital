# Accessibility Audit

Last verified: 2026-05-17 on branch `redesign/ui-audit-fixes`.

## Scope

Automated Axe checks were run against the local rendered app at `http://localhost:3000` for:

- `/`
- `/about`
- `/services`
- `/talent`
- `/careers`
- `/contact`

Viewport coverage:

- mobile: `375x812`
- tablet: `768x1024`
- desktop: `1440x900`

Command:

```bash
$env:AUDIT_BASE_URL="http://localhost:3000"
npm run audit:wcag
```

## Result

Automated WCAG audit passed with zero non-minor Axe violations across all tested routes and viewports.

Observed output:

```text
/ mobile: violations=0
/ tablet: violations=0
/ desktop: violations=0
/about mobile: violations=0
/about tablet: violations=0
/about desktop: violations=0
/services mobile: violations=0
/services tablet: violations=0
/services desktop: violations=0
/talent mobile: violations=0
/talent tablet: violations=0
/talent desktop: violations=0
/careers mobile: violations=0
/careers tablet: violations=0
/careers desktop: violations=0
/contact mobile: violations=0
/contact tablet: violations=0
/contact desktop: violations=0
```

## Current Accessibility Features

- Shared skip-link and main-content target are present.
- Route announcements are wired through `RouteAnnouncer`.
- Mobile talent filters use dialog semantics and focus management.
- Form and filter result status messages use live-region patterns where currently implemented.
- Responsive audit confirms no horizontal page overflow across 320px to 1920px tested widths.

## Manual QA Still Recommended

Automated Axe checks do not fully prove keyboard and screen-reader quality. Before final production launch, manually verify:

- Header navigation and mobile menu open, close, focus order, and focus return.
- Talent filter drawer open, close, keyboard trap, and result-count announcement.
- Careers opportunities panel open, close, scroll behavior, and external apply link behavior.
- Contact form validation, submit loading state, success state, and service-unavailable state.
- 200 percent browser zoom and keyboard-only navigation on the main public routes.

## Known Limitations

- reCAPTCHA is optional and only enforced when backend configuration is present.
- Careers data currently comes from local mock data via `/api/careers/jobs`.
- Manual assistive-technology testing with NVDA, VoiceOver, or JAWS has not been recorded in this repo.
