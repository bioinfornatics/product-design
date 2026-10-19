import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { inspectSkillResources, projectSkillResources, verifySkillProjection } from "./skill-resource-contract.mjs";
import { sha256 } from "./workflow-evidence-contract.mjs";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function workspace() {
  const temp = mkdtempSync(path.join(tmpdir(), "pd-resources-")), source = path.join(temp, "source"), stage = path.join(temp, "stage");
  for (const p of ["skills/one", "skills/two", "references"]) mkdirSync(path.join(source, p), { recursive: true });
  const text = (name, reference = "a.md") => "---\nname: " + name + "\ndescription: Checks a bounded fixture. Use when testing references.\n---\n\n# Fixture\n\nUse the instruction §load skills product-design:{name}§. Use §load skills product-design:two§. Read §PLUGIN_ROOT/references/".replace(/§/g, String.fromCharCode(96)) + reference + "§.\n".replace(/§/g, String.fromCharCode(96));
  writeFileSync(path.join(source, "skills/one/SKILL.md"), text("one")); writeFileSync(path.join(source, "skills/two/SKILL.md"), text("two"));
  writeFileSync(path.join(source, "references/a.md"), "# A\nRead [B](b.md) when recovery applies.\n"); writeFileSync(path.join(source, "references/b.md"), "# B\nNo invented evidence.\n");
  cpSync(path.join(source, "skills"), path.join(stage, "skills"), { recursive: true });
  return { temp, source, stage, close: () => rmSync(temp, { recursive: true, force: true }) };
}
test("transitive shared resources are projected without editing canonical source or losing phase conditions", () => {
  const f = workspace(); try {
    const original = readFileSync(path.join(f.source, "skills/one/SKILL.md"));
    const found = inspectSkillResources(f.source, "one"); assert.ok(found.resources.some(r => r.path === "references/b.md"));
    const manifest = projectSkillResources(f.source, f.stage); assert.equal(manifest.standalone, false); assert.equal(verifySkillProjection(f.source, f.stage, manifest), true);
    const projected = readFileSync(path.join(f.stage, "skills/one/SKILL.md"), "utf8"); assert.match(projected, /references\/shared\/b.md/); assert.match(projected, /load skills product-design:two/);
    assert.equal(readFileSync(path.join(f.source, "skills/one/SKILL.md")).equals(original), true);
    for (const skill of manifest.skills) for (const r of skill.resources) { assert.equal(sha256(readFileSync(path.join(f.source, r.source))), r.sourceSha256); assert.equal(sha256(readFileSync(path.join(f.stage, "skills", skill.name, r.target))), r.targetSha256); }
    assert.match(readFileSync(path.join(f.stage, "skills/one/references/shared/a.md"), "utf8"), /when recovery applies/);
    const again = projectSkillResources(f.source, f.stage); assert.deepEqual(again, manifest);
  } finally { f.close(); }
});
test("missing transitive resources and peer load typos fail closed", () => {
  const f = workspace(); try {
    rmSync(path.join(f.source, "references/b.md")); assert.throws(() => inspectSkillResources(f.source, "one"), /ENOENT/);
    writeFileSync(path.join(f.source, "references/b.md"), "# B\n");
    const entry = path.join(f.source, "skills/one/SKILL.md"); writeFileSync(entry, readFileSync(entry, "utf8").replace("product-design:two", "product-design:absent")); assert.throws(() => inspectSkillResources(f.source, "one"), /unknown load/);
  } finally { f.close(); }
});
test("sibling Skill file links and inline sibling paths are rejected, not treated as invocation", () => {
  const f = workspace(); try {
    const entry = path.join(f.source, "skills/one/SKILL.md"), original = readFileSync(entry, "utf8");
    writeFileSync(entry, original + "\n[Peer](../two/SKILL.md)\n"); assert.throws(() => inspectSkillResources(f.source, "one"), /cross-Skill/);
    writeFileSync(entry, original + "\nRead §../two/SKILL.md§.\n".replace(/§/g, String.fromCharCode(96))); assert.throws(() => inspectSkillResources(f.source, "one"), /sibling/);
  } finally { f.close(); }
});
test("shared path traversal and symlink escape are rejected", () => {
  const f = workspace(); try {
    writeFileSync(path.join(f.temp, "external.md"), "external");
    const shared = path.join(f.source, "references/b.md"); rmSync(shared); symlinkSync(path.join(f.temp, "external.md"), shared); assert.throws(() => inspectSkillResources(f.source, "one"), /escapes/);
    rmSync(shared); writeFileSync(shared, "[Escape](../../external.md)\n"); assert.throws(() => inspectSkillResources(f.source, "one"), /escapes/);
  } finally { f.close(); }
});
test("authoring pipeline rejects a broken eval target instead of accepting schema-only success", () => {
  const f = workspace(); try {
    rmSync(path.join(f.source, "skills"), { recursive: true });
    for (const folder of ["skills", "references", "tests", "scripts", "templates", "assets"]) cpSync(path.join(repo, folder), path.join(f.source, folder), { recursive: true, filter: p => !p.includes("node_modules") });
    const file = path.join(f.source, "skills/audit/evals/evals.json"), cases = JSON.parse(readFileSync(file)); cases.evals[0].target.path = "missing-fixture"; writeFileSync(file, JSON.stringify(cases));
    const r = spawnSync(process.execPath, [path.join(repo, "scripts/validate-authoring.mjs"), "--root", f.source], { encoding: "utf8" }); assert.equal(r.status, 1); assert.match(r.stderr, /missing-fixture/); assert.doesNotMatch(r.stdout, /passed/);
  } finally { f.close(); }
});

test("projection drift and attempts to project over canonical source are rejected", () => {
  const f = workspace(); try {
    assert.throws(() => projectSkillResources(f.source, f.source), /isolated stage/);
    const manifest = projectSkillResources(f.source, f.stage);
    writeFileSync(path.join(f.stage, "skills/one/references/shared/b.md"), "drift"); assert.throws(() => verifySkillProjection(f.source, f.stage, manifest), /resource drift/);
    const bad = structuredClone(manifest); bad.skills[0].resources = []; assert.throws(() => verifySkillProjection(f.source, f.stage, bad), /coverage drift/);
  } finally { f.close(); }
});
