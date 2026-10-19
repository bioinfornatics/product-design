# Contributing to the Plugin

## Principles

- Make minimal changes consistent with the skill-based architecture.
- Read the skill, its references, and its evals before changing a workflow.
- Keep documentation descriptive; normative contracts live in skills and references.
- Use the unqualified name in frontmatter and paths (`design-qa`), and the qualified name in usage instructions (`product-design:design-qa`).
- Do not introduce an implicit dependency on an optional tool.
- Do not change a starter without checking all four frameworks when the contract is shared.

## Expected synchronization

Depending on the change, update together:

- `skills/*/SKILL.md` and the references it loads;
- the skill's `evals/evals.json` and/or `tests/evals/plugin-integration.json`;
- `references/product-decision-gates.md` if a phase transition changes;
- templates and annotation ports if runtime behavior changes;
- `README.md`, `AGENTS.md`, and `docs/` if the public interface or architecture changes.

Do not edit generated output, vendored dependencies, or `node_modules`.

## Local validation

```bash
npm run validate:workflow
npm run validate:skills
npm run validate:plugin
# aggregate
npm test
```

The workflow validator protects ideation, screen approval, build, and QA invariants. The skill validator applies the official format to every skill. The plugin validator stages the bundle without evaluation artifacts and runs the Agent Plugins and Goose validators.

Add at least positive cases, ambiguous cases, and important blockers when a contract changes. Local benchmarks and traces go in `evaluations/` or an ignored `*-workspace/` path. They may contain runtime data and must not be committed.

## Diff review

Before handoff:

```bash
git diff --check
git status --short
git diff -- AGENTS.md docs
```

Check that no secret, generated result, cache, or out-of-scope file is present. Do not create a commit unless explicitly requested.

## Skill authoring correction

Peer Skills use `load skills product-design:{name}`, not sibling-file links. Shared policies remain canonical at root references/; isolated validation/packaging projects contained local resources with identity/closure checks. No source copies or installed-plugin changes are generated. `validate:authoring` is required in npm test and blocks audit/scenario errors or warnings. See [the authoring/resource contract](skill-authoring.md). This is structural evidence, not behavioral evaluation.
