# PLAN

Written by the Architect. Executed by the Builder. Long-lived checklist: `docs/plans/master-plan.md`; this file is the active session slices. Step details (files, exact change, signatures, verify) live in the master-plan step with the same number; a Builder implements that step exactly and ticks it in both files.

Written: 2026-10-20 (Opus 5.5, Architect). Active: Dalga 1 and Dalga 2. Dalga 3-6 are in master-plan "Paralel Dalgalar"; the Architect copies them here when Dalga 2 is done.

Shared rules for every session below:
- Start with `git status`; other sessions work in the same tree. Stage only your own files (pathspec adds). One commit per step, local; push only after the owner approves.
- Race-weekend code freeze: 2026-10-23 00:00 → 2026-10-26 12:00 (TR). No code push to `main` in that window.
- Blocked or conflicting with the code: append to `OPEN.md` with `To:`, skip to the next unblocked step, report.

---

## Dalga 1 (now → 2026-10-22)

### Session A — R18 guide refresh
Goal: the race-weekend guide matches today's schedulers and R18 timings.
Run (phase): Sonnet / medium — doc update that needs judgment.
Out of scope: any code, workflow or plan change other than this step.
Steps:
- [x] 1.0 — master-plan "1.0". First step.
Acceptance: guide has R18 timeline (UTC + TR), 2026-10-20 scheduler facts, R18 result column; `Last verified` updated. Also record in the day's log: `qstash_list_schedules` (eu) shows `scd_6H9JdCRnRKTPCoRhnG5owiiFF2UN` (notify-sessions) with last state SUCCESS; if not SUCCESS → `OPEN.md` `To: Opus`.
Stop conditions: a timing the code computes differs from the published F1 timetable → `OPEN.md` `To: Opus`.

### Session B — Rate limit on all public routes
Goal: every public API route uses `applyRateLimit`; the `push/register` header-less bypass is gone.
Run (phase): Opus 5.5 / high — owner-mandated model (Faz 14); security code with an exact recipe. This is a Builder session (owner mandate, see `DECISIONS.md` 2026-10-20 "Faz 13/14 execution").
Out of scope: Zod (14.3), news route removal (14.5), new limits or changed `max`/`windowMs` values.
Steps:
- [x] 14.1 — master-plan "14.1". First step.
Acceptance: master-plan 14.1 verify commands all pass; Vercel env names for Upstash recorded in the day's log (names only).
Stop conditions: not ready to push by 2026-10-22 18:00 TR → keep the commit local, report, resume after the freeze. A route test depends on the old bypass in a way that needs a behaviour decision → `OPEN.md` `To: Opus`.

### Session C — Screenshot vision audit script
Goal: a capped, testable script that turns `screenshots/` into per-page audit reports.
Run (phase): Sonnet / medium — single script, hard request cap.
Out of scope: `package.json`, new dependencies, running it against the real API (owner runs it).
Steps:
- [x] 15.1 — master-plan "15.1". First step.
Acceptance: test green, `--dry-run` lists 48 targets with no env, `tsc` 0.
Stop conditions: needs a new dependency or a new env name → `OPEN.md` `To: Opus`.

### Session D — Log retention
Goal: no log older than 15 days.
Run (phase): Haiku / low — one mechanical deletion.
Out of scope: everything else.
Steps:
- [x] 0.1 — master-plan "0.1". First step.
Acceptance: oldest log is `logs/2026-10-05.md`.
Stop conditions: `git status` shows any other change staged by you → unstage it and stop.

### Session E — Editorial review (Antigravity)
Goal: fact-checked livery and team-DNA text.
Run (phase): Antigravity (own model) — editorial text; owner reviews.
Out of scope: any file other than `data/history/liveries.ts`, `data/history/team-dna.ts`; any git command.
Steps:
- [ ] 7.2 — master-plan "7.2". First step.
Acceptance: Antigravity logs what changed and marks 7.2 `[~]`; Claude Code runs the verify, commits.
Stop conditions: a structural change (field names, types) seems needed → write it in the log, do not do it.

### Session N — Free live-data alternative (Architect)
Goal: choose a free, terms-compliant way to show live session data without an OpenF1 subscription (owner decision 2026-10-20: no subscription for now).
Run (phase): Opus / xhigh — architecture plus source/terms risk. Architect session: no source code edits.
Out of scope: implementation; anything paid.
Steps:
- [x] 1.9 — master-plan "1.9". First step. Done 2026-10-20: `DECISIONS.md` "1.9 Free live-data alternative"; 1.10 (Dalga 3) and 1.11 (Dalga 4) written; observation added to Session F.
Acceptance: `DECISIONS.md` entry with cost, terms, latency and risk per candidate; master-plan 1.10 written if a path is chosen; if useful, a read-only observation step appended to Session F below before 2026-10-23.
Stop conditions: terms of use unclear → owner question in the report, no decision.

---

## Dalga 2 (2026-10-23 → 2026-10-25, code freeze)

### Session F — R18 live checks
Goal: measured results for 1.1, 1.3, 1.4, 1.7 on the live race weekend.
Run (phase): Sonnet / high — live-race debugging and edge cases (1.4 may drop to `/effort medium`).
Out of scope: code changes (freeze). Findings that need code go to `OPEN.md` `To: Opus`.
Steps (guide §3, in session order):
- [ ] 1.1 — live timing during Quali (10-24) and race (10-25). First step.
- [ ] 1.4 — push window ~30 min before Quali and race.
- [ ] 1.3 — first `sync-f1` after the race, then a second run (idempotency).
- [ ] 1.7 — OpenF1 is locked during sessions (no subscription): measure the "locked" criterion and the provisional results after the race.
- QStash now also triggers `notify-sessions` (`*/10`, created 2026-10-20); for 1.4 record which scheduler (QStash or GitHub) delivered the run that wrote the `notified_sessions` row.
- [ ] 1.9 observation (read-only, Run: Sonnet / medium): after Quali (10-24, ends ~22:00Z) and the race (10-25, ends ~22:00Z) run `curl -s -o /dev/null -w "%{http_code}" "https://api.openf1.org/v1/sessions?session_key=latest"` every 5 min from the session end until it returns 200; log each time and code, then the minutes from session end to the first 200. At the first 200 also log `curl -s "https://api.openf1.org/v1/session_result?session_key=latest" | jq length` (rows published or 0). This sets the expected latency for 1.10; no code, no other source.
Depends on: Session A done.
Acceptance: each sub-item in the day's log with command and result; guide §4 R18 column filled; passed items removed from master-plan, open ones stay `[~]` with what is open; the log states whether QStash `sync-f1` ran SUCCESS during the weekend (gate for 1.6).
Stop conditions: a production error that users see → report to the owner at once; no hotfix push during the freeze without the owner's explicit OK.

### Session G — Track telemetry design
Goal: decide what telemetry Apex shows, from which source, how it is stored and tested; write 13.2 as an exact plan.
Run (phase): Opus 5.5 / xhigh — owner-mandated model (Faz 13); data accuracy and architecture. Architect session: no source code edits.
Out of scope: implementation.
Steps:
- [x] 13.1 — master-plan "13.1". First step. Done 2026-10-21: `DECISIONS.md` "13.1 Track telemetry"; master-plan 13.2, 13.3, 13.4 written (no migration, so no 13.3 audit); Session M below.
Acceptance: `DECISIONS.md` entry; master-plan 13.2 (and 13.3 migration audit / 13.4 Antigravity UI if needed) written with files, signatures, verify; files do not overlap Dalga 4 sessions J/K/L.
Stop conditions: the design needs paid data, a new hosted runtime, or a licence decision → "Sahibe sorular" in the report, not decided.

---

## Dalga 4 (prepared early by 13.1; starts when 14.2 is on `main`)

### Session M — Track telemetry data layer
Goal: one measured, sourced reference lap per current-calendar circuit as static JSON, with a reader and tests that reject invented values.
Run (phase): Opus 5.5 / high — owner-mandated model (Faz 13), Builder session; data code with an exact recipe. 13.3 at `/effort medium`.
Out of scope: UI (13.4, Antigravity), `lib/f1/*` (1.10), `package.json`, any table or migration, F1 live-timing or MultiViewer endpoints, Python.
Steps:
- [ ] 13.2 — master-plan "13.2". First step.
- [ ] 13.3 — master-plan "13.3" (`/effort medium`). Run outside any F1 session window.
Acceptance: master-plan 13.2 and 13.3 verify commands pass; the day's log has the summary table and every skipped circuit with its reason.
Stop conditions: the pole lap cannot be matched for more than a third of the circuits, or integrated lap length misses `CIRCUIT_FACTS` by more than 3 % on any circuit → `OPEN.md` `To: Opus`, no data commit. OpenF1 terms or response shape changed → `OPEN.md` `To: Opus`.
