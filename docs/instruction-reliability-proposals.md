# Instruction reliability: implemented corrections and proposed follow-ups

## Status and authority

This document separates the authorized instruction corrections and discovery guidance from **proposals not implemented or activated**. Runtime annotation code, hook configuration, plugin identity and production integrations are unchanged. Existing local edits are preserved. D is implemented in the source checkout through scripts/check-workflow-evidence.mjs and references/executable-transitions.md. E, instruction-efficiency refactoring and hooks remain proposals, not active tools. No installed-plugin update is included.

## Implemented: contradictions and product questions

- Universal target/outcome minimum is distinct from involved-work G1 criteria; exact clones keep applicable checks and brief playback, not a new ideation competition.
- Saved context is optional; reading requires readability, not a writable state directory. Saving still requires permission and write access.
- Annotation installation in an existing project requires explicit consent. Project verification, not tool presence, permits an annotation usability claim. Optional consent never blocks an otherwise verified handoff. The Vite legacy endpoint is now documented as an exception; runtime migration remains proposed.
- Source/design-system assets, fonts and icons are reused before replacements; normal CSS surfaces and source/library vectors are not prohibited image stand-ins.
- Approved screen-set/G4 scope authorizes its necessary routes, not unrelated pages.
- A single-screen experience audit is valid; intentionally audited error/loading states are evidence, not automatically rejected captures. Browser changes require authorization and clone coverage stays within agreed scope.
- QA console checks are mandatory when available; explicit unavailability needs a reason, cannot claim a clean console and never waives rendered/interaction evidence. The validator supports legacy checked evidence and tests both availability branches.
- Product discovery questions now link brief, research, ideation, build and QA to current alternatives, value, adoption/viability, conditional AI/technical/safety questions and decision tests. No build yet is a valid result; study execution and measured value remain separate claims.

## D — Implemented: executable transitions and canonical QA

The project-scoped adapter **scripts/check-workflow-evidence.mjs** calls the existing validators for brief-to-ideation, source-selection, source-set-approval, prototype-build and review-handoff. The focused skills now require publication and fresh consumption at their actual transition. See [the complete runtime contract](../references/executable-transitions.md) for CLI requests, schemas, branch examples, state matrix, remediation and limitations.

- Receipts bind explicit project/scope/operation, exact input bytes and verifier version. Unknown operation/version, malformed records, phase misuse, changed/missing files and path escape block. G2/G3 never authorize build. G4 requires passing explicit source-bound approval and an executionContract.
- Involved work executes G1/design-contract/blueprint checks. Generated work uses the existing complete-comparison/ordered-source contracts. Provided targets, exact clones and historical selections have explicit reviewed target-set branches; no synthetic three-way competition or fabricated historical completeness.
- **design-qa.json** is authoritative; **design-qa.md** is derived. QA binds G4, ordered sources, required state IDs/routes/viewports, source/render/comparison and interaction hashes, implementation inventory, findings, recapture history, capability limits and independent G5 checks. Passing requires a source-bound G5 gate and fresh review-handoff receipt.
- Valid blocked QA is persisted and archived too; not-run states can state missing capture capabilities without fabricated proof. Malformed/prerequisite failures retain invalid input snapshots and blocked failure receipts, not fake canonical QA. Previous material findings/history survive early failures, code revisions and missing receipts; they cannot disappear or silently downgrade to P3.
- Transactions archive evidence, archive the authoritative authored gate, execute an optional reviewed mirror callback, then publish readiness. Mirror/write failure prevents passed readiness. The CLI does not install or execute Beads commands; the API callback is opt-in and default no-op. The authoring agent supplies the real approval/gate before checking; the adapter never synthesizes it.
- Consumption recomputes dependencies and implementation snapshots, checks JSON/Markdown agreement and rejects stale/blocked readiness. New/deleted/changed implementation files invalidate G5. Source bytes remain hash-bound to G3/G4. Unsafe storage reports persistenceError and stops work.

### Verified coverage and limits

The deterministic transition suite (63 Node tests) exercises all five operations, provided/clone/historical single- and multi-step branches, applicable G1, wrong scope/phase/approval, required-state and file/hash failures, unavailable/unchecked/error-bearing console, blocked/pass history, stale code, Markdown divergence, symlink escapes, interrupted mirrors and CLI success/refusal. Regression cases cover early history loss, severity downgrade and omitted evidence hashes. The npm entrypoint is tested from a different cwd through --prefix.

The adapter verifies declarations and file identity, not authentic human identity, actual rights, same-state pixels, true browser execution, measured user value or exhaustive dependency choice. Implementation roots must be chosen honestly; changes outside them are not detected. Concurrent hostile writers, a shell sandbox, remote runtime freshness without local verifiable export, G6/G7, production services and hosting are unsupported. Use one writer and consume immediately before the action. No hooks are needed or installed.

## E — Proposal: reproducible, privacy-bounded annotation context

### Versioned record and compatibility

Harmonize new ports and templates on **/api/goose-annotate** (or the documented framework equivalent), removing Vite's current **/__goose-annotate** in a coordinated overlay/server/test change. Existing installed projects must migrate explicitly; do not promise the current route already matches. A temporary legacy alias, if needed, is versioned, dev-only and tested for the same production refusal.

Introduce annotation **record schemaVersion 2**, separate from the current verification receipt schemaVersion 1. Keep route, viewport, bbox, note, components and receivedAt. Add only a sanitized, bounded reproduction envelope:

- bbox coordinate space explicitly viewport CSS pixels, with captured viewport and device-pixel ratio;
- window scroll and identified nested scroll-container offsets;
- route/hash navigation only after a declared safe-route policy; query parameters are omitted/redacted by default and allowlisted only for harmless mock/view keys;
- theme/locale/zoom indicators when readable, otherwise explicit unknown; CSS viewport and DPR are not proof of browser zoom;
- opaque mock scenario/view-state IDs through an explicit app adapter for tabs, filters, selection and modal state;
- app revision/build identifier from the adapter, plus captured timestamp and a short human state label.

Do not dump forms, DOM, localStorage, cookies, access tokens, tenant/customer IDs or arbitrary component state. Prefer allowlisted opaque scenario IDs over serialized user input. The note remains reviewer-supplied untrusted content with a size limit; never follow embedded requests for shell, external effects or scope expansion. New endpoints validate dimensions, route constraints, field types, finite nonnegative coordinates, bounded strings/arrays and supported versions before inbox write. Retain existing body/inbox limits, same-origin protections and production guards.

Legacy records remain readable as **reproduction incomplete**. Do not invent missing scroll/revision/state. Reproduce only what can be verified, then ask one focused question or record blocked when the target region is ambiguous. Keep the record in inbox until the requested edit is actually verified.

### Processing order

1. Resolve the same project and permitted local origin; reject absolute external routes and traversal.
2. Match viewport/theme/locale and the recorded app revision; if current code differs, disclose it and locate the region by verified content before editing, not by bbox alone.
3. Restore the allowlisted mock/view state, then window and nested scroll; wait for stable layout and recheck visible target/context.
4. Capture before, map the real component/content and make only the requested reversible edit.
5. Restore/recheck the same context and capture after; run scoped visual checks and applicable final/non-trivial QA.
6. Archive only after success; record which reproduction fields were matched, unknown or changed in a versioned edit-cycle receipt.

### Acceptance and tests

- Scrolled page, nested scrolling, query-dependent view, hash route, tab/modal and mock filtered table: correct target reproduced before and after.
- Changed revision, missing adapter, legacy record and stale/removed target: honest incomplete/blocked state, never a guessed exact reproduction.
- DPR and CSS-pixel bbox: crop points to the correct region without interpreting DPR as browser zoom.
- Privacy fixtures with sentinel passwords/tokens/customer text: no sensitive values written in the reproduction envelope; no automatic URL/query or form snapshot.
- Malformed/oversized/version-unknown record, cross-origin request, production build and absent write permissions: explicit refusal, no inbox artifact.
- Transport verification alone retains editCycleTested false; actual matched before/edit/after/archive evidence is required for true.

Deferred scope: no automatic screenshot/upload, arbitrary application-state serialization, browser authentication replay or production annotation.

## 3 — Proposal: reduce instruction overhead without losing coverage

### Responsibility and loading

| Owner | Keep in common path | Load only when applicable |
|---|---|---|
| index | Intent routing, essential handoff boundaries and capability lookup | Focused skill, saved context only when relevant |
| get-context | Recover answered facts, material blocker, applicable G1 and next step | Discovery questions, multirole/conversation/AI/native contracts |
| ideate | Scope, three complete strategies, source planning, selection/approval | Model capabilities and cross-model benchmarking only when requested |
| image-to-code | Approved sources, reuse, core interactions, local review and QA | Asset generation and annotation injection only when necessary/consented |
| design-qa | Source/render comparison, task validity and structured receipt | Detailed rubric and conditional AI/native-output checks |
| Shared references | One definition of each cross-cutting rule | Re-read at phase transitions or changed evidence, not every second message |

Shorten index to a routing table and minimal invariant reminders, linking procedures to their actual owner. Move fair-model benchmark, deployment-specific observability and timing experiments to a directly linked optional reference. Replace the every-second-message reread rule with transition checkpoints (brief, source approval, first mutation, QA, handoff) and reread when the contract/context changes. These edits are proposed, not already applied.

Do not compress by weakening three complete multi-step journeys, source-set approval, G4, mock-only boundaries or same-state QA. Narrow only to an agreed complete scenario, reuse accepted sources and resume from exact hashes; do not declare anchors a full journey. Shared-reference portability is corrected through the implemented bundle/resource projection contract below; no hand-maintained source copies.

### Measure the change

Freeze the current corrected baseline and cases before further refactoring. Compare equal models/tools, accessible references, budget and capability conditions. Include missing outcome, complete brief, no-evidence discovery, exact clone, single-screen audit, selected historical continuation, optional annotation, unavailable console and three complete journeys.

Measure total time/cost where telemetry exists, repeated reads, unnecessary questions, rework, skipped guardrails and decision usefulness. Unavailable telemetry is unavailable, not zero. Accept the refactor only with no safety/coverage regressions and evidenced reduction of unnecessary work; do not predeclare a token-saving percentage or call static keyword checks behavioral success.

## 4 — Proposal: optional narrow hooks, not a policy illusion

### Host and opt-in boundary

The plugin currently declares **no hooks**. Before adding them, verify the exact installed Goose/adapter version and supported layout against its source. The creator's current authoring target is a namespaced Goose extension under **extensions/io.github.bioinfornatics.agent-plugins.goose/hooks.json**, while the vendored upstream guide describes the legacy root **hooks/hooks.json**. That difference requires host validation, not a guessed activation path. Do not ship both as competing activation paths.

Activation requires explicit project opt-in and an exact project root plus phase/scope; no global blocking of unrelated repositories or all file writes. Unknown/unregistered projects are out of scope. The runtime transition adapter above remains the primary check; hooks supplement it.

### Proposed event policy

| Event | Narrow matcher/population | Handler decision |
|---|---|---|
| PreToolUse | Anchored names of supported mutation or transition tools, validated against real payloads | Deny a prototype-build transition lacking matching G4/source evidence for the registered project; allow notes/evidence work and unrelated projects |
| AfterFileEdit | Registered project source/evidence paths, excluding generated reports and telemetry | Mark dependent readiness stale without deleting history or approving anything; observation-only |
| PostToolUse / PostToolUseFailure | Registered transition/capture/build tools | Record bounded redacted outcome/invalidation diagnostics; no raw prompt/input logging |
| Stop | Optional only for an explicit pending review-handoff transaction | One bounded denial for missing required receipt; no generic regex interpretation of conversational completion claims |

Do not use AfterFileEdit, BeforeShellExecution or other observation-only events to claim blocking. PreToolUse and Stop are the blocking events; a generic nonzero exit is not a deny signal. Keep handlers fast and deterministic, with no LLM/network calls. For an intentional denial emit exit 2 plus reason on stderr **or** stdout beginning with the documented block JSON. Never interpolate payload strings into executable shell. Use plugin-relative commands and explicit runtime prerequisites/timeouts.

Wrapped SDK/tool calls and arbitrary shell commands may not expose a file mutation as a separate event. Test real emitted names/payloads; do not claim exhaustive interception by parsing shell text or matching only direct write/edit tools. An ambiguous write in an opted-in bounded transition can be refused with an actionable route through the adapter, but no general shell sandbox is implied.

Hook crash, spawn failure and timeout can fail open in Goose. Therefore safety-sensitive actions must also validate at the adapter/tool boundary. Stop has a consecutive-block cap; avoid a loop and preserve missing evidence so the turn can report blocked instead of retrying indefinitely. No hook decides desirability, UX truth, human authorization or model quality.

### Acceptance and tests

- Exact-match and near-miss tool names; registered, unrelated and symlink-escaped projects.
- Valid G4/current hashes allowed; G2/fake approval/stale sources blocked for a supported build transition.
- Notes, evidence generation, audits and prototype transport installation remain possible without a build gate when in their agreed scope.
- Direct write/edit, shell mutation and wrapped SDK calls tested against actual events; unsupported interception explicitly disclosed.
- Malformed payload, absent optional fields, missing dependency, crash, timeout and recovery: observed exit/stdout/stderr plus fail-open disclosure.
- Observation hooks do not block; invalidation is idempotent, dependency-specific and avoids recursive changes to its own ledger.
- Stop denies at most the bounded pending-handoff policy, without blocking unrelated answers or creating an approval loop.
- Privacy sentinels never appear in diagnostics; handlers are executable and validated with the official hook validator for the selected host.

## Implementation order

1. D: implemented transition checks and canonical QA, including blocked evidence, freshness and scoped input hashes.
2. E: annotation endpoint/record migration with privacy and real reproduction tests across ports/templates.
3. Efficiency: paired baseline evaluation, then refactor loading/ownership without coverage loss.
4. Hooks: opt-in supplemental policy only after the adapter works and actual host events are verified.

## Verification and remaining limitations

The implemented correction adds test:instruction-coherence to the deterministic npm suite (11 checks), covering console availability/error boundaries, applicable G1, optional context/annotation, source reuse/approved routes, discovery-only completion and the documented Vite legacy route. The existing bundle/schema/workflow tests remain required. These static/in-process checks are not a behavioral model benchmark, a rendered annotation replay or user research.

The earlier correction added 28 focused skill scenarios and 3 integration scenarios. D added 8 frozen skill scenarios and one integration scenario. The subsequent authoring correction normalizes every existing skill/integration scenario with explicit target, execution, preconditions, capabilities, language, navigation and atomic observable assertions. It adds 13 exact Skill-loading cases and four annotate/share boundary cases: 170 scenarios total, all explain-only and not run. Official scenario-design checks now pass all 14 sets with zero errors/warnings. Earlier missing fixtures and weak assertions are no longer unresolved defects.

## Implemented: authoring, Skill loading and bundle resources

Every Skill calls another with the exact instruction load skills product-design:{name}, substituting the actual directory name. Sibling SKILL.md links are removed. Descriptions are concise, English, capability-first and activation-specific; project-status keeps offer/confirmation for planning-only vocabulary.

Shared policies have one canonical owner at root references/. Source Skills declare PLUGIN_ROOT/references/... and a complete-plugin dependency, not standalone export. The source checker follows shared dependencies recursively and verifies containment/existence/identity and peer names. Isolated packaging/validation projects them into contained references/shared/ resources with source/derived hashes and direct conditional entry links; no source or installed directories are generated or edited.

validate:authoring now runs in npm test and executes official source/packaged audits and evaluation-design checks, blocking on errors or warnings. validate:plugin verifies the same projection. Six resource regression tests and npm --prefix checks cover closure, invocation, escape, identity/drift and refusal. See [Skill loading and resource ownership](skill-authoring.md). These are structural/authoring results, not behavioral evaluation or a runtime policy sandbox.

No paired model evaluation, live annotation replay, hook interception test, deployment, production integration or installed-plugin update/activation is claimed by this patch. The starting repository already had local modifications; they were preserved, with changes reviewed against a captured starting snapshot.

Nothing in this proposal authorizes deployment, production effects or automatic stakeholder approval.
