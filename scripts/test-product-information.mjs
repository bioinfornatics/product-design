import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readProductInformation } from "./read-product-information.mjs";
import { readProductSlice, validateProductReferences } from "./read-product-slice.mjs";
import { sha256 } from "./workflow-evidence-contract.mjs";

function fixture(t) {
  const project = mkdtempSync(path.join(tmpdir(), "pd-information-"));
  const put = (name, data) => { const file = path.join(project, name); mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data)); return file; };
  t.after(() => rmSync(project, { recursive: true, force: true }));
  return { project, put };
}
function collect(project, page, maxChars = 73) {
  const chunks = [page.text], hashes = [page.sha256]; let count = 0;
  while (page.nextCursor) { assert.ok(count++ < 2000); page = readProductInformation({ project, cursor: page.nextCursor, maxChars }); assert.equal(page.status, "resolved"); chunks.push(page.text); hashes.push(page.sha256); }
  assert.equal(new Set(hashes).size, 1); return { text: chunks.join(""), page };
}

test("overview reveals navigation, not product bodies or generated summaries", t => {
  const f = fixture(t); f.put("product.md", '# Product\n<a id="layout"></a>\n## Layout\nSECRET-BODY-DETAIL\n<a id="recovery"></a>\n## Recovery\nFull reason.');
  const page = readProductInformation({ project: f.project, reference: { path: "product.md" } });
  assert.equal(page.status, "resolved"); assert.equal(page.mode, "overview"); assert.equal(page.representation, "derived-navigation"); assert.match(page.text, /layout/); assert.match(page.text, /Recovery/); assert.doesNotMatch(page.text, /SECRET-BODY-DETAIL/); assert.equal(page.selection.wholeDocument, false);
});
test("anchored full semantic section pages to the final contraindication without the next section", t => {
  const f = fixture(t), section = '\n## Layout\n' + "Reason and context. ".repeat(550) + '\nWARNING: do not remove recovery; rejected automatic sending.\n';
  const bytes = '<a id="layout"></a>' + section + '<a id="other"></a>\nOTHER-SECTION'; f.put("why.md", bytes);
  const first = readProductInformation({ project: f.project, reference: { path: "why.md", anchor: "layout" }, mode: "excerpt", maxChars: 1000 });
  assert.equal(first.paging.partial, true); assert.equal(first.paging.complete, false); assert.doesNotMatch(first.text, /WARNING/); assert.ok(first.nextCursor); assert.equal(first.sha256, sha256(bytes));
  const result = collect(f.project, first, 1000); assert.equal(result.text, section); assert.match(result.text, /WARNING/); assert.doesNotMatch(result.text, /OTHER-SECTION/); assert.equal(result.page.paging.atEnd, true);
  assert.equal(readFileSync(path.join(f.project, "why.md"), "utf8"), bytes);
});
test("source changed mid-read returns stale without mixed text or renewed authorization", t => {
  const f = fixture(t); f.put("why.md", 'a'.repeat(4000)); const first = readProductInformation({ project: f.project, reference: { path: "why.md" }, mode: "excerpt" });
  f.put("why.md", 'b'.repeat(4000)); const next = readProductInformation({ project: f.project, cursor: first.nextCursor });
  assert.equal(next.status, "stale"); assert.equal(next.text, null); assert.equal(next.nextCursor, null); assert.notEqual(next.actualSha256, first.sha256); assert.match(next.authorization, /no.*approval/i);
  const restarted = readProductInformation({ project: f.project, reference: { path: "why.md" }, mode: "excerpt" }); assert.match(restarted.text, /^b+$/); assert.notEqual(restarted.sha256, first.sha256);
});
test("cursor is portable to a new process but confined to one explicit root and selection", t => {
  const f = fixture(t); f.put("why.md", 'x'.repeat(4100)); const first = readProductInformation({ project: f.project, reference: { path: "why.md" }, mode: "excerpt" }); f.put("cursor.json", first.nextCursor);
  const cli = fileURLToPath(new URL("./read-product-information.mjs", import.meta.url));
  const r = spawnSync(process.execPath, [cli, "--project", f.project, "--cursor", "cursor.json", "--max-chars", "100"], { encoding: "utf8" }); assert.equal(r.status, 0, r.stderr); assert.equal(JSON.parse(r.stdout).paging.offset, 2000);
  const other = fixture(t); other.put("why.md", 'x'.repeat(4100)); assert.throws(() => readProductInformation({ project: other.project, cursor: first.nextCursor }), /root|project/);
  assert.throws(() => readProductInformation({ project: f.project, cursor: first.nextCursor, reference: { path: "why.md" } }), /cursor|continuation/);
  assert.throws(() => readProductInformation({ project: f.project, cursor: { ...first.nextCursor, offset: -1 } }), /cursor|offset/);
});
test("projection binding rejects a cursor whose reference or fields were changed", t => {
  const f = fixture(t); f.put("value.json", { a: "a".repeat(3000), b: "b".repeat(3000) });
  const first = readProductInformation({ project: f.project, reference: { path: "value.json" }, mode: "excerpt", fields: ["a"] });
  const next = readProductInformation({ project: f.project, cursor: { ...first.nextCursor, fields: ["b"] } }); assert.notEqual(next.status, "resolved"); assert.equal(next.text, null);
});
test("JSON entity and selected fields return only authoritative selected values", t => {
  const f = fixture(t), data = { personas: [{ id: "operator", responsibility: "Review", ignored: "not selected" }], decisions: [{ id: "D1", reason: "Compare revisions", constraints: ["Preserve drafts"], irrelevant: "SECRET-IRRELEVANT" }], unrelated: "SECRET-ROOT" }; f.put("product.json", data);
  const page = readProductInformation({ project: f.project, reference: { path: "product.json", entity: { collection: "decisions", id: "D1" } }, mode: "excerpt", fields: ["reason", "constraints"] });
  assert.deepEqual(JSON.parse(page.text), { reason: "Compare revisions", constraints: ["Preserve drafts"] }); assert.equal(page.selection.omittedFieldCount, 2); assert.equal(page.selection.wholeDocument, false); assert.equal(page.representation, "json-projection"); assert.doesNotMatch(page.text, /SECRET/);
  const rootField = readProductInformation({ project: f.project, reference: { path: "product.json" }, mode: "excerpt", fields: ["personas"] }); assert.deepEqual(JSON.parse(rootField.text), { personas: data.personas });
  assert.equal(readProductInformation({ project: f.project, reference: { path: "product.json" }, mode: "excerpt", fields: ["missing"] }).status, "unresolved");
});
test("JSON overview is bounded and does not leak entity bodies", t => {
  const f = fixture(t); f.put("product.json", { decisions: Array.from({ length: 100 }, (_, i) => ({ id: "D" + i, reason: "SECRET-LONG-REASON".repeat(100) })), value: "SECRET-VALUE" });
  const first = readProductInformation({ project: f.project, reference: { path: "product.json" }, maxChars: 40 }); assert.ok(first.nextCursor); assert.equal(first.paging.partial, true);
  const full = collect(f.project, first).text; assert.match(full, /D99/); assert.match(full, /value/); assert.doesNotMatch(full, /SECRET/);
});
test("literal headings and anchors inside code fences cannot cut the semantic section", t => {
  const f = fixture(t); const section = '\n## Layout\n~~~html\n<a id="layout"></a>\n<a id="fake"></a>\n## Fake heading\n~~~\nConstraint after example.\n'; f.put("why.md", '<a id="layout"></a>' + section + '<a id="next"></a>\nNext');
  const page = readProductInformation({ project: f.project, reference: { path: "why.md", anchor: "layout" }, mode: "excerpt" }); assert.equal(page.text, section);
  const overview = readProductInformation({ project: f.project, reference: { path: "why.md" } }); assert.doesNotMatch(overview.text, /fake|Fake heading/); assert.match(overview.text, /next/);
});
test("Unicode code-point paging preserves exact text even at a one-character budget", t => {
  const f = fixture(t), text = "É😀漢\n"; f.put("unicode.md", text); const first = readProductInformation({ project: f.project, reference: { path: "unicode.md" }, mode: "excerpt", maxChars: 1 }); assert.equal(first.paging.totalChars, 4); assert.equal(collect(f.project, first, 1).text, text);
});
test("missing duplicate ambiguous or unsafe references stay unresolved", t => {
  const f = fixture(t); f.put("why.md", '<a id="repeat"></a>\nA\n<a id="repeat"></a>\nB'); f.put("data.json", { decisions: [{ id: "D1" }, { id: "D1" }] }); symlinkSync(path.join(f.project, "why.md"), path.join(f.project, "linked.md"));
  for (const reference of [{ path: "missing.md" }, { path: "../why.md" }, { path: "linked.md" }, { path: "why.md", anchor: "repeat" }, { path: "data.json", entity: { collection: "decisions", id: "D1" } }]) assert.equal(readProductInformation({ project: f.project, reference, mode: "excerpt" }).status, "unresolved");
  f.put("huge.md", 'a'.repeat(1024 * 1024 + 1)); assert.equal(readProductInformation({ project: f.project, reference: { path: "huge.md" } }).status, "unresolved");
  for (const maxChars of [0, 8001, 1.5]) assert.throws(() => readProductInformation({ project: f.project, reference: { path: "why.md" }, maxChars }), /maxChars/);
});
test("no-heading documents and empty sections disclose their exact coverage", t => {
  const f = fixture(t); f.put("plain.md", "An entire reason."); f.put("empty.md", '<a id="empty"></a><a id="next"></a>next');
  assert.match(readProductInformation({ project: f.project, reference: { path: "plain.md" } }).text, /no headings/i);
  const full = readProductInformation({ project: f.project, reference: { path: "plain.md" }, mode: "excerpt" }); assert.equal(full.selection.wholeDocument, true); assert.equal(full.paging.complete, true);
  const empty = readProductInformation({ project: f.project, reference: { path: "empty.md", anchor: "empty" }, mode: "excerpt" }); assert.equal(empty.text, ""); assert.equal(empty.paging.complete, true);
});
test("graph root nodes never preload full JSON and partial node text has a continuation", t => {
  const f = fixture(t); f.put("product.json", { decisions: [{ id: "D1", reason: "x".repeat(10000) + "FINAL-CONSTRAINT" }], unrelated: "SECRET-ROOT" });
  const r = readProductSlice({ project: f.project, documents: ["product.json"], seeds: ["product.json", "product.json#decisions/D1"] });
  assert.doesNotMatch(JSON.stringify(r), /SECRET-ROOT/); const entity = r.nodes.find(n => n.id.endsWith("/D1")); assert.equal(entity.content.paging.partial, true); assert.ok(entity.content.nextCursor); assert.ok(r.diagnostics.some(d => d.type === "content-coverage" && d.status === "partial"));
  assert.match(collect(f.project, { ...entity.content, text: entity.data.excerpt }).text, /FINAL-CONSTRAINT/);
});
test("document-only reasons and anchors return bounded text with honest completeness", t => {
  const f = fixture(t); f.put("why.md", '<a id="layout"></a>' + "Reason. ".repeat(1500) + "FINAL-WARNING");
  const resolved = validateProductReferences({ project: f.project, references: [{ path: "why.md" }] })[0]; assert.match(resolved.excerpt, /Reason/); assert.equal(resolved.content.paging.partial, true);
  const r = readProductSlice({ project: f.project, seeds: [{ path: "why.md", anchor: "layout" }] }); assert.equal(r.truncated, false); assert.equal(r.nodes[0].content.paging.partial, true); assert.ok(r.nodes[0].content.nextCursor); assert.match(collect(f.project, { ...r.nodes[0].content, text: r.nodes[0].data.excerpt }).text, /FINAL-WARNING/);
});
test("graph payload budget limits total node content without claiming text completeness", t => {
  const f = fixture(t); f.put("product.json", { decisions: Array.from({ length: 12 }, (_, i) => ({ id: "D" + i, reason: 'x'.repeat(1800) })) });
  const r = readProductSlice({ project: f.project, documents: ["product.json"], seeds: Array.from({ length: 12 }, (_, i) => "product.json#decisions/D" + i), limits: { maxContentChars: 2500 } });
  const chars = r.nodes.reduce((n, node) => n + Array.from(JSON.stringify(node.data)).length, 0); assert.ok(chars <= 2500, String(chars)); assert.ok(r.nodes.some(n => n.content.status === "link-only")); assert.equal(r.contentBudget.limit, 2500); assert.equal(r.truncated, false);
});
test("native document-only reason joins on demand without leaking a long task body", t => {
  const f = fixture(t); mkdirSync(path.join(f.project, ".beads")); mkdirSync(path.join(f.project, "bin")); f.put("why.md", "Preserve direct controls and drafts.");
  const issue = { id: "demo-1", title: "Preserve draft", status: "closed", description: "TASK-DETAIL".repeat(2000), metadata: { "product-design": { schemaVersion: 1, references: [{ relation: "explained-by", path: "why.md" }] } } };
  const cli = (name, source) => writeFileSync(path.join(f.project, "bin", name), "#!" + process.execPath + "\n" + source, { mode: 0o755 }); cli("git", "console.log(" + JSON.stringify(f.project) + ")"); cli("bd", "console.log(JSON.stringify(process.argv.includes('context') ? " + JSON.stringify({ project_id: "test", beads_dir: path.join(f.project, ".beads"), repo_root: f.project, is_redirected: false }) + " : [" + JSON.stringify(issue) + "]))");
  const r = readProductSlice({ project: f.project, tasks: [issue.id], seeds: [".beads/issue/" + issue.id], env: { PATH: path.join(f.project, "bin") } }); const why = r.nodes.find(n => n.reference?.path === "why.md"); assert.match(why.data.excerpt, /Preserve direct/); assert.equal(why.content.paging.complete, true); assert.doesNotMatch(JSON.stringify(r), /TASK-DETAIL/); assert.equal(r.nodes.find(n => n.authority === "beads").content.status, "link-only");
});
test("CLI help and invalid input are explicit and read-only", t => {
  const f = fixture(t), cli = fileURLToPath(new URL("./read-product-information.mjs", import.meta.url)); assert.equal(spawnSync(process.execPath, [cli, "--help"]).status, 0); assert.equal(spawnSync(process.execPath, [cli]).status, 1);
  f.put("why.md", "Reason"); f.put("cursor.json", "invalid JSON"); assert.equal(spawnSync(process.execPath, [cli, "--project", f.project, "--cursor", "cursor.json"]).status, 1); assert.equal(spawnSync(process.execPath, [cli, "--project", f.project, "--file", "why.md", "--collection", "decisions"]).status, 1);
});

test("backtick fences with closing indentation and trailing spaces preserve section scope", t => {
  const f = fixture(t), tick = String.fromCharCode(96).repeat(3);
  const section = "\n" + tick + "html\n<a id=\"fake\"></a>\n  " + tick + "   \nConstraint after closing fence.\n";
  f.put("why.md", '<a id="layout"></a>' + section + '<a id="next"></a>\nNext');
  const page = readProductInformation({ project: f.project, reference: { path: "why.md", anchor: "layout" }, mode: "excerpt" }); assert.equal(page.text, section);
  assert.doesNotMatch(readProductInformation({ project: f.project, reference: { path: "why.md" } }).text, /fake/);
});
test("selected content survives a restart without a persisted parser cache", t => {
  const f = fixture(t); f.put("decision.json", { decisions: [{ id: "D1", reason: "Reason. ".repeat(800) + "LATE-RECOVERY" }] });
  const first = readProductInformation({ project: f.project, reference: { path: "decision.json", entity: { collection: "decisions", id: "D1" } }, mode: "excerpt", maxChars: 1000 });
  f.put("cursor.json", first.nextCursor); const cli = fileURLToPath(new URL("./read-product-information.mjs", import.meta.url));
  const next = JSON.parse(spawnSync(process.execPath, [cli, "--project", f.project, "--cursor", "cursor.json", "--max-chars", "8000"], { encoding: "utf8" }).stdout);
  assert.equal(next.status, "resolved"); assert.equal(next.sha256, first.sha256); assert.equal(next.paging.atEnd, true); assert.match(next.text, /LATE-RECOVERY/);
  assert.equal(JSON.parse(first.text + next.text).decisions, undefined); assert.match(JSON.parse(first.text + next.text).reason, /LATE-RECOVERY/);
});
test("graph serialized payload bounds account for escape expansion and many seed nodes", t => {
  const f = fixture(t); f.put("product.json", { decisions: Array.from({ length: 100 }, (_, i) => ({ id: "D" + i, detail: '\u0001"\\😀'.repeat(200) })) });
  const r = readProductSlice({ project: f.project, documents: ["product.json"], seeds: Array.from({ length: 100 }, (_, i) => "product.json#decisions/D" + i), limits: { maxContentChars: 2000 } });
  assert.ok(r.contentBudget.used <= 2000); assert.equal(r.contentBudget.used, r.nodes.reduce((n, node) => n + Array.from(JSON.stringify(node.data)).length, 0)); assert.ok(r.nodes.some(n => n.content.status === "link-only"));
});
test("selected empty JSON values retain their type and literal property names", t => {
  const f = fixture(t); f.put("values.json", '{"__proto__":{"safe":true},"a.b":false,"empty":null,"array":[]}');
  const page = readProductInformation({ project: f.project, reference: { path: "values.json" }, fields: ["__proto__", "a.b", "empty"], mode: "excerpt" });
  const data = JSON.parse(page.text); assert.deepEqual(data["__proto__"], { safe: true }); assert.equal(data["a.b"], false); assert.equal(data.empty, null); assert.equal(page.selection.omittedFieldCount, 1);
});

test("multiline explicit anchors resolve while code spans and comments cannot create boundaries", t => {
  const f = fixture(t), tick = String.fromCharCode(96);
  const section = "\n## Layout\n" + tick + '<a id="fake"></a>' + tick + '\n<!-- <a id="hidden"></a> -->\nFinal constraint.\n';
  f.put("why.md", '<a\n id="layout"\n>\n</a>' + section + '<a id="next"></a>Next');
  const page = readProductInformation({ project: f.project, reference: { path: "why.md", anchor: "layout" }, mode: "excerpt" }); assert.equal(page.text, section);
  const overview = readProductInformation({ project: f.project, reference: { path: "why.md" } }); assert.match(overview.text, /layout/); assert.doesNotMatch(overview.text, /fake|hidden/);
});
test("focused workflows route progressive reads; shared scenarios cover continuation once", () => {
  const cases = JSON.parse(readFileSync(new URL("../skills/get-context/evals/evals.json", import.meta.url))).evals;
  for (const name of ["scoped-why-read-get-context", "long-section-continuation-get-context", "source-changed-mid-read-get-context"]) { const scenario = cases.find(e => e.name === name); assert.ok(scenario); assert.equal(scenario.status, "not-run"); assert.equal(scenario.target.execution, "explain"); }
  const root = fileURLToPath(new URL("../", import.meta.url));
  for (const name of ["index", "get-context", "research", "audit", "ideate", "image-to-code", "url-to-code", "design-qa", "annotate", "project-status", "share"]) {
    const skill = readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8"); assert.match(skill, /PLUGIN_ROOT\/references\/product-information-disclosure.md/); assert.match(skill, /PLUGIN_ROOT\/scripts\/read-product-information.mjs/);

  }
});
