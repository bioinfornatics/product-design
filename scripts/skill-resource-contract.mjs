import { readFileSync, readdirSync, lstatSync, realpathSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { sha256 } from "./workflow-evidence-contract.mjs";

const fail = message => { throw new Error(message); };
const markdownLinks = content => [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1].trim().split("#")[0]).filter(p => p && !/^(?:https?:|mailto:|#)/i.test(p));
const declaredPaths = content => [...content.matchAll(/\bPLUGIN_ROOT\/((?:references|scripts|templates|assets)\/[A-Za-z0-9_.\/-]+)/g)].map(m => m[1]).filter(p => !p.includes("...") && !p.endsWith("/"));
function contained(root, value) {
  const file = path.resolve(root, value), rel = path.relative(root, file);
  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) fail("resource escapes bundle: " + value);
  const real = realpathSync(file), realRel = path.relative(root, real);
  if (realRel === ".." || realRel.startsWith(".." + path.sep) || path.isAbsolute(realRel)) fail("resource symlink escapes bundle: " + value);
  if (!lstatSync(real).isFile()) fail("resource must be regular file: " + value);
  return file;
}
export function inspectSkillResources(project, name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) fail("invalid Skill directory name");
  const root = realpathSync(project), directory = path.join(root, "skills", name), documents = new Map(), resources = new Map(), skills = new Set(readdirSync(path.join(root, "skills")).filter(n => { try { return lstatSync(path.join(root, "skills", n, "SKILL.md")).isFile(); } catch { return false; } }));
  const seen = new Set();
  function visit(file, localOnly = false) {
    file = contained(root, file); if (seen.has(file)) return; seen.add(file);
    const source = path.relative(root, file).split(path.sep).join("/"), bytes = readFileSync(file), content = bytes.toString("utf8");
    resources.set(source, { path: source, sha256: sha256(bytes) });
    if (!file.endsWith(".md")) return;
    documents.set(source, content);
    for (const target of markdownLinks(content)) {
      if (/SKILL\.md$/i.test(target)) fail("cross-Skill files must use load skills product-design:<name>, not SKILL.md links: " + source);
      if (path.isAbsolute(target)) fail("absolute resource link: " + source);
      const next = contained(root, path.resolve(path.dirname(file), target));
      if (localOnly && !next.startsWith(directory + path.sep)) fail("Skill Markdown link must be local; shared paths use PLUGIN_ROOT: " + source);
      visit(next, next.startsWith(directory + path.sep));
    }
    for (const target of declaredPaths(content)) visit(contained(root, target));
    for (const match of content.matchAll(/\bload skills product-design:([a-z][a-z-]*)\b/g)) if (!skills.has(match[1])) fail("unknown load instruction: " + match[0]);
    // Inline shared reference names (e.g. product-discovery-questions.md) are also dependencies.
    for (const match of content.matchAll(/`((?:\.\.?\/)?[A-Za-z0-9_.\/-]+\.md)(?:#[A-Za-z0-9-]+)?`/g)) {
      const target = match[1];
      if (target === "SKILL.md" || target.startsWith(".gates/") || target === "AGENTS.md" || target === "design-qa.md" || target.endsWith("user-context.md")) continue;
      if (/SKILL\.md$/.test(target)) fail("inline sibling Skill path is not loading: " + source);
      // Relative instructions in a canonical shared reference refer to that reference's directory.
      if (source.startsWith("references/") && !target.startsWith("PLUGIN_ROOT/")) visit(contained(root, path.resolve(path.dirname(file), target)));
    }
  }
  const entry = contained(root, path.join(directory, "SKILL.md"));
  const content = readFileSync(entry, "utf8");
  if (!content.includes("load skills product-design:{name}")) fail("Skill must declare exact runtime loading instruction: " + name);
  if (/\b(?:load|Load)\s+`product-design:/u.test(content)) fail("legacy load syntax: " + name);
  visit(entry, true);
  return { name, resources: [...resources.values()].sort((a, b) => a.path.localeCompare(b.path)), documents };
}

/** Generate contained shared-reference projection in a temporary package, never the source tree.
 * Root references are canonical. A complete plugin is required for scripts/templates and peer loading.
 */
export function projectSkillResources(sourceRoot, stageRoot) {
  sourceRoot = realpathSync(sourceRoot); stageRoot = realpathSync(stageRoot);
  if (stageRoot === sourceRoot || stageRoot.startsWith(sourceRoot + path.sep) || sourceRoot.startsWith(stageRoot + path.sep)) fail("projection must use an isolated stage outside source");
  const manifest = { schemaVersion: 1, kind: "contained-shared-resource-projection", standalone: false, skills: [] };
  for (const name of readdirSync(path.join(sourceRoot, "skills")).sort()) {
    const skillMd = path.join(sourceRoot, "skills", name, "SKILL.md");
    try { if (!lstatSync(skillMd).isFile()) continue; } catch { continue; }
    try { lstatSync(path.join(sourceRoot, "skills", name, "references/shared")); fail("references/shared is reserved for isolated packaging projection"); } catch (error) { if (error.code !== "ENOENT") throw error; }
    const inspected = inspectSkillResources(sourceRoot, name), stageSkill = path.join(stageRoot, "skills", name), mappings = [];
    const shared = inspected.resources.filter(r => r.path.startsWith("references/"));
    const sharedMap = new Map(shared.map(r => [r.path, "references/shared/" + r.path.slice("references/".length)]));
    function rewrite(content, origin) {
      let result = content;
      for (const [source, target] of sharedMap) result = result.split("PLUGIN_ROOT/" + source).join(origin === "entry" ? target : path.basename(target));
      if (origin !== "entry") {
        // Keep the single direct loading level: the entry lists all policy dependencies.
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, label, target) => {
          if (/^(?:https?:|mailto:|#)/i.test(target)) return all;
          return label + " (read " + String.fromCharCode(96) + target + String.fromCharCode(96) + " when this policy applies)";
        });
      }
      return result;
    }
    for (const resource of shared) {
      const target = sharedMap.get(resource.path), content = rewrite(readFileSync(path.join(sourceRoot, resource.path), "utf8"), "shared"), destination = path.join(stageSkill, target);
      let parent = stageRoot;
      for (const name of path.relative(stageRoot, path.dirname(destination)).split(path.sep)) { parent = path.join(parent, name); try { const st = lstatSync(parent); if (!st.isDirectory() || st.isSymbolicLink()) fail("unsafe projection directory"); } catch (error) { if (error.code !== "ENOENT") throw error; mkdirSync(parent); } }
      try { if (lstatSync(destination).isSymbolicLink()) fail("unsafe projection target"); } catch(error) { if(error.code !== "ENOENT") throw error; }
      writeFileSync(destination, content);
      mappings.push({ source: resource.path, sourceSha256: resource.sha256, target, targetSha256: sha256(content) });
    }
    let entry = rewrite(readFileSync(skillMd, "utf8"), "entry");
    entry += "\n## Contained shared policy files\n\nPackaging projection from canonical plugin policies; load only those required by the current phase or selected policy. Do not edit these derived files. Peer Skills and runtime assets still require the complete plugin.\n\n" + shared.map(r => "- [" + path.basename(r.path, ".md") + "](" + sharedMap.get(r.path) + ")").join("\n") + "\n";
    writeFileSync(path.join(stageSkill, "SKILL.md"), entry);
    manifest.skills.push({ name, entrySourceSha256: sha256(readFileSync(skillMd)), entryTargetSha256: sha256(entry), resources: mappings });
  }
  writeFileSync(path.join(stageRoot, "skill-resources.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function verifySkillProjection(sourceRoot, stageRoot, manifest) {
  sourceRoot = realpathSync(sourceRoot); stageRoot = realpathSync(stageRoot);
  if (manifest?.schemaVersion !== 1 || manifest.kind !== "contained-shared-resource-projection" || manifest.standalone !== false) fail("invalid projection manifest");
  const expectedNames = readdirSync(path.join(sourceRoot, "skills")).sort();
  if (JSON.stringify(manifest.skills.map(s => s.name)) !== JSON.stringify(expectedNames)) fail("projection Skill coverage drift");
  for (const skill of manifest.skills) {
    const inspected = inspectSkillResources(sourceRoot, skill.name);
    if (sha256(readFileSync(contained(sourceRoot, "skills/" + skill.name + "/SKILL.md"))) !== skill.entrySourceSha256 || sha256(readFileSync(contained(stageRoot, "skills/" + skill.name + "/SKILL.md"))) !== skill.entryTargetSha256) fail("projection entry drift");
    const expected = inspected.resources.filter(r => r.path.startsWith("references/"));
    if (JSON.stringify(expected.map(r => r.path)) !== JSON.stringify(skill.resources.map(r => r.source))) fail("projection resource coverage drift");
    for (const r of skill.resources) {
      if (r.target !== "references/shared/" + r.source.slice("references/".length)) fail("projection target identity drift");
      if (sha256(readFileSync(contained(sourceRoot, r.source))) !== r.sourceSha256 || sha256(readFileSync(contained(stageRoot, "skills/" + skill.name + "/" + r.target))) !== r.targetSha256) fail("projection resource drift");
    }
  }
  return true;
}
