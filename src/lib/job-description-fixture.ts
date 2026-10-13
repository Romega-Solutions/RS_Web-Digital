/**
 * Sample Tiptap-shaped job description covering every format the public
 * apply page must render, plus an XSS payload the sanitizer must drop.
 * Used by the unit test and the noindex /apply/format-preview page.
 * Production position data is not modified.
 */
export const JOB_DESCRIPTION_FIXTURE_HTML = [
  "<h1>Heading one</h1>",
  "<h2>Heading two</h2>",
  "<h3>Heading three</h3>",
  "<p><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s> text.</p>",
  '<p><span style="font-size: 1.35rem">Larger font-size</span> and emoji 🚀✨</p>',
  "<ul><li>Bullet item one</li><li>Bullet item two</li></ul>",
  "<ol><li>Numbered item one</li><li>Numbered item two</li></ol>",
  '<p>Visit the <a href="https://www.romega-solutions.com/careers">careers page</a>.</p>',
  "<p>Line one<br>Line two</p>",
  "<blockquote>A short quote from the hiring team.</blockquote>",
  "<p>Inline <code>const ready = true</code> sample.</p>",
  '<script>alert("xss")</script>',
  '<img src="x" onerror="alert(1)">',
  '<p onclick="alert(1)"><span style="font-size: 16px; color: red; background-image: url(javascript:alert(1))">Safe paragraph.</span></p>',
  '<a href="javascript:alert(1)">Blocked script link</a>',
].join("");
