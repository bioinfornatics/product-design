# Product Design (Goose Plugin)

> Ported from [OpenAI Codex product-design plugin](https://github.com/openai/role-specific-plugins/tree/main/plugins/product-design) under MIT License.

Turn early product ideas, live URLs, and static screenshots into prototypes teams can review, refine, and carry forward.

## Skills

| Skill | Description |
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

## How the skills work together

The plugin follows a **route → clarify → explore or inspect → build → verify → share** workflow:

```text
product-design:index
        ↓
product-design:get-context
        ↓
research / audit / ideate
        ↓
image-to-code or url-to-code
        ↓
design-qa
        ↓
share
```

Not every request needs every step. `product-design:index` is the entry point and router; it selects the focused skill rather than doing that skill's work.

### Common flow

1. **Route the request.** Start with `product-design:index` whenever Product Design or the plugin is explicitly named.
2. **Clarify the brief.** For design, prototype, redesign, or build work, `product-design:get-context` confirms the design target and intended user outcome. It asks one focused question only when either is missing.
3. **Choose a direction.** If there is no selected visual target, run `product-design:ideate`, present exactly three visual options, and wait for the user to choose one before building.
4. **Build from the source.** Use `product-design:image-to-code` for a screenshot, Figma frame, mockup, generated concept, or other image. Use `product-design:url-to-code` for a faithful clone of a live URL.
5. **Verify fidelity.** After implementation, capture the rendered prototype and use `product-design:design-qa` to compare it with the source visual.
6. **Share when requested.** Use `product-design:share` only when the user asks to deploy, publish, host, or create a shareable link. A local build is not a deployment.

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

## Product Design + Goose Apps

For an explicit combined request, load `product-design:index`, then `product-design:get-context`, then the focused workflow. A new interface without a selected visual target goes through `product-design:ideate` and user selection before Apps rendering. After rendering, browser-capture the result and run `product-design:design-qa`; use `product-design:share` only for requested deployment. Natural-language routing is probabilistic and must be measured with repeated replays rather than described as deterministic.

Saved context is optional and Goose-local under `$GOOSE_HOME/.local/state/product-design/` (default Goose home: `~/.config/goose`). The plugin does not require Codex state, `@Browser`, `@Sites`, or `terminal.local`.

## Local evaluation

Evaluate this plugin with `open-agent-creators:skill-creator`, which provides the standard run, baseline, grading, benchmark, and review workflow. Keep prompts, raw Goose traces, reports, specialized temporary graders, and generated review workspaces under the ignored `evaluations/` or `*-workspace/` paths. Do not commit evaluation artifacts because traces may include conversation or runtime data.

## Installation

```bash
goose plugin install https://github.com/YOUR_ORG/product-design-goose.git
```

Or for local development:

```bash
cp -r /path/to/product-design ~/.agents/plugins/product-design
```

## License

MIT — see [LICENSE](./LICENSE). Original work by OpenAI.