import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { checkProductTooling, planToolSetup } from "./check-product-tooling.mjs";

function fixture(t, { bd = true, entire = true, agent = true, initialized = true, enabled = true, hooks = true, rootMismatch = false, malformed = false, failContext = false, statusError = false, externalName = "goose", protocol = 1, hang = false } = {}) {
  const temp = mkdtempSync(path.join(tmpdir(), "pd-tooling-")), project = path.join(temp, "target"), bin = path.join(temp, "bin"), trace = path.join(temp, "calls.jsonl");
  for (const p of [project, bin]) mkdirSync(p);
  if (initialized) mkdirSync(path.join(project, ".beads"));
  if (enabled) { mkdirSync(path.join(project, ".entire")); writeFileSync(path.join(project, ".entire/settings.json"), "preserve bytes"); }
  mkdirSync(path.join(project, ".agents")); writeFileSync(path.join(project, ".agents/preserve"), "user integration"); writeFileSync(path.join(project, "AGENTS.md"), "user instructions");
  const make = (name, body) => writeFileSync(path.join(bin, name), "#!" + process.execPath + "\nconst fs = require('node:fs'); fs.appendFileSync(" + JSON.stringify(trace) + ", JSON.stringify({name:" + JSON.stringify(name) + ",args:process.argv.slice(2),cwd:process.cwd()})+'\\n');\n" + body, { mode: 0o755 });
  make("git", "console.log(" + JSON.stringify(rootMismatch ? temp : project) + ");");
  if (bd) make("bd", hang ? "setTimeout(()=>{},10000)" : failContext ? "process.exit(1)" : "console.log(" + JSON.stringify(malformed ? "not json" : JSON.stringify({ project_id: "fixture-tracker", beads_dir: path.join(project, ".beads"), repo_root: project, is_redirected: false })) + ");");
  if (entire) make("entire", "console.log(" + JSON.stringify(JSON.stringify(statusError ? { enabled: true, error: "settings unreadable" } : { enabled, agents: [], checkpoint_sync_remote: "origin" })) + ");");
  if (agent) make("entire-agent-goose", "console.log(JSON.stringify(process.argv[2] === 'info' ? " + JSON.stringify({ name: externalName, protocol_version: protocol }) + " : {installed:" + hooks + "}));");
  const env = { PATH: bin, HOME: temp }, options = { project, agent: "goose", env };
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  return { project, temp, bin, env, options, calls: () => existsSync(trace) ? readFileSync(trace, "utf8").trim().split("\n").map(s => JSON.parse(s)) : [], check: extra => checkProductTooling({ ...options, ...extra }) };
}
const beadsHelp = "--non-interactive --skip-hooks --skip-agents";
const entireHelp = "--agent --telemetry --no-init-repo --skip-push-sessions";
const consent = (project, tool = "beads") => ({ project, beads: tool === "beads", entire: { agent: "goose", recording: true, synchronization: "disabled" } });

test("configured target stays read-only; empty agent list is not unsupported Goose", t => {
  const f = fixture(t), r = f.check();
  assert.equal(r.git.state, "associated"); assert.equal(r.beads.state, "initialized"); assert.equal(r.entire.state, "enabled"); assert.equal(r.entire.external, "available"); assert.equal(r.entire.integration, "unknown");
  assert.equal(r.entire.recording, "not-tested"); assert.equal(r.entire.syncDestination, "origin");
  assert.equal(f.calls().some(c => c.name === "entire-agent-goose"), false);
  for (const tool of ["beads", "entire"]) assert.equal(planToolSetup(r, { tool, project: f.project, consent: consent(f.project, tool) }).status, "already-configured");
  assert.equal(readFileSync(path.join(f.project, ".entire/settings.json"), "utf8"), "preserve bytes"); assert.equal(readFileSync(path.join(f.project, ".agents/preserve"), "utf8"), "user integration");
  assert.deepEqual(f.calls().map(c => c.args), [["rev-parse", "--show-toplevel"], ["--readonly", "context", "--json"], ["status", "--json"]]);
});
test("selected trusted external protocol checks installation, not transcript recording", t => {
  const f = fixture(t), r = f.check({ probeExternal: true });
  assert.equal(r.entire.external, "protocol-verified"); assert.equal(r.entire.integration, "installed"); assert.equal(r.entire.recording, "not-tested");
  assert.deepEqual(f.calls().filter(c => c.name === "entire-agent-goose").map(c => c.args), [["info"], ["are-hooks-installed"]]);
  assert.ok(f.calls().every(c => c.cwd === f.project));
});
test("external missing hooks and bad protocol/name stay distinct from unsupported", t => {
  const missing = fixture(t, { hooks: false }); assert.equal(missing.check({ probeExternal: true }).entire.integration, "not-installed");
  for (const config of [{ protocol: 2 }, { externalName: "other" }]) { const f = fixture(t, config), r = f.check({ probeExternal: true }); assert.equal(r.entire.external, "unverified"); assert.equal(r.entire.integration, "unknown"); assert.equal(f.calls().filter(c => c.name === "entire-agent-goose").length, 1); }
});
test("actual missing executables in isolated PATH do not block ordinary design or run init", t => {
  const f = fixture(t, { bd: false, entire: false, agent: false, initialized: false, enabled: false }), r = f.check();
  assert.equal(r.beads.installed, false); assert.equal(r.entire.installed, false); assert.ok(r.warnings.some(w => w.includes("local design work can continue")));
  assert.deepEqual(f.calls().map(c => c.name), ["git"]); assert.equal(planToolSetup(r, { tool: "beads", project: f.project, consent: consent(f.project) }).status, "blocked");
});
test("different target root and tracker routing cannot select parent or initialize elsewhere", t => {
  const f = fixture(t, { rootMismatch: true }), r = f.check(); assert.equal(r.git.state, "different-root"); assert.equal(r.entire.state, "association-unknown");
  assert.equal(planToolSetup(r, { tool: "entire", project: f.project, consent: consent(f.project, "entire"), help: entireHelp }).status, "blocked");
  const routed = f.check({ env: { ...f.env, BEADS_DIR: "/wrong/tracker" } }); assert.equal(routed.beads.state, "association-unknown");
  assert.equal(f.calls().filter(c => c.name === "bd").length, 1);
  const gitRouted = f.check({ env: { ...f.env, GIT_DIR: "/wrong/repo" } }); assert.equal(gitRouted.git.state, "association-unknown");
});
test("wrong tracker reply, malformed JSON, child failure and timeout are not initialized", t => {
  const f = fixture(t); writeFileSync(path.join(f.bin, "bd"), "#!" + process.execPath + "\nconsole.log(JSON.stringify({project_id:'other',beads_dir:'/missing',repo_root:'/missing',is_redirected:true}))", { mode: 0o755 });
  assert.equal(f.check().beads.state, "wrong-project");
  for (const config of [{ malformed: true }, { failContext: true }, { hang: true }]) { const x = fixture(t, config); assert.equal(x.check({ timeoutMs: config.hang ? 100 : 5000 }).beads.state, "unverified"); }
  const bad = fixture(t, { statusError: true }); assert.equal(bad.check().entire.state, "unverified");
});
test("Beads setup is a target-consented command plan with no hooks or instruction rewrites", t => {
  const f = fixture(t, { initialized: false }), r = f.check(); assert.equal(r.beads.state, "not-initialized");
  for (const c of [undefined, { project: f.temp, beads: true }, { project: f.project, beads: false }]) assert.equal(planToolSetup(r, { tool: "beads", project: f.project, consent: c, help: beadsHelp }).status, "blocked");
  assert.equal(planToolSetup(r, { tool: "beads", project: f.project, consent: consent(f.project), help: "" }).status, "blocked");
  const p = planToolSetup(r, { tool: "beads", project: f.project, consent: consent(f.project), help: beadsHelp }); assert.equal(p.status, "planned"); assert.deepEqual(p.args, ["init", "--non-interactive", "--skip-hooks", "--skip-agents"]);
  assert.equal(f.calls().some(c => c.args.includes("init")), false); assert.equal(existsSync(path.join(f.project, ".beads")), false); assert.equal(readFileSync(path.join(f.project, "AGENTS.md"), "utf8"), "user instructions");
});
test("Entire setup requires recording and sync choice independently of telemetry", t => {
  const f = fixture(t, { enabled: false }), r = f.check(); assert.equal(r.entire.state, "not-enabled");
  const c = consent(f.project, "entire"), plan = value => planToolSetup(r, { tool: "entire", project: f.project, consent: value, help: entireHelp });
  assert.equal(plan({ project: f.project }).status, "blocked");
  assert.equal(plan({ ...c, entire: { ...c.entire, recording: false } }).status, "blocked");
  assert.equal(plan({ ...c, entire: { ...c.entire, agent: "codex" } }).status, "blocked");
  assert.equal(plan({ ...c, entire: { ...c.entire, synchronization: undefined } }).status, "blocked");
  assert.deepEqual(plan(c).args, ["enable", "--agent", "goose", "--telemetry=false", "--no-init-repo", "--skip-push-sessions"]);
  const sync = plan({ ...c, entire: { ...c.entire, synchronization: "approved-default", destination: "origin" } }); assert.equal(sync.status, "planned"); assert.equal(sync.expectedSyncDestination, "origin"); assert.equal(sync.args.includes("--skip-push-sessions"), false);
  assert.equal(f.calls().some(c => c.args.includes("enable")), false);
});
test("disabled existing Entire config and symlink settings/trackers are never reinitialized", t => {
  const f = fixture(t, { enabled: false }); mkdirSync(path.join(f.project, ".entire")); writeFileSync(path.join(f.project, ".entire/settings.json"), "keep");
  const r = f.check(); assert.equal(r.entire.state, "disabled"); assert.equal(planToolSetup(r, { tool: "entire", project: f.project, consent: consent(f.project, "entire"), help: entireHelp }).status, "blocked");
  rmSync(path.join(f.project, ".entire/settings.json")); symlinkSync(path.join(f.project, "AGENTS.md"), path.join(f.project, ".entire/settings.json")); assert.equal(f.check().entire.state, "unsafe-path");
  rmSync(path.join(f.project, ".beads"), { recursive: true }); symlinkSync(f.temp, path.join(f.project, ".beads")); assert.equal(f.check().beads.state, "unsafe-path");
});
test("explicit absolute roots and host identifiers; relative PATH entries not executed", t => {
  const f = fixture(t); assert.throws(() => checkProductTooling({ project: "." }), /absolute/); assert.throws(() => f.check({ agent: "goose;touch" }), /identifier/); assert.throws(() => f.check({ timeoutMs: 0 }), /timeoutMs/);
  const r = f.check({ agent: undefined }); assert.equal(r.agent, null); assert.ok(r.warnings.some(w => w.includes("host is unspecified")));
  const empty = f.check({ env: { ...f.env, PATH: "." } }); assert.equal(empty.git.state, "missing"); assert.equal(empty.beads.installed, false);
});
test("CLI requires explicit target and refuses a setup option", t => {
  const script = path.join(path.dirname(new URL(import.meta.url).pathname), "check-product-tooling.mjs");
  for (const args of [[], ["--setup"]]) { const r = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" }); assert.equal(r.status, 1); }
});

test("exact native agent identifiers can confirm built-ins without a hard-coded list", t => {
  const f = fixture(t, { agent: false });
  writeFileSync(path.join(f.bin, "entire"), "#!" + process.execPath + "\nconsole.log(JSON.stringify({enabled:true,agents:['codex']}))", { mode: 0o755 });
  assert.equal(f.check({ agent: "codex" }).entire.integration, "installed");
  assert.equal(f.check({ agent: "claude-code" }).entire.integration, "unknown");
});
test("plan cannot claim default synchronization consent without a reviewed destination", t => {
  const f = fixture(t, { enabled: false }), r = f.check();
  const c = consent(f.project, "entire"); c.entire.synchronization = "approved-default";
  assert.equal(planToolSetup(r, { tool: "entire", project: f.project, consent: c, help: entireHelp }).status, "blocked");
  c.entire.synchronization = "disabled";
  assert.equal(planToolSetup(r, { tool: "entire", project: f.project, consent: c, help: "--agent --telemetry --no-init-repo" }).status, "blocked");
});
test("skill triggers, shared policy and packaging include the same onboarding authority", () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  for (const name of ["index", "get-context", "project-status"]) {
    const text = readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8");
    assert.match(text, /PLUGIN_ROOT\/references\/tooling-onboarding.md/);
    assert.match(text, /PLUGIN_ROOT\/scripts\/check-product-tooling.mjs/);
  }
  const policy = readFileSync(path.join(root, "references/tooling-onboarding.md"), "utf8");
  for (const phrase of ["--skip-hooks --skip-agents", "--telemetry=false", "--no-init-repo", "--skip-push-sessions", "recording:not-tested", "No hook is added or activated", "never PLUGIN_ROOT"]) assert.ok(policy.includes(phrase), phrase);
});
