// Plain-text rule for the Contact message. Letters in any language, accents,
// digits, punctuation, currency signs and math symbols all stay. Only emoji,
// pictographs and invisible characters are removed (emoji and flag sequences
// go in one piece, so no stray joiners or selectors are left behind).
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
// - keycap sequences ("1", FE0F, 20E3) as a whole, then any lone selector or keycap mark
// - regional indicators (flags), skin-tone modifiers and tag characters
// - pictographs, except the text marks (c), (R) and TM
// - control characters (except the line break), format characters such as the
//   zero-width space and joiner, private-use and unassigned code points
const DISALLOWED = new RegExp(
  [
    "[0-9#*]\\uFE0F?\\u20E3",
    "[\\uFE00-\\uFE0F\\u20E3\\u{E0100}-\\u{E01EF}]",
    "\\p{Regional_Indicator}",
    "\\p{Emoji_Modifier}",
    "(?![\\u00A9\\u00AE\\u2122])\\p{Extended_Pictographic}",
    "(?![\\n\\t])\\p{Cc}",
    "[\\p{Cf}\\p{Co}\\p{Cn}\\p{Cs}]",
  ].join("|"),
  "gu",
);

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
  const stripped = text.replace(DISALLOWED, "");
  return { text: limit(stripped, maxLength), removed: stripped.length !== text.length };
}

/** True when the value already follows the rule (used by the server). */
export function isPlainText(value: string): boolean {
  DISALLOWED.lastIndex = 0;
  return !DISALLOWED.test(normalizeLineBreaks(value));
}

export function formatCounter(length: number, maxLength: number = MESSAGE_MAX_LENGTH): string {
  return `${length} / ${maxLength}`;
}
