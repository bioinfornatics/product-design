---
name: image-to-code
description: Builds an approved visual target into a reviewable mock-data frontend. Use when translating selected screenshots, mockups, Figma frames, or generated sources into code; requires scoped build approval and canonical QA.
---

# Image to Code

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

You're tasked with translating the visual target image into a high-quality, interactive website or web app.

## Executable build boundary

Before scaffolding, app creation or implementation mutation, read executable transitions at `PLUGIN_ROOT/references/executable-transitions.md`, run `scripts/check-workflow-evidence.mjs` with operation `prototype-build`, then rerun that request with `--consume` immediately before acting. Require passed readiness for this project/scope, approved source bytes and explicit G4.executionContract (required states, implementation roots, mock data and limits). G2/G3, Markdown or Beads labels cannot substitute. Stop on nonzero/blocked; never self-approve to repair validation.

Use `generated` only for actual complete generated comparison provenance. Provided visuals, exact clones and retained historical choices use their documented branches without a new competition; applicable involved G1/contract/blueprint checks remain. Supply the exact bindings and implementation roots to `product-design:design-qa`. Canonical `design-qa.json`, derived Markdown and a freshly consumed `review-handoff` receipt are required before saying done. Apps/remote runtime without locally verifiable implementation evidence remains freshness-blocked.

## Source dependency handoff

For generated/edited screen sources, read source artifacts at PLUGIN_ROOT/references/source-artifacts.md and run PLUGIN_ROOT/scripts/check-source-artifacts.mjs with the plan and ledger before consuming the approved set. Resolve each approved ID to its canonical accepted record/file and actual specification/contract/blueprint links; review changed dependency impact before fresh build consumption. Copied images or stale approvals do not qualify. Return screen-source revisions to ideate for the same plan/preflight; do not silently edit visual truth while coding. Provided authorized assets retain their own provenance; ordinary raster asset production is not a screen-source migration.

## Critical Overrides

- Before proceeding, use `load skills product-design:index` for routing.
- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## User Context

Use saved context only when relevant and available; missing saved context does not block a build with a complete brief and selected visual target.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

### Previewing prototypes in Goose

Build success, HTTP health, Goose Apps creation, and deployment success are not visual verification. Use a browser-capable tool exposed in the current Goose session to open the rendered implementation, inspect it at the target viewport, exercise primary interactions, check console errors when supported, and capture evidence for design QA.

If no browser-capable tool is available, record canonical `finalResult: blocked` in `design-qa.json` and derive `design-qa.md` through the adapter when prerequisites are valid; do not claim the prototype is visually verified. Do not assume `sites-preview`, `terminal.local`, `@Browser`, or `@Sites` exists. Use the local or Apps preview URL actually returned by the available runtime, and expose it to the user only when it is a valid user-accessible URL.

### Mobile prototypes

For a mobile app or phone prototype, build and verify at 390 × 844 unless the user names a device. Use the starter's `.mobile-prototype` wrapper. Do not use `min-height: 100vh` on the app shell. The app surface must end at the 390 × 844 frame. Every screen must fit 390px wide with no horizontal scroll, clipped text, clipped controls, or off-screen primary actions.

## Workflow

CRITICAL: THIS IS NOT GUIDANCE. THIS IS A CHECKLIST TO COMPLETE.

For involved multi-phase builds, apply planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md`. Before build and at QA handoff, record epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task. `load skills product-design:project-status` for explicit tracking or an applicable existing `.beads/`; vocabulary alone requires an offer and confirmation before Beads changes. Tracking never blocks implementation or substitutes for gate evidence.

1. Do not start unless the visual source matches the target scope. For a multi-step journey, require the user-approved complete corrected ordered screen set of the selected direction, reused after a complete full-evidence comparison or completed for an already selected historical direction without reopening selection; a selected board page alone is not sufficient. Never expand a single approved landing/home into an unapproved multi-screen product. For a genuinely single-screen target, one selected image, screenshot, mockup, Figma frame or Image Gen result is sufficient. Apply G4 in product decision gates at `PLUGIN_ROOT/references/product-decision-gates.md`: journey, evaluation slice, hypothesis, exact visual targets, states, realistic mock data, success criterion, out-of-scope behavior, design-system components and framework rationale must be resolvable. For involved work write `.gates/04-selection-to-prototype.md`.

2. Resolve the exact selected visual target or ordered screen set before building.

    - If multi-step ideation was used, read `.gates/02-journey-selection.md`, `.gates/03-screen-production-plan.md` and `.gates/03-visual-selection.md`; resolve every required screen to its exact displayed generated result. A bare journey-option number identifies the board page, not the individual build sources.
    - For the single-screen exception, resolve a numbered `product-design:ideate` option against the Nth displayed generated-image result from the most recent single-screen ideation set. Do not use submission order.
    - Use the concept-name list from `product-design:ideate` only when it was explicitly written in the same displayed-image order.
    - A generated-image result ID, selected image attachment, screenshot, mockup, or Figma frame is stronger than a bare ordinal. Prefer that exact reference when available.
    - If the selected result cannot be resolved unambiguously, stop before implementation and ask the user to name the concept or reattach/select the image. Never guess and build a nearby option.

3. Treat the corrected and approved sources as the design to recreate. A direction choice or a readable image with known business/data/action-state defects is not an approved build source. Require exact source hashes, full ordered coverage, semantic review and explicit G4 handoff; a G2 or Beads status is not build authorization.

For involved adaptive/agentic/native-output work, read product experience method at `PLUGIN_ROOT/references/product-experience-method.md` and the experience blueprint. Implement the approved intent placements, direct controls, context/return, protected edits, opportunity/exception preparation and eligible action states with realistic mock data. Preserve the compact brief/principal workspace rather than substituting generic dashboards or a transcript feed. Do not add real agent services or external effects without explicit production scope. Native presentation UX is not a completed editable deck; distinguish mock, export capability and branding evidence. Resolve missing/contradictory material feedback links before expanding build scope.

For involved work read product discovery questions at `PLUGIN_ROOT/references/product-discovery-questions.md` and preserve the agreed hypothesis, current alternative, task, realistic data and test guardrails. Implement only the approved evaluation slice. When AI is part of the product, mock applicable success, error, abstention, correction and fallback states; do not imply measured model accuracy, authorized external effects or production readiness. Missing data/quality/latency assumptions belong in the test limitations or a separately authorized feasibility task, not a speculative backend.

4. If the provided design is a mobile viewport, build a mobile app. If it's unclear, default to desktop.

5. Review and measure the reference design, catalog its assets, and reuse supplied or authorized source files first. Generate only missing raster assets when an available image-generation tool is needed; never regenerate an available asset, supplied brand logo or design-system control. If a required official logo is missing, ask for it or record a source blocker rather than inventing brand conformity.

    Examples include:

    - Hero images including full bleed image backgrounds
    - Featured article imagery
    - Thumbnails
    - Decorative illustrations
    - Textures and background motifs
    - Logos
    - Product images
    - Avatars

    Rules:

    - Do not draw substitutes for reference images, logos or icons using CSS/div art, handcrafted SVG, emoji or text glyphs. Real source vectors and library icons are allowed. Ordinary UI backgrounds, borders, radii and gradients may use CSS when they match approved tokens/source surfaces; this is not permission to fake an illustration. Generate only missing raster imagery.
    - If text is part of an image asset, keep it in the image asset. Examples include full bleed hero images, signs, posters, packaging, storefronts, article art, and illustrations where the type belongs to the visual itself. Do not crop the background image and recreate that text with transparent text boxes, HTML, CSS, or separate overlay layers unless the source clearly shows editable UI text sitting on top of the image.
    - Do not use generic placeholders where the reference implies custom visual content.
    - Generated assets must share the same art direction, palette, rendering style, and design language as the reference mockup.
    - Default every newly generated raster asset to a `1024 x 1024` source canvas and request `quality: low` when the model/provider supports it. Use a different size or aspect ratio only when the selected source visual, the exact rendered crop, or an explicit user request requires it; document that exception. If low quality is unsupported, omit the parameter or use automatic/default quality rather than failing. Never request 4K/high/HD by default. Preserve user-supplied source dimensions when fidelity requires them; raise quality only for a documented visible QA failure or explicit request.
    - This limit applies to newly generated raster assets, not user-supplied originals, vector logos/icons, or screenshots used as visual truth.
    - If the available image-generation tool lacks transparency support, post-process generated assets when transparency is required.

### Parallel asset production

After cataloging and measuring the reference assets, spawn up to three asset subagents while the main agent builds the app structure.

Give each subagent one raster asset task at a time with its reference crop, exact dimensions, focal point, style, output path, and consuming component. Asset subagents generate, inspect, save, and report the asset path only. They must not edit source code, run the browser, or deploy.

Prioritize critical above-the-fold assets first, then reuse agents for supporting assets. Do not delegate standard UI icons or supplied brand logos.

6. Define all sections of the page. For each section, meticulously measure the layout, spacing between elements, and the size and space of the elements themselves.

7. Reuse the supplied/design-system font when authorized and available. Only find the closest freely available font when the original is unavailable; disclose the substitution.

8. Reuse source/design-system icons first. Only find a matching freely available icon library for missing icons; do not default to Lucide unless it is the closest match.

    Rules:

    - Use source/design-system icons or a matching icon library, not handcrafted icon/illustration stand-ins. CSS surfaces matching the approved source remain allowed; generating images is not required for ordinary UI backgrounds.

9. Build the app starting with local prototype preflight at `PLUGIN_ROOT/references/local-prototype-preflight.md`, using the framework `product-design:get-context` resolved (Vite by default, or Next.js/Nuxt/Astro when named or already in use — pass `--framework <name>` to `bootstrap-prototype.mjs` for a new scaffold). If a design system was identified in `product-design:get-context`, build with its real components per that skill's own guidance instead of generic HTML/CSS. Unless the user asks for a static mock, full production behavior, or a different scope, bring the app or website to life with:

    - Working navigation, links, tabs, menus, and primary CTAs.
    - Functional inputs, filters, toggles, selections, and forms shown in the main experience.
    - Visible UI states: hover, focus, selected, open/closed, loading, empty, and success where relevant.
    - The main task, conversion path, or user journey working from start to finish when the product has one.

    Controls outside the core experience may be visual-only. Do not build auth, persistence, backend/API calls, integrations, or exhaustive edge cases unless requested.

    Rules:

    - Place every image asset you generated into its position before proceeding. I repeat, replace all placeholders, including CSS/SVG placeholders, before proceeding.
    - Do not leave approved core controls as static chrome. Implement routes required by the approved screen set and G4 scope, but do not invent additional pages.

10. Prepare the review loop and run the local app. For a bundled template, the annotation overlay is already present. For an existing project or external boilerplate where annotation is absent, offer `product-design:annotate-inject` and obtain explicit confirmation before it adds a route, component, or ignore rule. Do not block the ordinary local handoff while awaiting that optional consent, and do not claim annotation is installed or verified unless injection and its checks actually completed. Start or reuse the documented dev server yourself in a persistent/background process, wait for a healthy HTTP response, and keep it running. Do not ask the user to open a terminal or run `npm run dev`, `pnpm dev`, `make start-dev`, or equivalent. If startup fails, investigate it; report blocked only after actionable diagnosis.

11. Capture the local app using the Goose Capability Preflight rule in `load skills product-design:index` (section goose-capability-preflight).

12. Use `load skills product-design:design-qa`, then complete that Skill as the blocking build gate.

    Steps:

    - Open the reference image and the latest prototype screenshot before writing the QA report.
    - Compare the same viewport and the same interaction state. If they do not match, capture the missing view first.
    - Save the QA report as `design-qa.md` in the project root.
    - Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
    - Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
    - If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
    - Do not hand off unless `design-qa.md` exists and says `final result: passed`.

13. Handoff the app or website.

    - Use `load skills product-design:design-qa` and hand off only after its checks pass.
    - Keep the prototype running locally; the agent owns startup and lifecycle for the review handoff.
    - When annotation is installed, verify it and explain its in-app toggle. If it is absent in an existing project and optional consent is pending, say it is not installed; do not claim usability or block the ordinary verified handoff. Do not give terminal setup steps.
    - Provide a valid user-accessible local or deployed URL only when the active Goose runtime returned one. Goose Apps creation alone is not a deployment; `load skills product-design:share` for requested hosting.
    - After the prototype link, use the shared build handoff from `critical-overrides.md`. Do not add a different completion message.
    - Include the post-build iteration and share nudge from critical overrides at `PLUGIN_ROOT/references/critical-overrides.md#build-handoff`.
