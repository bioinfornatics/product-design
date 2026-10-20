# Critical Overrides

These rules override generic assistant defaults for Product Design work.

## Context

- When working inside an existing project or product, find similar flows, screens, components, and UX patterns first. Build on the product's existing design system. Do not reinvent the wheel. Look for style sheets, tokens, and other materials that constitute the design and adhere to them in your work.

## Lifecycle evidence reasoning

- For involved work and material change-impact questions, follow [product lifecycle reasoning](product-lifecycle-reasoning.md): retrieve, traverse declared rationale/impact, explore material uncertainty, verify actual authority/bytes, then act within scope. Missing/stale links and bounded graph coverage do not grant readiness or renew approvals. Native Beads/Entire remain optional authorities, not duplicate stores.

## Optional tooling

- For the first involved workflow on a resolved target or an explicit tracking/provenance/setup request, follow [tooling onboarding](tooling-onboarding.md). Use a current session preflight when available; no check/setup loop on every prompt. Missing Beads or Entire does not block local design. The agent performs setup only with target-bound consent and preserves external agents and existing configuration; no automatic initialization hook.

## Saved User Context

- If `user-context.md` exists, use it by default.
- Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets to ground Product Design work.
- Ideation, prototypes, audits, clones, and critiques should match the saved product context unless the user asks for something different.
- When a workflow needs visual grounding, attach or include relevant saved screenshots, reference images, tokens, design language, and component references in ImageGen, ideation, prototype, audit, and critique work.

## How to communicate

- Follow [communication-protocol](communication-protocol.md)

## Build Handoff

- Completion wording below applies only after canonical QA passes and the review-handoff receipt is freshly consumed under [executable transitions](executable-transitions.md). If blocked, return the blocker and available work-in-progress URL as unverified, never say finished. A link alone does not pass G5.

- After an app, prototype, clone, redesign, or image-to-code build, return the prototype link first. This handoff is not blocked by sharing setup.
- After the link, say: `I've finished building. Let me know if I can tighten anything up or build out more functionality.`
- If annotation is installed and verified in the handed-off project, add: `You can also suggest and make updates with the annotation tool.` An exposed tool alone does not prove that project's annotation works. If optional installation is unconfirmed, say it is not installed and offer it without delaying an otherwise verified handoff.
- Add one short share nudge. Before naming a share target, check saved Product Design context and current available tools for a hosting target that `share` can use. If a target is available or preferred, ask whether to share with the team through that target. If no target is clear, ask whether they want to share with the team and route to `share` to choose the target.
- Keep the wording plain and human.

## Re-read this file

- Before every second user-facing assistant message, read this file, reminding of these principles.
- A user-facing assistant message is any message sent in `commentary` or `final`.

## Prototype phase vs. production phase

- A prototype may live inside the eventual production boilerplate. “Real app,” “full working version,” “use Next.js,” or the presence of Prisma/MSAL does not authorize backend implementation.
- For design or journey validation, default to realistic frontend mock data. Do not add product-specific database schema/migrations, repositories, services, server actions, API integrations, real auth, or roles unless the user explicitly requests the production phase after validation.
- Preserve existing infrastructure but do not extend it speculatively. Record deferred production work in an active tracker only when tracking is already in scope.
- Server startup is agent-owned: start/reuse the server, verify the review URL, and keep it running. Bundled templates already include annotation. In an existing project, install annotation only after an explicit installation request or confirmation; optional annotation consent never blocks an otherwise verified handoff. Never make the user open a terminal and execute the startup command.

## Explore vs. Design vs. Build

- Do not build from under-specified product context alone.
- Do not treat "try to fulfill first" as permission to skip source capture or design mock creation. Follow the workflows prescribed in this plugin as contracts.
- For URLs, capture and open a screenshot first. If the reference cannot be captured, opened, or attached, stop before generating options from prose only.
- Never invent a better first screen, landing page, hero, card style, icon set, image style, color palette, radius, spacing, or typography when cloning or matching a provided source. Match the source.
- Check the work like a senior designer. Look for broken layouts, cropped images, bad padding, bad margins, wrong font styles, wrong font weights, incorrect borders, and incorrect border radii.
- Screenshots are not QA by themselves. Put the reference image and the prototype screenshot together in the same comparison input, then judge the visible differences from that combined input. Use the same viewport and state, fix visible mismatches, then compare again.
- Bring the approved core experience to life with realistic mock data and working navigation, primary controls and journey states. An approved screen set and explicit G4 scope authorize its necessary pages/routes; do not add unrelated or unapproved pages. Controls outside the core experience may be visual-only if declared out of scope.

## Browser user

- Only use the user's chosen browser. If you need to use the Playwright CLI or MCP directly, ask the user before proceeding.
- Provide URLs, screenshots, mocks, Figma files, or other visual sources, including detailed art direction to the available image-generation tool when generating designs and assets.

## Working with and making assets

Reuse authorized source/design-system assets first; generate only missing raster imagery. Real source vectors and library icons are allowed. CSS backgrounds, borders and gradients matching approved UI surfaces/tokens are normal styling, not permission to draw substitute images or logos.

- Never fake visible assets with ASCII, prose, text symbols, emoji, placeholder boxes, CSS art, div art, handcrafted SVGs, inline SVGs, or approximate code drawings. Use real source assets when available. Use an available image-generation tool for image assets when source assets are missing. Use the closest matching icon library for icons.
- Work like a designer. Measure the component or section first, then create or place the asset to fit that slot. Match the needed dimensions, crop, subject, palette, and density. Do not lazily crop sprite sheets, stretch screenshots, or use images that do not fit seamlessly into the design.
