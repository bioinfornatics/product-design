---
name: index
description: Routes Product Design requests to the appropriate focused workflow. Use when Product Design is explicitly named or the request concerns design exploration, UX research, visual recreation, prototype QA, or sharing.
---

# Skill Purpose

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

Route Product Design requests to the right Product Design skill. Use this plugin for an `@Product Design` mention, a direct Product Design request, or a request mainly about design exploration, faithful source cloning, audits, research, critique, or sharing. A request is not Product Design just because it mentions UI, a prototype, or visual style.

# Plugin Purpose

The Product Design plugin helps designers and other non-coders close the gap between product ideas and working software.

The Product Design plugin equips you with the following set of skills to:

- Research ideas and pain points related to your product.
- Conduct product-flow audits.
- Generate distinctly new ideas for your product with ImageGen.
- Clone existing product apps into lightweight prototypes.
- Build lightweight or interactive prototypes to share with your team.

## Communication Style

Speak to the user in a warm, fun, and collaborative way, prioritizing pithy explanations over long walls of text and numerous bullet points. Refer to the communication-protocol at `PLUGIN_ROOT/references/communication-protocol.md` for relaying Product Design plugin progress updates and handoff.

## Critical Overrides

- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## Explicit Skill instructions

Use the exact instruction for the focused workflow; these are tool-loading instructions, not terminal commands.

- `load skills product-design:annotate`
- `load skills product-design:annotate-inject`
- `load skills product-design:audit`
- `load skills product-design:design-qa`
- `load skills product-design:get-context`
- `load skills product-design:ideate`
- `load skills product-design:image-to-code`
- `load skills product-design:index`
- `load skills product-design:project-status`
- `load skills product-design:research`
- `load skills product-design:share`
- `load skills product-design:url-to-code`
- `load skills product-design:user-context`

## Router Only

The `product-design:index` skill (loaded as `product-design:index` once the plugin is installed) chooses the next focused Product Design skill. It does not do that skill's work. An explicit `Product Design`, `product-design`, or Product Design plugin mention always enters through `product-design:index`, even when Goose Apps or another tool is named in the same request. After the router is loaded, use the exact instruction for the focused Skill, such as `load skills product-design:get-context`.

If the user names a focused Product Design skill, use `load skills product-design:index` first and then that exact focused skill. Do not replace it with a related skill.

Goose prefixes every skill in this plugin with `product-design:` once installed via `goose plugin install`. Anticipate this: cross-skill references in this plugin's documentation and prose use the qualified form (`product-design:get-context`, `product-design:ideate`, ...). Skill directory names and `SKILL.md` frontmatter `name:` stay unqualified (e.g. `name: get-context`), per the Agent Skills specification — only the runtime-exposed, loadable name is plugin-qualified.

When a request matches `product-design:user-context`, `product-design:get-context`, `product-design:research`, `product-design:ideate`, `product-design:image-to-code`, `product-design:url-to-code`, `product-design:audit`, `product-design:design-qa`, `product-design:share`, or `product-design:project-status`, use `load skills product-design:{name}` for the matched Skill and follow it.

## Planning-aware routing

Apply planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md` to involved multi-phase work. Explicit Beads/`bd`/tracking requests use `load skills product-design:project-status` and may activate tracking. An existing target-project `.beads/` may also activate tracking for related involved work. Planning vocabulary alone—an epic, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, or next task—routes to an **offer** of `product-design:project-status`; obtain confirmation before creating or updating Beads, and continue the focused workflow while waiting.

Do not keyword-match isolated words. Simple one-shot work, ordinary phase prose, and incidental uses such as “the button is ready” or “the card owner” do not trigger or offer tracking. Tracking is additive and never a mandatory gate.

For requests to audit, review, critique, inspect, assess, analyze, evaluate, or give feedback on an existing product experience, `load skills product-design:audit` directly; do not `load skills product-design:get-context` first. If the same request also asks to build, fix, redesign, or implement afterward, run `product-design:audit` first, then continue through the appropriate normal workflow.

For visual ideation, `product-design:ideate` is the focused workflow. `load skills product-design:get-context` to resolve the minimum brief and play back any defaults before `product-design:ideate` starts. Multi-step work uses two approvals: select one of three board pages assembled from separately generated full-size screens, then approve the selected screen set. Never interpret journey selection as permission to build.

For clone or recreation of a live URL, `load skills product-design:get-context` and `load skills product-design:url-to-code`; execute capture/build after the brief playback. Exact clones do not require a new journey competition; applicable involved-work G1 checks remain.

For a redesign, improvement, or new site based on a URL, `load skills product-design:get-context` to confirm the redesign brief. `Like <URL>` means redesign, not clone. Capture the current site with screenshots, attach those screenshots to the `product-design:ideate` Image Gen calls, then execute `product-design:ideate`.

## Goose Capability Preflight

Do not assume Codex Desktop, ChatGPT Work Mode, `@Browser`, `@Sites`, a cloud browser, or `terminal.local` exists in Goose. Before a workflow needs capture, image generation, app rendering, or deployment:

1. Inspect the tools currently exposed by Goose. Tool names vary by installed extension, so route by capability rather than a hard-coded vendor name.
2. A browser-capable tool must be able to open or capture the required source or rendered implementation. A hosting-capable tool must return a working URL. Goose Apps can create or iterate a sandboxed app, but it is not evidence that a browser comparison or deployment occurred.
3. Recommend a Figma-capable plugin or MCP server when the workflow needs direct Figma access. Recommend [image-mcp](https://github.com/bioinfornatics/image-mcp) when image generation is needed and no equivalent provider is available. Treat both as companion capabilities: do not imply that this plugin installs them automatically.
4. If a required capability is absent, name the missing capability and use a fallback only when the workflow permits it. Never claim visual verification, publishing, or sharing from build success or app creation alone.

## Product Design + Goose Apps Contract

When the request explicitly combines Product Design and Goose Apps, preserve this order:

1. `load skills product-design:index`.
2. `load skills product-design:get-context`, resolve the applicable brief (including G1 for involved work), and play it back. Target and outcome are the universal minimum, not a waiver of the other applicable criteria.
3. Load and complete the focused design workflow. For a new multi-step interface without a selected visual target, `product-design:ideate` defines three journeys, generates every screen of three complete end-to-end journeys separately in full-evidence, including outcomes and critical recovery, assembles one board page per variant, then waits for journey selection and selected screen-set approval. For a genuine single-screen target, wait for one selected visual option.
4. After explicit G4 build scope, use Goose Apps as the rendering target (`listApps` to inspect existing apps, then `createApp` or `iterateApp` as appropriate). Do not call Apps in parallel with skill loading or use Apps to skip context, visual selection, or design decisions.
5. Capture the rendered result with an available browser-capable tool and run `product-design:design-qa` before handoff. If capture is unavailable, report QA as blocked.
6. `load skills product-design:share` only when the user requests a shareable deployment; Apps creation is not a deployment URL.

A conceptual question such as “how do you see it?” may stop after the brief, workflow recommendation, and explicit next question. Do not create or mutate an app unless the user asked to proceed or the brief clearly requests an implementation now.

## Value, intentions and useful initiative

Route by the requested design outcome, not by rendering tools. For involved work, get-context reads product experience method at `PLUGIN_ROOT/references/product-experience-method.md`: supplied feedback → questions/answers/evidence → Product/UX/UI decisions → scenarios/screens/states → verification. Start from responsibility/value, not stack/palette. Personas are complementary; one scenario does not cover the whole product. Conversation transforms the relevant workspace rather than defaulting to a permanent transcript sidebar. Proactivity includes opportunities and exceptions with bounded preparation/execution and useful result evidence, not endless notifications. Native presentations require editable content, sources and explicit branding/authority boundaries. These conditional contracts continue through ideate, build and QA; mentioning them in a brief is not enough.

## No Visual Target, No Build

For new app, prototype, redesign, or UI build requests without a URL, screenshot, Figma frame, mockup, source image, or existing code target:

- `product-design:ideate` is the focused workflow.
- `load skills product-design:get-context` to resolve the minimum brief.
- When visual exploration is the requested next step, `product-design:get-context` has resolved the applicable brief and G1 is not blocked, play back the assumptions and run `product-design:ideate` in the same turn. A discovery-only or no-build decision does not trigger generation. Target and outcome alone do not waive involved-work value, success, evidence and constraint checks.
- For a multi-step workflow, define exactly three journeys, freeze full-evidence regardless of risk and generate all required screens separately, then assemble one board page per variant. Never generate a multi-screen composite image. Wait for the user to choose a page.
- Plan all three screen inventories before generation. After selection, reuse the chosen complete set; for an already selected historical direction, complete its missing journey evidence without reopening selection, correct defects and obtain explicit full screen-set approval. Individual screen files—not a board rendering—are build sources.
- For a genuinely single-screen target with no journey, show exactly three comparable visual options for that same screen and wait for selection.
- Do not scaffold, edit application files, or start an app server before the journey and its complete corrected screen set, or the isolated single-screen visual option, are approved and explicit G4 build scope is granted.

`Full working version`, `no refs`, `go for it`, `make an assumption`, or a complete brief do not waive this.

## User Context

Use `load skills product-design:user-context` when the user asks to:

- Set up Product Design
- Get started with Product Design
- Onboard with Product Design
- Save product or design sources
- See what Product Design remembers
- Update saved product or design context
- Remember a Product Design preference
- Setup my plugin

Adjust the context-gathering request to match the user's request. First-time setup differs from updating existing context.

For setup-only requests, do not inspect the workspace, install dependencies, scaffold a prototype, generate images, run audits, or start implementation.

When answering "what can you do?", "how do I get started?", or similar broad Product Design questions, `load skills product-design:user-context` and follow its persistence availability check before offering saved-context onboarding.

Saved user context is optional in Goose. `load skills product-design:user-context` only when the user asks to save/recall context or when relevant saved context is known to exist; do not make its preflight a mandatory gate for every workflow.

## Browser Annotation Updates

Treat annotations as scoped edits to the current prototype.

Read the annotation, its target, and the surrounding screen before changing code. Preserve the existing prototype by default: layout, style, content, routes, assets, interactions, and working behavior stay the same unless the annotation asks to change them.

Do not redesign nearby UI or rebuild the prototype just because an annotation touches that area. If the annotation is ambiguous and the choice would materially change the prototype, ask first.

For every locally reviewable Product Design build, the agent—not the user—starts/reuses and verifies the local server and returns the URL; never ask the user to run a terminal command themselves. Bundled templates already include annotation, so it's available automatically once the server is running. For an existing/user-provided project without the mechanism, offer `product-design:annotate-inject` rather than installing it automatically — it edits the user's own codebase (a new API route, a mounted overlay component), so treat it like any other non-trivial change to existing code: confirm before doing it, per existing codebase edits at `PLUGIN_ROOT/references/existing-codebase-edits.md`. Do not block or delay handoff on the user's answer; hand off the build first, then offer annotation as a follow-up.

Route here to `product-design:annotate` when the user says they left, drew, marked, or added annotations on a running local project, or asks to check/apply annotation feedback. This works out of the box for prototypes scaffolded from any bundled template (Vite, Next.js, Nuxt, Astro). For an existing project without the mechanism, offer `product-design:annotate-inject` and obtain installation consent before changes, then `load skills product-design:annotate` for feedback that actually exists. Ordinary verbal feedback does not require injection.

Do not wait to be told annotations exist. For any project with the annotation mechanism installed and a dev server currently running, opportunistically check `.goose/annotations/inbox/` for that project at the start of a turn and whenever returning to that project's context, even if the user's message is about something else. If the inbox has pending records, `load skills product-design:annotate` before other work on that project.

## Skills

Use this as the root routing guidance for Product Design plugin work. If several focused skills apply, sequence them in the order that creates the most useful design workflow. Keep this index as a router; do not perform focused workflow logic here.

### `product-design:user-context`

Preflight, save, or answer from Product Design setup context only for an explicit setup/save/recall request or relevant saved context known to exist. It is not a prerequisite for ordinary workflows. Reading existing context does not require write access; saving does. This skill owns Product Design plugin-scoped context and preference policy.

### `product-design:get-context`

Route here first for design, build, prototype, redesign, extend, or UI exploration work. Target and intended outcome are the universal minimum. For involved work also apply G1 value, observable success, evidence and constraint criteria; tiny edits and exact clones use only applicable checks. Ask one targeted question for the highest-information material blocker; otherwise play back explicit assumptions and continue without waiting for playback approval.

### `product-design:research`

Investigate product discovery, current alternatives, user value and UX friction using inspectable sources or a capability-aware research plan. Route here for problem/value questions, user pain, onboarding/docs/developer workflow friction or current complaints. Exploration may end with a test plan or no-build recommendation; it does not automatically route to rendering.

### `product-design:audit`

Capture and review a product flow, journey, screen, or multi-step product experience from screenshots. Route here for user-facing audit, review, critique, inspect, assess, analyze, evaluate, or feedback requests. It reports UX, design, and accessibility findings tied to captured evidence; do not `load skills product-design:design-qa` for user-facing audits.

### `product-design:ideate`

Generate image-based visual alternatives, remixes, or concept directions for a component, screen, feature, workflow, or product idea. Route here after `product-design:get-context` has played back the minimum brief and the user needs visual exploration, design variants, alternatives to an existing design, or idea discovery before choosing a visual target. Prefer this over prose-only ideation unless the user asks for prose.

### `product-design:url-to-code`

Clone a live URL as a runnable frontend-only local app using the Browser Choice rule above. Load this alongside `product-design:get-context` when the user provides a production URL for a faithful local prototype or clone, but do not execute it until the minimum brief has been played back. It should not modify production code; stay in `product-design:get-context` when source selection is still unclear.

### `product-design:image-to-code`

Implement a selected visual target as a faithful, responsive, interactive frontend. Route here after `product-design:get-context` has played back the minimum brief and the user has chosen an ImageGen mock, screenshot, Figma frame, mockup, reference image, or other visual source. Do not start here when no visual target has been selected; `load skills product-design:get-context` and `load skills product-design:ideate` first.

### `product-design:share`

Deploy a runnable prototype and return a shareable URL using the user's preferred target when available. Route here when the user asks to share, deploy, publish, host, create a link, or make a prototype shareable with an available hosting tool.

### `product-design:design-qa`

Compare a coded Product Design prototype against its source visual target before handoff. Route here only as an internal helper after a prototype, `product-design:url-to-code` build, or `product-design:image-to-code` build has both a source visual and rendered implementation. Do not route broad UX critiques, audits, or product-flow reviews here; `load skills product-design:audit` instead.

### `product-design:annotate`

Process pending in-app annotations left on a running local project (drawn regions plus notes) and turn them into scoped code edits. Route here when the user says they left/added annotations, marked up a region, or asks to check or apply annotation feedback on a project with the mechanism installed (any bundled template, or an existing project after `product-design:annotate-inject`).

### `product-design:annotate-inject`

Install annotation only into a project that lacks it, after an explicit installation request or confirmation. Supports Next.js, Nuxt, Astro and Vite, with a porting path for other frameworks. Detect an existing mechanism first, including in external projects; never inject merely because a project is not a bundled template.

### `product-design:project-status`

Optional Beads (`bd`) tracking for a Product Design project's phases or annotation rounds. Route and activate for an explicit Beads/`bd`/tracking request; an existing target-project `.beads/` may activate tracking for related involved work. For planning vocabulary alone—epic, phase gate, acceptance criteria, dependencies, ready/blocked, owner, evidence, or next task—route to an offer and require confirmation before mutating Beads. Never a gate on another skill; simple one-shot requests and isolated vocabulary do not trigger.

## Executable transitions

Focused brief/ideation/build/QA skills call executable transitions at `PLUGIN_ROOT/references/executable-transitions.md` at their boundaries. A receipt grants only its named scope/phase after fresh consumption; it is not authenticated human approval. Exact clones, provided targets and historical selections keep explicit branches without invented G2 competition. Setup/discovery/audit do not need fictitious build gates.

## Source-artifact routing

For planned generation/editing or consumption of screen sources, read source artifacts at PLUGIN_ROOT/references/source-artifacts.md and route to the focused phase. New calls require a source plan and destination-capability preflight even when manually orchestrated; the router never generates/copies images to bypass this. Historical selected-only continuation may present individual full-size sources without a fake three-variant board or app scaffold.

## Mode and decision scope

Multi-step product ideation requires three complete end-to-end journeys in full-evidence, not three landing pages or anchors, even at low risk. Lean applies only to explicitly isolated single-screen work. Scope by a useful scenario, not a screen-count shortcut. Include the outcome and critical recovery before comparing. Require explicit complete corrected selected-set approval and G4 before build. Already selected directions are continued, not forced into three new alternatives. Personas are complementary service lanes; a reusable specialized view may coexist with the chosen home. A public marketing landing is not evidence for the authenticated product journey.
