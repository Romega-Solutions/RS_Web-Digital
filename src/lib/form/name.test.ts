import assert from "node:assert/strict";
import test from "node:test";
import { smartName } from "./name.ts";

test("capitalises each word", () => {
  assert.equal(smartName("julian duane vargas"), "Julian Duane Vargas");
  assert.equal(smartName("JUAN DELA CRUZ"), "Juan Dela Cruz");
});

test("handles apostrophes and hyphens", () => {
  assert.equal(smartName("o'neil"), "O'Neil");
  assert.equal(smartName("O'NEIL"), "O'Neil");
  assert.equal(smartName("anne-marie"), "Anne-Marie");
  assert.equal(smartName("anne-marie o\u2019brien"), "Anne-Marie O\u2019Brien");
});

test("keeps names typed in mixed case", () => {
  assert.equal(smartName("McDonald"), "McDonald");
  assert.equal(smartName("john DeVera"), "John DeVera");
  assert.equal(smartName("mcDonald"), "McDonald");
});

test("keeps particles as typed when they sit mid-name", () => {
  assert.equal(smartName("maria de la cruz"), "Maria de la Cruz");
  assert.equal(smartName("ludwig van beethoven"), "Ludwig van Beethoven");
  assert.equal(smartName("Maria De La Cruz"), "Maria De La Cruz");
  // a particle at the start or the end is still a name
  assert.equal(smartName("de la"), "De La");
  assert.equal(smartName("juan dela"), "Juan Dela");
});

test("upper-cases a trailing generation numeral", () => {
  assert.equal(smartName("john smith iii"), "John Smith III");
  assert.equal(smartName("vi"), "Vi");
});

test("trims and collapses whitespace, keeps letters outside A-Z", () => {
  assert.equal(smartName("  jose   p.  rizal "), "Jose P. Rizal");
  assert.equal(smartName("\u00f1ora pe\u00f1a"), "\u00d1ora Pe\u00f1a");
  assert.equal(smartName("   "), "");
});

test("is stable when run twice", () => {
  for (const input of ["julian duane vargas", "o'neil", "McDonald", "maria de la cruz"]) {
    assert.equal(smartName(smartName(input)), smartName(input));
  }
});

test("upper-casing gives the same result in every browser language", () => {
  assert.equal(smartName("isabel"), "Isabel");
  assert.equal(smartName("ilona i\u0307ris"), "Ilona I\u0307ris");
});

test("the Filipino and Spanish particles stay lower-case mid-name", () => {
  assert.equal(smartName("juan del rosario"), "Juan del Rosario");
  assert.equal(smartName("juan delos santos"), "Juan delos Santos");
  assert.equal(smartName("juan dela cruz"), "Juan dela Cruz");
  assert.equal(smartName("maria clara de la cruz"), "Maria Clara de la Cruz");
  assert.equal(smartName("pedro de leon"), "Pedro de Leon");
  assert.equal(smartName("JUAN DEL ROSARIO"), "Juan Del Rosario");
});
