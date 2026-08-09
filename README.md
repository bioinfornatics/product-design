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