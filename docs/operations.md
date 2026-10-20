# Operations: Annotations, Context, and Security

## Annotating a prototype

All supplied starters have the overlay installed. For an existing project that lacks the mechanism, `annotate-inject` requires an explicit installation request or confirmation before editing; optional installation never delays an otherwise verified handoff. It:

1. detects Vite, Next.js, Nuxt, or Astro;
2. copies the appropriate port from `assets/annotate/`;
3. mounts the client only in development;
4. exposes the framework port's endpoint (Next.js/Nuxt/Astro use `api/goose-annotate`; Vite still uses `/__goose-annotate`, pending the proposed coordinated migration);
5. verifies a real submission in development and its unavailability in production.

Messages are stored under `<project>/.goose/annotations/inbox/`. `annotate` processes files from oldest to newest: reproduce the route and viewport, capture the area indicated by the bbox, modify only the target, recapture, then move the item to `processed/`. Do not silently delete any annotation.

The agent is responsible for the local server and review URL. A non-trivial or final pass must go through `design-qa` again.

## User context

`product-design:user-context` manages a persistent file outside the product repository, under `$GOOSE_HOME/.local/state/product-design/` by default. It can retain:

- product, Storybook, or Figma URLs;
- browser or sharing preferences;
- design system, token, and component references;
- screenshots and brand assets copied into its own `assets/` directory.

Rules:

- run the read-only preflight for relevant saved context when local shell access is available; reading needs readability, while saving additionally requires write access;
- read existing context by default, then limit inspection to the task's needs;
- date entries and give images descriptive names;
- prefer a few useful references over a dump;
- interpret `status: not provided` as missing information;
- never save a secret, credential, key, private token, or copied client data.

User-context provides persistent defaults. `get-context` remains responsible for the current brief, which can override them on request.

## Optional tooling onboarding

The first involved workflow on a resolved target, or an explicit tracking/provenance/setup request, uses [the canonical onboarding contract](../references/tooling-onboarding.md). `scripts/check-product-tooling.mjs` provides read-only diagnostics and an exported consent-checked setup command planner. Missing optional tooling is not a design gate. Agent-performed setup requires explicit target-bound consent and fresh verification; no auto-install/init hook or bundled setup executor. Preserve the native tracker and Entire integration, including external Goose; enabled settings do not prove a captured checkpoint. Do not copy development configuration into products.

## Lifecycle inspection and maintenance

Follow [product lifecycle reasoning](../references/product-lifecycle-reasoning.md) for involved why/impact questions. `read-product-slice.mjs` returns a bounded explicit document/task slice; inspect diagnostics and freshness rather than only its Mermaid projection. `check-annotation-queue.mjs` is read-only: pending/blocked records are not processed, and transport or edit-cycle success still requires the focused annotation workflow. Capability inventory is transient input from the current host, not saved provider configuration. No new setup executor or lifecycle hook is installed.

## Bounded specification and rationale reads

For a why question, use [progressive disclosure](../references/product-information-disclosure.md): overview first, then the relevant explicit section/entity and selected fields. `read-product-information.mjs` returns at most 2000 code points by default (maximum 8000), paging metadata and a continuation bound to the exact source SHA. A CLI continuation reads a safe project-relative cursor JSON file; the module API can pass the returned cursor directly. No cursor file is created automatically. A stale cursor returns no content: restart and reassess, never mix versions.

Graph node content has independent per-node and aggregate serialized-data limits. Labels, references, metadata, edges and diagnostics are outside that data budget; it is not a token or total response-size guarantee. Partial pages, navigation-only roots and link-only task/budget results require targeted follow-up. Read applicable constraints/recovery/alternatives before an action. Complete selected text does not establish graph completeness, historical retention, approval or evidence validity.

## Operational security

- Ask for permission before directly using a browser other than the one chosen.
- Do not bypass authentication or a paywall to capture a URL.
- Do not publish without an explicit request or announce sharing without a tested URL.
- Do not add production infrastructure, real authentication, a database, or an external integration during the prototype phase.
- Keep secrets and private data out of the repository, screenshots, annotations, and evaluation artifacts.
- Preserve an existing app's architecture and follow its local instructions.
- Report missing capabilities; never invent a capture, Image Gen result, QA result, or deployment.

## Minimum evidence

| Claim | Required evidence |
|---|---|
| “the prototype works” | accessible server and main journey exercised |
| “faithful to the source” | source/render comparison at the same viewport and state |
| “annotation installed” | dev submission written + production endpoint absent/refused |
| “shared” | accessible deployment URL |
| “accessible” | applicable checks actually verified, with limitations stated |

## Transition adapter and canonical QA

Use scripts/check-workflow-evidence.mjs with explicit --project and --request, then --consume immediately before the scoped action. See [the contract and request examples](../references/executable-transitions.md). A failed command stops downstream work; reason and persistenceError explain repair. Keep immutable QA/capture history, do not manually edit derived design-qa.md or remove archived findings to obtain readiness. No installed-plugin update, annotation migration or hook activation is performed by this command.

## Skill authoring correction

Peer Skills use `load skills product-design:{name}`, not sibling-file links. Shared policies remain canonical at root references/; isolated validation/packaging projects contained local resources with identity/closure checks. No source copies or installed-plugin changes are generated. `validate:authoring` is required in npm test and blocks audit/scenario errors or warnings. See [the authoring/resource contract](skill-authoring.md). This is structural evidence, not behavioral evaluation.
