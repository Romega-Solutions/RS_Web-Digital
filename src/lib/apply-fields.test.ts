import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLY_DEFAULT_FIELD_LIMIT,
  APPLY_FIELD_LIMITS,
  APPLY_MAX_TEXT_FIELDS,
  checkApplyFields,
  dropUnknownFiles,
} from "./apply-fields.ts";

function form(entries: Array<[string, string | File]>): FormData {
  const f = new FormData();
  for (const [k, v] of entries) f.append(k, v);
  return f;
}

test("a normal application is within every limit", () => {
  assert.equal(
    checkApplyFields(
      form([
        ["fullName", "Juan dela Cruz"],
        ["email", "juan@example.com"],
        ["phone", "+639175551234"],
        ["linkedinUrl", "https://linkedin.com/in/juan"],
        ["message", "x".repeat(2000)],
      ]),
    ),
    null,
  );
});

test("each known field can be exactly at its limit, one more is refused", () => {
  for (const [name, limit] of Object.entries(APPLY_FIELD_LIMITS)) {
    assert.equal(checkApplyFields(form([[name, "a".repeat(limit)]])), null, name);
    const failure = checkApplyFields(form([[name, "a".repeat(limit + 1)]]));
    assert.equal(failure?.code, "FIELD_TOO_LONG", name);
    assert.equal(failure?.ok, false);
  }
});

test("an unknown text field is allowed, within the default limit", () => {
  assert.equal(checkApplyFields(form([["expectedSalary", "a".repeat(APPLY_DEFAULT_FIELD_LIMIT)]])), null);
  assert.equal(
    checkApplyFields(form([["expectedSalary", "a".repeat(APPLY_DEFAULT_FIELD_LIMIT + 1)]]))?.code,
    "FIELD_TOO_LONG",
  );
});

test("a file part is not measured as text", () => {
  assert.equal(checkApplyFields(form([["resume", new File(["a".repeat(9000)], "cv.pdf")]])), null);
});

test("an absurd number of text fields is refused", () => {
  const many = Array.from({ length: APPLY_MAX_TEXT_FIELDS + 1 }, (_, i) => [`f${i}`, "x"] as [string, string]);
  assert.equal(checkApplyFields(form(many))?.code, "TOO_MANY_FIELDS");
  assert.equal(checkApplyFields(form(many.slice(0, APPLY_MAX_TEXT_FIELDS))), null);
});

test("dropUnknownFiles keeps the resume and every text field, drops other files", () => {
  const f = form([
    ["fullName", "Juan"],
    ["resume", new File(["%PDF-1.4"], "cv.pdf")],
    ["avatar", new File(["x"], "me.png")],
    ["expectedSalary", "100"],
    ["attachment", new File(["y"], "a.zip")],
  ]);
  assert.equal(dropUnknownFiles(f), 2);
  assert.equal(f.get("avatar"), null);
  assert.equal(f.get("attachment"), null);
  assert.ok(f.get("resume") instanceof File);
  assert.equal(f.get("fullName"), "Juan");
  assert.equal(f.get("expectedSalary"), "100");
});

test("dropUnknownFiles keeps only the first resume", () => {
  const f = form([
    ["resume", new File(["%PDF-first"], "a.pdf")],
    ["resume", new File(["%PDF-second"], "b.pdf")],
  ]);
  assert.equal(dropUnknownFiles(f), 1);
  assert.equal(f.getAll("resume").length, 1);
  assert.equal((f.get("resume") as File).name, "a.pdf");
});

test("dropUnknownFiles leaves a text value that shares a name with a dropped file", () => {
  const f = form([
    ["extra", "keep me"],
    ["extra", new File(["x"], "x.bin")],
  ]);
  assert.equal(dropUnknownFiles(f), 1);
  assert.deepEqual(f.getAll("extra"), ["keep me"]);
});

test("dropUnknownFiles on a form with nothing to drop changes nothing", () => {
  const f = form([["fullName", "Juan"], ["resume", new File(["%PDF-1"], "cv.pdf")]]);
  assert.equal(dropUnknownFiles(f), 0);
  assert.equal([...f.keys()].length, 2);
});
