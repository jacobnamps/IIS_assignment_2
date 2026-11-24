// Checks the scenario data. Run with:  node tests/check-scenarios.js
//
// These are the same checks the planned live-LLM Validator would run on every model
// response (see README): the advice has the right shape, and the quoted passage
// really exists in the fact sheet it claims to come from.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const code = fs.readFileSync(path.join(__dirname, "..", "scenarios.js"), "utf8");
const ctx = {};
vm.runInNewContext(code + "\nthis.SCENARIOS = SCENARIOS;", ctx);
const SCENARIOS = ctx.SCENARIOS;

let failures = 0;
const fail = (id, msg) => { failures++; console.log(`FAIL [${id}] ${msg}`); };

for (const s of SCENARIOS) {
  const a = s.advice, g = s.groundTruth;
  const optionIds = s.options.map(o => o.id);

  // 1. Shape (what a JSON schema would enforce)
  if (!["advice", "decline"].includes(a.status)) fail(s.id, "status must be advice or decline");
  if (a.status === "advice" && !optionIds.includes(a.recommendation)) fail(s.id, "recommendation is not an option");
  if (a.status === "decline" && a.recommendation !== null) fail(s.id, "a decline must not recommend");
  for (const k of ["summary", "reasoning", "checkThis"]) if (!a[k]) fail(s.id, `missing ${k}`);

  // 2. Provenance: the quote must appear in the named sheet and section
  const sheet = s.factSheets.find(f => f.name === a.source.sheet);
  if (!sheet) fail(s.id, `source sheet not found: ${a.source.sheet}`);
  else {
    const sec = sheet.sections.find(x => a.source.section.startsWith(x.heading));
    if (!sec) fail(s.id, `source section not found: ${a.source.section}`);
    else if (!sec.text.includes(a.source.quote)) fail(s.id, "quote does not appear in the cited section");
    if (!sheet.date.includes(a.source.date)) fail(s.id, "source date does not match the sheet date");
  }

  // 3. Ground truth is consistent with the advice
  if (a.status === "advice") {
    if (!optionIds.includes(g.correctOption)) fail(s.id, "correctOption is not an option");
    if ((a.recommendation === g.correctOption) !== g.adviceCorrect) fail(s.id, "adviceCorrect flag is inconsistent");
  }
}

const correct = SCENARIOS.filter(s => s.groundTruth.adviceCorrect === true).length;
const wrong = SCENARIOS.filter(s => s.groundTruth.adviceCorrect === false).length;
const declines = SCENARIOS.filter(s => s.advice.status === "decline").length;
console.log(`${SCENARIOS.length} scenarios: ${correct} correct advice, ${wrong} wrong advice, ${declines} decline`);
console.log(failures ? `${failures} problem(s) found` : "All checks passed");
process.exit(failures ? 1 : 0);
