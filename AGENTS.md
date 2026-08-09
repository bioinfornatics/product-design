# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd prime` for full workflow context.

## Goose Discovery

Goose only auto-discovers content under `.agents/skills/`, `.agents/plugins/`, and `.agents/agents/`. Do not place standalone context or instruction files directly under `.agents/`; put repository-wide instructions in `AGENTS.md` and workflow-specific guidance in the appropriate skill or agent.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work atomically
bd close <id>         # Complete work
bd dolt push          # Push beads data to remote
```

## Evaluating the Plugin, Scripts, and Agent Behavior

Use the shared `open-agent-creators` workflows rather than adding an evaluation framework to this repository.

### Plugin and bundled skills

1. Load `open-agent-creators:plugin-creator` for plugin-level audits, manifest checks, packaging, and cross-component validation.
2. Load `open-agent-creators:skill-creator` for every new or modified `skills/*/SKILL.md` and for behavioral evaluation.
3. Validate the plugin statically:

   ```bash
   python3 ~/.agents/plugins/open-agent-creators/skills/plugin-creator/scripts/validate_goose_plugin.py .
   ```

4. For behavioral changes, follow Skill Creator's complete evaluation loop:
   - snapshot the previous skill version when improving an existing skill;
   - create realistic prompts in the local evaluation workspace;
   - run the changed skill and its baseline on the same prompts;
   - define objective assertions where possible;
   - grade outputs and aggregate `benchmark.json`;
   - generate the human review with `eval-viewer/generate_review.py`;
   - inspect failures and iterate before accepting the change.
5. For routing or description changes, include positive and near-miss negative trigger cases. Verify the exact catalogue skill selected and the required handoff order; file presence or `goose skills list` alone is not proof of successful use.

### Scripts

Test every modified executable directly, in addition to plugin validation:

- Python:

  ```bash
  python3 -m py_compile skills/user-context/scripts/*.py
  ```

  Run behavior tests with an isolated temporary `GOOSE_HOME`; do not read or overwrite the maintainer's real Product Design state.

- Node.js:

  ```bash
  /usr/bin/node --check "$PWD/scripts/bootstrap-prototype.mjs"
  ```

  Exercise bootstrap behavior only in a disposable temporary directory. Verify generated paths and files, idempotence when applicable, and nonzero exits for invalid input. Do not bootstrap over a real project during evaluation.

When a deterministic script check is needed only for one evaluation, keep it in that evaluation workspace rather than shipping it as plugin runtime code.

### Agents and runtime behavior

This repository currently bundles no standalone agent definitions. If `.agents/agents/` is added later, load `open-agent-creators:agent-creator` and evaluate each agent in isolated sessions against its intended role, tool permissions, output contract, and failure behavior.

For Goose behavior produced by this plugin:

- run evaluations in fresh, isolated sessions;
- compare against a baseline using the same provider/model and prompt;
- verify successful `load_skill` responses, not merely load attempts;
- verify required sequencing such as `product-design:index` before focused skills and rendering tools;
- avoid prompts or accounts containing mutable production Apps or assets;
- treat tool traces as potentially sensitive runtime data.

### Evaluation artifacts

Keep all prompts, traces, outputs, graders, benchmarks, feedback, and generated review files under ignored `evaluations/` or `*-workspace/` paths. Never commit them. Before committing, run:

```bash
git status --short
git check-ignore -v evaluations/test product-design-workspace/test
```

Commit only reusable plugin components and documentation. Do not copy Skill Creator's evaluation scripts into this plugin.

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Shell commands like `cp`, `mv`, and `rm` may be aliased to include `-i` (interactive) mode on some systems, causing the agent to hang indefinitely waiting for y/n input.

**Use these forms instead:**
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

**Other commands that may prompt:**
- `scp` - use `-o BatchMode=yes` for non-interactive
- `ssh` - use `-o BatchMode=yes` to fail instead of prompting
- `apt-get` - use `-y` flag
- `brew` - use `HOMEBREW_NO_AUTO_UPDATE=1` env var

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
