import assert from "node:assert/strict";
import test from "node:test";
import { HEADER_FALLBACK_PX, headerBottomFrom, samePlacement, shouldCloseList } from "./picker-placement.ts";

test("the header height comes from the CSS variable, with a fallback", () => {
  assert.equal(headerBottomFrom("84px"), 84);
  assert.equal(headerBottomFrom(" 88.5px "), 88.5);
  assert.equal(headerBottomFrom(""), HEADER_FALLBACK_PX);
  assert.equal(headerBottomFrom(undefined), HEADER_FALLBACK_PX);
  assert.equal(headerBottomFrom("auto"), HEADER_FALLBACK_PX);
  assert.equal(headerBottomFrom("0px"), HEADER_FALLBACK_PX);
  assert.equal(headerBottomFrom("-4px"), HEADER_FALLBACK_PX);
  assert.equal(headerBottomFrom("nope", 60), 60);
  assert.equal(HEADER_FALLBACK_PX, 88);
});

test("the list stays open while its control is in view below the header", () => {
  assert.equal(shouldCloseList({ top: 200, bottom: 242 }, 800, 88), false);
  assert.equal(shouldCloseList({ top: 40, bottom: 88 }, 800, 88), false);
  assert.equal(shouldCloseList({ top: 758, bottom: 800 }, 800, 88), false);
});

test("the list closes when its control is behind the header or out of the window", () => {
  assert.equal(shouldCloseList({ top: 20, bottom: 62 }, 800, 88), true);
  assert.equal(shouldCloseList({ top: 40, bottom: 87.5 }, 800, 88), true);
  assert.equal(shouldCloseList({ top: -50, bottom: -8 }, 800, 88), true);
  assert.equal(shouldCloseList({ top: 801, bottom: 843 }, 800, 88), true);
});

test("an unchanged placement is the same box, any change is not", () => {
  const a = { top: 120, left: 41, width: 320, maxHeight: 300 };
  assert.equal(samePlacement(a, { ...a }), true);
  assert.equal(samePlacement(a, a), true);
  assert.equal(samePlacement(null, null), true);
  assert.equal(samePlacement(a, null), false);
  assert.equal(samePlacement(null, a), false);
  assert.equal(samePlacement(a, { ...a, top: 121 }), false);
  assert.equal(samePlacement(a, { ...a, left: 42 }), false);
  assert.equal(samePlacement(a, { ...a, width: 319 }), false);
  assert.equal(samePlacement(a, { ...a, maxHeight: 299 }), false);
});
