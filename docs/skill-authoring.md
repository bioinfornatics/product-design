# Skill authoring, loading and resource ownership

## Loading a focused Skill

Use the exact instruction `load skills product-design:{name}` with the actual Skill name (for example `load skills product-design:design-qa`). This instructs the agent to use the exposed skill-loading capability; it is not a terminal command. Do not read `../design-qa/SKILL.md` instead. Read only the focused workflow required by the current phase. Directory names and frontmatter remain unqualified.

Goose's documented Open Plugin contract uses plugin-qualified names for explicit loading. Verified documentation: [Agent Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) and [Plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins). The literal instruction phrasing above is this repository's user-approved convention, not a new Goose CLI command.

## One canonical owner, complete-plugin dependency

Root references/ owns shared Product Design policies. Source Skills identify them as PLUGIN_ROOT/references/...; resolve PLUGIN_ROOT two levels above the loaded Skill directory. Source resource checks verify realpath confinement, file existence, transitive Markdown/inline shared-policy dependencies and peer load names. Skill-local references stay local. The complete plugin is required for peer Skills, shared scripts, templates and assets; an isolated Skill folder is not advertised as an autonomous export.

No hand-maintained copies of shared rules are stored beside each source Skill. scripts/skill-resource-contract.mjs generates a contained references/shared/ projection only in an isolated temporary validation/package stage. Staged Skill entries link all projected dependencies directly, retaining conditional reading rather than requiring every policy on every turn. A manifest binds source and derived entries/resources by hashes; checks reject missing/transformed drift, unknown peer names, traversal and symlink escape. The stage must not overlap source. Do not manually edit or commit generated files; root policy revisions drive the next projection.

This is a packaging projection, not a new runtime loader. Local source or source installation retains the explicitly declared complete-bundle dependency; validation does not update an installed plugin. If a future standalone distribution is desired, runtime scripts/templates and peer dependencies also need a separately authorized export contract.

## Required authoring checks

The npm validation sequence now includes validate:authoring:

- source Skill audits with the official validator;
- resource closure and exact peer invocation checks;
- generated contained-projection audits and source/derived hash checks;
- official design-evals checks for every shipped Skill and plugin integration;
- zero errors **and warnings**, not merely a schema-only pass.

Every Skill has at least three scenarios. Each case declares target, execution, capability limits, preconditions, budget, subject/language, navigation and observable atomic assertions. Current cases are explicitly explain-only and not run; normalization preserves purpose, IDs and names. Do not claim build, captures, annotation replay, user research, hosting or a behavioral benchmark from a structural validation result. Eight D scenarios were re-frozen after pre-execution authoring correction; no historical run was regraded.

Six filesystem regression tests cover transitive projection, unchanged canonical source, peer invocation, missing resources, escape and projection drift/pipeline refusal. npm entrypoint tests verify validate:authoring from another cwd through --prefix. Existing workflow, frontmatter, plugin-schema and deterministic runtime tests remain required.

## Remaining scope

Annotation runtime migration, broad instruction-efficiency refactoring and optional hooks remain proposals. No deployment, publication, commit or installed-plugin update follows from this authoring correction. Model-behavior evaluation and user research remain not run; structurally valid scenarios are prerequisites, not their results.
