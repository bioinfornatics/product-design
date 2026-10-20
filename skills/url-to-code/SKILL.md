---
name: url-to-code
description: Clones an authorized live URL into a runnable frontend-only local app. Use when the user requests faithful recreation, not redesign; requires captured source evidence, scoped build approval, and canonical QA.
---

# URL To Code

## Phase evidence obligations

Bind the captured route/state and approved clone scope to the implementation handoff. Preserve source behavior and intent rather than adding a redesign; compare rendered output only against the captured source and record missing evidence.

For material why/impact dependencies, follow `PLUGIN_ROOT/references/product-lifecycle-reasoning.md`. For scoped specification retrieval, follow `PLUGIN_ROOT/references/product-information-disclosure.md` and use `PLUGIN_ROOT/scripts/read-product-information.mjs`; finish relevant continuations before acting.

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

If the user explicitly invokes this skill, continue.

Only continue when the user asks to clone or recreate the current site.

If the user says `like`, `better`, `redesign`, or `improve`, return to `load skills product-design:index`.

Clone `<target-url>` as a real interactive, frontend-only local app or website. The clone should look and interact like the source.

## Executable clone/build boundary

Read executable transitions at `PLUGIN_ROOT/references/executable-transitions.md`. Capture/import the agreed source states and record a reviewed ordered `approved-target-set` with workflow `exact-clone`, source approval and explicit G4.executionContract. The user's clone permission applies only to its agreed scope; do not invent authorization for new states or ambiguity. No generated manifest/G2 competition is required. Before step 8 (scaffolding/app mutation), run `scripts/check-workflow-evidence.mjs` with operation `prototype-build`, then `--consume` for the same request; require passed readiness for this project/scope. Applicable involved G1 checks remain. Stop on nonzero/blocked. After build, run canonical QA and consume `review-handoff`; a URL, build success or Markdown pass alone is not completion.

## Critical Overrides

- Before proceeding, use `load skills product-design:index` for routing.
- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## User Context

Saved user context is optional. Use the instruction `load skills product-design:user-context` only when the user asks to save or recall context, or when relevant saved context is known to exist.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

For an involved multi-phase clone, apply planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md`. Keep epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task explicit. `load skills product-design:project-status` for explicit tracking or an applicable existing `.beads/`; vocabulary alone requires an offer and confirmation before Beads changes. Tracking must not delay capture, build, or QA.

1. CRITICAL STEP: Warn the user that they must follow the target website's terms before proceeding. This workflow is only for apps and websites the user owns, or has permission to recreate.

2. Open the source URL using the Goose Capability Preflight rule in `load skills product-design:index` (section goose-capability-preflight).

3. Check that the page is correct.

- Do not continue if it shows the wrong page, a blocked page, a login page, a promo page, a loading screen, an error page, an app-install page, or an unrelated redirect.
- If the page is wrong, retry only with a browser authorized by the user or saved preference. Ask before switching to an unapproved browser; never bypass authentication or access controls.
- If every browser shows the wrong page, stop and tell the user what you can see.

4. Capture the source page carefully.

- Start at the top of the page.
- Scroll down in small steps.
- At each step, capture what is visible.
- Note any new sections, controls, sticky elements, animations, or lazy-loaded assets.
- Continue until the full page has been seen.
- Scroll back to the top and check whether anything changed.
- Repeat on mobile at `390 x 844`.

5. Use the browser DOM tools to gather everything needed to recreate the source.

- Elements
- Components
- Text
- Links
- Buttons and controls
- States
- Images
- Icons
- Fonts
- Videos
- SVGs
- Style sheets
- Colors
- Spacing
- Layout sizes
- Responsive behavior

6. Find and test the page interactions.

- Use the screenshots and browser DOM tools to find visible controls.
- Include navigation, buttons, links, inputs, menus, drawers, modals, tabs, carousels, hover states, sticky elements, and anything else the user can interact with.
- Test one control at a time.
- Return to the starting state before testing the next control.
- Save the result when the page visibly changes or the browser tools show a state change.

7. Copy the real assets from the source page.

- If the page loads the asset, treat it as available unless the browser cannot access or save it.
- If an image, logo, icon, font, video, SVG, sprite, mask, cursor, or background image is used by the page, copy it locally.
- If an image asset cannot be copied, generate a replacement with ImageGen using a screenshot of the original.
- If a font file cannot be copied, use the closest open source font match.
- If an icon or glyph cannot be copied, use the closest matching open source icon set. Do not default to Lucide unless it is the closest match.
- Briefly note any asset, font, or icon you replaced and why.

8. Create the local app with local prototype preflight at `PLUGIN_ROOT/references/local-prototype-preflight.md`.

9. Build only from what you captured, copied, or gathered from the source.

- Do not add new visual ideas.
- Do not use hotlinked source assets.
- Do not guess when source proof is available.

10. Run the local app.

### Previewing prototypes in Goose

Starting a development server is not verification. Use a browser-capable tool exposed in the current Goose session to open the URL returned by the local runtime, inspect the rendered page at the captured desktop and mobile viewports, test primary interactions, check console errors when supported, and capture evidence for design QA.

Do not substitute HTTP health, build success, preview-service status, Goose Apps creation, or deployment success for browser verification. Do not assume `sites-preview`, `terminal.local`, `@Browser`, or `@Sites` exists. If no browser-capable tool can capture both the source and prototype at comparable states, report verification as blocked.

11. Compare the local app against the original.

- Check desktop.
- Check mobile.
- Check every interaction you captured.
- Fix any obvious mismatch before running final QA.

12. Use `load skills product-design:design-qa`, then complete that Skill as the blocking build gate.

- Save the QA report as `design-qa.md` in the project root.
- Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
- Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
- If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
- Do not hand off unless `design-qa.md` exists and says `final result: passed`.

13. Handoff the app or website

- Use `load skills product-design:design-qa` and hand off only after its checks pass.
- Keep the prototype running locally.
- Provide a valid user-accessible local URL only when the active runtime returned one. Deploy only when the user asks to share, using `product-design:share`; Goose Apps creation alone is not deployment.
- After the prototype link, use the shared build handoff from `critical-overrides.md`. Do not add a different completion message.
- Include the post-build iteration and share nudge from critical overrides at `PLUGIN_ROOT/references/critical-overrides.md#build-handoff`.

## Hard Rules

- Capture source evidence first. Do not scaffold, write app code, start a server, or create the local prototype until desktop capture, mobile capture, key states, and every required asset, icon, control mark, and font is captured or replaced.
- Do not hand off until every interaction and state in the agreed core clone scope is captured and implemented. Record peripheral controls as out of scope; do not silently expand a page clone into the entire product.
- Do not build from memory, screenshots alone, guessed CSS, generic assets, or prior chats.
- Do not implement a saved state without source screenshot plus the available DOM/style/layout evidence for that state.
- Do not use hotlinked source assets in the final app.
- Do not create temporary CSS icons, text glyphs, emoji marks, placeholder blocks, or handmade SVGs while "waiting" to resolve assets. Resolve assets first, then build.
- If no approved browser can capture valid source and prototype evidence, stop and report the `product-design:design-qa` blocker.
