// Slugs for public /apply/{slug} URLs.
//
// The portal adds a unique positions.slug, backfilled from job_title:
// lowercase, accents stripped, every run of non-alphanumerics (including
// em dashes) collapsed to one hyphen, then trimmed. When two titles share
// a base slug, rows are ordered by id and the 2nd/3rd become "-2"/"-3".
// Until that column exists (or a row's slug is null), derive the same way
// so links stay stable before and after the migration.

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PositionsErrorKind = "none" | "missing_slug" | "missing_table" | "other";

export type SlugSource = {
  id: number;
  job_title: string;
  slug?: string | null;
};

export type ApplyRouteDecision =
  | { kind: "not_found" }
  | { kind: "redirect"; path: string }
  | { kind: "render" };

export function isSafePositionSlug(value: string): boolean {
  return SAFE_SLUG.test(value);
}

export function readStoredSlug(slug: string | null | undefined): string | null {
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return isSafePositionSlug(trimmed) ? trimmed : null;
}

export function slugifyJobTitle(title: string): string {
  if (typeof title !== "string" || title.length === 0) return "";
  const stripped = title.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
  return stripped.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function baseSlug(row: SlugSource): string {
  return slugifyJobTitle(row.job_title) || `position-${row.id}`;
}

export function assignPositionSlugs<T extends SlugSource>(
  rows: readonly T[],
): Array<T & { resolvedSlug: string }> {
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const used = new Set<string>();

  for (const row of sorted) {
    const stored = readStoredSlug(row.slug);
    if (stored) used.add(stored);
  }

  const resolved = new Map<number, string>();
  for (const row of sorted) {
    const stored = readStoredSlug(row.slug);
    if (stored) {
      resolved.set(row.id, stored);
      continue;
    }

    const base = baseSlug(row);
    let slug = base;
    if (used.has(slug)) {
      let suffix = 2;
      while (used.has(`${base}-${suffix}`)) suffix += 1;
      slug = `${base}-${suffix}`;
    }
    used.add(slug);
    resolved.set(row.id, slug);
  }

  return rows.map((row) => ({
    ...row,
    resolvedSlug: resolved.get(row.id) ?? `position-${row.id}`,
  }));
}

/** Public careers/apply path. Always the slug, never the numeric id. */
export function positionApplyPath(resolvedSlug: string): string {
  return `/apply/${resolvedSlug}`;
}

/**
 * Application POST path. The ticketing API contract is the numeric id,
 * even when the page URL is a slug.
 */
export function applicationSubmitPath(positionId: number): string {
  if (!Number.isInteger(positionId) || positionId <= 0) {
    throw new Error("Application submit path requires a positive numeric position id.");
  }
  return `/api/apply/${positionId}`;
}

/** A canonical positive integer id, so "09" and "9 " stay slugs. */
export function parsePositionId(param: string): number | null {
  if (!/^[1-9]\d*$/.test(param)) return null;
  const id = Number(param);
  if (!Number.isSafeInteger(id)) return null;
  return id;
}

export function decideApplyRoute(
  param: string,
  position: { id: number; resolvedSlug: string } | null,
): ApplyRouteDecision {
  if (!position) return { kind: "not_found" };
  const id = parsePositionId(param);
  if (id != null && id === position.id && position.resolvedSlug !== param) {
    return { kind: "redirect", path: positionApplyPath(position.resolvedSlug) };
  }
  return { kind: "render" };
}

export function classifyPositionsError(
  error: { code?: string | null; message?: string | null } | null | undefined,
): PositionsErrorKind {
  if (!error) return "none";
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (!code && !message) return "none";

  const mentionsSlug = message.includes("slug");
  const missing =
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find");

  if (mentionsSlug && (code === "42703" || code === "PGRST204" || missing)) {
    return "missing_slug";
  }

  if (
    code === "42P01" ||
    code === "PGRST205" ||
    (!mentionsSlug &&
      missing &&
      (message.includes("relation") || message.includes("table") || message.includes("positions")))
  ) {
    return "missing_table";
  }

  return "other";
}
