import assert from "node:assert/strict";
import test from "node:test";
import { employmentTypeLabel, googleEmploymentType } from "./employment-type.ts";

test("maps the 4 portal types to labels", () => {
  assert.equal(employmentTypeLabel("full_time"), "Full-time");
  assert.equal(employmentTypeLabel("part_time"), "Part-time");
  assert.equal(employmentTypeLabel("contractual"), "Contractual");
  assert.equal(employmentTypeLabel("internship"), "Internship");
});

test("maps the 4 portal types to Google employmentType", () => {
  assert.equal(googleEmploymentType("full_time"), "FULL_TIME");
  assert.equal(googleEmploymentType("part_time"), "PART_TIME");
  assert.equal(googleEmploymentType("contractual"), "CONTRACTOR");
  assert.equal(googleEmploymentType("internship"), "INTERN");
});

test("unknown or empty values never become Full-time", () => {
  const warn = console.warn;
  const warnings: unknown[] = [];
  console.warn = (...args: unknown[]) => warnings.push(args);
  try {
    assert.equal(employmentTypeLabel("freelance"), null);
    assert.equal(employmentTypeLabel("FULL_TIME"), null);
    assert.equal(employmentTypeLabel("toString"), null);
    assert.equal(employmentTypeLabel(""), null);
    assert.equal(employmentTypeLabel(null), null);
    assert.equal(employmentTypeLabel(undefined), null);
    assert.equal(googleEmploymentType("freelance"), null);
    assert.equal(googleEmploymentType(null), null);
  } finally {
    console.warn = warn;
  }
  assert.equal(warnings.length, 3, "warns only for non-empty unknown values");
});
