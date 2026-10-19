---
name: get-context
description: Clarifies the product target, intended user outcome, and applicable brief evidence. Use when preparing Product Design ideation, redesign, or UI build work; discovery-only work may end without a build.
---

# Get Context

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.


Run this skill at the start of Product Design requests that ask to design, build, prototype, clone, redesign, extend, or generate product UI directions.

Start by recovering supplied tables, specs, references and existing decisions. Resolve Product (users/value) before UX (scenario/information/actions) before UI (representation/hierarchy); framework and visual tooling support those decisions, not the reverse.

The universal minimum to recover is:

- what product, site, feature, workflow, component, or screen is being designed, redesigned, or extended
- what the feature, change, app, or website should help the user do

Do not re-ask answered questions. Target and outcome are the universal minimum, not the whole involved-work brief. When the applicable checks below are resolved and G1 is not blocked, play back the brief and defaults in one pithy note, name the next workflow, and continue in the same turn. Playback is not a request for approval. The user can course-correct style, scope, or interactivity at any point.

Hard boundary: do not implement UI, scaffold a prototype, start a server, or create files while the design target or intended user outcome is still missing.

## Responsibility, value and experience framing

For involved product work read product experience method at `PLUGIN_ROOT/references/product-experience-method.md` before technical detection. Use its discriminating question themes as an internal analysis lens, not a questionnaire. Recover user responsibility/goal, current alternative, value hypothesis, cost of failure and observable success. Link important supplied feedback to answer/provenance, Product/UX/UI decision, scenario/screen-state and verification, or explicitly defer it with rationale. Keep one principal workspace and a compact useful brief; reveal calendar, capacity, recommendations, evidence and activity progressively rather than as equal dashboard blocks.

When conversation, agents or presentations are in scope, classify intentions and their useful answer location, future-opportunity AND exception triggers, eligible prepared/executed work under bounded mandates, attention/stop/reconcile behavior, and native editable outputs with source/brand boundaries. Do not treat proactivity as only warnings, or make humans approve every run. The assistant itself should inspect, synthesize, warn on contradictions and propose/perform the next eligible design step without re-asking answered inputs.

Produce an experience blueprint for involved work; validateExperienceBlueprint(blueprint, designContract) verifies declared links and conditional contracts, not UX research, human authorization or source truth. Tiny edits and exact clones do not require this artifact.

## Decision-changing questions

For involved work read product discovery questions at `PLUGIN_ROOT/references/product-discovery-questions.md`. Review problem frequency, current alternative, total user effort, adoption/viability and technical/data constraints; when AI is part of the product also review its advantage over direct/rule-based controls, acceptable errors, abstention/fallback, cost/latency and authority/safety. Reuse answers rather than asking the whole grid. Prioritize the material uncertainty that changes the next decision, then ask one blocking question or propose the cheapest test. Explicitly recommending no build yet is a valid outcome when value or safe feasibility is contradicted; an exploration request does not authorize rendering. Record hypotheses and unknowns without claiming validation.

For a material value hypothesis define the current alternative, observable outcome, baseline measure, target/guardrail, test owner and continue/change/stop rule. Unknown thresholds or participant access may be deferred before ideation under an explicit experiment, but must be resolved before claiming a user study is executable or G6 is passed. Reuse the existing blueprint question/verification links and gate record, not a new compulsory schema.

If the requested work is problem/value exploration, or the supported decision is defer/change/no build yet, return the compact decision and next test before framework detection or visual generation. If UI exploration remains warranted, continue through the applicable G1 checks below; a complete brief alone still does not authorize build.

## Framework and Design System Detection

Resolve these two before handing off to `product-design:ideate`/`product-design:image-to-code`/`product-design:url-to-code`, alongside the design target and outcome — do not leave them implicit and default to the bundled Vite template without checking.

**Framework.** If the target is a new prototype:

- If an existing project is already present (an existing codebase, not a fresh empty folder), detect its framework from config files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `vite.config.*`) and build within it — do not scaffold a separate template. Follow existing codebase edits at `PLUGIN_ROOT/references/existing-codebase-edits.md`.
- If there is no existing project, distinguish the **review prototype framework** from the **production destination**. Ask which framework to scaffold only if the context makes it ambiguous. Otherwise default to bundled Vite + React for disposable review, including Servier/DNA work whose accepted production destination will later be Next.js via `difa-web-framework`; this minimizes startup and iteration overhead. Name both targets in the brief playback. Treat the later Next.js implementation as a deliberate reimplementation, not an automatic code migration. If SSR, routing, middleware, auth, server actions, or App Router behavior is itself under test, prototype directly in Next.js. Supported bundled frameworks: Vite (default), Next.js, Nuxt, Astro.

**Design system.** Ask or check, in this order, before build starts:

1. **Is there an existing design system?** Check saved user context (`product-design:user-context`) for a recorded design system, codebase paths, Storybook, or component refs. If a plugin exposes one, use its real components. For Servier/DIFA, load `servier-webapp:dna-in-prototypes`, then the required qualified tier skills (`servier-webapp:dna-atoms`, `servier-webapp:dna-molecules`, `servier-webapp:dna-organisms`, `servier-webapp:dna-tokens`). Honor its React compatibility gate before accepting the framework choice.
2. **If no design system is in use, are there tokens or a palette to use?** Reuse provided tokens, palette, Figma or brand assets. Ask only if a genuinely blocking brand constraint is unresolved; otherwise label neutral prototype styling as an assumption, not official brand conformity. Use whatever is provided as grounding for `product-design:ideate`'s Image Gen calls and for any hardcoded colors/spacing/type in the build.
3. **If neither exists,** say so plainly and use explicitly provisional neutral styling. Compare distinct interaction strategies across complete journeys; palette differences may be secondary, never the only ideation axis. Do not skip ideation or imply official brand conformity.

Do not skip straight to build. Inspect existing framework/brand constraints first; name provisional defaults only when they do not contradict the brief. Ask one focused question only for an unresolved material blocker, rather than making framework or palette a repeated questionnaire.

## Evidence and UX-research gate

Before journey ideation, classify every important input as one of: observed user evidence, stakeholder input, inference, or assumption. Never describe stakeholder approval, an LLM-generated journey, a polished mock, or a successful usability walkthrough by the agent as UX research.

For a new service or a request spanning several personas, roles, or backstage operations:

- Define the shared service boundary and the cross-role outcome.
- Load product-design:research when user problems, terminology, policies, handoffs, or current workflows are not evidenced and suitable sources are available.
- When source access is unavailable, proceed only as an explicit hypothesis/experiment and include a research plan; do not label the resulting persona or journey as validated.
- Create one service blueprint covering user-facing and backstage lanes before selecting a single prototype slice.
- A stakeholder may choose the first slice, but that choice does not validate unmet needs, desirability, or usability.

## Product Value Gate

Before ideation, apply G1 in product decision gates at `PLUGIN_ROOT/references/product-decision-gates.md`. For involved work establish problem/opportunity, target user/context, intended outcome, product value, observable success criterion, confidence, assumptions, constraints, review framework, production destination and design system; write `.gates/01-brief-to-ideation.md`. Score cannot compensate for missing hard criteria. Weak evidence leads to `conditional` or `experiment`; a missing outcome or success criterion is `blocked`. When blocked, ask **exactly one** focused question in the current turn: choose the question with the highest expected information value, combining problem, context, outcome and observable success into one compact answer frame when several are missing. Do not emit a questionnaire or several numbered questions.

## Executable brief handoff

Before starting visual exploration, read executable transitions at `PLUGIN_ROOT/references/executable-transitions.md`, prepare the evidence workspace/request and run `scripts/check-workflow-evidence.mjs` with operation `brief-to-ideation`; then run the same request with `--consume` immediately before ideation. Require a passed receipt for this project/scope, including applicable G1/design-contract/blueprint checks. A blocked command stops exploration. This does not authorize scaffolding. Discovery-only/no-build, setup-only and experience audits do not need an invented ideation receipt. Exact clone/provided-source work uses its source/build transitions instead of a new G2 competition.

## Critical Overrides

- Before proceeding, use `load skills product-design:index` for routing.
- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## User Context

Saved user context is optional. Use the instruction `load skills product-design:user-context` only when the user asks to save/recall context or a configured Product Design state directory is known to contain relevant context.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Planning and phase status

For involved multi-phase work, follow planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md`. At brief handoff, identify the epic/outcome, G1 phase gate, acceptance criteria, dependencies, ready or blocked state, owner, evidence, and next task. Explicit tracking or an applicable existing `.beads/` routes to `product-design:project-status`. Planning vocabulary alone requires an offer and confirmation before changing Beads, without delaying handoff. Skip tracking offers for simple one-shot work.

## Handoff To The Next Workflow

1. When the next workflow is already clear, use the instruction `load skills product-design:{name}` for that exact next workflow before sending the brief playback. Do not substitute a sibling SKILL.md read or only name a Skill you have not loaded.

2. Before executing `product-design:ideate`, `product-design:url-to-code`, or `product-design:image-to-code`, play back the minimum brief and any defaults in one pithy user-visible note.

3. If the applicable brief is resolved and G1 is not blocked, continue to the next workflow in the same turn. Do not wait for playback confirmation; source approval and G4 remain separate. If the user provides feedback, incorporate it and course-correct.

4. Before starting an involved app, prototype, clone, redesign, or build, send one short expectation-setting note and continue. Example:

```text
This kind of build usually takes about 10-15 minutes, and ambitious ones can take longer. Good moment to grab coffee or tend to something else; I’ll keep moving and bring the prototype back when it is ready.
```

Do not send this note for tiny static changes, quick audits, simple research, setup-only, or share-only requests.

For multi-step work, the brief playback must also state the exact journey start boundary, end outcome, common scenario/data, and the frozen scope and evidenceMode: multi-step requires full-evidence for three complete journeys regardless of risk, from trigger through outcome and critical recovery; lean is reserved for an explicitly isolated single-screen target. Then require the complete corrected selected set for explicit approval. Never propose composite multi-screen images.

For a design handoff, done means supplied inputs and decisions are recovered; user responsibilities/value and material question-to-Product/UX/UI consequences are traced when involved; conditional intent/proactivity/native-output contracts are explicit; target user/context, problem, outcome, product value, observable success criterion, framework/design-system decisions, assumptions and confidence are explicit; G1 has a verdict where applicable; the journey boundary and shared scenario are frozen when applicable; defaults have been played back; and the next Skill has been loaded through the explicit instruction. For a discovery-only or no-build decision, done instead means the current alternative, evidence/counterevidence, material uncertainty, decision and next test are explicit; do not require a framework, generated sources or a fictitious ideation gate.

## Product / UX / UI contract

For involved work read design contract at `PLUGIN_ROOT/references/design-contract.md`. Preserve answered context and existing decisions; personas are complementary responsibilities, not alternatives. Separate product problem/value/invariants, UX scenario/actions/handoffs/return/states and UI hierarchy/components. Define data kind/metric/version/scope/detail/zero-vs-unknown contracts before prompts. Technology does not define the first action. Full-evidence is mandatory for multi-step product work, even at low risk. Do not reinterpret a product request as a single landing page. Keep a product coverage map of responsibilities, scenarios and journey moments, with explicitly covered/deferred areas; one scenario is not the whole product. Frame a bounded end-to-end scenario rather than dropping downstream screens; insufficient generation capacity means incomplete evidence and a precise blocker, not a passed comparison. Already selected work needs completion, not a new comparison. A missing truly blocking fact triggers one focused question; otherwise explicit assumptions allow an experiment.
