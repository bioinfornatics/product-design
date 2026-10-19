# Workflows and Gates

## Main loop

```text
router → brief → visual exploration or inspection → build → QA → optional sharing
```

### 1. Route

Load `product-design:index` as soon as the user names Product Design or the plugin. Identify the exact intent: new interface, visual source, clone, redesign, audit, research, saved context, annotation, or sharing.

### 2. Clarify

`get-context` establishes at least the design target and user outcome. It inspects existing context and asks only one focused question when either is missing. For work in an existing app, start with local patterns and the design system.

### 3. Explore or inspect

- `research` produces a source-grounded synthesis of problems and friction; assumptions remain labeled.
- `audit` examines a specific experience from UX, visual design, and accessibility perspectives.
- `ideate` renders exactly three comparable alternatives.
- A reference URL must be captured and opened before any generation or reproduction.

For a multi-screen choice, generate three complete end-to-end journeys, even at low risk: trigger, actions/decisions, responsibility handoffs, outcome, and critical recoveries. A landing page or three anchors are not enough. Scope a useful scenario rather than removing its ending to reduce cost. Reserve lean for explicitly single-screen targets. Generate sources separately, then select, correct the chosen set, and obtain explicit approval before G4. No new competition for a selected direction.

### 4. Build

- `image-to-code` requires a selected source; for a journey, every required screen must have its detailed source.
- `url-to-code` is for faithfully cloning a URL, not redesigning it.
- Use realistic mock data and make the main journey functional.
- Stay in the frontend prototype phase until the user has explicitly requested production implementation.

### 5. Verify

`design-qa` compares every implemented state with its source, at the same viewport and state. Provide both images together, correct visible discrepancies, then recapture. Code inspection alone or an isolated capture is not enough.

### 6. Share

Run `share` only on explicit request. Check the available or saved hosting target, deploy, and test the URL before declaring the prototype shared.

## Quick routing

| Intent | Recommended chain |
|---|---|
| New interface | `index → get-context → ideate → image-to-code → design-qa` |
| Screenshot/mockup/Figma | `index → get-context → image-to-code → design-qa` |
| Faithful URL clone | `index → get-context → url-to-code → design-qa` |
| URL-inspired redesign | `index → get-context → capture → ideate → image-to-code → design-qa` |
| Screen/journey critique | `index → audit` |
| Source-grounded user research | `index → research` |
| Browser feedback | `annotate-inject` if needed, then `annotate` |
| Publishing | add `share` after build and QA |

## Gates

The full specification is `../references/product-decision-gates.md`.

- **G1** requires an actionable brief, value, observable success, constraints, and references.
- **G2** compares three complete journeys at the same scope (or three genuinely single-screen directions) and results in a user choice.
- **G3** requires the plan, all consistent detailed sources, and approval of the full set.
- **G4** scopes the prototype, its states, data, hypothesis, metric, and exclusions.
- **G5** separates execution quality from product test validity.
- **G6** decides whether the evidence justifies production implementation.
- **G7** covers production readiness, including security, data, accessibility, observability, and rollback.

For involved work, write records in `.gates/`. A missing hard criterion blocks progress even with a good score. Document confidence and evidence type; do not present a decision-maker's approval as usability evidence.

## Handoff

The handoff must start with the visible result or prototype URL, clearly state limitations, and suggest one useful next action. Do not overwhelm the user with commands, internal paths, or traces unless they request them or a blocker requires them.

## Evidence-mode contract

Multi-step product ideation requires full-evidence: three complete comparable journeys, each with separately generated screens from trigger to proven outcome and critical recovery. A landing page or three anchors cannot establish journey coverage. Lean is restricted to an explicitly isolated single-screen scope. Already selected directions continue without a new competition; complete their missing journey evidence and correct sources before full-set approval and explicit G4. Personas are complementary. references/design-contract.md separates product/UX/UI and metrics/actions/states. scripts/workflow-evidence-contract.mjs checks gates/evidence schemaVersion2, coverage/review/hash/phase; legacy not auto-promoted. No source with open business findings is build eligible. Source tests are not usability research.

## Product discovery and decision tests

For involved discovery or redesign, [product discovery questions](../references/product-discovery-questions.md) extends the existing brief/blueprint with current alternatives, material value/adoption questions, conditional AI usefulness, technical/safety constraints and a compact decision-test record. Reuse answered context; ask one material blocking question rather than the full grid. Hypothesis, baseline, target/guardrail, owner and continue/change/stop rule stay explicit. No build yet is a valid decision; prototype QA does not prove value, and participant access/consent are separate. Exact clones and tiny edits retain only applicable checks.

See [instruction reliability proposals](instruction-reliability-proposals.md) for executable transition checks, reproducible annotations, leaner loading and optional hooks. These proposals are not active runtime capabilities.

## Experience framing and initiative

For involved product work, [product experience method](../references/product-experience-method.md) connects supplied feedback and discriminating questions to responsibility/value, Product/UX/UI decisions, complete scenarios, intent placement and verification. Keep a useful brief and principal workspace; no decorative dashboard default. Conditional conversation uses in-place responses and preserved context/edits, agents anticipate opportunities and exceptions with bounded preparation/execution, and presentations stay native/editable with distinct app/organization/client brands. validateExperienceBlueprint checks declared traceability and boundaries, not measured UX or human authorization. Changed skills and their evals carry this through brief → ideation → build → QA.

## Executable transition receipts

The brief/ideation/build/QA skills use [executable transitions](../references/executable-transitions.md): publish the relevant request through scripts/check-workflow-evidence.mjs, then consume the same request immediately before the next action. Receipts bind project/scope/operation and current evidence; G2 permits selection continuation, G3 permits G4 handoff, only explicit G4 permits prototype build. Exact clones/provided sources/historical choices keep explicit branches without a new competition. Involved G1 checks remain; discovery-only/audit/setup do not need invented gates.

Before handoff, design-qa.json is canonical, design-qa.md is derived, required states and actual source/render/comparison/interaction hashes are checked, implementation freshness is checked and both G5 results must pass. Blocked attempts and correction history are retained. No completion label or Beads state substitutes for freshly consumed review-handoff readiness. New projects may keep evidence at the canonical workspace root and scaffold into its empty app/ child; do not erase .gates to satisfy bootstrap.

The adapter does not verify human identity, assess pixels, conduct user research, install hooks, mirror Beads through the CLI or authorize production. Those boundaries remain explicit.

## Skill authoring correction

Peer Skills use `load skills product-design:{name}`, not sibling-file links. Shared policies remain canonical at root references/; isolated validation/packaging projects contained local resources with identity/closure checks. No source copies or installed-plugin changes are generated. `validate:authoring` is required in npm test and blocks audit/scenario errors or warnings. See [the authoring/resource contract](skill-authoring.md). This is structural evidence, not behavioral evaluation.
