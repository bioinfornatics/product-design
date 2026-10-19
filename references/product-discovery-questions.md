# Product discovery questions and decision tests

Use for involved product exploration or redesign, after recovering supplied evidence and decisions. Exact clones and tiny edits use only applicable checks. This is an internal analysis lens, not a questionnaire or a new mandatory JSON schema.

## Working method

1. Recover answered context before asking. Label observations, operational data, stakeholder input, external research, inference and assumptions separately.
2. Review the themes below; record a material unknown or not-applicable rationale, not a made-up answer. Internal products may have an adoption owner rather than a buyer or price.
3. Select the uncertainty with the greatest combination of consequence, uncertainty and near-term decision impact. Explain the priority briefly; do not invent a numerical precision score.
4. Ask one focused question only for a material blocking fact. Otherwise propose the cheapest discriminating test or proceed as an explicit bounded experiment. A request to explore a problem does not authorize images, code or production integration.
5. Trace the resulting answer/evidence to Product, UX and UI decisions, scenario/state and verification in the existing experience blueprint. Do not add nine equal dashboard regions or require every theme as a field on every project.

A promising solution can be rejected before visual ideation. Recommend **do not build yet**, modify the hypothesis or abandon when evidence contradicts value, safe feasibility or a material constraint. Do not manufacture three solutions to a problem already disproved. Retain accepted historical directions unless new evidence requires an explicit stakeholder decision.

## Questions that discriminate

| Theme | Questions to investigate | Design or decision consequence | Suitable evidence/test |
|---|---|---|---|
| Problem and opportunity | What recent event triggered the need? Who experiences it, how often, and why now? What happens without intervention? | Choose a consequential scenario and primary task, not a generic feature list. | Recent task observation, support/operational cases; check counterexamples and the denominator before claiming prevalence. |
| Current alternative | How is the task done today, including spreadsheets, email, manual work or doing nothing? What works well enough already? | Preserve useful behavior and compare against a real alternative, not an artificially weak baseline. | Observe the current task and its handoffs, errors and effort. |
| User value | What outcome improves? Does the gain exceed learning, verification, correction and switching effort? Who bears the cost of failure? | Define measurable benefit and guardrails; optimize end-to-end useful work, not generation speed. | Task success, quality and total effort compared with the current method. |
| Viability and adoption | Who uses, chooses, pays, administers and supports it? What would motivate repeat use? What constrains adoption or procurement? | Distinguish roles and incentives; include ownership, onboarding and sustainable support. | Budget or commitment signals, repeated use and procurement constraints; willingness to pay only when relevant. |
| UX and service | What is the trigger, next decision, required information and next owner? How are outcome, undo, errors, handoffs and return handled? | Complete direct paths, contextual recovery and complementary backstage lanes. | Neutral representative tasks including failure/recovery; observe unaided behavior rather than the agent's walkthrough. |
| UI and accessibility | What must be understood and acted on first? Is the copy meaningful? Which density, components and states make the task clear at the actual viewport? | Hierarchy and progressive disclosure using the existing design system, accessible controls and truthful states. | Source/render review, task comprehension, keyboard/focus/zoom tests and assistive-technology evidence when available. Screenshots do not prove compliance. |
| AI usefulness and trust (conditional) | Why AI rather than a deterministic rule or direct control? Which errors are tolerable, which require abstention? What must users inspect, correct, pause or override? | Choose no AI, assistance or bounded automation; include uncertainty and direct fallback, not a mandatory chat shell. | Representative and difficult cases against a deterministic/manual alternative; judge usable outcomes and recovery, not eloquent answers. |
| Technology and data | Are the required data accessible, authorized, fresh and adequate? What are cost per successful task, latency, reliability, integration and operational limits? | Target the highest-risk feasibility assumption before making the promise; separate review prototype from production. | Bounded read-only feasibility review or explicitly authorized spike; do not add backend/auth/services to a design prototype. |
| Safety and responsibility (conditional) | What can be prepared versus externally executed, by whom and under what mandate? What happens on revoked rights, prompt injection, stale sources, model change or unknown effect? | Scoped access, inspectable authority/effects, protected edits and recovery; isolate untrusted content and avoid blind retries. | Threat/risk review and failure cases; real enforcement/authorization evidence belongs to production, not mock booleans. |
| Learning and decision | What observation would falsify the hypothesis? When do we continue, change, pause or abandon? What will be measured after release? | A bounded experiment with a decision owner and explicit non-goals, not a visual-quality score used as value proof. | Predefined decision rule, baseline, guardrails and follow-up measurement; report uncertainty and adverse effects. |

## Select a test before choosing its artifact

| Uncertainty | Cheapest useful test, when available | Not a substitute |
|---|---|---|
| Problem importance or workflow | Observation of a recent real task and a neutral interview about that event | Asking whether people like a proposed dashboard |
| Value or demand | Manual/concierge trial or a concept/commitment test with truthful promises and consent | A generated persona, stakeholder enthusiasm or invented purchase intent |
| Usability | Representative participants perform defined tasks with realistic states; observe errors, recovery and comprehension | The building agent successfully clicks through the app |
| AI feasibility | Evaluate authorized representative cases and dangerous boundaries against the current alternative | A single compelling response or provider acceptance |
| Production adoption and viability | Bounded pilot with a responsible owner, outcome/support costs and repeat-use measures | Prototype QA or a deployment URL |

Interviews, pilots, outreach, recording, external actions and real data collection need their own permission, access and privacy arrangements. Without participants or sources, write a test plan and assumptions ledger; never invent respondents, observations or measured benefits. Do not impose a fixed participant count or claim statistical confidence from a small convenience sample.

## Compact decision-test record

For each material experiment, use one human-readable record linked from the relevant gate, blueprint question and verification. Reuse an existing equivalent artifact; do not create a second source of truth. Include:

- hypothesis and current alternative;
- affected user/responsibility and bounded task;
- source provenance, confidence and counterevidence;
- assumption at risk and why this test changes a decision;
- method, available capabilities, consent/privacy requirements and owner;
- baseline measure, intended outcome, target threshold and guardrail;
- duration/sample rationale and known limitations;
- predefined continue/change/stop rule;
- results **not run** until observed evidence exists, then exact evidence references and decision.

Example hypothesis, not a claimed result: a coordinator can resolve the next owner faster **without more incorrect handoffs**, including time spent checking AI output. Measure the current task first; agree a target and error guardrail before testing. If the target or consent is unresolved, label it unknown and do not call the study executable or passed. A usability observation supports that task and population, not universal desirability or team replacement.

## Use across phases

- **get-context / G1:** recover alternatives, value, material assumptions and a useful success signal. Missing core facts block; weak but explicit evidence permits an experiment. Discovery can conclude without building.
- **research:** seek evidence for the prioritized question, including contrary cases and sampling limits. A source scan is desk research, not a conducted interview or usability study.
- **ideate / G2–G3:** compare three complete interaction strategies against the same value/task hypothesis when visual exploration is warranted. Show rejected alternatives and what would discriminate them; do not reopen a selected direction without cause.
- **image-to-code / G4:** implement only the approved evaluation slice with realistic mock data. Simulate relevant AI success/error/abstention/fallback states, not real external execution or a measured accuracy claim.
- **design-qa / G5:** verify fidelity, interaction integrity and test validity separately. Check that the prototype can test the hypothesis and does not suggest a proved benefit from invented data.
- **G6:** use actual user/operational evidence for value, usability, feasibility and viability; unknown essential thresholds, missing authority or untreated critical risks cannot be averaged away. Production still requires an explicit request.
- **G7:** define operational ownership, applicable quality/safety limits, rollback and post-release measurement. This plugin does not supply a production backend or automatically run a pilot.

## Ready boundary

Ready to explore means the problem, alternative, outcome, uncertainty and next decision are explicit at the applicable scope. Ready for a user test additionally requires a usable plan, access/permission and realistic tasks. Validated value requires actual evidence meeting the agreed decision criteria. These states are different from approved pixels, a successful build and a working URL.
