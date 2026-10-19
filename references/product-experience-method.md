# Product experience method: value, intentions and useful initiative

Read for involved product exploration, multirole services, adaptive/conversational interfaces or experience redesign. Tiny static edits and exact clones use only applicable checks. This method generalizes stakeholder feedback; it does not claim that interviews, historical prompts or productivity measurements exist.

## 1. Separate Product, UX and UI

| Layer | Question to resolve | Inspectable output |
|---|---|---|
| Product | Who benefits, which problem/opportunity matters, why choose this over the current alternative, and what outcome would justify it? | User/responsibility, value hypothesis, current workaround, cost of failure, evidence/confidence, success criterion, constraints and risks |
| UX | What triggers work, what information/decision/action is needed next, who prepares/decides/executes, and how does the user recover and return? | End-to-end scenarios, complementary role lanes, intentions, object/state transitions, direct path, conversational path, handoffs and recovery |
| UI | Which representation and hierarchy make that task understandable, actionable and trustworthy at this viewport? | Principal workspace, prioritized brief, meaningful controls, progressive disclosure, exact copy/data, accessible states and design-system components |

A technology choice or agent architecture does not answer user priority. A dashboard is a representation, not the default product strategy. Calendar facts, missing data, workflow status, editable artifacts and metrics are different data kinds.

## 2. Eight-step workflow

1. **Recover inputs and decisions.** Inspect the provided tables, specifications, references and existing product. Label stakeholder statements, observations, operational data, external research, inference and assumptions. Preserve accepted decisions and authoritative sources. Record contradictions without silently choosing a new strategy.
2. **Frame value and responsibility.** Identify the shared product outcome and each user's responsibility, goal, workaround, cost of failure and useful success signal. Frame Product before UX before UI.
3. **Select a bounded scenario, not a winning persona.** Trace the same objects through complementary roles, from trigger to evidence of outcome and contextual return. Keep covered/deferred scenarios in a product coverage map; a marketing landing cannot substitute for authenticated work.
4. **Define information, action and state contracts.** For each proposed component, specify user question, source/scope/period/freshness, representation, detail/click target, real action/effect, rights, states and recovery. A metric's detail must preserve its definition/population/filter/version. Unknown is not zero; invented charts, dates, versions and dependency arrows are not filler.
5. **Map intentions and initiative.** Decide where each intention is answered and what can be prepared or executed under existing authority. Review opportunities and exceptions. Plan critical ambiguity, late result, manual-edit conflict, revoked rights and unknown-effect states when relevant.
6. **Compare three end-to-end strategies.** Vary orchestration, entry, grouping, progression, handoffs or result presentation, not just palettes or home cards. Generate every planned source separately for all three journeys before completed comparison. If a direction is already selected, complete/correct it instead of reopening competition.
7. **Inspect and approve exact sources.** Compare task usefulness, continuity, business/state fidelity and composition. Trace each material feedback item to a decision, scenario, screen/state and verification, or an explicit defer/out-of-scope rationale. Source defects require pixel revision, not a note. Full source approval and explicit G4 precede code.
8. **Test the task and value hypothesis.** Verify rendered sources and interactions, then evaluate representative tasks with users when available. Report structural checks, source review, agent walkthrough and user research separately. A stakeholder selection or attractive prototype does not prove time saved, desirability, trust or team replacement.

## 3. Questions that change the design

Use this as an analysis lens, not a questionnaire. First reuse answered context and derive a short brief. Ask only the highest-information unanswered blocking question; otherwise state assumptions and the cheapest test. Record question → answer/provenance → design decision → scenario/screen → verification in the experience blueprint.

| Theme | Discriminating question | Consequence for UX / UI |
|---|---|---|
| Users and value | What must this responsibility achieve today; what counts as success, and what does failure cost? | Useful primary task/workspace rather than a role title above generic widgets; testable outcome |
| Work and handoffs | What is blocked, what caused it, who can decide, and what happens after that decision? | Signal → causes → object/project → task/content → decision/action → proven outcome, with preserved context and return |
| Information | Metric, date/window, status or artifact; what source, population, period and detail does it use? | Few defined indicators; compact unavailable-data state; same-scope drill-down and evidence on demand |
| Intent | Understand, filter, compare, prepare, review, authorize or track? | Local explanation, reversible view, temporary comparison, native editor, structured review or status view; keep direct controls |
| Proactivity | Which future opportunity or exception requires preparation now; why now, from which source and with what lead time? | Useful prepared artifact/next step in context, not generic alerts; known/estimated/unknown timing |
| Agent authority | What can be prepared/executed within a mandate; which effects, limits, owner and stop/reconcile conditions apply? | Bounded execution, inspectable result and escalation only when necessary; content approval is not send/delivery |
| Adaptive experience | What remains stable when the workspace changes, and what manual work/context must survive? | Stable navigation/scope, visible view state, reversible filters, explicit return, protected edits |
| Output and brand | Which deliverable, audience, sources and decision; which brand/template actually exists? | Native editable artifact/presentation; app styling distinct from organization/client branding; no invented conformity |
| Validation | What behavior or outcome would falsify our design/value hypothesis? | Representative tasks and recovery states, measurable outcome and explicit evidence, not a polished-dashboard claim |

These are themes to review, not nine equal screen regions. Additional business themes come from the brief. Keep the brief compact; do not expose internal JSON or dozens of fields to a nontechnical user.

For involved discovery, also read [product discovery questions](product-discovery-questions.md): current alternative, frequency and total effort, adoption/viability, conditional AI advantage/error/fallback/safety and technical constraints. Link the highest-impact uncertainty to a compact decision-test record with baseline, target/guardrail, owner and continue/change/stop rule. Do not force all themes into fields/screens or claim a test ran from its plan; disproved value can justify no build yet.

## 4. Intent-to-surface contract (conditional)

| Intention | Useful answer location | Expected effect |
|---|---|---|
| Explain/understand | Short explanation near the object; evidence on demand | Read only |
| Filter/refine | Current workspace with visible interpreted filters and reset/return | View change only |
| Compare/simulate | Temporary central comparison/horizon with sources and uncertainty | No committed business effect |
| Prepare | Native document, table, plan or presentation editor; version, sources and edits preserved | Bounded internal preparation/save, not external send |
| Review/decide | Structured object/version/diff review with consequences and authorized owner | Explicit decision; external command separate |
| Command/execute | Existing action/review surface showing target/version, authority and effect | Eligible authorized effect only; reconcile unknown effect before retry |
| Track/result | Current object/task state and outcome evidence; optional activity/history | Read only; provider accepted is not delivered |

If continuous conversation is requested, keep it accessible without a permanent transcript sidebar. Do not force this shell on every product. Preserve navigation, tenant/responsibility scope, period, filters, selection/object, origin/arrival reason and return. A late answer belongs to its origin and must not take over another view. Keep direct click/keyboard paths alongside conversation. Reserve space and focus behavior; never cover primary controls. Show loading, partial/unknown, canceled, stale, conflict and revoked states with recovery when applicable.

## 5. Proactivity that reduces work

**Product agents:** review both opportunity and exception triggers. Opportunities include a launch, contact window, publication, event, seasonal need or meeting requiring preparation now. Temporal proximity is not a dependency. Use sources and known/estimated/unknown dates. For every in-scope initiative specify source, why-now/lead time, scope, intended value, artifact/action prepared, eligible execution, authority/mandate, limits, owner, attention placement, defer/dismiss, stop and unknown-effect reconciliation. Do not fabricate opportunities: disclose uncertainty or defer that slice.

Prefer preparing or executing eligible work under bounded mandates to endless advice and approval notifications. Keep manual decisions where consequences/authority require them. Group attention at the work object, escalate to a responsible owner only when necessary, expose outcomes/evidence, and provide pause/revoke/inspect. Viewing, filtering or chatting is not implicit command authorization. Do not make the user supervise every run. Team substitution is an ambition to test, not an achieved productivity claim.

**The Product Design assistant:** proactively inspect sources, reuse answers, flag contradictions/data-kind/state errors, recommend the next cheapest discriminating test, and perform the next eligible design step without asking permission already given. Retain selected directions; specialized views remain proposals until accepted. Never silently widen scope, switch provider/model, invent missing facts, mutate app code before G4 or claim research from its walkthrough.

## 6. Native deliverables (conditional)

When business presentations are requested, cover the relevant pitch, kickoff, coordination, client point, committee, operational plan or report scenario. Define audience, purpose/decision, source corpus/snapshot, claim-to-source links, editable native text/tables/charts, review/version, export and external delivery separately. A screen image is a design target, not a native deck. Text baked into PNG slides is not an editable deliverable.

Keep application design system, organization/agency brand and client brand separate. Official template absent means a neutral concept with no conformity claim. Treat untrusted templates as isolated/sanitized inputs, not active code. Rights revocation overrides frozen-meeting convenience; do not promise revocation of downloaded files. Missing tooling means deferred native generation, not a fake completed deck.

## 7. Evidence and traceability boundaries

For involved work maintain an experience blueprint next to the Product/UX/UI contract. Include users/value, answered/assumed/blocking questions, decisions and Product/UX/UI impacts, scenarios and intent placement, conditional initiative/artifact contracts, and checks. Trace each material input to these outputs; deferred areas carry a rationale. validateExperienceBlueprint checks declared IDs, links, evidence labels, no-effect boundaries and conditional contracts, not business truth, useful strategy, human authority or pixels. Legacy design contracts remain v1; the blueprint is a separate artifact, not automatic promotion of historical selections.

| Coverage dimension | Verification |
|---|---|
| Input → question → decision → scenario/source → check | Structural link tests; semantic relevance review |
| Responsibility, value, alternative and opportunity cost | Presence/link tests; stakeholder/user evidence required |
| Intent, no-effect views, edits and contextual return | Structural action boundary; source and prototype review |
| Opportunity and exception, mandate/execution/attention | Conditional checks; semantic usefulness/authority review |
| Native artifact, corpus and brand claim | Conditional checks; runtime/export and brand review |
| End-to-end variations and source fidelity | Existing manifest/evidence checks; visual/semantic review |
| Claimed benefit, usability or team replacement | User/operational measurements, not shape validators |

For actual generated/edited screen files read [source artifacts](source-artifacts.md). Bind authoritative specification file revisions/hashes and the existing contract/blueprint to stable source IDs and their scenario/decision/screenState/verification links. Recheck change impact before generation, approval, build and QA; preserve selected directions and historical files. Continuously challenge value, UX, UI, research confidence, accessibility and feasibility through existing questions/decisions/checks, not six parallel specs or a questionnaire.

## 8. Blueprint shape and example

Write a separate experience blueprint JSON (schemaVersion1) next to the involved-work design contract. Its field names are consumed by validateExperienceBlueprint in scripts/workflow-evidence-contract.mjs. When using this companion, the design contract scenarios also have stable id values; historical v1 contracts without IDs are not rewritten automatically.

- inputs: id, detail, evidenceLabel (observed-user-behavior, operational-data, stakeholder-input, external-research, inference, assumption).
- userValues: personaId, goal, currentAlternative, valueHypothesis, costOfFailure, successCriterion, evidenceInputIds. deferredPersonas: personaId and rationale for each role outside the bounded slice.
- questions: id, theme, prompt, answer, disposition answered/assumed/blocking, inputIds, decisionIds. A blocking question prevents validation; an assumption must be described and tested rather than presented as fact.
- decisions: id, detail, productImpact, uxImpact, uiImpact. These impacts explain the actual design change, not just labels.
- screenStates: id, scenarioId, screenId, state, question, information, primaryAction, resultEvidence, contextReturn, decisionIds.
- verifications: id, scenarioId, criterion, evidenceLevel (proposed, structural, source-review, agent-walkthrough, observed-user-behavior, operational-data), screenStateIds. Claiming a level is not proof of that evidence.
- traceability: one inputId per row; disposition addressed/deferred/out-of-scope. Addressed rows bind decisionIds, scenarioIds, screenStateIds, verificationIds and a matching answered/assumed question. Deferred/out-of-scope rows need rationale.
- features: explicit conversation/proactivity/presentations booleans. Empty intents/artifacts arrays are allowed when those features are absent; do not manufacture an agent or a deck for every product.
- intents (conditional): id, personaId, scenarioId, kind explain/filter/compare/prepare/review/command/track, location, directPath, actionKind read/view/prepare/simulate/command, effect, contextReturn, manualEditsPolicy, lateResultPolicy. Prepare effect is internal. Command adds authority, reviewVersion, effectSummary and explicitActivation true.
- conversation (conditional): continuousAccessRequested, accessible, permanentTranscriptSidebar, directControlsAvailable, stableContext (navigation/scope/period/filters/object/origin/return), focusAndSpace, manualEditsPolicy, lateResultPolicy, revokedRecovery. Continuous access, if requested, is not a permanent transcript sidebar; other products are not forced into that layout.
- proactivity (conditional): triggerReview for both opportunity and exception with disposition in-scope/deferred/not-applicable and rationale; initiatives with id, triggerKind, sourceInputId, personaId/scenarioId, whyNow, leadTime, value, preparedWork, eligibleExecution, timing(status known/estimated/unknown and label), unknownEffectRecovery, mandate(scope/authority/limits/owner/stopCondition), attention(location/dismiss/defer/interruption grouped-context/decision-needed/background-only).
- artifacts (conditional): id, scenarioId, audience, purpose, snapshot, review, version, exportEffect, deliveryAuthorization, contentFormat native-editable, corpusInputIds, claimSources(claim/inputIds), brand(application/organization/client, officialTemplateProvided/conformityClaim booleans). No template means no conformity claim. This describes the native delivery requirement, not proof that export ran.

The fictional executable example is tests/fixtures/experience-blueprint.mjs; experienceFixture returns designContract and blueprint for inspection and tests. It is not operational user evidence, a generated screen set, a native deck or server-authority proof. The validator can reject broken/missing declarations; human and rendered-task review still decides whether the work is useful, data is true and an initiative is actually authorized.
