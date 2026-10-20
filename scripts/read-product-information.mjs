#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { productReference } from "./product-reference-identity.mjs";
import { productRoot, productFile } from "./product-local-files.mjs";
import { sha256 } from "./workflow-evidence-contract.mjs";

const fail = message => { throw new Error(message); };
const authorization = "Read-only navigation/content; no approval, current QA or readiness is granted.";
const anchors = /<a\s+id=["']([A-Za-z][A-Za-z0-9_-]*)["']\s*>\s*<\/a>/g;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const checkedReference = productReference;

function checkedFields(fields) {
  if (!Array.isArray(fields) || fields.length > 20 || new Set(fields).size !== fields.length || fields.some(f => typeof f !== "string" || !f || f.length > 200 || /[\x00-\x1f\x7f]/.test(f))) fail("at most 20 unique explicit top-level fields required");
  return [...fields];
}
/** Parse navigation only; literals in fenced/indented code are never section boundaries. */
function markdownNavigation(text) {
  const entries = [], visible = []; let fence = null, offset = 0;
  const hidden = line => line.replace(/[^\r\n]/g, " ");
  for (const line of text.split(/(?<=\n)/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (new RegExp("^ {0,3}" + fence.char + "{" + fence.length + ",}\\s*$").test(line.trimEnd())) fence = null;
      visible.push(hidden(line)); offset += line.length; continue;
    }
    if (marker) { fence = { char: marker[1][0], length: marker[1].length }; visible.push(hidden(line)); offset += line.length; continue; }
    if (/^(?: {4}|\t)/.test(line)) { visible.push(hidden(line)); offset += line.length; continue; }
    visible.push(line); offset += line.length;
  }
  // Preserve UTF-16 offsets while excluding literal code spans and HTML comments.
  const navigable = visible.join("").replace(/<!--[^]*?-->/g, hidden).replace(/(`+)(?!`)([^]*?)\1(?!`)/g, hidden);
  for (const match of navigable.matchAll(anchors)) entries.push({ kind: "anchor", id: match[1], start: match.index, end: match.index + match[0].length });
  offset = 0;
  for (const line of navigable.split(/(?<=\n)/)) {
    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) entries.push({ kind: "heading", level: heading[1].length, title: heading[2], start: offset });
    offset += line.length;
  }
  return entries.sort((a, b) => a.start - b.start);
}
function projectJson(value, fields) {
  if (!fields.length) return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("field selection requires a JSON object");
  const selected = Object.create(null);
  for (const field of fields) { if (!own(value, field)) fail("selected JSON field missing: " + field); selected[field] = value[field]; }
  return selected;
}
function navigationJson(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return JSON.stringify({ type: Array.isArray(value) ? "array" : value === null ? "null" : typeof value });
  return Object.entries(value).map(([key, v]) => JSON.stringify({ field: key, type: Array.isArray(v) ? "array" : v === null ? "null" : typeof v, ...(Array.isArray(v) ? { count: v.length, entities: v.filter(e => e && typeof e.id === "string").map(e => ({ id: e.id })) } : {}) })).join("\n");
}
function selectedContent(file, ref, mode, fields) {
  const source = file.bytes.toString("utf8"), json = ref.path.endsWith(".json");
  if (!json && (ref.entity || fields.length)) fail("JSON entity/fields require a JSON file");
  if (ref.anchor && !ref.path.endsWith(".md")) fail("anchor requires Markdown");
  let selected = source, selection = { kind: ref.anchor ? "markdown-section" : json ? ref.entity ? "json-entity" : "json-document" : "document", wholeDocument: !ref.anchor && !ref.entity && !fields.length && mode === "excerpt", fields, omittedFieldCount: 0 };
  if (json) {
    let value = JSON.parse(source);
    if (ref.entity) {
      const values = value && own(value, ref.entity.collection) ? value[ref.entity.collection] : null;
      if (!Array.isArray(values)) fail("entity collection missing");
      const matches = values.filter(v => v?.id === ref.entity.id); if (matches.length !== 1) fail("entity missing or duplicate"); value = matches[0];
    }
    selection.omittedFieldCount = fields.length ? Object.keys(value ?? {}).length - fields.length : 0;
    value = projectJson(value, fields); selected = mode === "overview" ? navigationJson(value) : JSON.stringify(value, null, 2);
  } else {
    const nav = markdownNavigation(source);
    if (ref.anchor) {
      const matches = nav.filter(e => e.kind === "anchor" && e.id === ref.anchor); if (matches.length !== 1) fail("explicit anchor missing or duplicate");
      const start = matches[0].end, next = nav.find(e => e.kind === "anchor" && e.start >= start); selected = source.slice(start, next?.start ?? source.length);
    }
    if (mode === "overview") {
      const entries = markdownNavigation(selected); selected = entries.map(e => e.kind === "anchor" ? "anchor: " + e.id : "heading " + e.level + ": " + e.title).join("\n") || "No headings or explicit anchors; request a bounded document excerpt.";
    }
  }
  return { text: selected, selection, representation: mode === "overview" ? "derived-navigation" : json ? "json-projection" : "exact-text" };
}
function projectionHash(ref, mode, fields, text) { return sha256(JSON.stringify({ reference: ref, mode, fields, text })); }
/** Pure read; full bytes remain local. Cursor is a consistency token, not authorization or a signed capability. */
export function readProductInformation({ project, reference, mode, fields, maxChars = 2000, cursor } = {}) {
  project = productRoot(project);
  if (!Number.isInteger(maxChars) || maxChars < 1 || maxChars > 8000) fail("maxChars must be an integer from 1 to 8000");
  let offset = 0, expectedSha256 = null, expectedProjection = null;
  if (cursor !== undefined) {
    if (reference !== undefined || mode !== undefined || fields !== undefined) fail("continuation uses cursor only, not a new reference/mode/fields");
    if (!cursor || cursor.schemaVersion !== 1 || cursor.kind !== "product-information-cursor" || cursor.project !== project || !Number.isInteger(cursor.offset) || cursor.offset < 0 || !/^[a-f0-9]{64}$/.test(cursor.sha256 ?? "") || !/^[a-f0-9]{64}$/.test(cursor.projectionSha256 ?? "")) fail("invalid cursor, offset or project root");
    ({ reference, mode, fields, offset } = cursor); expectedSha256 = cursor.sha256; expectedProjection = cursor.projectionSha256;
  }
  mode ??= "overview"; fields = checkedFields(fields ?? []);
  if (!["overview", "excerpt"].includes(mode)) fail("mode must be overview or excerpt");
  let ref;
  try {
    ref = checkedReference(reference); const file = productFile(project, ref.path), hash = sha256(file.bytes);
    if (expectedSha256 && expectedSha256 !== hash) return { status: "stale", reference: ref, expectedSha256, actualSha256: hash, text: null, nextCursor: null, reason: "source changed; restart the selected read", authorization };
    const content = selectedContent(file, ref, mode, fields), projectionSha256 = projectionHash(ref, mode, fields, content.text);
    if (expectedProjection && expectedProjection !== projectionSha256) return { status: "stale", reference: ref, text: null, nextCursor: null, reason: "cursor projection changed; restart the selected read", authorization };
    const points = Array.from(content.text); if (offset > points.length) fail("cursor offset exceeds selected content");
    const end = Math.min(offset + maxChars, points.length), text = points.slice(offset, end).join(""), atEnd = end === points.length;
    const nextCursor = atEnd ? null : { schemaVersion: 1, kind: "product-information-cursor", project, reference: ref, mode, fields, offset: end, sha256: hash, projectionSha256 };
    return { schemaVersion: 1, kind: "product-information-page", status: "resolved", project, reference: ref, sha256: hash, mode, representation: content.representation, selection: content.selection, text, paging: { unit: "unicode-code-points", offset, end, totalChars: points.length, returnedChars: end - offset, maxChars, partial: offset > 0 || !atEnd, complete: offset === 0 && atEnd, atEnd }, nextCursor, authorization };
  } catch (error) { return { status: "unresolved", reference: ref ?? reference, text: null, nextCursor: null, reason: error.code === "ENOENT" ? "file missing" : error.message, authorization }; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { project: { type: "string" }, file: { type: "string" }, anchor: { type: "string" }, collection: { type: "string" }, id: { type: "string" }, mode: { type: "string" }, field: { type: "string", multiple: true }, "max-chars": { type: "string" }, cursor: { type: "string" }, help: { type: "boolean" } } });
    if (values.help) console.log("read-product-information --project /absolute/target --file specification.md [--anchor explicit-id | --collection decisions --id D1] [--mode overview|excerpt] [--field top-level-key] [--max-chars 1..8000]\nContinuation: --project /absolute/target --cursor project-relative-cursor.json [--max-chars N]\nRead-only local bytes and derived navigation. Cursor JSON must contain the returned nextCursor, not a whole page. No writes or approval.");
    else {
      if (!!values.collection !== !!values.id) fail("--collection and --id must be paired");
      if (values.cursor && [values.file, values.anchor, values.collection, values.mode, values.field].some(v => v !== undefined)) fail("--cursor cannot be combined with new reference/projection flags");
      const cursor = values.cursor ? JSON.parse(productFile(values.project, values.cursor, { maxBytes: 16384 }).bytes.toString("utf8")) : undefined;
      const page = readProductInformation({ project: values.project, ...(cursor ? { cursor } : { reference: { path: values.file, ...(values.anchor ? { anchor: values.anchor } : {}), ...(values.collection ? { entity: { collection: values.collection, id: values.id } } : {}) }, mode: values.mode, fields: values.field }), maxChars: values["max-chars"] === undefined ? undefined : Number(values["max-chars"]) });
      console.log(JSON.stringify(page, null, 2)); if (page.status !== "resolved") process.exitCode = 1;
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
