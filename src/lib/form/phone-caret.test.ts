import assert from "node:assert/strict";
import test from "node:test";
import { formatPhoneInput } from "./phone.ts";
import { caretAfterDigits, digitsBefore, resolvePhoneEdit } from "./phone-caret.ts";

// Plays a keystroke through the same steps the phone box uses and returns the
// resulting text and caret.
function press(previous: string, raw: string, caret: number, inputType: string, data: string | null = null) {
  const edit = resolvePhoneEdit({ previous, raw, caret, inputType, data });
  if (edit.rejected) return { value: previous, caret: edit.caret, rejected: true };
  const next = formatPhoneInput(edit.raw, "PH");
  const position =
    next.value === edit.raw ? edit.caret : caretAfterDigits(next.value, digitsBefore(edit.raw, edit.caret));
  return { value: next.value, caret: position, rejected: false };
}

test("counts digits before the caret and finds the caret after N digits", () => {
  assert.equal(digitsBefore("917 555 1234", 4), 3);
  assert.equal(digitsBefore("917 555 1234", 0), 0);
  assert.equal(caretAfterDigits("917 555 1234", 3), 3);
  assert.equal(caretAfterDigits("917 555 1234", 4), 5);
  assert.equal(caretAfterDigits("917 555 1234", 0), 0);
  assert.equal(caretAfterDigits("917", 9), 3);
});

test("Backspace right after a formatter space deletes the digit before it", () => {
  // "917 555 1234" with the caret after the first space; the browser removes the space.
  const out = press("917 555 1234", "917555 1234", 3, "deleteContentBackward");
  assert.equal(out.value, "915 551 234");
  assert.equal(out.caret, 2);
});

test("Backspace on a digit behaves as usual", () => {
  const out = press("917 555 1234", "917 555 123", 11, "deleteContentBackward");
  assert.equal(out.value, "917 555 123");
  assert.equal(out.caret, 11);
});

test("Delete just before a formatter space removes the digit after it", () => {
  // caret after "917", Delete removes the space.
  const out = press("917 555 1234", "917555 1234", 3, "deleteContentForward");
  assert.equal(out.value, "917 551 234");
  assert.equal(out.caret, 3);
});

test("a typed letter is refused and the caret stays put", () => {
  const out = press("917 555", "91a7 555", 3, "insertText", "a");
  assert.deepEqual(out, { value: "917 555", caret: 2, rejected: true });
  const symbol = press("917 555", "917 #555", 5, "insertText", "#");
  assert.deepEqual(symbol, { value: "917 555", caret: 4, rejected: true });
});

test("typing allowed characters or pasting is not refused", () => {
  assert.equal(resolvePhoneEdit({ previous: "9", raw: "9 ", caret: 2, inputType: "insertText", data: " " }).rejected, false);
  assert.equal(resolvePhoneEdit({ previous: "9", raw: "9(", caret: 2, inputType: "insertText", data: "(" }).rejected, false);
  // A pasted value with letters passes through so the field can flag it.
  const pasted = resolvePhoneEdit({ previous: "", raw: "917abc", caret: 6, inputType: "insertFromPaste", data: null });
  assert.deepEqual(pasted, { raw: "917abc", caret: 6, rejected: false });
});

test("a digit inserted in the middle reformats and the caret stays after it", () => {
  // "917 555" -> type 8 after the first digit.
  const out = press("917 555", "9817 555", 2, "insertText", "8");
  assert.equal(out.value, "981 755 5");
  assert.equal(out.caret, 2);
  // Typing the next digit at the end keeps going.
  const end = press("917 555 12", "917 555 123", 11, "insertText", "3");
  assert.equal(end.value, "917 555 123");
  assert.equal(end.caret, 11);
});

test("selection deletes and non-digit separators with no digit to remove pass through", () => {
  const selection = resolvePhoneEdit({ previous: "917 555 1234", raw: "9 1234", caret: 1, inputType: "deleteContentBackward" });
  assert.deepEqual(selection, { raw: "9 1234", caret: 1, rejected: false });
  const lone = resolvePhoneEdit({ previous: "+", raw: "", caret: 0, inputType: "deleteContentBackward" });
  assert.deepEqual(lone, { raw: "", caret: 0, rejected: false });
});
