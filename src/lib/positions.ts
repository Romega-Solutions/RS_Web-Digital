// Server-side reads of the portal `positions` table.
//
// Selects `slug` when the column exists. If it is missing or null, slugs
// are derived with the same rules as the portal backfill (see position-slug).

import { cache } from "react";
import { getTicketingSupabase } from "@/lib/supabase";
import {
  assignPositionSlugs,
  classifyPositionsError,
  decideApplyRoute,
  isSafePositionSlug,
  parsePositionId,
  readStoredSlug,
  type SlugSource,
} from "@/lib/position-slug";

const BASE_COLUMNS = "id, job_title, client, location, job_description, employment_type, is_open";
const LIST_COLUMNS = `${BASE_COLUMNS}, created_at`;
const PAGE_SIZE = 1000;
const MAX_ROWS = 5000;
const SLUG_RETRY_MS = 60_000;

export type PublicPosition = {
  id: number;
  job_title: string;
  client: string | null;
  location: string | null;
  job_description: string | null;
  employment_type: string | null;
  is_open: boolean;
  resolvedSlug: string;
};

export type ResolveApplyResult =
  | { status: "not_configured" }
  | { status: "not_found" }
  | { status: "redirect"; path: string; position: PublicPosition }
  | { status: "ok"; position: PublicPosition };

type RawPosition = SlugSource & {
  client: string | null;
  location: string | null;
  job_description: string | null;
  employment_type?: string | null;
  is_open: boolean;
  created_at?: string;
};

type PositionsError = { code?: string | null; message?: string | null };

class PositionsTableMissingError extends Error {
  constructor() {
    super("positions table is not available");
    this.name = "PositionsTableMissingError";
  }
}

let slugColumnAvailable = true;
let slugColumnRetryAt = 0;

function canSelectSlug(): boolean {
  if (slugColumnAvailable) return true;
  if (Date.now() >= slugColumnRetryAt) {
    slugColumnAvailable = true;
    return true;
  }
  return false;
}

function noteSlugColumnMissing(): void {
  if (slugColumnAvailable) {
    console.warn(
      "[positions] positions.slug is missing; deriving apply slugs from job_title until the column exists.",
    );
  }
  slugColumnAvailable = false;
  slugColumnRetryAt = Date.now() + SLUG_RETRY_MS;
}

function toPublic(row: RawPosition & { resolvedSlug: string }): PublicPosition {
  return {
    id: row.id,
    job_title: row.job_title,
    client: row.client,
    location: row.location,
    job_description: row.job_description,
    employment_type: row.employment_type ?? null,
    is_open: row.is_open,
    resolvedSlug: row.resolvedSlug,
  };
}

function handleQueryError(error: PositionsError, includeSlug: boolean): "retry_without_slug" {
  const kind = classifyPositionsError(error);
  if (kind === "missing_slug" && includeSlug) {
    noteSlugColumnMissing();
    return "retry_without_slug";
  }
  if (kind === "missing_table") throw new PositionsTableMissingError();
  throw new Error(error.message || "positions query failed");
}

async function fetchAllPositions(includeSlug: boolean): Promise<RawPosition[]> {
  const supabase = getTicketingSupabase();
  const columns = includeSlug ? `${LIST_COLUMNS}, slug` : LIST_COLUMNS;
  const rows: RawPosition[] = [];

  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("positions")
      .select<string, RawPosition>(columns)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (handleQueryError(error, includeSlug) === "retry_without_slug") {
        return fetchAllPositions(false);
      }
    }

    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

async function fetchRawById(id: number): Promise<RawPosition | null> {
  const supabase = getTicketingSupabase();
  const includeSlug = canSelectSlug();
  const columns = includeSlug ? `${BASE_COLUMNS}, slug` : BASE_COLUMNS;
  const { data, error } = await supabase
    .from("positions")
    .select<string, RawPosition>(columns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (handleQueryError(error, includeSlug) === "retry_without_slug") {
      return fetchRawById(id);
    }
  }

  return data ?? null;
}

async function fetchRawByStoredSlug(slug: string): Promise<RawPosition | null> {
  if (!canSelectSlug()) return null;
  const supabase = getTicketingSupabase();
  const { data, error } = await supabase
    .from("positions")
    .select<string, RawPosition>(`${BASE_COLUMNS}, slug`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (handleQueryError(error, true) === "retry_without_slug") return null;
  }

  return data ?? null;
}

async function withResolvedSlug(row: RawPosition): Promise<PublicPosition> {
  if (readStoredSlug(row.slug)) {
    return toPublic(assignPositionSlugs([row])[0]);
  }
  const all = await fetchAllPositions(canSelectSlug());
  const match = assignPositionSlugs(all).find((item) => item.id === row.id);
  if (match) return toPublic(match);
  return toPublic(assignPositionSlugs([row])[0]);
}

async function findByDerivedSlug(slug: string): Promise<PublicPosition | null> {
  const all = await fetchAllPositions(canSelectSlug());
  const match = assignPositionSlugs(all).find((row) => row.resolvedSlug === slug);
  return match ? toPublic(match) : null;
}

function topOpen(rows: Array<RawPosition & { resolvedSlug: string }>): PublicPosition[] {
  return rows
    .filter((row) => row.is_open)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 200)
    .map(toPublic);
}

export async function fetchOpenPositionRecords(): Promise<PublicPosition[]> {
  const supabase = getTicketingSupabase();
  const includeSlug = canSelectSlug();
  const columns = includeSlug ? `${LIST_COLUMNS}, slug` : LIST_COLUMNS;
  const { data, error } = await supabase
    .from("positions")
    .select<string, RawPosition>(columns)
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (handleQueryError(error, includeSlug) === "retry_without_slug") {
      return topOpen(assignPositionSlugs(await fetchAllPositions(false)));
    }
  }

  const openRows = data ?? [];
  if (includeSlug && openRows.every((row) => readStoredSlug(row.slug))) {
    return assignPositionSlugs(openRows).map(toPublic);
  }

  const assigned = new Map(
    assignPositionSlugs(await fetchAllPositions(canSelectSlug())).map((row) => [
      row.id,
      toPublic(row),
    ]),
  );
  // Keep the created_at ordering from the open-roles query.
  return openRows.flatMap((row) => {
    const position = assigned.get(row.id);
    return position ? [position] : [];
  });
}

export const resolveApplyPosition = cache(async (param: string): Promise<ResolveApplyResult> => {
  try {
    const id = parsePositionId(param);
    if (id != null) {
      const row = await fetchRawById(id);
      if (row) {
        const position = await withResolvedSlug(row);
        const decision = decideApplyRoute(param, position);
        if (decision.kind === "redirect") {
          return { status: "redirect", path: decision.path, position };
        }
        return { status: "ok", position };
      }
    }

    if (id == null && !isSafePositionSlug(param)) return { status: "not_found" };

    const stored = await fetchRawByStoredSlug(param);
    if (stored) {
      return { status: "ok", position: await withResolvedSlug(stored) };
    }

    const derived = await findByDerivedSlug(param);
    if (!derived) return { status: "not_found" };
    const decision = decideApplyRoute(param, derived);
    if (decision.kind === "redirect") {
      return { status: "redirect", path: decision.path, position: derived };
    }
    return { status: "ok", position: derived };
  } catch (err) {
    console.error(
      "[apply] resolveApplyPosition failed:",
      err instanceof Error ? err.message : err,
    );
    return { status: "not_configured" };
  }
});
