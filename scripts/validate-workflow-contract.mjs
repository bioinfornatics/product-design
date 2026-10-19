#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let contractChecks = 0;
const ok = (condition, message) => {
  contractChecks += 1;
  if (!condition) failures.push(message);
};
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const ideate = read("skills/ideate/SKILL.md");
const index = read("skills/index/SKILL.md");
const build = read("skills/image-to-code/SKILL.md");
const qa = read("skills/design-qa/SKILL.md");
const context = read("skills/get-context/SKILL.md");
const clone = read("skills/url-to-code/SKILL.md");
const share = read("skills/share/SKILL.md");
const status = read("skills/project-status/SKILL.md");
const planning = read("references/planning-and-tracking.md");
const gates = read("references/product-decision-gates.md");
const main = read("templates/prototype/src/main.jsx");
const vite = read("templates/prototype/vite.config.mjs");

ok(ideate.includes("Run up to three isolated variant workers concurrently"), "ideate must parallelize independent variants when possible");
ok(ideate.includes("generate screens strictly sequentially"), "ideate must preserve sequential screen generation inside each variant");
ok(ideate.includes("distinct output directory"), "ideate parallel workers must use isolated output directories");
ok(ideate.includes("deterministic V1, V2, V3 order"), "ideate must preserve deterministic variant ordering");
ok(ideate.includes("Define exactly three candidate journeys"), "ideate must define complete candidate journeys");
ok(ideate.includes("Every Image Gen call produces exactly one full-size screen image"), "ideate must generate one full-size image per screen");
ok(ideate.includes("one separate board page per variant"), "ideate must create one board page per variant");
ok(ideate.includes("Reject a page if images are cropped"), "ideate must repair invalid board-page layouts");
ok(ideate.includes("Never ask Image Gen to divide one canvas into several screens"), "ideate must prohibit multi-screen image composites");
ok(ideate.includes("screen-set-approved"), "ideate must require screen-set approval");
ok(ideate.includes("1536 x 1024") && ideate.includes("1152 x 768"), "ideate must define model-aware landscape sizes");
ok(ideate.includes("relative image references"), "ideate HTML pages must use resolvable relative image references");
ok(ideate.includes("canonical manifest"), "ideate must freeze a canonical per-screen manifest");
ok(ideate.includes("exact path returned"), "ideate must consume exact returned generation paths");
ok(ideate.includes("1152 x 768"), "ideate must define MAI same-ratio dimensions");
ok(ideate.includes("claimAllowed: false"), "ideate must suppress unfair benchmark claims");
ok(ideate.includes("duplicate hashes"), "ideate must detect duplicate output hashes");
ok(!/1280 x 1024.*default|1536 x 1024.*default/.test(ideate), "ideate contains unsupported legacy default");
ok(index.includes("Never generate a multi-screen composite image"), "router must prohibit composite journey images");
ok(index.includes("Never interpret journey selection as permission to build"), "router must block premature build");
ok(build.includes("selected board page alone is not sufficient"), "image-to-code must reject board-page-only input");
ok(build.includes("every required screen"), "image-to-code must resolve complete screen set");
ok(qa.includes("each implemented state"), "design QA must compare each screen source");
const planningAwareFiles = [["router", index], ["get-context", context], ["ideate", ideate], ["image-to-code", build], ["url-to-code", clone], ["design-qa", qa], ["share", share], ["project-status", status]];
for (const [name, content] of planningAwareFiles) ok(content.includes("planning-aware routing and optional tracking"), name + " must reference planning-aware guidance");
for (const term of ["epic", "phase gate", "acceptance criteria", "dependencies", "ready", "blocked", "owner", "evidence", "next task"]) ok(planning.toLowerCase().includes(term), "planning guidance missing " + term);
ok(planning.includes("obtain confirmation"), "vocabulary trigger must require confirmation");
ok(planning.includes("simple one-shot request") && planning.includes("not enough"), "simple work must not trigger tracking");
ok(planning.includes("Never make a Product Design phase wait for a Beads update"), "tracking must not make circular gates");
ok(gates.includes("Multi-screen Image Gen composites"), "G2 must fail multi-screen composite outputs");
ok(gates.includes("board page or screenshot alone cannot pass G3"), "G3 must require individual screen sources");
ok(main.includes("lazy(") && !main.includes("await import"), "Vite template must avoid top-level await");
ok(vite.includes("strictPort: true"), "Vite template must use strict port");

const evalFiles = [];
function walk(directory) {
  for (const name of readdirSync(directory)) {
    const candidate = path.join(directory, name);
    if (statSync(candidate).isDirectory()) walk(candidate);
    else if (name === "evals.json") evalFiles.push(candidate);
  }
}
walk(path.join(root, "skills"));
evalFiles.push(path.join(root, "tests/evals/plugin-integration.json"));
let evalCases = 0;
const evalNames = new Set();
for (const file of evalFiles) {
  const document = JSON.parse(readFileSync(file, "utf8"));
  ok(Array.isArray(document.evals) && document.evals.length >= 3, `${file} needs at least 3 evals`);
  for (const item of document.evals ?? []) {
    evalCases += 1;
    evalNames.add(item.name);
    ok(item.id !== undefined && item.name && item.prompt && (item.expected_output || item.expected_sequence), `${file} has an incomplete eval`);
  }
}
for (const required of ["route-explicit-beads", "route-planning-vocabulary-as-offer", "do-not-route-simple-ready-word", "do-not-route-ordinary-two-step-request", "existing-beads-may-activate"]) ok(evalNames.has(required), "routing eval missing: " + required);

const evidenceContract = read("scripts/workflow-evidence-contract.mjs");
for (const symbol of ["validateG1", "validateIdeationEvidence", "validateScreenSetEvidence", "verifyLocalEvidenceFiles", "validateGateRecord", "validateDesignContract", "validateExperienceBlueprint"]) ok(evidenceContract.includes("function " + symbol), "missing evidence validator " + symbol);
for (const [name, content] of [["ideate", ideate], ["router", index], ["context", context], ["gates", gates]]) {
  ok(content.includes("full-evidence") && /[Mm]ulti-step/.test(content), name + " must require complete multi-step evidence");
  ok(content.includes("single-screen") && /lean/i.test(content), name + " must restrict lean to isolated single-screen work");
  ok(!/lean default|Lean is default|three representative anchors in lean/.test(content), name + " must not default product exploration to landing anchors");
}
ok(ideate.includes("end-to-end-journey-coverage.md"), "ideate must load the end-to-end coverage contract");
ok(read("scripts/ideation-contract.mjs").includes("multi-step requires full-evidence"), "manifest must reject partial multi-step evidence");
ok(!read("scripts/ideation-contract.mjs").includes("variant.screens.filter(item => item.id === variant.anchorScreenId)"), "executor must not truncate journeys to anchors");
ok(read("references/design-contract.md").includes("Calendar"), "design contract must distinguish calendar from metrics");
const experienceMethod = read("references/product-experience-method.md");
for (const [name, content] of [["router", index], ["context", context], ["ideate", ideate], ["build", build], ["QA", qa]]) ok(content.includes("product-experience-method.md"), name + " must carry value/intent/proactivity method through handoff");
for (const theme of ["Questions that change the design", "Intent-to-surface", "Proactivity that reduces work", "Native deliverables", "question → answer/provenance → design decision → scenario/screen → verification"]) ok(experienceMethod.includes(theme), "experience method missing " + theme);
for (const scenario of ["responsibility-value-before-stack", "feedback-tables-change-decisions", "intent-in-place-not-transcript", "future-opportunity-prepared-work", "bounded-agents-not-notification-supervision", "native-presentation-brand-separation", "value-intent-proactivity-through-build"]) ok(evalNames.has(scenario), "experience eval missing " + scenario);
ok(!context.includes("generate visual directions with distinctly different palettes"), "context must not use palette-only directions for product ideation");
for (const symbol of ["validateDesignQaReport","assertBeadsClosure","validateAnnotationReceipt","validateArtifactIndex","validateBuildHandoff"]) ok(evidenceContract.includes("function "+symbol), "missing upstream validator "+symbol);
const executableContract = read("references/executable-transitions.md");
for (const [name, content] of [["context", context], ["ideate", ideate], ["build", build], ["clone", clone], ["QA", qa]]) ok(content.includes("executable-transitions.md") && content.includes("check-workflow-evidence.mjs") && content.includes("--consume"), name + " must execute and consume transition checks");
for (const operation of ["brief-to-ideation", "source-selection", "source-set-approval", "prototype-build", "review-handoff"]) ok(executableContract.includes(operation), "executable contract missing " + operation);
ok(qa.includes("design-qa.json") && qa.includes("authoritative"), "QA must use canonical JSON authority");
ok(read("scripts/check-workflow-evidence.mjs").includes("advanceGateTransaction"), "adapter must preserve ordered transition transaction");
ok(index.includes("load skills product-design:{name}"), "router must use explicit runtime Skill loading");
for (const name of ["index", "get-context", "research", "ideate", "image-to-code", "url-to-code", "design-qa", "audit", "share", "annotate", "annotate-inject", "user-context", "project-status"]) ok(read("skills/" + name + "/SKILL.md").includes("load skills product-design:{name}"), name + " must declare exact runtime loading");
if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ status: "passed", contractChecks, evalFiles: evalFiles.length, evalCases }, null, 2));
