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
