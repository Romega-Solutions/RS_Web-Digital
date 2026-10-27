// Type-to-find for the country list. Pure: the caller passes the clock, so the
// rule is easy to test.
//
// - A letter jumps to the first country, A to Z, whose NAME starts with it.
// - More letters typed within TYPEAHEAD_IDLE_MS extend the search: P, H finds
//   Philippines; P, U finds Puerto Rico; P alone stays on Pakistan.
// - After the idle window the search starts over, so "PH", a pause, then "I"
//   finds Iceland, not "PHI".
// - Accents and case are ignored ("Aland" finds Åland Islands). The list stays
//   in its normal A to Z order.
// - A search that starts with a digit matches the calling code instead
//   ("63" finds Philippines).
// - Backspace shortens the search by one character.
// - A letter that matches nothing is ignored: the highlight stays where it was.

export const TYPEAHEAD_IDLE_MS = 3000;

export type TypeaheadItem = { name: string; callingCode: string };
export type TypeaheadState = { buffer: string; at: number };

export const TYPEAHEAD_START: TypeaheadState = { buffer: "", at: 0 };

/** Lower-case, without accents: "Åland Islands" -> "aland islands". */
export function foldText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const NAME_CHAR = /^[\p{L}\p{N} '’.\-]$/u;
const DIGIT = /^\p{N}$/u;

/** True while a search is running, so Space should extend it instead of selecting. */
export function isTypeaheadActive(state: TypeaheadState, now: number, idleMs = TYPEAHEAD_IDLE_MS): boolean {
  return state.buffer !== "" && now - state.at <= idleMs;
}

function matches(item: TypeaheadItem, buffer: string): boolean {
  if (DIGIT.test(buffer[0] ?? "")) return item.callingCode.startsWith(buffer);
  return foldText(item.name).startsWith(buffer);
}

/**
 * Applies one key press. Returns the next state and the first matching item
 * (null when the key is ignored or nothing matches).
 */
export function typeaheadStep<T extends TypeaheadItem>(
  state: TypeaheadState,
  key: string,
  now: number,
  items: readonly T[],
  idleMs = TYPEAHEAD_IDLE_MS,
): { state: TypeaheadState; match: T | null } {
  const running = isTypeaheadActive(state, now, idleMs);
  const base = running ? state.buffer : "";

  let next: string;
  if (key === "Backspace") {
    next = base.slice(0, -1);
  } else if (key.length >= 1 && [...key].length === 1 && NAME_CHAR.test(key)) {
    const char = foldText(key);
    if (char === " " && base === "") return { state, match: null };
    const startsAgain = base !== "" && DIGIT.test(char) !== DIGIT.test(base[0]);
    next = startsAgain ? char : base + char;
  } else {
    return { state, match: null };
  }

  if (next === "") return { state: { buffer: "", at: now }, match: null };
  const match = items.find((item) => matches(item, next)) ?? null;
  // No match: keep the old search (and the highlight), just restart the timer.
  return { state: { buffer: match ? next : base, at: now }, match };
}
