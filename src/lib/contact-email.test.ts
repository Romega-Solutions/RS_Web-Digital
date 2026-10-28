import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildContactEmailHtml } from "./contact-email.ts";

const base = {
  firstName: "Juan",
  lastName: "Cruz",
  email: "juan@example.com",
  subject: "General Inquiry",
  company: "Acme",
  phone: "+639175551234",
  message: "Hello there",
};

test("every visitor-supplied value is escaped in the email body", () => {
  const evil = `<img src=x onerror="alert(1)">`;
  const html = buildContactEmailHtml(
    { ...base, firstName: evil, lastName: evil, email: evil, phone: evil, company: evil, subject: evil, message: `${evil}<script>alert(2)</script>` },
    "Wednesday <b>now</b>",
  );
  assert.ok(!html.includes("<img"), "no raw img tag");
  assert.ok(!html.includes("<script"), "no raw script tag");
  assert.ok(!html.includes("<b>now"), "date is escaped too");
  assert.ok(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(html.includes("&lt;script&gt;alert(2)&lt;/script&gt;"));
});

test("ordinary text, '#' and '--' come through unchanged", () => {
  const html = buildContactEmailHtml({ ...base, message: "Suite #5 -- 12th Floor\nSecond line" }, "now");
  assert.ok(html.includes("Suite #5 -- 12th Floor\nSecond line"));
});

test("an empty company shows 'Not provided'", () => {
  assert.ok(buildContactEmailHtml({ ...base, company: "" }, "now").includes("Not provided"));
});

test("the contact route builds its email with the escaping builder and has no word-pattern filter", () => {
  const route = readFileSync(new URL("../app/api/contact/route.ts", import.meta.url), "utf8");
  assert.ok(route.includes("buildContactEmailHtml("));
  assert.ok(!route.includes("hasMaliciousPattern"));
  assert.ok(!route.includes("suspicious_input"));
  assert.ok(!/\$\{body\.(firstName|lastName|email|phone|company|message)\}/.test(route), "no raw interpolation in the route");
});
