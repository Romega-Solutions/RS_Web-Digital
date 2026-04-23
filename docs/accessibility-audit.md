# Accessibility Audit

Audit basis: source review of the local Next.js 16 App Router project, local HTML fetches from the running dev app, `eslint` pass, and a failed production build caused by a non-a11y type issue in `src/app/layout.tsx`. No live NVDA/VoiceOver session or browser zoom lab was available, so reflow and AT findings are partly code-inferred.

## 1) Executive Summary

Accessibility score: `46/100`

Compliance level: `Below A` currently, therefore not AA-ready.

Top 5 critical failures:

- No skip link / bypass mechanism before repeated header nav. WCAG `2.4.1`. See `src/components/organisms/layout/SiteHeader.tsx`.
- Custom overlays and panels do not manage focus correctly: no trap, no initial focus, no focus return, no background inerting. WCAG `2.4.3`, `2.4.7`, `4.1.2`. See `src/app/careers/CareersPageClient.tsx`, `src/components/organisms/about/TeamMemberSidebar.tsx`, `src/components/organisms/talent/TalentPool.tsx`.
- Focus indicators are missing or color-only across major controls. WCAG `2.4.7`, `2.4.11`, `1.4.11`. See `src/app/globals.css`.
- Multiple interactive links are fake or broken: `href="#"` social/legal links and `#services-overview` targets that do not exist. WCAG `2.4.4`, `4.1.2`. See `src/components/organisms/layout/SiteFooter.tsx`, `src/app/contact/ContactPageClient.tsx`, `src/app/services/page.tsx`.
- Form errors and async status are not announced programmatically and are not tied to fields. WCAG `3.3.1`, `3.3.3`, `4.1.3`. See `src/app/contact/ContactPageClient.tsx` and `src/app/api/contact/route.ts`.

Legal/compliance risk: `High` for a public production site in the US because failures affect keyboard navigation, forms, focus visibility, and repeated-block bypass.

## 2) Perceivable

Violations:

- Contrast failures. `#fff` on `#378dee` is `3.38:1`; `#fff` on `#febd19` is `1.68:1`; `#378dee` on `#eef5ff` is `3.08:1`. This fails `1.4.3` and `1.4.11` for normal text and many controls. Affected areas include nav CTA, careers links, service CTA, active chips. See `src/app/globals.css`.
- Alt text is mostly present and decorative icons are generally correctly empty. No video/audio content was found, so captions/transcripts are not applicable.
- 200% zoom/reflow needs manual confirmation; fixed-height components such as `.team-carousel__card` and `.careers-hero-photo-frame` create reflow risk. See `src/app/globals.css`.

Exact fixes:

- Darken action blue to at least `#0b5fff` or `#005fcc` when paired with white text, or switch to dark text on light backgrounds.
- Replace yellow buttons using white text with dark text, e.g. `.services-spotlight-button, .careers-bottom-link { color:#1a1c1e; }`.
- Preserve decorative `alt=""`, but keep meaningful photos descriptive as already done.

## 3) Operable

Broken flows:

- Keyboard user cannot bypass header/nav to page content. Repro: load any page, press `Tab`; focus enters logo/nav/CTA with no “Skip to main content”.
- Opening careers/jobs, team sidebar, or mobile talent filters does not move focus into the panel, does not trap `Tab`, and does not restore focus to the trigger. Repro on `src/app/careers/CareersPageClient.tsx`, `src/components/organisms/talent/TalentPool.tsx`, `src/components/organisms/about/TeamMemberSidebar.tsx`.
- `TeamCarousel` binds arrow keys on `window`, so left/right keystrokes fire even when the carousel is not focused. See `src/components/organisms/about/TeamCarousel.tsx`.
- The careers dropdown uses `role="menu"`/`menuitem` without the required menu-button keyboard model. See `src/components/organisms/layout/SiteNavbar.tsx`.

Fixes:

- Add a skip link in root layout/header and give page main an `id`, e.g. `<a href="#main-content" className="skip-link">Skip to main content</a>`.
- Convert custom overlays to proper dialogs: focus first interactive element on open, trap focus, restore trigger focus on close, set app shell `inert`.
- Remove `role="menu"` unless implementing the full ARIA menu pattern; a disclosure list is simpler and more correct here.
- Scope carousel arrow-key handling to the carousel container only.

## 4) Understandable

UX + accessibility gaps:

- Contact form returns backend messages like `firstName is required` or `lastName is required`, but the UI exposes only `Name*`. That is confusing and fails `3.3.1`/`3.3.3`. See `src/app/contact/ContactPageClient.tsx` and `src/app/api/contact/route.ts`.
- No field-level error text, no `aria-invalid`, no `aria-describedby`, no summary focus shift after failed submit.
- Dead links labeled “LinkedIn”, “Facebook”, “Instagram”, “Privacy Policy”, “Terms of Use” create false expectations.

Suggested rewrites:

- Replace generic server messages with user-facing text tied to visible labels: “Enter your full name”, “Enter a valid phone number including country code”.
- On submit failure, focus an error summary and connect each field to its inline error via IDs.

## 5) Robust

Anti-patterns:

- Menu ARIA misuse in `src/components/organisms/layout/SiteNavbar.tsx`. Use native nav/list/disclosure semantics instead.
- Dynamic status updates are not exposed as status messages in contact, careers, or talent filtering. WCAG `4.1.3`. See `src/app/contact/ContactPageClient.tsx`, `src/app/careers/CareersPageClient.tsx`, `src/components/organisms/talent/TalentPool.tsx`.
- Mobile filter drawer lacks `aria-expanded`/`aria-controls` on the opener and is not exposed as modal UI. See `src/components/organisms/talent/TalentPool.tsx`.

Correct patterns:

- Use `role="status"` or `aria-live="polite"` for submit, load, and result-count updates.
- Prefer semantic `<dialog>` or a vetted accessible dialog primitive for overlays.

## 6) Advanced Checks (WCAG 2.2)

- Focus appearance `2.4.11`: fails broadly; only the about growth navigation defines a proper visible focus style.
- Target size `2.5.8`: carousel dots are `12px`/`16px` and fail the 24px minimum. See `src/app/globals.css`.
- Dragging alternatives `2.5.7`: pass for the team carousel because buttons/dots exist in addition to swipe.
- Accessible authentication: not applicable; no auth flow found.

## 7) AI + Modern Frontend Considerations

- SPA routing focus reset is missing. Next App Router keeps shared layout mounted, but there is no route-change focus handoff to `main` or page `h1`.
- Loading states are visually rendered as plain text but not announced. Add `role="status"` to careers loading/error/success states and to talent result-count changes.
- Hydration risk is moderate, but the larger issue is persistent layout without page-change announcement.

## 8) Automated + Manual Testing Strategy

Automated:

- Add `axe-core` in Playwright/Cypress for route smoke tests.
- Add `jest-axe` for header, footer, dialog, contact form, and talent filters.
- Add Lighthouse CI and `eslint-plugin-jsx-a11y`.

Automated tools will miss:

- Focus order, focus return, dead-end keyboard flows, live-region timing, alt-text quality, route-change announcements, and whether placeholder links are product-valid.

Must be manually tested:

- Header dropdown and mobile nav.
- Careers panel, team sidebar, talent mobile filters.
- Contact form success, validation, rate-limit, and server-error flows.
- 200% zoom/reflow and NVDA/VoiceOver route navigation.

## 9) Severity-Based Issues

### Critical

- Missing skip link. `2.4.1`. Blocks efficient keyboard/screen-reader navigation. Fix with a visible-on-focus skip link and `id="main-content"`.
- Inaccessible custom dialogs/drawers. `2.4.3`, `2.4.7`, `4.1.2`. Users can tab behind overlays and lose context. Fix with managed focus, trap, restore, and inert background.
- Focus appearance failures. `2.4.7`, `2.4.11`, `1.4.11`. Many controls have no compliant focus ring. Fix with a shared `:focus-visible` tokenized ring.

### High

- Contrast failures on primary CTAs and link-like controls. `1.4.3`, `1.4.11`. Text becomes unreadable for low-vision users. Fix color tokens and test every state.
- Placeholder/broken links. `2.4.4`, `4.1.2`. Keyboard and screen-reader users activate controls that do nothing. Replace `href="#"` with real URLs or remove them.
- Form status/errors not announced and not bound to fields. `3.3.1`, `3.3.3`, `4.1.3`. Fix inline errors, `aria-invalid`, `aria-describedby`, and `role="alert"`/`status`.

### Medium

- ARIA menu misuse in primary nav. `1.3.1`, `4.1.2`. Fix by using disclosure semantics or full menu-button behavior.
- Global arrow-key listener in team carousel. `2.1.1`. Restrict keyboard handling to focused carousel controls.
- Talent filter toggle lacks `aria-expanded`/`aria-controls`; results count is not announced. `4.1.2`, `4.1.3`.

### Low

- 24px target size failure on carousel dots. `2.5.8`. Increase hit area to at least 24x24.
- Services page anchor targets are missing. Functional issue with accessibility impact. Add the target ID or route to a real destination.

## 10) Remediation Plan

### A) Quick wins (<1 day)

- Add skip link and main-content target.
- Replace `href="#"` and broken `#services-overview` links.
- Ship a global `:focus-visible` style.
- Fix worst contrast pairs.

### B) Mid-term fixes (1–2 weeks)

- Rebuild all overlay patterns with proper dialog/focus behavior.
- Refactor contact form to field-level validation and status announcements.
- Remove invalid menu roles and add route-change focus management.

### C) Long-term improvements (design system)

- Tokenize accessible color pairs and focus rings.
- Standardize accessible dialog, disclosure, form field, status message, and button/link primitives.
- Add component-level a11y tests as release gates.

## 11) Dev Integration Strategy

- CI/CD: run `eslint`, `tsc`, Playwright + axe on key routes, Lighthouse CI budgets, and fail builds on new serious violations.
- Component library: enforce required props for link destination validity, dialog labelling, status regions, and focus-visible tokens.
- Code review checklist: keyboard-only flow, focus order/return, live-region behavior, contrast state coverage, no fake links, no ARIA role overreach.

## 12) Final Accessibility Scorecard

Production readiness: `Not ready for AA release`.

Primary ship risk: keyboard users, screen-reader users, and low-vision users will hit failures in navigation, overlays, and forms.

Estimated effort to reach WCAG AA: `about 1–2 weeks` for one strong frontend engineer plus QA, assuming no large design rewrites and that broken links/content targets are resolved in parallel. AAA opportunities would mainly be better route-change announcements, clearer plain-language validation copy, and tighter design-system contrast margins.
