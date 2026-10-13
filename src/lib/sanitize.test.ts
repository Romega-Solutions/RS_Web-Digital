import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JOB_DESCRIPTION_FIXTURE_HTML } from "./job-description-fixture.ts";
import {
  isRichTextEmpty,
  jobDescriptionContent,
  richTextExcerpt,
  richTextToPlainText,
  sanitizeRichText,
} from "./sanitize.ts";

describe("sanitizeRichText", () => {
  it("converts a literal typed <br> (escaped by the editor) into a real line break", () => {
    const dirty = "<p>Line one&lt;br&gt;Line two</p>";
    assert.equal(sanitizeRichText(dirty), "<p>Line one<br />Line two</p>");
  });

  it("handles common <br> variants (self-closing, spaced, uppercase)", () => {
    assert.equal(sanitizeRichText("a&lt;br/&gt;b"), "a<br />b");
    assert.equal(sanitizeRichText("a&lt; br &gt;b"), "a<br />b");
    assert.equal(sanitizeRichText("a&lt;BR&gt;b"), "a<br />b");
  });

  it("preserves newlines in legacy plain-text descriptions", () => {
    assert.equal(sanitizeRichText("First line\nSecond line"), "First line<br />Second line");
  });

  it("still strips disallowed tags and attributes", () => {
    assert.equal(
      sanitizeRichText('<script>alert(1)</script><p onclick="x()">hi</p>'),
      "<p>hi</p>",
    );
  });

  it("is idempotent (safe to run again at render time)", () => {
    const once = sanitizeRichText("<p>Line one&lt;br&gt;Line two</p>");
    assert.equal(sanitizeRichText(once), once);
  });

  it("renders every editor format and strips script and onerror payloads", () => {
    const clean = sanitizeRichText(JOB_DESCRIPTION_FIXTURE_HTML);

    assert.match(clean, /<h1>Heading one<\/h1>/);
    assert.match(clean, /<h2>Heading two<\/h2>/);
    assert.match(clean, /<h3>Heading three<\/h3>/);
    assert.match(clean, /<strong>Bold<\/strong>/);
    assert.match(clean, /<em>italic<\/em>/);
    assert.match(clean, /<u>underline<\/u>/);
    assert.match(clean, /<s>strikethrough<\/s>/);
    assert.match(clean, /<ul><li>Bullet item one<\/li><li>Bullet item two<\/li><\/ul>/);
    assert.match(clean, /<ol><li>Numbered item one<\/li><li>Numbered item two<\/li><\/ol>/);
    assert.match(clean, /<br \/>/);
    assert.match(clean, /🚀/);
    assert.match(clean, /<span style="font-size:1\.35rem">Larger font-size<\/span>/);
    assert.match(clean, /<span style="font-size:16px">Safe paragraph\.<\/span>/);
    assert.match(
      clean,
      /<a href="https:\/\/www\.romega-solutions\.com\/careers" target="_blank" rel="noopener noreferrer nofollow">careers page<\/a>/,
    );
    assert.match(clean, /<blockquote>A short quote from the hiring team\.<\/blockquote>/);
    assert.match(clean, /<code>const ready = true<\/code>/);

    assert.doesNotMatch(clean, /<script/i);
    assert.doesNotMatch(clean, /onerror/i);
    assert.doesNotMatch(clean, /onclick/i);
    assert.doesNotMatch(clean, /javascript:/i);
    assert.doesNotMatch(clean, /color:/i);
    assert.doesNotMatch(clean, /<img/i);
    assert.doesNotMatch(clean, /alert\("xss"\)/);
  });
});

describe("job description plain text", () => {
  it("strips tags for meta and WebPage descriptions", () => {
    const content = jobDescriptionContent(JOB_DESCRIPTION_FIXTURE_HTML);

    assert.equal(content.plain.includes("<"), false);
    assert.equal(content.meta.includes("<"), false);
    assert.equal(content.excerpt.includes("<"), false);
    assert.match(content.plain, /Heading one/);
    assert.match(content.plain, /Bold/);
    assert.match(content.plain, /italic/);
    assert.match(content.plain, /Bullet item one/);
    assert.match(content.plain, /Numbered item one/);
    assert.match(content.plain, /🚀/);
    assert.doesNotMatch(content.plain, /alert\("xss"\)/);
    assert.ok(content.html.includes("<h1>"));
    assert.ok(content.meta.length <= 241);
    assert.ok(content.excerpt.length <= 361);
  });

  it("decodes entities and treats an empty editor document as empty", () => {
    assert.equal(richTextToPlainText("<p>swipe &amp; match</p>"), "swipe & match");
    assert.equal(richTextExcerpt("<p>swipe &amp; match</p>"), "swipe & match");
    assert.equal(isRichTextEmpty("<p></p>"), true);
    assert.equal(isRichTextEmpty("<p>&nbsp;</p>"), true);
    assert.equal(isRichTextEmpty('<script>alert(1)</script><img src="x" onerror="alert(1)">'), true);
    assert.equal(isRichTextEmpty(null), true);
    assert.equal(jobDescriptionContent("<p></p>").html, "");
  });
});
