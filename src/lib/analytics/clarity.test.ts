import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CLARITY_CONSENT_KEY,
  acceptClarity,
  clarityProjectId,
  claritySnippet,
  declineClarity,
  isBannerCloseKey,
  isValidClarityId,
  readConsent,
  sendConsent,
  shouldLoadClarity,
  type ClarityWindow,
} from "./clarity.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

function fakeWindow() {
  const calls: unknown[][] = [];
  const win: ClarityWindow = { clarity: (...args: unknown[]) => void calls.push(args) };
  return { win, calls };
}

const src = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("Clarity loads only on Production with a valid ID", () => {
  assert.equal(clarityProjectId({ VERCEL_ENV: "production", NEXT_PUBLIC_CLARITY_PROJECT_ID: "testid123" }), "testid123");
  assert.equal(clarityProjectId({ VERCEL_ENV: "preview", NEXT_PUBLIC_CLARITY_PROJECT_ID: "testid123" }), null);
  assert.equal(clarityProjectId({ VERCEL_ENV: "development", NEXT_PUBLIC_CLARITY_PROJECT_ID: "testid123" }), null);
  assert.equal(clarityProjectId({ NEXT_PUBLIC_CLARITY_PROJECT_ID: "testid123" }), null);
  assert.equal(clarityProjectId({ VERCEL_ENV: "production" }), null);
  assert.equal(clarityProjectId({ VERCEL_ENV: "production", NEXT_PUBLIC_CLARITY_PROJECT_ID: "" }), null);
});

test("an ID that is not plain letters and digits is refused", () => {
  for (const bad of ['abc");alert(1);//', "abc def", "abc-123", "a".repeat(33), "<script>"]) {
    assert.equal(isValidClarityId(bad), false, bad);
    assert.equal(clarityProjectId({ VERCEL_ENV: "production", NEXT_PUBLIC_CLARITY_PROJECT_ID: bad }), null);
    assert.throws(() => claritySnippet(bad));
  }
  assert.equal(isValidClarityId("AbC123xyz"), true);
});

test("the tag is Clarity's standard snippet and sends consent once loaded", () => {
  const snippet = claritySnippet("testid123");
  assert.match(snippet, /https:\/\/www\.clarity\.ms\/tag\/"\+i/);
  assert.match(snippet, /"clarity","script","testid123"/);
  assert.ok(snippet.endsWith('window.clarity("consent");'));
  assert.ok(!snippet.includes("localStorage"));
});

test("no choice means no tag", () => {
  assert.equal(shouldLoadClarity(null, false), false);
});

test("Decline means no tag, in this visit and later ones", () => {
  assert.equal(shouldLoadClarity("declined", false), false);
});

test("Accept loads the tag, which sends consent", () => {
  assert.equal(shouldLoadClarity(null, true), true);
  const banner = src("components/analytics/ClarityConsentBanner.tsx");
  assert.match(banner, /acceptClarity\(storage\(\)\);\s*setAcceptedNow\(true\)/);
  assert.match(banner, /load \? \(\s*<Script id="ms-clarity" strategy="afterInteractive">\s*\{claritySnippet\(projectId\)\}/);
});

test("a stored Accept loads the tag on the next visit", () => {
  assert.equal(shouldLoadClarity("accepted", false), true);
  assert.equal(shouldLoadClarity(readConsent(memoryStorage({ [CLARITY_CONSENT_KEY]: "accepted" })), false), true);
});

test("the server render loads nothing until the stored choice is read", () => {
  const banner = src("components/analytics/ClarityConsentBanner.tsx");
  assert.match(banner, /const load = stored !== "unknown" && shouldLoadClarity\(stored, acceptedNow\)/);
});

test("the layout renders Clarity next to Analytics, guarded by the production check", () => {
  const layout = src("app/layout.tsx");
  assert.match(layout, /VERCEL_ENV: process\.env\.VERCEL_ENV/);
  assert.match(layout, /<Analytics \/>\s*\{CLARITY_PROJECT_ID \? <Clarity projectId=\{CLARITY_PROJECT_ID\} \/> : null\}/);
  const component = src("components/analytics/Clarity.tsx");
  // The banner is part of the Clarity component, so it shows only when Clarity is rendered.
  assert.match(component, /<ClarityConsentBanner projectId=\{projectId\} \/>/);
  assert.ok(!component.includes("<Script"));
  assert.match(src("components/analytics/ClarityConsentBanner.tsx"), /from "next\/script"/);
});

test("Accept stores the choice", () => {
  const storage = memoryStorage();
  acceptClarity(storage);
  assert.equal(storage.data.get(CLARITY_CONSENT_KEY), "accepted");
  assert.equal(readConsent(storage), "accepted");
});

test("Accept before the tag has loaded queues consent", () => {
  const win: ClarityWindow = {};
  sendConsent(win);
  assert.deepEqual(win.clarity?.q, [["consent"]]);
});

test("Decline stores the choice and sends nothing", () => {
  const storage = memoryStorage();
  const { win, calls } = fakeWindow();
  declineClarity(storage);
  assert.equal(storage.data.get(CLARITY_CONSENT_KEY), "declined");
  assert.equal(readConsent(storage), "declined");
  assert.deepEqual(calls, []);
  assert.equal(typeof win.clarity, "function");
});

test("Escape closes the banner without a choice", () => {
  assert.equal(isBannerCloseKey("Escape"), true);
  assert.equal(isBannerCloseKey("Esc"), true);
  assert.equal(isBannerCloseKey("Enter"), false);
  const banner = src("components/analytics/ClarityConsentBanner.tsx");
  assert.match(banner, /isBannerCloseKey\(event\.key\)\) setDismissed\(true\)/);
  assert.match(banner, /role="region"/);
  assert.match(banner, /aria-label="Analytics consent"/);
  assert.equal((banner.match(/type="button"/g) ?? []).length, 2);
});

test("no stored choice, an unknown value or broken storage all mean ask again", () => {
  assert.equal(readConsent(memoryStorage()), null);
  assert.equal(readConsent(memoryStorage({ [CLARITY_CONSENT_KEY]: "maybe" })), null);
  assert.equal(readConsent(undefined), null);
  const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(readConsent(broken), null);
  assert.doesNotThrow(() => declineClarity(broken));
});

test("the banner uses the site's Poppins font and no other", () => {
  const css = src("components/analytics/ClarityConsentBanner.module.css");
  assert.match(css, /font-family: var\(--font-poppins\), Arial, Helvetica, sans-serif;/);
  assert.equal((css.match(/font-family/g) ?? []).length, 1);
});

test("form fields and chat text are masked from recordings", () => {
  const apply = src("app/apply/[positionId]/ApplyForm.tsx");
  assert.match(apply, /<form\s+ref=\{formRef\}\s+data-clarity-mask="true"/);
  assert.match(apply, /className=\{styles\.success\}[^>]*data-clarity-mask="true"/);
  assert.match(apply, /className=\{styles\.alert\}[^>]*data-clarity-mask="true"/);
  const contact = src("app/contact/ContactPageClient.tsx");
  assert.match(contact, /<form\s+className=\{styles\.form\}\s+data-clarity-mask="true"/);
  const chat = src("components/organisms/shared/ChatLauncher.tsx");
  assert.match(chat, /aria-label="Chat messages"\s+data-clarity-mask="true"/);
  assert.match(chat, /className=\{styles\.composer\}[^>]*data-clarity-mask="true"/);
});
