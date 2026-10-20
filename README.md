# Product Design (Goose Plugin)

> Goose port maintained at [bioinfornatics/product-design](https://github.com/bioinfornatics/product-design), based on OpenAI's Product Design plugin version 0.1.50 from commit `fe5608d` of [openai/role-specific-plugins](https://github.com/openai/role-specific-plugins/tree/main/plugins/product-design), under the MIT License.

Turn early product ideas, live URLs, and static screenshots into prototypes teams can review, refine, and carry forward.

## Skills

Goose prefixes every skill in this plugin with the plugin name (`product-design:`) once
installed via `goose plugin install`. Skill directories and `SKILL.md` frontmatter use the
plain, unqualified name (e.g. `get-context`); the table below shows the qualified name used
to load each skill after installation.

| Skill (qualified name) | Description |
|---|---|
| `product-design:index` | Primary router — load first for explicit Product Design mentions, including Product Design + Goose Apps |
| `product-design:get-context` | Clarify the design brief before starting ideation or build work |
| `product-design:user-context` | Save and load product URLs, Figma files, screenshots, brand assets |
| `product-design:research` | Source-grounded UX research on user pain and workflow friction |
| `product-design:ideate` | Generate image-based design alternatives with Image Gen |
| `product-design:audit` | Capture and review UX, design, and accessibility from screenshots |
| `product-design:image-to-code` | Implement a selected visual target as a faithful, responsive frontend |
| `product-design:url-to-code` | Clone a live URL as a runnable frontend-only local app |
| `product-design:design-qa` | Compare prototype implementation against its source visual target |
| `product-design:share` | Deploy a prototype and return a shareable URL |
| `product-design:annotate` | Process pending browser annotations on a running project (any supported framework) |
| `product-design:annotate-inject` | Install the annotation mechanism onto a user-provided/existing project that doesn't have it yet |
| `product-design:project-status` | Optional: track project phase/annotation rounds as Beads (`bd`) issues — never a gate |

## How the skills work together

The plugin follows a **route → clarify → explore or inspect → build → verify → share** workflow:

```text
product-design:index
        ↓
product-design:get-context
        ↓
product-design:research / product-design:audit / product-design:ideate
        ↓
product-design:image-to-code or product-design:url-to-code
        ↓
product-design:design-qa
        ↓
product-design:share
```

Not every request needs every step. `product-design:index` is the entry point and router; it selects the focused skill rather than doing that skill's work.

### Common flow

1. **Route the request.** Start with `product-design:index` whenever Product Design or the plugin is explicitly named.
2. **Clarify the brief.** For design, prototype, redesign, or build work, `product-design:get-context` confirms the design target and intended user outcome. It asks one focused question only when either is missing.
3. **Choose the journey, then its screens.** For multi-step work, `product-design:ideate` defines three journeys, generates three complete end-to-end journeys as separate screen images, even for low-risk work, and creates one board page per variant with the bundled dependency-free journey-board viewer. Variants may generate concurrently in isolated workers, while screens remain sequential inside each variant. After selection, it waits for approval of the existing selected screen set. For a genuine single-screen target, it presents three directions for that same screen.
4. **Build from the approved sources.** Use `product-design:image-to-code` only after a complete multi-screen source set is approved, or from one selected source for a single-screen target. Use `product-design:url-to-code` for a faithful clone of a live URL.
5. **Verify fidelity.** After implementation, capture the rendered prototype and use `product-design:design-qa` to compare it with the source visual.
6. **Share when requested.** Use `product-design:share` only when the user asks to deploy, publish, host, or create a shareable link. A local build is not a deployment.

For disposable review, Vite + React is the default even when production will be Next.js; use Next.js immediately only when Next-specific behavior is under validation. Desktop-web concept screens use a landscape target (1536 × 1024 when supported; 1024 × 768 fallback); mobile uses its frozen viewport. Other raster assets default to 1024 × 1024. Request low quality when supported.

The default path for a new interface is therefore:

```text
product-design:index → product-design:get-context → product-design:ideate → user selects an option
      → product-design:image-to-code → product-design:design-qa → product-design:share (if requested)
```

### Choosing the focused skill

| Request | Recommended flow |
|---|---|
| New interface without a visual reference | `product-design:index → product-design:get-context → product-design:ideate → product-design:image-to-code → product-design:design-qa` |
| Build from a screenshot, mockup, or Figma frame | `product-design:index → product-design:get-context → product-design:image-to-code → product-design:design-qa` |
| Faithfully clone a live website | `product-design:index → product-design:get-context → product-design:url-to-code → product-design:design-qa` |
| Redesign or create something “like” a URL | `product-design:index → product-design:get-context → capture source → product-design:ideate → product-design:image-to-code → product-design:design-qa` |
| Review an existing screen, flow, or journey | `product-design:index → product-design:audit` |
| Audit and then improve an experience | `product-design:index → product-design:audit → product-design:get-context → product-design:ideate/build → product-design:design-qa` |
| Research user pain or workflow friction | `product-design:index → product-design:research` |
| Save or recall preferences and references | `product-design:index → product-design:user-context` |
| Deploy a finished prototype | Append `product-design:share` after implementation and QA |

### Important distinctions

- **`product-design:audit` vs. `product-design:design-qa`:** use `product-design:audit` for user-facing UX, visual-design, and accessibility critique. Use `product-design:design-qa` to compare a coded prototype with its visual source.
- **Clone vs. redesign:** “clone this URL” routes to `product-design:url-to-code`; “redesign this” or “make something like this URL” requires context and visual ideation first.
- **`product-design:research` vs. `product-design:audit`:** use `product-design:research` to discover broader, source-grounded user problems; use `product-design:audit` to inspect a specific existing experience.
- **`product-design:user-context` vs. `product-design:get-context`:** `product-design:user-context` manages durable saved preferences and references, while `product-design:get-context` establishes the brief for the current task.
- **No visual target, no build:** a complete brief or permission to make assumptions does not replace visual selection. Run `product-design:ideate` and wait for the user's choice.
- **Verification requires evidence:** do not claim visual QA without a rendered capture, and do not claim sharing without a working deployment URL.

### Journey-board viewer

The repository bundles a dependency-free static viewer. Given a JSON manifest with exactly three variants and local image paths, `scripts/build-journey-board.mjs` validates and copies the sources, then emits `index.html` plus one wide, zoomable, drag-to-pan page per variant. Use `scripts/serve-journey-board.mjs --root <review-dir>` for a verified local browser URL. This does not imply that Goose Desktop exposes a native embedded HTML viewer; use one only when that capability is present in the session.

```bash
node scripts/build-journey-board.mjs --input journeys.json --output journey-review
node scripts/serve-journey-board.mjs --root journey-review
```

Minimal manifest shape (exactly `V1`, `V2`, and `V3` are required):

```json
{
  "schemaVersion": 1,
  "title": "Journey comparison",
  "variants": [
    {
      "id": "V1",
      "title": "Guided journey",
      "thesis": "Reduce uncertainty through progressive disclosure",
      "screens": [
        {
          "id": "V1-S1",
          "title": "Entry",
          "image": "screens/v1-s1.png",
          "purpose": "Orient the user",
          "note": "Continue to selection"
        }
      ]
    },
    { "id": "V2", "title": "Exploratory journey", "screens": [{ "id": "V2-S1", "title": "Explore", "image": "screens/v2-s1.png" }] },
    { "id": "V3", "title": "Assisted journey", "screens": [{ "id": "V3-S1", "title": "Ask", "image": "screens/v3-s1.png" }] }
  ]
}
```

Board image paths are relative to the board manifest; viewer copies are presentation derivatives, not canonical generated sources. Historical selected-only continuation may present individual full-size sources rather than manufacture three variants.

Image paths are relative to the manifest. PNG, JPEG, WebP, and GIF are accepted; absolute paths, traversal, SVG, and mismatched file signatures are rejected.

## Runtime Dependencies

This plugin requires the following tools available to goose:

- **Browser-capable tool** — for capturing live product surfaces and browser-rendered prototypes (audits, URL-to-code, QA); no specific vendor or tool name is assumed
- **Image-generation tool** — for visual alternatives and assets (ideate, image-to-code); workflows report a capability blocker when absent
- **Node.js / npm** — for running the prototype bootstrap script and dev server, and for the optional user-context preflight/init scripts (compiled TypeScript, no Python required)
- **Goose Apps** — optional sandboxed rendering target; use only after the design brief and focused workflow, never as a substitute for design QA or deployment
- **Hosting tool** — optional for sharing prototypes; a working deployment URL is required before claiming the prototype is shared

### Recommended companion plugins

For the complete workflow, install or expose these capabilities to Goose:

- **A Figma-capable plugin or MCP server** — recommended for reading Figma files and frames, inspecting design context, and creating audit boards when explicitly requested. Product Design remains usable without it when screenshots or other visual sources are available.
- **[image-mcp](https://github.com/bioinfornatics/image-mcp)** — recommended image generator for separate full-size screen concepts and missing raster assets; board pages are assembled from those files. Another image-generation provider may be used when it exposes equivalent capabilities.

These are companion capabilities, not dependencies installed automatically by this plugin. If a requested workflow requires one and no equivalent tool is available, the skill reports the missing capability rather than fabricating a result.

## Product decision gates

Involved workflows use hard criteria, weighted score, evidence confidence and explicit verdict from [`references/product-decision-gates.md`](references/product-decision-gates.md). Multi-step ideation freezes full-evidence and generates all three complete journeys separately and assembles one board page per variant. After selection, the selected existing set requires approval before build. Records live in the generated project's `.gates/`; Beads may mirror status but is not the evaluator.

## Optional: project status via Beads

`assets/beads-formulas/` bundles two [Beads](https://github.com/steveyegge/beads) (`bd`) formulas — `product-design-build` (mirrors `get-context → visual-source → build → design-qa → share`) and `annotate-cycle` (mirrors `annotate-inject → collect → annotate → verify`). Use `project-status` to install and query them. This is purely additive: no Product Design skill requires Beads, and a project with no `.beads/` directory can continue. The first involved target-product workflow checks optional tooling without activating tracking; useful setup is offered once and performed by the agent only after consent. It exists for users who want project phase/status queryable via `bd ready`/`bd show` instead of only reconstructable from conversation history, or who already track work in Beads and want these workflows to compose with it.

Both formulas were verified against a real `bd` install: recognized by `bd formula show`, instantiated via `bd mol pour`/`bd mol wisp`, and their step dependencies correctly enforced by `bd ready`/`bd close`.

## Optional tooling onboarding

[Tooling onboarding](references/tooling-onboarding.md) checks executable presence, native Beads association, Entire enabled state and selected external-agent availability. Goose is supported through Entire's external-agent integration; absence from a built-in list is not a rejection. Missing tooling does not block design. Setup runs in the end user's resolved target only after separate initialization/recording/synchronization consent, never by copying this plugin repository's settings or auto-running a hook. The read-only preflight and command planner are implemented; no installer, setup executor, new hook or captured-session guarantee is bundled.

## Lifecycle reasoning and maintenance

[The lifecycle method](references/product-lifecycle-reasoning.md) makes involved work follow **retrieve → traverse → explore → verify → act** across specifications, optional native work history and actual evidence. A read-only reader resolves declared references and emits bounded JSON/Mermaid; it does not turn proposed criteria, closed tasks or old QA into current approval. Current tool schemas classify image/browser/build/share availability, while source and QA checks still require real output. The annotation queue inspector checks order, invalid records and duplicate replay risks before the existing capture/edit/recapture cycle.

[Progressive product-information disclosure](references/product-information-disclosure.md) keeps full specifications on disk while loading derived navigation, then exact selected Markdown sections or JSON fields/entities in bounded pages. Continuations verify source hashes; changed sources require restarting the read. Graph payloads no longer preload complete JSON roots. This improves read control, not automatic authoring or historical rationale retention.

See [the product lifecycle and reasoning diagrams](docs/product-lifecycle-graph.md). No new hook is activated, no native data is mirrored, and current `.gates/`, generated sources and annotation endpoints are not relocated.

## Product Design + Goose Apps

For an explicit combined request, load `product-design:index`, then `product-design:get-context`, then the focused workflow. A new interface without a selected visual target goes through `product-design:ideate` and user selection before Apps rendering. After rendering, browser-capture the result and run `product-design:design-qa`; use `product-design:share` only for requested deployment. Natural-language routing is probabilistic and must be measured with repeated replays rather than described as deterministic.

Saved context is optional and Goose-local under `$GOOSE_HOME/.local/state/product-design/` (default Goose home: `~/.config/goose`). The plugin does not require Codex state, `@Browser`, `@Sites`, or `terminal.local`.

## Product discovery and reliability

For involved product work, [product discovery questions](references/product-discovery-questions.md) connects current alternatives, user value, adoption/viability and conditional AI/technical/safety assumptions to decision-changing tests. Reuse answered context and one prioritized question; no build yet is a valid outcome. A test plan, prototype QA and measured user value are separate claims.

[Instruction reliability proposals](docs/instruction-reliability-proposals.md) records implemented contradiction fixes and executable transition/QA checks; annotation-state migration, loading refactoring and opt-in hooks remain proposals, not activated. See the [executable transition contract](references/executable-transitions.md) for the source-checkout CLI and canonical QA. The installed plugin is not updated automatically.

## Local evaluation

Evaluate this plugin with `agent-plugins:plugin-creator`, which provides the standard run, baseline, grading, benchmark, and review workflow. Keep prompts, raw Goose traces, reports, specialized temporary graders, and generated review workspaces under the ignored `evaluations/` or `*-workspace/` paths. Do not commit evaluation artifacts because traces may include conversation or runtime data.

## Installation

```bash
goose plugin install https://github.com/bioinfornatics/product-design.git
```

Or for project-local development, copy the plugin into the repository's Goose discovery directory:

```bash
mkdir -p .agents/plugins
cp -rf /path/to/product-design .agents/plugins/product-design
```

## License

MIT — see [LICENSE](./LICENSE). Original work by OpenAI.

## Evidence-mode contract

Multi-step product ideation requires full-evidence: three complete comparable journeys, each with separately generated screens from trigger to proven outcome and critical recovery. A landing page or three anchors cannot establish journey coverage. Lean is restricted to an explicitly isolated single-screen scope. Already selected directions continue without a new competition; complete their missing journey evidence and correct sources before full-set approval and explicit G4. Personas are complementary. references/design-contract.md separates product/UX/UI and metrics/actions/states. scripts/workflow-evidence-contract.mjs checks gates/evidence schemaVersion2, coverage/review/hash/phase; legacy not auto-promoted. No source with open business findings is build eligible. Source tests are not usability research.

## Experience framing and initiative

For involved product work, [product experience method](references/product-experience-method.md) connects supplied feedback and discriminating questions to responsibility/value, Product/UX/UI decisions, complete scenarios, intent placement and verification. Keep a useful brief and principal workspace; no decorative dashboard default. Conditional conversation uses in-place responses and preserved context/edits, agents anticipate opportunities and exceptions with bounded preparation/execution, and presentations stay native/editable with distinct app/organization/client brands. validateExperienceBlueprint checks declared traceability and boundaries, not measured UX or human authorization. Changed skills and their evals carry this through brief → ideation → build → QA.

### Skill authoring and loading

Use `load skills product-design:{name}` with the actual Skill name, not sibling SKILL.md reads. [Authoring/resource contract](docs/skill-authoring.md) covers canonical policies, contained projection and the complete-plugin dependency. `npm test` now also runs `validate:authoring`: source/packaged audits and all shipped scenario-design checks must have zero errors or warnings. Scenarios are explain-only, not behaviorally executed.

### Source artifacts and specification impact

[Source artifacts](references/source-artifacts.md) owns the source plan, actual specification/contract/blueprint dependencies, stable screen links, preflight destinations and append-only accepted/rejected provenance. New generated/edited screen calls, including manual calls, require explicit workspace output capability and direct canonical writes; Image MCP output paths omit the project generated/ prefix. Use scripts/check-source-artifacts.mjs for validation/preflight/impact, never as an image caller or approval tool. Selected-only continuation keeps its IDs and may present individual full-size sources; no fake alternatives, moved history or app scaffold is needed. Hashes detect staleness, not semantic correctness or user research.
