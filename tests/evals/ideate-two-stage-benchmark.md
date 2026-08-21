# Ideate two-stage workflow — evaluation report

## Scope

Controlled comparison of the repository HEAD version of ideate against the revised version. Each agent received the exact skill content in context and was asked to describe its next actions without calling tools or ImageGen.

## Cases and results

| Case | Baseline | Revised | Result |
|---|---|---|---|
| New multi-step mentoring product | Selected a journey in prose, then proposed three visual treatments of fixed checkpoints | Proposed three distinct 1024×1024 end-to-end journey boards with the same start/end contract | Revised passes |
| User selects journey board 2 | Proposed three more visual directions and stopped for another option choice | Recorded journey selection, created a 3–6 screen plan, generated one screen at a time, then stopped for screen-set approval | Revised passes |
| Genuine single-screen modal | Correctly generated three variants of the same modal | Preserved the short path and added 1024×1024, sequential generation and absolute-path presentation | Both pass; revised is more explicit |
| Build requested with board only | Correctly refused immediate build but gave a loose checkpoint-declination plan | Explicitly blocked build, required G2 selection, G3 screen plan, stable IDs, sequential generation and final approval | Revised passes more strongly |

## Strict behavioral score

- Baseline: 1/4 fully satisfies the new contract.
- Revised: 4/4 satisfy the new contract.

The baseline receives no full credit for the premature-build case because it lacks the durable screen-plan and second-approval contract, even though it correctly avoids immediate implementation.

## Discriminating findings

The most valuable test is journey selection. The old behavior interprets selection as a cue to compare visual directions. The revised behavior interprets selection as a transition from journey-boards-generated to journey-selected, then screen-plan-created. This is the intended mechanism.

The single-screen case prevents overfitting: the revised workflow does not manufacture a journey when the target is truly isolated.

## Limitations

- These are instruction-following evaluations, not real image-quality evaluations.
- ImageGen calls were intentionally not executed to avoid cost and stochastic output.
- Visual board readability and cross-screen visual consistency still require human review during real use.
- Trigger accuracy for all plugin skills should be benchmarked separately if routing regressions appear.
