#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const ok = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const ideate = read("skills/ideate/SKILL.md");
const index = read("skills/index/SKILL.md");
const build = read("skills/image-to-code/SKILL.md");
const qa = read("skills/design-qa/SKILL.md");
const gates = read("references/product-decision-gates.md");
const main = read("templates/prototype/src/main.jsx");
const vite = read("templates/prototype/vite.config.mjs");

ok(ideate.includes("three independent Image Gen calls sequentially"), "ideate must generate journey boards sequentially");
ok(ideate.includes("complete candidate journey"), "ideate must use complete journeys");
ok(ideate.includes("Never generate image 1 as entry"), "ideate must prohibit one-step-per-image");
ok(ideate.includes("screen-set-approved"), "ideate must require screen-set approval");
ok(ideate.includes("1024 x 1024"), "ideate must use supported square default");
ok(ideate.includes("absolute filesystem paths"), "ideate must embed visible artifacts by absolute path");
ok(!/1280 x 1024.*default|1536 x 1024.*default/.test(ideate), "ideate contains unsupported legacy default");
ok(index.includes("never use the three images for three different steps"), "router must enforce complete boards");
ok(index.includes("Never interpret journey selection as permission to build"), "router must block premature build");
ok(build.includes("journey board alone is not sufficient"), "image-to-code must reject board-only input");
ok(build.includes("every required screen"), "image-to-code must resolve complete screen set");
ok(qa.includes("each implemented state"), "design QA must compare each screen source");
ok(gates.includes("Three images showing three separate steps fail this gate"), "G2 must fail separate-step outputs");
ok(gates.includes("A journey board alone cannot pass G3"), "G3 must require detailed screens");
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
for (const file of evalFiles) {
  const document = JSON.parse(readFileSync(file, "utf8"));
  ok(Array.isArray(document.evals) && document.evals.length >= 3, `${file} needs at least 3 evals`);
  for (const item of document.evals ?? []) {
    evalCases += 1;
    ok(item.id !== undefined && item.name && item.prompt && (item.expected_output || item.expected_sequence), `${file} has an incomplete eval`);
  }
}

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ status: "passed", contractChecks: 16, evalFiles: evalFiles.length, evalCases }, null, 2));
