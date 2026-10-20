# Capability-aware product lifecycle and evidence reasoning

## When to use

Use for involved Product Design discovery, ideation, approved-source build, QA and maintenance; also for an explicit question about why a task, decision or screen exists. This is a working method, not a new gate or a request for hidden chain-of-thought. Publish concise rationale, references, uncertainty and verification outcomes. Simple isolated edits do not need a graph exercise.

## Authorities and durable reasoning

- Current product specifications own intended experience and durable reasoning. Use existing readable Markdown and design-contract/experience-blueprint JSON; no mandatory additional catalog. Draft discovery can remain incomplete Markdown rather than invented answers for validator readiness.
- Beads, when active, owns task-specific rationale, discussion, native dependencies and resolution. Do not duplicate its task database/history. Store durable product decisions in specs, referencing the work that explains the change when useful.
- Git owns implementation revisions; optional Entire owns captured development sessions/checkpoints. Native checkpoint trailers already link commit to provenance; no parallel registry or transcript mirror. A development repository's configuration is not a target product's configuration.
- Existing source plans/ledgers, phase receipts and QA archives own observations bound to exact bytes. A criterion is proposed until a real result proves what was executed. A linked closed task is historical work, not current readiness.

The reader accepts explicit project-relative documents, including product specifications under .product-design if present and current legacy files. It does not create directories, relocate .gates/root QA/generated files, auto-scan repositories, select monorepo products or persist model/host configuration. Storage migration remains separate. File hashes detect byte identity conservatively, not semantic equivalence.

## Working loop: retrieve, traverse, explore, verify, act

1. **Retrieve:** resolve PROJECT_ROOT and the concrete question/decision/task/state. Read actual target instructions, analogous components/tokens and existing authorities. Use a small explicit document set; do not load all conversations or specs.
2. **Traverse:** follow upstream declared inputs → questions → decisions, and downstream decisions → states/scenarios → criteria/sources/results. Keep edge direction/type and field provenance. Distinguish native task blocks from product justification. Missing links remain unresolved; inferred links are reviewed hypotheses, never silently authored facts.
3. **Explore:** select the material uncertainty that can change the next decision (value, coverage, safety, source fidelity, recovery or implementation). Fetch the next authoritative source or ask the one needed question. Do not dump a large Mermaid graph instead of answering.
4. **Verify:** check actual content and current bytes, resolved anchors/IDs, evidence level, sourceImpact and the relevant existing validators. Show stale/unavailable/ambiguous/truncated states honestly. Whole-blueprint freshness still applies even if a fine slice identifies one candidate screen. Never refresh old hashes to keep an old approval.
5. **Act:** update only the owning specification/task/code/evidence within scope. Main journey/state changes return to source review and applicable G3/G4; implementation-only defects go to scoped repair and QA. Publish and freshly consume the existing transition request before its action. Missing optional tools do not block local work; configured mirror failures retain the current transition contract. Preserve historical results rather than reopening entire task ancestry automatically.

## Executable reader, not a graph database

`PLUGIN_ROOT/scripts/read-product-slice.mjs` exports:

- readProductSlice({project,documents,seeds,direction,limits,tasks,env}) — read-only declared slice; explicit Beads task IDs only, including closed tasks. Selected node data is bounded; JSON root nodes return navigation, not the complete root. Text completeness is separate from traversal truncation;
- validateProductReferences({project,references}) — confined regular files, exact unique JSON collection/id or explicit Markdown anchor. Returns a bounded excerpt and content metadata/continuation; entity is present only if the selected entity fits completely;
- renderProductGraph(slice) — escaped derived Mermaid text; JSON slice retains edge provenance, evidence levels, dependencies, diagnostics and truncation.

Example, with actual target paths substituted by the agent:

    node "$PLUGIN_ROOT/scripts/read-product-slice.mjs" --project "$PROJECT_ROOT" \
      --document specifications/design-contract.json --document specifications/experience-blueprint.json \
      --seed 'specifications/experience-blueprint.json#decisions/D2' --direction both --max-depth 3 --max-nodes 100

An explicit Markdown anchor is an a element with id, not a generated heading slug or line number. Entity identity is document + collection + id, not array position. IDs/paths must resolve uniquely. Diagnostics are part of the result: a rendered graph alone conceals missing evidence and is not QA. Edges shown are declared or directly derived from declared fields, not causal proof. Max-depth/max-nodes bound the traversal; no global completeness claim. Missing relevant documents or unsupported result dependency forms require the owning validator or a targeted read, never an invented current result.

The reader's optional task join uses native readBeadsIssues({project,ids}) from `PLUGIN_ROOT/scripts/check-product-tooling.mjs`. That function verifies local tracker association before bd --readonly show ID --json --include-comments. No Dolt internals/export parsing, task creation, writes, automatic history search or tracker initialization. Use native bd search with --status all for a historical question; use installed help for description search and native dependency traversal limits. Closed work and stale current evidence can coexist.

### Minimal optional cross-authority task references

When a tracked change needs a finer link than native spec-id, preserve unrelated native metadata and use only the needed references in metadata.product-design, schemaVersion:1, references:[...]. Each entry has relation affects/explained-by/verified-by and a project-relative path, plus either entity:{collection,id} or explicit anchor when useful. Do not copy task status/owner/rationale/projectId or Beads relations into specs. verified-by targets an executed result, not a blueprint criterion or proposed test. The reader checks links and available dependency hashes, not the truth of an arbitrary custom result.

Do not create metadata in a tracker simply because the reader supports it. Existing native spec-id, resolution and comments remain usable via targeted reads; the reader does not infer missing fine links from prose. Both writing metadata and closing tasks remain owned by product-design:project-status in active scope.

## Progressive product-information reads

For scoped rationale/specification text retrieval, follow [product information disclosure](product-information-disclosure.md) and use `PLUGIN_ROOT/scripts/read-product-information.mjs`. Orient from derived headings/anchors or JSON keys/entities; retrieve exact selected sections/fields in bounded pages and verify the cursor's source SHA on continuation. Full local bytes stay authoritative; the overview is not a factual summary. Read applicable constraints/alternatives/recovery before a material action.

Graph `limits.nodeChars` defaults to 2000 (1–8000); `limits.maxContentChars` defaults to 12000 (2000–64000) for aggregate serialized node data, excluding identities, labels, cursors, diagnostics and edges. Content-budget exhaustion returns link-only nodes, not deleted graph neighbors. Node `content` identifies representation, selected scope, paging and continuation. Beads nodes contain only bounded identity/status; retrieve native details on demand. Neither text coverage nor the graph renews approval or repairs missing historical rationale.

## Entire provenance: native, optional and question-driven

Run the capability/onboarding check under tooling-onboarding.md first when applicable. External Goose is supported; enabled settings, adapter availability, installed hooks and a captured checkpoint are different states. Do not retry Entire enable on an already-enabled target merely because the built-in agent list omits the host.

For an authorized local provenance question, use the installed Entire CLI help, then inspect the exact Git commit's native Entire-Checkpoint trailer and available local checkpoint metadata. entire checkpoint explain --json returns metadata, not transcript bytes. Do not infer task→commit association from timestamps. Transcript extraction, remote access and generated summaries need separately reviewed scope/privacy; --generate writes and spends tokens, so is not a default read. No automatic history import/fetch, authentication changes, summary generation or transcript copying in this reader. If provenance is missing, explain from current specs and native work history with the limitation stated.

## Capability-aware image and browser work

Use `PLUGIN_ROOT/scripts/product-capabilities.mjs` exports inspectProductCapabilities(tools) and checkPhaseCapabilities(report,phase). Supply the current exposed tool inventory with reviewed capability labels; actual JSON inputSchema is required for exact image destinations. CLI check-product-tooling accepts an optional --tools project-relative temporary inventory; this is transient execution input, not product/provider configuration. Without it, CLI checks only native executables and does not guess MCP availability.

Availability is not connectivity or execution. Reuse an authorized provider's health/check capability when exposed; avoid repeated tests/spend and never emit credentials. Respect the chosen browser. Main-phase needs are explicit: ideation/image editing require the matching image capability and inspection; URL capture needs browser capture; QA/annotation need capture, interaction and inspection; local build needs read/write/shell; requested sharing needs an available hosting tool and actual verified URL. Beads/Entire are not on this required-phase list. Alternate rendering hosts may follow their existing focused skill contract rather than pretending local shell is always required.

Image sources still use the existing exact-path contract: check-source-artifacts → verifySourcePlanFiles → prepareSourceAttempt → actual generate/edit tool call → inspect exact returned bytes → verifySourceRecord → persist accepted or rejected ledger. A capability check does not replace that source preflight. Resolve the actual image workspace against PROJECT_ROOT, never assume handler cwd. Unknown destination support is blocked before spend. One full-size screen per call; three complete comparable journeys for new multi-step exploration; selected directions only complete/correct missing sources. Retry limits/contiguous attempts and accepted-source reuse remain unchanged.

## Annotation maintenance and recovery

`PLUGIN_ROOT/scripts/check-annotation-queue.mjs` exports validateAnnotationRecord(record) and checkAnnotationQueue({project,limit}). It only reads the explicit target's inbox, validates route/viewport/bbox/note/timestamp, orders by received time and flags malformed, duplicate processed filenames or unsafe paths. No queue means no installation claim. Pending JSON is not a capture or command; the inspector never edits/moves records or produces a success receipt. On blocked diagnostics, inspect and repair the offending record/cycle before replay; preserve original records and do not silently delete or mark them processed.

product-design:annotate owns the real loop: use/start the authorized project's server, verify URL, reproduce route/state/viewport, capture and inspect bbox, map actual component/content, resolve specification impact, make a scoped edit, recapture, then move the exact processed record. Overlapping annotations use the latest state in received order. If scope changes intent/journey or source fidelity materially, obtain applicable source/build approval rather than coding from a comment alone. Final/nontrivial cycle reruns canonical design-qa and fresh review-handoff consumption. Existing annotation-verification receipt records real transport/edit evidence only.

No dev endpoint renaming or template reinjection: current Vite /__goose-annotate and other ports /api/goose-annotate remain coordinated existing behavior. Existing applications require consented annotate-inject and actual dev/prod verification. Native port transport security remains under its existing contract.

## Hooks and lifecycle boundaries

These functions are ESM script exports called through shell/Node, not newly registered MCP tools. Relevant skills trigger the read/check/act loop. No auto-init/install/recording hook or universal filesystem watcher is implemented. Future hooks need a verified host adapter, matching payload/tool names, bounded work and explicit project association; they may diagnose or consume recognized transitions but never fabricate human approval, capture or user value. Existing phase checks run regardless of hooks.

Production G6/G7, release, backend/auth/integrations and operations remain separate expressly authorized engineering. Product Design can feed authorized feedback into research/audit/maintenance, not silently create production services. Mermaid distinguishes those out-of-adapter transitions from implemented G1–G5 paths.

## Reader compatibility and coverage

The reader normalizes native absolute dependency paths only when confined to the explicit product root; missing/unsupported dependency reads report unknown rather than an observed byte change. Historical receipts are not rewritten. It includes declared persona/scenario → intent and specification file → source-plan specification → screen links. Returned coverage lists supported and unsupported families; partial coverage, traversal truncation and text completeness remain distinct.

Reference identities percent-encode each path component, collection and ID, escaping literal percent/hash/slash delimiters without renaming authored IDs. Existing simple IDs remain unchanged. Use raw object references in the API; CLI `ref:<encoded node ID>` selects an encoded identity explicitly. Ambiguous unescaped legacy seeds are rejected. Markdown anchor and native task namespaces are reserved; no duplicate node can silently replace a distinct authority. Malformed draft members produce diagnostics; owning validators alone determine validity/readiness.
