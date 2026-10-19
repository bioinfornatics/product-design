# Product Design — Agent Instructions

This repository contains the Goose **product-design** plugin. It turns a brief, URL, or visual source into journeys, runnable prototypes, reviews, and handoffs. This documentation describes only the components actually versioned here.

## Authority and scope

- Follow the user's request first, then the repository instructions and the active skill's instructions.
- The frontmatter and body of each `skills/*/SKILL.md` file form the skill's execution contract.
- `references/critical-overrides.md` and `references/communication-protocol.md` apply to all Product Design work.
- For an existing application, follow its own `AGENTS.md`, design system, and conventions before the plugin's defaults.
- Do not present an optional capability as built in. Browser, image generation, Figma, hosting, and Beads depend on the tools available in the session.
- Do not modify code or workflow contracts based only on this summary: read the relevant files.

## Actual architecture

The plugin is declarative and skill-driven:

```text
plugin.json
  ├─ skills/                  contracts executed by Goose
  ├─ references/              cross-cutting rules and gates
  ├─ templates/               Vite, Next.js, Nuxt, and Astro starters
  ├─ assets/annotate/         annotation overlay ports
  ├─ assets/beads-formulas/   optional phase tracking
  ├─ scripts/                 bootstrap and validators
  └─ tests/evals/             versioned integration cases
```

After installation, Goose qualifies skills with `product-design:`. Directories and their frontmatter keep unqualified names.

### Skills

| Skill | Responsibility |
|---|---|
| `product-design:index` | Entry point and router; load when Product Design or the plugin is explicitly named |
| `product-design:get-context` | Establish the brief, design target, and user outcome |
| `product-design:user-context` | Read or save persistent references and preferences |
| `product-design:research` | Source-grounded UX research on problems and friction |
| `product-design:ideate` | Compare generated journeys or visual directions |
| `product-design:audit` | UX, visual design, and accessibility critique of an existing experience |
| `product-design:image-to-code` | Faithfully implement an approved visual source |
| `product-design:url-to-code` | Faithfully clone a URL into a runnable local frontend |
| `product-design:design-qa` | Compare the coded rendering with its visual source |
| `product-design:share` | Deploy only on request and return a verified URL |
| `product-design:annotate-inject` | Add annotation to a compatible existing project |
| `product-design:annotate` | Process pending annotations on a running project |
| `product-design:project-status` | Optional Beads tracking, never a gate or dependency |

## Routing and canonical workflow

```text
index → get-context → research / audit / ideate
                    → image-to-code or url-to-code
                    → design-qa
                    → share, only if requested
```

Not all work goes through the entire chain. The router selects the specialized skill; it does not do that skill's work on its behalf.

- New interface without a reference: clarify, produce three options with `ideate`, wait for a choice, then build.
- Selected screenshot, mockup, or Figma frame: `image-to-code`, then `design-qa`.
- “Clone this URL”: capture the source, `url-to-code`, then `design-qa`.
- “Redesign” or “make something like this URL”: capture the source, ideate, wait for selection, then build.
- Experience audit: `audit`. Source/render comparison: `design-qa`. Do not confuse them.
- Research into a user problem: `research`, with sources and a distinction between facts and inferences.
- Deployment: `share` only if the user asks to publish, host, or share.

### Design and build invariants

- **No visual target, no build.** A complete brief does not replace visual selection.
- A multi-screen choice requires three complete end-to-end journeys before selection, even at low risk. A landing page or three anchors are not enough. Reserve lean for explicitly single-screen targets; use individual images, never composites.
- After selection, complete/correct only the selected set, then obtain explicit hash-bound approval and a G4 handoff. A journey board alone is not enough.
- For a genuinely single-screen target, compare three directions for the same screen, keeping content, state, and constraints constant.
- In an existing product, inspect analogous screens, components, tokens, styles, and interactions first. Reuse before inventing.
- A prototype validates the frontend and journey using realistic mock data. Do not add a backend, real authentication, schemas, migrations, services, or integrations without an explicit production-phase request.
- Main-journey interactions must work. Peripheral controls may remain visual-only if clearly out of scope.
- Never simulate visible assets with emoji, ASCII, text, placeholders, CSS art, or handcrafted SVGs. Reuse the source, an icon library, or an available image-generation tool.

## Decision gates

The normative definition is `references/product-decision-gates.md`. For involved work, record decisions in `<project>/.gates/` with criteria, score, confidence, evidence, assumptions, risks, rejected alternatives, next step, and owner.

| Gate | Transition |
|---|---|
| G1 | Brief → journey/visual ideation |
| G2 | Three complete journeys → selected journey, not build |
| G3 | Selected journey → approved detailed screen set |
| G4 | Selected direction → prototype |
| G5 | Prototype → review/handoff, with execution quality and test validity kept separate |
| G6 | Validated prototype → production implementation |
| G7 | Production readiness |

A score never compensates for a missing hard criterion. Verdicts are `pass`, `conditional`, `experiment`, or `blocked`. Do not confuse stakeholder approval, technical execution, and user validation.

## Templates and framework

- `templates/prototype/`: Vite + React, the default for a throwaway review.
- `templates/nextjs/`: Next.js when Next behavior actually needs validation.
- `templates/nuxt/`: Nuxt.
- `templates/astro/`: Astro.
- Resolve the framework with `get-context` before scaffolding.
- Create a prototype with `scripts/bootstrap-prototype.mjs`, then install from the generated root.
- All four templates already include the annotation overlay. Do not run `annotate-inject` on a generated starter.
- `templates/*/AGENTS.md` files are copied into the project and provide local prototype instructions.

## Annotations

The mechanism is local to the generated or injected project: browser overlay, development endpoint, and files under `<project>/.goose/annotations/`.

- Use `annotate-inject` only for a user project that does not already have the mechanism.
- Detect the framework and use the corresponding port in `assets/annotate/{vite,nextjs,nuxt,astro}/`.
- Mount the overlay client-side and only in development. New ports and Next.js/Nuxt/Astro use `goose-annotate` without underscores; the current Vite middleware/template is a documented legacy `/__goose-annotate` exception pending coordinated migration. Never use an underscore-prefixed Next.js route folder or rename only one side of a working port.
- Actually verify development mode (request accepted and file written) and the production build/server (endpoint absent or refused).
- With `annotate`, process the inbox from oldest to newest. Reproduce the route and viewport, capture and crop the bbox, make the targeted change, recapture, then move the record to `processed/`.
- For a non-trivial change or the last cycle before handoff, run `design-qa` again.
- The agent starts or reuses the server and verifies the review URL; do not delegate these commands to the user.

## User context and privacy

Persistent context is optional and local to Goose, under `$GOOSE_HOME/.local/state/product-design/` by default (usual Goose home: `~/.config/goose`). Read `skills/user-context/SKILL.md` before any operation.

- If `user-context.md` exists, use it as a default anchor without confusing it with the current brief.
- Initialization and preflight use the skill's compiled TypeScript scripts; do not invent storage in the project repository.
- Copy saved images into the user-context's `assets/` subdirectory, using descriptive names, and reference them from Markdown.
- Keep a small number of high-value references. `status: not provided` means missing information, not a preference.
- Never persist secrets, credentials, API keys, private tokens, copied client data, or content that should not survive the session.
- Respect the user's chosen browser. Ask before using Playwright directly if it is not the browser authorized by the context or request.

## Verification and evidence

- A capture alone is not QA. Compare source and rendering in the same input, at the same viewport and state; correct, then compare again.
- Do not claim QA without a rendered capture, a ready server without a verified URL, or sharing without a working deployment URL.
- Verify main states, navigation, responsiveness, applicable accessibility, and the absence of P0/P1/P2 issues before handoff.
- If a required capability is missing, report a precise blocker instead of fabricating a result.

## Security

- Do not expose or write secrets in the repository, captures, annotations, traces, or user-context.
- Do not perform destructive actions, deployment, or production integration without explicit authorization.
- When cloning a URL, reproduce the requested frontend; do not copy private data or bypass authentication.
- In an existing project, preserve infrastructure and limit changes to the agreed scope.
- Evaluation traces may contain conversations or runtime data: keep them in ignored `evaluations/` or `*-workspace/` paths, never commit them.

## Tests and contribution

Before proposing a change, run from the root:

```bash
npm test
# or separately
npm run validate:workflow
npm run validate:skills
npm run validate:plugin
```

- `validate:workflow` checks journey invariants and eval files.
- `validate:skills` validates each skill frontmatter with the official validator.
- `validate:authoring` audits source/contained-projection Skills and every scenario set, failing on errors or warnings; resource closure and exact runtime peer names are checked.
- `validate:plugin` stages the bundle, then validates Agent Plugins and Goose schemas.
- Add or update evals when a skill's observable behavior changes.
- Keep skill names unqualified in directories/frontmatter and use `product-design:<name>` in usage documentation.
- Synchronize skills, references, templates, tests, and documentation when a shared contract changes.
- Do not modify generated artifacts or `node_modules`. Do not commit without an explicit request.
- Limit the diff to the task, preserve the existing Markdown style, and check `git diff --check` and `git status`.

See also: `docs/architecture.md`, `docs/workflows.md`, `docs/operations.md`, and `docs/contributing.md`.

## Evidence-mode contract

Multi-step product ideation requires full-evidence: three complete comparable journeys, each with separately generated screens from trigger to proven outcome and critical recovery. A landing page or three anchors cannot establish journey coverage. Lean is restricted to an explicitly isolated single-screen scope. Already selected directions continue without a new competition; complete their missing journey evidence and correct sources before full-set approval and explicit G4. Personas are complementary. references/design-contract.md separates product/UX/UI and metrics/actions/states. scripts/workflow-evidence-contract.mjs checks gates/evidence schemaVersion2, coverage/review/hash/phase; legacy not auto-promoted. No source with open business findings is build eligible. Source tests are not usability research.

## Product discovery and decision tests

For involved discovery/redesign, read `references/product-discovery-questions.md` through the focused skill. Current alternatives, user value, adoption/viability and conditional AI/technical/safety questions feed the existing blueprint/gates, not a new required schema or questionnaire. Prioritize one material uncertainty and record hypothesis, baseline, outcome/guardrail, owner and continue/change/stop rule. No build yet is valid; a test plan is not a conducted study or measured value. `docs/instruction-reliability-proposals.md` distinguishes implemented corrections from unactivated runtime annotation, execution and hook proposals.

## Experience framing and initiative

For involved product work, [product experience method](references/product-experience-method.md) connects supplied feedback and discriminating questions to responsibility/value, Product/UX/UI decisions, complete scenarios, intent placement and verification. Keep a useful brief and principal workspace; no decorative dashboard default. Conditional conversation uses in-place responses and preserved context/edits, agents anticipate opportunities and exceptions with bounded preparation/execution, and presentations stay native/editable with distinct app/organization/client brands. validateExperienceBlueprint checks declared traceability and boundaries, not measured UX or human authorization. Changed skills and their evals carry this through brief → ideation → build → QA.

## Executable transitions

Focused skills now require scripts/check-workflow-evidence.mjs publication and fresh --consume at brief/selection/source/build/review boundaries; references/executable-transitions.md owns the schema and branch contract. Canonical design-qa.json derives design-qa.md; failed and blocked attempts preserve history and do not grant readiness. D is implemented in source; annotation migration, efficiency refactoring and hooks remain proposals. No installed-plugin update is implied.

## Skill loading and canonical resources

Invoke peer Skills with `load skills product-design:{name}` using the actual name. Never substitute sibling SKILL.md reads. Root references/ is canonical; source Skills declare PLUGIN_ROOT/references/... and require the complete plugin. scripts/skill-resource-contract.mjs generates contained projections only in isolated temporary stages and verifies source/derived hashes. Do not edit generated projections or duplicate source policies. See docs/skill-authoring.md.
