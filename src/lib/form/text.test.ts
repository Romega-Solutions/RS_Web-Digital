import assert from "node:assert/strict";
import test from "node:test";
import { MESSAGE_MAX_LENGTH, filterPlainText, formatCounter, isPlainText } from "./text.ts";

test("keeps plain text and line breaks untouched", () => {
  const input = "Hello there!\nNeed 3 devs, ASAP (remote).";
  assert.deepEqual(filterPlainText(input), { text: input, removed: false });
});

test("removes emoji and symbols and reports it", () => {
  assert.deepEqual(filterPlainText("hi \u{1F600}\u2660\u2666 there"), { text: "hi  there", removed: true });
  assert.deepEqual(filterPlainText("\u{1F468}\u200D\u{1F469}"), { text: "", removed: true });
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

test("isPlainText matches the filter", () => {
  assert.equal(isPlainText("Plain text\nwith a line break"), true);
  assert.equal(isPlainText("a\r\nb"), true);
  assert.equal(isPlainText("emoji \u{1F600}"), false);
  assert.equal(isPlainText("caf\u00e9"), false);
});

test("counter reads n / 2000", () => {
  assert.equal(formatCounter(0), "0 / 2000");
  assert.equal(formatCounter(123), "123 / 2000");
  assert.equal(formatCounter(5, 10), "5 / 10");
});
