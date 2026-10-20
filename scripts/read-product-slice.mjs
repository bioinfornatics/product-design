#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sha256, validateExperienceBlueprint } from "./workflow-evidence-contract.mjs";
import { productRoot, productFile } from "./product-local-files.mjs";
import { readBeadsIssues } from "./check-product-tooling.mjs";
import { sourceImpact, validateSourcePlan } from "./source-artifacts.mjs";
import { readProductInformation } from "./read-product-information.mjs";
import { productReference as reference, productNodeId as nodeId, productIdentityPart } from "./product-reference-identity.mjs";

const fail = message => { throw new Error(message); };
const kinds = new Set(["affects", "explained-by", "verified-by"]);
const label = object => object.detail ?? object.prompt ?? object.criterion ?? object.question ?? object.purpose ?? object.responsibility ?? object.id ?? "document";
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const textId = value => typeof value === "string" && !!value.trim();
const isBlueprint = b => object(b) && ["decisions", "screenStates", "questions"].some(k => Object.hasOwn(b, k));
const isContract = b => object(b) && object(b.product) && Array.isArray(b.personas) && Array.isArray(b.scenarios);
// This is a supported-field inventory, not an assertion of whole-product coverage.
const relationFamilies = [
  { owner: "blueprint", status: "supported", fields: ["questions.inputIds", "questions.decisionIds", "screenStates.decisionIds", "screenStates.scenarioId", "verifications.screenStateIds", "intents.personaId", "intents.scenarioId"] },
  { owner: "source-plan", status: "supported", fields: ["specificationSources.path", "screens.links.specificationIds", "screens.links.scenarioIds", "screens.links.decisionIds", "screens.links.screenStateIds", "screens.links.verificationIds"] },
  { owner: "result/receipt", status: "supported", fields: ["dependencies.path"] },
  { owner: "native-task", status: "supported", fields: ["metadata.product-design.references"] },
  { owner: "blueprint", status: "unsupported", fields: ["userValues", "deferredPersonas", "traceability", "proactivity", "artifacts", "verifications.scenarioId"] },
  { owner: "design-contract", status: "unsupported", fields: ["scenarios.personaId", "components", "ui"] },
  { owner: "other", status: "unsupported", fields: ["source-plan.context (ownership and whole-file impact only)", "source-plan.screens.nextScreen", "undeclared relations", "other document relation families"] },
];
function dependencyPath(project, value) {
  if (typeof value !== "string" || !value) fail("unsupported dependency identity");
  if (!path.isAbsolute(value)) return value; // Other-platform absolute paths fail productFile.
  const relative = path.relative(project, value);
  if (!relative || relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) fail("dependency outside explicit product root");
  return relative.split(path.sep).join("/");
}
export function validateProductReferences({ project, references } = {}) {
  project = productRoot(project); if (!Array.isArray(references) || references.length > 100) fail("explicit bounded references array required");
  return references.map(ref => {
    try {
      reference(ref);
      const page = readProductInformation({ project, reference: ref, mode: "excerpt" });
      if (page.status !== "resolved") fail(page.reason);
      const { text: excerpt, ...content } = page;
      const entity = ref.entity && page.paging.complete ? JSON.parse(excerpt) : null;
      return { reference: ref, status: "resolved", id: nodeId(ref), sha256: page.sha256, entity, excerpt, content };
    } catch (error) { return { reference: ref, status: "unresolved", reason: error.code === "ENOENT" ? "file missing" : error.message }; }
  });
}

/** Derived, bounded, explicit document slice. No automatic scan, task writes, inference or approval. */
export function readProductSlice({ project, documents = [], seeds = [], direction = "both", limits = {}, tasks = [], env = process.env } = {}) {
  project = productRoot(project);
  const maxDepth = limits.maxDepth ?? 3, maxNodes = limits.maxNodes ?? 100, maxContentChars = limits.maxContentChars ?? 12000, nodeChars = limits.nodeChars ?? 2000;
  if (!Array.isArray(documents) || new Set(documents).size !== documents.length || documents.length > 20 || !Array.isArray(tasks) || tasks.length > 20 || !Array.isArray(seeds) || !seeds.length || !["up", "down", "both"].includes(direction) || !Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 10 || !Number.isInteger(maxNodes) || maxNodes < 1 || maxNodes > 1000 || !Number.isInteger(maxContentChars) || maxContentChars < 2000 || maxContentChars > 64000 || !Number.isInteger(nodeChars) || nodeChars < 1 || nodeChars > 8000) fail("explicit bounded documents/seeds/direction/limits required");
  const nodes = new Map(), edges = [], files = new Map(), resolvedHashes = new Map(), diagnostics = [], rejectedPaths = new Set(), ownerFiles = new Map();
  const add = (ref, data = {}, authority = "specification") => { ref = reference(ref); const id = nodeId(ref); if (!nodes.has(id)) nodes.set(id, { id, reference: ref, authority, label: String(label(data)), evidenceLevel: data.evidenceLabel ?? data.evidenceLevel ?? data.disposition ?? null, data }); return id; };
  const edge = (from, to, type, provenance) => { if (!edges.some(e => e.from === from && e.to === to && e.type === type)) edges.push({ from, to, type, provenance, status: "declared" }); };
  const invalid = (file, field, reason, status = "invalid-member") => diagnostics.push({ path: file, field, status, reason });
  for (const relative of documents) {
    try {
      const file = productFile(project, relative), content = file.bytes.toString("utf8"), json = relative.endsWith(".json"), data = json ? JSON.parse(content) : null;
      // Keep owner presence even if duplicate entities later reject the document.
      // Dropping that owner must not make a competing same-name owner unambiguous.
      ownerFiles.set(relative, { path: relative, data });
      files.set(relative, { ...file, content, data }); add({ path: relative }, object(data) ? data : { detail: relative }, typeof data?.kind === "string" && (data.kind.includes("result") || data.kind.includes("qa")) ? "evidence" : "specification");
      if (json && !object(data)) invalid(relative, null, "JSON object required for relation extraction", "unsupported-document-shape");
      if (object(data)) for (const [collection, values] of Object.entries(data)) if (Array.isArray(values)) {
        if (!textId(collection)) { invalid(relative, collection, "nonempty collection name required"); continue; }
        const ids = new Set();
        for (const value of values) {
          if (!object(value) || !textId(value.id)) {
            // Anonymous records/scalars can be valid owner fields, but are not graph entities.
            const entityCollection = (isBlueprint(data) && ["inputs", "questions", "decisions", "screenStates", "verifications", "intents", "artifacts"].includes(collection)) || (isContract(data) && ["personas", "scenarios", "components"].includes(collection)) || (data.kind === "product-design-source-plan" && ["specificationSources", "screens"].includes(collection));
            invalid(relative, collection, "member has no supported nonempty entity ID; not extracted", entityCollection ? "invalid-member" : "unsupported-member"); continue;
          }
          if (ids.has(value.id)) fail("duplicate entity ID in " + collection); ids.add(value.id);
          add({ path: relative, entity: { collection, id: value.id } }, value);
        }
      }
    } catch (error) { files.delete(relative); rejectedPaths.add(relative); for (const [id, node] of nodes) if (node.reference?.path === relative) nodes.delete(id); diagnostics.push({ path: relative, status: "unresolved", reason: error.message }); }
  }
  const members = (f, field) => {
    const values = f.data[field]; if (values === undefined) return [];
    if (!Array.isArray(values)) { invalid(f.path, field, "array required"); return []; }
    return values.filter(v => object(v) && textId(v.id));
  };
  const links = (f, member, field, at) => {
    const ids = member[field]; if (ids === undefined) return [];
    if (!Array.isArray(ids) || ids.some(id => !textId(id)) || new Set(ids).size !== ids.length) { invalid(f.path, at, "unique nonempty ID array required"); return []; }
    return ids;
  };
  const resolveEntity = (collection, id, candidates) => {
    const matches = textId(id) ? candidates.filter(f => Array.isArray(f.data?.[collection]) && f.data[collection].some(v => object(v) && v.id === id)) : [];
    if (matches.length !== 1) { diagnostics.push({ collection, id, status: "unresolved", reason: "entity file missing or ambiguous" }); return null; }
    return nodeId({ path: matches[0].path, entity: { collection, id } });
  };
  const contracts = [...ownerFiles.values()].filter(f => isContract(f.data));
  const blueprints = [...ownerFiles.values()].filter(f => isBlueprint(f.data));
  for (const f of files.values()) {
    const b = f.data; if (!object(b)) continue;
    const own = (c, id) => textId(id) ? nodeId({ path: f.path, entity: { collection: c, id } }) : null;
    const connect = (from, to, type, field) => { if (from && to && nodes.has(from) && nodes.has(to)) edge(from, to, type, { path: f.path, field }); else invalid(f.path, field, "broken declared edge", "unresolved"); };
    if (isBlueprint(b)) {
      if (contracts.length === 1) { try { validateExperienceBlueprint(b, contracts[0].data); } catch (error) { diagnostics.push({ path: f.path, status: "invalid-blueprint", reason: error.message }); } }
      else diagnostics.push({ path: f.path, status: "not-validated", reason: "one explicit design contract required for structural validation; missing or ambiguous owner" });
      const contractEntity = (collection, id) => resolveEntity(collection, id, contracts.length === 1 ? contracts : []);
      for (const q of members(f, "questions")) {
        for (const id of links(f, q, "inputIds", "questions.inputIds")) connect(own("inputs", id), own("questions", q.id), "informs", "questions.inputIds");
        for (const id of links(f, q, "decisionIds", "questions.decisionIds")) connect(own("questions", q.id), own("decisions", id), "informs", "questions.decisionIds");
      }
      for (const s of members(f, "screenStates")) {
        for (const id of links(f, s, "decisionIds", "screenStates.decisionIds")) connect(own("decisions", id), own("screenStates", s.id), "implemented-in", "screenStates.decisionIds");
        connect(contractEntity("scenarios", s.scenarioId), own("screenStates", s.id), "contains-state", "screenStates.scenarioId");
      }
      for (const v of members(f, "verifications")) for (const id of links(f, v, "screenStateIds", "verifications.screenStateIds")) connect(own("screenStates", id), own("verifications", v.id), "criterion-for", "verifications.screenStateIds");
      for (const intent of members(f, "intents")) {
        connect(contractEntity("scenarios", intent.scenarioId), own("intents", intent.id), "intent-in-scenario", "intents.scenarioId");
        connect(contractEntity("personas", intent.personaId), own("intents", intent.id), "intent-for-persona", "intents.personaId");
      }
    }
    if (b.kind === "product-design-source-plan") {
      let impact; try { validateSourcePlan(b); impact = sourceImpact(b, { project }); } catch (error) { diagnostics.push({ path: f.path, type: "source-impact", status: "unresolved", reason: error.message }); continue; }
      diagnostics.push({ path: f.path, type: "source-impact", ...impact });
      for (const spec of b.specificationSources) {
        try { const source = productFile(project, spec.path); resolvedHashes.set(nodeId({ path: source.path }), sha256(source.bytes)); connect(add({ path: source.path }, { detail: source.path }), own("specificationSources", spec.id), "specification-file-for", "specificationSources.path"); }
        catch (error) { invalid(f.path, "specificationSources.path", error.message, "unresolved"); }
      }
      for (const screen of b.screens) {
        for (const id of screen.links.specificationIds) connect(own("specificationSources", id), own("screens", screen.id), "source-for", "screens.links.specificationIds");
        for (const [field, collection] of [["decisionIds", "decisions"], ["screenStateIds", "screenStates"], ["verificationIds", "verifications"], ["scenarioIds", "scenarios"]]) {
          // Involved plans declare exact owners. Do not join a different file with the same ID.
          const candidates = collection === "scenarios" ? contracts : blueprints;
          const ownerPath = b.involved ? b.context[collection === "scenarios" ? "designContract" : "blueprint"].path : null;
          for (const id of screen.links[field]) connect(resolveEntity(collection, id, ownerPath ? candidates.filter(c => c.path === ownerPath) : candidates), own("screens", screen.id), "source-for", "screens.links." + field);
        }
      }
    }
    if (Object.hasOwn(b, "dependencies")) {
      const changes = [], unresolved = [];
      if (!Array.isArray(b.dependencies)) unresolved.push({ path: null, reason: "dependencies array required" });
      else for (const dep of b.dependencies) {
        try {
          if (!object(dep) || typeof dep.path !== "string" || typeof dep.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(dep.sha256)) fail("unsupported dependency identity");
          const relative = dependencyPath(project, dep.path), file = productFile(project, relative), actual = sha256(file.bytes);
          if (actual !== dep.sha256) changes.push({ path: relative, expectedSha256: dep.sha256, actualSha256: actual });
          const from = add({ path: relative }, { detail: relative }); resolvedHashes.set(from, actual); edge(from, nodeId({ path: f.path }), "dependency-of", { path: f.path, field: "dependencies" });
        } catch (error) { unresolved.push({ path: dep?.path ?? null, status: "unresolved", reason: error.code === "ENOENT" ? "dependency file missing" : error.message }); }
      }
      diagnostics.push({ path: f.path, type: "dependency-freshness", status: changes.length ? "stale" : unresolved.length ? "unknown" : b.dependencies.length ? "current" : "not-inspected", changes, unresolved, claim: "Dependency byte identity only, not approval or test validity." });
    }
  }
  if (tasks.length) {
    const result = readBeadsIssues({ project, ids: tasks, env }); diagnostics.push(...result.diagnostics);
    for (const task of result.issues) {
      const id = ".beads/issue/" + productIdentityPart(task.id); nodes.set(id, { id, authority: "beads", label: task.title, evidenceLevel: null, data: task });
      const refs = task.metadata?.["product-design"];
      if (refs && (refs.schemaVersion !== 1 || !Array.isArray(refs.references))) { diagnostics.push({ taskId: task.id, status: "invalid-reference-metadata" }); continue; }
      for (const ref of refs?.references ?? []) {
        try {
          if (rejectedPaths.has(ref?.path)) fail("reference targets rejected document");
          if (!kinds.has(ref.relation)) fail("explicit relation required");
          if (ref.relation === "verified-by" && (ref.anchor || ref.entity)) fail("verified-by must target an executed result document, not a proposed criterion/entity");
          const resolved = validateProductReferences({ project, references: [ref] })[0];
          if (resolved.status !== "resolved") { diagnostics.push({ taskId: task.id, ...resolved }); continue; }
          resolvedHashes.set(nodeId(ref), resolved.sha256);
          const target = add(ref, resolved.entity ?? { detail: ref.anchor ?? ref.path, excerpt: resolved.excerpt }, ref.relation === "verified-by" ? "evidence" : "specification");
          edge(id, target, ref.relation, { trackerProjectId: result.projectId, issueId: task.id, field: "metadata.product-design.references", targetSha256: resolved.sha256 });
          if (ref.relation === "verified-by") diagnostics.push({ taskId: task.id, path: ref.path, status: "execution-claim-not-validated", reason: "Reference resolution is not executed-result validation; run the owning QA/result validator." });
          if (ref.relation === "verified-by" && !files.has(ref.path)) diagnostics.push({ taskId: task.id, path: ref.path, status: "freshness-not-inspected", reason: "Add executed result to explicit documents; resolving a link is not evidence freshness." });
        } catch (error) { diagnostics.push({ taskId: task.id, status: "unresolved", reason: error.message }); }
      }
    }
  }
  for (const raw of seeds.filter(s => typeof s !== "string")) {
    const seed = reference(raw);
    if (rejectedPaths.has(seed.path)) fail("seed does not resolve: rejected document " + seed.path);
    if (!nodes.has(nodeId(seed))) {
      const resolved = validateProductReferences({ project, references: [seed] })[0];
      if (resolved.status === "resolved") { resolvedHashes.set(nodeId(seed), resolved.sha256); add(seed, resolved.entity ?? { detail: seed.anchor ?? seed.path, excerpt: resolved.excerpt }); } else diagnostics.push(resolved);
    }
  }
  // Never parse a guessed legacy path#collection/id. It may actually be a filename.
  const legacyIds = new Map();
  for (const n of nodes.values()) {
    const r = n.reference, legacy = r ? r.path + (r.entity ? "#" + r.entity.collection + "/" + r.entity.id : r.anchor ? "#anchor/" + r.anchor : "") : ".beads/issue/" + n.data.id;
    if (!legacyIds.has(legacy)) legacyIds.set(legacy, new Set()); legacyIds.get(legacy).add(n.id);
  }
  const seedIds = seeds.map(seed => {
    if (typeof seed !== "string") return nodeId(reference(seed));
    if (seed.startsWith("ref:")) return seed.slice(4);
    const legacy = legacyIds.get(seed);
    if (legacy && (legacy.size > 1 || [...legacy].some(id => id !== seed))) fail("ambiguous or unescaped legacy seed; use object reference or ref:<encoded node ID>: " + seed);
    return seed;
  });
  for (const id of seedIds) if (!nodes.has(id)) fail("seed does not resolve: " + id);
  const selected = new Set(), queue = seedIds.map(id => ({ id, depth: 0 })); let truncated = false;
  while (queue.length) {
    const { id, depth } = queue.shift(); if (selected.has(id)) continue;
    if (selected.size === maxNodes) { truncated = true; break; } selected.add(id);
    const neighbors = edges.flatMap(e => direction === "up" ? e.to === id ? [e.from] : [] : direction === "down" ? e.from === id ? [e.to] : [] : e.from === id ? [e.to] : e.to === id ? [e.from] : []);
    if (depth === maxDepth) { if (neighbors.some(n => !selected.has(n))) truncated = true; continue; }
    queue.push(...neighbors.filter(n => !selected.has(n)).map(id => ({ id, depth: depth + 1 })));
  }
  // Raw parsed values are internal traversal inputs, not model context. Project only selected nodes.
  let usedContentChars = 0, boundedNodesCount = 0;
  const boundedNodes = [...selected].map(id => {
    const node = nodes.get(id), base = { id: node.id, ...(node.reference ? { reference: node.reference } : {}), authority: node.authority, label: Array.from(node.label).slice(0, 180).join(""), labelTruncated: Array.from(node.label).length > 180, evidenceLevel: node.evidenceLevel };
    // Reserve an empty object per remaining node. Budget excludes navigation/provenance metadata.
    const available = maxContentChars - usedContentChars - 2 * (selected.size - ++boundedNodesCount);
    if (node.authority === "beads") {
      let data = { id: node.data.id, status: node.data.status ?? null };
      if (Array.from(JSON.stringify(data)).length > available) data = {};
      usedContentChars += Array.from(JSON.stringify(data)).length;
      diagnostics.push({ nodeId: id, type: "content-coverage", status: "link-only", reason: "Task details remain native; use readBeadsIssues for exact IDs on demand." });
      return { ...base, data, content: { status: "link-only", retrieval: { tool: "readBeadsIssues", ids: [node.data.id] } } };
    }
    const maxChars = Math.min(nodeChars, available - 14);
    if (maxChars < 1 || !node.reference) {
      usedContentChars += 2; diagnostics.push({ nodeId: id, type: "content-coverage", status: "link-only", reason: "Content budget exhausted; follow the exact reference on demand." });
      return { ...base, data: {}, content: { status: "link-only", reference: node.reference, reason: "content budget exhausted" } };
    }
    const mode = !node.reference.entity && !node.reference.anchor && node.reference.path.endsWith(".json") ? "overview" : "excerpt";
    let page = readProductInformation({ project, reference: node.reference, mode, maxChars });
    const observedFile = files.get(node.reference.path), expectedHash = observedFile ? sha256(observedFile.bytes) : resolvedHashes.get(id);
    if (page.status !== "resolved" || (expectedHash && page.sha256 !== expectedHash)) {
      usedContentChars += 2; diagnostics.push({ nodeId: id, type: "content-coverage", status: page.status === "resolved" ? "stale" : page.status, reason: page.reason ?? "source changed during slice retrieval" });
      return { ...base, data: {}, content: { status: page.status === "resolved" ? "stale" : page.status, reference: node.reference, reason: page.reason ?? "source changed during slice retrieval" } };
    }
    let data = node.reference.entity && page.paging.complete ? JSON.parse(page.text) : { excerpt: page.text };
    if (Array.from(JSON.stringify(data)).length > available) {
      // Fit serialized payload, not just raw characters; escape-heavy text can expand sixfold.
      const points = Array.from(page.text); let low = 0, high = points.length;
      while (low < high) { const mid = Math.ceil((low + high) / 2); if (Array.from(JSON.stringify({ excerpt: points.slice(0, mid).join("") })).length <= available) low = mid; else high = mid - 1; }
      if (!low) {
        usedContentChars += 2; diagnostics.push({ nodeId: id, type: "content-coverage", status: "link-only", reason: "Content budget exhausted; follow the exact reference on demand." });
        return { ...base, data: {}, content: { status: "link-only", reference: node.reference, reason: "content budget exhausted" } };
      }
      const priorHash = page.sha256; page = readProductInformation({ project, reference: node.reference, mode, maxChars: low });
      if (page.status !== "resolved" || page.sha256 !== priorHash) {
        usedContentChars += 2; diagnostics.push({ nodeId: id, type: "content-coverage", status: "stale", reason: "source changed while fitting content budget" });
        return { ...base, data: {}, content: { status: "stale", reference: node.reference } };
      }
      data = { excerpt: page.text };
    }
    const { text, ...content } = page;
    usedContentChars += Array.from(JSON.stringify(data)).length;
    diagnostics.push({ nodeId: id, type: "content-coverage", status: page.paging.partial ? "partial" : mode === "overview" ? "navigation-only" : "complete", selectedScope: page.selection.kind, claim: "Selected text coverage only; no global graph or evidence validity claim." });
    return { ...base, data, content };
  });
  const graphCoverage = { status: "partial", scope: "explicit documents and declared supported fields only", families: relationFamilies, traversalTruncated: truncated, claim: "Traversal bounds and selected content completeness are separate; absent edges do not prove no impact. Unsaved or unlinked rationale cannot be recovered." };
  diagnostics.push({ type: "relation-coverage", status: "partial", reason: graphCoverage.claim, unsupportedFamilies: relationFamilies.filter(f => f.status === "unsupported") });
  return { schemaVersion: 1, kind: "product-design-derived-slice", identityEncoding: "product-reference-v1", graphCoverage, project, seeds: seedIds, direction, limits: { maxDepth, maxNodes, maxContentChars, nodeChars }, truncated, contentBudget: { limit: maxContentChars, used: usedContentChars, unit: "serialized-node-data-code-points", excludes: "node identities, labels, cursors, diagnostics and edges" }, nodes: boundedNodes, edges: edges.filter(e => selected.has(e.from) && selected.has(e.to)), documents: [...files.values()].map(f => ({ path: f.path, sha256: sha256(f.bytes) })), diagnostics, authorization: "Read-only declared relations and byte checks; no causal proof, current QA, human approval or readiness is granted." };
}
export function renderProductGraph(slice) {
  if (slice?.kind !== "product-design-derived-slice") fail("derived product slice required");
  const safe = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\r\n]/g, " ").slice(0, 180);
  const ids = new Map(slice.nodes.map((n, i) => [n.id, "N" + i]));
  return ["flowchart LR", ...slice.nodes.map(n => "  " + ids.get(n.id) + '["' + safe(n.label + (n.evidenceLevel ? " [" + n.evidenceLevel + "]" : "")) + '"]'), ...slice.edges.map(e => "  " + ids.get(e.from) + " -->|" + safe(e.type) + "| " + ids.get(e.to)), "  NOTE[\"Derived bounded view; truncated: " + slice.truncated + "; no approval granted\"]"].join("\n") + "\n";
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { project: { type: "string" }, document: { type: "string", multiple: true }, seed: { type: "string", multiple: true }, task: { type: "string", multiple: true }, direction: { type: "string" }, "max-depth": { type: "string" }, "max-nodes": { type: "string" }, "max-content-chars": { type: "string" }, "node-chars": { type: "string" }, mermaid: { type: "boolean" }, help: { type: "boolean" } } });
    if (values.help) console.log("read-product-slice --project /absolute/target --document blueprint.json --document contract.json --seed blueprint.json#decisions/D2 [--task ID] [--direction up|down|both] [--max-depth 3] [--max-nodes 100] [--max-content-chars 2000..64000] [--node-chars 1..8000] [--mermaid]\nSeeds are exact node IDs; use ref:<percent-encoded node ID> for reserved characters/ambiguity, or API object references for raw paths. Identity v1 escapes %, # and entity delimiters; see product-reference-identity.mjs. Read-only explicit documents and native Beads IDs; no graph database or Entire transcript import.");
    else { const slice = readProductSlice({ project: values.project, documents: values.document, seeds: values.seed, tasks: values.task, direction: values.direction, limits: { maxDepth: values["max-depth"] === undefined ? undefined : Number(values["max-depth"]), maxNodes: values["max-nodes"] === undefined ? undefined : Number(values["max-nodes"]), maxContentChars: values["max-content-chars"] === undefined ? undefined : Number(values["max-content-chars"]), nodeChars: values["node-chars"] === undefined ? undefined : Number(values["node-chars"]) } }); console.log(values.mermaid ? renderProductGraph(slice) : JSON.stringify(slice, null, 2)); }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
