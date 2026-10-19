# Product Design Documentation

This documentation describes the Product Design plugin in this repository and its execution contracts.

## Index

| Document | Contents |
|---|---|
| [architecture.md](architecture.md) | Bundle structure, skills, dependencies, and templates |
| [workflows.md](workflows.md) | Routing, design workflow, gates, and expected evidence |
| [operations.md](operations.md) | Annotation, user-context, security, and handoff |
| [contributing.md](contributing.md) | Editing conventions, validation, and evaluations |
| [instruction-reliability-proposals.md](instruction-reliability-proposals.md) | Implemented instruction/discovery corrections and unactivated execution, annotation, efficiency and hook proposals |

## Normative sources

The docs explain the system, but the executable contracts remain:

- `skills/*/SKILL.md` for each skill;
- `references/critical-overrides.md` and `references/communication-protocol.md` for cross-cutting rules;
- `references/product-decision-gates.md` for gates;
- `plugin.json` for the plugin's identity;
- `package.json` and `scripts/validate-*.mjs` for validation.

If they diverge, correct the documentation and follow these sources.

- [Executable transitions and canonical QA](../references/executable-transitions.md): runtime request/schema/receipt contract, freshness and failures.

- [Skill authoring and resource ownership](skill-authoring.md): exact Skill loading, canonical projection, audits and scenario validation.
