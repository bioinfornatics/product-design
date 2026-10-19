# Executable transitions and canonical QA

This is the runtime contract for `scripts/check-workflow-evidence.mjs`. Read it at a Product Design transition, not for setup-only, discovery-only, an experience audit, or a tiny unrelated code edit. Node.js 22+ and local filesystem access are required. The agent runs these commands; do not send a designer terminal homework.

## Scope and rule matrix

| Dimension | Automated | Semantic / unsupported boundary |
|---|---|---|
| Operations | Brief → ideation, G2 selection, G3 source approval, G4 build, G5 review | G6/G7, hosting, production integrations are unsupported |
| Generated exploration | Existing manifest/comparison/selected-set validators; three complete journeys or three isolated directions | Actual quality, comparability and readable pixels require inspection |
| Provided visual / exact clone | Explicit approved-target-set, ordered source inventory and reviewed bytes | No invented G2 competition; capture the agreed scope only |
| Historical selection | Prior choice declaration, incomplete comparison disclosure, corrected complete selected set | Do not recreate alternatives or invent historical proof |
| Involved work | Existing G1, design contract and experience blueprint validators | The involved flag is a scope declaration, not automatic risk classification |
| Files / freshness | Confined local paths, exact SHA-256, states, code snapshot, archive identity, verifier version | Remote evidence must be imported legally; concurrent hostile writers are not supported |
| QA | Canonical JSON, passing/blocked attempts, required-state matrix, findings/history, console branches, G5 | Same-state pixel comparison, true browser execution, accessibility quality and user value are reviewed, not proved by hashes |
| Authorization | Declared owner, statement, timestamp, exact sources and G4 scope | Human identity, rights and consent are not authenticated by the adapter |
| Transaction | Evidence archives → gate snapshot → optional callback mirror → scoped receipt; stop on failure | No Beads CLI/configuration or hooks are installed; mirror callback is opt-in |

## Running and consuming a transition

Resolve `PLUGIN_ROOT` from the loaded skill directory (two levels up), not the application's current working directory. Keep a single explicit target project root. Sources, JSON inputs, captures and comparison artifacts must be inside that project after realpath resolution. Authorized provided targets/captures may be imported into it before recording hashes; newly generated/edited sources must be written directly to their preflight destination under [source artifacts](source-artifacts.md), never copied into canonical provenance. Gate evidencePath and source paths are exact normalized absolute paths; request paths may be project-relative.

Prepare the target directory as an evidence workspace before rendering. A directory containing only evidence is not permission to scaffold. Keep this canonical evidence root. For a new app, bootstrap into its empty app/ subdirectory and declare app/src, app/public, app/package.json, app/package-lock.json and framework configuration as applicable implementation roots. This avoids the bootstrap script's nonempty-destination refusal without overwrite flags. For an existing app, the application root may itself be the evidence root. Do not relocate either root silently.

```bash
node "$PLUGIN_ROOT/scripts/check-workflow-evidence.mjs" \
  --project "$PROJECT_ROOT" --request .gates/prototype-build.request.json
# Immediately before the authorized action, with the same request:
node "$PLUGIN_ROOT/scripts/check-workflow-evidence.mjs" \
  --project "$PROJECT_ROOT" --request .gates/prototype-build.request.json --consume
```

From a source checkout, `npm run check:workflow-evidence -- --project <root> --request <path> [--consume]` is equivalent and supports `npm --prefix`. Exit 0 means passed; exit 1 means blocked or invalid usage. Read the JSON result, especially reason, readyFor and persistenceError. Do not continue on a nonzero command or a missing receipt.

A receipt at `.gates/<operation>.receipt.json` permits only its named readyFor action, project and scope. G2 never grants build permission; G3 never grants build permission. `--consume` revalidates authored evidence, current bytes, implementation inventory and verifier fingerprint, compares dependencies to the last passing receipt and (for QA) compares the derived Markdown. It is a freshness check, not a single-use authorization token or a process sandbox. Never treat a receipt copied from another project, a Beads label, or Markdown text as authority.

## Request schemaVersion 1

Every request includes:

```json
{
  "schemaVersion": 1,
  "operation": "prototype-build",
  "workflow": "generated",
  "involved": true,
  "scope": "The agreed booking journey",
  "target": "Booking frontend",
  "outcome": "Booking confirmed or recoverable unavailable slot",
  "owner": "Declared decision owner",
  "timestamp": "2026-10-18T20:00:00Z",
  "g1": ".gates/g1.json",
  "designContract": ".gates/design-contract.json",
  "blueprint": ".gates/experience-blueprint.json",
  "manifest": ".gates/ideation-manifest.json",
  "selection": ".gates/g2.json",
  "sourceApproval": ".gates/g3.json",
  "buildApproval": ".gates/g4.json"
}
```

Paths and declarations above are examples, not evidence or approvals. Populate them from the actual agreed records. Never infer human approval from successful validation. Involved work requires the existing G1 schemaVersion 2 and design contract/blueprint schemaVersion 1. Uninvolved work still needs target/outcome/scope, source approval and G4 when building. Do not mark involved work false to bypass its criteria.

| Operation | Required inputs beyond common fields | readyFor |
|---|---|---|
| brief-to-ideation | Applicable G1/contract/blueprint; workflow generated only | ideation |
| source-selection | generated manifest + G2 selection and its complete comparison | selected-screen-production |
| source-set-approval | G3 + ordered approved set; generated manifest/G2 or applicable target-set branch | build-handoff |
| prototype-build | All applicable source-approval inputs + explicit passing G4 with executionContract | prototype-build |
| review-handoff | All build inputs + qa: design-qa.json; passing reports also reviewGate: G5 | review-handoff, only when QA passes |

Generated manifests remain schemaVersion 1; generated comparison/selected-screen-set and G2/G3/G4/G5 remain schemaVersion 2. Use existing validators, not the legacy validateBuildHandoff schemaVersion 1 (which hardcodes G1/G2/G3 for every workflow). The adapter supplies phase-aware G4 checking instead. All gates share the exact request.scope. G3/G4 bind the same approved set path and canonical parsed-object hash. G3/G4 verdict must be pass, not experiment. G2 may preserve an experiment for correction, never for building unapproved pixels.

## Source-plan dependency binding

Read [source artifacts](source-artifacts.md) for new generated/edited source calls and source-plan-bound approvals. A request may carry sourcePlan (project-relative plan path) to bind actual specification/context files, stable screen links and canonical accepted ledger records/files to source dependencies. G2 binds the comparison sources; subsequent source approval/build/QA bind only the active approved set, allowing a selected-only plan without fabricating records for unselected historical variants. Source-plan-bound source approvals require those accepted records, not merely manually copied bytes. Publication and fresh consumption recheck dependencies; changed specs/context block stale readiness until impact review and genuinely renewed affected approvals. The source CLI only preflights/files-checks; it never calls Image MCP or creates human approval. Existing unrelated gates and provided/clone/historical branches remain unchanged; older evidence is not auto-migrated.

## G4 executionContract

Attach this schemaVersion 1 object to the explicit G4 gate before build authorization:

```json
{
  "schemaVersion": 1,
  "projectRoot": "/absolute/real/project-root",
  "scope": "The agreed booking journey",
  "target": "Booking frontend",
  "outcome": "Booking confirmed or recoverable unavailable slot",
  "hypothesis": "The task-shaped journey helps users complete booking; unmeasured",
  "successCriterion": "Complete the task and recover from an unavailable slot",
  "mockData": "Fictional, frozen mentor and slot data",
  "outOfScope": "Real identity, booking services, external effects and production",
  "framework": "Vite React for frontend review",
  "designSystem": "Existing project tokens and components",
  "implementationPaths": ["src", "public", "package.json", "package-lock.json", "vite.config.mjs"],
  "requiredStates": [
    {"id":"confirmation-desktop","sourceId":"V3-S3","route":"/booking","state":"confirmed","viewport":{"width":1536,"height":1024}}
  ]
}
```

The example matrix is intentionally abbreviated; the real matrix must cover **every** approved source plus applicable critical/responsive/focus/empty/error states before G4. Unique IDs, source IDs, routes, state labels and positive integer viewports bind QA. Do not shrink the matrix after QA to make it pass. Changing it requires renewed G4 authorization and fresh QA; findings on the same approved sources are retained across a G4 metadata revision.

Choose nonoverlapping implementation roots covering all rendering/interaction code, local assets, lockfile and relevant framework configuration. This choice requires agent review; a declaration cannot prove it lists every possible dependency. Missing implementation files are allowed before scaffolding, but must exist for the QA snapshot. For QA, import snapshotImplementation(project, paths) from the adapter and store its return in implementationFiles. It recursively hashes every file without silent exclusions; project root, symlinks/ancestor links, special files, overlapping roots and node_modules/.git/.gates/.goose paths are rejected. External packages are represented by the approved lockfile, not recursive node_modules hashing. New/deleted/changed files under the selected roots invalidate G5. Changes outside those declared roots are not detected; choose them honestly. Goose Apps or remote runtimes need a local verifiable export and captures; without that, canonical freshness checking is blocked, not waived.

## Provided, clone and historical target sets

For workflow provided-target, exact-clone or historical-selection, G3 evidence is an **approved-target-set schemaVersion 1**, not generated-candidate evidence. No manifest or new G2 comparison is required. The set contains:

- kind: approved-target-set, origin equal to workflow, scopeKind: single-screen or multi-step;
- ordered inventory: entries with id, purpose and role (isolated for one screen; action/outcome/critical-recovery for a journey);
- multi-step boundaries with explicit start, outcome and recovery; the inventory includes all three journey roles;
- ordered screens with unique id and SHA-256, exact absolute path, provenance equal to workflow, criticalCopyReadable: true and buildSourceEligible: true;
- each source review binds inspectedPath/inspectedSha256, reviewer, timestamp, composition: accepted, businessFidelity: accepted and findings: [] or resolved reviewed findings;
- approval with actual declared owner/statement/timestamp, screenSetApproved: true and screenSetHash = sha256(screens), using canonical JSON hashing.

A live URL alone is not a local hashed source; capture/import its approved states. A single-screen clone stays a single-screen scope. Missing critical recovery in an agreed multi-step source scope blocks source approval; do not invent proof. Permission to clone is distinct from evidence of source-state coverage. Reuse an explicit request's authorization only for its actual scope; if the reviewed captures expose an ambiguity or expand scope, obtain clarification/approval rather than synthesizing it.

Historical continuation additionally supplies request.priorSelection with schemaVersion: 1, kind: historical-selection, selectedDirection matching the target set, comparisonComplete: false, declared owner/statement/timestamp. Preserve the choice, disclose missing old alternatives, complete/correct only the selected sources and obtain full-set/G4 approval. This does not retroactively claim a complete G2 comparison. Selected-only presentation may use individual full-size images with IDs/roles/nextScreen and complete ordered-set access; the exactly-three board generator must not force fabricated alternatives or an app scaffold/server. New generated/edited additions still require the source plan/preflight and honest append-only records.

## Canonical design-qa.json

The project-root JSON is authoritative; the adapter derives project-root design-qa.md. Do not independently edit the Markdown or retain Markdown-only passes as new readiness. Existing Markdown/legacy reports need explicit evidence migration through this command; they are not automatically promoted.

QA schemaVersion 1 extends the existing pass report with:

- scope, reviewer, ISO timestamp; approvedScreenSetHash = sha256(parsed approved set), buildApprovalHash = sha256(parsed G4);
- requiredStates identical to G4.executionContract.requiredStates;
- implementationFiles from snapshotImplementation;
- states, findings, history, blockers, limitations arrays (empty arrays are explicit, not omitted);
- openP0P1P2 matching the count of open P0/P1/P2 findings;
- g5.execution and g5.productTestValidity independently pass or blocked; additional study/evaluation notes may declare not run;
- finalResult exactly passed or blocked.

A performed state includes the frozen id/sourceId/route/state/viewport; sourcePath/sourceSha256, renderedPath/renderedSha256, combinedComparisonPath/combinedComparisonSha256; five surfaces (typography, spacing, colors, images, copy); focusedComparison with local region evidence/reason; accessibility and responsiveness evidence/limitations; console availability/checked/errors and reason when unavailable; primary interactions with action/expected/observed/result and evidencePath/evidenceSha256. All evidence hashes are mandatory SHA-256 and checked against bytes. Console available requires a real checked-clean report to pass; unavailable requires checked false and a reason, never a fabricated clean-console claim. Runtime errors or failed primary interactions block passing.

A missing capability can be recorded honestly as {id, sourceId, route, state, viewport, notRunReason} for a not-run state in a **blocked** report. A blocked report may have an incomplete performed-state list, but must keep the entire requiredStates matrix and nonempty blockers. No passing G5 is required or fabricated for a blocked attempt. If source/gate prerequisites themselves are invalid, the adapter records a failed attempt, not a fictitious complete QA. Write the blocked canonical report from known evidence; the failed receipt cannot be treated as a derived valid report.

Findings carry id, severity P0–P3, status open/resolved, location, detail, evidence, impact and fix. Resolved P0/P1/P2 require history with findingId, stateId, severity, finding, fix, timestamp, beforePath/beforeSha256, afterPath/afterSha256 and comparisonPath/comparisonSha256. Earlier material findings cannot disappear or silently become P3; history cannot be deleted/rewritten. Resolving an archived open finding must bind its earlier capture and the current changed post-fix capture/comparison. Save versioned capture files; never overwrite evidence used by history.

Passing requires every required state performed, no blockers, no open material findings and both G5 checks passing. request.reviewGate points to a schemaVersion 2 G5 gate with status: QA-passed, verdict: pass, readyFor: review-handoff, the same scope, evidencePath: <project>/design-qa.json and evidenceHash: sha256(parsed QA). G5 means testable review fidelity, not measured value, participant research, G6 or production authorization.

## Persistence, failures and resume

The adapter never invents a stakeholder gate. It archives exact authored input bytes, canonical evidence and authoritative gate snapshots, then calls an optional mirrorBeads callback (default no-op), then publishes readiness. The JavaScript API returns a Promise. The CLI does not execute arbitrary mirror commands. When tracking is active, an integration may pass a reviewed callback; failure prevents passed readiness. Without that integration, do not claim the CLI mirrored Beads. Tracking remains optional.

Each valid canonical QA attempt, including blocked, is content-addressed in .gates/qa-attempts/. The receipt keeps this ledger; archive discovery reconstructs it after an early validation failure or missing receipt. Archives are append-only under the adapter, hashed on every use and retained across code changes. Raw malformed/invalid inputs are saved separately with failed-attempt evidence, not promoted to valid canonical QA. Failed checks overwrite scoped readiness with blocked/readyFor null when storage is safe; unsafe/unwritable storage produces persistenceError and must halt the workflow. No passed readiness is issued on interrupted evidence/gate/mirror writes. Do not manually remove archive/receipt files to bypass history.

On failure: keep the source choice/history, read reason, repair only the invalid/missing prerequisite or recapture/recompare changed implementation, update the genuinely approved records when scope/source changes, rerun publication, then consume. JSON/Markdown divergence is repaired only by regenerating from canonical JSON. A malformed request with unknown operation cannot safely identify a readiness file; a later consume still revalidates and rejects it. Success does not protect against subsequent concurrent writes: consume immediately before the action, keep one writer per project and rerun QA after implementation changes.

Synthetic filesystem tests validate this structural protocol only. They are not model-behavior evaluation, browser screenshot QA, an authenticated approval service or a usability study.
