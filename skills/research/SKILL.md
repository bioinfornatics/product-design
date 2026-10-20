---
name: research
description: Examines source-grounded product problems, user value, current alternatives, and UX friction. Use when researching pain points, adoption barriers, support complaints, or a decision-changing product hypothesis.
---

# Research

## Skill loading and shared resources

For another Skill, use the instruction `load skills product-design:{name}` with its actual unqualified directory name substituted for {name}. Use the exposed skill-loading tool; do not open a sibling SKILL.md as a substitute. Load only the focused workflow required by the current step.

This Skill belongs to the complete Product Design plugin, not a standalone export. Resolve `PLUGIN_ROOT` two levels above this Skill directory. Paths written as `PLUGIN_ROOT/references/...` identify canonical shared policies in that bundle; read them only when the stated condition applies. Local `references/...` remain relative to this Skill. Source and packaging checks verify these paths and their transitive dependencies; do not copy or edit parallel policy versions manually.

Investigate the product/problem and decision the user specifies. For an existing product, prioritize task/workflow friction rather than a list of feature requests. For discovery, investigate current alternatives, frequency/consequence, user value, adoption and material technical/AI assumptions before recommending a solution.

## Select the evidence method

Read product discovery questions at `PLUGIN_ROOT/references/product-discovery-questions.md` for involved discovery or value research. Recover supplied evidence; pick the question with the greatest decision impact, not every possible theme. Use a source scan for inspectable existing material, a neutral interview/observation plan for unresolved real work, or a bounded concept/usability/feasibility test plan when that is the actual uncertainty. Do not automatically search all connectors or default every problem to a public complaints scan.

Without participant access and consent, produce the plan rather than claim interviews or tasks occurred. A participant plan states relevant roles and selection rationale, recent-task questions without pitching the solution, permission/privacy/retention needs, actual available access, task/method, baseline, target and guardrail, owner and continue/change/stop rule. Do not invent a fixed sample count, respondents, findings or statistical representativeness.

Reconcile counterevidence, duplicated complaints and sampling limits before claiming frequency. Include what works in the current alternative and total verification/correction effort, especially for AI. Results may support an explicit recommendation to change the hypothesis, defer or not build; do not force a UI recommendation from contradicted value.

## Phase evidence obligations

Write source-grounded findings and the resulting current decision into the authorized research/specification artifact. Link evidence and uncertainty to the affected question, scenario and proposed check; never relabel that proposal as an executed study.

For material why/impact dependencies, follow `PLUGIN_ROOT/references/product-lifecycle-reasoning.md`. For scoped specification retrieval, follow `PLUGIN_ROOT/references/product-information-disclosure.md` and use `PLUGIN_ROOT/scripts/read-product-information.mjs`; finish relevant continuations before acting.

## Critical Overrides

- Before proceeding, use `load skills product-design:index` for routing.
- Follow critical overrides at `PLUGIN_ROOT/references/critical-overrides.md`.

## User Context

Saved user context is optional. Use the instruction `load skills product-design:user-context` only when the user asks to save or recall context, or when relevant saved context is known to exist.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Evidence threshold

Call the work UX research only when it uses inspectable sources or participant evidence. LLM synthesis of a brief, stakeholder direction, expert heuristics, competitive patterns, or a generated prototype is hypothesis formation, not user research. Label it accordingly. If no source connector, participant access, analytics, support corpus, prior studies, or public evidence is available, produce a research plan and assumptions ledger rather than invented findings.

For multi-persona services, research each persona and the backstage/operator lane separately, then synthesize one service blueprint. Parallel research streams are useful when they inspect independent evidence; reconcile contradictions and handoffs before recommending a journey.

## Contract

- Restate the product, audience, time horizon, and research scope before scanning.
- Use public sources by default. Use internal sources when the connectors are available and the user request allows it.
- Cite sources wherever available.
- Separate observed evidence from inference.
- Do not overclaim from anecdotes.
- Do not return a dump of complaints. Tell a clear product story.
- Say clearly when source access is missing or weak.

## Workflow

1. Restate the research scope.

2. For a source scan, search only relevant available public sources:

- Reddit
- X/Twitter
- Hacker News
- Stack Overflow
- GitHub issues/discussions
- forums, blogs, reviews, YouTube comments, and developer communities where relevant

3. Search relevant internal sources only when available and authorized:

- Slack
- Gong
- Notion
- Google Drive/docs
- Linear/Jira/GitHub
- support or CRM notes if available

4. Cluster evidence into the highest-signal UX problems.

5. Separate:

- product UI/workflow friction
- docs/help friction
- onboarding friction
- account, billing, permissions, or setup friction
- developer/API/SDK friction
- reliability/performance issues
- feature requests

6. Rank problems by severity, frequency, confidence, and product leverage.

7. Tell a clear product story and name the next decision/test. Include current alternative, counterevidence, sampling limits and a continue/change/stop rule for the material hypothesis; a planned test is not a measured result.

## Current rationale completion

Save current findings, evidence limits and their resulting product decision before handoff. Follow `PLUGIN_ROOT/references/product-experience-method.md` section current-rationale-completion for owning-file selection, authorized writes, stable-reference verification and not-persisted handling. Do not invent reasons, approvals, a tracker or historical retention.

## Output

Default to an in-chat research brief unless the user asks for another format; this presentation choice does not replace Current rationale completion above.

For a source scan, include:

- Executive read: the core story in 5-7 sentences.
- Ranked UX problems: for each problem, include the problem, user goal, surface, what breaks, evidence, severity, frequency signal, confidence, and recommended product move.
- Source map: what was searched, what each source contributed, and where signal was weak.
- Opportunity map: group recommendations into fix this week, fix this quarter, and needs deeper research.

For a discovery or participant/test plan instead, lead with the decision/question, current alternative, evidence and counterevidence, prioritized unknown, method/access/privacy limits, owner and decision rule. Mark results not run. Do not invent a ranked complaint list or pretend every source was searched when the selected method did not require it.

## Rules

- Use citations wherever available.
- Do not overclaim from anecdotes.
- Separate loud complaints from frequent problems.
- Separate UX friction from missing features.
- Separate reliability/performance issues from UX workflow issues.
- Mark internal-only evidence separately from public evidence.
- Keep the brief sharp, specific, and easy to consume.
