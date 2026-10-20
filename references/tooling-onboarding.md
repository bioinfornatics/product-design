# Optional Tooling Preflight and Agent-Owned Onboarding

## Scope and trigger

Beads owns native work memory; Entire optionally captures development provenance. Neither is required to design, build, or perform QA. This contract adds diagnostics and consented setup, not a task store, transcript mirror, product configuration, or lifecycle gate.

At the first involved Product Design workflow for a resolved target, or an explicit tracking/provenance/setup request, run the read-only preflight once. Recheck after a target, PATH, host or tooling configuration change, and immediately before setup. Do not run on every prompt or for a conceptual plugin question, saved-context-only request, or simple one-shot edit. Direct entry to a focused workflow follows the same condition. If shell access is unavailable, report diagnostics unavailable only when tooling matters; continue permitted local work.

Resolve PROJECT_ROOT from the user's target and repository instructions, never PLUGIN_ROOT, handler cwd, or the plugin development tracker. No implicit parent/monorepo product selection. A future prototype does not exist yet: defer target checks until its directory exists. Runtime roots and active host are not persisted model/provider/host settings.

## Read-only preflight

The agent invokes `PLUGIN_ROOT/scripts/check-product-tooling.mjs` with an explicit absolute project root and the actual host's Entire identifier:

    node "$PLUGIN_ROOT/scripts/check-product-tooling.mjs" --project "$PROJECT_ROOT" --agent goose

The script exports checkProductTooling({project, agent, probeExternal=false, tools}) and returns transient JSON. It writes no report, settings, task or product file. It checks:

- executable presence on absolute PATH entries (not presence of an active agent);
- Git worktree-root association before Entire reads or any setup;
- local .beads marker, then native bd --readonly context --json to verify tracker root, project identity and non-redirected association;
- native entire status --json, distinguishing enabled, disabled, not-enabled, unverified and unsafe/ambiguous association;
- presence of entire-agent-<identifier> on PATH without executing that adapter by default.

Beads/Git routing environment makes association unknown rather than silently targeting another database/repository. Existing redirected/shared/worktree trackers require explicit association review; no replacement tracker. Missing directory is not proof that a CLI database is usable; an existing unreadable/invalid directory is not permission to reinitialize it.

Resolve host identity from the actual session or ask when ambiguous. Do not guess it from installed executables or from product repository configuration. Goose's Entire external identifier is goose; absence from a built-in agent list is not evidence of unsupported integration. Do not rewrite a user-confirmed working external setup merely because status has an empty agents list or display names differ from identifiers.

For a selected trusted external adapter, the agent may add --probe-external. This invokes only its info and are-hooks-installed subcommands, verifies protocol_version:1/name and the installed boolean, and never invokes install-hooks or transcript extraction. Unknown/malformed replies remain unverified. Beads/Entire diagnostics and trusted adapter commands are read-only by contract, not an OS sandbox: native tools may load authorized integrations or keep native logs. Do not run untrusted binaries, scan/execute all adapters, or use this CLI inside a latency-sensitive hook.

An installed adapter, enabled settings and installed hooks are separate from a captured checkpoint. The preflight always reports recording:not-tested. Real checkpoint/session verification is a separately scoped action, not fabricated from setup success. Raw CLI output/settings/transcripts are not mirrored in its report. A command's exit 0 is insufficient: JSON error fields, malformed output, timeouts and actual association matter.

An optional current exposed-tool inventory supplies reviewed capability labels and actual image schemas; --tools accepts a project-relative transient inventory. See [lifecycle reasoning](product-lifecycle-reasoning.md) for per-phase checks. Without it MCP availability is unknown, not guessed from names.

## Communicate once, then continue

Explain useful limitations plainly: without Beads, native task history/dependencies are unavailable; without Entire, captured session provenance is unavailable. Product specifications and evidence remain authoritative. Offer setup once for the target when useful; if declined, continue without repeated nagging. Reuse the session's response, not a new project.json or mandatory onboarding ledger. If the user requests installation, the agent prepares a platform-specific plan from current official guidance, obtains authorization, executes it and verifies PATH; no automatic install script on discovery.

A ready response says what is installed/associated/enabled and what remains unknown, not that Product Design or a transcript was verified. A diagnostic warning is not a Product Design blocked gate. An explicitly configured failing Beads mirror retains the existing publication failure behavior in [planning and tracking](planning-and-tracking.md).

## Consent, agent setup, verification

1. Name the exact target directory and independent requested operations: Beads initialization, Entire session recording, and synchronization choice/destination. Existing setup is preserved. Consent to tracking is not consent to recording; --telemetry=false disables analytics, not transcript storage or checkpoint synchronization.
2. Inspect installed CLI help and target instructions. Check existing .beads/.entire/.agents, native hooks and relevant paths without exposing secrets. Non-Git targets require a separately authorized repository plan; no implicit git init or initial commit. Installing executables or external adapters is separate from initializing a target.
3. Immediately rerun preflight, verify association and consent scope, and review the diff/symlink/infrastructure risks. The exported planToolSetup(report,{tool,project,consent,help}) returns blocked, already-configured (no commands), or planned. It never executes a command and is not an authorization token, concurrency lock or security boundary. Confirm the active executable/help still matches; do not execute an old plan.
4. For a new empty Beads target, the agent runs bd init --non-interactive --skip-hooks --skip-agents from PROJECT_ROOT. This preserves agent instructions and avoids installing Git hooks by default. Optional formulas still belong to product-design:project-status and its active scope. Never use force/reinit/import flags as remediation.
5. For a new Entire target with confirmed Goose host and recording consent, the agent runs the user-confirmed command entire enable --agent goose --telemetry=false. The setup planner adds the help-verified --no-init-repo guard. If synchronization is declined, it also requires --skip-push-sessions; otherwise the default destination must be reviewed and explicitly approved. A custom destination requires a separately reviewed native configuration plan. Never add --yes, --force, --import-history, --init-repo, history imports, authentication changes or push commands by default. Entire's general agent-help discourages unsolicited setup; this explicit user-authorized onboarding is not unsolicited.
6. Rerun diagnostics and review actual target changes. Beads must resolve the intended native tracker. Entire must be enabled; verify the selected trusted external adapter or applicable native integration, plus the expected sync destination/disabled setting. Unexpected destinations, unknown integration or partial failures stop setup success claims and need scoped repair, not automatic rollback/deletion/retry. Do not claim captured conversations without real accessible provenance.

The agent performs authorized commands; do not hand a non-coder a terminal checklist. Prior setup authorization may cover the named operations and target, but a general request to design an app does not. Existing enabled Entire is never re-enabled by this planner, even when integration diagnostics are incomplete.

## Why a skill trigger, not an auto-init hook

The relevant skill already knows the target, purpose, active host and user's choices. A session/prompt hook does not reliably know those facts, and must not install tools, start a database, edit instructions, import history or enable recording. No hook is added or activated by this contract. A future optional hook may provide bounded dirty/capability diagnostics only after a verified host adapter and project association; it cannot replace explicit preflight, consent or verification.

## Coverage and delivery limits

| Dimension | Handling |
|---|---|
| Installed/missing executable, initialized/enabled/disabled, malformed/error/timeout | Automated diagnostics and deterministic fixture tests |
| Wrong root, routed tracker/Git, existing/symlink paths, preservation | Automated refusal; shared/worktree association review is semantic |
| Built-in/external host, selected external protocol/hooks | Exact native identifiers or explicit trusted protocol; unknown stays unknown |
| Setup consent, recording versus sync, CLI flags | Automated command-plan checks plus human/session authorization review |
| Actual setup execution and resulting diff | Agent-owned after consent; not automatic in the diagnostic CLI |
| Missing-tool installation, custom sync, integration repair | Separate scoped plan; no built-in installer/repair engine |
| Transcript/checkpoint capture, UX benefit, hook activation | Not tested by preflight or structural tests |

Tests use isolated fake executables and actual subprocesses for missing-PATH, association, error and consent branches; they do not claim a live Beads initialization or Entire recording. Native read-only checks may additionally run against an explicitly resolved development repo without changing its tracker or integration. CLI semantics are version-sensitive: inspect the installed help; unsupported schemas/flags remain unknown or blocked for setup, never silently adapted.

## Verified surfaces

Goose [Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) documents focused instruction loading; [Hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks) documents lifecycle commands and trust requirements. This implementation uses skills and explicit CLI calls, not a newly installed hook. Beads init/context flags and Entire enable/status flags were checked against installed CLI help (bd 1.1.2, Entire 0.11.5). The external adapter discovery and protocol are defined by Entire [discovery](https://github.com/entireio/cli/blob/main/cmd/entire/cli/agent/external/discovery.go) and [protocol types](https://github.com/entireio/cli/blob/main/cmd/entire/cli/agent/external/types.go); Goose external support and the enable command are also explicitly confirmed by the user. These links are references, not pinned guarantees for all future CLI versions.
