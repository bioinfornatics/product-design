---
name: share
description: Deploys a reviewable prototype to an explicitly chosen available hosting target and verifies its URL. Use when the user explicitly requests sharing, hosting, publishing, or deployment.
---

# Share

## Phase evidence obligations

Use the current canonical QA and review-handoff evidence before deployment. Preserve their references in the sharing handoff and verify the actual deployment URL; tool availability or a build log is not publication evidence.

For material why/impact dependencies, follow `PLUGIN_ROOT/references/product-lifecycle-reasoning.md`. For scoped specification retrieval, follow `PLUGIN_ROOT/references/product-information-disclosure.md` and use `PLUGIN_ROOT/scripts/read-product-information.mjs`; finish relevant continuations before acting.

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

Deploy the user's runnable prototype so they can share it with others.

## Critical Overrides

- Before proceeding, use `load skills product-design:index` for routing.
- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## User Context

Use a saved share-target preference only when Product Design user context is configured and relevant; otherwise ask for the target.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

For involved multi-phase work, follow planning-aware routing and optional tracking at `PLUGIN_ROOT/references/planning-and-tracking.md`. At handoff state epic/outcome, release phase gate, acceptance criteria, dependencies, ready/blocked state, owner, deployment evidence, and next task. Mirror through `product-design:project-status` only for explicit tracking, an applicable existing `.beads/`, or a confirmed vocabulary-only offer. Tracking is optional and never a deployment gate.

1. Confirm the prototype directory and the user's preferred deployment target.
2. If the user names Sites, Vercel, or another deployment tool, treat it as the selected hosting target only if that capability is exposed in the current Goose session.
3. If the user did not choose a target, ask one question:

> Which available hosting target should I use to deploy this prototype?

4. Use the selected deployment tool when it is available.
5. If the selected tool is not available, say that clearly and ask whether to use another target.
6. Run the deployment when possible. Do not give setup instructions if you can complete the deployment directly.
7. Return the shareable URL.
8. State any misses or manual follow-up the user still needs to do.

## Rules

- Do not deploy before the user chooses or confirms the target.
- Do not claim the prototype is shared until you have a working URL.
- If the selected tool is not available, say that clearly and ask whether to use another target.
