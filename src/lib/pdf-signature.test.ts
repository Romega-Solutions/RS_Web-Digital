import assert from "node:assert/strict";
import test from "node:test";
import { hasPdfSignature, isPdfFile } from "./pdf-signature.ts";

const bytes = (text: string) => new TextEncoder().encode(text);

test("accepts a file that starts with %PDF-", () => {
  assert.equal(hasPdfSignature(bytes("%PDF-1.7\n%âãÏÓ")), true);
});

test("rejects other file types, even with a .pdf name", () => {
  assert.equal(hasPdfSignature(bytes("\x89PNG\r\n\x1a\n")), false);
  assert.equal(hasPdfSignature(bytes("PK\x03\x04")), false);
  assert.equal(hasPdfSignature(bytes("<html><script>alert(1)</script>")), false);
  assert.equal(hasPdfSignature(bytes("MZ\x90\x00")), false);
});

test("rejects text that only mentions the signature further in, or in another case", () => {
  assert.equal(hasPdfSignature(bytes(" %PDF-1.4")), false);
  assert.equal(hasPdfSignature(bytes("%pdf-1.4")), false);
  assert.equal(hasPdfSignature(bytes("%PDF")), false);
});

test("rejects an empty or very short file", () => {
  assert.equal(hasPdfSignature(new Uint8Array()), false);
  assert.equal(hasPdfSignature(bytes("%PD")), false);
});

test("isPdfFile reads only the first bytes of a File", async () => {
  assert.equal(await isPdfFile(new File(["%PDF-1.4 rest of the file"], "cv.pdf", { type: "application/pdf" })), true);
  assert.equal(await isPdfFile(new File(["GIF89a"], "cv.pdf", { type: "application/pdf" })), false);
  assert.equal(await isPdfFile(new File([], "cv.pdf")), false);
});
