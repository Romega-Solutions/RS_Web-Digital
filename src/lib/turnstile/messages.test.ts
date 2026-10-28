import assert from "node:assert/strict";
import test from "node:test";
import { HR_EMAIL } from "../apply-upload.ts";
import { CONTACT_EMAIL, browserCaptchaMessage, serverCaptchaMessage, splitAtAddress } from "./messages.ts";

test("every failure message names an email address for that form", () => {
  const codes = ["CAPTCHA_REQUIRED", "CAPTCHA_FAILED", "CAPTCHA_UNAVAILABLE", "CAPTCHA_NOT_CONFIGURED"] as const;
  for (const code of codes) {
    assert.ok(serverCaptchaMessage("contact", code).includes(CONTACT_EMAIL));
    assert.ok(serverCaptchaMessage("apply", code).includes(HR_EMAIL));
  }
  for (const reason of ["unavailable", "timeout", "error", "expired", "unsupported"] as const) {
    assert.ok(browserCaptchaMessage("contact", reason).includes(CONTACT_EMAIL));
    assert.ok(browserCaptchaMessage("apply", reason).includes(HR_EMAIL));
  }
});

test("the messages do not blame the visitor or name the vendor's internals", () => {
  const text = serverCaptchaMessage("contact", "CAPTCHA_FAILED").toLowerCase();
  assert.ok(!text.includes("bot"));
  assert.ok(!text.includes("turnstile"));
});

test("splitting a message around the address", () => {
  assert.deepEqual(splitAtAddress("write to a@b.co now", "a@b.co"), ["write to ", "a@b.co", " now"]);
  assert.equal(splitAtAddress("no address here", "a@b.co"), null);
});
