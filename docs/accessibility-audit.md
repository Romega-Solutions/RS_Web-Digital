# Accessibility and Responsiveness Audit

Updated: 2026-05-17
Branch: `redesign/ui-audit-fixes`

## Current Automated Gates

The branch now ships an automated responsive Playwright gate:

```bash
pnpm run audit:responsive
```

Run it against the local dev server or set `RESPONSIVE_AUDIT_BASE_URL` for another target.

Verified on 2026-05-17 against `http://localhost:3000`:

- `/`
- `/about`
- `/services`
- `/talent`
- `/careers`
- `/contact`
- `/privacy`
- `/terms`

The audit checks mobile, tablet, desktop, and wide desktop widths for:

- page-level horizontal overflow
- elements extending outside the viewport
- undersized interactive targets
- hidden or unusable primary content

## Accessibility Remediations Present in Code

Current source review confirms these earlier blockers have been addressed:

- A skip link is rendered before the app shell and targets `#main-content`.
- `MainTemplate` renders the shared `main` landmark with `id="main-content"`.
- `RouteAnnouncer` provides polite route-change announcements for client navigation.
- Global `:focus-visible` styles are defined in `src/app/globals.css`.
- Contact form, talent filters, and result counts expose live status messaging.
- Footer social and legal links point to real destinations instead of `href="#"`.
- Services anchor links target the existing `#services-overview` section.

## Manual QA Still Required

The current automated gate is not a full WCAG certification. Before final public launch, manually verify:

- keyboard-only navigation through desktop and mobile nav
- focus order and focus return for menus, filters, and open panels
- contact form validation, success, rate-limit, and provider-failure messages
- 200% browser zoom and small-screen reflow
- NVDA or VoiceOver navigation through all top-level routes
- contrast in real browser rendering for all CTA states and image overlays

## Recommended Next A11y Gate

Add an axe-backed Playwright smoke test before calling WCAG AA complete:

```bash
pnpm add -D @axe-core/playwright
```

Suggested route coverage:

- home
- about
- services
- talent
- careers
- contact
- privacy
- terms

Do not mark the site WCAG AA-ready until the axe gate, keyboard walkthrough, screen-reader smoke test, and zoom/reflow checks have all been completed.
