#!/usr/bin/env node
import { readFileSync, realpathSync, mkdirSync, writeFileSync, renameSync, readdirSync, lstatSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { sha256, canonicalJson, validateG1, validateGateRecord, validateDirectionSelection, validateScreenSetEvidence, verifyLocalEvidenceFiles, validateDesignContract, validateExperienceBlueprint, validateDesignQaReport, advanceGateTransaction } from "./workflow-evidence-contract.mjs";

export const operations = Object.freeze({ "brief-to-ideation": "ideation", "source-selection": "selected-screen-production", "source-set-approval": "build-handoff", "prototype-build": "prototype-build", "review-handoff": "review-handoff" });
const fail = message => { throw new Error(message); };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(label + " required"); };
const list = (value, label, allowEmpty = false) => { if (!Array.isArray(value) || (!allowEmpty && !value.length)) fail(label + " array required"); };
const member = (value, choices, label) => { if (!choices.includes(value)) fail(label + " unsupported"); };
const iso = (value, label) => { text(value, label); if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) fail(label + " ISO timestamp required"); };
const equal = (a, b, label) => { if (canonicalJson(a) !== canonicalJson(b)) fail(label + " mismatch"); };
const inside = (root, file) => { const rel = path.relative(root, file); if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) fail("path escapes project: " + file); return file; };
function local(root, value) {
  text(value, "explicit local path");
  const file = inside(root, path.resolve(root, value)), real = inside(root, realpathSync(file));
  if (!lstatSync(real).isFile()) fail("evidence must be a file: " + value);
  return file; // Retain lexical path as well as realpath checks; retargeted links are rechecked.
}
function output(root, relative) {
  const target = inside(root, path.resolve(root, relative));
  let current = root;
  for (const name of path.relative(root, path.dirname(target)).split(path.sep).filter(Boolean)) {
    current = path.join(current, name);
    if (!existsSync(current)) mkdirSync(current); // Not recursive through an unchecked symlink.
    if (lstatSync(current).isSymbolicLink() || !lstatSync(current).isDirectory()) fail("output directory must not be symlinked: " + current);
  }
  try { if (lstatSync(target).isSymbolicLink() || !lstatSync(target).isFile()) fail("unsafe output target: " + target); } catch (error) { if (error.code !== "ENOENT") throw error; }
  return target;
}
function atomic(root, relative, content, immutable = false) {
  const target = output(root, relative);
  if (immutable && existsSync(target)) { if (!readFileSync(target).equals(Buffer.from(content))) fail("immutable archive changed: " + relative); return target; }
  const temporary = target + "." + process.pid + "." + Math.random().toString(16).slice(2) + ".tmp";
  try { writeFileSync(temporary, content, { flag: "wx", mode: 0o600 }); renameSync(temporary, target); }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
  return target;
}
const excluded = new Set(["node_modules", ".git", ".gates", ".goose"]);
export function snapshotImplementation(project, paths) {
  const root = realpathSync(path.resolve(project)), files = new Map(), roots = [];
  list(paths, "implementationPaths");
  function visit(file) {
    inside(root, file);
    if (path.relative(root, file).split(path.sep).some(name => excluded.has(name))) fail("implementation path includes excluded storage: " + file);
    inside(root, realpathSync(file));
    let ancestor = root;
    for (const name of path.relative(root, file).split(path.sep)) { ancestor = path.join(ancestor, name); if (lstatSync(ancestor).isSymbolicLink()) fail("implementation symlinks are not supported: " + ancestor); }
    if (path.relative(root, file).split(path.sep).some(name => excluded.has(name))) fail("implementation path includes excluded storage: " + file);
    const st = lstatSync(file);
    if (st.isSymbolicLink()) fail("implementation symlinks are not supported; snapshot a local copy: " + file);
    if (st.isDirectory()) for (const name of readdirSync(file).sort()) visit(path.join(file, name));
    else if (st.isFile()) files.set(file, { path: file, sha256: sha256(readFileSync(file)) });
    else fail("implementation path must be regular file/directory");
  }
  for (const value of paths) {
    text(value, "implementation path"); const file = inside(root, path.resolve(root, value));
    if (file === root || roots.some(p => file === p || file.startsWith(p + path.sep) || p.startsWith(file + path.sep))) fail("implementation roots must be explicit, nonoverlapping and not project root");
    roots.push(file); visit(file);
  }
  if (!files.size) fail("implementation snapshot empty");
  return [...files.values()].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
function validateRequiredStates(states, sources) {
  list(states, "requiredStates"); const ids = new Set();
  for (const state of states) {
    for (const key of ["id", "sourceId", "route", "state"]) text(state[key], "requiredStates." + key);
    if (ids.has(state.id)) fail("duplicate required state id"); ids.add(state.id);
    if (!sources.some(s => s.id === state.sourceId)) fail("required state source unknown");
    if (!Number.isInteger(state.viewport?.width) || state.viewport.width <= 0 || !Number.isInteger(state.viewport?.height) || state.viewport.height <= 0) fail("positive integer viewport required");
  }
  if (sources.some(s => !states.some(state => state.sourceId === s.id))) fail("requiredStates must cover every approved source");
}
// Provided/clone/historical sources do not masquerade as a three-variant generated comparison.
export function validateTargetSet(set, workflow) {
  if (set?.schemaVersion !== 1 || set.kind !== "approved-target-set" || set.origin !== workflow) fail("approved-target-set origin/schema required");
  member(set.scopeKind, ["single-screen", "multi-step"], "target scopeKind");
  list(set.inventory, "target inventory"); list(set.screens, "target screens");
  equal(set.inventory.map(s => s.id), set.screens.map(s => s.id), "ordered target inventory");
  if (new Set(set.screens.map(s => s.id)).size !== set.screens.length || new Set(set.screens.map(s => s.sha256)).size !== set.screens.length) fail("duplicate target source");
  if (set.scopeKind === "single-screen" && set.screens.length !== 1) fail("single-screen target cannot hide a journey");
  for (const entry of set.inventory) { text(entry.id, "inventory.id"); text(entry.purpose, "inventory.purpose"); member(entry.role, ["action", "outcome", "critical-recovery", "isolated"], "inventory.role"); }
  if (set.scopeKind === "multi-step") {
    for (const key of ["start", "outcome", "recovery"]) text(set.boundaries?.[key], "boundaries." + key);
    for (const role of ["action", "outcome", "critical-recovery"]) if (!set.inventory.some(s => s.role === role)) fail("target missing outcome/action/critical recovery coverage");
  }
  for (const source of set.screens) {
    text(source.id, "source.id");
    if (source.provenance !== workflow || source.buildSourceEligible !== true || source.criticalCopyReadable !== true) fail("target source not reviewed/build eligible");
    const review = source.review;
    if (review?.inspectedPath !== source.path || review.inspectedSha256 !== source.sha256 || review.composition !== "accepted" || review.businessFidelity !== "accepted") fail("target review must bind accepted source bytes");
    text(review.reviewer, "review.reviewer"); iso(review.timestamp, "review.timestamp"); list(review.findings, "review.findings", true);
    if (review.findings.some(f => f.status !== "resolved")) fail("target source has open findings");
  }
  const approval = set.approval;
  if (approval?.screenSetApproved !== true || approval.screenSetHash !== sha256(set.screens)) fail("explicit ordered target approval required");
  text(approval.owner, "approval.owner"); text(approval.statement, "approval.statement"); iso(approval.timestamp, "approval.timestamp");
  return set;
}
function validateExecution(contract, root, request, sources) {
  if (contract?.schemaVersion !== 1 || contract.projectRoot !== root) fail("G4 executionContract must name exact project root");
  for (const key of ["scope", "target", "outcome"]) equal(contract[key], request[key], "G4 " + key);
  for (const key of ["hypothesis", "successCriterion", "mockData", "outOfScope", "framework", "designSystem"]) text(contract[key], "G4 executionContract." + key);
  list(contract.implementationPaths, "G4 implementationPaths");
  const implementationRoots = [];
  for (const value of contract.implementationPaths) {
    text(value, "implementation path"); const file = inside(root, path.resolve(root, value));
    if (file === root || path.relative(root, file).split(path.sep).some(n => excluded.has(n))) fail("explicit implementation roots required");
    if (implementationRoots.some(p => file === p || file.startsWith(p + path.sep) || p.startsWith(file + path.sep))) fail("implementation roots must not overlap");
    implementationRoots.push(file);
    let ancestor = root;
    for (const name of path.relative(root, file).split(path.sep)) {
      ancestor = path.join(ancestor, name);
      try { const st = lstatSync(ancestor); if (st.isSymbolicLink()) fail("implementation symlink before build: " + ancestor); if (ancestor !== file && !st.isDirectory()) fail("implementation ancestor is not a directory"); }
      catch (error) { if (error.code === "ENOENT") break; throw error; }
    }
  }
  validateRequiredStates(contract.requiredStates, sources);
}
export function renderQa(report) {
  const sections = ["# Design QA", "Derived from design-qa.json; do not edit this view independently.", "final result: " + report.finalResult, "## Findings", JSON.stringify(report.findings, null, 2), "## Approved scope and bindings", JSON.stringify({ scope: report.scope, approvedScreenSetHash: report.approvedScreenSetHash, buildApprovalHash: report.buildApprovalHash, requiredStates: report.requiredStates }, null, 2), "## State comparisons"];
  for (const state of report.states) sections.push("### " + state.id, JSON.stringify(state, null, 2));
  sections.push("## Comparison history", JSON.stringify(report.history, null, 2), "## G5 — independent checks", JSON.stringify(report.g5, null, 2), "## Blockers and capability limitations", JSON.stringify({ blockers: report.blockers, limitations: report.limitations }, null, 2), "## Implementation snapshot", JSON.stringify(report.implementationFiles, null, 2));
  return sections.join("\n\n") + "\n";
}
function validateQa(qa, { request, set, g4, root, file, execution, previousAttempts, loadArchive }) {
  if (qa?.schemaVersion !== 1 || !["passed", "blocked"].includes(qa.finalResult)) fail("canonical QA schemaVersion/finalResult required");
  equal(qa.scope, request.scope, "QA scope"); equal(qa.approvedScreenSetHash, sha256(set), "QA source approval"); equal(qa.buildApprovalHash, sha256(g4), "QA build approval");
  equal(qa.requiredStates, execution.requiredStates, "QA requiredStates");
  const evidenceFile = (p, hash) => { if (typeof hash !== "string" || !/^[a-f0-9]{64}$/.test(hash)) fail("QA evidence SHA-256 required: " + p); return file(p, hash); };
  for (const key of ["states", "findings", "history", "blockers", "limitations"]) list(qa[key], "QA." + key, true);
  for (const value of [...qa.blockers, ...qa.limitations]) text(value, "QA reason/limitation");
  iso(qa.timestamp, "QA.timestamp"); text(qa.reviewer, "QA.reviewer");
  for (const key of ["execution", "productTestValidity"]) member(qa.g5?.[key], ["pass", "blocked"], "QA.g5." + key);
  const findings = new Set();
  for (const finding of qa.findings) {
    for (const key of ["id", "location", "detail", "evidence", "impact", "fix"]) text(finding[key], "finding." + key);
    member(finding.severity, ["P0", "P1", "P2", "P3"], "finding.severity"); member(finding.status, ["open", "resolved"], "finding.status");
    if (findings.has(finding.id)) fail("duplicate finding id"); findings.add(finding.id);
  }
  const material = qa.findings.filter(f => ["P0", "P1", "P2"].includes(f.severity) && f.status === "open");
  equal(qa.openP0P1P2, material.length, "QA open finding count");
  const seen = new Set();
  for (const state of qa.states) {
    const required = execution.requiredStates.find(s => s.id === state.id);
    if (!required || seen.has(state.id)) fail("unplanned/duplicate QA state"); seen.add(state.id);
    for (const key of ["sourceId", "route", "state", "viewport"]) equal(state[key], required[key], "QA state " + key);
    const source = set.screens.find(s => s.id === state.sourceId);
    if (state.notRunReason !== undefined) { text(state.notRunReason, "state.notRunReason"); if (qa.finalResult === "passed") fail("unperformed QA state"); continue; }
    equal(state.sourcePath, source.path, "QA source path"); equal(state.sourceSha256, source.sha256, "QA source hash");
    for (const [p, h] of [[state.sourcePath, state.sourceSha256], [state.renderedPath, state.renderedSha256], [state.combinedComparisonPath, state.combinedComparisonSha256]]) evidenceFile(p, h);
    for (const key of ["accessibility", "responsiveness", "focusedComparison"]) text(state[key], "QA state." + key);
    list(state.interactions, "primary interactions");
    for (const interaction of state.interactions) { for (const key of ["action", "expected", "observed"]) text(interaction[key], "interaction." + key); member(interaction.result, ["pass", "blocked"], "interaction.result"); evidenceFile(interaction.evidencePath, interaction.evidenceSha256); if (qa.finalResult === "passed" && interaction.result !== "pass") fail("primary interaction blocked"); }
    // Reuse the existing pass validator for complete states, preserving console branches.
    if (qa.finalResult === "passed") validateDesignQaReport({ ...qa, states: [state] });
    else {
      for (const surface of ["typography", "spacing", "colors", "images", "copy"]) text(state.surfaces?.[surface], "QA surfaces." + surface);
      const c = state.console; list(c?.errors, "console.errors", true); member(c?.availability, ["available", "unavailable"], "console availability");
      if (c.availability === "unavailable" && (c.checked !== false || typeof c.reason !== "string" || !c.reason.trim())) fail("unavailable console requires unchecked reason");
      if (c.availability === "available" && typeof c.checked !== "boolean") fail("console checked boolean required");
    }
  }
  for (const item of qa.history) {
    member(item.severity, ["P0", "P1", "P2"], "history.severity");
    for (const key of ["findingId", "stateId", "finding", "fix"]) text(item[key], "history." + key); iso(item.timestamp, "history.timestamp");
    if (!execution.requiredStates.some(s => s.id === item.stateId)) fail("history state unknown");
    evidenceFile(item.beforePath, item.beforeSha256); evidenceFile(item.afterPath, item.afterSha256); evidenceFile(item.comparisonPath, item.comparisonSha256);
  }
  for (const finding of qa.findings.filter(f => f.status === "resolved" && ["P0", "P1", "P2"].includes(f.severity))) if (!qa.history.some(h => h.findingId === finding.id && h.severity === finding.severity)) fail("resolved material finding requires recapture history");
  for (const attempt of previousAttempts) {
    const old = loadArchive(attempt);
    if (old.approvedScreenSetHash !== qa.approvedScreenSetHash || old.scope !== qa.scope) continue;
    for (const item of old.history) if (!qa.history.some(h => canonicalJson(h) === canonicalJson(item))) fail("comparison history cannot be deleted or rewritten");
    for (const finding of old.findings.filter(f => ["P0", "P1", "P2"].includes(f.severity))) {
      const now = qa.findings.find(f => f.id === finding.id);
      if (!now) fail("previous material finding disappeared");
      if (now.severity !== finding.severity) fail("material finding severity cannot be silently changed");
      if (finding.status === "open" && now.status === "resolved" && !qa.history.some(h => h.findingId === finding.id && h.beforeSha256 !== h.afterSha256 && old.states.some(s => s.id === h.stateId && s.renderedPath === h.beforePath && s.renderedSha256 === h.beforeSha256) && qa.states.some(s => s.id === h.stateId && s.renderedPath === h.afterPath && s.renderedSha256 === h.afterSha256 && s.combinedComparisonPath === h.comparisonPath && s.combinedComparisonSha256 === h.comparisonSha256))) fail("fix history must bind the earlier rendered capture");
    }
  }
  equal(qa.implementationFiles, snapshotImplementation(root, execution.implementationPaths), "implementation changed since QA snapshot");
  if (qa.finalResult === "passed") {
    if (qa.blockers.length || execution.requiredStates.some(s => !seen.has(s.id))) fail("required QA state coverage missing or blockers remain");
    validateDesignQaReport(qa);
  } else if (!qa.blockers.length) fail("blocked QA must name blockers");
  return qa;
}

/** Validate authored inputs; publish archives -> authoritative gate snapshot -> optional mirror -> scoped readiness.
 * Receipts are consistency declarations, not human authorization, pixel assessment or shell interception.
 */
export async function checkTransition({ project, requestPath, consume = false, mirrorBeads = async () => {} }) {
  const root = realpathSync(path.resolve(project));
  if (!lstatSync(root).isDirectory()) fail("project directory required");
  const dependencies = new Map(), archives = new Map();
  const verifierHash = sha256([readFileSync(fileURLToPath(import.meta.url)), readFileSync(new URL("./workflow-evidence-contract.mjs", import.meta.url)), readFileSync(new URL("./ideation-contract.mjs", import.meta.url))].map(bytes => sha256(bytes)));
  const file = (value, expected) => { const p = local(root, value), bytes = readFileSync(p), hash = sha256(bytes); if (expected !== undefined && hash !== expected) fail("file hash mismatch: " + value); if (dependencies.has(p) && dependencies.get(p).sha256 !== hash) fail("input changed while reading: " + p); dependencies.set(p, { path: p, sha256: hash }); return { p, bytes, hash }; };
  const load = value => { const { p, bytes } = file(value); archives.set(p, bytes); return JSON.parse(bytes); };
  const receiptBase = { schemaVersion: 1, verifierHash, project: root, status: "blocked", readyFor: null, authorization: "Declared approval consistency only; human identity, rights, pixel fidelity and measured value are not verified" };
  let request, name, qa, qaBytes, authority, authorityEvidence, previous;
  let previousAttempts = [];
  try {
    request = load(requestPath);
    if (request?.schemaVersion !== 1 || !Object.hasOwn(operations, request.operation)) fail("unsupported transition/schemaVersion");
    name = ".gates/" + request.operation + ".receipt.json";
    if (existsSync(path.join(root, name))) previous = JSON.parse(readFileSync(local(root, name)));
    previousAttempts = previous?.qaAttempts ?? [];
    list(previousAttempts, "previous qaAttempts", true);
    // Reconstruct immutable QA ledger before validating prerequisites, even if an earlier receipt failed or is absent.
    if (request.operation === "review-handoff" && existsSync(path.join(root, ".gates/qa-attempts"))) {
      const directory = path.join(root, ".gates/qa-attempts");
      inside(root, realpathSync(directory));
      if (lstatSync(directory).isSymbolicLink()) fail("QA archive directory must not be symlinked");
      for (const entry of readdirSync(directory).sort()) {
        if (!/^[a-f0-9]{64}\.json$/.test(entry)) fail("unknown QA archive entry");
        const archive = { path: path.join(directory, entry), sha256: entry.slice(0, 64) };
        if (!previousAttempts.some(a => a.path === archive.path)) previousAttempts = [...previousAttempts, archive];
      }
    }
    const loadArchive = attempt => {
      if (typeof attempt.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(attempt.sha256)) fail("QA archive hash required");
      equal(attempt.path, path.join(root, ".gates/qa-attempts/" + attempt.sha256 + ".json"), "QA archive identity");
      return JSON.parse(file(attempt.path, attempt.sha256).bytes);
    };
    for (const attempt of previousAttempts) loadArchive(attempt);
    for (const key of ["scope", "target", "outcome", "owner"]) text(request[key], "request." + key); iso(request.timestamp, "request.timestamp");
    if (typeof request.involved !== "boolean") fail("explicit involved boolean required");
    member(request.workflow, ["generated", "provided-target", "exact-clone", "historical-selection"], "workflow");
    if (request.involved) {
      validateG1(load(request.g1), ["prototype-build", "review-handoff"].includes(request.operation) ? "build" : "ideation");
      const contract = load(request.designContract); validateDesignContract(contract); validateExperienceBlueprint(load(request.blueprint), contract);
    }
    if (request.operation === "brief-to-ideation" && request.workflow !== "generated") fail("brief-to-ideation only applies to visual exploration");
    const gate = (value, expected) => {
      const g = load(value), e = load(g.evidencePath); validateGateRecord(g, { expectedGate: expected, evidenceHash: sha256(e) });
      equal(g.scope, request.scope, expected + " scope"); authority = g; authorityEvidence = e; return [g, e];
    };
    let sources = [], set, g4, execution;
    if (request.operation !== "brief-to-ideation") {
      let manifest, selection;
      if (request.workflow === "generated") {
        manifest = load(request.manifest); const [s, comparison] = gate(request.selection, "G2"); selection = s;
        validateDirectionSelection(selection, comparison, manifest); sources.push(...comparison.screens);
      } else if (request.operation === "source-selection") fail("provided/clone/historical workflows have no new G2 competition");
      if (request.operation !== "source-selection") {
        const [g3, approvedSet] = gate(request.sourceApproval, "G3"); set = approvedSet;
        if (g3.verdict !== "pass") fail("G3 must explicitly pass source approval");
        if (request.workflow === "generated") validateScreenSetEvidence(set, manifest, selection);
        else {
          validateTargetSet(set, request.workflow);
          if (request.workflow === "historical-selection") {
            const prior = load(request.priorSelection);
            if (prior.schemaVersion !== 1 || prior.kind !== "historical-selection" || prior.selectedDirection !== set.selectedDirection || prior.comparisonComplete !== false) fail("historical continuation requires honest prior selection declaration");
            text(prior.owner, "priorSelection.owner"); text(prior.statement, "priorSelection.statement"); text(prior.selectedDirection, "priorSelection.selectedDirection"); iso(prior.timestamp, "priorSelection.timestamp");
          }
        }
        sources.push(...set.screens);
        if (["prototype-build", "review-handoff"].includes(request.operation)) {
          [g4] = gate(request.buildApproval, "G4");
          if (g4.verdict !== "pass") fail("G4 must explicitly pass, not experiment");
          equal(g4.evidencePath, load(request.sourceApproval).evidencePath, "G4 approved set path");
          equal(g4.evidenceHash, sha256(set), "G4 approved set"); execution = g4.executionContract; validateExecution(execution, root, request, set.screens);
        }
      }
    }
    verifyLocalEvidenceFiles(sources, { root }); for (const s of sources) file(s.path, s.sha256);
    if (request.operation === "review-handoff") {
      if (local(root, request.qa) !== path.join(root, "design-qa.json")) fail("canonical QA must be project-root design-qa.json");
      qa = load(request.qa); qaBytes = archives.get(path.join(root, "design-qa.json"));
      validateQa(qa, { request, set, g4, root, file, execution, previousAttempts, loadArchive });
      for (const entry of qa.implementationFiles) file(entry.path, entry.sha256);
      if (qa.finalResult === "passed") {
        const [g5] = gate(request.reviewGate, "G5");
        if (g5.verdict !== "pass" || g5.readyFor !== "review-handoff") fail("G5 must explicitly pass review-handoff");
        equal(g5.evidencePath, path.join(root, "design-qa.json"), "G5 canonical QA path"); equal(g5.evidenceHash, sha256(qa), "G5 QA evidence");
      }
      const markdown = renderQa(qa);
      if (consume) equal(readFileSync(local(root, "design-qa.md"), "utf8"), markdown, "canonical QA and Markdown");
    }
    const currentDependencies = () => [...dependencies.values()].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    // Detect input changes while reading/awaiting an optional mirror.
    const recheck = () => { if (execution) validateExecution(execution, root, request, set.screens); for (const dep of dependencies.values()) if (sha256(readFileSync(local(root, dep.path))) !== dep.sha256) fail("dependency changed during transition: " + dep.path); if (qa) equal(qa.implementationFiles, snapshotImplementation(root, execution.implementationPaths), "implementation freshness"); };
    const receipt = { ...receiptBase, operation: request.operation, scope: request.scope, status: qa?.finalResult === "blocked" ? "blocked" : "passed", readyFor: qa?.finalResult === "blocked" ? null : operations[request.operation], dependencies: currentDependencies(), qaAttempts: previousAttempts, timestamp: new Date().toISOString() };
    if (consume) {
      if (receipt.status !== "passed" || previous?.status !== "passed" || previous.verifierHash !== verifierHash || previous.project !== root || previous.operation !== request.operation || previous.scope !== request.scope || previous.readyFor !== receipt.readyFor) fail("readiness missing, blocked or wrong scope");
      equal(previous.dependencies, receipt.dependencies, "readiness stale dependencies"); recheck(); return { ...receipt, consumed: true };
    }
    const publishEvidence = async () => {
      recheck();
      for (const bytes of archives.values()) atomic(root, ".gates/input-history/" + sha256(bytes) + ".json", bytes, true);
      if (authorityEvidence) atomic(root, ".gates/evidence-history/" + sha256(authorityEvidence) + ".json", canonicalJson(authorityEvidence) + "\n", true);
      if (qa) {
        const archive = atomic(root, ".gates/qa-attempts/" + sha256(qaBytes) + ".json", qaBytes, true);
        const attempt = { path: archive, sha256: sha256(qaBytes) };
        if (!previousAttempts.some(a => a.path === archive)) previousAttempts = [...previousAttempts, attempt];
        for (const a of previousAttempts) loadArchive(a);
        receipt.qaAttempts = previousAttempts;
        atomic(root, "design-qa.md", renderQa(qa));
      }
    };
    const publishGate = async () => { recheck(); if (authority) atomic(root, ".gates/gate-history/" + sha256(authority) + ".json", canonicalJson(authority) + "\n", true); };
    const publishReadiness = async () => { recheck(); receipt.dependencies = currentDependencies(); atomic(root, name, JSON.stringify(receipt, null, 2) + "\n"); };
    if (receipt.status === "blocked") { await publishEvidence(); await publishReadiness(); }
    else if (authority) await advanceGateTransaction({ evidence: authorityEvidence, gate: authority, writeEvidence: publishEvidence, writeGate: publishGate, mirrorBeads: async value => { await mirrorBeads(value); recheck(); }, writeReadiness: publishReadiness });
    else { await publishEvidence(); await publishReadiness(); } // Brief: detailed G1 has its own validator, no invented generic gate.
    return receipt;
  } catch (error) {
    const blocked = { ...receiptBase, operation: request?.operation ?? null, scope: request?.scope ?? null, reason: error.message, timestamp: new Date().toISOString(), dependencies: [...dependencies.values()], qaAttempts: previousAttempts };
    // Invalid attempts never fabricate a canonical QA report; invalidate scoped readiness durably when storage is safe.
    try { for (const bytes of archives.values()) atomic(root, ".gates/invalid-input-history/" + sha256(bytes) + ".json", bytes, true); atomic(root, ".gates/failed-attempts/" + sha256(blocked) + ".json", JSON.stringify(blocked, null, 2) + "\n", true); if (name) atomic(root, name, JSON.stringify(blocked, null, 2) + "\n"); }
    catch (storageError) { blocked.persistenceError = storageError.message; }
    return blocked;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { project: { type: "string" }, request: { type: "string" }, consume: { type: "boolean", default: false }, help: { type: "boolean", default: false } } });
    if (values.help) console.log("check-workflow-evidence --project <root> --request <local.json> [--consume]\nValidate/publish scoped receipt; --consume revalidates without issuing new readiness. No hooks or automatic approval.");
    else {
      if (!values.project || !values.request) fail("--project and --request required");
      const result = await checkTransition({ project: values.project, requestPath: values.request, consume: values.consume });
      console.log(JSON.stringify(result, null, 2)); if (result.status !== "passed") process.exitCode = 1;
    }
  } catch (error) { console.error(JSON.stringify({ status: "blocked", reason: error.message })); process.exitCode = 1; }
}
