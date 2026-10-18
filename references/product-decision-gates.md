# Product decision gates

Use these gates for Product Design work. They challenge product value without turning small edits into ceremony.

## Operating rules

- A gate has hard criteria, a weighted quality score, separate evidence confidence, and a verdict.
- A score never compensates for a missing hard criterion.
- Verdicts: pass, conditional, experiment, blocked.
- Confidence: very-low (intuition), low (anecdotes), medium (converging observations), high (structured tests/data), very-high (repeated behavioral evidence).
- Score dimensions from 0–5 and apply weights. Cite evidence; do not invent precision.
- For involved work, write gate records under project-root .gates/. Include verdict, criteria, score, confidence, evidence, assumptions, risks, success criteria, rejected alternatives, next step, and decision owner.
- Tiny static edits, audits, and exact clones use only relevant gates.

## G1 — Brief to journey/visual ideation

Hard criteria: problem/opportunity, target user and context, intended outcome, product/business value, one observable success criterion, material assumptions and constraints, accessible references, review framework, production destination, and design system.

Weights: problem clarity 20; user importance 15; outcome 15; product value 15; measurable success 15; evidence 10; constraints/risks 5; ideation scope 5. Pass at 75+, conditional at 60–74 only with all hard criteria, blocked below 60. An essential dimension below 2/5 blocks.

## Evidence labels

Every involved-work gate must identify whether its evidence is observed user behavior, internal operational data, stakeholder input, external research, inference, or assumption. A prototype walkthrough by the building agent proves execution, not usability or desirability. Stakeholder approval proves decision alignment, not user validation.

For multi-persona services, require a shared service boundary, persona lanes, backstage/system dependencies and handoffs before G2 can pass. For involved work use [product experience method](product-experience-method.md) to trace material supplied feedback through value/responsibility, answered/assumed design questions, Product/UX/UI decisions, scenarios/screens/states and verification. Conditional intent/proactivity/native-output contracts must be explicit before their sources are approved; a generic mention does not satisfy a material requirement.

## G2 — Comparable hypotheses to selected direction

Freeze comparisonContract.scope, evidenceMode and three complete plans before generation. Multi-step requires full-evidence regardless of risk: every planned screen separately for three complete comparable journeys from trigger to outcome and critical recovery. A landing page or three anchors cannot pass multi-step G2. Lean is restricted to explicitly isolated single-screen work. If capacity is insufficient, reduce scope only to another agreed complete scenario or resume; preserve incomplete evidence rather than pass an anchor-only comparison. Multi-screen Image Gen composites fail. Personas are complementary service lanes, never alternative products. Already selected work continues; reusable specialized views do not reopen competition.

G2 journey-selected (multi-step full-evidence) or direction-selected (single-screen) is ready only for selected-screen-production, never build. A complete comparison with source defects may retain a stakeholder choice as verdict experiment under its scope-specific status; verdict pass rejects any ineligible comparison source. This is not approving the faulty source. Incomplete multi-step coverage cannot pass even as an experiment selection record. Preserve source paths/hashes and mode. Selection stakeholder is not UX validation.

## G3 — Complete corrected selected screen set

Reuse the selected complete set. For a historical direction already chosen with incomplete sources, preserve that decision and complete only its missing sources without claiming the previous comparison passed. Correct only faulty sources in versioned files; changed plans require explicit manifest revision. Every required screen including planned recovery must have inspected, readable, composition/business-fidelity accepted source with no open findings. A board page or screenshot alone cannot pass G3. Explicit approval binds exact ordered source hashes. No automatic approval after source completion. screen-set-approved permits build-handoff, not build execution. G4 alone grants explicit prototype build scope.

## G4 — Selected direction to prototype

Require a resolvable selected journey and visual target, hypothesis, evaluation slice, core states, realistic mock data, success criterion, out-of-scope behavior, design-system components, and framework rationale.

## G5 — Prototype to review/handoff

Two independent gates must pass: (1) execution quality: browser evidence, matching viewport/state, interactions, accessibility, responsiveness, no actionable P0/P1/P2; (2) product-test validity: stated hypothesis and success criterion are testable, primary task is clear, data/states are realistic enough, limitations and test scenario are explicit. Fidelity cannot compensate for testing the wrong journey.

## G6 — Validated prototype to industrialization

Assess desirability 20; usability 15; user/product value 20; feasibility 15; viability 10; risk readiness 10; evidence confidence 10. Pass at 75+ with at least medium confidence, no untreated critical risk, written acceptance criteria and product ownership. Otherwise experiment or block.

## G7 — Production readiness

Require applicable tests/checks, auth, data migrations, i18n, observability, secret handling, accessibility, performance, compliance, business acceptance, rollback and post-release measurement. Repository conventions remain authoritative.

## Machine-verifiable records

scripts/workflow-evidence-contract.mjs checks new gates/ideation evidence schemaVersion2; generation manifests remain schemaVersion1 with mandatory comparisonContract.scope/evidenceMode/anchorScreenId and multi-step journey boundaries/recovery IDs. Legacy records are preserved for review, not auto-promoted. G1 has scoreBasis numeric0..5 ratings keyed problemClarity,userImportance,outcome,productValue,measurableSuccess,evidence,constraintsRisks,ideationScope; weights above, essential first5 >=2, total>=60, pass>=75, conditional60..74, experiment permits low evidence with hard criteria complete. Conditions boundary ideation/build/industrialization with disposition resolved/accepted-risk/blocked and detail; unknown phases rejected. Evidence labels explicitly classify provenance.

All gates bind owner, scope, ISO timestamp, exact local evidencePath and SHA256 evidenceHash. G2 binds comparisonScope (multi-step/single-screen), evidenceMode, selectedVariant, manifestFingerprint and selectedAnchorPath/Sha256, readyFor selected-screen-production, screenSetApproved/buildApproved false. G3 binds readyFor build-handoff, screenSetApproved true, buildApproved false. G4 binds readyFor prototype-build, both approvals true. readiness is phase-scoped, not generic ready-to-build.

Ideation evidence binds fingerprint, three ordered candidates, all screens in exact manifest order and fullJourneyCoverage true only for full-evidence multi-step scope. Sources: id/path/sha256/provenance/criticalCopyReadable/buildSourceEligible, review(inspectedPath,inspectedSha256,reviewer,timestamp,composition,businessFidelity,findings[]). Review statuses accepted/changes-required. Findings: id,severity(material/minor),category(business-data/action-state/permission/copy/composition/continuity),detail,evidence,status(open/resolved). Eligibility requires accepted reviews and no open findings. Review is declared evidence, not automatic pixel truth detection.

Selected-screen-set evidence binds manifest/variant, complete ordered sources, approval(owner,timestamp,statement,screenSetApproved,screenSetHash). verifyLocalEvidenceFiles checks actual files/hash/confinement including symlinks. Human identity and rights remain outside structural validation. Transitions write evidence, authoritative gate, optional Beads mirror, scoped readiness in that order; any failure stops downstream writes. A pass label cannot manufacture approval. validateExperienceBlueprint checks a separate v1 blueprint linked to a v1 design contract; it checks declared traceability/conditional boundaries, not useful strategy, human authority or research evidence.
