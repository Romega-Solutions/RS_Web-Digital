// Plain-text rule for the Contact message: printable ASCII (0x20-0x7E) plus
// line breaks. Smart quotes, dashes and the ellipsis are turned into their
// ASCII look-alikes first, so pasted Word or phone text keeps its meaning;
// everything else (emoji, symbols, control characters) is removed.

export const MESSAGE_MAX_LENGTH = 2000;
export const MESSAGE_FILTER_NOTICE = "Emoji and special symbols were removed.";

const LOOK_ALIKES: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201A\u2032]/g, "'"],
  [/[\u201C\u201D\u201E\u2033]/g, '"'],
  [/[\u2012\u2013\u2014\u2015]/g, "-"],
  [/\u2026/g, "..."],
  [/[\t\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " "],
];

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function filterPlainText(
  input: string,
  maxLength: number = MESSAGE_MAX_LENGTH,
): { text: string; removed: boolean } {
  let text = normalizeLineBreaks(input);
  for (const [pattern, replacement] of LOOK_ALIKES) {
    text = text.replace(pattern, replacement);
  }
  const stripped = text.replace(/[^\x20-\x7E\n]/g, "");
  return { text: stripped.slice(0, maxLength), removed: stripped.length !== text.length };
}

/** True when the value already follows the rule (used by the server). */
export function isPlainText(value: string): boolean {
  return /^[\x20-\x7E\n]*$/.test(normalizeLineBreaks(value));
}

export function formatCounter(length: number, maxLength: number = MESSAGE_MAX_LENGTH): string {
  return `${length} / ${maxLength}`;
}
