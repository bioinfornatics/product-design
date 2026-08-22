# End-to-end journey boards and screen production

Three images are useful only when they support one decision. For a multi-step product, the first decision is **which complete user journey should exist**, not which isolated screen looks best.

## A — Freeze the comparison contract

Before image generation, freeze target user/context, entry trigger, exact start boundary, exact end outcome, common scenario/data, success criterion, design-system constraints and evidence level. Every candidate journey uses this same contract.

## B — Define three journey hypotheses

Create three meaningfully different interaction strategies. For each specify thesis, ordered happy path, decisions, critical branch/recovery, progressive disclosure, assumptions, risk and expected advantage. The strategies must differ in how the user reaches the outcome—not merely in color, layout or naming.

## C — Generate three end-to-end boards

Generate exactly three independent 1024 × 1024 images, sequentially. Each image is a single sprite sheet/contact sheet/storyboard for **one complete journey**.

Each board must:

- be one composite image containing the entire candidate journey;
- show the full path from the frozen start to the frozen end;
- contain 4–6 recognizable miniature UI screens in a regular grid: normally 2 × 2 for four steps or 3 × 2 for five or six;
- carry one large, high-contrast number badge per miniature, sequentially from 1 with no gap or duplicate;
- use a short step label and persistent screen ID such as J1-S1, J1-S2 beside each number;
- read left to right and then top to bottom, with restrained arrows only when they clarify sequencing;
- depict real interface anatomy in each miniature rather than prose cards, caption-only boxes, illustrations, or device mockups;
- include entry/orientation, core decision, action/commitment, result, and one critical recovery when material;
- use the same persona, content, dates and business data across boards;
- remain readable as a 1024 × 1024 overview; use simplified low-fidelity UI if needed;
- contain one journey only—never multiple alternatives inside one image.

Inspect the generated pixels, not just the prompt. Regenerate a board if its miniatures, visible numbering, reading order, or UI states do not satisfy this contract. Labels should remain short because image-generated typography is less reliable than numbers and screen structure.

Never generate image 1 as entry, image 2 as decision and image 3 as result. Never compare a home screen against a booking screen. The unit of comparison is the complete journey.

## D — User selects the journey

Show the three boards and stop. The displayed image order defines options 1–3. The user selects one complete journey or requests a revision. Record the choice in .gates/02-journey-selection.md.

## E — Plan detailed screen production

After selection, derive an ordered screen contract before generating more images. For every screen record:

- stable screen ID and name;
- purpose and user question answered;
- entry state and exit action;
- visible content/data;
- interaction and validation states;
- source board panel;
- dependencies on previous/next screens;
- whether it is required, optional or recovery.

Save it to .gates/03-screen-production-plan.md. Remove duplicate screens and keep only what is required to test the selected journey.

## F — Generate screen by screen

Generate one 1024 × 1024 detailed screen image at a time, in journey order, at low quality when supported. The first screen establishes the visual anchor. Every later prompt must reference the selected board, the accepted preceding screen, the common shell, tokens, content and screen contract.

Each prompt must say explicitly: "Create only screen <ID>; do not show other journey steps, a storyboard, a device frame, or alternate directions." Preserve navigation, typography, spacing, imagery, component anatomy and data continuity.

Inspect each result before continuing. If it contradicts the screen contract or visual anchor, regenerate that screen only. Do not silently change the journey while producing screens.

## G — Approve the screen set

After all required screens are visible, present the ordered screen list and ask the user to approve or identify screens to revise. The accepted ordered set is the visual source of truth for image-to-code. A journey board alone is insufficient for a multi-screen build.

## H — Single-screen exception

If the design target genuinely has no multi-step journey, generate three visual directions for the same screen, then build the selected result. Do not manufacture a journey board for a component-only task.
