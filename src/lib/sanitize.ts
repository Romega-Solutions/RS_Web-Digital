import sanitizeHtml from "sanitize-html";

// Allowlist sized to exactly what the Tiptap job-description editor can emit
// in RS-Tool-Ticketing-System (src/lib/sanitize.ts): StarterKit (bold→<strong>,
// italic→<em>, strike→<s>, underline→<u>, lists, blockquote, headings, code)
// + TextStyle/FontSize (<span style="font-size:…">) + links. Everything else
// (scripts, event handlers, arbitrary styles, images) is stripped. Run on
// render — the portal already sanitized on write, and this is idempotent.

const FONT_SIZE = /^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/;

// The Tiptap editor is WYSIWYG, not a raw-HTML input: typing the characters
// `<br>` into it becomes literal text, which the editor escapes to `&lt;br&gt;`
// and then renders as the visible string "<br>". Normalize that into a real
// `<br>` before sanitizing. Applied on every sanitize call so descriptions
// already saved this way are repaired at render time.
const LITERAL_BR = /&lt;\s*br\s*\/?\s*&gt;/gi;

// Descriptions saved before the editor (or pasted as plain text) rely on
// newline characters. The previous apply page preserved them with
// `white-space: pre-wrap`. Once the value is real HTML, newlines between
// tags must stay collapsed, so this only rewrites values that contain no tags.
const REAL_TAG = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

const CARD_EXCERPT_LENGTH = 360;
const META_DESCRIPTION_LENGTH = 240;

function normalizeInput(dirty: string): string {
  const withBreaks = REAL_TAG.test(dirty)
    ? dirty
    : dirty.replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
  return withBreaks.replace(LITERAL_BR, "<br>");
}

export function sanitizeRichText(dirty: string): string {
  const normalized = normalizeInput(dirty ?? "");
  return sanitizeHtml(normalized, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "code",
      "pre",
      "span",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedStyles: {
      "*": { "font-size": [FONT_SIZE] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    },
  });
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entity, body: string) => {
    if (body[0] === "#") {
      const codePoint =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;
      return String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[body] ?? entity;
  });
}

/** Tag-stripped plain text. Safe for meta descriptions and WebPage JSON-LD. */
export function richTextToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  const clean = sanitizeRichText(html);
  const withBreaks = clean
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|blockquote|pre|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(withBreaks)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function excerptPlainText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength);
  const boundary = sliced.lastIndexOf(" ");
  const trimmed = (boundary > maxLength * 0.6 ? sliced.slice(0, boundary) : sliced).trim();
  return `${trimmed}…`;
}

export function richTextExcerpt(
  html: string | null | undefined,
  maxLength = CARD_EXCERPT_LENGTH,
): string {
  return excerptPlainText(richTextToPlainText(html), maxLength);
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  return richTextToPlainText(html).length === 0;
}

export type JobDescriptionContent = {
  /** Full tag-stripped text, whitespace collapsed. For WebPage JSON-LD. */
  plain: string;
  /** Shorter plain text for the HTML meta / Open Graph description. */
  meta: string;
  /** Plain-text excerpt for careers cards and the public jobs API. */
  excerpt: string;
  /** Sanitized HTML for on-page rendering and JobPosting.description. */
  html: string;
};

export function jobDescriptionContent(html: string | null | undefined): JobDescriptionContent {
  const plain = richTextToPlainText(html).replace(/\s+/g, " ").trim();
  return {
    plain,
    meta: excerptPlainText(plain, META_DESCRIPTION_LENGTH),
    excerpt: excerptPlainText(plain, CARD_EXCERPT_LENGTH),
    html: plain ? sanitizeRichText(html ?? "") : "",
  };
}
