---
name: ideate
description: Two-stage Product Design ideation workflow. For multi-step products, first generates exactly three comparable end-to-end journey boards, waits for journey selection, then plans and generates the selected journey one detailed screen at a time and waits for screen-set approval before build. For genuinely single-screen work, generates three comparable visual directions for that same screen.
---

# Ideate

Use after product-design:index and product-design:get-context have established the brief and G1 is not blocked.

## Critical boundaries

- Do not build, scaffold, start a server, call Goose Apps, or route to image-to-code while a multi-step journey has only a selected board.
- A multi-step build requires two user decisions: selected journey, then approved detailed screen set.
- The first three images must never be three different journey steps.
- Follow ../../references/critical-overrides.md.

## State machine

Use these states explicitly for involved work:

1. brief-ready
2. journey-boards-generated
3. journey-selected
4. screen-plan-created
5. screens-generated
6. screen-set-approved
7. ready-to-build

Record journey selection in .gates/02-journey-selection.md. Record the ordered screen plan and exact generated result paths/IDs in .gates/03-screen-production-plan.md. Record user approval in .gates/03-visual-selection.md.

## Decide the mode

### Multi-step journey mode

Use when the outcome requires more than one meaningful state, decision, handoff or screen. Follow the two stages below.

### Single-screen exception

Use only for a genuinely isolated screen, component, modal, panel or static page with no meaningful journey. Generate exactly three visual directions for that same state, wait for one selection, then hand the selected result to image-to-code.

## Common preflight

Before any generation:

1. Freeze target user/context, entry trigger, exact start boundary, exact end outcome, common scenario/data, success criterion, evidence level, design system and constraints.
2. Inspect provided screenshots, Figma frames, local images, Storybook, tokens and existing visual references directly. If a named source is inaccessible, stop and name the gap.
3. For multi-persona services, reconcile persona and backstage journeys in one service blueprint before choosing the persona slice to visualize.
4. Resolve exact current dates for time-sensitive mock data and reuse them consistently.
5. Use 1024 x 1024 by default. Override only for an explicit user size or source-fidelity requirement.
6. Request quality: low when supported. If unsupported, omit it or use automatic/default quality.

# Stage 1 — Compare complete journeys

## Define the three candidates

Create exactly three meaningfully different interaction strategies against the same frozen contract. Each candidate must include:

- thesis;
- complete ordered happy path;
- decisions and one critical recovery when material;
- progressive disclosure;
- assumptions and main risk;
- expected advantage and cheapest falsification experiment.

Do not vary only visual style. Do not assign candidate images to separate stages.

## Generate three journey boards

Launch three independent Image Gen calls sequentially. Each result is one 1024 x 1024 sprite sheet/contact sheet/storyboard for one complete candidate journey.

Every board must:

- be one composite image containing the whole journey, not separate image files for its steps;
- show the full path from the same start boundary to the same end outcome;
- contain 4–6 recognizable miniature UI screens in a clean, evenly spaced grid (normally 2 × 2 for four steps or 3 × 2 for five or six);
- place a large, high-contrast sequential number badge (1, 2, 3...) on every miniature, with no missing or duplicated number;
- pair each number with a short step label and stable board-local screen ID such as J1-S1, J1-S2;
- make reading order unambiguous from left to right, then top to bottom, reinforced by restrained arrows when useful;
- show actual UI anatomy inside every miniature—navigation, content, controls and state appropriate to that step—rather than prose cards, captions standing in for screens, or generic illustrations;
- include entry/orientation, core decision, commitment/action, result, and critical recovery when relevant;
- use the same persona, business data, dates and constraints as the other boards;
- use simplified low-fidelity UI where needed so the entire journey remains legible;
- contain exactly one journey, never several alternatives;
- use no browser/device chrome and no extraneous feature inventory.

Never generate image 1 as entry, image 2 as decision and image 3 as result. Never compare different journey moments as if they were alternatives.

## Journey-board prompt

Adapt and send this prompt independently for each candidate:

```text
Create one 1024 x 1024 low-fidelity but realistic product journey board for a single end-to-end user journey.

This image is one candidate journey, not one screen and not a collection of alternative designs. Show the complete path from [FROZEN START] to [FROZEN END] as [4–6] numbered panels in clear reading order. Use the same persona, scenario, data, dates, outcome, design-system constraints and success criterion supplied in the brief.

Candidate journey thesis: [THESIS]
Ordered moments: [MOMENTS]
Critical decision/recovery: [DECISION OR RECOVERY]
Expected advantage: [ADVANTAGE]

Compose the board as a clean grid of [4–6] recognizable miniature UI screens inside this single image: use 2 × 2 for four steps or 3 × 2 for five or six unless the target aspect ratio clearly requires another regular grid. Give every miniature a large high-contrast number badge (1, 2, 3...) in sequence, a short step label, and a stable ID [Jx-S1...]. No number may be missing, repeated, or out of order. Reading order is left to right, then top to bottom; use restrained arrows only to reinforce it. Each miniature must depict the actual interface state with recognizable navigation, content and controls—not a prose card, caption-only box, generic illustration, or device mockup.

Keep the whole path readable at a glance. Simplify UI detail rather than omitting a journey moment. Keep labels very short because generated typography is fragile. Do not show only one checkpoint. Do not put multiple candidate journeys in this image. Do not add browser/device chrome.

Use the available design-system language as grounding, but prioritize flow comprehension over decorative polish. Generate at low quality when supported.
```

## Inspect, repair, present and stop

After each generation, inspect the saved artifact before accepting it. Verify that it is one composite image, contains the planned 4–6 miniature UI screens, shows exactly one visible sequential number per step, preserves the intended order, and keeps each miniature recognizable at overview size. Reject and regenerate that candidate board when a step is represented only by prose, a number is missing/duplicated/out of order, screens are cropped or illegible, or the output becomes one large screen instead of a journey grid. Do not repair structural failures only in the surrounding Markdown—the board itself must carry the sequence.

Wait until all three boards have readable, structurally valid saved artifacts. Number them by result-message order only, then embed all three in the selection message using Markdown image syntax and absolute filesystem paths. A textual path or relative path is insufficient. Save G2 scoring and evidence. Use this structure:

```md
![Journey 1 — <name>](/absolute/path/to/journey-1.png)

![Journey 2 — <name>](/absolute/path/to/journey-2.png)

![Journey 3 — <name>](/absolute/path/to/journey-3.png)

Which complete journey should I develop: 1, 2, or 3? Or tell me what you want to change in the proposed flows.
```

Do not say “build.” Do not route to image-to-code.

# Stage 2 — Produce the selected journey screen by screen

When the user selects board N:

1. Resolve N against the displayed journey boards, not submission order.
2. Say: `Journey N selected. I’ll map its screens, then generate them one by one for final approval.`
3. Write .gates/02-journey-selection.md with selected board path/result ID, evidence confidence and remaining assumptions.
4. Derive the minimum complete ordered screen set, normally 3–6 screens. Remove duplicates; preserve critical recovery states.
5. Write .gates/03-screen-production-plan.md before generating screens.

For each screen record:

- stable ID and name;
- purpose and user question answered;
- source board panel;
- entry state;
- visible content/data;
- primary and supporting actions;
- validation, empty, loading, error or recovery state when material;
- exit state and next screen;
- shared shell/components/assets;
- required, optional or recovery status.

Play back the screen list briefly. Continue without waiting unless the plan materially changes the selected journey or remains ambiguous; in that case ask one focused question.

## Generate one screen at a time

Generate screens sequentially in plan order. Each Image Gen call produces exactly one detailed 1024 x 1024 screen.

- The first accepted screen establishes the visual anchor.
- Every later call references the selected journey board, screen plan, accepted prior screen(s), shared shell, typography, tokens, imagery, component anatomy and exact common data.
- Inspect each result before generating the next. Regenerate only a screen that conflicts with the contract.
- Never silently add, remove or reorder journey steps during visual production.
- Never put several screens, states or alternative directions in one detailed-screen result.

## Detailed-screen prompt

Adapt this prompt for every screen:

```text
Create only detailed screen [SCREEN ID — NAME] from the selected end-to-end journey. Generate a single 1024 x 1024 image. Do not show other journey steps, a storyboard, a sprite sheet, a device/browser frame, or alternate design directions.

Journey context: [START → END]
Screen purpose: [PURPOSE]
Entry state: [ENTRY]
Visible content and exact shared data: [CONTENT]
Primary action: [ACTION]
Supporting/recovery state: [STATE]
Exit to: [NEXT SCREEN]

Preserve the selected journey board and accepted visual anchor exactly: shared application shell, navigation position, typography, spacing rhythm, colors/tokens, imagery, component anatomy and content continuity. Use the real design-system language. Keep one clear primary action and only necessary supporting content.

Generate at low quality when supported.
```

## Approve the screen set and stop

After every required screen has a readable saved artifact:

1. Verify ordered coverage from journey start to outcome.
2. Check continuity of shell, data, actions, terminology and states.
3. Record exact result paths/IDs and G3 verdict.
4. Present the ordered screen list and embed every screen exactly once using Markdown image syntax with its absolute path.
5. Ask only:

`Do you approve this complete screen set for build, or which screen IDs should I revise?`

If approved, set state screen-set-approved and route to image-to-code. If feedback affects one screen, regenerate that screen only. If feedback changes the journey, return to Stage 1 or update the screen plan explicitly.

# Single-screen exception workflow

Generate three independent 1024 x 1024 visual directions for the exact same screen, content, state and constraints. Launch calls sequentially; each result contains one direction only. Number by displayed order, ask which option to build, and route the selected result to image-to-code.

# Shared generation rules

- Use an exposed image-generation capability; if absent, stop and name the blocker.
- Never batch final Image Gen calls with Promise.all because displayed order is authoritative.
- Attach actual readable visual references; do not claim an attachment that was not sent.
- Never use generated imagery as a substitute for standard design-system controls.
- Preserve supplied hard constraints and dates.
- Avoid crowding, nested cards, decorative metrics and invented features.
- Body text should correspond to readable product sizes, usually 14–16 px.
- If quality: low is unsupported, omit it instead of failing.

Done in multi-step mode means a journey board is selected, every planned detailed screen has been generated, the ordered set is approved, G2/G3 records are complete, and image-to-code can resolve every source image unambiguously.