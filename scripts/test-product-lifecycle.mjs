import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { experienceFixture } from "../tests/fixtures/experience-blueprint.mjs";
import { sha256 } from "./workflow-evidence-contract.mjs";
import { inspectProductCapabilities, checkPhaseCapabilities } from "./product-capabilities.mjs";
import { readProductSlice, validateProductReferences, renderProductGraph } from "./read-product-slice.mjs";
import { checkAnnotationQueue, validateAnnotationRecord } from "./check-annotation-queue.mjs";

function fixture(t) {
  const project = mkdtempSync(path.join(tmpdir(), "pd-lifecycle-"));
  const put = (relative, data) => { const p = path.join(project, relative); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, typeof data === "string" ? data : JSON.stringify(data)); return p; };
  const experience = experienceFixture(); put("spec/contract.json", experience.designContract); put("spec/blueprint.json", experience.blueprint); put("spec/reason.md", '<a id="preserve-draft"></a>\nKeep editable internal drafts.');
  put("result.json", { kind: "experiment-structural-result", result: "passed", dependencies: ["spec/contract.json", "spec/blueprint.json", "spec/reason.md"].map(p => ({ path: p, sha256: sha256(readFileSync(path.join(project, p))) })) });
  t.after(() => rmSync(project, { recursive: true, force: true }));
  const args = { project, documents: ["spec/contract.json", "spec/blueprint.json", "spec/reason.md", "result.json"], seeds: ["spec/blueprint.json#decisions/D2"] };
  return { project, put, experience, args };
}
const tool = (name, capabilities, properties) => ({ name, capabilities, inputSchema: { type: "object", properties } });
const record = (receivedAt = "2026-10-19T10:00:00Z") => ({ bbox: { x: 20, y: 30, width: 120, height: 50 }, viewport: { width: 1440, height: 900 }, route: "/tasks?filter=blocked", note: "Preserve this draft", components: [], receivedAt });

test("capability declarations use schemas, not vendor names or successful-provider claims", () => {
  const r = inspectProductCapabilities([tool("unknown-image-provider", ["image-generate"], { workspace_output_path: { type: "string" }, save_to_workspace: { type: "boolean" } }), tool("inspect", ["image-inspect", "filesystem-read"])]);
  assert.equal(checkPhaseCapabilities(r, "ideation").status, "available"); assert.equal(r.verification, "availability-only"); assert.equal(checkPhaseCapabilities(r, "design-qa").status, "blocked");
  assert.equal(checkPhaseCapabilities(inspectProductCapabilities([tool("imageGenerate", ["image-generate"], {})]), "ideation").missing.includes("image-generate"), true);
  assert.throws(() => inspectProductCapabilities([{ name: "guess", capabilities: ["magic"] }])); assert.throws(() => inspectProductCapabilities([tool("a", []), tool("a", [])]));
});
test("image editing, browser interaction and hosting availability remain independent", () => {
  const r = inspectProductCapabilities([tool("browser", ["browser-capture", "image-inspect"]), tool("deploy", ["hosting"])]);
  assert.equal(checkPhaseCapabilities(r, "url-capture").status, "available"); assert.deepEqual(checkPhaseCapabilities(r, "design-qa").missing, ["browser-interact"]); assert.equal(checkPhaseCapabilities(r, "share").execution, "not-run");
  assert.throws(() => checkPhaseCapabilities(r, "production"));
});
test("bounded upstream/downstream retrieval keeps assumptions and proposed criteria", t => {
  const f = fixture(t), up = readProductSlice({ ...f.args, direction: "up" }), down = readProductSlice({ ...f.args, direction: "down" });
  assert.deepEqual(up.nodes.map(n => n.id).sort(), ["spec/blueprint.json#decisions/D2", "spec/blueprint.json#inputs/F2", "spec/blueprint.json#questions/Q2"].sort());
  assert.deepEqual(down.nodes.map(n => n.id).sort(), ["spec/blueprint.json#decisions/D2", "spec/blueprint.json#screenStates/SS2", "spec/blueprint.json#verifications/T2"].sort());
  assert.equal(down.nodes.find(n => n.id.endsWith("/T2")).evidenceLevel, "proposed"); assert.equal(up.nodes.find(n => n.id.endsWith("/F2")).evidenceLevel, "assumption"); assert.ok(down.edges.every(e => e.status === "declared" && e.provenance.path));
});
test("depth and node limits disclose truncation instead of claiming global coverage", t => {
  const f = fixture(t); for (const limits of [{ maxDepth: 0 }, { maxNodes: 1 }]) { const r = readProductSlice({ ...f.args, limits }); assert.equal(r.truncated, true); assert.equal(r.nodes.length, 1); }
  assert.throws(() => readProductSlice({ ...f.args, limits: { maxDepth: 12 } }));
});
test("stable anchors/entities resolve; escapes/symlinks/duplicate entities do not", t => {
  const f = fixture(t), check = ref => validateProductReferences({ project: f.project, references: [ref] })[0];
  assert.equal(check({ path: "spec/reason.md", anchor: "preserve-draft" }).status, "resolved");
  assert.equal(check({ path: "spec/blueprint.json", entity: { collection: "decisions", id: "D2" } }).status, "resolved");
  for (const ref of [{ path: "spec/reason.md", anchor: "missing" }, { path: "../outside.md" }, { path: "spec/blueprint.json", entity: { collection: "decisions", id: "missing" } }]) assert.equal(check(ref).status, "unresolved");
  symlinkSync(path.join(f.project, "spec/reason.md"), path.join(f.project, "linked.md")); assert.equal(check({ path: "linked.md" }).status, "unresolved");
  f.experience.blueprint.decisions.push(f.experience.blueprint.decisions[1]); f.put("spec/blueprint.json", f.experience.blueprint); assert.equal(check({ path: "spec/blueprint.json", entity: { collection: "decisions", id: "D2" } }).status, "unresolved");
});
test("broken declared references report invalidity without inventing an edge", t => {
  const f = fixture(t); f.experience.blueprint.screenStates[1].decisionIds = ["missing"]; f.put("spec/blueprint.json", f.experience.blueprint);
  const r = readProductSlice(f.args); assert.ok(r.diagnostics.some(d => d.status === "invalid-blueprint")); assert.ok(r.diagnostics.some(d => d.status === "unresolved")); assert.equal(r.edges.some(e => e.from.includes("missing")), false);
  assert.throws(() => readProductSlice({ ...f.args, seeds: ["spec/blueprint.json#decisions/missing"] }), /seed/);
});
test("result dependency hashes can go stale without changing historical passed result", t => {
  const f = fixture(t); assert.equal(readProductSlice(f.args).diagnostics.find(d => d.type === "dependency-freshness").status, "current");
  f.put("spec/reason.md", '<a id="preserve-draft"></a>\nChanged rationale.'); const r = readProductSlice(f.args); assert.equal(r.diagnostics.find(d => d.type === "dependency-freshness").status, "stale"); assert.equal(JSON.parse(readFileSync(path.join(f.project, "result.json"))).result, "passed");
});
test("ambiguous document entities cannot be joined by unqualified IDs", t => {
  const f = fixture(t); f.put("duplicate-contract.json", f.experience.designContract); const r = readProductSlice({ ...f.args, documents: [...f.args.documents, "duplicate-contract.json"] }); assert.ok(r.diagnostics.some(d => d.reason === "entity file missing or ambiguous"));
});
test("Mermaid escapes document labels and stays derived", t => {
  const f = fixture(t); f.experience.blueprint.decisions[1].detail = 'D2 "<script>\nunsafe'; f.put("spec/blueprint.json", f.experience.blueprint);
  const m = renderProductGraph(readProductSlice(f.args)); assert.match(m, /&quot;&lt;script&gt;/); assert.match(m, /no approval granted/); assert.match(m, /^flowchart LR/); assert.equal(existsSync(path.join(f.project, "graph.json")), false);
});
test("missing optional Beads does not stop local rationale retrieval", t => {
  const f = fixture(t), r = readProductSlice({ ...f.args, tasks: ["closed-1"], env: { PATH: "" } }); assert.ok(r.nodes.some(n => n.id.endsWith("/D2"))); assert.ok(r.diagnostics.some(d => d.tool === "beads" && d.status === "unavailable"));
});
test("native read-only task join includes closed work, rationale and executed-result references", t => {
  const f = fixture(t), bin = path.join(f.project, "bin"); mkdirSync(bin); mkdirSync(path.join(f.project, ".beads"));
  const calls = path.join(f.project, "calls.txt"), refs = [{ relation: "affects", path: "spec/blueprint.json", entity: { collection: "decisions", id: "D2" } }, { relation: "explained-by", path: "spec/reason.md", anchor: "preserve-draft" }, { relation: "verified-by", path: "result.json" }];
  const issue = { id: "closed-1", title: "Draft preservation", status: "closed", metadata: { "product-design": { schemaVersion: 1, references: refs } } };
  const make = (name, body) => writeFileSync(path.join(bin, name), "#!" + process.execPath + "\nconst fs=require('node:fs');fs.appendFileSync(" + JSON.stringify(calls) + ",process.argv.slice(2).join(' ')+'\\n');" + body, { mode: 0o755 });
  make("git", "console.log(" + JSON.stringify(f.project) + ")");
  make("bd", "console.log(JSON.stringify(process.argv.includes('context') ? " + JSON.stringify({ project_id: "test", beads_dir: path.join(f.project, ".beads"), repo_root: f.project, is_redirected: false }) + " : [" + JSON.stringify(issue) + "]))");
  const r = readProductSlice({ ...f.args, tasks: ["closed-1"], seeds: [".beads/issue/closed-1"], env: { PATH: bin } });
  assert.equal(r.nodes.find(n => n.authority === "beads").data.status, "closed"); assert.ok(r.edges.some(e => e.type === "explained-by")); assert.ok(r.edges.some(e => e.type === "verified-by")); assert.ok(r.nodes.some(n => n.id.endsWith("/T2") && n.evidenceLevel === "proposed"));
  assert.match(readFileSync(calls, "utf8"), /--readonly show closed-1 --json --include-comments/); assert.doesNotMatch(readFileSync(calls, "utf8"), /\b(?:close|update|init|enable)\b/);
});
test("annotation inspector sorts by received time and never clears inbox", t => {
  const f = fixture(t); f.put(".goose/annotations/inbox/a.json", record("2026-10-19T11:00:00Z")); f.put(".goose/annotations/inbox/z.json", record("2026-10-19T10:00:00Z"));
  const r = checkAnnotationQueue({ project: f.project, limit: 1 }); assert.equal(r.status, "pending"); assert.equal(r.records[0].path.endsWith("z.json"), true); assert.equal(r.truncated, true); assert.equal(r.execution, "not-run"); assert.equal(existsSync(path.join(f.project, ".goose/annotations/processed")), false);
});
test("annotation route/viewport/bbox/malformed/processed duplicate guards are explicit", t => {
  const f = fixture(t); for (const r of [{ ...record(), route: "//external.test" }, { ...record(), viewport: { width: 0, height: 900 } }, { ...record(), bbox: { x: 1430, y: 0, width: 100, height: 50 } }, { ...record(), components: undefined }]) assert.throws(() => validateAnnotationRecord(r));
  f.put(".goose/annotations/inbox/a.json", record()); f.put(".goose/annotations/processed/a.json", record()); assert.equal(checkAnnotationQueue({ project: f.project }).status, "blocked"); assert.equal(checkAnnotationQueue({ project: f.project }).records.length, 0);
  f.put(".goose/annotations/inbox/b.json", "bad JSON"); assert.equal(checkAnnotationQueue({ project: f.project }).diagnostics.length, 2);
});
test("annotation empty and symlink folders are not installation/QA evidence", t => {
  const f = fixture(t); assert.equal(checkAnnotationQueue({ project: f.project }).installation, "not-proven"); symlinkSync(f.project, path.join(f.project, ".goose")); assert.equal(checkAnnotationQueue({ project: f.project }).status, "blocked");
});
test("new CLIs require explicit project and expose bounded help", () => {
  for (const name of ["read-product-slice", "check-annotation-queue"]) {
    const file = fileURLToPath(new URL("./" + name + ".mjs", import.meta.url)); const r = spawnSync(process.execPath, [file], { encoding: "utf8" }); assert.equal(r.status, 1); assert.equal(spawnSync(process.execPath, [file, "--help"], { encoding: "utf8" }).status, 0);
  }
});

test("source impact conservatively includes all screens when whole context changes", t => {
  const f = fixture(t);
  const plan = { schemaVersion: 1, kind: "product-design-source-plan", journeyId: "demo", sessionId: "selected", involved: true, specificationSources: [{ id: "SPEC", path: "spec/reason.md", sha256: sha256(readFileSync(path.join(f.project, "spec/reason.md"))), revision: "1", authority: "current" }], context: { designContract: { path: "spec/contract.json", sha256: sha256(readFileSync(path.join(f.project, "spec/contract.json"))) }, blueprint: { path: "spec/blueprint.json", sha256: sha256(readFileSync(path.join(f.project, "spec/blueprint.json"))) } }, screens: f.experience.blueprint.screenStates.map((s,i) => ({ id: s.screenId, variantId: "V3", purpose: s.question, role: i ? "outcome" : "main-path", nextScreen: i ? "End" : "V3-S2", attemptLimit: 2, links: { specificationIds: ["SPEC"], scenarioIds: [s.scenarioId], decisionIds: s.decisionIds, screenStateIds: [s.id], verificationIds: ["T" + (i+1)] } })) };
  f.put("plan.json", plan); const args = { ...f.args, documents: [...f.args.documents, "plan.json"] };
  assert.equal(readProductSlice(args).diagnostics.find(d => d.type === "source-impact").status, "unchanged");
  f.experience.blueprint.decisions[1].detail += " changed"; f.put("spec/blueprint.json", f.experience.blueprint);
  const r = readProductSlice(args), impact = r.diagnostics.find(d => d.type === "source-impact"); assert.equal(impact.status, "review-required"); assert.deepEqual(impact.affectedScreenIds, ["V3-S1", "V3-S2"]);
  assert.ok(r.edges.some(e => e.type === "source-for"));
});
test("explicit anchor exposes rationale text and empty dependencies claim nothing", t => {
  const f = fixture(t); assert.match(validateProductReferences({ project: f.project, references: [{ path: "spec/reason.md", anchor: "preserve-draft" }] })[0].excerpt, /Keep editable/);
  f.put("empty-result.json", { kind: "experiment-structural-result", dependencies: [] });
  const r = readProductSlice({ ...f.args, documents: [...f.args.documents, "empty-result.json"] }); assert.equal(r.diagnostics.find(d => d.path === "empty-result.json" && d.type === "dependency-freshness").status, "not-inspected");
});
test("changed workflows reference canonical reasoning and shipped scripts", () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  for (const name of ["index", "get-context", "research", "audit", "ideate", "image-to-code", "url-to-code", "design-qa", "annotate", "project-status", "share"]) {
    const s = readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8"); assert.match(s, /PLUGIN_ROOT\/references\/product-lifecycle-reasoning.md/);
  }
  assert.match(readFileSync(path.join(root, "references/product-lifecycle-reasoning.md"), "utf8"), /read-product-slice.mjs/);
  assert.match(readFileSync(path.join(root, "skills/annotate/SKILL.md"), "utf8"), /check-annotation-queue.mjs/);
  assert.ok(readFileSync(path.join(root, "skills/project-status/SKILL.md"), "utf8").includes("canonical " + String.fromCharCode(96) + "design-qa.json"));
});
