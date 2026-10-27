// Caret and edit rules for the phone number box. Pure functions, so they can
// be tested without a browser. "Raw" means the text the browser holds right
// after the keystroke, before the formatter has added or removed spaces.

export type PhoneEdit = {
  /** Text to format (the keystroke may have been adjusted or undone). */
  raw: string;
  /** Caret in `raw`, counted in characters. */
  caret: number;
  /** True when the keystroke is refused and the previous text stays as it was. */
  rejected: boolean;
};

// What a visitor may type: digits, spaces, ( ) . - and +. Pasted text is not limited
// here, so a pasted "917abc" still shows up and turns the field red.
const TYPEABLE = /^[0-9\s().+-]*$/;

const isDigit = (char: string | undefined) => char !== undefined && char >= "0" && char <= "9";

export function digitsBefore(text: string, caret: number): number {
  return text.slice(0, caret).replace(/\D/g, "").length;
}

export function caretAfterDigits(text: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (isDigit(text[index])) seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return text.length;
}

/**
 * Works out what a keystroke should do.
 * - Backspace (or Delete) that only removes a formatter space or bracket removes the
 *   neighbouring digit instead, so the key always does something visible.
 * - A typed letter or symbol is refused and the caret stays where it was.
 * - Everything else (digits, paste, selections) passes through unchanged.
 */
export function resolvePhoneEdit(input: {
  previous: string;
  raw: string;
  caret: number;
  inputType?: string;
  data?: string | null;
}): PhoneEdit {
  const { previous, raw, caret, inputType, data } = input;
  const pass: PhoneEdit = { raw, caret, rejected: false };

  if (inputType === "insertText" && data && !TYPEABLE.test(data)) {
    return { raw: previous, caret: Math.max(0, caret - data.length), rejected: true };
  }

  const removedOne = previous.length === raw.length + 1;
  if (!removedOne) return pass;

  if (inputType === "deleteContentBackward") {
    const sameAround = raw.slice(0, caret) === previous.slice(0, caret) && raw.slice(caret) === previous.slice(caret + 1);
    if (!sameAround || isDigit(previous[caret])) return pass;
    for (let index = caret - 1; index >= 0; index -= 1) {
      if (isDigit(raw[index])) {
        return { raw: raw.slice(0, index) + raw.slice(index + 1), caret: index, rejected: false };
      }
    }
    return pass;
  }

  if (inputType === "deleteContentForward") {
    const sameAround = raw.slice(0, caret) === previous.slice(0, caret) && raw.slice(caret) === previous.slice(caret + 1);
    if (!sameAround || isDigit(previous[caret])) return pass;
    for (let index = caret; index < raw.length; index += 1) {
      if (isDigit(raw[index])) {
        return { raw: raw.slice(0, index) + raw.slice(index + 1), caret, rejected: false };
      }
    }
    return pass;
  }

  return pass;
}
