# Product Design Plugin Architecture

## Execution model

Product Design is a Goose plugin made up of Markdown skills, shared references, frontend starters, and local scripts. It does not include a memory service, a vector database, or a graph orchestrator.

```text
User request
      ↓
product-design:index (router)
      ↓
specialized skill + cross-cutting references
      ↓
tools available in the session
      ↓
visual artifacts, local prototype, QA, or shared URL
```

Goose adds the `product-design:` prefix after installation. The name declared in each skill directory remains unqualified, for example `ideate`.

## Components

### Skills

The thirteen skills are grouped by responsibility:

- **Orchestration**: `index`, `get-context`.
- **Context and discovery**: `user-context`, `research`, `audit`.
- **Design**: `ideate`.
- **Build**: `image-to-code`, `url-to-code`.
- **Verification and delivery**: `design-qa`, `share`.
- **Feedback loop**: `annotate-inject`, `annotate`.
- **Optional tracking**: `project-status`.

The router loads the appropriate skill; skills may then request another skill when transitioning to a new step. There is no separate custom agent in this repository.

### References

`references/` brings together shared rules: communication, critical overrides, changes to an existing codebase, prototype preflight, and decision gates. They prevent these contracts from being duplicated in every skill.

### Templates

| Directory | Stack | Usage |
|---|---|---|
| `templates/prototype` | Vite + React | Default throwaway prototype |
| `templates/nextjs` | Next.js | Validation of Next-specific behaviors |
| `templates/nuxt` | Nuxt | Requested or required Nuxt prototype |
| `templates/astro` | Astro | Requested or required Astro prototype |

The `scripts/bootstrap-prototype.mjs` script copies the selected starter to a new destination. Each starter contains a local `AGENTS.md` and annotation already wired up. The framework must be decided before scaffolding.

### Annotation

`assets/annotate/` contains ports to inject into an existing application: overlay components, styles, and a framework-specific endpoint/plugin. The templates already contain an adapted copy. Annotations are files local to the prototype, under `.goose/annotations/`, not data sent to plugin infrastructure.

### Gates and tracking

Product decisions are documented in `.gates/` within the generated project. The formulas under `assets/beads-formulas/` can reflect phases in Beads, but remain optional: they do not decide gates, and no skill should fail because Beads is unavailable.

## Runtime capabilities

The plugin relies on capabilities exposed to Goose:

- a browser to capture a source and verify a rendering;
- image generation for ideation and some assets;
- Node.js/npm for bootstrap, installation, and local servers;
- a hosting provider only when sharing is requested;
- optionally, Figma or Goose Apps.

These tools are not installed automatically. The active skill must detect their availability and report a blocker if the step cannot be substantiated.

## Skill authoring correction

Peer Skills use `load skills product-design:{name}`, not sibling-file links. Shared policies remain canonical at root references/; isolated validation/packaging projects contained local resources with identity/closure checks. No source copies or installed-plugin changes are generated. `validate:authoring` is required in npm test and blocks audit/scenario errors or warnings. See [the authoring/resource contract](skill-authoring.md). This is structural evidence, not behavioral evaluation.
