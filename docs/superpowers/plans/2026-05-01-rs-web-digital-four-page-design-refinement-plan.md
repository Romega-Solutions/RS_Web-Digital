# RS Web Digital Four-Page Design Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `About`, `Services`, `Talent`, and `Careers` pages so they read as one premium digital-marketing site while preserving strong existing sections and keeping page copy changes out of scope.

**Architecture:** First unblock local rendering, then establish a shared four-page presentation system in global tokens and shared layout patterns. After that, redesign each page section-by-section using existing page roles and structure as the baseline, and finish with build and viewport verification.

**Tech Stack:** Next.js 16 App Router, React 19, CSS Modules with Tailwind v4 `@apply`, repo-local Playwright via `npx playwright --browser=chromium`, npm scripts (`npm run lint`, `npm run build`)

---

## File Structure

### Shared files

- Modify: `src/app/globals.css`
  - Tighten shared spacing, section rhythm, and reusable visual tokens for the four-page redesign.
- Modify: `src/components/templates/MainTemplate.tsx`
  - Only if needed to support page-level section spacing or shell variants without duplicating layout rules in page components.
- Modify: `src/components/templates/MainTemplate.module.css`
  - Only if needed to support shared page-band behavior.

### Compile blocker

- Modify: `src/components/molecules/legal/LegalTableOfContents.module.css`
  - Remove invalid `@apply` usage that currently prevents local rendering and page verification.

### About page

- Modify: `src/components/organisms/about/AboutHero.tsx`
- Modify: `src/components/organisms/about/AboutHero.module.css`
- Modify as needed:
  - `src/components/organisms/about/AboutMissionSection.tsx`
  - `src/components/organisms/about/AboutMissionSection.module.css`
  - `src/components/organisms/about/AboutVisionSection.tsx`
  - `src/components/organisms/about/AboutVisionSection.module.css`
  - `src/components/organisms/about/AboutValuesSection.tsx`
  - `src/components/organisms/about/AboutValuesSection.module.css`
  - `src/components/organisms/about/AboutPartnersSection.tsx`
  - `src/components/organisms/about/AboutPartnersSection.module.css`
  - `src/components/organisms/about/AboutExpertsSection.tsx`
  - `src/components/organisms/about/AboutGrowthSection.tsx`
  - `src/components/organisms/about/AboutGrowthSection.module.css`

### Services page

- Modify: `src/components/organisms/services/ServicesHero.tsx`
- Modify: `src/components/organisms/services/ServicesHero.module.css`
- Modify: `src/components/organisms/home/ServiceStrip.tsx`
- Modify: `src/components/organisms/home/ServiceStrip.module.css`
- Modify: `src/components/organisms/services/ServicesDetailSection.tsx`
- Modify: `src/components/organisms/services/ServicesDetailSection.module.css`

### Talent page

- Modify: `src/components/organisms/talent/TalentHero.tsx`
- Modify: `src/components/organisms/talent/TalentHero.module.css`
- Modify: `src/components/organisms/talent/TalentPool.tsx`
- Modify: `src/components/organisms/talent/TalentPool.module.css`
- Modify as needed:
  - `src/components/molecules/Card/TalentCard.tsx`
  - `src/components/molecules/Card/TalentCard.module.css`
  - `src/components/molecules/content/SectionIntro.tsx`
  - `src/components/molecules/content/SectionIntro.module.css`

### Careers page

- Modify: `src/components/organisms/careers/CareersHero.tsx`
- Modify: `src/components/organisms/careers/CareersHero.module.css`
- Modify: `src/components/organisms/careers/CareersValuesSection.tsx`
- Modify: `src/components/organisms/careers/CareersValuesSection.module.css`
- Modify: `src/components/organisms/careers/CareersPrivacySection.tsx`
- Modify: `src/components/organisms/careers/CareersPrivacySection.module.css`
- Modify: `src/components/organisms/careers/CareersJobSidebar.tsx`
- Modify: `src/components/organisms/careers/CareersJobSidebar.module.css`
- Optional restructure if inline opportunities are needed:
  - Create: `src/components/organisms/careers/CareersOpportunitiesSection.tsx`
  - Create: `src/components/organisms/careers/CareersOpportunitiesSection.module.css`
  - Modify: `src/app/careers/CareersPageClient.tsx`

### Verification artifacts

- Create if missing: `reports/playwright/`
  - Store screenshots and notes from local viewport checks.

## Task 1: Unblock Local Rendering

**Files:**
- Modify: `src/components/molecules/legal/LegalTableOfContents.module.css`
- Test: local dev route rendering on `/about`, `/services`, `/talent`, `/careers`

- [ ] **Step 1: Replace invalid `@apply` arbitrary utilities with plain CSS properties**

Use direct CSS for the `lg:` responsive background, shadow, and border declarations instead of packing arbitrary values into one `@apply` line.

```css
.root {
  @apply fixed bottom-8 right-8 z-90;
  display: none;
}

@media (min-width: 1024px) {
  .root {
    @apply sticky top-32 block w-72 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-3xl p-6;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 20px 50px rgba(8, 20, 36, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
}
```

- [ ] **Step 2: Start or reuse the local dev server**

Run:

```powershell
npm run dev
```

Expected: Next dev server starts without CSS compilation errors.

- [ ] **Step 3: Verify page rendering with HTTP checks**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/about | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing http://localhost:3000/services | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing http://localhost:3000/talent | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing http://localhost:3000/careers | Select-Object -ExpandProperty StatusCode
```

Expected: `200` for all four pages.

- [ ] **Step 4: Run lint to catch architecture rule regressions before design work**

Run:

```powershell
npm run lint
```

Expected: PASS.

## Task 2: Establish The Shared Four-Page Presentation System

**Files:**
- Modify: `src/app/globals.css`
- Modify if needed: `src/components/templates/MainTemplate.tsx`
- Modify if needed: `src/components/templates/MainTemplate.module.css`

- [ ] **Step 1: Add shared spacing and surface tokens for premium page rhythm**

Add or refine tokens in `globals.css` so the four pages share hero height, section spacing, readable width, and featured surface behavior.

```css
:root {
  --section-space-xl: clamp(5rem, 9vw, 8rem);
  --section-space-lg: clamp(4rem, 7vw, 6rem);
  --section-space-md: clamp(2.75rem, 5vw, 4.25rem);
  --page-band-dark: #0f2238;
  --page-band-soft: #f6f8fc;
  --surface-featured-shadow: 0 24px 64px rgba(8, 20, 36, 0.14);
  --surface-soft-shadow: 0 14px 34px rgba(16, 24, 40, 0.08);
  --hero-overlay-dark: linear-gradient(180deg, rgba(10, 18, 32, 0.22), rgba(10, 18, 32, 0.58));
}
```

- [ ] **Step 2: Normalize reusable section behavior instead of repeating per-page spacing hacks**

If the current template is forcing one-off spacing in each page, add explicit utility classes or shell variants in `MainTemplate.module.css`.

```css
.pageBand {
  padding-block: var(--section-space-lg);
}

.pageBandCompact {
  padding-block: var(--section-space-md);
}

.pageBandFeatured {
  padding-block: var(--section-space-xl);
}
```

- [ ] **Step 3: Wire the template only if needed**

Keep the template change minimal. Only pass section shell classes or band wrappers if it avoids duplication across all four pages.

```tsx
export function MainTemplate({ children, shellVariant = "default", ...props }: MainTemplateProps) {
  return (
    <div className={shellVariant === "hero" ? styles.shellHero : styles.shellDefault}>
      {props.header}
      <main id="main-content">{children}</main>
      {props.footer}
    </div>
  );
}
```

- [ ] **Step 4: Re-run lint after shared-token changes**

Run:

```powershell
npm run lint
```

Expected: PASS.

## Task 3: Redesign The About Page Sections

**Files:**
- Modify: `src/components/organisms/about/AboutHero.tsx`
- Modify: `src/components/organisms/about/AboutHero.module.css`
- Modify as needed:
  - `src/components/organisms/about/AboutMissionSection.tsx`
  - `src/components/organisms/about/AboutMissionSection.module.css`
  - `src/components/organisms/about/AboutVisionSection.tsx`
  - `src/components/organisms/about/AboutVisionSection.module.css`
  - `src/components/organisms/about/AboutValuesSection.tsx`
  - `src/components/organisms/about/AboutValuesSection.module.css`
  - `src/components/organisms/about/AboutPartnersSection.tsx`
  - `src/components/organisms/about/AboutPartnersSection.module.css`
  - `src/components/organisms/about/AboutGrowthSection.tsx`
  - `src/components/organisms/about/AboutGrowthSection.module.css`

- [ ] **Step 1: Redesign the hero into a premium brand-introduction section**

Preserve the current image and page role, but remove the isolated promo-block feel. Use stronger image framing, darker premium overlay, and left-aligned copy hierarchy.

```tsx
<section className={styles.root}>
  <div className={styles.mediaFrame}>
    <Image ... className={styles.photo} />
  </div>
  <div className={styles.copy}>
    <p className={styles.eyebrow}>About Romega Solutions</p>
    <h1 className={styles.title}>...</h1>
    <div className={styles.text}>...</div>
    <AppButton ...>Explore Our Services</AppButton>
  </div>
</section>
```

```css
.root {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
  min-height: var(--page-hero-content-min-height);
  padding-block: var(--section-space-xl);
  background:
    radial-gradient(circle at top right, rgba(254, 189, 24, 0.18), transparent 28%),
    linear-gradient(180deg, #17365d 0%, #102742 100%);
}
```

- [ ] **Step 2: Make adjacent About sections visually distinct**

Rework supporting section modules so they alternate between:

- bright surface
- featured dark or tinted band
- image-emphasis layout
- proof or partner layout

Use larger section intros and fewer repeated small-card treatments.

```css
.sectionIntro {
  max-width: 48rem;
  margin-bottom: 2rem;
}

.featuredBand {
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);
}
```

- [ ] **Step 3: Reduce repetitive card language**

Where `About` currently relies on multiple similar panels, consolidate styling into one repeated card system and one featured panel system.

```css
.card {
  border: 1px solid rgba(21, 78, 138, 0.12);
  box-shadow: var(--surface-soft-shadow);
}

.featuredPanel {
  border-radius: 2rem;
  box-shadow: var(--surface-featured-shadow);
}
```

- [ ] **Step 4: Verify the page in browser and build**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/about | Select-Object -ExpandProperty StatusCode
npm run build
```

Expected: `/about` returns `200`; build passes.

## Task 4: Redesign The Services Page Sections

**Files:**
- Modify: `src/components/organisms/services/ServicesHero.tsx`
- Modify: `src/components/organisms/services/ServicesHero.module.css`
- Modify: `src/components/organisms/home/ServiceStrip.tsx`
- Modify: `src/components/organisms/home/ServiceStrip.module.css`
- Modify: `src/components/organisms/services/ServicesDetailSection.tsx`
- Modify: `src/components/organisms/services/ServicesDetailSection.module.css`

- [ ] **Step 1: Make the hero capability-first instead of mood-first**

Keep the current page role and CTA, but use a more premium offer-page composition.

```tsx
<section className={styles.root}>
  <div className={styles.media}><Image ... /></div>
  <div className={styles.overlay} aria-hidden="true" />
  <div className={styles.inner}>
    <div className={styles.copyBlock}>
      <h1 className={styles.title}>...</h1>
      <p className={styles.copy}>...</p>
      <AppButton ...>Book a Growth Consultation</AppButton>
    </div>
  </div>
</section>
```

```css
.copyBlock {
  max-width: 44rem;
  padding: clamp(1rem, 2vw, 1.5rem);
}
```

- [ ] **Step 2: Strengthen the overview strip into a featured overview band**

Refine `ServiceStrip` so it feels like a premium navigation or proof band rather than a filler bridge between hero and details.

```css
.root {
  background: #0f2238;
  color: white;
  border-radius: 1.75rem;
  box-shadow: var(--surface-featured-shadow);
}
```

- [ ] **Step 3: Promote each service section into a featured offer block**

Modify `ServicesDetailSection.tsx` so the actual service `title` is visible and dominant instead of relying only on `intro` and `offerTitle`.

```tsx
<div className={styles.copy}>
  <p className={styles.kicker}>Service</p>
  <h2 className={styles.title}>{service.title}</h2>
  <p className={styles.intro}>{service.intro}</p>
  <p className={styles.text}>{service.copy}</p>
  <h3 className={styles.offer}>{service.offerTitle}</h3>
  <ul className={styles.list}>...</ul>
</div>
```

- [ ] **Step 4: Differentiate alternating service rows by composition, not only order**

Give odd and even sections different visual emphasis through media framing, background tint, or copy anchoring while keeping one system.

```css
.rowFeatured {
  background: linear-gradient(180deg, #f6f8fc 0%, #fff 100%);
}

.media {
  border-radius: 2rem;
  box-shadow: var(--surface-featured-shadow);
}
```

- [ ] **Step 5: Verify the page in browser and build**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/services | Select-Object -ExpandProperty StatusCode
npm run build
```

Expected: `/services` returns `200`; build passes.

## Task 5: Redesign The Talent Page Sections

**Files:**
- Modify: `src/components/organisms/talent/TalentHero.tsx`
- Modify: `src/components/organisms/talent/TalentHero.module.css`
- Modify: `src/components/organisms/talent/TalentPool.tsx`
- Modify: `src/components/organisms/talent/TalentPool.module.css`
- Modify as needed:
  - `src/components/molecules/Card/TalentCard.tsx`
  - `src/components/molecules/Card/TalentCard.module.css`
  - `src/components/molecules/content/SectionIntro.tsx`
  - `src/components/molecules/content/SectionIntro.module.css`

- [ ] **Step 1: Upgrade the hero from product intro to premium capability showcase**

Keep the stats and CTA structure, but make the hero feel more curated and less utility-first.

```css
.root {
  padding-block: var(--section-space-xl);
  background:
    radial-gradient(circle at top left, rgba(53, 141, 240, 0.16), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%);
}

.stats {
  gap: 1rem;
}

.statItem {
  border-radius: 1rem;
  box-shadow: var(--surface-soft-shadow);
}
```

- [ ] **Step 2: Remove visibly internal framing while preserving structure**

Keep the same section flow, but remove UI cues that make the page feel mocked or provisional. Do this through layout and component treatment, not wording changes.

```tsx
<div className={styles.features}>
  {features.map((feature) => (
    <article className={styles.featureCard}>...</article>
  ))}
</div>
```

```css
.featureCard {
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}
```

- [ ] **Step 3: Make the talent directory feel like a premium product surface**

Refine the filter sidebar, search row, and cards so they feel more productized and less like stacked controls.

```css
.layout {
  grid-template-columns: 18rem 1fr;
  gap: 2rem;
}

.sidebar {
  border-radius: 1.25rem;
  box-shadow: var(--surface-soft-shadow);
}

.grid {
  gap: 1.25rem;
}
```

- [ ] **Step 4: Tighten repeated directory UI into one component language**

Bring pills, inputs, active filters, and load-more controls onto one radius, border, and emphasis system.

```css
.pill,
.autoSuggestItem,
.quickSearch,
.clearInline {
  border-radius: 999px;
  min-height: 2.5rem;
}
```

- [ ] **Step 5: Verify the page in browser and build**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/talent | Select-Object -ExpandProperty StatusCode
npm run build
```

Expected: `/talent` returns `200`; build passes.

## Task 6: Redesign The Careers Page Sections

**Files:**
- Modify: `src/components/organisms/careers/CareersHero.tsx`
- Modify: `src/components/organisms/careers/CareersHero.module.css`
- Modify: `src/components/organisms/careers/CareersValuesSection.tsx`
- Modify: `src/components/organisms/careers/CareersValuesSection.module.css`
- Modify: `src/components/organisms/careers/CareersPrivacySection.tsx`
- Modify: `src/components/organisms/careers/CareersPrivacySection.module.css`
- Modify: `src/components/organisms/careers/CareersJobSidebar.tsx`
- Modify: `src/components/organisms/careers/CareersJobSidebar.module.css`
- Optional create:
  - `src/components/organisms/careers/CareersOpportunitiesSection.tsx`
  - `src/components/organisms/careers/CareersOpportunitiesSection.module.css`
- Modify if opportunities are moved inline:
  - `src/app/careers/CareersPageClient.tsx`

- [ ] **Step 1: Rebuild the hero into one cohesive recruiting lead section**

Keep the existing content blocks, but make the hero, supporting proof cards, and CTA row read as one narrative unit.

```css
.root {
  padding-block: var(--section-space-xl) var(--section-space-lg);
}

.columns {
  margin-top: 2rem;
  gap: 1.5rem;
}

.infoCard {
  transform: none;
}
```

- [ ] **Step 2: Remove decorative hover scale from informational cards**

Keep subtle hover polish only if it does not change layout or make static information feel clickable.

```css
.infoCard,
.card {
  transition: box-shadow 180ms ease, border-color 180ms ease;
}

.infoCard:hover,
.card:hover {
  box-shadow: var(--surface-featured-shadow);
}
```

- [ ] **Step 3: Make culture, benefits, and privacy feel like one recruiting story**

Use shared section-intro spacing, shared card styling, and consistent visual weight between `CareersValuesSection` and `CareersPrivacySection`.

```css
.sectionTitle {
  font-size: clamp(2.2rem, 4vw, 3.8rem);
}

.card {
  border-radius: 1.25rem;
  box-shadow: var(--surface-soft-shadow);
}
```

- [ ] **Step 4: Re-evaluate the opportunities experience**

If the sidebar still feels like a utility overlay after the rest of the redesign, move the job list inline into a page section and keep overlay behavior only for detail views.

```tsx
{jobs.length > 0 ? (
  <section className={styles.jobsSection}>
    <div className={styles.jobsGrid}>
      {jobs.map((job) => (
        <article key={job.id} className={styles.jobCard}>...</article>
      ))}
    </div>
  </section>
) : null}
```

- [ ] **Step 5: Verify the page in browser and build**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/careers | Select-Object -ExpandProperty StatusCode
npm run build
```

Expected: `/careers` returns `200`; build passes.

## Task 7: Cross-Page QA And Visual Verification

**Files:**
- Modify if needed based on QA findings:
  - `src/app/globals.css`
  - any of the four-page component files above
- Create if missing: `reports/playwright/2026-05-01-four-page-redesign-notes.md`

- [ ] **Step 1: Run full lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands PASS.

- [ ] **Step 2: Capture desktop and mobile screenshots with repo-local Playwright**

Run:

```powershell
npx playwright screenshot --browser=chromium --device="Desktop Chrome" http://localhost:3000/about reports/playwright/about-desktop.png
npx playwright screenshot --browser=chromium --device="iPhone 13" http://localhost:3000/about reports/playwright/about-mobile.png
npx playwright screenshot --browser=chromium --device="Desktop Chrome" http://localhost:3000/services reports/playwright/services-desktop.png
npx playwright screenshot --browser=chromium --device="iPhone 13" http://localhost:3000/services reports/playwright/services-mobile.png
npx playwright screenshot --browser=chromium --device="Desktop Chrome" http://localhost:3000/talent reports/playwright/talent-desktop.png
npx playwright screenshot --browser=chromium --device="iPhone 13" http://localhost:3000/talent reports/playwright/talent-mobile.png
npx playwright screenshot --browser=chromium --device="Desktop Chrome" http://localhost:3000/careers reports/playwright/careers-desktop.png
npx playwright screenshot --browser=chromium --device="iPhone 13" http://localhost:3000/careers reports/playwright/careers-mobile.png
```

Expected: eight screenshots are created without browser-launch errors.

- [ ] **Step 3: Record pass/fail notes against the approved spec**

Write `reports/playwright/2026-05-01-four-page-redesign-notes.md` with these headings:

```md
# Four Page Redesign QA

## About
- Hero quality:
- Section contrast:
- CTA clarity:

## Services
- Hero quality:
- Service scanability:
- CTA clarity:

## Talent
- Hero credibility:
- Directory quality:
- CTA clarity:

## Careers
- Hero cohesion:
- Opportunity visibility:
- CTA clarity:
```

- [ ] **Step 4: Fix any issues found in screenshots, then rerun the exact failing capture**

Run the same `npx playwright screenshot --browser=chromium ...` command for whichever page failed review.

Expected: replacement screenshot shows corrected layout or hierarchy.

## Notes For Implementers

- Do not commit unless the user explicitly says `create checkpoint commit`.
- Do not expand scope into copywriting, navigation redesign, or non-target pages.
- Preserve useful existing sections when they already support the page goal.
- If a section is redundant after redesign, merge or remove it rather than preserving it out of habit.

## Self-Review

### Spec coverage

- Shared visual system: covered by Tasks 2 through 7
- About redesign: covered by Task 3
- Services redesign: covered by Task 4
- Talent redesign: covered by Task 5
- Careers redesign: covered by Task 6
- Mobile and desktop verification: covered by Task 7
- Compile blocker prerequisite: covered by Task 1

No coverage gaps found.

### Placeholder scan

Checked for `TBD`, `TODO`, vague “handle this later” language, and missing verification commands. None remain.

### Type consistency

- The plan consistently refers to the four target pages as `About`, `Services`, `Talent`, and `Careers`
- Shared token work stays in `globals.css`
- Opportunities restructuring, if needed, is consistently routed through `CareersPageClient.tsx` and an optional `CareersOpportunitiesSection`

No naming conflicts found.
