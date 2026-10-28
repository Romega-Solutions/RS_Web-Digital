// One name rule shared by the Apply form, the Contact form and /api/contact.
//
// - Capitalises the first letter of each word and the letter after an
//   apostrophe or hyphen: "anne-marie o'neil" -> "Anne-Marie O'Neil".
// - Leaves a word alone when it was typed in mixed case (McDonald, DeVera);
//   only a lower-case first letter is raised ("mcDonald" -> "McDonald").
// - Keeps name particles ("de", "dela", "van" ...) as typed when they sit in
//   the middle of a name, so "Maria de la Cruz" is not forced to "De La".
// - Upper-cases a trailing generation numeral ("iii" -> "III").
// It runs on blur, never on every keystroke, so the caret does not jump.

const PARTICLES = new Set([
  "bin",
  "binti",
  "da",
  "das",
  "de",
  "del",
  "dela",
  "delas",
  "delos",
  "den",
  "der",
  "di",
  "do",
  "dos",
  "du",
  "ibn",
  "la",
  "las",
  "le",
  "los",
  "van",
  "von",
  "y",
]);

const GENERATION_NUMERAL = /^(ii|iii|iv|vi|vii|viii|ix)$/i;

function capitalizeParts(word: string): string {
  return word
    .toLowerCase()
    .replace(/(^|['’-])(\p{L})/gu, (_match, separator: string, letter: string) => {
      return separator + letter.toUpperCase();
    });
}

function isMixedCase(word: string): boolean {
  return /\p{Ll}/u.test(word) && /\p{Lu}/u.test(word.slice(1));
}

function raiseFirstLetter(word: string): string {
  return word.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());
}

export function smartName(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const last = words.length - 1;

  return words
    .map((word, index) => {
      if (isMixedCase(word)) return raiseFirstLetter(word);
      if (index > 0 && index < last && word === word.toLowerCase() && PARTICLES.has(word)) {
        return word;
      }
      if (index > 0 && index === last && GENERATION_NUMERAL.test(word)) {
        return word.toUpperCase();
      }
      return capitalizeParts(word);
    })
    .join(" ");
}
