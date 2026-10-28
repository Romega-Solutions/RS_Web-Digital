// Pure helpers for the country list that is drawn with a fixed position.
// They are kept apart from the component so the rules are easy to test.

export type Placement = { maxHeight: number; width: number; left: number; top: number };

/** Used when the site header's real height is not known. */
export const HEADER_FALLBACK_PX = 88;

/**
 * The header's height from the page's CSS variable (for example "88px"), or the
 * fallback when it is missing or is not a positive number.
 */
export function headerBottomFrom(value: string | null | undefined, fallback = HEADER_FALLBACK_PX): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * True when the list should close because its control has scrolled out of sight:
 * fully above or below the window, or up behind the sticky header (its bottom
 * edge is above the header's bottom edge), where the list would float over the header.
 */
export function shouldCloseList(
  control: { top: number; bottom: number },
  viewHeight: number,
  headerBottom: number,
): boolean {
  return control.bottom < headerBottom || control.top > viewHeight;
}

/** True when two placements are the same box, so the list needs no new render. */
export function samePlacement(a: Placement | null, b: Placement | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.maxHeight === b.maxHeight;
}
