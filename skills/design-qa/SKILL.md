---
name: design-qa
description: Compares approved source visuals with a browser-rendered implementation and records canonical passed or blocked QA. Use when a Product Design build needs verification before handoff; broad experience critique belongs to audit.
---

# Design QA

## Phase evidence obligations

Write canonical design-qa.json from actual source/render comparisons and executed checks. Cite the approved state and current specification; report stale bindings, unavailable checks and proposed value tests separately. Derive Markdown from JSON and freshly consume the review handoff.

For material why/impact dependencies, follow `PLUGIN_ROOT/references/product-lifecycle-reasoning.md`. For scoped specification retrieval, follow `PLUGIN_ROOT/references/product-information-disclosure.md` and use `PLUGIN_ROOT/scripts/read-product-information.mjs`; finish relevant continuations before acting.

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

Use this internal helper to compare a prototype's source design against the rendered implementation before handoff.

Do not use this skill for broad UX critique, design critique, product audits, or flow reviews. Use `load skills product-design:audit` for those user-facing requests.

Use this skill before every Product Design build handoff.

Design QA proves implementation fidelity and interaction integrity. It is not a usability study and must not be described as user validation unless representative participants performed defined tasks and their evidence is included.

A passing QA run requires both:

- a source visual target: Figma node, image, screenshot, mockup, or source capture
- a rendered implementation: local URL, deployed URL, app screen, component, or screenshot

If either artifact cannot be opened, captured, or compared, write canonical `design-qa.json` with `finalResult: blocked` and derive `design-qa.md` through the adapter when prerequisites are valid and name the blocker. Do not let the build skill hand off as done.

## Canonical QA and executable handoff

Read executable transitions at `PLUGIN_ROOT/references/executable-transitions.md`. Project-root `design-qa.json` is authoritative; `design-qa.md` is the adapter-derived human view, not a separately authored pass. Use the exact G4.executionContract.requiredStates and approved sources; capture source/render/combined evidence, test interactions and record mandatory hashes, five surfaces, console availability, accessibility/responsiveness, findings/history, limitations and independent G5 checks. Snapshot all approved implementation roots using `snapshotImplementation` after capture; code/assets/config changes require recapture. Hashes prove identity, not pixels or true browser execution.

Run `scripts/check-workflow-evidence.mjs` with operation `review-handoff` and qa `design-qa.json`. Passing reports also require an authored passing G5 gate bound to that JSON. Missing browser capability or open material findings require a canonical blocked report with blockers and honest not-run states; run the adapter to persist it, never fabricate G5. Invalid source/gate prerequisites produce a failed receipt, not a validated QA report. Preserve versioned captures and correction/recomparison history; never remove or downgrade material findings to get a pass.

After passing publication, run `--consume` for that request immediately before handoff and cite `.gates/review-handoff.receipt.json`, `design-qa.json` and `design-qa.md`. Nonzero/blocked, stale code, missing state/hash or JSON/Markdown divergence stops handoff. Regenerate Markdown only from canonical JSON through the adapter. G5 is not a user study or G6. Apps/remote targets without locally verifiable implementation evidence remain freshness-blocked, not silently exempt.

## Source identity and traceability

When QA consumes generated/edited screen sources, read source artifacts at PLUGIN_ROOT/references/source-artifacts.md and run PLUGIN_ROOT/scripts/check-source-artifacts.mjs with the plan and ledger. Resolve every required source ID to its accepted canonical file/hash and linked specification/scenario/decision/screenState/verification; recheck dependency impact before comparisons and handoff. A changed spec/context cannot pass merely because rendering matches old pixels. Preserve history and route material source corrections through plan/preflight, exact-byte review and renewed affected approvals; hashes and structural links do not prove semantics or research.

## Critical Overrides

Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## Workflow

For involved multi-phase work, follow planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md`. State epic/outcome, G5 phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task. Mirror through `product-design:project-status` only when active; vocabulary alone requires an offer and confirmation. A Beads update never decides QA; visual and interaction evidence does.

Compare the intended design to the implementation as a product-quality reviewer, not as a generic aesthetic critic. The output must be a prioritized fix list grounded in evidence from both artifacts.

Apply both G5 gates in product decision gates at `PLUGIN_ROOT/references/product-decision-gates.md`: execution quality and product-test validity. Verify the selected journey, hypothesis, evaluation slice and success criterion; primary task, realistic-enough data/states, test scenario and limitations must be explicit. A faithful implementation of the wrong or untestable journey is `blocked`. For involved work write `.gates/05-prototype-to-review.md`.

For involved work, read product experience method at `PLUGIN_ROOT/references/product-experience-method.md` and compare the experience blueprint against the approved sources and rendered task. Verify traced questions/decisions, responsibility/value scenario, intent location and direct controls, context/return and manual edits. When applicable check why-now opportunity/exception work, mandate/effect boundaries, late/unknown/revoked states and native artifact/brand claims. Mark unmet material design consequences blocked or explicitly out of scope; a faithful generic dashboard does not satisfy them. This checks execution and test validity, not measured user value.

For involved work read product discovery questions at `PLUGIN_ROOT/references/product-discovery-questions.md`. Confirm the prototype can test the stated task/value hypothesis against the current alternative with realistic states and outcome/guardrails. Check AI uncertainty, correction and fallback when applicable; fabricated benefits or metrics cannot pass test validity. Distinguish a usable proposed test from an executable participant study (access, consent, baseline and decision thresholds resolved), and both from measured user/operational results. G5 may approve a review prototype while the user study remains not run; it does not grant G6.

Do not write the QA review from memory, code, or file paths alone. Open or capture both the source design and the implementation first, then compare what is actually visible.

Do not pretend separate image views are side-by-side comparison. Put the source image and the implementation screenshot together in the same comparison input, then judge the visible differences from that combined input.

Design QA is an iteration loop. The first comparison may pass only when it finds no actionable P0/P1/P2 differences and no visual fixes are made in response.

When a comparison finds any P0/P1/P2 issue:

- Record the finding and keep the current result blocked.
- Apply the fix.
- Capture the revised implementation at the same viewport and state.
- Compare the revised capture against the source again.

A later pass must identify the earlier findings, the fixes made, and the post-fix visual evidence. Build, dependency, lint, deployment, and preview troubleshooting do not count as design-QA iterations.

1. Identify the comparison target.
   - For a multi-screen journey, compare each implemented state against its corresponding approved detailed screen source, then verify end-to-end continuity. Do not compare the implementation only against the board page or its screenshot.
   - Determine the source design: Figma node, image, design board, screenshot, spec, or mockup.
   - Determine the implementation: local URL, deployed URL, app screen, component, screenshot, or code-rendered view.
   - Match the same viewport, state, theme, device density, route, content, auth state, and interaction state before judging.
   - If artifacts do not represent the same state, call that out first and avoid false precision.

2. Capture evidence.
   - For Figma, use design context and screenshot tools when available.
   - For web/app implementations, follow the Goose Capability Preflight rule in `load skills product-design:index` (section goose-capability-preflight). Follow the active build skill's “Previewing prototypes in Goose” section before opening a local implementation. Then capture screenshots at the intended viewport.
   - Capture additional states when relevant: mobile/desktop, hover/focus/active, empty/loading/error, dark/light, and key responsive breakpoints.
   - Save paths or URLs for screenshots when available so findings can cite evidence.
   - Capturing screenshots is not enough. Put the source image and the implementation screenshot together in the same comparison input before judging.

3. Normalize before comparing.
   - Align crop, viewport size, scale, and device frame. Do not compare a framed mockup to an unframed page without noting the mismatch.
   - Prefer comparing content regions over full browser chrome or surrounding canvas.

4. Compare at the right level of detail.
   - Use a full-view comparison to judge overall composition, hierarchy, layout, density, and responsive structure.
   - Use focused region comparisons when important details are too small to judge in the full-view comparison.
   - Choose focused regions from the actual source and implementation. Use them where fidelity depends on precise typography, alignment, imagery, assets, icons, logos, controls, forms, navigation, tables, dense UI, or visible interaction states.
   - If no focused region is needed, say why in `design-qa.md`.
   - Do not pass QA from a full-view comparison alone when important details are not clearly readable.

5. Review systematically.
   - Read [references/qa-rubric.md](references/qa-rubric.md) when the QA pass spans more than a quick visual check.
   - Check information architecture, layout, spacing, typography/fonts, color, imagery/image quality, icons, copy, affordances, interaction states, responsiveness, accessibility, and polish.
   - Always make a specific pass over the five required fidelity surfaces: fonts/typography, spacing/layout rhythm, colors/tokens, image quality, and copy/content. Do this even if the user did not name those areas explicitly.
   - If the mock does not address some issue you're seeing (e.g. a null state), call that out as a separate finding as a shortcoming of the mock to be addressed.
   - Your other goal is to decide whether the implementation "looks as good" as the mock. If there are stylistic problems, call them out. If the user's prompt is leaking into the implementation (vs letting the app stand on its own), call that out as well.
   - Distinguish design drift from intentional product/code constraints. If a deviation may be intentional, phrase it as a question or assumption.

6. Produce a fix-oriented QA report.
   - Lead with findings, ordered by severity and user impact.
   - For each finding include: severity, location, what differs, evidence, why it matters, and the concrete fix.
   - Include exact CSS/component/token suggestions when the implementation context is available.
   - Separate objective mismatches from subjective polish recommendations.
   - Do not say a design matches, is done, or is as good as it can get until the required fidelity surfaces have been checked and any remaining differences are explicitly classified as acceptable, expected, or still actionable.
   - End with a concise implementation checklist.

## Required Fidelity Surfaces

Every QA report must explicitly evaluate these surfaces:

- Fonts and typography: family, fallback, weight, size, line height, letter spacing, antialiasing, hierarchy, wrapping, truncation, and whether display text and small UI text use appropriate optical weights. It is incredibly important to check fonts carefully for fidelity, including looking up similar typefaces or using image analysis to find the font differences.
- Spacing and layout rhythm: frame size, crop, alignment, margins, padding, grid tracks, section gaps, component spacing, radii, shadows/elevation, and vertical rhythm.
- Colors and visual tokens: sampled or inferred palette, gradients, opacity, contrast, semantic state colors, foreground/background balance, and whether CSS tokens map to the source design.
- Image quality and asset fidelity: subject correctness, crop, scale, sharpness, compression, transparency halos, masking, background treatment, raster-vs-vector appropriateness, and whether generated assets match the source art direction. Fail QA if logos, illustrations, decorative marks, product imagery, non-standard icons, or other visible image assets from the visual target were replaced with custom inline SVG, handcrafted SVG, HTML elements, div/span shapes, CSS drawings, gradients, emoji, text glyphs, placeholder shapes, or code-native approximations.
- Copy and content of app-specific text

Ordinary CSS backgrounds, borders and gradients matching approved UI surfaces/tokens are allowed. The asset-substitution prohibition concerns drawing stand-ins for actual image/icon assets, not normal component styling or source/library vectors.

## Severity

- `P0`: Blocks core use, severe accessibility failure, broken layout, or impossible task.
- `P1`: Major design mismatch or usability regression likely to be noticed by users.
- `P2`: Moderate visual drift, inconsistent state, responsive issue, or fixable polish gap.
- `P3`: Minor refinement that improves fidelity but does not block acceptance.

Treat viewport overflow that hides persistent app controls, and mismatches that materially change above-the-fold content, major-region proportions, text wrapping, or interface density, as P2 or higher.

## Output Format

Use this structure unless the user asks otherwise:

```markdown
**Findings**
- [P1] Short issue title
  Location: screen/component/selector/file if known.
  Evidence: design does X, implementation does Y.
  Impact: why this matters.
  Fix: concrete change.

**Open Questions**
- Any ambiguity about intentional deviations, unavailable states, or missing artifacts.

**Implementation Checklist**
- Ordered fixes that can be executed directly.

**Follow-up Polish**
- P3 refinements that can improve fidelity after handoff.
```

If there are no substantive mismatches, say that clearly and list any residual test gaps.

Before handoff save canonical project-root `design-qa.json` and run the adapter to derive `design-qa.md`. The output structure above is a human-reading guide, not a second mutable authority.

`design-qa.md` must include:

- source visual truth path
- implementation screenshot path
- viewport
- state
- full-view comparison evidence
- focused region comparison evidence, or why it was not needed
- findings
- comparison history for every P0/P1/P2 iteration: earlier findings, fixes made, and post-fix visual evidence
- final result

For Goose builds, `design-qa.md` must include the browser-rendered implementation screenshot, viewport, primary interactions tested, console availability and final result. When console access is available, inspect it and block on reproducible runtime errors. When it is unavailable, record the reason and unchecked runtime limitation; do not claim a clean console or disable an available check. A missing console capability alone does not waive browser/interaction evidence. If browser-rendered evidence is missing, `final result` is `blocked`.

`final result` must be exactly `passed` or `blocked`.

Use `passed` when there are no actionable P0/P1/P2 findings. P3 findings may remain as follow-up polish.
Use `blocked` when actionable P0/P1/P2 findings remain and name the blocker.

Return the file path with the QA report.
