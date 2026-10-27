# OPEN

Builder appends blocked decisions. `To:` says who answers: `Opus` (Architect answers into `DECISIONS.md` and removes the entry), `Sonnet` or `Haiku` (a Builder session must redo or check something), `Owner` (only when the step cannot continue without the owner; owner questions that do not block a step stay in the final report).

<!-- Entry format
## <short title>
- To: Opus | Sonnet | Haiku | Owner
- Step: PLAN.md / master-plan step number
- What / why blocked:
- Options:
- Builder's lean:
-->

## 13.3 Suzuka 2026 pole lap misses the 3 % length gate
- To: Opus
- Step: PLAN.md Session M / master-plan 13.3
- What / why blocked: the full run (2026-10-28, exit 0) wrote 23/23 circuits, all pole laps matched. 22 are within ±2.5 % of `CIRCUIT_FACTS` (closest to the limit: madring −2.5 %, monaco −2.0 %, monza +2.0 %). Suzuka 2026 (session 11249, #12 ANT lap 11, 1:28.778) integrates to 5 401 m vs 5 807 m (−7.0 %): 334 samples, span 125 → 89 206 ms, largest gap 1 079 ms, mean speed 218 km/h vs 235.5 km/h implied by length/lap time, so OpenF1's `speed` channel reads low on that lap; trace closes (start/end 8 units apart). It also has `brakingPct` 42.1 % next to `fullThrottlePct` 67.7 % (others 9–29 %), so its `brake` channel looks stuck on. Stop condition → no data committed; the 23 files are kept outside the repo for inspection (Builder scratchpad, `telemetry-run-2026-10-28/`), `data/circuits/telemetry/index.ts` is back to the empty map.
- Options: (a) script checks length within 3 % (and a braking-share plausibility bound) after building and falls back to the next older year at that circuit, else skips; (b) skip Suzuka only (commit 22, test stays strict); (c) keep Suzuka and widen the tolerance (rejected by the no-invented-data rule).
- Builder's lean: (a) — deterministic, keeps the test strict, and Suzuka 2025 likely passes; needs a script change, so it is the Architect's call. A plausibility bound on `brakingPct` would also need a number from you.
