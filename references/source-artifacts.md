# Source artifacts: destinations, dependencies and continuity

Read before planning, generating/editing, approving or consuming Product Design screen sources. This is the single shared contract for source plans and attempt records; the ideation manifest still owns comparison content and the experience blueprint owns product decisions. It adds no research questionnaire or competing specification system. Generic Image MCP calls outside Product Design may retain automatic random-name output.

## Plan before pixels

Freeze a source plan before **every new generated or edited screen-source call**, including manually orchestrated calls and selected-only continuation. Keep one explicit evidence project root aligned with the Image MCP workspace root. Missing/unknown workspace or output capability blocks the call. Do not create an app scaffold or server to satisfy source storage or presentation.

The source plan has:

- schemaVersion: 1; kind: product-design-source-plan; journeyId and sessionId: safe kebab-case identifiers; involved: boolean.
- specificationSources: entries with id, path (project-relative), sha256 (actual file bytes), revision and authority (current or historical). Inventory actual supplied specifications, not merely their names in a prompt. Label superseded inputs historical; do not silently treat them as current.
- context when involved: designContract and blueprint, each with path (project-relative) and sha256. Bind the existing Product/UX/UI contract and experience blueprint, not six new specs.
- screens: entries with id, variantId, purpose, role (main-path, outcome, critical-recovery, optional or isolated), nextScreen, attemptLimit and links. IDs in canonical paths must be safe identifiers; preserve actual screen IDs rather than numbering the survivors after selection. nextScreen binds the actual successor or End, not generation order.
- links on every screen: specificationIds, scenarioIds, decisionIds, screenStateIds and verificationIds. Resolve these to the inventoried specs and applicable existing contract/blueprint IDs. An empty list means no applicable declared dependency, not permission to omit involved traceability. Keep stable product references in links, not all encoded in a filename.

A single source plan serves both complete comparison and selected continuation. Selection narrows execution, not identity: keep journey/session/variant/screen IDs, links and accepted attempts. Never reopen alternatives or renumber screens to fit a viewer. If an older manifest uses a different identifier vocabulary, preserve it and declare explicit aliases; do not rewrite it into fabricated canonical history. Source-plan IDs are not restricted to the legacy comparison manifest's Vx-Sn convention.

## Two path bases, one exact destination

Canonical sources are written once to:

```text
<project>/generated/product-design/<journeyId>/<sessionId>/<variantId>/<id>-attempt-<N>.png
```

Image MCP workspace_output_path is relative **below its generated/ directory**, so it omits the leading generated/:

```text
product-design/<journeyId>/<sessionId>/<variantId>/<id>-attempt-<N>.png
```

For journey booking, session review-one, variant guided, screen confirm and attempt 2, request workspace_output_path = product-design/booking/review-one/guided/confirm-attempt-2.png; expectedPath is <project>/generated/product-design/booking/review-one/guided/confirm-attempt-2.png. Passing generated/product-design/... to Image MCP would double the generated/ prefix. These are illustrative destination templates, not bundled files or generated evidence.

Do not hand-derive a path for a call: use the prepared result. prepareSourceAttempt returns {workspace_output_path, save_to_workspace: true, n: 1, expectedPath}. The active generation/**edit** tool schema must explicitly expose workspace_output_path and save_to_workspace. Unknown schemas or imageEdit without the first property block editing even if imageGenerate supports it. Do not assume identical capabilities, switch tools silently, or generate randomly then copy/rename the result into the expected location.

After the call, verify its exact returned absolute workspace path equals expectedPath, stays confined to the project, exists and has valid bytes. A path supplied only by a prompt or copied by hand is not canonical tool provenance. Reject output elsewhere; record the failed/rejected attempt honestly and repair the prerequisite before another bounded attempt. Never use latest-file lookup, another variant's output or a manually copied image as a source attempt. Authorized provided targets/captures may be imported under their separate provenance; import does not make them generated sources.

## Preflight, execute, inspect, persist

Resolve PLUGIN_ROOT two levels above the loaded Skill directory. Use bundled scripts/check-source-artifacts.mjs:

```bash
# Validate declarations and actual files.
node "$PLUGIN_ROOT/scripts/check-source-artifacts.mjs" --project "$PROJECT_ROOT" --plan "$SOURCE_PLAN"
# Review changed specification/context dependencies and affected screens.
node "$PLUGIN_ROOT/scripts/check-source-artifacts.mjs" --project "$PROJECT_ROOT" --plan "$SOURCE_PLAN" --impact
# Verify recorded attempts and files.
node "$PLUGIN_ROOT/scripts/check-source-artifacts.mjs" --project "$PROJECT_ROOT" --plan "$SOURCE_PLAN" --ledger "$SOURCE_LEDGER"
# Prepare one call using the actually exposed tool schema.
node "$PLUGIN_ROOT/scripts/check-source-artifacts.mjs" --project "$PROJECT_ROOT" --plan "$SOURCE_PLAN" --screen "$SCREEN_ID" --attempt "$ATTEMPT" --tool-schema "$TOOL_SCHEMA_JSON" --tool imageGenerate --ledger "$SOURCE_LEDGER"
```

Use --tool imageEdit only for an edit schema exposing the required destination properties. --tool-schema takes tool-schema JSON, not a guess based on another installed version. Read the result and stop on failed preflight, exhausted attempts, occupied destination or unknown capability. The CLI validates/files-checks and returns a prepared destination; **it never calls an image tool, inspects pixels or approves anything**. The agent performs generation/editing after successful preflight, inspects the exact saved image, then persists the accepted/rejected record before its successor starts.

JavaScript integrations import scripts/source-artifacts.mjs. Its API is:

```text
validateSourcePlan(plan)
verifySourcePlanFiles(plan, {project})
sourceDestination(plan, screenId, attempt, {project})
prepareSourceAttempt({project, plan, screenId, attempt, toolSchema, toolName, ledger})
verifySourceRecord(plan, record, {project})
verifySourceLedger(plan, ledger, {project})
sourceImpact(plan, {project})
executeSourceAttempt({project, plan, screenId, attempt, toolSchema, toolName, ledger, generate, inspect, persist})
```

The execute integration wraps the same preflight → generate/edit callback → returned-file verification → inspect → persist sequence, not an approval service. Manual calls have the same obligations; bypassing the wrapper never bypasses the source plan or preflight. Keep existing model, prompt, continuity and bounded-attempt requirements. Successful writes/hashes do not supply visual or semantic review verdicts.

## Append-only records and honest history

Keep source attempt records separate from the frozen plan/manifest in an append-only ledger. Attempts must be contiguous and ordered per screen; no attempt may follow an accepted source. Preserve accepted **and rejected** records with exact path/hash, screen/variant/attempt, inspected path/hash, review findings, timing and tool/prompt/reference provenance. Report unavailable timing/provenance honestly. Source acceptance means recorded inspection accepted those bytes, not stakeholder approval. Open business/state findings remain ineligible. Do not move, rename, overwrite or delete a source when its status changes; use a fresh bounded attempt path and append its review. Derived board copies are presentation derivatives, never additional canonical sources.

For historical continuation, retain old files, hashes, tool responses, choices and gate records unchanged. Older manifests remain readable historical artifacts, not automatically migrated or newly build eligible. An explicit migration map records old/new aliases, paths and hashes and the reason for a new active record. A copy/alias establishes identity only; it cannot manufacture canonical generated-call provenance, a review or human permission. Obtain genuine new reviews/full-set approval for active sources. Never edit historical responses/gates to pretend the tool originally wrote a new destination.

The exactly-three board generator applies to open comparison, not selected-only historical continuation. Present selected sources individually at full readable size with stable ID, purpose, role, nextScreen/End and full-size access. A selected-only viewer may be used only if actually supported; do not pad with fake V1/V2/V3 alternatives, handcraft an app or start a product server as a workaround. Preserve outcome/recovery coverage and explicit ordered full-set approval and G4 boundaries.

## Change impact and phase handoff

Before each source call, source approval, build or QA, compare actual specification/contract/blueprint hashes with the plan and inspect sourceImpact. Changed specifications expose affected sources through specificationIds; changed context requires reviewing linked decisions/scenarios/states/checks. Do not merely refresh hashes and keep old approval. Record revision and impact decisions, revise affected sources when necessary, reinspect exact bytes and renew affected full-set/G4/QA authorization as applicable. Keep unchanged accepted sources and the selected direction; no new competition is implied.

Bind sourcePlan in the workflow request when using this contract. G2 source selection binds its comparison sources; subsequent approvals/build/QA bind only the ordered active set, not obsolete or unselected comparison sources. Source approvals with it require accepted canonical ledger records and verified files for the ordered active set; specification/context dependencies are rechecked at publication/consumption. This extends freshness/traceability, not unrelated gates or explicit provided-target/exact-clone/historical branches. No source-plan check grants human approval or waives G4/G5. Build/QA resolve approved IDs to the same plan, accepted records, actual files and applicable blueprint links, not merely a board screenshot or textual spec.

Continuously challenge Product value, UX continuity, UI fidelity, research confidence, accessibility and feasibility using existing blueprint questions → decisions → screenStates → verifications and gate limitations. Review at material decision/phase boundaries, not through six parallel specifications or a mandatory questionnaire for small discovery. File hashes detect identity/staleness and declared links detect structural coverage; neither proves semantic relevance, truthful pixels, usable design, actual research, feasibility or authenticated consent.
