# Seasons Font Setup

This note records the Seasons font setup that was verified to load correctly in this project before the UI was reverted back to `Times New Roman`.

## Working Asset

- Webfont folder: `public/season-webfont`
- Active webfont file tested successfully: `public/season-webfont/Season-BF651e732546f7d.woff`
- Bundled stylesheet metadata in `public/season-webfont/style.css` declares the family as `Season Regular`

## Working Next.js Setup

The font worked when loaded with `next/font/local` from `src/app/layout.tsx` like this:

```ts
const seasonsStyle = localFont({
  src: [
    {
      path: "../../public/season-webfont/Season-BF651e732546f7d.woff",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-seasons-style",
  adjustFontFallback: false,
});
```

And then applied directly in CSS with:

```css
font-family: var(--font-seasons-style);
```

## Important Note

The Seasons asset currently available in the repo is a single regular face. If bold or semibold variants are needed, matching font files should be added and registered as additional `src` entries in `next/font/local`.

## Current State

The application has been reverted to `Times New Roman` for heading usage, but the Seasons loader remains available in `src/app/layout.tsx` for future reactivation.
