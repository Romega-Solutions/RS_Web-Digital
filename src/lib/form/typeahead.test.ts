import assert from "node:assert/strict";
import test from "node:test";
import { countryOptions } from "./countries.ts";
import {
  TYPEAHEAD_IDLE_MS,
  TYPEAHEAD_START,
  foldText,
  isTypeaheadActive,
  typeaheadStep,
  type TypeaheadItem,
  type TypeaheadState,
} from "./typeahead.ts";

const countries = countryOptions();

// Types the keys with the given gaps (ms) and returns the last match name.
function typeKeys(items: readonly TypeaheadItem[], steps: [string, number][], from: TypeaheadState = TYPEAHEAD_START) {
  let state = from;
  let now = from.at;
  let last: TypeaheadItem | null = null;
  for (const [key, gap] of steps) {
    now += gap;
    const result = typeaheadStep(state, key, now, items);
    state = result.state;
    if (result.match) last = result.match;
  }
  return { state, last, now };
}

test("P finds Pakistan, the first P country A to Z", () => {
  const { last } = typeKeys(countries, [["P", 1000]]);
  assert.equal(last?.name, "Pakistan");
});

test("P then H finds Philippines, P then U finds Puerto Rico", () => {
  assert.equal(typeKeys(countries, [["P", 1000], ["h", 500]]).last?.name, "Philippines");
  assert.equal(typeKeys(countries, [["P", 1000], ["U", 500]]).last?.name, "Puerto Rico");
});

test("each extra letter within the window keeps extending the search", () => {
  const { last, state } = typeKeys(countries, [["U", 1000], ["n", 1000], ["i", 1000], ["t", 1000]]);
  assert.equal(state.buffer, "unit");
  assert.equal(last?.name, "United Arab Emirates");
});

test("after the idle window the search starts over: PH, pause, I finds Iceland", () => {
  const first = typeKeys(countries, [["P", 1000], ["H", 1000]]);
  assert.equal(first.last?.name, "Philippines");
  const later = typeaheadStep(first.state, "I", first.now + TYPEAHEAD_IDLE_MS + 3000, countries);
  assert.equal(later.match?.name, "Iceland");
  assert.equal(later.state.buffer, "i");
});

test("the window is 3 seconds: exactly 3 s still extends, 3.001 s resets", () => {
  const p = typeKeys(countries, [["P", 1000]]);
  assert.equal(typeaheadStep(p.state, "h", p.now + 3000, countries).match?.name, "Philippines");
  assert.equal(typeaheadStep(p.state, "h", p.now + 3001, countries).match?.name, "Haiti");
  assert.equal(isTypeaheadActive(p.state, p.now + 3000), true);
  assert.equal(isTypeaheadActive(p.state, p.now + 3001), false);
});

test("a letter that matches nothing is ignored and the earlier search stays", () => {
  const p = typeKeys(countries, [["P", 1000]]);
  const miss = typeaheadStep(p.state, "x", p.now + 500, countries);
  assert.equal(miss.match, null);
  assert.equal(miss.state.buffer, "p");
  // the next letter still builds on "p"
  assert.equal(typeaheadStep(miss.state, "u", p.now + 1000, countries).match?.name, "Puerto Rico");
});

test("accents and case are ignored, and Åland keeps its A to Z place", () => {
  assert.equal(foldText("Åland Islands"), "aland islands");
  const items = [
    { name: "Afghanistan", callingCode: "93" },
    { name: "Åland Islands", callingCode: "358" },
    { name: "Albania", callingCode: "355" },
    { name: "Côte d’Ivoire", callingCode: "225" },
  ];
  assert.equal(typeKeys(items, [["a", 1000]]).last?.name, "Afghanistan");
  assert.equal(typeKeys(items, [["a", 1000], ["L", 100]]).last?.name, "Åland Islands");
  assert.equal(typeKeys(items, [["å", 1000]]).last?.name, "Afghanistan");
  assert.equal(typeKeys(items, [["å", 1000], ["l", 100], ["b", 100]]).last?.name, "Albania");
  assert.equal(typeKeys(items, [["c", 1000], ["o", 100], ["t", 100], ["e", 100]]).last?.name, "Côte d’Ivoire");
  assert.equal(typeKeys(countries, [["a", 1000], ["L", 100]]).last?.name, countries.find((c) => foldText(c.name).startsWith("al"))?.name);
});

test("names with spaces can be typed, but a leading space is ignored", () => {
  assert.equal(typeKeys(countries, [["p", 1000], ["u", 100], ["e", 100], [" ", 100], ["R", 100]]).last?.name, "Puerto Rico");
  const ignored = typeaheadStep(TYPEAHEAD_START, " ", 1000, countries);
  assert.equal(ignored.match, null);
  assert.equal(ignored.state.buffer, "");
});

test("digits match the calling code, and mixing letters and digits starts again", () => {
  assert.equal(typeKeys(countries, [["6", 1000], ["3", 100]]).last?.name, "Philippines");
  const mixed = typeKeys(countries, [["6", 1000], ["p", 100]]);
  assert.equal(mixed.state.buffer, "p");
  assert.equal(mixed.last?.name, "Pakistan");
});

test("Backspace shortens the search", () => {
  const ph = typeKeys(countries, [["P", 1000], ["H", 100]]);
  const back = typeaheadStep(ph.state, "Backspace", ph.now + 100, countries);
  assert.equal(back.state.buffer, "p");
  assert.equal(back.match?.name, "Pakistan");
  const empty = typeaheadStep(back.state, "Backspace", ph.now + 200, countries);
  assert.equal(empty.state.buffer, "");
  assert.equal(empty.match, null);
});

test("other keys are ignored", () => {
  for (const key of ["Shift", "ArrowDown", "Tab", "Enter", "Escape", "+", "@"]) {
    const result = typeaheadStep(TYPEAHEAD_START, key, 1000, countries);
    assert.equal(result.match, null, key);
    assert.equal(result.state, TYPEAHEAD_START, key);
  }
});

test("the first P country really is Pakistan in the real list, and Ascension is not a P match", () => {
  assert.equal(countries.find((c) => c.name.startsWith("P"))?.name, "Pakistan");
  const p = typeaheadStep(TYPEAHEAD_START, "P", 1000, countries);
  assert.notEqual(p.match?.callingCode, "247");
});
