# RS Web Digital Four-Page Design Refinement

Date: 2026-05-01
Scope: `About`, `Services`, `Talent`, `Careers`
Status: Approved design direction, ready for implementation planning

## Objective

Refine the four priority pages so they feel like one premium digital-marketing website while preserving the current page purposes and most of the useful section map.

This is not a full brand reset and not a cosmetic polish pass. It is a selective section-by-section redesign:

- every existing section is reviewed
- sections that already serve the page well can stay
- sections that feel weak can be recomposed
- sections that are redundant can be merged or removed
- wording and core page copy are out of scope for this spec

## Constraints

- Scope is limited to `About`, `Services`, `Talent`, and `Careers`
- Do not expand this spec into header, navigation, footer, or other pages
- Do not rewrite page wording or messaging
- Keep the Romega brand identity intact
- Preserve the functional purpose of each page
- Improve each section only when the redesign adds real value

## Design Direction

The target is a premium campaign-style presentation tuned for a digital-marketing company.

The pages should feel:

- sharper and more current than a generic consulting site
- more persuasive and image-led than the current build
- more premium through composition, contrast, and pacing
- less dependent on generic white cards and repeated neutral section bands

The pages should not feel:

- flashy for its own sake
- like four unrelated templates
- like a SaaS dashboard
- like a lifestyle editorial site

## Shared Visual System

All four pages should move onto one consistent visual system.

### Hero treatment

- Use stronger first-screen composition on every page
- Prefer image-led or high-contrast branded hero treatments
- Keep text left-aligned by default
- Allow one primary CTA and one secondary CTA max
- Make the hero feel campaign-grade, not template-grade

### Section rhythm

- Increase contrast between section types
- Avoid long runs of visually similar white sections
- Alternate text-led, image-led, and proof-led sections where appropriate
- Use fewer medium-emphasis sections stacked with identical spacing

### Surface language

- Reduce dependence on generic white cards
- Use larger featured panels where a section needs weight
- Reserve repeated cards for truly repeated content such as values, benefits, profiles, or roles
- Limit elevation styles to one subtle surface level and one stronger featured level

### Imagery

- Treat imagery as campaign support, not decoration inside a box
- Use stronger framing, better aspect-ratio discipline, and more intentional contrast
- Let some sections be image-dominant and others text-dominant
- Avoid repeating the same image-left plus text-right pattern too mechanically

### Motion

- Keep motion restrained
- Remove unnecessary scale effects from informational cards
- Favor fade, slight lift, and controlled reveal only where it improves hierarchy

### CTA system

- Keep CTA treatment consistent across the four pages
- One dominant action per major section
- Secondary actions should be visually subordinate
- CTA rows should align consistently from page to page

## Layout And Spacing Rules

### Layout

- Use a more cinematic page rhythm with stronger hero presence
- Use wider visual containers for image-led sections
- Keep text columns within readable measures
- Prefer asymmetrical layouts for premium feel
- Reserve centered composition for narrow moments such as closing CTA bands

### Spacing

- Use only three spacing tiers:
  - hero spacing
  - primary section spacing
  - compact supporting section spacing
- Build deliberate breathing moments into each page
- Let some sections carry the experience through image or scale instead of density

### Hierarchy

- Each section must have a clearer dominant element
- Remove cases where headline, body, image, and CTA all compete equally
- Strengthen section transitions so users can tell when they have moved into a new narrative layer

## Page-Specific Guidance

### About

Role:
Brand authority and operating philosophy.

Guidance:

- Keep the page as the brand-trust page
- Redesign the hero so it feels less like an isolated blue promo block
- Make the page feel more premium and authoritative
- Ensure existing sections feel visually distinct from one another
- Alternate section types more deliberately:
  - image-led
  - text-led
  - proof-led
  - partner or credibility section
- Avoid a sequence of similarly weighted content bands

Success condition:
The page feels brand-defining, polished, and confident.

### Services

Role:
Commercial capability page.

Guidance:

- Keep the current service-page purpose and service breakdown concept
- Redesign the hero so it communicates capability immediately
- Make the overview strip more intentional and more premium
- Improve service-section scanability with stronger anchors and service identity
- Each service section should feel like a featured offer, not a repeated template row
- Use image and layout treatment to give each offer more presence

Success condition:
This becomes the strongest commercial page of the four.

### Talent

Role:
Capability showcase and browsing surface.

Guidance:

- Keep the talent directory, filters, and browsing purpose
- Redesign the hero so the page feels premium before the grid begins
- Treat the directory as a high-value product surface
- Improve the transition from persuasion into exploration
- Make stats, proof elements, filters, and cards feel part of one system
- Increase trust and curation cues through layout and presentation rather than text changes

Success condition:
The page feels curated, credible, and productized.

### Careers

Role:
Employer-brand and opportunity page.

Guidance:

- Keep the current role around culture, privacy, and opportunities
- Redesign the hero so it feels more cohesive and intentional
- Make culture, benefits, and privacy read as one recruiting story
- Give opportunities stronger destination value
- Reduce the sense that the page is assembled from separate widgets
- Keep the experience premium and modern without becoming a generic careers microsite

Success condition:
The page feels cohesive, premium, and easier to act on.

## Cross-Page Quality Rules

- No page should feel built from a different design language
- Page differences should come from emphasis, not from conflicting layout logic
- Repeated components should use one shared styling language
- Hero readability must hold across desktop and mobile
- No section should feel visually redundant beside the one before or after it

## Success Criteria

The redesign is successful only if it improves both visual quality and page clarity without breaking the core role of each page.

### Global pass criteria

- The four pages clearly feel like one premium digital-marketing website
- Each page has a stronger first-screen impression than the current version
- Section transitions feel more deliberate and less repetitive
- The main action on each page is easier to identify quickly
- Visual hierarchy improves without rewriting the current page copy
- Premium quality comes from composition, contrast, imagery, and pacing rather than decorative effects

### Page-level pass criteria

- `About` feels more authoritative and brand-defining
- `Services` becomes easier to scan and more commercially persuasive
- `Talent` feels more credible, curated, and productized
- `Careers` feels more cohesive and makes opportunities easier to reach

### UX checks

- Mobile and desktop layouts both hold the same visual system
- Hero sections remain readable with their image or background treatments
- Button hierarchy is consistent across all four pages
- Repeated components stay within one shared styling language
- Hover and motion effects remain restrained

## Verification Requirements

Before calling the redesign complete:

1. Fix the current compile blocker so the pages can render locally
2. Review all four pages at mobile and desktop widths
3. Check first viewport quality, section rhythm, CTA visibility, and consistency across pages
4. Run build validation after implementation, not just lint

## Current Known Blocker

Local rendering is currently blocked by a Tailwind compile error in:

- `src/components/molecules/legal/LegalTableOfContents.module.css`

This is outside the four-page scope but must be resolved before visual verification can be trusted.
