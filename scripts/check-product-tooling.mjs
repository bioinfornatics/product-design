#!/usr/bin/env node
import { accessSync, constants, lstatSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { inspectProductCapabilities } from "./product-capabilities.mjs";
import { productFile } from "./product-local-files.mjs";

const fail = message => { throw new Error(message); };
const agentName = value => { if (value !== undefined && !/^[a-z][a-z0-9-]{0,63}$/.test(value)) fail("agent must be an explicit Entire agent identifier, not a command or path"); return value; };
function marker(file) {
  try { const s = lstatSync(file); return s.isSymbolicLink() ? "unsafe" : s.isDirectory() ? "directory" : s.isFile() ? "file" : "unsafe"; }
  catch (error) { return error.code === "ENOENT" ? "missing" : "unsafe"; }
}
function executable(name, env) {
  const names = process.platform === "win32" ? [name + ".exe", name] : [name];
  // Never execute a repository-supplied command through relative/empty PATH entries.
  for (const directory of (env.PATH ?? "").split(path.delimiter).filter(p => path.isAbsolute(p))) for (const filename of names) {
    const candidate = path.join(directory, filename);
    try { accessSync(candidate, constants.X_OK); if (lstatSync(realpathSync(candidate)).isFile()) return candidate; } catch { /* continue */ }
  }
  return null;
}
function command(file, args, { project, env, timeoutMs }) {
  const r = spawnSync(file, args, { cwd: project, env: { ...env, GIT_OPTIONAL_LOCKS: "0" }, encoding: "utf8", timeout: timeoutMs, maxBuffer: 1024 * 1024, shell: false });
  // Do not forward arbitrary stderr, settings, session metadata or credentials.
  if (r.error || r.signal || r.status !== 0) return { ok: false, reason: r.error?.code === "ETIMEDOUT" ? "timeout" : r.error ? "spawn-error" : r.signal ? "signal" : "nonzero-exit" };
  return { ok: true, text: r.stdout.trim() };
}
function jsonCommand(file, args, options) {
  const r = command(file, args, options); if (!r.ok) return r;
  try { const data = JSON.parse(r.text); if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(); return { ok: true, data }; }
  catch { return { ok: false, reason: "invalid-json" }; }
}
const sameDirectory = (a, b) => { try { return realpathSync(a) === realpathSync(b); } catch { return false; } };

/** Explicit diagnostics only. No init/install, tracker mutations, transcripts, network fetch or persistence. */
export function checkProductTooling({ project, agent, probeExternal = false, tools, checkEntire = true, env = process.env, timeoutMs = 5000 } = {}) {
  if (typeof project !== "string" || !path.isAbsolute(project)) fail("project must be an explicit absolute directory");
  project = realpathSync(project); if (marker(project) !== "directory") fail("project must be a directory");
  agentName(agent);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) fail("timeoutMs must be between 1 and 30000");
  const options = { project, env, timeoutMs }, warnings = [];
  const report = { schemaVersion: 1, kind: "product-design-tooling-preflight", project, agent: agent ?? null, readOnly: true, git: { state: "missing", root: null }, beads: { installed: false, state: "unavailable" }, entire: { installed: false, state: "unavailable", integration: "unknown", external: "not-probed", recording: "not-tested" }, warnings };
  const git = executable("git", env), bd = executable("bd", env), entire = checkEntire ? executable("entire", env) : null;
  report.beads.installed = Boolean(bd); report.entire.installed = Boolean(entire);
  const gitRouting = Object.keys(env).filter(k => k.startsWith("GIT_") && k !== "GIT_OPTIONAL_LOCKS");
  if (gitRouting.length) { report.git.state = "association-unknown"; warnings.push("Git routing environment is set; resolve target association before tooling reads or setup."); }
  else if (git) {
    const r = command(git, ["rev-parse", "--show-toplevel"], options);
    if (r.ok) { report.git.root = r.text; report.git.state = sameDirectory(r.text, project) ? "associated" : "different-root"; }
    else report.git.state = "unverified";
  }
  if (report.git.state !== "associated") warnings.push("Target is not a verified Git worktree root; do not choose a parent repository or initialize Git automatically.");
  const beadsMarker = marker(path.join(project, ".beads"));
  if (bd) {
    const routing = Object.keys(env).filter(k => /^(BEADS_|BD_|DOLT_)/.test(k));
    if (routing.length) report.beads.state = "association-unknown";
    else if (beadsMarker === "unsafe" || beadsMarker === "file") report.beads.state = "unsafe-path";
    else if (beadsMarker === "missing") report.beads.state = "not-initialized";
    else if (gitRouting.length) report.beads.state = "association-unknown";
    else {
      const r = jsonCommand(bd, ["--readonly", "context", "--json"], options);
      if (!r.ok) report.beads.state = "unverified";
      else {
        const c = r.data;
        const associated = typeof c.beads_dir === "string" && typeof c.repo_root === "string" && sameDirectory(c.beads_dir, path.join(project, ".beads")) && sameDirectory(c.repo_root, project) && c.is_redirected === false;
        report.beads.state = associated && typeof c.project_id === "string" && c.project_id ? "initialized" : "wrong-project";
        if (report.beads.state === "initialized") report.beads.projectId = c.project_id;
      }
    }
  }
  if (!bd) warnings.push("Beads is unavailable: local design work can continue, but native task history and dependency queries are unavailable. Offer agent-performed installation if useful.");
  else if (report.beads.state !== "initialized") warnings.push("Beads " + report.beads.state + ": offer initialization only for a verified empty target; preserve existing or redirected trackers.");
  const entireMarker = marker(path.join(project, ".entire"));
  const safeEntire = !["unsafe", "file"].includes(entireMarker) && ["settings.json", "settings.local.json"].every(f => ["missing", "file"].includes(marker(path.join(project, ".entire", f))));
  const external = agent ? executable("entire-agent-" + agent, env) : null;
  report.entire.external = external ? "available" : agent ? "not-found" : "not-probed";
  if (entire) {
    if (!safeEntire) report.entire.state = "unsafe-path";
    else if (report.git.state !== "associated") report.entire.state = "association-unknown";
    else {
      const r = jsonCommand(entire, ["status", "--json"], options);
      if (!r.ok) report.entire.state = "unverified";
      else if (r.data.error) report.entire.state = r.data.error === "not set up" && entireMarker === "missing" ? "not-enabled" : "unverified";
      else if (typeof r.data.enabled !== "boolean") report.entire.state = "unverified";
      else {
        report.entire.state = r.data.enabled ? "enabled" : entireMarker === "missing" ? "not-enabled" : "disabled";
        // Agent display names are not guaranteed to be CLI identifiers. Only exact matches count.
        if (agent && Array.isArray(r.data.agents) && r.data.agents.includes(agent)) report.entire.integration = "installed";
        if (typeof r.data.checkpoint_sync_remote === "string") report.entire.syncDestination = r.data.checkpoint_sync_remote;
        report.entire.synchronization = r.data.checkpoint_push_disabled === true ? "disabled" : "not-proven-disabled";
      }
      // Selected, trusted external adapter only; never scan or execute every agent on PATH.
      if (probeExternal && external) {
        const info = jsonCommand(external, ["info"], options);
        if (info.ok && info.data.name === agent && info.data.protocol_version === 1) {
          report.entire.external = "protocol-verified";
          const hooks = jsonCommand(external, ["are-hooks-installed"], options);
          if (hooks.ok && typeof hooks.data.installed === "boolean") report.entire.integration = hooks.data.installed ? "installed" : "not-installed";
          else report.entire.integration = "unknown";
        } else report.entire.external = "unverified";
      }
    }
  }
  if (!checkEntire) report.entire.state = "not-requested";
  if (checkEntire && !entire) warnings.push("Entire is unavailable: captured development provenance is unavailable; specifications and QA remain usable. Offer installation only when provenance is wanted.");
  else if (checkEntire && report.entire.state !== "enabled") warnings.push("Entire " + report.entire.state + ": setup requires separate recording and synchronization consent; never overwrite existing integration.");
  if (entire && agent && report.entire.integration === "unknown") warnings.push("Entire agent integration is not confirmed by diagnostics; an absent built-in listing does not mean an external agent is unsupported. Preserve enabled configuration and user-confirmed setup.");
  if (!agent) warnings.push("Active host is unspecified; executable presence is not host identity. Resolve it from the session or ask before Entire setup.");
  if (tools !== undefined) report.capabilities = inspectProductCapabilities(tools);
  return report;
}

/** Returns a command proposal, never executes it. Consent is explicit and target-bound, not a hook policy or authorization token. */
export function planToolSetup(report, { tool, project, consent, help } = {}) {
  const blocked = reason => ({ status: "blocked", reason });
  if (!report || report.kind !== "product-design-tooling-preflight" || !["beads", "entire"].includes(tool)) return blocked("invalid preflight or tool");
  if (project !== report.project || consent?.project !== report.project) return blocked("consent must name the exact target root");
  if (report.git.state !== "associated") return blocked("verified Git worktree root required; repository creation is separate");
  if (!report[tool].installed) return blocked("tool unavailable; installation requires a separately reviewed platform-specific plan");
  if ((tool === "beads" && report.beads.state === "initialized") || (tool === "entire" && report.entire.state === "enabled")) return { status: "already-configured", commands: [] };
  const required = tool === "beads" ? ["--non-interactive", "--skip-hooks", "--skip-agents"] : ["--agent", "--telemetry", "--no-init-repo"];
  if (typeof help !== "string" || !required.every(f => help.includes(f))) return blocked("installed CLI setup flags must be verified from help");
  if (tool === "beads") {
    if (report.beads.state !== "not-initialized" || consent.beads !== true) return blocked("new empty target and explicit Beads initialization consent required");
    return { status: "planned", cwd: project, command: "bd", args: ["init", "--non-interactive", "--skip-hooks", "--skip-agents"] };
  }
  if (report.entire.state !== "not-enabled") return blocked("existing or ambiguous Entire settings require a separate preservation/repair plan");
  const c = consent.entire;
  if (!report.agent || !c || c.agent !== report.agent || c.recording !== true) return blocked("actual host and explicit session-recording consent required");
  const args = ["enable", "--agent", report.agent, "--telemetry=false", "--no-init-repo"];
  if (c.synchronization === "disabled") {
    if (!help.includes("--skip-push-sessions")) return blocked("installed CLI cannot confirm synchronization-disable flag");
    args.push("--skip-push-sessions");
  } else if (c.synchronization !== "approved-default" || !c.destination) return blocked("synchronization choice and reviewed destination required");
  return { status: "planned", cwd: project, command: "entire", args, expectedSyncDestination: c.synchronization === "approved-default" ? c.destination : null };
}

/** Native exact issue reads, including closed issues; never exports/parses the Dolt database. */
export function readBeadsIssues({ project, ids, env = process.env, timeoutMs = 5000 } = {}) {
  const preflight = checkProductTooling({ project, env, timeoutMs, checkEntire: false });
  if (!Array.isArray(ids) || ids.length > 20 || new Set(ids).size !== ids.length || ids.some(id => typeof id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(id))) fail("bounded explicit Beads issue IDs required");
  const diagnostics = [], issues = [];
  if (preflight.beads.state !== "initialized") return { issues, diagnostics: [{ tool: "beads", status: "unavailable", reason: preflight.beads.state }] };
  const file = executable("bd", env), options = { project: preflight.project, env, timeoutMs };
  for (const id of ids) {
    const r = command(file, ["--readonly", "show", id, "--json", "--include-comments"], options);
    let data; try { data = r.ok ? JSON.parse(r.text) : null; } catch { /* invalid response */ }
    const matches = Array.isArray(data) ? data.filter(x => x?.id === id) : data?.id === id ? [data] : [];
    if (matches.length !== 1) diagnostics.push({ tool: "beads", issueId: id, status: "unavailable", reason: r.reason ?? "missing-or-invalid-issue" });
    else issues.push(matches[0]);
  }
  return { issues, diagnostics, projectId: preflight.beads.projectId };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { project: { type: "string" }, agent: { type: "string" }, "probe-external": { type: "boolean" }, tools: { type: "string" }, help: { type: "boolean" } } });
    if (values.help) console.log("check-product-tooling --project /absolute/target [--agent goose] [--probe-external] [--tools current-tools.json]\nRead-only diagnostics; --probe-external executes the selected trusted adapter's info/are-hooks-installed protocol. No setup or persistence.");
    else console.log(JSON.stringify(checkProductTooling({ project: values.project, agent: values.agent, probeExternal: values["probe-external"], tools: values.tools ? JSON.parse(productFile(values.project, values.tools).bytes.toString("utf8")) : undefined }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
