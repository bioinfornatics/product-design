import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateDesignQaReport } from "./workflow-evidence-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFileSync(path.join(root, file), "utf8");

function report(consoleCheck = { checked: true, errors: [] }) {
  return {
    schemaVersion: 1,
    states: [{ id: "s1", route: "/", state: "ready", sourcePath: "/fixture/source.png", renderedPath: "/fixture/render.png", combinedComparisonPath: "/fixture/compare.png", viewport: { width: 1440, height: 900 }, surfaces: { typography: "reviewed", spacing: "reviewed", colors: "reviewed", images: "reviewed", copy: "reviewed" }, console: consoleCheck }],
    history: [], openP0P1P2: 0, g5: { execution: "pass", productTestValidity: "pass" }, finalResult: "passed",
  };
}

test("console policy preserves legacy checked evidence and explicitly available checks", () => {
  assert.equal(validateDesignQaReport(report()).finalResult, "passed");
  assert.equal(validateDesignQaReport(report({ availability: "available", checked: true, errors: [] })).finalResult, "passed");
});
test("unavailable console needs an honest reason and cannot masquerade as checked", () => {
  assert.equal(validateDesignQaReport(report({ availability: "unavailable", checked: false, reason: "Browser exposes capture and interactions, no console API", errors: [] })).finalResult, "passed");
  assert.throws(() => validateDesignQaReport(report({ availability: "unavailable", checked: false, errors: [] })), /reason/);
  assert.throws(() => validateDesignQaReport(report({ availability: "unavailable", checked: true, reason: "missing API", errors: [] })), /cannot be checked/);
});
test("available, malformed or error-bearing console evidence cannot pass", () => {
  for (const check of [{ checked: false, errors: [] }, { availability: "available", checked: false, reason: "skip", errors: [] }, { availability: "unknown", checked: true, errors: [] }, { availability: null, checked: true, errors: [] }, { availability: "unavailable", checked: false, reason: "missing API" }]) assert.throws(() => validateDesignQaReport(report(check)));
  for (const availability of ["available", "unavailable"]) assert.throws(() => validateDesignQaReport(report({ availability, checked: availability === "available", reason: "missing API", errors: ["TypeError"] })), /runtime console errors/);
});
test("console limitation never waives source/render evidence or both G5 checks", () => {
  const r = report({ availability: "unavailable", checked: false, reason: "missing API", errors: [] });
  r.states[0].renderedPath = ""; assert.throws(() => validateDesignQaReport(r), /renderedPath/);
  const q = report(); q.g5.productTestValidity = "blocked"; assert.throws(() => validateDesignQaReport(q), /both G5/);
});
test("router and brief do not bypass involved-work G1 after only target/outcome", () => {
  const router = read("skills/index/SKILL.md"), context = read("skills/get-context/SKILL.md");
  assert.doesNotMatch(router, /Require only a clear design target/);
  assert.match(router, /G1 is not blocked/); assert.match(context, /universal minimum, not the whole involved-work brief/);
  assert.ok(router.includes("execute capture/build after the brief playback"));
});
test("saved-context read and save permissions are distinct", () => {
  const router = read("skills/index/SKILL.md"), context = read("skills/user-context/SKILL.md");
  assert.doesNotMatch(router, /Route here before Product Design workflows to load saved/);
  assert.match(router, /not a prerequisite for ordinary workflows/);
  assert.match(context, /Do not require write access or create a directory for a read request/);
});
test("asset reuse, CSS surfaces and approved routes keep one meaning", () => {
  const build = read("skills/image-to-code/SKILL.md"), shared = read("references/critical-overrides.md");
  assert.match(build, /reuse supplied or authorized source files first/);
  assert.doesNotMatch(build, /create individual images for each one/);
  assert.match(build, /Ordinary UI backgrounds/);
  assert.ok(shared.includes("necessary pages/routes"));
  assert.doesNotMatch(build, /Do not create new pages or routes unless the user asks/);
});
test("optional annotation requires consent and project verification, not a tool-presence claim", () => {
  const shared = read("references/critical-overrides.md"), build = read("skills/image-to-code/SKILL.md");
  assert.match(shared, /explicit installation request or confirmation/);
  assert.match(shared, /installed and verified in the handed-off project/);
  assert.match(build, /do not claim usability or block the ordinary verified handoff/);
});
test("discovery questions reach every material design phase without a questionnaire", () => {
  for (const name of ["get-context", "research", "ideate", "image-to-code", "design-qa"]) assert.ok(read("skills/" + name + "/SKILL.md").includes("product-discovery-questions.md"), name);
  const questions = read("references/product-discovery-questions.md");
  for (const term of ["Current alternative", "Viability and adoption", "AI usefulness", "Safety and responsibility", "baseline measure", "continue/change/stop", "do not build yet", "results **not run**"]) assert.ok(questions.includes(term), term);
  assert.match(questions, /not a questionnaire/);
});

test("discovery-only completion does not require framework or generation", () => {
  const brief = read("skills/get-context/SKILL.md"), router = read("skills/index/SKILL.md");
  assert.ok(brief.includes("before framework detection or visual generation"));
  assert.ok(brief.includes("do not require a framework, generated sources or a fictitious ideation gate"));
  assert.ok(router.includes("A discovery-only or no-build decision does not trigger generation"));
});
test("Vite legacy route exception is explicit while Next.js underscore routes stay forbidden", () => {
  const inject = read("skills/annotate-inject/SKILL.md");
  assert.ok(inject.includes("legacy `/__goose-annotate`"));
  assert.ok(inject.includes("Never name a Next.js route/folder with a leading underscore"));
  assert.ok(inject.includes("Do not rename only one side"));
});
