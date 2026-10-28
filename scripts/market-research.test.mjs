// Unit tests for the portal side of Market Research. Plain node:test, no extra
// framework: Node 24 runs the .ts modules directly.
//
//   pnpm run test:unit

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, test } from "node:test";
import { buildResearchCoverPatterns } from "../src/lib/market-research/image-hosts.ts";
import {
  mapPortalRow,
  mergePosts,
  researchCoverUrl,
  sanitizeBody,
} from "../src/lib/market-research/portal-mapping.ts";
import { queryPublishedRowBySlug, queryPublishedRows } from "../src/lib/market-research/portal-query.ts";

const SUPABASE_URL = "https://abcd1234.supabase.co";

// Next's own matcher for remotePatterns, so the test checks what the image
// optimizer really does with the patterns, not just their shape.
const { hasRemoteMatch } = createRequire(import.meta.url)("next/dist/shared/lib/match-remote-pattern");
const coverAllowed = (patterns, url) => hasRemoteMatch([], patterns, new URL(url));

/** A Supabase-shaped client that records every chained call and resolves with `result`. */
function fakeClient(result) {
  const calls = [];
  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        return (...args) => {
          calls.push([prop, ...args]);
          return builder;
        };
      },
    },
  );
  return {
    calls,
    client: {
      from(table) {
        calls.push(["from", table]);
        return builder;
      },
    },
  };
}

const hasCall = (calls, ...expected) =>
  calls.some((call) => expected.every((value, index) => call[index] === value));

const row = (overrides = {}) => ({
  slug: "grid-demand",
  title: "Grid demand",
  summary: " How demand is changing. ",
  cover_image_path: "covers/3f2a.jpg",
  author_name: "  Sienna Novak ",
  published_at: "2026-10-12T08:30:00+00:00",
  updated_at: "2026-10-13T01:00:00+00:00",
  ...overrides,
});

describe("queries only ever read published posts", () => {
  test("the listing query filters published = true and orders newest first", async () => {
    const { client, calls } = fakeClient({ data: [row()], error: null });
    const rows = await queryPublishedRows(client);
    assert.equal(rows.length, 1);
    assert.ok(hasCall(calls, "from", "research_posts"));
    assert.ok(hasCall(calls, "eq", "published", true), "listing must filter published = true");
    assert.ok(hasCall(calls, "order", "published_at"));
  });

  test("the article query filters published = true AND the slug", async () => {
    const { client, calls } = fakeClient({ data: row(), error: null });
    await queryPublishedRowBySlug(client, "grid-demand");
    assert.ok(hasCall(calls, "eq", "published", true), "article must filter published = true");
    assert.ok(hasCall(calls, "eq", "slug", "grid-demand"));
  });

  test("a draft, unpublished or deleted slug comes back as null (the page then 404s)", async () => {
    const { client } = fakeClient({ data: null, error: null });
    assert.equal(await queryPublishedRowBySlug(client, "a-draft"), null);
  });

  test("database errors are thrown, not swallowed", async () => {
    await assert.rejects(queryPublishedRows(fakeClient({ data: null, error: { message: "boom" } }).client), /boom/);
    await assert.rejects(
      queryPublishedRowBySlug(fakeClient({ data: null, error: { message: "nope" } }).client, "x"),
      /nope/,
    );
  });

  test("only portal-query.ts queries research_posts, and every query there filters published = true", () => {
    const src = path.join(import.meta.dirname, "..", "src");
    const queryFile = "lib/market-research/portal-query.ts";
    const usesTable = /\.from\(\s*(?:["'`]research_posts["'`]|TABLE)\s*\)/g;
    const offenders = [];
    const walk = (current) => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name)) {
          const rel = path.relative(src, full).replaceAll("\\", "/");
          if (rel !== queryFile && /research_posts/.test(readFileSync(full, "utf8")) && /\.from\(/.test(readFileSync(full, "utf8"))) {
            offenders.push(rel);
          }
        }
      }
    };
    walk(src);
    assert.deepEqual(offenders, [], "research_posts must only be queried from portal-query.ts");

    const code = readFileSync(path.join(src, queryFile), "utf8");
    const queries = (code.match(usesTable) ?? []).length;
    const filters = (code.match(/\.eq\(\s*"published"\s*,\s*true\s*\)/g) ?? []).length;
    assert.ok(queries >= 2, "expected the listing and article queries");
    assert.equal(filters, queries, "every research_posts query needs .eq(\"published\", true)");
  });
});

describe("sanitizeBody", () => {
  test("strips scripts, event handlers, iframes, images and javascript: links", () => {
    const dirty =
      '<p onclick="steal()">Hi</p><script>alert(1)</script><iframe src="https://evil.test"></iframe>' +
      '<img src=x onerror="alert(2)"><a href="javascript:alert(3)">click</a><style>body{display:none}</style>';
    const clean = sanitizeBody(dirty);
    for (const bad of ["<script", "alert(", "onclick", "onerror", "<iframe", "<img", "javascript:", "<style", "display:none"]) {
      assert.ok(!clean.includes(bad), `"${bad}" survived: ${clean}`);
    }
    assert.ok(clean.includes("<p>Hi</p>"));
  });

  test("keeps the formatting the editor produces", () => {
    const html =
      "<h2>Heading</h2><h3>Sub</h3><p><strong>bold</strong> <em>it</em></p><ul><li>one</li></ul><blockquote>q</blockquote>";
    assert.equal(sanitizeBody(html), html);
  });

  test("links open safely in a new tab and are not followed by search engines", () => {
    const clean = sanitizeBody('<a href="https://example.com" target="_self">x</a>');
    assert.match(clean, /target="_blank"/);
    assert.match(clean, /rel="noopener noreferrer nofollow"/);
  });

  test("only font-size survives in inline styles", () => {
    const clean = sanitizeBody('<span style="font-size:18px;color:red;position:fixed">x</span>');
    assert.match(clean, /font-size:\s*18px/);
    assert.ok(!clean.includes("color") && !clean.includes("position"));
  });

  test("an h1 in the body becomes an h2, so the page keeps a single h1", () => {
    assert.equal(sanitizeBody("<h1>Big</h1>"), "<h2>Big</h2>");
  });

  test("is idempotent and tolerates empty input", () => {
    const once = sanitizeBody('<p>a</p><a href="https://example.com">b</a>');
    assert.equal(sanitizeBody(once), once);
    assert.equal(sanitizeBody(null), "");
    assert.equal(sanitizeBody(undefined), "");
  });
});

describe("researchCoverUrl", () => {
  test("builds the public bucket URL from the stored path", () => {
    assert.equal(
      researchCoverUrl("covers/3f2a.jpg", SUPABASE_URL),
      `${SUPABASE_URL}/storage/v1/object/public/research-covers/covers/3f2a.jpg`,
    );
  });
  test("handles a trailing slash and encodes odd characters", () => {
    assert.equal(
      researchCoverUrl("covers/a b.jpg", `${SUPABASE_URL}/`),
      `${SUPABASE_URL}/storage/v1/object/public/research-covers/covers/a%20b.jpg`,
    );
  });
  test("returns null when there is nothing to build from", () => {
    assert.equal(researchCoverUrl(null, SUPABASE_URL), null);
    assert.equal(researchCoverUrl("covers/x.jpg", undefined), null);
  });
});

describe("buildResearchCoverPatterns", () => {
  const COVER_PATH = "/storage/v1/object/public/research-covers/covers/3f2a.jpg";

  test("allows exactly the host the website's Supabase URL points at", () => {
    const patterns = buildResearchCoverPatterns(SUPABASE_URL);
    assert.deepEqual(patterns, [
      { protocol: "https", hostname: "abcd1234.supabase.co", pathname: "/storage/v1/object/public/research-covers/**" },
    ]);
    assert.equal(coverAllowed(patterns, `${SUPABASE_URL}${COVER_PATH}`), true);
  });
  test("is the same host researchCoverUrl builds covers for", () => {
    const patterns = buildResearchCoverPatterns(SUPABASE_URL);
    assert.equal(coverAllowed(patterns, researchCoverUrl("covers/3f2a.jpg", SUPABASE_URL)), true);
  });
  test("does not allow other Supabase projects or other buckets", () => {
    const patterns = buildResearchCoverPatterns(SUPABASE_URL);
    assert.equal(coverAllowed(patterns, `https://other-project.supabase.co${COVER_PATH}`), false);
    assert.equal(coverAllowed(patterns, `https://abcd1234.supabase.co.evil.example${COVER_PATH}`), false);
    assert.equal(coverAllowed(patterns, `${SUPABASE_URL}/storage/v1/object/public/private-files/x.jpg`), false);
    assert.equal(coverAllowed(patterns, `http://abcd1234.supabase.co${COVER_PATH}`), false);
  });
  test("keeps a custom domain, a port and http for a local test server", () => {
    assert.equal(buildResearchCoverPatterns("https://files.example.org")[0].hostname, "files.example.org");
    assert.deepEqual(buildResearchCoverPatterns("http://127.0.0.1:54321")[0], {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "54321",
      pathname: "/storage/v1/object/public/research-covers/**",
    });
  });
  test("allows nothing when the URL is unset, empty, malformed or unsafe", () => {
    for (const raw of [undefined, "", "   ", "not a url", "ftp://abcd1234.supabase.co", "https://*.supabase.co"]) {
      assert.deepEqual(buildResearchCoverPatterns(raw), [], `input: ${JSON.stringify(raw)}`);
    }
  });
});

describe("mapPortalRow", () => {
  test("maps a published row to the shape the pages use", () => {
    const post = mapPortalRow(row(), SUPABASE_URL);
    assert.equal(post.origin, "portal");
    assert.equal(post.slug, "grid-demand");
    assert.equal(post.summary, "How demand is changing.");
    assert.equal(post.date, "2026-10-12");
    assert.equal(post.publishedAt, "2026-10-12T08:30:00.000Z");
    assert.equal(post.updatedAt, "2026-10-13T01:00:00.000Z");
    assert.deepEqual(post.authors, [{ name: "Sienna Novak" }]);
    assert.equal(post.cover.alt, "", "portal covers are treated as decorative");
    assert.equal(post.cover.width, undefined);
    assert.ok(post.cover.src.startsWith(`${SUPABASE_URL}/storage/v1/object/public/research-covers/`));
  });
  test("falls back to the company name when the byline is empty", () => {
    assert.deepEqual(mapPortalRow(row({ author_name: null }), SUPABASE_URL).authors, [{ name: "Romega Solutions" }]);
    assert.deepEqual(mapPortalRow(row({ author_name: "   " }), SUPABASE_URL).authors, [{ name: "Romega Solutions" }]);
  });
  test("skips a row that has no cover or no publish date", () => {
    assert.equal(mapPortalRow(row({ cover_image_path: null }), SUPABASE_URL), null);
    assert.equal(mapPortalRow(row({ published_at: null }), SUPABASE_URL), null);
    assert.equal(mapPortalRow(row({ published_at: "not a date" }), SUPABASE_URL), null);
  });
});

describe("mergePosts", () => {
  const mdx = (slug, date, title = slug) => ({ slug, title, date, publishedAt: `${date}T12:00:00.000Z`, origin: "mdx" });
  const portal = (slug, iso, title = slug) => ({ slug, title, date: iso.slice(0, 10), publishedAt: iso, origin: "portal" });

  test("orders both sources newest first", () => {
    const merged = mergePosts([mdx("old", "2026-07-14"), mdx("mid", "2026-09-18")], [portal("new", "2026-10-12T08:00:00.000Z")]);
    assert.deepEqual(merged.map((post) => post.slug), ["new", "mid", "old"]);
  });
  test("a portal post wins over an MDX post with the same slug", () => {
    const merged = mergePosts([mdx("same", "2026-07-14", "MDX version")], [portal("same", "2026-10-12T08:00:00.000Z", "Portal version")]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].title, "Portal version");
    assert.equal(merged[0].origin, "portal");
  });
  test("works when the portal has no posts", () => {
    assert.equal(mergePosts([mdx("a", "2026-07-14")], []).length, 1);
  });
});
