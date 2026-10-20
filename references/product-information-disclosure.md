# Product information progressive disclosure

Keep complete product specifications and rationale in their durable owning files; load only what the current question needs. Apply this policy to text retrieval and why/impact questions alongside [product lifecycle reasoning](product-lifecycle-reasoning.md). It changes context loading, not storage, authority or approval.

<a id="navigation"></a>
## Orient, then navigate directly

- Start with bounded Markdown headings/explicit anchors or JSON top-level keys and entity navigation. This derived navigation is not a factual summary or an authoritative specification.
- Navigate directly to a relevant full semantic section by stable explicit anchor, or a JSON entity by document, collection and ID. A Markdown anchor is an explicit a element with id, not a guessed heading slug or line number; an entity is not identified by array position.
- Select relevant JSON top-level fields instead of loading the entire root. Retrieve the context needed to interpret them; omitted fields are not thereby irrelevant.
- For product references longer than 100 lines, provide a table of contents when authoring or revising them. Prefer direct section links over index chains. No required global registry or automatic splitting of already-working files.
- Keep reasons with applicable constraints, recovery behavior and rejected alternatives. Never separate an attractive decision from its limiting conditions. Existing separate authorities may stay separate with explicit links followed when needed.

<a id="bounded-reads"></a>
## Read exact content in bounded pages

Use `PLUGIN_ROOT/scripts/read-product-information.mjs` on the explicitly resolved project and reference. Commands are agent-owned; do not ask the user to run them.

- `overview` returns bounded derived navigation, not the specification body.
- `excerpt` returns exact Markdown text or a selected JSON entity/field projection, not an LLM paraphrase. JSON serialization projects source values rather than preserving byte-for-byte formatting.
- Bound each content page with `maxChars` (default 2000; range 1–8000). Read returned representation, selection/completeness and paging metadata before interpreting text. Explicitly label partial or link-only results.
- Follow `nextCursor` as needed to read the relevant complete semantic section and linked context. A page can divide a sentence or constraint: the opening page is not the whole rationale. If required continuation is unavailable, qualify the explanation and stop before a material action.
- An overview can also need continuation. Finish the navigation needed to find the relevant section; absent entries in a partial overview are not nonexistent entries.

The module exports `readProductInformation({project, reference, mode, fields, maxChars, cursor})`; `mode` defaults to `overview` and `fields` to an empty selection. For continuation supply `{project, cursor, maxChars}`. The returned reference, SHA, representation, selection/completeness and paging metadata describe the actual read; follow the current runtime interface rather than inventing extra field names.

CLI entry points use explicit `--project`, `--file`, `--anchor` or `--collection`/`--id`, `--mode`, selected `--field`, and `--max-chars`. `--cursor` takes a safe local JSON file containing the returned cursor, not an inline transcript or shell expression. Consult script help for exact invocation details. After resolving actual target paths, for example:

    node "$PLUGIN_ROOT/scripts/read-product-information.mjs" --project "$PROJECT_ROOT" --file specifications/product.md --mode overview --max-chars 2000
    node "$PLUGIN_ROOT/scripts/read-product-information.mjs" --project "$PROJECT_ROOT" --file specifications/product.md --anchor decision-review --mode excerpt --max-chars 2000

These are reads, not setup or migration. No new database, model configuration or parallel product-memory store is required.

<a id="revision-binding"></a>
## Keep one source revision per read

The cursor binds the explicit project root, reference, projection, mode, offset and source SHA. Continuation freshly validates local bytes before returning content. Hashing full local bytes does not add those bytes to model context.

If the source changes mid-read, treat continuation as stale. Do not concatenate old and new pages or carry the old interpretation into a current decision. Resolve the current source and restart the affected read under its fresh SHA; reassess applicable constraints and source impact. Missing or ambiguous anchors/entities remain unresolved, not permission to guess replacements.

A fresh read or continuation never renews approval. Follow owning evidence validators and [executable transitions](executable-transitions.md) for current whole-specification dependencies and applicable action gates. Do not rewrite old evidence hashes just to make them current.

<a id="material-actions"></a>
## Retrieve enough before acting

Before a material action, retrieve applicable constraints, critical recovery and alternatives in full, including relevant linked sections. A bounded excerpt answers a narrow why question only within its stated coverage. Never infer no impact, risk or dependency from a partial read.

Keep these judgments separate:

| Dimension | What the read establishes | What it does not establish |
|---|---|---|
| Text completeness | Pages cover the selected semantic section at one SHA | Every relevant section was selected |
| JSON field selection | Selected fields/entity values were retrieved | Omitted fields are irrelevant or the whole root was read |
| Graph coverage/traversal | A bounded declared node/edge slice was traversed | Global dependency coverage or causal proof |
| Evidence validation | The owning validator checked applicable evidence and freshness | User value, human authorization or readiness from text alone |

Graph navigation through `PLUGIN_ROOT/scripts/read-product-slice.mjs` remains separate from text retrieval. Read bounded node payloads with their link/content completeness; follow authoritative references for missing rationale instead of loading an entire JSON root. A complete graph slice does not imply complete node text, nor does complete text imply complete graph coverage.

<a id="native-authorities"></a>
## Native authorities and privacy

Read Beads task details on demand through the native authority under the existing lifecycle contract, including closed work when relevant. Do not inspect private database files or mirror history. A task link alone is link-only evidence, not its full rationale or a current readiness result.

Use Entire only for an exact local provenance question under existing privacy consent. Follow the concrete native commit/checkpoint link; do not preload transcripts, import history, infer associations from timestamps or fetch remote sessions. Unavailable provenance remains a stated limitation.

Summaries can communicate a source-grounded answer but never replace sources. Do not persist an LLM-invented summary as product authority or substitute memory. Derived navigation is disposable, not a new decision record.

<a id="limits"></a>
## Explicit limits

Progressive disclosure preserves complete current files while reducing loaded context. It does **not** repair missed prior-history retention (F2): overwritten or never-recorded rationale remains unavailable unless an existing authorized authority retains it. Do not invent that history or claim recovery from a current-file hash.

It does not establish a full product graph. Reader compatibility fixes separately cover F1/F4/F6/F7/F8 with explicit partial relation coverage; they do not extend historical retention. Bounded reading, graph traversal, durable history and evidence validation are distinct capabilities. Contract/eval wiring is not behavioral execution, measured context savings or proof of improved decisions.

Design basis: [official Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), adapted to product information: concise entry points, direct navigation and progressive loading without replacing authoritative sources.
