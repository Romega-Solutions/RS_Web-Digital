import assert from "node:assert/strict";
import test from "node:test";
import {
  MESSAGE_FILTER_NOTICE,
  MESSAGE_MAX_LENGTH,
  filterPlainText,
  formatCounter,
  isPlainText,
} from "./text.ts";

test("keeps plain text and line breaks untouched", () => {
  const input = "Hello there!\nNeed 3 devs, ASAP (remote).";
  assert.deepEqual(filterPlainText(input), { text: input, removed: false });
});

test("keeps accents, currency signs and non-Latin scripts", () => {
  for (const input of [
    "Jos\u00e9 Mu\u00f1oz from Ni\u00f1o Corp, caf\u00e9 r\u00e9sum\u00e9",
    "Budget is \u20b150,000 or \u20ac900 / \u00a3800 / \u00a54,000 / $500",
    "\u674e\u5c0f\u9f8d \u3053\u3093\u306b\u3061\u306f \u0645\u0631\u062d\u0628\u0627 \u041c\u0430\u0440\u0438\u044f \u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35",
    "#1 priority: 5 + 5 = 10, 3 < 4 > 2 ~ ^ | \u00b1 \u00d7 \u00f7 \u00b0 \u00a9 \u00ae \u2122",
    "a\n\nb",
  ]) {
    assert.deepEqual(filterPlainText(input), { text: input, removed: false }, input);
    assert.equal(isPlainText(input), true, input);
  }
  assert.equal(filterPlainText("caf\u0065\u0301").removed, false);
});

test("removes emoji and pictographs and reports it", () => {
  assert.deepEqual(filterPlainText("hi \u{1F600}\u2660\u2666 there"), { text: "hi  there", removed: true });
  assert.deepEqual(filterPlainText("Thanks \u2764\uFE0F \u2705 \u{1F44D}\u{1F3FD}!"), { text: "Thanks   !", removed: true });
  assert.deepEqual(filterPlainText("Jos\u00e9 \u{1F600} \u20b150"), { text: "Jos\u00e9  \u20b150", removed: true });
});

test("removes joined, flag and keycap emoji in one piece", () => {
  // man + ZWJ + woman + ZWJ + girl, a flag, a keycap, and a rainbow flag (flag + VS16 + ZWJ + rainbow)
  assert.deepEqual(filterPlainText("\u{1F468}\u200D\u{1F469}\u200D\u{1F467}"), { text: "", removed: true });
  assert.deepEqual(filterPlainText("a\u{1F1F5}\u{1F1ED}b"), { text: "ab", removed: true });
  assert.deepEqual(filterPlainText("call 1\uFE0F\u20E3 or #\uFE0F\u20E3"), { text: "call  or ", removed: true });
  assert.deepEqual(filterPlainText("x\u{1F3F3}\uFE0F\u200D\u{1F308}y"), { text: "xy", removed: true });
  assert.deepEqual(filterPlainText("x\u{1F3F4}\u{E0067}\u{E0062}\u{E007F}y"), { text: "xy", removed: true });
  // the plain digit on its own stays
  assert.deepEqual(filterPlainText("room 1"), { text: "room 1", removed: false });
});

test("removes zero-width and other invisible or control characters", () => {
  assert.deepEqual(filterPlainText("a\u200Bb\u2060\uFEFFc"), { text: "abc", removed: true });
  // joiners with nothing to join are stray: after a space, at the start, doubled after a space
  assert.deepEqual(filterPlainText("a \u200C\u200D b"), { text: "a  b", removed: true });
  assert.deepEqual(filterPlainText("\u200Dabc"), { text: "abc", removed: true });
  assert.deepEqual(filterPlainText("a\u0000b\u0007c\u007Fd\u0085e\u202Ef"), { text: "abcdef", removed: true });
  assert.deepEqual(filterPlainText("a\uE000b"), { text: "ab", removed: true });
});

test("keeps the joiner and non-joiner inside words of other scripts", () => {
  for (const input of [
    "\u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u0645", // Persian, ZWNJ
    "\u0DC1\u0DCA\u200D\u0DBB\u0DD3", // Sinhala, ZWJ
    "\u09B0\u200D\u09CD\u09AF\u09BE\u09AC", // Bengali, ZWJ
    "\u0D15\u0D4D\u200C \u0D28\u0D4D\u200D", // Malayalam, ZWNJ and ZWJ after a virama
    "\u0C95\u0CCD\u200D", // Kannada
    "\u0915\u094D\u200D\u0937 \u0928\u092E\u0938\u094D\u0924\u0947", // Hindi half form
  ]) {
    assert.deepEqual(filterPlainText(input), { text: input, removed: false }, input);
    assert.equal(isPlainText(input), true, input);
  }
});

test("still removes a joiner before an emoji or after an emoji selector", () => {
  assert.deepEqual(filterPlainText("a\u200D\u{1F600}b"), { text: "ab", removed: true });
  assert.deepEqual(filterPlainText("a\u200C\u{1F600}b"), { text: "ab", removed: true });
  assert.deepEqual(filterPlainText("\u2764\uFE0F\u200D\u{1F525}"), { text: "", removed: true });
  assert.deepEqual(filterPlainText("\u{1F469}\u200D\u2695\uFE0F"), { text: "", removed: true });
  assert.equal(isPlainText("\u{1F468}\u200D\u{1F469}\u200D\u{1F467}"), false);
  assert.equal(isPlainText("a\u200D\u{1F600}"), false);
});

test("keeps direction marks, the soft hyphen and CJK variants", () => {
  for (const input of [
    "\u0645\u0631\u062D\u0628\u0627\u200F (hello)\u200E",
    "co\u00ADoperate",
    "\u845B\uFE00 \u8FFB\uFE01",
    "\u845B\u{E0100} \u8FFB\u{E0101}",
  ]) {
    assert.deepEqual(filterPlainText(input), { text: input, removed: false }, input);
    assert.equal(isPlainText(input), true, input);
  }
});

test("removes a variation selector that follows an emoji or nothing", () => {
  assert.deepEqual(filterPlainText("\u2764\uFE0E ok"), { text: " ok", removed: true });
  assert.deepEqual(filterPlainText("a \uFE00b"), { text: "a b", removed: true });
  assert.deepEqual(filterPlainText("I \u2764\uFE0F you"), { text: "I  you", removed: true });
  assert.equal(isPlainText("a\uFE0F"), false);
});

test("the removal notice says emoji", () => {
  assert.equal(MESSAGE_FILTER_NOTICE, "Emoji were removed.");
});

test("turns smart quotes, dashes and the ellipsis into ASCII", () => {
  assert.deepEqual(filterPlainText("It\u2019s \u201Cgreat\u201D \u2013 really\u2014yes\u2026"), {
    text: 'It\'s "great" - really-yes...',
    removed: false,
  });
});

test("normalises line breaks and tabs", () => {
  assert.deepEqual(filterPlainText("a\r\nb\rc\td"), { text: "a\nb\nc d", removed: false });
});

test("caps the length at 2000 by default and at a custom limit", () => {
  assert.equal(filterPlainText("x".repeat(2500)).text.length, MESSAGE_MAX_LENGTH);
  assert.equal(filterPlainText("abcdef", 3).text, "abc");
});

test("a cut never splits an emoji-free surrogate pair", () => {
  assert.equal(filterPlainText("ab\u{20BB7}", 3).text, "ab");
  assert.equal(filterPlainText("ab\u{20BB7}", 4).text, "ab\u{20BB7}");
});

test("isPlainText matches the filter", () => {
  assert.equal(isPlainText("Plain text\nwith a line break"), true);
  assert.equal(isPlainText("a\r\nb"), true);
  assert.equal(isPlainText("emoji \u{1F600}"), false);
  assert.equal(isPlainText("caf\u00e9 \u20b150 \u65e5\u672c"), true);
  assert.equal(isPlainText("zero\u200Bwidth"), false);
  assert.equal(isPlainText("\u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u0645"), true);
  assert.equal(isPlainText("flag \u{1F1F5}\u{1F1ED}"), false);
  assert.equal(isPlainText("heart \u2764\uFE0F"), false);
  // calling it twice gives the same answer (no state is kept between calls)
  assert.equal(isPlainText("emoji \u{1F600}"), false);
  assert.equal(isPlainText("emoji \u{1F600}"), false);
});

test("counter reads n / 2000", () => {
  assert.equal(formatCounter(0), "0 / 2000");
  assert.equal(formatCounter(123), "123 / 2000");
  assert.equal(formatCounter(5, 10), "5 / 10");
});
