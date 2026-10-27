import assert from "node:assert/strict";
import test from "node:test";
import { precheckApplication } from "./apply-precheck.ts";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

test("passes a good email and an E.164 phone", () => {
  assert.equal(precheckApplication(form({ email: "juan.delacruz@gmail.com", phone: "+639175551234" })), null);
});

test("passes an older national PH phone from a cached page", () => {
  assert.equal(precheckApplication(form({ email: "a@example.com", phone: "0917 555 1234" })), null);
});

test("rejects a bad email with the same reply shape as the other errors", () => {
  assert.deepEqual(precheckApplication(form({ email: "not-an-email", phone: "+639175551234" })), {
    ok: false,
    code: "INVALID_EMAIL",
    error: "Enter a valid email, e.g. name@example.com",
  });
});

test("rejects a bad phone", () => {
  for (const phone of ["+63917", "abc", "12345", "+63917555123a"]) {
    const result = precheckApplication(form({ email: "a@example.com", phone }));
    assert.equal(result?.code, "INVALID_PHONE", phone);
    assert.equal(result?.ok, false);
  }
});

test("missing or empty fields are left to the portal", () => {
  assert.equal(precheckApplication(form({})), null);
  assert.equal(precheckApplication(form({ email: "", phone: "  " })), null);
});

test("does not read the resume or other fields", () => {
  const data = form({ email: "a@example.com", phone: "+639175551234", fullName: "x" });
  data.set("resume", new File(["x"], "cv.pdf", { type: "application/pdf" }));
  assert.equal(precheckApplication(data), null);
});
