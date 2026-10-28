// Plain-text rule for the Contact message. Letters in any language, accents,
// digits, punctuation, currency signs and math symbols all stay. Only emoji,
// pictographs and invisible characters are removed (emoji and flag sequences
// go in one piece, so no stray joiners or selectors are left behind). The
// zero-width joiner and non-joiner stay inside words, where scripts such as
// Persian, Sinhala, Bengali and Hindi need them.
// Smart quotes, dashes and the ellipsis are turned into their ASCII look-alikes
// first, so pasted Word or phone text keeps its meaning.
//
// This file is the only place that decides what a message may contain. The
// Contact page filters with it as the visitor types, and /api/contact uses
// isPlainText() to apply the same rule.

export const MESSAGE_MAX_LENGTH = 2000;
export const MESSAGE_FILTER_NOTICE = "Emoji were removed.";
export const MESSAGE_REJECTED = "Message can't contain emoji or hidden characters. Please remove them and try again.";

const LOOK_ALIKES: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201A\u2032]/g, "'"],
  [/[\u201C\u201D\u201E\u2033]/g, '"'],
  [/[\u2012\u2013\u2014\u2015]/g, "-"],
  [/\u2026/g, "..."],
  [/[\t\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " "],
  [/[\u2028\u2029]/g, "\n"],
];

// What is not allowed:
// - keycap sequences ("1", FE0F, 20E3) as a whole, then any lone emoji selector (FE0F) or keycap mark
// - regional indicators (flags), skin-tone modifiers and tag characters
// - pictographs, except the text marks (c), (R) and TM
// - control characters (except the line break), format characters such as the
//   zero-width space, and private-use and surrogate code points. The left-to-right
//   and right-to-left marks (200E, 200F) and the soft hyphen stay: they are used
//   in Arabic, Hebrew and mixed text.
// Unassigned code points are not checked, because the browser and the server
// can disagree about which characters are assigned.
const DISALLOWED = new RegExp(
  [
    "[0-9#*]\\uFE0F?\\u20E3",
    "[\\uFE0F\\u20E3]",
    "\\p{Regional_Indicator}",
    "\\p{Emoji_Modifier}",
    "(?![\\u00A9\\u00AE\\u2122])\\p{Extended_Pictographic}",
    "(?![\\n\\t])\\p{Cc}",
    "(?![\\u200C-\\u200F\\u00AD])[\\p{Cf}\\p{Co}\\p{Cs}]",
    // Depends on the neighbours, see removeDisallowed(): the joiners and the
    // other variation selectors (text style and CJK variants).
    "[\\u200C\\u200D\\uFE00-\\uFE0E\\u{E0100}-\\u{E01EF}]",
  ].join("|"),
  "gu",
);

const CONTEXT_CHARACTER = /^[\u200C\u200D\uFE00-\uFE0E\u{E0100}-\u{E01EF}]$/u;
const LETTER_OR_MARK = /^[\p{L}\p{M}]$/u;
const JOINER = /^[\u200C\u200D]$/;
const PICTOGRAPH_START = /^\p{Extended_Pictographic}/u;

// The code point just before position `index`.
function codePointBefore(text: string, index: number): string {
  if (index <= 0) return "";
  const pair = text.slice(Math.max(0, index - 2), index);
  return Array.from(pair).pop() ?? "";
}

// A joiner (ZWJ, ZWNJ) is a real character inside words in Persian, Sinhala,
// Bengali, Malayalam, Hindi and others, so it stays after a letter or mark. It
// goes inside emoji sequences, after a variation selector and before a
// pictograph. A CJK variation selector stays after a letter or mark; after
// anything else (an emoji, a space) it is a stray selector and goes.
function keepContextCharacter(match: string, index: number, text: string): boolean {
  const before = codePointBefore(text, index);
  const afterLetter = LETTER_OR_MARK.test(before) && !/^[\uFE00-\uFE0F\u20E3]$/.test(before);
  if (!afterLetter) return false;
  if (JOINER.test(match) && PICTOGRAPH_START.test(text.slice(index + 1, index + 3))) return false;
  return true;
}

function removeDisallowed(text: string): string {
  return text.replace(DISALLOWED, (match: string, index: number, whole: string) => {
    if (CONTEXT_CHARACTER.test(match) && keepContextCharacter(match, index, whole)) return match;
    return "";
  });
}

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

// Cuts at a character boundary so a surrogate pair is never split in half.
function limit(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const code = text.charCodeAt(maxLength - 1);
  const cutInPair = code >= 0xd800 && code <= 0xdbff;
  return text.slice(0, cutInPair ? maxLength - 1 : maxLength);
}

export function filterPlainText(
  input: string,
  maxLength: number = MESSAGE_MAX_LENGTH,
): { text: string; removed: boolean } {
  let text = normalizeLineBreaks(input);
  for (const [pattern, replacement] of LOOK_ALIKES) {
    text = text.replace(pattern, replacement);
  }
  const stripped = removeDisallowed(text);
  return { text: limit(stripped, maxLength), removed: stripped.length !== text.length };
}

/** True when the value already follows the rule (used by the server). */
export function isPlainText(value: string): boolean {
  const text = normalizeLineBreaks(value);
  return removeDisallowed(text).length === text.length;
}

export function formatCounter(length: number, maxLength: number = MESSAGE_MAX_LENGTH): string {
  return `${length} / ${maxLength}`;
}
