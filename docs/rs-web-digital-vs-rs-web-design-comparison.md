# RS_Web-Digital vs RS_Web Design System Comparison

## Purpose

This document compares the current design system and styling approach of:

- **RS_Web-Digital** (`RS_Web-Digital`)
- **RS_Web** (`RS_Web/romega-next`)

Goal: identify what RS_Web does better for **spacing, typography, and style consistency**, then define a practical path to make RS_Web-Digital more unified.

---

## Scope and Sources Reviewed

### RS_Web-Digital

- `src/app/globals.css` (4193 lines)
- `src/app/layout.tsx`
- `design.md`
- `color-scheme.md`
- `docs/typography-modular-plan.md`
- `src/components/atoms/Button/Button.tsx`

### RS_Web

- `romega-next/app/globals.css` (223 lines)
- `romega-next/app/styles/styles.css` (881 lines)
- `romega-next/app/layout.tsx`
- `romega-next/docs/DESIGN_SYSTEM.md`
- `romega-next/components/atoms/Button/Button.tsx`
- `romega-next/components/atoms/Button/Button.module.css`

---

## Executive Summary

**RS_Web is more systemized and reusable**, while **RS_Web-Digital is more section-specific and monolithic**.

RS_Web has stronger design-system structure because it has:

1. Clear token namespace (`--rs-*`) and documented source-of-truth.
2. Better separation of global styles vs component styles.
3. Reusable, variant-driven component styling (especially buttons with BEM + module CSS).
4. More predictable responsive scaling patterns for key UI elements.

RS_Web-Digital currently has good brand intent and some root tokens, but consistency is reduced by large one-off CSS across many sections (mixed pixel/rem values, repeated font declarations, repeated local spacing rules).

---

## Side-by-Side Comparison

| Area | RS_Web-Digital | RS_Web | Impact |
|---|---|---|---|
| **Style architecture** | Mostly one large `globals.css` (4193 lines) with many section rules | Split across `globals.css` + `styles.css` + component module CSS | RS_Web is easier to maintain and scale |
| **Design-system documentation** | Brand docs exist (`design.md`, `color-scheme.md`) but no single implementation source of truth | Dedicated `docs/DESIGN_SYSTEM.md` tied directly to code tokens and components | RS_Web has clearer governance |
| **Color tokens** | Core tokens exist (`--color-primary`, etc.) | Structured ramps with `--rs-primary-50..950`, `--rs-accent-*`, `--rs-neutral-*` | RS_Web supports more consistent color usage and states |
| **Typography fonts** | Poppins + heading fallback to Times New Roman; Seasons loaded but not active | Source Sans 3 + Merriweather loaded and used consistently via variables | RS_Web is more coherent in production typography |
| **Typography system** | Many repeated `font-family` + one-off `font-size` declarations in sections | Utility presets + base heading/body rules + component-level patterns | RS_Web reduces drift better |
| **Spacing system** | Has base layout tokens but many hardcoded section paddings/margins | More predictable component-level spacing patterns and variant rules | RS_Web has better spacing consistency |
| **Component styling** | `AppButton` relies on passed className from callers | Button variants are centralized in `Button.module.css` (BEM modifiers) | RS_Web has stronger reusable primitives |
| **Responsive behavior** | Many local media-query blocks in large global file | Component-level responsive rules with reusable variant logic | RS_Web is easier to evolve safely |

---

## Key Findings for Typography and Spacing

## 1) Typography drift exists in RS_Web-Digital

RS_Web-Digital defines font tokens early, but still repeats font declarations heavily across section classes in `globals.css`.

- Design intent says heading style should be **The Seasons-style serif**, but runtime heading token is currently **Times New Roman**.
- Seasons font loader exists in `layout.tsx`, but current token points headings to Times New Roman.
- Many fixed pixel sizes (example patterns: `30px`, `22px`, `20px`, `14px`, `13px`) appear in section-specific rules, increasing inconsistency.

**Result:** typography hierarchy is less unified across pages and components.

## 2) Spacing system is partially tokenized but not enforced

RS_Web-Digital has useful high-level tokens:

- `--layout-gutter`
- `--layout-gutter-wide`
- `--section-space`
- `--section-space-compact`

But large parts of the stylesheet still use one-off spacing values (`padding`, `margin`, mixed px/rem in local blocks).

**Result:** visual rhythm varies section-by-section instead of following a stable spacing scale.

## 3) RS_Web has stronger primitive patterns

RS_Web’s `Button.module.css` centralizes variants (primary/secondary/navbar/social/footer-schedule), including responsive padding/height and state styles.

RS_Web-Digital’s button atom is structural (`AppButton`), but visual consistency depends on each caller’s custom classes.

**Result:** RS_Web is more consistent by default; RS_Web-Digital depends more on manual discipline.

---

## What RS_Web-Digital Should Adopt from RS_Web

## A. Make one implementation source-of-truth for design tokens

Create a design-system token layer (colors, typography, spacing, radius, elevation) and treat it as authoritative.

Recommended structure:

- `src/app/tokens.css` (or equivalent)
- Import into `globals.css`
- Keep section files consuming tokens only

## B. Standardize typography scale and roles

Define explicit type tokens and map them to roles:

- `display`, `h1`, `h2`, `h3`, `body-lg`, `body-md`, `label`, `caption`
- use consistent `line-height` and `letter-spacing` tokens

Use the existing `docs/typography-modular-plan.md` as the baseline and complete the rollout to all major sections.

## C. Enforce spacing scale usage

Introduce a spacing ramp and use it everywhere:

- Example: `--space-1` to `--space-10`
- replace one-off section paddings with scale values
- keep only rare exceptions for intentional art direction

## D. Move section-specific CSS out of global monolith

Refactor `globals.css` into:

1. reset/base
2. tokens/theme
3. layout primitives
4. component/section modules

This follows the RS_Web pattern where global files are lighter and component styles carry local complexity.

## E. Add variant-driven component primitives

Start with components that control most spacing/typography:

- Button
- Section wrappers
- Heading blocks
- Cards

The RS_Web button approach (variant modifiers + responsive rules in one place) is the right model.

---

## Priority Gap Matrix (for your redesign effort)

| Priority | Gap in RS_Web-Digital | Why it matters | Adopt from RS_Web |
|---|---|---|---|
| **P0** | Typography not fully unified (design intent vs active runtime heading usage) | Brand voice inconsistency | Variable-driven heading/body setup from layout + documented type presets |
| **P0** | Large global stylesheet with many one-off section rules | Hard to keep spacing/font consistent long-term | Split architecture (global + component/module styles) |
| **P1** | Spacing tokens exist but are not consistently applied | Uneven visual rhythm and padding | Component-level spacing rules and reusable variants |
| **P1** | Visual button styles not centralized in RS_Web-Digital atom | CTA inconsistency across pages | BEM/variant button system in module CSS |
| **P2** | No single design system implementation document in RS_Web-Digital | Harder onboarding and governance | `docs/DESIGN_SYSTEM.md` style documentation model |

---

## Practical Rollout Plan for RS_Web-Digital

1. **Token hardening**
   - Finalize typography + spacing token sets.
   - Keep naming stable and semantic.

2. **Primitive extraction**
   - Create reusable primitives for heading, section, button, card.
   - Route existing pages through these primitives.

3. **Global CSS decomposition**
   - Break `globals.css` into smaller focused style files.
   - Leave only true global rules in `globals.css`.

4. **Section migration**
   - Migrate highest-traffic pages first (Home, Services, About).
   - Replace one-off font/spacing declarations with tokens.

5. **Documentation alignment**
   - Add RS_Web-Digital equivalent of `DESIGN_SYSTEM.md`.
   - Keep docs synced with real CSS/token implementation.

---

## Final Recommendation

For better spacing and font unification in RS_Web-Digital, the most valuable move is not just changing values—it is adopting RS_Web’s **system structure**:

- token-first styling
- variant-driven component primitives
- smaller modular style files
- one living design-system document tied to implementation

Once that structure is in place, visual consistency (padding rhythm, typography hierarchy, button behavior) becomes sustainable instead of manual.
