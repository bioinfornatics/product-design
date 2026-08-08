# Product Design (Goose Plugin)

> Ported from [OpenAI Codex product-design plugin](https://github.com/openai/role-specific-plugins/tree/main/plugins/product-design) under MIT License.

Turn early product ideas, live URLs, and static screenshots into prototypes teams can review, refine, and carry forward.

## Skills

| Skill | Description |
|---|---|
| `product-design:index` | Primary router — routes requests to the right Product Design skill |
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

- **Browser / Playwright MCP** — for capturing live product surfaces (audits, URL-to-code, QA)
- **Image Generation tool** — for generating design alternatives and assets (ideate, image-to-code)
- **Node.js / npm** — for running the prototype bootstrap script and dev server
- **Python 3** — for user-context preflight and init scripts
- **Hosting tool** (e.g. Vercel, Sites) — for sharing prototypes (optional)

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