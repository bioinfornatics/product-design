# Product Design (Goose Plugin)

> Goose port maintained at [bioinfornatics/product-design](https://github.com/bioinfornatics/product-design), based on OpenAI's Product Design plugin version 0.1.50 from commit `fe5608d` of [openai/role-specific-plugins](https://github.com/openai/role-specific-plugins/tree/main/plugins/product-design), under the MIT License.

Turn early product ideas, live URLs, and static screenshots into prototypes teams can review, refine, and carry forward.

## Skills

| Skill | Description |
|---|---|
| `product-design` | Primary router — load first for explicit Product Design mentions, including Product Design + Goose Apps |
| `get-context` | Clarify the design brief before starting ideation or build work |
| `user-context` | Save and load product URLs, Figma files, screenshots, brand assets |
| `research` | Source-grounded UX research on user pain and workflow friction |
| `ideate` | Generate image-based design alternatives with Image Gen |
| `audit` | Capture and review UX, design, and accessibility from screenshots |
| `image-to-code` | Implement a selected visual target as a faithful, responsive frontend |
| `url-to-code` | Clone a live URL as a runnable frontend-only local app |
| `design-qa` | Compare prototype implementation against its source visual target |
| `share` | Deploy a prototype and return a shareable URL |
| `annotate` | Process pending browser annotations on a running project (any supported framework) |
| `annotate-inject` | Install the annotation mechanism onto a user-provided/existing project that doesn't have it yet |
| `project-status` | Optional: track project phase/annotation rounds as Beads (`bd`) issues — never a gate |

## How the skills work together

The plugin follows a **route → clarify → explore or inspect → build → verify → share** workflow:

```text
index
        ↓
get-context
        ↓
research / audit / ideate
        ↓
image-to-code or url-to-code
        ↓
design-qa
        ↓
share
```

Not every request needs every step. `product-design` is the entry point and router; it selects the focused skill rather than doing that skill's work.

### Common flow

1. **Route the request.** Start with `product-design` whenever Product Design or the plugin is explicitly named.
2. **Clarify the brief.** For design, prototype, redesign, or build work, `get-context` confirms the design target and intended user outcome. It asks one focused question only when either is missing.
3. **Choose a direction.** If there is no selected visual target, run `ideate`, present exactly three visual options, and wait for the user to choose one before building.
4. **Build from the source.** Use `image-to-code` for a screenshot, Figma frame, mockup, generated concept, or other image. Use `url-to-code` for a faithful clone of a live URL.
5. **Verify fidelity.** After implementation, capture the rendered prototype and use `design-qa` to compare it with the source visual.
6. **Share when requested.** Use `share` only when the user asks to deploy, publish, host, or create a shareable link. A local build is not a deployment.

For disposable review, Vite + React is the default even when production will be Next.js; use Next.js immediately only when Next-specific behavior is under validation. Generated concepts and raster assets default to low quality and a 1280 × 1024 review target (or nearest provider canvas, cropped/downscaled), never 4K by default.

The default path for a new interface is therefore:

```text
index → get-context → ideate → user selects an option
      → image-to-code → design-qa → share (if requested)
```

### Choosing the focused skill

| Request | Recommended flow |
|---|---|
| New interface without a visual reference | `index → get-context → ideate → image-to-code → design-qa` |
| Build from a screenshot, mockup, or Figma frame | `index → get-context → image-to-code → design-qa` |
| Faithfully clone a live website | `index → get-context → url-to-code → design-qa` |
| Redesign or create something “like” a URL | `index → get-context → capture source → ideate → image-to-code → design-qa` |
| Review an existing screen, flow, or journey | `index → audit` |
| Audit and then improve an experience | `index → audit → get-context → ideate/build → design-qa` |
| Research user pain or workflow friction | `index → research` |
| Save or recall preferences and references | `index → user-context` |
| Deploy a finished prototype | Append `share` after implementation and QA |

### Important distinctions

- **`audit` vs. `design-qa`:** use `audit` for user-facing UX, visual-design, and accessibility critique. Use `design-qa` to compare a coded prototype with its visual source.
- **Clone vs. redesign:** “clone this URL” routes to `url-to-code`; “redesign this” or “make something like this URL” requires context and visual ideation first.
- **`research` vs. `audit`:** use `research` to discover broader, source-grounded user problems; use `audit` to inspect a specific existing experience.
- **`user-context` vs. `get-context`:** `user-context` manages durable saved preferences and references, while `get-context` establishes the brief for the current task.
- **No visual target, no build:** a complete brief or permission to make assumptions does not replace visual selection. Run `ideate` and wait for the user's choice.
- **Verification requires evidence:** do not claim visual QA without a rendered capture, and do not claim sharing without a working deployment URL.

## Runtime Dependencies

This plugin requires the following tools available to goose:

- **Browser-capable tool** — for capturing live product surfaces and browser-rendered prototypes (audits, URL-to-code, QA); no specific vendor or tool name is assumed
- **Image-generation tool** — for visual alternatives and assets (ideate, image-to-code); workflows report a capability blocker when absent
- **Node.js / npm** — for running the prototype bootstrap script and dev server
- **Python 3** — for optional Goose user-context preflight and init scripts
- **Goose Apps** — optional sandboxed rendering target; use only after the design brief and focused workflow, never as a substitute for design QA or deployment
- **Hosting tool** — optional for sharing prototypes; a working deployment URL is required before claiming the prototype is shared

## Product decision gates

Involved workflows use hard criteria, weighted score, evidence confidence and explicit verdict from [`references/product-decision-gates.md`](references/product-decision-gates.md). Multi-page ideation first compares journey strategies at one normalized boundary, then renders three visual directions over the exact same checkpoint set. Records live in the generated project's `.gates/`; Beads may mirror status but is not the evaluator.

## Optional: project status via Beads

`assets/beads-formulas/` bundles two [Beads](https://github.com/steveyegge/beads) (`bd`) formulas — `product-design-build` (mirrors `get-context → visual-source → build → design-qa → share`) and `annotate-cycle` (mirrors `annotate-inject → collect → annotate → verify`). Use `project-status` to install and query them. This is purely additive: no Product Design skill requires or checks for Beads, and a project with no `.beads/` directory works exactly the same. It exists for users who want project phase/status queryable via `bd ready`/`bd show` instead of only reconstructable from conversation history, or who already track work in Beads and want these workflows to compose with it.

Both formulas were verified against a real `bd` install: recognized by `bd formula show`, instantiated via `bd mol pour`/`bd mol wisp`, and their step dependencies correctly enforced by `bd ready`/`bd close`.

## Product Design + Goose Apps

For an explicit combined request, load `product-design`, then `get-context`, then the focused workflow. A new interface without a selected visual target goes through `ideate` and user selection before Apps rendering. After rendering, browser-capture the result and run `design-qa`; use `share` only for requested deployment. Natural-language routing is probabilistic and must be measured with repeated replays rather than described as deterministic.

Saved context is optional and Goose-local under `$GOOSE_HOME/.local/state/product-design/` (default Goose home: `~/.config/goose`). The plugin does not require Codex state, `@Browser`, `@Sites`, or `terminal.local`.

## Local evaluation

Evaluate this plugin with `open-agent-creators:skill-creator`, which provides the standard run, baseline, grading, benchmark, and review workflow. Keep prompts, raw Goose traces, reports, specialized temporary graders, and generated review workspaces under the ignored `evaluations/` or `*-workspace/` paths. Do not commit evaluation artifacts because traces may include conversation or runtime data.

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