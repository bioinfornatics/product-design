---
name: get-context
description: "Product Design brief gate. After product-design:index, load before ideation, image-to-code, redesign, Product Design + Goose Apps, or product UI build work; require a clear design target and intended user outcome, play back the brief, then hand off to the named focused workflow before any rendering tool."
---

# Get Context


Run this skill at the start of Product Design requests that ask to design, build, prototype, clone, redesign, extend, or generate product UI directions.

Use question mode to clarify the following:

- what product, site, feature, workflow, component, or screen is being designed, redesigned, or extended
- what the feature, change, app, or website should help the user do

Do not re-ask answered questions. When both are clear, play back the brief and defaults in one pithy note, name the next workflow, and continue in the same turn. Playback is not a request for approval. The user can course-correct style, scope, or interactivity at any point.

Hard boundary: do not implement UI, scaffold a prototype, start a server, or create files while the design target or intended user outcome is still missing.

## Framework and Design System Detection

Resolve these two before handing off to `$ideate`/`$image-to-code`/`$url-to-code`, alongside the design target and outcome — do not leave them implicit and default to the bundled Vite template without checking.

**Framework.** If the target is a new prototype:

- If an existing project is already present (an existing codebase, not a fresh empty folder), detect its framework from config files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `vite.config.*`) and build within it — do not scaffold a separate template. Follow [../../references/existing-codebase-edits.md](../../references/existing-codebase-edits.md).
- If there is no existing project, ask which framework to scaffold only if the user's context makes it ambiguous (e.g. they've named a target stack, or saved user context records a preference). Otherwise default to the bundled Vite template — it's the fastest path for a disposable visual prototype. Supported frameworks: Vite (default), Next.js, Nuxt, Astro. Name the chosen framework in the brief playback.

**Design system.** Ask or check, in this order, before build starts:

1. **Is there an existing design system?** Check saved user context (`$user-context`) for a recorded design system, codebase paths, Storybook, or component refs. If the user names one, or a plugin exposes skills for one (for example a Servier DNA or other branded component-tier skill), use it — route real UI construction to those real components instead of generic HTML/CSS, following that skill's own guidance.
2. **If no design system is in use, are there tokens or a palette to use?** Ask for existing design tokens, a brand palette, a Figma file, or brand assets before generating anything from scratch. Use whatever is provided as grounding for `$ideate`'s Image Gen calls and for any hardcoded colors/spacing/type in the build.
3. **If neither exists,** say so plainly and generate visual directions with distinctly different palettes as part of `$ideate` — this is the fallback, not the default. Do not silently invent a single palette and skip ideation.

Do not skip straight to build with an assumed framework or an assumed palette when the project is new; a wrong assumption here is expensive to undo (rewritten components, mismatched brand colors). A quick check or one targeted question is worth it.

## Critical Overrides

- Refer to the Plugin router [../index/SKILL.md](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## User Context

Saved user context is optional. Load [../user-context/SKILL.md](../user-context/SKILL.md) only when the user asks to save/recall context or a configured Product Design state directory is known to contain relevant context.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Handoff To The Next Workflow

1. When the next workflow is already clear, read that skill before sending the brief playback. Do not only name a skill you have not read.

2. Before executing `$ideate`, `$url-to-code`, or `$image-to-code`, play back the minimum brief and any defaults in one pithy user-visible note.

3. If the target and intended user outcome are clear, continue to the next workflow in the same turn. Do not wait for explicit confirmation. If the user provides feedback, incorporate it and course-correct.

4. Before starting an involved app, prototype, clone, redesign, or build, send one short expectation-setting note and continue. Example:

```text
This kind of build usually takes about 10-15 minutes, and ambitious ones can take longer. Good moment to grab coffee or tend to something else; I’ll keep moving and bring the prototype back when it is ready.
```

Do not send this note for tiny static changes, quick audits, simple research, setup-only, or share-only requests.

Done means the design target and intended user outcome are clear, defaults have been played back, and any already-determined next skill has been read.
