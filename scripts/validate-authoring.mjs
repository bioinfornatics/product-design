#!/usr/bin/env node
import { cpSync, mkdtempSync, readdirSync, rmSync, readFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";
import { resolveAgentPluginsScript } from "./resolve-agent-plugins.mjs";
import { inspectSkillResources, projectSkillResources, verifySkillProjection } from "./skill-resource-contract.mjs";

export function validateAuthoring(root) {
  const audit = resolveAgentPluginsScript("skill-creator", "audit_skill.js"), design = resolveAgentPluginsScript("skill-creator", "design_evals.js");
  const temporary = mkdtempSync(path.join(tmpdir(), "product-design-authoring-")), stage = path.join(temporary, "product-design"), reports = [];
  try {
    for (const entry of ["skills", "references"]) cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true, filter: p => !p.includes("node_modules") });
    const projection = projectSkillResources(root, stage);
    verifySkillProjection(root, stage, projection);
    function check(script, args, label) {
      const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
      if (result.error) throw result.error;
      if (result.signal) throw new Error(label + " terminated: " + result.signal);
      let report;
      try { report = JSON.parse(result.stdout); } catch { throw new Error(label + " invalid validator output: " + result.stderr); }
      reports.push({ label, ...report.summary });
      if (result.status !== 0 || report.summary?.errors || report.summary?.warnings) throw new Error(label + ": " + JSON.stringify(report.findings));
    }
    for (const name of readdirSync(path.join(root, "skills")).sort()) {
      inspectSkillResources(root, name);
      check(audit, [path.join(root, "skills", name)], name + " source audit");
      check(audit, [path.join(stage, "skills", name)], name + " packaged audit");
      const evals = path.join(root, "skills", name, "evals", "evals.json");
      // Every shipped Skill needs at least three scenarios; no silently skipped case set.
      const doc = JSON.parse(readFileSync(evals));
      if (!Array.isArray(doc.evals) || doc.evals.length < 3) throw new Error(name + " requires at least three authoring scenarios");
      check(design, [evals, "--skill-path", path.join(root, "skills", name)], name + " evaluation design");
    }
    check(design, [path.join(root, "tests/evals/plugin-integration.json")], "plugin integration design");
    return { status: "passed", skills: projection.skills.length, scenarioSets: reports.filter(r => r.scenarios).length, scenarios: reports.reduce((sum, r) => sum + (r.scenarios ?? 0), 0), errors: 0, warnings: 0, reports };
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { root: { type: "string" } } });
    const result = validateAuthoring(values.root ? path.resolve(values.root) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
