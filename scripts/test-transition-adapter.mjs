import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fixture } from "../tests/fixtures/transition-evidence.mjs";
import { experienceFixture } from "../tests/fixtures/experience-blueprint.mjs";
import { sha256 } from "./workflow-evidence-contract.mjs";
import { checkTransition, snapshotImplementation, renderQa } from "./check-workflow-evidence.mjs";
const cli = fileURLToPath(new URL("./check-workflow-evidence.mjs", import.meta.url));
const stamp = "2026-10-18T20:00:00Z";
function setup(workflow = "generated", scopeKind = "multi-step") {
  const root = mkdtempSync(path.join(tmpdir(), "pd-adapter-"));
  const json = (name, value) => { const p = path.join(root, name); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(value, null, 2) + "\n"); return p; };
  const bytes = (name, value = name) => { const p = path.join(root, name); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, value); return { path: p, sha256: sha256(value) }; };
  const f = fixture(scopeKind);
  for (const source of f.evidence.screens) { Object.assign(source, bytes("sources/" + source.id + ".png", "synthetic source " + source.id)); source.review.inspectedPath = source.path; source.review.inspectedSha256 = source.sha256; }
  f.selection.selectedAnchorPath = f.evidence.candidates[2].path; f.selection.selectedAnchorSha256 = f.evidence.candidates[2].sha256;
  f.selection.evidenceHash = sha256(f.evidence); f.selection.evidencePath = json("comparison.json", f.evidence);
  f.set.approval.screenSetHash = sha256(f.set.screens);
  const scope = "Mentoring bounded scenario";
  let set = f.set;
  if (workflow !== "generated") {
    set = { schemaVersion: 1, kind: "approved-target-set", origin: workflow, scopeKind, selectedDirection: "Previously selected workspace", inventory: f.set.screens.map((s, i) => ({ id: s.id, purpose: "Bounded task evidence", role: scopeKind === "single-screen" ? "isolated" : ["action", "action", "outcome", "critical-recovery"][i] })), boundaries: { start: "Need booking", outcome: "Booking confirmed", recovery: "Slot unavailable; choose another" }, screens: structuredClone(f.set.screens), approval: { ...f.set.approval } };
    for (const s of set.screens) s.provenance = workflow;
    set.approval.screenSetHash = sha256(set.screens);
  }
  const setPath = json("set.json", set);
  const g3 = { schemaVersion: 2, gate: "G3", status: "screen-set-approved", verdict: "pass", owner: "fixture-owner", scope, timestamp: stamp, evidencePath: setPath, evidenceHash: sha256(set), readyFor: "build-handoff", screenSetApproved: true, buildApproved: false };
  const requiredStates = set.screens.map(s => ({ id: s.id + "-desktop", sourceId: s.id, route: "/booking", state: "Frozen state " + s.id, viewport: { width: 1536, height: 1024 } }));
  const executionContract = { schemaVersion: 1, projectRoot: root, scope, target: "Mentoring frontend", outcome: "Booking confirmation", hypothesis: "Useful booking path, not measured", successCriterion: "Complete booking and recover from unavailable slot", mockData: "Fictional mentor data", outOfScope: "Real identity, booking services and production", framework: "Vite mock frontend", designSystem: "Neutral fixture tokens", implementationPaths: ["src", "package.json"], requiredStates };
  const g4 = { ...g3, gate: "G4", status: "approved-for-build", readyFor: "prototype-build", buildApproved: true, executionContract };
  bytes("src/app.js", "synthetic implementation"); bytes("package.json", "{}");
  const request = { schemaVersion: 1, operation: "prototype-build", workflow, involved: false, scope, target: executionContract.target, outcome: executionContract.outcome, owner: "fixture-owner", timestamp: stamp, manifest: json("manifest.json", f.manifest), selection: json("g2.json", f.selection), sourceApproval: json("g3.json", g3), buildApproval: json("g4.json", g4) };
  if (workflow === "historical-selection") request.priorSelection = json("prior-selection.json", { schemaVersion: 1, kind: "historical-selection", selectedDirection: set.selectedDirection, comparisonComplete: false, owner: "fixture-owner", timestamp: stamp, statement: "Earlier direction selected; comparison was incomplete" });
  const qa = { schemaVersion: 1, scope, timestamp: stamp, reviewer: "fixture-reviewer", approvedScreenSetHash: sha256(set), buildApprovalHash: sha256(g4), requiredStates, implementationFiles: snapshotImplementation(root, executionContract.implementationPaths), states: requiredStates.map(state => {
    const source = set.screens.find(s => s.id === state.sourceId), render = bytes("captures/" + state.id + ".png"), comparison = bytes("comparisons/" + state.id + ".png"), interaction = bytes("interactions/" + state.id + ".json", '{"synthetic":true}');
    return { ...state, sourcePath: source.path, sourceSha256: source.sha256, renderedPath: render.path, renderedSha256: render.sha256, combinedComparisonPath: comparison.path, combinedComparisonSha256: comparison.sha256, surfaces: Object.fromEntries(["typography", "spacing", "colors", "images", "copy"].map(s => [s, "Synthetic review declaration, not pixel evidence"])), focusedComparison: "Fixture has no real pixels; full-view details assumed readable only for structural test", interactions: [{ action: "Click booking", expected: "Confirmation", observed: "Fictional confirmation", result: "pass", evidencePath: interaction.path, evidenceSha256: interaction.sha256 }], accessibility: "Declared fixture keyboard/contrast checks", responsiveness: "Declared fixture desktop viewport", console: { availability: "available", checked: true, errors: [] } };
  }), findings: [], history: [], openP0P1P2: 0, blockers: [], limitations: ["Synthetic fixture proves structure only, not fidelity or UX"], g5: { execution: "pass", productTestValidity: "pass", userStudy: "not run" }, finalResult: "passed" };
  request.qa = json("design-qa.json", qa);
  const g5 = { ...g3, gate: "G5", status: "QA-passed", readyFor: "review-handoff", evidencePath: request.qa, evidenceHash: sha256(qa) };
  request.reviewGate = json("g5.json", g5);
  const save = () => { json("set.json", set); json("g3.json", g3); json("g4.json", g4); json("design-qa.json", qa); g5.evidenceHash = sha256(qa); json("g5.json", g5); json("request.json", request); };
  const check = (options = {}) => checkTransition({ project: root, requestPath: "request.json", ...options });
  save();
  return { root, json, bytes, f, request, set, g3, g4, g5, qa, save, check, close: () => rmSync(root, { recursive: true, force: true }) };
}
async function withFixture(action, workflow, scope) { const f = setup(workflow, scope); try { await action(f); } finally { f.close(); } }
const passed = result => assert.equal(result.status, "passed", result.reason);
const blocked = result => { assert.equal(result.status, "blocked"); assert.equal(result.readyFor, null); return result; };

test("generated transitions publish phase-limited receipts and consume unchanged dependencies", async () => withFixture(async f => {
  for (const operation of ["brief-to-ideation", "source-selection", "source-set-approval", "prototype-build", "review-handoff"]) {
    f.request.operation = operation; f.save(); passed(await f.check()); passed(await f.check({ consume: true }));
  }
  assert.equal(readFileSync(path.join(f.root, "design-qa.md"), "utf8"), renderQa(f.qa));
}));
test("provided targets, exact clones and historical continuations preserve exemptions", async t => {
  for (const workflow of ["provided-target", "exact-clone", "historical-selection"]) for (const scope of ["single-screen", "multi-step"]) await t.test(workflow + "/" + scope, () => withFixture(async f => {
    rmSync(path.join(f.root, "comparison.json")); rmSync(path.join(f.root, "g2.json")); rmSync(path.join(f.root, "manifest.json"));
    for (const operation of ["source-set-approval", "prototype-build", "review-handoff"]) { f.request.operation = operation; f.save(); passed(await f.check()); passed(await f.check({ consume: true })); }
  }, workflow, scope));
});
test("involved work checks G1 and blueprint; build-bound blocker does not block brief", async () => withFixture(async f => {
  const exp = experienceFixture(); const g1 = { schemaVersion: 2, gate: "G1", owner: "fixture-owner", timestamp: stamp, problem: "p", targetUser: "u", outcome: "o", productValue: "v", successCriterion: "s", reviewFramework: "r", productionDestination: "mock", designSystem: "neutral", confidence: "low", score: 80, scoreBasis: Object.fromEntries(["problemClarity", "userImportance", "outcome", "productValue", "measurableSuccess", "evidence", "constraintsRisks", "ideationScope"].map(k => [k, 4])), verdict: "experiment", evidenceLabels: ["stakeholder-input"], conditions: [{ boundary: "build", disposition: "blocked", detail: "Need feasibility evidence" }] };
  Object.assign(f.request, { involved: true, g1: f.json("g1.json", g1), designContract: f.json("contract.json", exp.designContract), blueprint: f.json("blueprint.json", exp.blueprint), operation: "brief-to-ideation" }); f.save(); passed(await f.check());
  f.request.operation = "prototype-build"; f.save(); assert.match(blocked(await f.check()).reason, /G1 blocker/);
  g1.conditions = []; f.json("g1.json", g1); passed(await f.check());
  exp.blueprint.traceability = []; f.json("blueprint.json", exp.blueprint); blocked(await f.check());
}));

test("phase/scope/approval misuse blocks before mirror", async t => {
  const mutations = {
    g2AsBuild: f => f.request.buildApproval = f.request.selection,
    wrongScope: f => f.g4.scope = "Other scope",
    experimentG4: f => f.g4.verdict = "experiment",
    wrongRoot: f => f.g4.executionContract.projectRoot = "/tmp/wrong",
    wrongStateSource: f => f.g4.executionContract.requiredStates[0].sourceId = "unknown",
    wrongEvidence: f => f.g4.evidenceHash = "0".repeat(64),
    missingApproval: f => f.set.approval.screenSetApproved = false,
    incompleteSet: f => f.set.screens.pop(),
    reorderedSet: f => f.set.screens.reverse(),
    unknownWorkflow: f => f.request.workflow = "skip-gates",
    malformedRequest: f => f.request.schemaVersion = 9
  };
  for (const [name, mutate] of Object.entries(mutations)) await t.test(name, () => withFixture(async f => { mutate(f); f.save(); let calls = 0; blocked(await f.check({ mirrorBeads: async () => calls++ })); assert.equal(calls, 0); }));
});
test("missing or edited source bytes invalidate readiness and persist failures", async () => withFixture(async f => {
  passed(await f.check()); writeFileSync(f.set.screens[0].path, "edited"); blocked(await f.check({ consume: true }));
  assert.equal(JSON.parse(readFileSync(path.join(f.root, ".gates/prototype-build.receipt.json"))).status, "blocked");
  assert.ok(readdirSync(path.join(f.root, ".gates/failed-attempts")).length);
}));
test("QA required-state identity, coverage, files and schema reject false pass", async t => {
  const mutations = {
    missingRecovery: f => f.qa.states.pop(), duplicateState: f => f.qa.states.push(f.qa.states[0]),
    wrongSource: f => f.qa.states[0].sourceId = "wrong", wrongRoute: f => f.qa.states[0].route = "/other", wrongViewport: f => f.qa.states[0].viewport = { width: 0, height: 10 },
    staleRender: f => writeFileSync(f.qa.states[0].renderedPath, "edited"), missingComparison: f => rmSync(f.qa.states[0].combinedComparisonPath),
    wrongApproval: f => f.qa.buildApprovalHash = "0".repeat(64), missingInteraction: f => f.qa.states[0].interactions = [],
    failedInteraction: f => f.qa.states[0].interactions[0].result = "blocked", noAccessibility: f => f.qa.states[0].accessibility = "",
    uncheckedConsole: f => f.qa.states[0].console.checked = false, runtimeErrors: f => f.qa.states[0].console.errors = ["Runtime failure"],
    missingG5: f => f.request.reviewGate = "missing.json", wrongG5: f => f.g5.gate = "G4",
    blockedG5: f => f.qa.g5.productTestValidity = "blocked", canonicalPath: f => f.request.qa = f.json("other.json", f.qa),
    noResolvedHistory: f => f.qa.findings.push({ id: "P", severity: "P1", status: "resolved", location: "x", detail: "x", evidence: "x", impact: "x", fix: "x" })
  };
  for (const [name, mutate] of Object.entries(mutations)) await t.test(name, () => withFixture(async f => { f.request.operation = "review-handoff"; mutate(f); f.save(); blocked(await f.check()); }));
});
test("honest unavailable console passes with limitation, malformed or skipped available check does not", async () => withFixture(async f => {
  f.request.operation = "review-handoff"; f.qa.states[0].console = { availability: "unavailable", checked: false, errors: [], reason: "Browser API not exposed" }; f.qa.limitations.push("Runtime console unchecked"); f.save(); passed(await f.check());
  f.qa.states[0].console.availability = null; f.save(); blocked(await f.check());
}));
test("new, deleted and changed implementation files invalidate QA; paths cannot exclude themselves", async t => {
  for (const mutation of [f => f.bytes("src/new.js"), f => rmSync(path.join(f.root, "src/app.js")), f => writeFileSync(path.join(f.root, "package.json"), '{"changed":true}')]) await t.test("implementation change", () => withFixture(async f => { f.request.operation = "review-handoff"; f.save(); passed(await f.check()); mutation(f); blocked(await f.check({ consume: true })); }));
  await withFixture(async f => { assert.throws(() => snapshotImplementation(f.root, ["."]), /project root/); assert.throws(() => snapshotImplementation(f.root, ["src", "src/app.js"]), /nonoverlapping/); assert.throws(() => snapshotImplementation(f.root, [".gates"]), /excluded/); });
});
test("blocked QA lacking rendered capability is canonical, archived and never grants readiness", async () => withFixture(async f => {
  f.request.operation = "review-handoff"; f.qa.finalResult = "blocked"; f.qa.states = f.qa.requiredStates.map(s => ({ ...s, notRunReason: "No browser capture capability" })); f.qa.blockers = ["Browser capture missing"]; f.qa.g5.execution = "blocked"; f.save();
  const r = blocked(await f.check()); assert.equal(r.qaAttempts.length, 1); assert.match(readFileSync(path.join(f.root, "design-qa.md"), "utf8"), /final result: blocked/); blocked(await f.check({ consume: true }));
}));
test("blocked-to-passed retains immutable material findings and fix/recapture history", async () => withFixture(async f => {
  f.request.operation = "review-handoff";
  const finding = { id: "layout", severity: "P2", status: "open", location: "Booking", detail: "Control clipped", evidence: "Fixture capture", impact: "Task hidden", fix: "Reflow" };
  f.qa.findings = [finding]; f.qa.openP0P1P2 = 1; f.qa.finalResult = "blocked"; f.qa.blockers = ["Clipped control"]; f.qa.g5.execution = "blocked"; f.save(); const earlier = blocked(await f.check());
  f.qa.finalResult = "passed"; f.qa.openP0P1P2 = 0; f.qa.blockers = []; f.qa.g5.execution = "pass"; f.qa.findings = []; f.save(); assert.match(blocked(await f.check()).reason, /disappeared/);
  // Failure must preserve the earlier archive ledger for a resumable correction.
  f.qa.findings = [{ ...finding, status: "resolved" }];
  const state = f.qa.states[0], beforePath = state.renderedPath, beforeSha256 = state.renderedSha256;
  const after = f.bytes("captures/after.png"), comparison = f.bytes("comparisons/after.png"); state.renderedPath = after.path; state.renderedSha256 = after.sha256; state.combinedComparisonPath = comparison.path; state.combinedComparisonSha256 = comparison.sha256;
  f.qa.history = [{ findingId: "layout", severity: "P2", stateId: state.id, finding: "Control clipped", fix: "Reflow", timestamp: stamp, beforePath, beforeSha256, afterPath: after.path, afterSha256: after.sha256, comparisonPath: comparison.path, comparisonSha256: comparison.sha256 }]; f.save();
  const later = await f.check(); passed(later); assert.equal(later.qaAttempts.length, 2); assert.equal(readFileSync(earlier.qaAttempts[0].path).includes(Buffer.from('"status": "open"')), true); passed(await f.check({ consume: true }));
  f.qa.history = []; f.save(); blocked(await f.check());
}));
test("JSON/Markdown divergence blocks consumption and regenerating canonical view repairs it", async () => withFixture(async f => {
  f.request.operation = "review-handoff"; f.save(); passed(await f.check()); writeFileSync(path.join(f.root, "design-qa.md"), "fake pass"); blocked(await f.check({ consume: true })); passed(await f.check()); passed(await f.check({ consume: true }));
}));
test("optional mirror failure or mutation during transaction produces no passed readiness", async () => withFixture(async f => {
  const r = blocked(await f.check({ mirrorBeads: async () => { throw new Error("Mirror interrupted"); } })); assert.match(r.reason, /Mirror interrupted/);
  assert.ok(readdirSync(path.join(f.root, ".gates/gate-history")).length); passed(await f.check());
  blocked(await f.check({ mirrorBeads: async () => writeFileSync(f.set.screens[0].path, "changed during mirror") }));
}));
test("symlink escapes, output links and implementation cycles are rejected", async () => withFixture(async f => {
  const outside = mkdtempSync(path.join(tmpdir(), "pd-outside-"));
  try {
    const external = path.join(outside, "source.png"); writeFileSync(external, readFileSync(f.set.screens[0].path)); rmSync(f.set.screens[0].path); symlinkSync(external, f.set.screens[0].path); blocked(await f.check());
    rmSync(f.set.screens[0].path); writeFileSync(f.set.screens[0].path, "synthetic source " + f.set.screens[0].id);
    symlinkSync(path.join(f.root, "src"), path.join(f.root, "src/cycle")); assert.throws(() => snapshotImplementation(f.root, ["src"]), /symlink/); rmSync(path.join(f.root, "src/cycle"));
    rmSync(path.join(f.root, ".gates"), { recursive: true, force: true }); symlinkSync(outside, path.join(f.root, ".gates")); const unsafe = blocked(await f.check()); assert.match(unsafe.persistenceError, /symlink/); assert.deepEqual(readdirSync(outside), ["source.png"]); rmSync(path.join(f.root, ".gates"));
    f.request.operation = "review-handoff"; f.save(); symlinkSync(external, path.join(f.root, "design-qa.md")); blocked(await f.check()); assert.equal(readFileSync(external, "utf8"), "synthetic source " + f.set.screens[0].id);
  } finally { rmSync(outside, { recursive: true, force: true }); }
}));
test("CLI exposes actionable failure, success, consume and usage exit status", async () => withFixture(async f => {
  const call = args => spawnSync(process.execPath, [cli, ...args], { cwd: tmpdir(), encoding: "utf8" });
  assert.equal(call(["--help"]).status, 0); assert.equal(call([]).status, 1);
  const args = ["--project", f.root, "--request", "request.json"]; assert.equal(call(args).status, 0); assert.equal(call([...args, "--consume"]).status, 0);
  f.request.operation = "prototype-build"; f.request.buildApproval = "missing.json"; f.save(); const bad = call(args); assert.equal(bad.status, 1); assert.equal(JSON.parse(bad.stdout).status, "blocked"); assert.match(JSON.parse(bad.stdout).reason, /missing.json/);
  assert.equal(existsSync(path.join(f.root, ".gates/prototype-build.receipt.json")), true);
}));

test("every QA capture, interaction and history digest is mandatory", async t => {
  for (const field of ["renderedSha256", "combinedComparisonSha256"]) await t.test(field, () => withFixture(async f => { f.request.operation = "review-handoff"; delete f.qa.states[0][field]; f.save(); assert.match(blocked(await f.check()).reason, /SHA-256/); }));
  await withFixture(async f => { f.request.operation = "review-handoff"; delete f.qa.states[0].interactions[0].evidenceSha256; f.save(); assert.match(blocked(await f.check()).reason, /SHA-256/); });
});
test("early source failure and severity downgrade cannot erase previous material QA", async () => withFixture(async f => {
  f.request.operation = "review-handoff";
  const finding = { id: "open-layout", severity: "P2", status: "open", location: "Booking", detail: "Clipped", evidence: "Fixture capture", impact: "Hidden task", fix: "Reflow" };
  f.qa.findings = [finding]; f.qa.openP0P1P2 = 1; f.qa.finalResult = "blocked"; f.qa.blockers = ["Clipped"]; f.qa.g5.execution = "blocked"; f.save(); blocked(await f.check());
  const bytes = readFileSync(f.set.screens[0].path); rmSync(f.set.screens[0].path); const early = blocked(await f.check()); assert.equal(early.qaAttempts.length, 1); writeFileSync(f.set.screens[0].path, bytes);
  f.qa.finalResult = "passed"; f.qa.openP0P1P2 = 0; f.qa.blockers = []; f.qa.g5.execution = "pass"; f.qa.findings = [{ ...finding, severity: "P3" }]; f.save(); assert.match(blocked(await f.check()).reason, /severity/);
  rmSync(path.join(f.root, ".gates/review-handoff.receipt.json")); f.qa.findings = []; f.save(); assert.match(blocked(await f.check()).reason, /disappeared/);
}));
test("implementation roots cannot traverse a symlink ancestor", async () => withFixture(async f => {
  symlinkSync(path.join(f.root, "src"), path.join(f.root, "linked")); assert.throws(() => snapshotImplementation(f.root, ["linked/app.js"]), /symlink/);
}));

test("build rejects overlapping implementation roots and symlink ancestors before mutation", async () => withFixture(async f => {
  f.g4.executionContract.implementationPaths = ["src", "src/app.js"]; f.save(); blocked(await f.check());
  f.g4.executionContract.implementationPaths = ["linked/app.js"]; symlinkSync(path.join(f.root, "src"), path.join(f.root, "linked")); f.save(); const r = blocked(await f.check()); assert.match(r.reason, /symlink before build/);
}));
test("interrupted gate publication invalidates readiness and leaves no temporary files", async () => withFixture(async f => {
  passed(await f.check()); const target = path.join(f.root, ".gates/gate-history", sha256(f.g4) + ".json"); rmSync(target); mkdirSync(target);
  blocked(await f.check()); assert.equal(JSON.parse(readFileSync(path.join(f.root, ".gates/prototype-build.receipt.json"))).readyFor, null);
  assert.equal(readdirSync(path.dirname(target)).some(name => name.endsWith(".tmp")), false);
}));
test("canonical blocked reasons and history hashes cannot be omitted", async () => withFixture(async f => {
  f.request.operation = "review-handoff"; f.qa.finalResult = "blocked"; f.qa.blockers = []; f.save(); assert.match(blocked(await f.check()).reason, /name blockers/);
  f.qa.blockers = ["Recovery evidence incomplete"]; f.qa.history = [{ findingId: "p", stateId: f.qa.states[0].id, severity: "P2", finding: "Earlier drift", fix: "Reflow", timestamp: stamp, beforePath: f.qa.states[0].renderedPath, afterPath: f.qa.states[0].renderedPath, comparisonPath: f.qa.states[0].combinedComparisonPath }]; f.save(); assert.match(blocked(await f.check()).reason, /SHA-256/);
}));

test("changed verifier fingerprint or authored request invalidates consumption", async () => withFixture(async f => {
  passed(await f.check()); const receiptPath = path.join(f.root, ".gates/prototype-build.receipt.json"); const receipt = JSON.parse(readFileSync(receiptPath)); receipt.verifierHash = "0".repeat(64); writeFileSync(receiptPath, JSON.stringify(receipt)); blocked(await f.check({ consume: true }));
  passed(await f.check()); f.request.timestamp = "2026-10-18T21:00:00Z"; f.save(); assert.match(blocked(await f.check({ consume: true })).reason, /stale dependencies/);
}));
test("malformed input records raw invalid bytes without passing readiness", async () => withFixture(async f => {
  writeFileSync(path.join(f.root, "request.json"), "{invalid"); const r = blocked(await f.check()); assert.equal(r.operation, null); assert.equal(readFileSync(path.join(f.root, ".gates/invalid-input-history", sha256("{invalid") + ".json"), "utf8"), "{invalid");
}));
test("frozen transition scenarios match packaged skill cases; no behavioral run claimed", () => {
  const index = JSON.parse(readFileSync(new URL("../tests/evals/executable-transition-scenarios.json", import.meta.url)));
  assert.equal(index.status, "not-run"); assert.equal(index.cases.length, 8);
  for (const frozen of index.cases) {
    const document = JSON.parse(readFileSync(new URL("../skills/" + frozen.skill + "/evals/evals.json", import.meta.url))); const scenario = document.evals.find(c => c.name === frozen.name); assert.equal(sha256(scenario), frozen.sha256);
  }
});
