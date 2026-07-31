import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../forms.js", import.meta.url), "utf8");
const context = {};
vm.runInNewContext(
  `${source}\nglobalThis.words = PRACTICE_WORDS; globalThis.pick = randomAlphabetPracticeWord;`,
  context
);

test("random alphabet practice words always include the selected letter", () => {
  for (const [letter, words] of Object.entries(context.words)) {
    const chosen = context.pick(letter, words[0]);
    assert.ok(chosen.includes(letter), `${chosen} should include ${letter}`);
    if (words.length > 1) assert.notEqual(chosen, words[0]);
  }
});
