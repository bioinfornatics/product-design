---
name: ideate
description: Explores three comparable end-to-end product journeys with generated screens before coding. Use for multi-step product ideation, isolated screen directions, or completion and targeted revision of an already selected journey.
---

# Ideate

Use after product-design:index and product-design:get-context have established the brief and G1 is not blocked.

## Critical boundaries

- Do not build, scaffold, start an app server, call Goose Apps, or route to image-to-code before a variant and its complete screen set are approved and explicit G4 build scope is granted.
- Never ask Image Gen to divide one canvas into several screens. Sprite sheets, contact sheets, storyboard images, miniature grids and multi-column composites are invalid.
- For an open multi-step comparison define three complete journeys and generate every planned screen separately in full-evidence, regardless of risk. A landing page or three anchors is not journey evidence. Create three clearly labeled comparison pages.
- Multi-step work selects a complete journey (full-evidence), then explicitly approves the full corrected selected screen set before G4 build handoff. Never reopen already selected directions or treat complementary personas as competing variants.
- Follow ../../references/critical-overrides.md.

## State machine

1. brief-ready
2. variant-journeys-defined
3. variant-screen-plans-created
4. complete-comparison-sources-generated
5. variant-board-pages-created
6. journey-selected
7. screen-set-approved
8. G4-approved-for-build

Record all three plans and exact image paths/IDs in .gates/03-screen-production-plan.md, selection in .gates/02-journey-selection.md, and approval in .gates/03-visual-selection.md. Follow [the deterministic ideation contract](references/deterministic-ideation-contract.md): freeze its canonical manifest before generation, record its SHA-256 fingerprint in G2/G3 and the active Beads task, and keep runtime evidence separate from the frozen manifest.

## Modes

Freeze comparisonContract.scope and evidenceMode before generation. Multi-step is the default and always requires full-evidence: generate three complete comparable journeys from trigger to outcome, with critical recovery, even at low risk. Lean is allowed only for an explicitly isolated single-screen scope with no downstream product journey. Use selectIdeationMode in scripts/workflow-evidence-contract.mjs; never downgrade coverage to save time or image cost. A home/landing reference does not narrow a product brief. Already selected work completes only its missing/corrected sources. If capacity is insufficient, preserve work and report incomplete comparison; agree a smaller complete scenario or resume, never claim three anchors pass.

For multi-step work read [end-to-end journey coverage](references/end-to-end-journey-coverage.md) before planning. Compare coherent interaction strategies, not persona elections or palette variations.

## Experience synthesis before visual planning

For involved work read [product experience method](../../references/product-experience-method.md). Start from the brief/experience blueprint, not a generic dashboard prompt. Map user responsibility and value → scenario → question/information → action/effect → result/evidence → recovery/return. Show how each interaction strategy changes those moments. Keep a compact useful brief and one principal workspace, with progressive disclosure instead of nine equal blocks.

For conversation/adaptation, place explanation, reversible filters, temporary comparisons, native editors and structured reviews where the task belongs; keep direct controls, context, edits and late-answer origin. Continuous conversation, when requested, is accessible without a permanent transcript sidebar. For agents, include future opportunities and exceptions, useful preparation/eligible execution under mandates, limits and attention/stop/reconciliation—not only advice or run-approval feeds. For presentations, plan audience/corpus/snapshot, editable native content and distinct app/organization/client brands; PNG screens are not a native deck.

Before comparison/source approval, check the material feedback-to-decision-to-screen/state-to-verification links. A missing material design consequence is a gap to resolve or explicitly defer, not a solved issue because a generic paragraph mentions it.

## Common preflight

1. Freeze user/context, entry trigger, exact start and end, scenario/data, success criterion, evidence, design system, platform and viewport.
2. Inspect supplied visual references directly. Stop if a named source is inaccessible.
3. For multi-persona services, reconcile persona and backstage journeys in a service blueprint first. Keep a product coverage map (responsibility × scenario × journey moment), label covered/deferred areas and iterate complementary journeys before the requested product build; never claim one scenario covers the whole product.
4. Reuse exact dates and common data consistently.
5. Match image aspect ratio to the target using model capabilities. For desktop web at 3:2, use 1536 x 1024 for GPT Image 2 and 1152 x 768 for MAI Image 2.5 or Flash. An explicit override wins only when supported and same-ratio; otherwise fail with supported same-ratio alternatives. Unknown models require explicit capabilities. Use portrait only for mobile.
6. Request low quality when supported; otherwise omit it. Freeze enhancement on/off in the manifest and keep it identical in comparisons.

## Planning and phase status

For involved multi-phase work, apply [planning-aware routing and optional tracking](../../references/planning-and-tracking.md). At each transition, keep the epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task clear. Mirror this through `product-design:project-status` only for explicit tracking, an applicable existing `.beads/`, or a confirmed vocabulary-only offer. Never hold ideation on tracking bookkeeping.

# Multi-step workflow

## 1 — Define exactly three candidate journeys

Create three meaningfully different interaction strategies against the same frozen contract. For each define thesis, advantage, complete happy path, decisions, progressive disclosure, critical recovery, assumptions, risk, cheapest experiment, and a minimum ordered inventory of normally 3–6 screens. Do not vary only visual style.

For every screen record before generation: stable variant-local ID such as V1-S1, name, purpose, user question, entry state, journey moment, exact visible content/data, actions, material validation/error/recovery, exit and next screen, shared shell/components/assets, and required/optional/recovery status.

Write all three complete plans, anchorScreenId and journey(startScreenId,outcomeScreenId,criticalRecoveryScreenIds) before comparison generation. Generate every required screen, including the outcome and planned critical recoveries, before asking for a journey choice. The anchor is a continuity/reference screen, not a coverage shortcut. Selected continuation does not create a new competition.

## 2 — Generate every variant screen separately

Every Image Gen call produces exactly one full-size screen image. Never generate a board or several screens in one result.

- Run up to three isolated variant workers concurrently: V1, V2 and V3 may progress in parallel. Inside each variant, generate screens strictly sequentially (S1 → S2 → …) so accepted prior screens anchor continuity.
- Give each worker a distinct output directory and variant-only plan. Workers must not edit shared board files or another variant directory.
- Use only the exact path returned by each generation call. Never scan for a latest file, infer a filename, or copy from a shared directory. Verify the path stays inside the assigned variant directory, inspect it, hash it, and persist the attempt before starting its successor.
- Reject duplicate hashes across screen IDs. Use bounded attempts from the manifest, and resume accepted screens from their persisted exact returned paths after interruption. Record provider timing, orchestration timestamps, and prompt provenance.
- After all mode-required workers finish, the parent verifies outputs and assembles pages in deterministic V1, V2, V3 order, never completion order.
- If delegation is unavailable, process V1 then V2 then V3 sequentially with the same per-variant contract.
- The first accepted screen anchors that variant. Later screens preserve its shell, typography, tokens, imagery, anatomy and exact common data.
- Inspect every saved result before continuing; regenerate only the conflicting screen.
- Never silently add, remove or reorder steps.
- Reject portrait or mobile-looking output for a frozen desktop-web target.

### Per-screen prompt

Create only full-size screen [VARIANT/SCREEN ID — NAME] for candidate [VARIANT NAME]. Generate one [TARGET SIZE/ASPECT] image matching [PLATFORM AND VIEWPORT]. Do not show another journey step or create a storyboard, sprite sheet, contact sheet, grid, columns, board, device frame or alternate direction.

Include responsibility/value, the user question/intent and task-shaped workspace, candidate thesis, start/end context, purpose, entry, exact data/source/unknowns, primary action and real effect, supporting/recovery states and exit/return. When applicable, specify useful prepared work, why-now/lead-time and mandate limits; do not invent delivery/result claims. Preserve the accepted visual anchor and design-system language. For desktop web, preserve a landscape desktop composition, desktop navigation and content density; never reinterpret it as a narrow mobile layout.

## 3 — Create exactly three journey-board pages

After all planned sources exist, create one separate board page per variant showing the complete ordered flow and explicitly labeled recovery branches. A source missing from any compared journey blocks completed comparison. These are presentation artifacts, not generated UI images or product prototypes.

Prefer: (1) the requested collaborative board tool when available; (2) available Figma/FigJam, Miro or equivalent capability; (3) three standalone local HTML pages requiring no app scaffold or product server.

Every page must:

- reference the separate full-size image files; never redraw or composite them through Image Gen;
- arrange one journey in an unambiguous numbered flow with stable IDs, short labels and connectors;
- preserve native aspect ratios and enough width/zoom to inspect each web screen;
- use a wide scrollable canvas or spacious wrapped flow, never N equal narrow columns;
- label main-path and critical-recovery sources; display each source nextScreen or End outside the image, never imply a recovery screen follows the success screen just because it was generated later;
- place thesis, assumptions, risk, advantage and recovery notes outside images;
- carry concise Product/UX/UI tradeoffs, covered user responsibilities/scenarios, applicable intent/initiative behavior and traceable material feedback/check IDs outside images;
- remain comparable with the other pages.

For the HTML fallback, carry nextScreen and journeyRole (main-path or critical-recovery) per source into the presentation derivative. Write a JSON manifest matching `scripts/build-journey-board.mjs` and run it with `--input <manifest> --output <review-dir>`. The dependency-free generator creates an index plus journey-1.html, journey-2.html and journey-3.html, copies the separate images with relative image references, and provides zoom, drag-to-pan and full-screen image inspection. Do not handcraft pages when this bundled generator is available. For local review, run `scripts/serve-journey-board.mjs --root <review-dir>`, verify the returned URL, and open it with the available browser. This is a browser preview, not proof of an embedded Goose Desktop WebView. Do not claim native in-chat rendering unless such a viewer tool is explicitly exposed.

Reject a page if images are cropped, stretched, tiny, reordered, missing or presented as narrow mobile-like columns. Fix page layout, not source images, unless an image violates its own contract.

## 4 — Present pages and stop

Number variants by displayed page order. Link every board page and provide full-size access to its individual screen images. Save complete G2 evidence and ask which complete journey to develop (or which isolated screen direction for single-screen scope). Or tell me what to change in the flows.

Do not build or route to image-to-code.

## 5 — Approve the selected screen set

When the user selects N:

1. Resolve N against displayed board pages.
2. Preserve the selected direction. Reuse the selected complete set. For a historical already selected direction with incomplete sources, generate only its missing screens sequentially and disclose that the earlier comparison was incomplete; do not invent completed alternatives or force a new competition. Correct only faulty sources in versioned files.
3. Record selected page path/URL, image paths/IDs, confidence and assumptions.
4. Verify end-to-end coverage and continuity of shell, data, actions, terminology and states.
5. Present and embed every selected screen once at full readable size.
6. Ask only: Do you approve this complete screen set for build, or which screen IDs should I revise?

Do not regenerate merely because the journey was selected. For one-screen feedback, regenerate only that image and update its board reference. For a changed journey, explicitly revise its plan, required images and page.

After explicit full-set approval and G4 handoff, route to image-to-code.

## Fair cross-model benchmark

Benchmark one canonical screen entry at a time in isolated directories. Send identical canonical prompt, visual contract, references, target ratio, attempts, and enhancement setting to every model. Pixel dimensions may differ only through the model-aware same-ratio mapping. Record exact returned path; configured, requested, resolved, and effective deployment and model; explicit width, height, and ratio; input and effective prompt provenance; SHA-256; separate provider and end-to-end timings; explicit usage and cost availability; and the shared side-by-side artifact location. If any condition or required evidence differs, record `claimAllowed: false` and make no comparative claim. Do not mutate official artifacts. Live parallelism evidence remains blocked on a published image-mcp version newer than `@bioinfornatics/image-mcp@0.2.1` that exposes every required observability field; see the deterministic contract for the exact release dependency.

For a three-lane versus fifteen-wide experiment, compare measured provider and end-to-end timings, orchestration overhead, rate-limit/retry events, collisions, and continuity scores. Explicitly accept or reject fifteen-wide from evidence; target under 30 human minutes when capacity allows.

# Single-screen exception

Generate three independent directions for the exact same screen, content, state, viewport and constraints. Each result contains one direction only. Use the target platform aspect ratio, wait for source selection/approval and explicit G4 for that isolated scope, then route the selected result. A single-screen approval never expands to a downstream product journey.

# Shared rules

- Stop and name the blocker if image generation is unavailable.
- Parallelize independent variants when delegation is available, but keep image calls sequential within each variant because continuity depends on accepted prior results.
- Attach only references actually sent.
- Never substitute generated imagery for design-system controls.
- Preserve constraints, dates and realistic readable product sizing.

Comparison completion requires three complete journeys in full-evidence, labeled pages and explicit selection. Lean compares exactly three isolated single-screen directions only. Ready-to-build always requires a complete corrected selected set with explicit ordered-source approval and G4 handoff. No automatic approval after source completion.

## Product, UX, UI and trusted sources

For involved work read [design contract](../../references/design-contract.md). Product value/invariants precede UX scenario/information/actions/recovery, which precede UI hierarchy/components. Responsibilities are complementary, not alternatives. Calendar facts and unknown budget are not performance KPIs. Do not invent numbers, artifact versions, sources or dependency arrows. A specialized view may coexist with the selected home.

Review composition, readable critical copy AND business/state fidelity against the frozen corpus. Known material errors block approved source eligibility; a direction may remain selected while its source needs correction. Record exact path/hash/reviewer/timestamp and categorized findings. Changing a note does not repair pixels. Run validateIdeationEvidence(evidence, manifest), verifyLocalEvidenceFiles(sources, {root}) and validateScreenSetEvidence before source approval. Gates/evidence use schemaVersion2; generation manifests stay schemaVersion1 with mandatory comparisonContract.scope, evidenceMode and anchorScreenId; multi-step variants also require journey boundaries and critical recovery IDs. Legacy records are not automatically promoted.
