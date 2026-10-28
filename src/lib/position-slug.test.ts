import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applicationSubmitPath,
  assignPositionSlugs,
  classifyPositionsError,
  decideApplyRoute,
  parsePositionId,
  positionApplyPath,
  slugifyJobTitle,
} from "./position-slug.ts";

const EXAMPLE_TITLE = "Full-Stack Developer Intern — Mobile Dating App";
const EXAMPLE_SLUG = "full-stack-developer-intern-mobile-dating-app";

test("slugify matches the portal backfill for the dating-app role", () => {
  assert.equal(slugifyJobTitle(EXAMPLE_TITLE), EXAMPLE_SLUG);
});

test("slugify lowercases, strips accents, and collapses non-alphanumerics", () => {
  assert.equal(slugifyJobTitle("Café Niño — Señor"), "cafe-nino-senor");
  assert.equal(slugifyJobTitle("  São Paulo / R&D  "), "sao-paulo-r-d");
  assert.equal(slugifyJobTitle("naïve"), "naive");
  assert.equal(slugifyJobTitle("İstanbul"), "istanbul");
  assert.equal(slugifyJobTitle("Full‐Stack"), "full-stack");
  assert.equal(slugifyJobTitle("a---b"), "a-b");
  assert.equal(slugifyJobTitle("!!!"), "");
});

test("collisions get -2 and -3 in ascending id order", () => {
  const assigned = assignPositionSlugs([
    { id: 10, job_title: "Engineer", slug: null },
    { id: 3, job_title: EXAMPLE_TITLE, slug: null },
    { id: 9, job_title: "Engineer", slug: null },
    { id: 4, job_title: "Engineer", slug: null },
  ]);
  const byId = new Map(assigned.map((row) => [row.id, row.resolvedSlug]));
  assert.equal(byId.get(3), EXAMPLE_SLUG);
  assert.equal(byId.get(4), "engineer");
  assert.equal(byId.get(9), "engineer-2");
  assert.equal(byId.get(10), "engineer-3");
});

test("punctuation-only title differences still collide", () => {
  const assigned = assignPositionSlugs([
    { id: 2, job_title: "Full Stack", slug: null },
    { id: 1, job_title: "Full-Stack", slug: null },
  ]);
  const byId = new Map(assigned.map((row) => [row.id, row.resolvedSlug]));
  assert.equal(byId.get(1), "full-stack");
  assert.equal(byId.get(2), "full-stack-2");
});

test("stored production slugs are kept even when a title would derive a different value", () => {
  const assigned = assignPositionSlugs([
    {
      id: 8,
      job_title: "Human Resources Intern",
      slug: "human-resources-intern-2",
    },
    {
      id: 9,
      job_title: "Full-stack Developer Intern — Mobile Dating App (In Development)",
      slug: "full-stack-developer-intern-mobile-dating-app-in-development",
    },
    {
      id: 10,
      job_title: "Full-stack Developer Intern — Mobile Dating App (In Development)",
      slug: "full-stack-developer-intern-mobile-dating-app-in-development-2",
    },
  ]);
  const byId = new Map(assigned.map((row) => [row.id, row.resolvedSlug]));
  assert.equal(byId.get(9), EXAMPLE_SLUG + "-in-development");
  assert.equal(byId.get(10), EXAMPLE_SLUG + "-in-development-2");
  assert.equal(byId.get(8), "human-resources-intern-2");
  assert.deepEqual(decideApplyRoute("9", { id: 9, resolvedSlug: byId.get(9)! }), {
    kind: "redirect",
    path: `/apply/${EXAMPLE_SLUG}-in-development`,
  });
});

test("a null slug still falls back to the title", () => {
  const assigned = assignPositionSlugs([
    {
      id: 9,
      job_title: "Full-stack Developer Intern — Mobile Dating App (In Development)",
      slug: null,
    },
  ]);
  assert.equal(assigned[0]?.resolvedSlug, `${EXAMPLE_SLUG}-in-development`);
});

test("a stored slug wins, and null rows avoid that value", () => {
  const assigned = assignPositionSlugs([
    { id: 1, job_title: "Engineer", slug: "engineer" },
    { id: 2, job_title: "Engineer", slug: "engineer-2" },
    { id: 3, job_title: "Engineer", slug: null },
    { id: 8, job_title: "Custom Role", slug: "  custom-role  " },
  ]);
  const byId = new Map(assigned.map((row) => [row.id, row.resolvedSlug]));
  assert.equal(byId.get(1), "engineer");
  assert.equal(byId.get(2), "engineer-2");
  assert.equal(byId.get(3), "engineer-3");
  assert.equal(byId.get(8), "custom-role");
});

test("unsafe or blank stored slugs are derived instead", () => {
  const assigned = assignPositionSlugs([
    { id: 5, job_title: "!!!", slug: "../etc" },
    { id: 6, job_title: "Hello", slug: "" },
  ]);
  const byId = new Map(assigned.map((row) => [row.id, row.resolvedSlug]));
  assert.equal(byId.get(5), "position-5");
  assert.equal(byId.get(6), "hello");
});

test("parsePositionId accepts only canonical positive integers", () => {
  assert.equal(parsePositionId("9"), 9);
  assert.equal(parsePositionId("10"), 10);
  assert.equal(parsePositionId("09"), null);
  assert.equal(parsePositionId("9 "), null);
  assert.equal(parsePositionId(EXAMPLE_SLUG), null);
  assert.equal(parsePositionId("0"), null);
  assert.equal(parsePositionId("-3"), null);
});

test("numeric ids redirect to the slug, and the slug URL renders", () => {
  const position = { id: 9, resolvedSlug: EXAMPLE_SLUG };
  assert.deepEqual(decideApplyRoute("9", position), {
    kind: "redirect",
    path: `/apply/${EXAMPLE_SLUG}`,
  });
  assert.deepEqual(decideApplyRoute(EXAMPLE_SLUG, position), { kind: "render" });
  assert.deepEqual(decideApplyRoute("missing-role", null), { kind: "not_found" });
});

test("a numeric slug does not redirect in a loop", () => {
  assert.deepEqual(decideApplyRoute("9", { id: 9, resolvedSlug: "9" }), { kind: "render" });
  assert.deepEqual(decideApplyRoute("2024", { id: 9, resolvedSlug: "2024" }), {
    kind: "render",
  });
});

test("public paths use the slug and submissions keep the numeric id", () => {
  assert.equal(positionApplyPath(EXAMPLE_SLUG), `/apply/${EXAMPLE_SLUG}`);
  assert.equal(applicationSubmitPath(9), "/api/apply/9");
  assert.throws(() => applicationSubmitPath(Number.NaN), /numeric position id/);
});

test("the apply form posts to the numeric id API", () => {
  const source = readFileSync(
    new URL("../app/apply/[positionId]/ApplyForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /applicationSubmitPath\(positionId\)/);
  assert.doesNotMatch(source, /\/api\/apply\/\$\{jobTitle/);
});

test("the apply page canonicalizes to the slug and still mounts the form by id", () => {
  const source = readFileSync(new URL("../app/apply/[positionId]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /positionApplyPath\(position\.resolvedSlug\)/);
  assert.match(source, /permanentRedirect\(resolved\.path\)/);
  assert.match(source, /notFound\(\)/);
  assert.match(
    source,
    /<ApplyForm\s+positionId=\{position\.id\}\s+jobTitle=\{position\.job_title\}[\s\S]*?\/>/,
  );
  assert.doesNotMatch(source, /\/apply\/\$\{id\}/);
  assert.doesNotMatch(source, /\/apply\/\$\{position\.id\}/);
});

test("classifyPositionsError distinguishes a missing slug column from a missing table", () => {
  assert.equal(
    classifyPositionsError({
      code: "42703",
      message: "column positions.slug does not exist",
    }),
    "missing_slug",
  );
  assert.equal(
    classifyPositionsError({
      code: "PGRST204",
      message: "Could not find the 'slug' column of 'positions' in the schema cache",
    }),
    "missing_slug",
  );
  assert.equal(
    classifyPositionsError({
      code: "42P01",
      message: 'relation "positions" does not exist',
    }),
    "missing_table",
  );
  assert.equal(
    classifyPositionsError({
      code: "PGRST205",
      message: "Could not find the table 'public.positions' in the schema cache",
    }),
    "missing_table",
  );
  assert.equal(classifyPositionsError(null), "none");
  assert.equal(classifyPositionsError({ message: "permission denied" }), "other");
});
