# PLAN

Written by the Architect. Executed by the Builder. Long-lived checklist: `docs/plans/master-plan.md`; this file is the active session slices. Step details (files, exact change, signatures, verify) live in the master-plan step with the same number; a Builder implements that step exactly and ticks it in both files.

Written: 2026-10-20 (Opus 5.5, Architect). Updated 2026-10-26 (Opus, Architect): Dalga 2 done, Dalga 3 copied below. Dalga 5-6 are in master-plan "Paralel Dalgalar"; the Architect copies them here when Dalga 4 is done.

Shared rules for every session below:
- Start with `git status`; other sessions work in the same tree. Stage only your own files (pathspec adds). One commit per step, local; push only after the owner approves.
- Race-weekend code freeze: 2026-10-23 00:00 → 2026-10-26 12:00 (TR), ended. Next race weekends (R19 2026-10-30 → 11-01) have no freeze unless the owner sets one.
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
- [x] 7.2 — master-plan "7.2". First step.
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
- [x] 1.1 — live timing during Quali (10-24) and race (10-25). Closed 2026-10-26 on the race measurement (`DECISIONS.md` 2026-10-26 decision 1); quali latency is read at R19 under 1.10.
- [x] 1.4 — push window ~30 min before Quali and race. Done 2026-10-26: both rows written by QStash, no GitHub run in either window.
- [~] 1.3 — first `sync-f1` after the race, then a second run (idempotency). First run measured; criterion changed to "no write after settle" (`DECISIONS.md` 2026-10-26 decision 2); moved to Session R step 1.
- [x] 1.7 — OpenF1 is locked during sessions (no subscription): measure the "locked" criterion and the provisional results after the race.
- QStash now also triggers `notify-sessions` (`*/10`, created 2026-10-20); for 1.4 record which scheduler (QStash or GitHub) delivered the run that wrote the `notified_sessions` row.
- [x] 1.9 observation (race: 32.3 min from `date_end`; Quali not measured live) (read-only, Run: Sonnet / medium): after Quali (10-24, ends ~22:00Z) and the race (10-25, ends ~22:00Z) run `curl -s -o /dev/null -w "%{http_code}" "https://api.openf1.org/v1/sessions?session_key=latest"` every 5 min from the session end until it returns 200; log each time and code, then the minutes from session end to the first 200. At the first 200 also log `curl -s "https://api.openf1.org/v1/session_result?session_key=latest" | jq length` (rows published or 0). This sets the expected latency for 1.10; no code, no other source.
- Additions (`DECISIONS.md` 2026-10-21 "R18 Session F"): (a) 1.4 record both triggers for the :30 minute (QStash `logs_list` and `gh run list --workflow notify-sessions.yml --event schedule` + its log 200/429); (b) Jolpica baseline: first `source='jolpica'` R18 `qualifying` (10-24) and `results` (10-25) rows with `fetched_at`; (c) 1.3 idempotency from `f1_snapshots.fetched_at/source` at two consecutive ticks; (d) keep-awake 10-24 19:00Z → 10-26 01:00Z.
- Probe limits: `/api/live-timing` at most every 2 min, OpenF1 at most every 5 min, one request per probe, no other host. Log lines: UTC ISO time, command, status, key fields; no secrets.
- If the session dies: a new Sonnet session reconstructs from QStash logs, `gh run`, `f1_snapshots`, `notified_sessions`, OpenF1 `date_end`; what was not captured live is written as "not measured live".
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

## Dalga 3 (2026-10-26 12:00 TR →)

Written: 2026-10-26 (Opus, Architect). Order: H first and alone for `node_modules` (vitest major upgrade). O and the 9.0 console work may run next to H (no repo code, no `npm`). Q, R, S, I start when 14.2 is on `main` and run in parallel (file areas do not overlap; shared bridge files only by exact-text edits of their own items).

### Session H — Dependency vulnerabilities and CI gate
Goal: no high production vulnerability, CI runs on `main` and `wip/**`, weekly audit workflow.
Run (phase): Opus 5.5 / high — owner-mandated model (Faz 14); major upgrades. Builder session.
Out of scope: Zod (14.3), any app code change beyond what an upgrade breaks.
Steps:
- [x] 14.2 — master-plan "14.2" (eight sub-steps, one commit each). First step. Done 2026-10-26: `main` 20ae974, CI and security-audit green, `wip/deps-2026-10` deleted (`logs/2026-10-26.md`).
Acceptance: master-plan 14.2 verify passes; `wip/deps-2026-10` CI and Vercel preview green, fast-forwarded to `main` with owner approval, branch deleted locally and on `origin`.
Stop conditions: a major upgrade needs a behaviour change in app code or deletes a behaviour test → `OPEN.md` `To: Opus`. Third failed attempt at one CI error → `OPEN.md`, stop.

### Session O — Media and news gate measurement (Architect)
Goal: K1–K6 measured against live; every FAIL becomes an exact 8.x step.
Run (phase): Opus / xhigh — gate design and multi-layer plan. Architect: measures, no source edits.
Out of scope: implementation; Faz 18–20 items (already planned).
Steps:
- [ ] 8.0 — master-plan "8.0" (input line: `logs/2026-10-23.md`). First step.
Acceptance: each K with command and number in the day's log; each FAIL has at least one 8.x step with `Run:`; files of new steps listed for Dalga 4.
Stop conditions: a K needs a licence or asset decision → "Sahibe sorular" in the report.

### Session 9.0 — GCP project, billing, budgets (owner + Claude in Chrome)
Goal: Apex GCP project with two budgets and the credit scope recorded.
Run (phase): owner + Claude in Chrome — console work; keys and billing are the owner's.
Steps:
- [ ] 9.0 — master-plan "9.0". Then **9.4** in a separate Opus / xhigh Architect session.
Acceptance and stop conditions: as master-plan 9.0; no key value in chat, logs or files.

### Session Q — Provisional Qualifying and Sprint results
Goal: OpenF1 provisional `qualifying` and `sprint` snapshots about 30 min after the session.
Run (phase): Sonnet / high — data accuracy, multi-file cron step.
Depends on: 14.2 on `main`.
Out of scope: UI (1.11), schedules, migrations, env.
Steps:
- [ ] 1.10 — master-plan "1.10". First step.
Acceptance: master-plan 1.10 verify passes; `wip/` CI and preview green; R19 Quali observation is a follow-up read, not part of this session.
Stop conditions: OpenF1 response shape differs from the plan's types → `OPEN.md` `To: Opus`.

### Session R — Live review fixes: data and routing
Goal: correct standings, DNF rate, race counts, 404s, sitemap and number helpers.
Run (phase): Sonnet / high — data correctness, route status codes (1.3 at `/effort low`, 18.3–18.5 at `/effort medium`).
Depends on: 14.2 on `main` (1.3 does not: read-only, run it first, on or after 2026-10-27 00:00Z).
Out of scope: UI copy and styling (Faz 20), `lib/f1/provisional*`, `sync-f1` route (Q).
Steps:
- [ ] 1.3 — master-plan "1.3" (read-only SQL, `/effort low`). First step.
- [ ] 18.1 — master-plan "18.1".
- [ ] 18.2 — master-plan "18.2".
- [ ] 18.3 — master-plan "18.3" (`/effort medium`).
- [ ] 18.4 — master-plan "18.4" (`/effort medium`).
- [ ] 18.5 — master-plan "18.5" (`/effort medium`).
Acceptance: each step's verify passes; one commit per step; `wip/` CI and preview green before `main`.
Stop conditions: 18.2 needs `loading.tsx` removed, or 18.4 needs a new data source → `OPEN.md` `To: Opus`, continue with the next step.

### Session S — News pipeline fixes
Goal: no retrospective "On This Day" items in the feed; telegraph in time order with source tags.
Run (phase): Sonnet / high — news pipeline (19.3 at `/effort medium`).
Depends on: 14.2 on `main`.
Out of scope: `lib/news/rewrite.ts` (19.2 waits for 14.4, then precedes 9.2), `lib/data/news.ts` (14.5).
Steps:
- [ ] 19.1 — master-plan "19.1". First step.
- [ ] 19.3 — master-plan "19.3" (`/effort medium`).
Acceptance: verifies pass; first `sync-news` after deploy logged with the SQL count.
Stop conditions: the RSS item lacks the source title at the filter point → `OPEN.md` `To: Opus`.

### Session I — Remove GitHub schedules
Goal: QStash is the only scheduler for the four cron routes.
Run (phase): Haiku / low — fully specified deletion.
Depends on: 14.2 on `main` (shares `.github/workflows/` with H). Gate passed (`DECISIONS.md` 2026-10-26 decision 3).
Steps:
- [ ] 1.6 — master-plan "1.6". First step.
Acceptance: master-plan 1.6 verify passes; after push, `qstash_list_schedules` (eu) unchanged and the next tick of each route DELIVERED (logged).
Stop conditions: any other line in the four files would change → stop.

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
