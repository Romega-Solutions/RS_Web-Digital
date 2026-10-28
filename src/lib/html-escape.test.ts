import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml } from "./html-escape.ts";

test("escapes the five characters that can open a tag or an attribute", () => {
  assert.equal(escapeHtml(`<b onclick="x()">Tom & 'Jerry'</b>`), "&lt;b onclick=&quot;x()&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/b&gt;");
});

test("escapes the ampersand first, so an entity typed by a visitor stays literal", () => {
  assert.equal(escapeHtml("&lt;script&gt;"), "&amp;lt;script&amp;gt;");
});

test("plain text, hash signs and double dashes are left alone", () => {
  assert.equal(escapeHtml("Suite #5 -- Level 2, Makati"), "Suite #5 -- Level 2, Makati");
});

test("null, undefined and numbers become text without throwing", () => {
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(42), "42");
});
