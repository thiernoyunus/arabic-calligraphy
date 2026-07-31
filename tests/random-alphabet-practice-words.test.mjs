import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const letters = readFileSync(new URL("../letters.js", import.meta.url), "utf8");
const forms = readFileSync(new URL("../forms.js", import.meta.url), "utf8");
const context = {};
vm.runInNewContext(
  `${letters}\n${forms}\nglobalThis.words = PRACTICE_WORDS; globalThis.pool = PRACTICE_POOL; globalThis.pick = randomAlphabetPracticeWord;`,
  context
);

test("random alphabet practice words always include the selected letter", () => {
  for (const [letter, words] of Object.entries(context.words)) {
    const chosen = context.pick(letter, words[0]);
    assert.ok(chosen.includes(letter), `${chosen} should include ${letter}`);
    assert.ok(!words.includes(chosen), `${chosen} should not be a visible preset`);
  }
});

test("ba has fresh random words at the start, middle, and end", () => {
  const words = context.pool.filter(
    (word) =>
      word.includes("ب") &&
      !word.includes(" ") &&
      !context.words.ب.includes(word)
  );
  assert.ok(words.some((word) => word.startsWith("ب")));
  assert.ok(words.some((word) => word.endsWith("ب")));
  assert.ok(words.some((word) => word.indexOf("ب") > 0 && !word.endsWith("ب")));
});
