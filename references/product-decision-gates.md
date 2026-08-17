# Product decision gates

Use these gates for Product Design work. They challenge product value without turning small edits into ceremony.

## Operating rules

- A gate has hard criteria, a weighted quality score, separate evidence confidence, and a verdict.
- A score never compensates for a missing hard criterion.
- Verdicts: pass, conditional, experiment, blocked.
- Confidence: very-low (intuition), low (anecdotes), medium (converging observations), high (structured tests/data), very-high (repeated behavioral evidence).
- Score dimensions from 0–5 and apply weights. Cite evidence; do not invent precision.
- For involved work, write gate records under project-root .gates/. Include verdict, criteria, score, confidence, evidence, assumptions, risks, success criteria, rejected alternatives, next step, and decision owner.
- Tiny static edits, audits, and exact clones use only relevant gates.

## G1 — Brief to journey/visual ideation

Hard criteria: problem/opportunity, target user and context, intended outcome, product/business value, one observable success criterion, material assumptions and constraints, accessible references, review framework, production destination, and design system.

Weights: problem clarity 20; user importance 15; outcome 15; product value 15; measurable success 15; evidence 10; constraints/risks 5; ideation scope 5. Pass at 75+, conditional at 60–74 only with all hard criteria, blocked below 60. An essential dimension below 2/5 blocks.

## G2 — Journey exploration to selected journey

Compare journey hypotheses at the same boundary and outcome. Each must share the user/context and identify entry, steps, decisions, recovery, end state, assumptions, and checkpoints. They must be interaction strategies, not renamed layouts.

Weights: need fit 25; success potential 20; friction/cognitive load 15; learnability/recovery 10; product value 10; feasibility 10; risks/assumptions 10. Select one journey before visual comparison. With insufficient evidence, use experiment and test the smallest competing flows.

## G3 — Visual directions to selected direction

All three directions use the same comparison contract: journey, checkpoints, content/data, viewport, state, design-system constraints, and success criterion. Multiple screens from one direction may share one labeled storyboard; never put multiple directions in one image.

Weights: need fit 25; success potential 20; hierarchy/path clarity 15; friction 10; design-system fit 10; feasibility 10; risks 5; differentiation/value 5. Show score, confidence, trade-offs and recommendation. Red-team irrelevant polish, complexity, hidden assumptions, metric gaming, and simpler tests.

## G4 — Selected direction to prototype

Require a resolvable selected journey and visual target, hypothesis, evaluation slice, core states, realistic mock data, success criterion, out-of-scope behavior, design-system components, and framework rationale.

## G5 — Prototype to review/handoff

Two independent gates must pass: (1) execution quality: browser evidence, matching viewport/state, interactions, accessibility, responsiveness, no actionable P0/P1/P2; (2) product-test validity: stated hypothesis and success criterion are testable, primary task is clear, data/states are realistic enough, limitations and test scenario are explicit. Fidelity cannot compensate for testing the wrong journey.

## G6 — Validated prototype to industrialization

Assess desirability 20; usability 15; user/product value 20; feasibility 15; viability 10; risk readiness 10; evidence confidence 10. Pass at 75+ with at least medium confidence, no untreated critical risk, written acceptance criteria and product ownership. Otherwise experiment or block.

## G7 — Production readiness

Require applicable tests/checks, auth, data migrations, i18n, observability, secret handling, accessibility, performance, compliance, business acceptance, rollback and post-release measurement. Repository conventions remain authoritative.
