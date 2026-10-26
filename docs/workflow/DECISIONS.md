# DECISIONS

Architect appends; newest last. One entry per decision.

<!-- Entry format
## YYYY-MM-DD <title>
- Decision:
- Why / rejected alternative:
- Affects: PLAN.md steps, files
-->

## 2026-10-20 Two-session workflow
- Decision: Opus (Architect) plans and decides; Sonnet (Builder) implements; files in `docs/workflow/` are the only bridge. Rules live in `AGENTS.md`.
- Why: Cheaper builds, no reliance on chat history. Root-file rule forbids PLAN/OPEN/DECISIONS/ARCHITECTURE in the root, hence `docs/workflow/`.
- Affects: `AGENTS.md`, `.claude/agents/`, `.github/workflows/ci.yml` (wip/** push trigger).

## 2026-10-20 Production migrations: Opus audit, then agent applies
- Decision: the owner does not read migrations; an Opus/xhigh audit (PASS recorded here) authorizes an agent to apply via the Supabase connector's `apply_migration`. Destructive statements and data changes still need the owner. Rules in `AGENTS.md` "Migration safety".
- Why: the owner delegated review; a model-restricted gate keeps the review meaningful. Live migration versions match the repo files 1:1 (10 of 10) on 2026-10-20.
- Affects: `AGENTS.md`, `docs/workflow/model-effort.md`.
- Amendment 2026-10-20: the owner does not read SQL and delegated destructive statements too to the Opus/xhigh auditor, narrowed: the audit must record row counts, dependents and a recovery path that exists beforehand, the statement sits alone in its file, and non-regenerable data without recovery, unbounded scope or auditor doubt = FAIL. Data/content changes still need the owner.

## 2026-10-20 Model/effort per phase and step
- Decision: every plan phase/step carries `Run: model / effort`, chosen by the plan writer from `docs/workflow/model-effort.md` without being asked. Owner-mandated models (Faz 13, 14: Opus 5.5) win; `max` and `ultracode` need the owner's OK.
- Why: effort levels are recalibrated per model version; the right level is a planning decision, not a runtime guess.
- Affects: `AGENTS.md`, `docs/plans/master-plan.md`, `docs/workflow/PLAN.md`, `.claude/agents/architect.md`.

## 2026-10-20 Master plan rewrite: phases as sessions, parallel waves
- Decision: `docs/plans/master-plan.md` rewritten from a code audit (measured table in the plan). Each phase/step carries `Run:`, `Owner:`, files, exact change, verify, `Depends on:`; sessions are grouped into "Paralel Dalgalar" with non-overlapping file lists. `PLAN.md` holds the active waves and points to master-plan step numbers instead of copying them (one source of truth).
- Removed (done or stale): 6.1 code part (meta tag and JSON-LD exist), 6.3 code part (Sentry wired, DSN-gated), status table claims not re-measured (test count 749, build 50/50), tech-debt row "PR gate" (no PRs by policy). 13.3/13.6 reset from `[~]` to `[ ]`: no telemetry code exists.
- Why: several "current state" claims were unmeasured or wrong (CI not run since 2026-10-02; 7 routes on a dead `'unknown'` guard; QStash missing notify-sessions; LLM order inverted vs comment).
- Affects: `docs/plans/master-plan.md`, `docs/workflow/PLAN.md`.

## 2026-10-20 Race-weekend code freeze
- Decision: no code push to `main` 2026-10-23 00:00 → 2026-10-26 12:00 (TR). Docs, logs and plan ticks only. GitHub `schedule:` triggers stay as a redundant scheduler through R18; removed after (1.6).
- Why: R18 is the only live test of 1.1-1.7 before the season ends; a regression there costs the measurement. Duplicate cron calls are idempotent (sync routes dedupe).
- Affects: master-plan 1.6, 14.1, 14.2; PLAN.md sessions B, F.

## 2026-10-20 Faz 13/14 execution sessions
- Decision: owner mandate (Faz 13, 14 executed by Claude Opus 5.5) wins over "Opus = ARCHITECT" for those phases only. Such a session is started as a Builder session ("Rol: BUILDER, Opus 5.5, sahip şartı") and implements PLAN.md like any Builder; design steps (13.1) stay Architect sessions.
- Why: model-effort rule 4 already says owner-mandated models win; this states the role so no session refuses to edit code.
- Affects: master-plan Faz 13, 14; PLAN.md session B; `AGENTS.md` "Two-session workflow" (exception line added on owner approval, 2026-10-20).

## 2026-10-20 14.1 rate limiting
- Decision: all 10 public API routes call `applyRateLimit(headers, opts)`; the `clientIP !== 'unknown'` guards and the `push/register` `fallback:unknown` skip are removed. Existing `prefix`/`max`/`windowMs` values unchanged.
- Why / rejected: per-route custom guards drifted (one bypass, seven dead checks). Rejected: a route wrapper HOF (new abstraction, no gain over one call).
- Affects: master-plan 14.1.

## 2026-10-20 14.2 dependency upgrades
- Decision: targeted upgrades, no `npm audit fix --force`: `next` + `eslint-config-next` 16.4.2 pinned equal; `npm audit fix` for transitive; `vitest` ^5.0.5; `sharp` ^0.35.5. CI gate `npm audit --omit=dev --audit-level=high`. CI also runs on `push` to `main` (repo is public: no minutes cost; post-push signal, the `wip/` run stays the pre-push gate). No `dependabot.yml` until the owner answers (it opens PRs; owner policy is no PRs).
- Why / rejected: audit's suggested fix for `eslint-config-next` is a downgrade to 14.2.35 (wrong). Gating dev-only advisories would block CI on tooling with no runtime exposure.
- Affects: master-plan 14.2, `.github/workflows/ci.yml`.

## 2026-10-20 14.3 add zod
- Decision: add `zod@^4` (runtime dependency) and one module `lib/validation/api.ts` with schemas mirroring today's hand-written rules exactly; responses and status codes unchanged.
- Why: owner plan item; one schema per input is easier to audit than scattered regex. Rejected: valibot (smaller, but zod is the de-facto Next.js choice and already named by the owner).
- Affects: master-plan 14.3.

## 2026-10-20 14.5 delete /api/news
- Decision: delete `app/api/news/route.ts`; `getLatestNews` falls back `news_stories` → `news_cache` → `public/news-fallback.json`. Live RSS scanning happens only in the `sync-news` cron.
- Why / rejected: the route's only consumer is the server-side fallback; keeping it as a DB reader would be a public endpoint nobody uses. Rejected: route calling `getLatestNews` (circular with fallback step 2).
- Affects: master-plan 14.5, `docs/reference/apex-reference.md`.

## 2026-10-20 14.6 closed: future auth rule
- Decision: recorded as an invariant in `ARCHITECTURE.md` (Argon2id, RFC 9106). No code exists to change; the plan item is removed.
- Why: a spec item with no code is a rule, not a task.
- Affects: `docs/workflow/ARCHITECTURE.md`, master-plan Faz 14.

## 2026-10-20 Haiku as a Builder model
- Decision: Haiku may run a Builder session only for fully specified mechanical steps (exact files, exact edit, exact verify, no choice). Added to `model-effort.md`.
- Why: owner request; cheapest model for deletions and placeholder swaps.
- Affects: master-plan 0.1, 1.6, 1.8, 7.4; `docs/workflow/model-effort.md`.

## 2026-10-20 Migrations in this plan
- Decision: no step in the current plan needs a migration. If 13.1 chooses a table, it adds a separate step "13.3 Migration audit: Opus / xhigh" before any apply (AGENTS "Migration safety").
- Affects: master-plan Faz 13.

## 2026-10-20 Owner answers applied
- Upstash: owner granted agents QStash write access (scope in `AGENTS.md` Connectors: schedules only, never delete a database/index/bucket). Applied now: `notify-sessions` QStash schedule `scd_6H9JdCRnRKTPCoRhnG5owiiFF2UN`, `*/10`, created by the Architect session. Why `*/10` not the code's `*/5`: MCP schedules always get `retries: 3`; `*/5` would make the worst case 1152 + 384 messages/day, over the 1000/day free quota; `*/10` keeps it at 960. 1.8 replaces all MCP schedules with the code-defined `apex-*` ones (retries 0/1) through a `workflow_dispatch` job, so the only manual step is one repo secret.
- OpenF1: no subscription for now. R18 uses the "locked" criterion; 1.9 (Opus/xhigh) looks for a free, terms-compliant alternative.
- 14.1 is pushed before the race (deadline 2026-10-22 18:00 TR).
- Dependabot (owner delegated the choice): enable Dependabot alerts only (no PRs); no security/version update PRs, no `dependabot.yml`; weekly `security-audit.yml` (`npm audit --omit=dev --audit-level=high`) plus the CI gate. Upgrades go through planned sessions and the `wip/` CI gate. Rejected: Dependabot PRs (breaks the no-PR policy, each PR also triggers a Vercel preview build).
- Owner end-of-project package: contact/legal addresses, real logo, SEO, Sentry DSN, story image sources, media review, LLM console caps move to Faz 16, triggered only when the owner says "proje hazır".
- Media/news "kusursuz" gate: owner definition turned into measurable criteria K1–K6 (master-plan Faz 8); 8.0 (Opus/xhigh) measures them and writes fix steps; 8.6 waits for all PASS.
- Affects: `AGENTS.md`, master-plan Faz 1, 8, 14, 16, waves; `PLAN.md` sessions F, N.

## 2026-10-20 1.9 Free live-data alternative (no OpenF1 subscription)
- Decision: no free source gives a lawful, server-side running order during a session. Apex keeps the honest locked mode it already has (`LiveRaceTracker` → `LightsOutPanel`, `/api/live-timing` 200 `{live:true, restricted:true}`) and closes the gap after the flag instead: OpenF1's free tier unlocks ~30 min after a session ends, so 1.10 writes provisional Qualifying and Sprint classifications from OpenF1 (race results and standings already do, `lib/f1/provisionalSync.ts`); Jolpica rows replace them. Every OpenF1-built snapshot carries `MRData.apexProvisional: true`; 1.11 shows it as "provisional" in the UI and adds the data-source credit the CC BY-NC-SA licences ask for.
- Candidates (measured 2026-10-20 unless dated):
  - F1 live timing, `livetiming.formula1.com` (SignalR Core / static). Cost: free anonymously only in part. Terms: unofficial, no published licence for reuse; F1 put the static archive behind F1 TV auth on 2026-10-14/15 (FastF1 issue #978, maintainer 2026-10-18: "F1 does now require authentication"; our `curl` of `/static/2026/Index.json` → 401), only the root `static/SessionInfo.json` (200, `Cache-Control: max-age=60`, last session's name/status) and `/signalrcore/negotiate` stay open; position/car topics reportedly need an entitlement. Latency: seconds (live stream). Risk: high (owner of the data is actively closing it; would need a long-lived SignalR connection = a hosted runtime outside Vercel Hobby; "unofficial" brand rule). Rejected.
  - OpenF1 free tier, post-session. Cost: €0. Terms: "Personal use", non-commercial fan projects allowed, data CC BY-NC-SA 4.0, credit "not required" per FAQ; 3 req/s, 30 req/min. Latency: whole API returns 401 from 30 min before to ~30 min after each session (R17 measured: locked ≥ 39 min during the race, open again ≤ 54 min after the flag; global lock, past sessions too). Risk: low (already used for race provisional; lock handled as `locked`). Chosen for 1.10.
  - OpenF1 Sponsor (€9.90/month, live REST/MQTT/WebSocket). Owner decision 2026-10-20: no subscription. Not evaluated further; code path (`OPENF1_USERNAME`/`OPENF1_PASSWORD`) already exists if that changes.
  - Jolpica (Ergast successor). Cost: €0. Terms: non-commercial, data CC BY-NC-SA 4.0 (attribution required), abuse may be blocked. Latency: R17 race results 2 h 38 min after the flag (OpenF1 ~1 h). Risk: low; stays the authoritative source.
  - Honest locked mode (calendar only). Cost: €0, no upstream during the session, no invented data. Already shipped (plan 1.7); R18 is its first observation.
- Why: the criteria were free, terms-compliant, server-side, Vercel Hobby, no invented data. Only the post-session OpenF1 path and Jolpica meet all of them; the gain is earlier Qualifying/Sprint results (unlock ~30-60 min vs Jolpica 1-3 h) with no new cost, scheduler or migration (`qualifying`/`sprint` snapshot types and `source='openf1'` already allowed).
- Rejected: scraping formula1.com pages; a self-hosted SignalR relay (new runtime, terms); showing estimated positions (invented data).
- Owner questions (not blocking 1.10): Apex must stay non-commercial (no ads, sponsorship or paid tier) for OpenF1 and Jolpica terms; a commercial turn needs both maintainers' consent.
- Affects: master-plan 1.9 (done), new 1.10, 1.11; PLAN.md Session F (1.9 observation).

## 2026-10-21 Non-commercial status (owner answer to 1.9)
- Decision: Apex is a non-profit, non-commercial project today. The free, non-commercial terms of OpenF1 and Jolpica (CC BY-NC-SA 4.0) fit. If Apex ever turns commercial, the data sources move to paid or licensed access before that change (owner, 2026-10-21).
- Affects: 1.9 owner question closed; 1.11 credit line stays.

## 2026-10-21 13.1 Track telemetry: data, source, storage, tests
- Decision: each current-calendar circuit gets one measured reference lap, the official pole lap of the most recent completed Qualifying there (2023 or later), from OpenF1's free historical API. A Node/TypeScript script (`scripts/build-circuit-telemetry.ts`, `npx tsx`, no env, no Python) builds one static JSON per circuit under `data/circuits/telemetry/`, committed to git and read server-side by `lib/data/circuitTelemetry.ts`. No database table, no migration, no cron. Shown: speed/gear/throttle/brake along the lap, a trace from OpenF1 x/y with the three sector boundaries, slow points (local speed minima with speed and gear), official speed traps of that lap (I1, I2, ST), top/minimum speed, full-throttle share, braking share, gear-shift steps (lower bound), and safety-car counts from race control for races there since 2023 ("SC in k of n races"). Every file carries its source (OpenF1, CC BY-NC-SA 4.0, session/meeting key, year, driver, lap, lap time, fetch time).
- Measured 2026-10-21 (Monza 2026 Qualifying, session 11357): fastest valid lap #10 lap 17, 81.786 s = Jolpica pole GAS Q3 1:21.786. `car_data` 306 samples over 81.32 s (mean 0.267 s, max gap 0.959 s); `location` 313 samples; speed 71-342 km/h; gears 1-8; `drs` null on every 2026 sample; `brake` values 0/100/104 and `throttle` up to 104 (clamp needed); distance by trapezoid integration 5,846 m vs official 5.793 km (+0.9 %); full throttle 78.4 %; gear changes 35, gear steps 44; `laps` gives `duration_sector_1..3`, `i1_speed` 308, `i2_speed` 327, `st_speed` 334; Monza 2026 race `race_control` has `category: "SafetyCar"` rows "SAFETY CAR DEPLOYED" and "VSC DEPLOYED".
- (a) Runtime: Node script, run locally by a Builder; not Python/FastF1 (FastF1 reads the F1 live-timing archive, auth-gated behind F1 TV since 2026-10-14/15, see 1.9), not GCP (one request burst per circuit per year does not need a hosted job).
- (b) Storage: static JSON in the repo (~10 KB per circuit, ~250 KB total), loaded per circuit through a generated loader map (`data/circuits/telemetry/index.ts`), so a page imports only its own file. Rejected: Supabase table (data changes once a year per circuit; a table adds a migration, grants and a sync path for no gain).
- (c) No-invented-data test: `tests/circuit-telemetry-data.test.ts` validates every committed file: source block complete; metrics recomputed from the stored samples with the same pure functions equal the stored values; sample span within 1.5 s of the lap time; integrated lap length within 3 % of `CIRCUIT_FACTS[id].lengthKm` when present; monotonic time and distance; value ranges; sector boundaries increasing inside the lap; `index.ts` lists exactly the files present. The lap is chosen by matching Jolpica's pole time (±0.0015 s) and car number, so a deleted lap can never be used. Values the source cannot give are not shown: corner numbers/names, speed-trap position, DRS (none in 2026), tyre degradation, downforce index.
- (d) Split: 13.2/13.3 Opus 5.5 Builder (types, pure derivations, script, data reader, tests, generated data); 13.4 Antigravity (components, page wiring, copy), Claude Code verifies in a browser and commits. The existing MIT track SVG stays the fallback when a circuit has no telemetry file.
- Rejected: MultiViewer circuit API for corners (unofficial app API, no published terms); estimating corner names or positions from speed minima (would invent official numbering); z as elevation in metres (OpenF1 does not document the unit; not shown).
- Owner notes (not blocking): the 2026 cars have no DRS (measured `drs: null`), so the circuit page's "DRS zones" badge describes earlier seasons; the editorial estimates in `data/circuits/topography.ts` (gear shifts, throttle, braking energy) are superseded on circuits that get measured values (13.4), their removal is an editorial decision (7.x).
- Affects: master-plan 13.1 (done), 13.2, 13.3, 13.4; `PLAN.md` Session M (Dalga 4).

## 2026-10-21 Faz 9 GCP: budget, roles, order (owner decisions + Architect)
- Decision (owner): a dedicated Apex GCP project; until the trial credit ends on 2026-12-16 Apex may use up to $150 of the $300 credit; after that Apex's GCP cost stays at $5-10 per month (owner pays). Console work is done by the owner's Claude in Chrome session with the owner approving; key values never enter chat, logs or files, and only the owner puts them into Vercel.
- Decision (Architect): order 9.0 setup and credit-scope measurement (Dalga 3) → 9.4 service selection (Opus / xhigh, after 9.0) → 9.2 LLM chain, 9.5 remote dev machine only if measurement justifies it, 9.3 credit one-offs → 9.7 fixed close-out 2026-12-10..12. Hard spend limit = per-API request quotas; budgets only alert. The last link of the LLM chain is always a free tier, so removing the GCP key from Vercel is the kill switch.
- Why: the credit scope of Vertex AI vs the Gemini API paid tier is unverified, so the endpoint is chosen after 9.0 measures it. Remote machine: GitHub CI already runs the full gate in 129 s (lint 7, tsc 6, test 7, build 82 s; run 39430714547) versus ~1-4 min per command locally on Windows, so the free fixes (Defender exclusion or WSL2, owner's call) come before a VM, and any VM is deleted by 2026-12-12 because its disk alone would eat the post-credit budget.
- Rejected: Cloud SQL or a VM database (Supabase already serves; Cloud SQL's minimum exceeds $5-10/month); an always-on VM after the credit; linking billing to the existing AI Studio key's project (would move that free key to the paid tier).
- Affects: master-plan Faz 9 (9.0, 9.4, 9.2, 9.5, 9.3, 9.7; 9.1 stays paused), 16.8, wave table.

## 2026-10-21 R18 Session F: how the live checks run
- Decision: the single Sonnet Builder session with session-only `CronCreate` timers is confirmed. Timings checked against code: notify window = start − 30 min ± 5 min (`notify-sessions/route.ts` `NOTIFY_WINDOW_MS`, `NOTIFY_WINDOW_TOLERANCE_MS`) → Quali 20:25–20:35Z (10-24), race 19:25–19:35Z (10-25); race results due 22:30Z (`RACE_RESULTS_OFFSET_MS` 2.5 h), standings 23:00Z, Jolpica qualifying due 22:30Z on 10-24 (`QUALI_SYNC_OFFSET_MS` 90 min). A `notified_sessions` row is claimed even with 0 subscribers, so 1.4 is measurable with `push_subscriptions` empty.
- Additions to the measurements:
  1. 1.4 trigger: QStash `*/10` and GitHub `*/10` both hit :30; the 60 s trigger throttle lets one through and answers the other 429. Record both: QStash `logs_list` state/time for that minute and `gh run list --workflow notify-sessions.yml --event schedule` (the run's log shows 200 or 429). The 200 one wrote the row.
  2. Jolpica latency baseline: the first `f1_snapshots` row with `source='jolpica'` for R18 `qualifying` (10-24) and `results` (10-25), with `fetched_at`. This is the gap 1.10 closes; without it 1.10's value is unmeasured.
  3. 1.3 idempotency by DB, not by response: `fetched_at` and `source` of R18 `results`, `pitstops`, `standings_*` at two consecutive QStash ticks after the first write; unchanged rows = pass.
  4. 1.7 provisional: `provisional.status` sequence is read from QStash logs if the body is shown; otherwise from `f1_snapshots` (`source='openf1'` row appears or not).
  5. Keep awake: the session calls the desktop app's keep-awake tool for 10-24 19:00Z → 10-26 01:00Z; the owner keeps the machine on power.
- Fallback if the session dies: re-open a Sonnet session with the same PLAN slice; it reconstructs what is still readable (QStash `logs_list`, `gh run list/view`, `f1_snapshots.fetched_at/source`, `notified_sessions.created_at`, OpenF1 `sessions` `date_end`) and writes "not measured live" for what is not (401 probes, live-timing responses, unlock minute). Vercel runtime logs are not a fallback (short retention on Hobby). No retroactive guessing.
- Probe rules: one request per probe; `/api/live-timing` at most every 2 min during a session (route limit 30/min, edge cache 60 s when locked); OpenF1 at most every 5 min (401s may count against the 30 req/min quota); no other host. Log lines: UTC ISO time, command (no secrets), HTTP status, the one or two fields that matter.
- What the results decide: the locked-mode check verifies the UI and caching path only; the OpenF1 subscription stays an owner decision (owner: no subscription) and is not reopened by this data. The 1.9 unlock minutes set 1.10's expected latency and the copy in 1.11 ("results in about N minutes"); a lock longer than 60 min after the flag goes to `OPEN.md` `To: Opus`. The 1.4 trigger record and the weekend-long QStash `sync-f1` SUCCESS feed 1.6 (removing GitHub `schedule:`), which is Dalga 3, not decided in the session.
- Builder rights: read-only (Supabase MCP SELECT, Upstash `logs_list`/`qstash_list_schedules`, `gh run`, `curl` to public endpoints); no cron call with a secret, no push, no code. At the end it updates master-plan Faz 1 exactly as `PLAN.md` Session F acceptance says (measured items done, open ones `[~]` with what is open) and makes one pathspec-scoped local commit; Claude Code (owner's push authority) pushes after the freeze ends 2026-10-26 12:00 TR. Anything needing a decision goes to `OPEN.md` `To: Opus` with measurement, options and lean.
- Affects: `PLAN.md` Session F.

## 2026-10-23 Live site review → Faz 18, 19, 20
- Decision: the read-only Claude in Chrome review (`logs/2026-10-23.md`) becomes three phases after the code freeze. Faz 18 (Sonnet, Dalga 3, session R): standings no longer capped (22 drivers / 12 constructors dropped Pérez and historic entrants), DNF = not `Finished`, not `+N Lap(s)`, not `Lapped`; non-existent round/driver/circuit/news pages return 404; circuits tab counts include the featured race and the hard-coded "24 Grand Prix · 21 Ülke" is computed from the calendar; `DRS_LAST_SEASON = 2025` in `lib/f1Calendar.ts` hides DRS on 2026+ views; sitemap adds every season, `/machinery` and recent news; `formatNumber`/`formatPercent` join `lib/i18n/format.ts` (no new module). Faz 19 (Sonnet): drop RaceFans "On This Day" items at ingest (3 of 155 rows today; existing rows age out, no data deletion); rewrite prompt rules plus a names-and-numbers guard in `lib/news/rewrite.ts` after 14.4 and before 9.2; telegraph order and source tag. Faz 20 (Antigravity, Dalga 4 after 1.11): English strings on TR pages, number format, copy fixes, `lang="en"` on English proper names, contrast and 11 px minimum on mobile, grid team card crop.
- Why: these show wrong facts (standings, DNF rate, race counts, a news story with the leader inverted, decade-old race reports as today's news) or wrong language to every visitor; media gaps found (hero 958 px, team placeholders, crops) go to 8.0 as input instead of new steps, because 8.0 owns the media gate.
- Rejected: deleting the 3 retrospective rows now (content change needs owner go-ahead and they leave the feed within days); a guard that rejects any rewrite not word-aligned with the source (would conflict with the 7-word overlap rule in `rewrite.ts`); performance findings (window was minimized, PageSpeed quota exhausted, nothing valid measured), left to 8.0 K2.
- Affects: master-plan Faz 8 (8.0 input line), Faz 18, 19, 20, wave table (R, S, Antigravity 20.x, 19.2 before 9.2).

## 2026-10-26 R18 Session F: answers to the five OPEN entries
- Decision 1 (quali not measured live): 1.1 closes on the race measurement. The locked path (`/api/live-timing` 200 `restricted:true`, OpenF1 401, 60 s client poll, no 502) is session-type independent and passed on 10-25. No R19 live session: the quali-specific number 1.10 needs (unlock latency) is read after the fact at R19 Quali (2026-10-31): OpenF1 `date_end` of that session (readable once unlocked) versus `f1_snapshots` R19 `qualifying` `source='openf1'` `fetched_at` (30 min tick granularity) and the first `source='jolpica'` overwrite. Added to 1.10's verify.
- Decision 2 (1.3 criterion): rewriting until due + 24 h (`SNAPSHOT_SETTLE_AFTER_MS`) is by design, so "unchanged at two consecutive ticks" only applies after settle. New pass rule, measured once with read-only SQL on or after 2026-10-27 00:00Z and before the R19 weekend: R18 `results` and `pitstops` `fetched_at` < 2026-10-26 23:00Z and the two standings rows (round NULL, `StandingsTable.round` 18) < 23:30Z, all `source='jolpica'`; i.e. no tick wrote after settle. `md5(data::text)` is logged next to the 00:37Z values but a difference is not a failure (Jolpica may correct before settle). First step of Session R (Sonnet / low).
- Decision 3 (QStash error/retry): attributed from `logs_list` (eu, two pages, 2026-10-23 13:00Z → 2026-10-26 07:00Z, 2000 events): 6 ERROR events on 5 messages, all HTTP 429 (notify-sessions 4 messages, sync-f1 1 message with 2 attempts); every one ended DELIVERED, no FAILED, no DLQ. Each 429 came less than 60 s after a GitHub scheduled run of the same route (05:59:29 → 06:00:01, 01:29:42 → 01:30:03, 07:09:19 → 07:10:01, 23:29:31 → 23:30:00, 23:39:03 → 23:40:00), i.e. the route's trigger throttle answering the second scheduler. The "64" in `qstash_get_stats` is not reproduced by the logs (its series semantics are unclear); the logs are the measurement. The 1.6 gate passes: QStash `sync-f1` delivered every tick of the weekend, and 1.6 removes the cause of the 429s.
- Decision 4 (quali row rewritten at settle): expected; the 22:30Z rewrite is the settle refetch and the row stayed fixed afterwards. No test added; `tests/sync-f1-idempotent.test.ts` already covers the settled path.
- Decision 5 (OpenF1 unlock): 1.10 assumes about 30 min after `date_end` (race: last 401 27.3 min, first 200 32.3 min; provisional `results` row 30 min 10 s after `date_end`). 1.11 copy uses "about 30 minutes". Quali latency comes from decision 1.
- Also: Dalga 2 is done; Dalga 3 sessions are copied into `PLAN.md`. 14.2 changes `node_modules`, so code sessions Q, R, S, I start when 14.2 is on `main`; O (8.0, measurement only) and the 9.0 console work may run alongside 14.2.
- Affects: master-plan 1.1 (closed), 1.3, 1.6, 1.10; `PLAN.md` Session F, Dalga 3; `OPEN.md` (five entries removed).

## 2026-10-26 Faz 9 update: Vertex first, existing project, credit end 12-18
- Decision (owner): the news rewrite chain is Vertex AI (`VERTEX_API_KEY`, owner-generated, paid from the GCP credit) → Gemini free tier (`GEMINI_API_KEY`) → Groq. This closes 9.4 item 1; 9.2 implements it after 14.4 and 19.2 (same file). The account is at its project limit, so the owner chose the existing `the-curate` project instead of a new one.
- Measured by 9.0 (`logs/2026-10-26.md`): trial credit ends 2026-12-18 (not 12-16), TRY 12,553 left; account currency TRY (Google rate about 48.14 TRY/$), so budgets are TRY 7,220 (credit) and TRY 481/month; two Developer Program credits (about TRY 970) valid to 2027; Supabase region `eu-west-1`, GCP candidate `europe-west1`.
- Guard: a paid key is live in the owner's hands before any quota exists, so 9.2 may not go live until 9.0 items 3–4 (budgets and a Vertex request quota) are set in the key's project. 9.0 also reads which project holds `GEMINI_API_KEY` and whether that project has billing; if it does, that key is not free tier and the "last link is free" rule breaks → `OPEN.md` `To: Opus`.
- Dates: 9.3 and the VM deletion by 2026-12-14, 9.7 close-out 2026-12-12 → 14, first post-credit billing week after 2026-12-19.
- Affects: master-plan Faz 9 header, 9.0, 9.4, 9.2, 9.5, 9.3, 9.7, wave note and Dalga 5 row.

## 2026-10-26 8.0 Media and news gate: measurement and steps
- Decision: K1–K6 were measured against live, read-only (`supabase` MCP SELECT, Upstash `logs_list` eu 5 pages, built-in browser on the 16 `scripts/capture-screenshots.ts` pages at 375 px @2x plus 3 pages at 1440 px, `curl`). K1 FAIL, K2 FAIL on structure (lab timing not measured), K3 FAIL, K4 FAIL, K5 media PASS / news licence open, K6 FAIL. Steps 8.1–8.5 and 8.7–8.13 are in master-plan Faz 8 (8.6 stays paused); Dalga 4 Sessions T (media pipeline) and U (image delivery) in `PLAN.md`; the rest is Dalga 5. Method for the re-measure: `docs/reference/medya-kapisi-olcum.md`.
- Design choices:
  1. Archive id gaps (6 F1DB ids that match no row although the image exists) are fixed where aliases are made (`lib/media/aliases.ts` suffix and subset rule, curated `TEAM_ALIASES`, three `CIRCUIT_ALIASES`) plus a `DISCOVERY_VERSION` that re-discovers old seasons once, so `media_assets.aliases` stays the single source used by pages and `/api/media`. Rejected: a second read-time id map (two sources of truth); clearing `discovered_seasons` by hand (data change outside the code path).
  2. `priority` maps to `fetchPriority="high"` + `loading="eager"` inside `MediaAssetView` and `ApexImage`, call sites unchanged. Measured: on Next 16 `priority` emits a `<link rel=preload>` but no `fetchpriority` (0 of 8 LCP images), and the Next 16 image docs mark it deprecated. `MediaAssetView` gets the existing `variantLoader`, so media images ship a srcset (today one 1600 px file at every size).
  3. Driver photos get a 1280 px variant and the source width as top variant; existing rows are reprocessed through a stored ladder signature (`variant_ladder`), because a `RESOLVER_VERSION` bump only requeues `missing` rows. Rejected: raising the driver minimum width (5 drivers would turn into placeholders).
  4. News without a usable photo gets the licensed `media_assets` image of the first driver, team or circuit named in the title (names from the snapshot layer, no lists), labelled as an archive image with its credit; stored publisher URLs are re-probed for 48 h; a failed publisher image never shows `ApexFallback`. Rejected: scraping the article `og:image` for RaceFans (another unlicensed hotlink plus an HTML fetch per item), dropping RaceFans (does not fix the next imageless source, K6), a placeholder for imageless items (K3).
  5. K2 timing needs a lab tool: a `workflow_dispatch`-only Lighthouse CI job (8.12), no secret, no schedule. PageSpeed Insights answered 429 (anonymous daily quota); the built-in pane runs unthrottled and its visibility toggles, so its LCP times (1.6–5.4 s) are not the K2 number.
- Corrections to the 2026-10-23 input line: the home hero "958 px natural width" was the srcset density-corrected `naturalWidth`; the real file is 960 px at 375 px and 1600 px at 1440 px. The driver hero is worse than recorded: Norris is a 320×441 file drawn at 1131×794 css px (driver files are 320 px for 5 drivers, 640 px for 55).
- Observation outside Faz 8, not decided here: all 16 pages answer `Cache-Control: private, no-cache, no-store` with `X-Vercel-Cache: MISS` on repeat requests and set `NEXT_LOCALE`, including `/tr/anthology` which declares `revalidate = 900`; every view renders on a function. Added to master-plan "Teknik borç" for an Opus design session after 8.12.
- Owner questions (in the report; the steps wait where noted): (1) team logos: `AGENTS.md` forbids official team logos and 11 Commons team logos are live; lean: one designed team mark for all teams (8.11). (2) news photos: 197 of 223 stories show publisher photos with no licence record; lean: licensed archive images or text cards (8.9 has a one-line switch). (3) Lusail, Madring, Las Vegas: pick a Commons file from the 8.8 list or keep the track drawing. (4) stories: 57 of 59 credits are `unverified`; K1 cannot pass before 16.6.
- Affects: master-plan Faz 8 (8.0 removed, gate table, 8.1–8.5, 8.7–8.13), 20.6 (car `sizes`), wave table, "Teknik borç"; `PLAN.md` Session O, Dalga 4 Sessions T and U; new `docs/reference/medya-kapisi-olcum.md`.

## 2026-10-27 Team logos (owner answer to 8.0 question 1)
- Decision (owner, 2026-10-27): official and Commons team logos leave the site; all 11 teams show one designed team mark (8.11). This matches `AGENTS.md` "Forbidden: official F1, team or sponsor logos" and master-plan 20.6 ("resmî logo yok").
- Decision (Architect): the mark is a design element, not a placeholder. K1 and K3 count a team as complete when its mark renders; the mark carries the label "takım işareti / team mark" and the K3 scan does not count those labels. Logo sourcing and serving stop in code (8.11b: no team discovery, no team processing, `getMediaBatch('team', …)` answers placeholders without a query), so neither a page nor `/api/media` serves a logo. `media_assets` team rows and their Storage files stay: hiding needs no deletion, and deleting them is a data change the owner approves separately.
- Rejected: keeping the 7 Commons logos with a typographic badge for the other 4 (two visual languages, trademark exposure); deleting rows and files now (irreversible, not needed to stop serving).
- Affects: master-plan Faz 8 owner questions, 8.11, new 8.11b, wave table; `docs/reference/medya-kapisi-olcum.md` K3 note.
