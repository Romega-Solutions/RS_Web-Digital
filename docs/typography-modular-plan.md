# Typography Modular Plan

This note captures the modular typography cleanup that can be applied later without changing the current UI right now.

## Goal

Move repeated typography values out of individual section blocks in `src/app/globals.css` and into a small reusable token system.

## Suggested Tokens

Add these to `:root` when ready:

```css
--type-display-xl: clamp(3.4rem, 7vw, 6rem);
--type-display-lg: clamp(2.8rem, 5.4vw, 5rem);
--type-display-md: clamp(2.35rem, 4.2vw, 3.9rem);
--type-display-sm: clamp(2rem, 3.2vw, 3rem);
--type-heading-lg: clamp(1.9rem, 2.6vw, 2.8rem);
--type-heading-md: clamp(1.45rem, 2vw, 2rem);
--type-heading-sm: clamp(1.15rem, 1.4vw, 1.5rem);
--type-body-lg: clamp(1.08rem, 1.45vw, 1.35rem);
--type-body-md: clamp(1rem, 1.1vw, 1.12rem);
--type-body-sm: clamp(0.92rem, 0.95vw, 1rem);
--type-body-xs: clamp(0.78rem, 0.8vw, 0.88rem);
--leading-display: 0.94;
--leading-heading: 1;
--leading-copy: 1.22;
--tracking-display: -0.03em;
--tracking-heading: -0.015em;
```

## Suggested Grouping

Instead of repeating sizes in each component block, group recurring patterns:

- Display titles:
  - `.home-hero__headline`
  - `.growth-title`
  - `.approach-title`

- Large section titles:
  - `.about-hero-title`
  - `.about-mission-title`
  - `.services-hero-title`
  - `.careers-section-title`
  - `.social-connect-title`

- Standard section titles:
  - `.about-partners-title`
  - `.about-experts-title`
  - `.services-consultation-title`
  - `.contact-page-title`
  - `.about-growth-title`

- Long-form body copy:
  - `.about-hero-text`
  - `.about-mission-copy`
  - `.about-partners-copy`
  - `.services-hero-copy`
  - `.careers-section-copy`
  - `.social-connect-text`

- Small labels and uppercase UI:
  - `.site-nav__cta`
  - `.team-carousel__role`
  - `.talent-card__category`
  - `.careers-hero-kicker`

## Recommended Approach

1. Add the token set to `:root`.
2. Create grouped selectors for recurring title, copy, and label patterns.
3. Remove one-off `font-size`, `line-height`, and `tracking` declarations only after verifying the grouped rules visually.
4. Leave special-case sections alone if they are intentionally different.

## Reason

This keeps `src/app/globals.css` easier to maintain and reduces typography drift between sections without forcing a redesign all at once.
