# Project Anthology (Apex) — reference

Living document. Authority order: code > `AGENTS.md` > this file > everything else. Each section carries a `Last verified` date; a procedure that touches a section updates that date. First written 2026-10-01 from a read-only analysis; the claims were re-checked on 2026-10-01 before this file became canonical (see section 14).

Package name: `project-anthology` [VERIFIED: `package.json`]. Product name used in the UI and docs: Apex [VERIFIED: `README.md`, `PRODUCT.md`, `messages/en.json`]. This file does not replace `docs/plans/master-plan.md` (the live checklist).

Evidence tags: **[VERIFIED]** means the command was run or the file was read. **[INFERRED]** means a conclusion from that evidence. **[UNVERIFIED]** means it could not be checked, with the reason.

---

## 1. Purpose and intended users (only what the repo states)

Last verified: 2026-10-05

The foundational purpose and vision of this project is defined in `docs/vision/apex-vision.md` (bu projenin temel amacı ve vizyonu `docs/vision/apex-vision.md` dökümanıdır; çalışmalar bu vizyon çerçevesinde yapılmalıdır).

Apex (Project Anthology) is an unofficial Formula 1 archive and live-data site. The README states that the season calendar, standings, driver and team profiles, circuits, news, and historical stories share one interface [VERIFIED: `README.md`].

`PRODUCT.md` states the users as Formula 1 followers who want to study season results and driver or team performance in depth on desktop, or check them quickly on mobile [VERIFIED: `PRODUCT.md`]. The same file states the purpose as an unofficial, copyright-safe, fast Formula 1 statistics and telemetry archive, with a calm, technical, authoritative brand, and WCAG 2.2 AA as the target [VERIFIED: `PRODUCT.md`].

`ROADMAP.md` states a further goal: move the product from a portfolio demo to something thousands of users can rely on, with traceable licenses, measurable SEO, and predictable performance [VERIFIED: `ROADMAP.md`]. That file does not record that this goal was accepted as a current release commitment beyond being written there.

The live URL named in the README, master plan, and agent rules is `https://project-anthology-eight.vercel.app` [VERIFIED: `README.md`, `docs/plans/master-plan.md`]. On 2026-10-01 that URL returned HTTP 200, title `Apex - F1 Archive`, canonical `https://project-anthology-eight.vercel.app` [VERIFIED: `Invoke-WebRequest` to `/`].

No file in the repo states a business owner, a company, or a revenue model. Those are not inferred here.

---

## 2. Current state summary (what works, what is broken, what is half-built; measured, not described)

Last verified: 2026-10-08

The web app is a working Next.js product, not a skeleton and not an idea with little code. `components/` contains 95+ `.ts`/`.tsx` files and `app/[locale]/` contains 22 `page.tsx` files [VERIFIED: file search].

### Measured as working on 2026-10-06 (gates re-measured 2026-10-08)

| Check | Result |
|---|---|
| Unit tests | `npx vitest run`: 59 test files, 514/514 passed (exit 0) [VERIFIED: 2026-10-08] |
| Lint | `npm run lint`: exit 0, 0 errors, 11 warnings (8 intentionally unused params of deprecated no-op helpers in `lib/assets/f1-icons.ts`, 3 in gitignored `scratch/`) [VERIFIED: 2026-10-08] |
| Typecheck | `npx tsc --noEmit`: exit 0, no diagnostics [VERIFIED: 2026-10-08] |
| Production build | `npm run build`: exit 0 (Next.js Turbopack). 50/50 static pages and dynamic routes compiled [VERIFIED: 2026-10-08] |
| Media coverage | `media_assets`: 233/246 resolved (hockenheimring resolved 2026-10-07 23:05 UTC), 13 `missing` by design (7 circuits without a free photo, 6 team logos) [VERIFIED: Supabase MCP SELECT, 2026-10-08] |
| Locale leaks | 20 live EN pages scanned for Turkish UI text on 2026-10-08: only `/circuits/spa` and `/circuits/monaco` leaked (elevation + lore panels); fixed in `35fd2f0`, plus the season chart title, driver/team photo labels and circuit HUD (`0e06b06`, `8dc5e9b`) [VERIFIED: curl scan before, local production build after] |
| Core Web Vitals (lab) | Lighthouse 13.5 (local Chrome, live site, mobile simulated 4G, 2026-10-08): home LCP 6.5–7.2 s, CLS ≤ 0.04, TBT ~300 ms, score 64–66; `/season/2026` LCP 3.6 s; `/grid` 5.2 s; `/drivers/norris` 4.5 s; `/circuits/spa` 3.4 s, CLS 0.115. Desktop home: LCP 1.7 s, score 91. Home LCP element is the hero circuit photo; its breakdown is ~0.35–0.6 s TTFB, ~1.6–1.9 s resource load delay, ~0.1–0.2 s load, 0.5–0.7 s render delay. Local A/B on a production build: hinting the image earlier (`getImageProps` + `ReactDOM.preload` before the other hero reads) gave no gain; hiding the home news thumbnails (7 full-size third-party press photos, 130–331 KB each, shown at 44 px, `unoptimized`) cut the page from 1,716 to ~650 KiB and LCP from 6.8–7.2 s to 5.6–5.8 s (owner decision, master-plan 6.2). Field data (CrUX): none, PageSpeed Insights API returned 429 (keyless daily quota) [VERIFIED: Lighthouse JSON reports] |
| Live home | HTTP 200 [VERIFIED] |
| Live `sitemap.xml` | HTTP 200; first URL is the eight host, with `en` / `tr` / `x-default` alternates [VERIFIED] |
| Live `robots.txt` | HTTP 200; allows `/` and the legal paths; disallows `/api/` and `/api/cron/` [VERIFIED] |
| Live cron without a token | `GET /api/cron/sync-news`, `/sync-f1`, `/sync-radio`, `/notify-sessions` returned HTTP 401 [VERIFIED] |
| Database reachability from this machine | The build logged successful Supabase reads of `news_stories`, `stories`, `radio_moments`, and `f1_snapshots` for season 2026 [VERIFIED: build log] |
| Machinery | `/machinery` index and `/machinery/[id]` dossier routes; each car shows its licensed archive photo (`iconic:<id>`, server `getMediaBatch`) or, only when none exists, a minimal two-tone livery silhouette (`MachineryVisual` → `CarPlaceholder` → `F1CarSilhouette`) [VERIFIED: 2026-10-08] |
| Tech Glossary 2.0 | `RegulationErasPanel` (1994–2026) and `TyreThermalWindows` (C1–C5) live in `/tech-glossary` [VERIFIED: 2026-10-06] |
| Circuits & Telemetry | Topography elevation profiles and curated lore cards live in `/circuits/[id]` [VERIFIED: 2026-10-06] |
| Season & Grid Dynamics | `SeasonProgressionChart`, `GridDeltaBadge`, and `TeammateHeadToHead` live in season and grid [VERIFIED: 2026-10-06] |

### Season history (added 2026-10-02)

- Driver, team, season and grid pages are selectable by season for 1950 onward (`?season=`), with era colours, career-to-date, driver team journey and a team DNA section. Measured on the dev server: 377 pages (all 187 teams, 170 drivers, 20 seasons) and all 22 current drivers and 11 current teams answered HTTP 200 with no `undefined`/`NaN`/`null` text. Colours in `data/history/liveries.ts` (67 curated teams) are editorial approximations, owner review open; other teams use national racing colours.

### Broken or wrong relative to the code and the live host

- Fixed 2026-10-01: `lib/data/siteUrl.ts` used to fall back to `https://project-anthology-seven.vercel.app`, which returns HTTP 404 [VERIFIED: `curl`]. The single exported constant `PROD_SITE_URL` is now the eight host, and `scripts/sync-f1-scheduled.ts` imports it (`tests/siteUrl.test.ts`). On Vercel the function prefers `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL`, and only then this constant [VERIFIED: `lib/data/siteUrl.ts`]. The live canonical is the eight host [VERIFIED: homepage HTML].
- Local `npm run build` warns twice that `metadataBase` is not set and resolves to `http://localhost:3000` [VERIFIED: build logs]. Cause is not a missing `NEXT_PUBLIC_SITE_URL`: a build run on 2026-10-02 with `NEXT_PUBLIC_SITE_URL` set to the live host printed the same two warnings. In a production build `getSiteUrl()` already falls back to `PROD_SITE_URL`, and every page under `app/[locale]` inherits `metadataBase` from `app/[locale]/layout.tsx`. The only code outside that layout is `app/not-found.tsx` and `app/global-error.tsx` (plus the file-based `app/opengraph-image.tsx`), so the two warnings most likely come from those two prerendered pages [INFERRED, not isolated]. Effect: only their generated `og:image` meta can point at localhost; the live canonical for real pages is unaffected [VERIFIED: homepage HTML]. No workaround was added. `NEXT_PUBLIC_SITE_URL` is already named in `.env.example` (empty). Note: in `next dev` an unknown URL 500s with "not-found.tsx doesn't have a root layout" (same file, dev only; the live site returns 404 for unknown URLs [VERIFIED: `curl`]).
- Sentry source-map upload during this build was skipped. The CLI reported `Project not found` for org `anthology-z0`, project `project-anthology` [VERIFIED: `next.config.ts` and the build log]. Whether production Sentry receives events was not checked.
- Legal pages link to placeholder mailboxes `privacy@apexstats.example`, `dmca@apexstats.example`, and `contact@apexstats.example` [VERIFIED: `app/[locale]/(legal)/*/page.tsx`].
- Analytics consent (done 2026-10-02): `@vercel/analytics` and `@vercel/speed-insights` are mounted only after the visitor presses Accept (`components/consent/AnalyticsConsent.tsx`, logic in `lib/consent.ts`, choice in `localStorage` key `apex-analytics-consent`, footer link reopens it). In a browser (dev build, 375px, EN and TR): nothing loaded before a choice, nothing after Decline and after reload, both `va.vercel-scripts.com` scripts load after Accept. The privacy page is now bilingual (messages `privacy.*`) and describes exactly this. The privacy mailbox is still a `.example` placeholder.

### Half-built, or stated as open while the code has moved on

- `docs/plans/master-plan.md` previously had unchecked items: tablet breakpoint (WEB-UI.4), season layout (WEB-UI.5), list template (WEB-UI.6), and detail template (WEB-UI.7) were measured in Chromium on 2026-10-05 and marked verified (0 overflow across 375/768/1280px). Lighthouse (WEB-UI.8), permanent 2026 Jolpica snapshot fill, live-race end-to-end check, i18n phase-6 QA, and mobile store release stay open.
- Playwright is a devDependency and is used for headless browser audits [VERIFIED: 2026-10-05 audit].
- `mobile/` exists on disk (Expo ~56, React Native 0.85.3) and is gitignored. `git ls-files mobile` returned 0 tracked files [VERIFIED]. It is not part of the git tree that `main` deploys. Mobile scripts were not run.
- `.github/workflows/ci.yml` (added 2026-10-01) runs `npm ci`, lint, `tsc --noEmit`, `npm test`, `npm run build` on pull requests to `main`, on the Node in `.nvmrc` (24). It has not run on GitHub yet [UNVERIFIED]; the same commands were run locally on Node 22 with placeholder Supabase env. The other three workflows only call cron endpoints.
- Node: this machine is v22.18.0. `package.json` `engines` and `.nvmrc` say 24. GitHub Actions `sync-f1-race-aware.yml` uses Node 22 [VERIFIED]. Tests and the build passed on Node 22 anyway.

`project-anthology-seven.vercel.app` is down (404). Older docs still name `project-anthology-five.vercel.app` [VERIFIED: `docs/reference/muhendislik-dersleri.md`]. The log of 2026-09-29 says the five project was deleted by the owner [VERIFIED: `logs/2026-09-29.md`]. The five host was not requested in this pass.

---

## 3. Architecture (stack, structure, data flow, directory map)

Last verified: 2026-10-02

### Stack

[VERIFIED: `package.json`, `next.config.ts`, `i18n/routing.ts`, `README.md`]

| Layer | What is in the repo |
|---|---|
| Web | Next.js 16.2.7 App Router, React 19.2.4, TypeScript 5 (`strict: true` in `tsconfig.json`) |
| UI | Tailwind CSS 4, Framer Motion 12 |
| i18n | `next-intl` 4. Locales `en` (no prefix) and `tr` (`/tr/...`) via `i18n/routing.ts`. Locale proxy is `proxy.ts` (Next.js 16 proxy convention, not `middleware.ts`) |
| Data | Supabase PostgreSQL through `@supabase/supabase-js`. Anon client for reads, service-role client for writes [VERIFIED: `lib/supabase.ts`] |
| Host | Documented as Vercel. `vercel.json` sets `framework: nextjs` and three daily crons |
| External data | Jolpica (`https://api.jolpi.ca/ergast/f1`), F1DB seed, OpenF1, Open-Meteo, RSS, MyMemory, Groq, Gemini [VERIFIED: source files named in section 4] |
| Observe | `@sentry/nextjs`, Vercel Analytics, Speed Insights |
| Limit | `@upstash/ratelimit` and `@upstash/redis`, with an in-memory fallback [VERIFIED: `lib/rateLimit.ts`, `lib/cronAuth.ts`] |
| Test | Vitest. Playwright is installed and unused |

There is no Supabase Auth usage. A search for `signIn`, `getUser(`, and `supabase.auth` in `*.ts`/`*.tsx` found nothing [VERIFIED].

### Data flow

```
Jolpica / F1DB / OpenF1 / RSS / Open-Meteo / Groq / Gemini / MyMemory
        │  cron only (service role) — not from the browser
        ▼
Supabase tables (RLS: public read where intended, service role writes)
        │  lib/data/* in React Server Components
        ▼
app/[locale]/**/page.tsx  →  components/*
        │
        ▼
Public JSON routes under app/api/*  (rate-limited, snapshot-first where noted)
```

[VERIFIED: `README.md` architecture block, `lib/data/f1.ts` usage from pages, cron route imports, `app/[locale]/page.tsx` imports `getLatestNews` rather than a live RSS call.]

Rules that the code and the engineering standard both state:

- Season, “is the race over”, and current year come from `lib/f1Calendar.ts`. `CURRENT_SEASON` is the UTC year. Hardcoded season/driver/team lists are forbidden [VERIFIED: `AGENTS.md`, `lib/f1Calendar.ts` imports].
- Historical seasons are read from the database. The current season can fall through to Jolpica when the snapshot is stale or content-invalid [VERIFIED: `docs/reference/muhendislik-dersleri.md` describes this; `tests/f1-read-fallback.test.ts` passed, which covers that read order].
- News pages read `news_stories`, not the visitor’s browser calling RSS [VERIFIED: `docs/plans/news-stories-ui-handoff.md` and `docs/vision/technical.md` “Haber hikâyeleri” section; home page imports `getLatestNews`].

### Directory map

Paths below were confirmed by file search or `Test-Path` on 2026-10-06.

| Path | Role |
|---|---|
| `app/[locale]/` | Pages: home, season, season year, round, drivers, teams, grid, circuits, news, news id, anthology, glossary, disclaimer, privacy, terms, dmca |
| `app/api/` | 15 route handlers: five crons (`sync-news`, `sync-f1`, `sync-radio`, `notify-sessions`, `sync-media`), `f1-season`, `live-timing`, `news`, `media`, `push/register`, season, circuit, driver career, team career |
| `app/sitemap.ts`, `app/robots.ts` | Crawl surface |
| `components/` | UI. 89 modules: layout, home, season, news, profile, anthology, glossary, legal, media |
| `lib/` | `data/`, `f1/`, `news/`, `api/`, `security/csp.ts`, `seo.ts`, `cronAuth.ts`, `rateLimit.ts`, `supabase.ts`, `f1Calendar.ts`, `f1Ingest.ts` |
| `data/` | Editorial content: drivers, teams, stories, glossary, circuit facts |
| `data/history/` | F1 history index generated from F1DB (CC BY 4.0): `constructor-index.json`, `constructors.json`, `drivers.json`, `seasons.json`, `meta.json`; editorial `liveries.ts`, `team-dna.ts` |
| `config/team-colors.ts` | Team color tokens |
| `i18n/`, `messages/en.json`, `messages/tr.json` | Locale routing and UI strings |
| `supabase/migrations/` | 8 SQL migrations. `supabase/config.toml` exists |
| `scripts/` | `seed-f1-history.ts`, `seed-stories.ts`, `sync-f1-scheduled.ts`, `verify-seed-coverage.ts`, `dedupe-f1-snapshots.ts` |
| `tests/` | 22 Vitest files. `vitest.config.ts` includes only `tests/**/*.test.ts` |
| `public/` | Client runtime assets: `brand/` (logos), `circuits/` (25 SVGs), `tyres/` (11 SVGs), `glossary-icons/` (20 webp), `stories/` (56 PNGs in 17 story folders; source records: `data/stories/image-credits.ts`, owner worklist: `docs/reference/hikaye-gorselleri-kaynak-listesi.md`). Cleaned of duplicate or unreferenced assets [VERIFIED: 2026-10-06] |
| `assets/` | Build-time datasets and source assets: `brand/`, `data/`, `f1-circuits/`, `raw-glossary-icons/`, `scripts/`, `icons/` |
| `stories-images/` | Retired on 2026-10-06 (100% duplicate of `public/stories/`; backed up to `backup/pre-asset-cleanup-20261006` and removed from git) |
| `.github/workflows/` | `sync-f1-race-aware.yml`, `sync-news.yml`, `notify-sessions.yml`, `sync-media.yml` |
| `mobile/` | Expo app on disk only. Gitignored. Not in git |
| `docs/`, `logs/`, `design/` | Documentation and a separate design folder |
| `railway/`, `pre-plans/` | Not on disk [VERIFIED: `Test-Path`]. Older docs still mention them |

`next.config.ts` sets security headers (CSP from `lib/security/csp.ts`, HSTS, frame, referrer, permissions), `poweredByHeader: false`, a permanent redirect from `/radio` to `/anthology`, empty `images.remotePatterns`, and preview-only `X-Robots-Tag: noindex` when `VERCEL_ENV=preview` [VERIFIED: file]. `proxy.ts` sets the same preview robots header on page requests.

---

## 4. Data and infrastructure (DB, schema, migrations, external APIs, cron jobs, deployment, branch and deploy triggers)

Last verified: 2026-10-08

### Tables

Initial migration `supabase/migrations/20260603000001_initial_schema.sql` creates `stories`, `radio_moments`, `circuits`, `f1_snapshots`, `news_cache`, enables RLS, grants `SELECT` to `anon` and `authenticated`, and grants writes to `service_role` [VERIFIED].

Later migrations [VERIFIED: each file]:

| File | Change |
|---|---|
| `20260606000001_partial_unique_index.sql` | Partial unique index on `f1_snapshots (season, type) WHERE round IS NULL` |
| `20260625000001_push_subscriptions.sql` | `push_subscriptions`. RLS on. `REVOKE ALL` from `anon` and `authenticated` |
| `20260714000001_notified_sessions.sql` | `notified_sessions` dedupe for push. Same revoke |
| `20260929000001_pitstops_snapshot_type.sql` | Adds `pitstops` to the `f1_snapshots.type` check |
| `20260929000002_circuit_weather.sql` | `circuit_weather`. Public read. Comment says only the upcoming or current race is kept |
| `20260929000003_news_cache_tr.sql` | `news_cache.title_tr`, `description_tr` |
| `20260929000004_news_stories.sql` | `news_stories`. Public read. Service-role write. 7-day retention is described in the SQL comment |
| `20261006000001_media_assets.sql` | `media_assets` + `media_sync_state`, RLS (anon reads only `resolved` and not `rejected` rows), column-level `GRANT` (diagnostic columns private), public `media` Storage bucket. **Applied live 2026-10-06** (owner go-ahead, Supabase MCP; history row registered with the repo version). See `docs/reference/media-sistemi.md` |
| `20261006000002_push_service_role_grants.sql` | Grants `service_role` SELECT/INSERT/UPDATE/DELETE on `push_subscriptions` and `notified_sessions` (the live DB has none: measured 2026-10-06 with `has_table_privilege`), re-asserts the `anon`/`authenticated` revoke, sets `set_updated_at()` `search_path = ''` (security advisor). **Applied live 2026-10-06** (verified: `service_role` full on both tables, anon 401, advisor warning gone) |

Live vs local comparison (2026-10-06, read-only, Supabase MCP, project `project-anthology`, Postgres 17): the 8 applied migrations match the repo (`list_migrations` versions and names identical); tables, columns, CHECK constraints, indexes, RLS policies and `anon`/`authenticated`/`service_role` grants match the migrations for all 9 public tables, **except** `push_subscriptions` and `notified_sessions`, where `service_role` has no privileges at all (see the 20261006000002 row). `media_assets`, `media_sync_state` and the `media` bucket did not exist at comparison time; they were created the same day (see the migration rows below). Security advisor: 2 INFO (`rls_enabled_no_policy` on those two service-only tables, intended) and 1 WARN (`function_search_path_mutable` on `set_updated_at`); performance advisor: 1 INFO (unused index `idx_news_cache_tags`). `f1_snapshots` holds 2606 rows: 1950–2025 all `f1db`, 2026 all `jolpica` (56). `types/database.ts` has no `notified_sessions` type (the cron uses an untyped client) [VERIFIED: Supabase MCP queries, migration files].

`f1_snapshots` stores Ergast-shaped JSON. Season-level rows use `round IS NULL`. Allowed `source` values in the initial check are `f1db`, `jolpica`, `openf1` [VERIFIED: initial SQL].

Whether the remote migration history matches these eight files one-for-one was not checked. `npx supabase migration list` was not run [UNVERIFIED: no remote migration diff]. The build did read `news_stories` and `f1_snapshots`, so those objects exist in the database this environment uses [VERIFIED: build log].

### External APIs

| Source | Where it is used | Notes in code |
|---|---|---|
| Jolpica / Ergast | `lib/f1/sources/jolpica.ts`, `app/api/f1-season/route.ts`, `scripts/sync-f1-scheduled.ts` | Proxy path is a whitelist regex. Host is hardcoded. Snapshot is returned before a live call [VERIFIED: `app/api/f1-season/route.ts`] |
| F1DB | `lib/f1/sources/f1db.ts`, `npm run seed:f1db`, and `scripts/build-f1-history-index.ts` (committed history index). **License CC BY 4.0: attribution is shown in the footer** | Historical seed. Local index is `v2026.16.0` (updated 2026-10-05); upstream release is `v2026.16.0` (published 2026-10-04) [VERIFIED: local build + GitHub API] |
| OpenF1 | `lib/f1/sources/openf1.ts`, `app/api/live-timing/route.ts`, `sync-radio` | Code comment: 3 requests/second shared, not per visitor. Live route uses 5s edge cache, an in-memory stampede guard, and an 8s timeout [VERIFIED: route comments] |
| Open-Meteo | circuit weather cron path described in `docs/plans/master-plan.md` and `20260929000002_circuit_weather.sql` | Page reads are documented as DB-only |
| RSS | `lib/news/aggregate.ts`, `sync-news` | Clustered into `news_stories` |
| Groq, then Gemini | `lib/news/rewrite.ts` | Default models `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, then `gemini-3.5-flash-lite`, `gemini-3.8-flash`. Overridable by `GROQ_NEWS_MODELS` and `GEMINI_NEWS_MODELS` |
| MyMemory | `lib/news/translate.ts` (named in the news_cache TR migration and master plan) | No API key. Free quota |
| Expo push | `app/api/push/register/route.ts`, `lib/push/sendExpoPush.ts` | Token must pass `Expo.isExpoPushToken` |

### Cron and schedules

`vercel.json` [VERIFIED]:

| Path | Schedule |
|---|---|
| `/api/cron/sync-news` | `0 6 * * *` |
| `/api/cron/sync-f1?scope=season` | `0 7 * * *` |
| `/api/cron/sync-radio` | `0 8 * * *` |

`notify-sessions` is not in `vercel.json`.

GitHub Actions [VERIFIED: the three YAML files]:

| Workflow | Schedule | What it does |
|---|---|---|
| `sync-f1-race-aware.yml` | hourly, plus `workflow_dispatch` | `npx tsx@4.22.4 scripts/sync-f1-scheduled.ts` (no `npm ci` since 2026-10-01), which calls `sync-f1?scope=live` only when a session window is due |
| `sync-news.yml` | minute 7 of every hour, plus dispatch | `curl` to `/api/cron/sync-news` with Bearer `CRON_SECRET_KEY`, 420s max |
| `sync-media.yml` | minute 17 of every hour, plus dispatch | `curl` to `/api/cron/sync-media` with Bearer `CRON_SECRET_KEY`, 320s max. The route answers 200 `skipped` until the media migration is applied. Not in `vercel.json` because Hobby crons run once a day [VERIFIED: workflow and route files; not yet run in GitHub Actions] |
| `notify-sessions.yml` | every 10 minutes, plus dispatch | `curl` to `/api/cron/notify-sessions` |

All five cron routes (`sync-media` added 2026-10-06) call `isCronAuthorized` [VERIFIED: grep of `app/api/**/route.ts`]. On 2026-10-05, the four routes that existed then (`sync-news`, `sync-f1`, `sync-radio`, `notify-sessions`) returned HTTP 401 when accessed without authorization [VERIFIED: live curl]. `maxDuration` is 300s for sync-f1, sync-news, and sync-radio, and 60s for notify-sessions [VERIFIED: those files]. GitHub Actions runs on 2026-10-05 completed successfully for notify-sessions, sync-f1 race-aware, and sync-news [VERIFIED: `gh run list`].

`notify-sessions` dedupe (2026-10-08): the route reads subscribers first (a failed read returns 500 and claims nothing, so the next run inside the ±5 min window retries), then claims each due session by inserting its `notified_sessions` row and only sends after a successful claim. A unique violation (`23505`) means an earlier or overlapping caller already sent it (`deduped`); any other insert error skips the send and makes the run return 500 with the session in `failed` (no silent re-send every run). Response fields: `sessionsChecked`, `claimed`, `deduped`, `notified` (accepted Expo tickets only), `failed` [VERIFIED: `app/api/cron/notify-sessions/route.ts`, `tests/notify-sessions-route.test.ts` 7 tests].

**Measured 2026-10-07 (`gh run list`, `schedule` events): GitHub does not honour these schedules.** `notify-sessions` (nominal every 10 min) ran with a median gap of 308 min (min 142, max 562; ~5 runs/day instead of 144); `sync-news` and `sync-media` (nominal hourly) ~5 runs/day with median gaps of 327 and 249 min; `sync-f1-race-aware` (nominal hourly) ~5 runs/day, longest gap 9.4 h. GitHub runs scheduled workflows best-effort and delays or drops them on low-activity repositories. Consequences: the 30-minute push window of `notify-sessions` cannot be hit reliably, and `sync-f1-scheduled.ts` used to look back only 65 minutes (now 12 h, 2026-10-07) so most due windows were missed. A reliable external scheduler is open (master-plan 1.6) [VERIFIED: `gh run list` gap statistics, `scripts/sync-f1-scheduled.ts`, simulated due-check].

**Why GitHub does this (researched 2026-10-07).** GitHub's own docs say scheduled events can be delayed during periods of high load, that load is highest at the start of every hour, and that queued jobs may be dropped under sufficient load; delivery is best-effort, not a timer. Our crons are valid (5-minute minimum respected, none on minute 0) and the repo is public, so this is a platform limit, not a bug in our workflows. The mistake was architectural: time-critical jobs (push 30 minutes before a session, results 2.5 hours after the flag) were put on a best-effort trigger. [VERIFIED: `gh run list` gaps, workflow files; docs wording via web search, not re-read on the GitHub docs site in this pass]

**Primary scheduler: Upstash QStash (code ready 2026-10-07, owner setup pending, master-plan 1.6).** `lib/cron/qstashSchedules.ts` defines four schedules, `scripts/qstash-sync.ts` (`npm run qstash:sync`) creates or updates them idempotently (fixed `Upstash-Schedule-Id`), and QStash forwards `Authorization: Bearer <CRON_SECRET>` to the existing routes, so no route changed:

| Schedule id | Route | Cron (UTC) | Runs/day | Retries |
|---|---|---|---|---|
| `apex-notify-sessions` | `/api/cron/notify-sessions` | `*/5 * * * *` | 288 | 0 |
| `apex-sync-f1` | `/api/cron/sync-f1` (auto scope: live on a race weekend, season otherwise) | `*/30 * * * *` | 48 | 1 |
| `apex-sync-news` | `/api/cron/sync-news` | `11 * * * *` | 24 | 1 |
| `apex-sync-media` | `/api/cron/sync-media` | `41 * * * *` | 24 | 1 |

Free-plan limits (Upstash pricing page, checked 2026-10-07): 1,000 messages/day, 10 active schedules, 15 minutes max HTTP response duration; each delivery attempt including each retry counts as a message, and the limits are soft (short spikes are not blocked, sustained overage may return 429). Our load: **384 messages on a normal day, 480 worst case (every run fails and retries), 4 of 10 schedules**. `tests/qstash-schedules.test.ts` fails if the worst case exceeds 60% of the quota, if a schedule points at a route that does not exist or lacks `isCronAuthorized`, or if a timeout does not fit the route's `maxDuration`. The routes' 60-second trigger throttle (`isCronTriggerAllowed`) still applies. The GitHub `schedule` triggers stay as a harmless fallback until QStash is verified; then they are removed (workflows keep `workflow_dispatch`) so two callers cannot overlap.

The YAML comments say Vercel Hobby allows one cron run per day, which is why the finer jobs moved to GitHub Actions [VERIFIED: workflow comments]. The actual Vercel plan on the current account was not opened [UNVERIFIED: no Vercel dashboard access in this pass].

Daily Vercel runs and the hourly GitHub runs both hit `sync-news` and `sync-f1`. The news route comment says a 60-second minimum interval and idempotent rewrites [VERIFIED: `sync-news.yml` header]. They can still double the provider cost once a day.

`sync-f1` is idempotent per snapshot (2026-10-06): a `source='jolpica'` row fetched at least 24h after its due window (`SNAPSHOT_SETTLE_AFTER_MS`) is final and is not fetched again, so each session is pulled from Jolpica until it settles and then left alone. Results and pit stops are gated separately, a postponed race un-settles itself (its due time moves), `?force=1` re-fetches everything in scope, and the response carries a `settled` counter. The fetch-time index is one `f1_snapshots` query that fails open (an unreadable DB means everything is fetched, as before) [VERIFIED: `lib/f1/syncSchedule.ts`, `lib/f1Ingest.ts`, `app/api/cron/sync-f1/route.ts`, `tests/sync-f1-idempotent.test.ts` 11 tests]. The read path is stale-while-revalidate (2026-10-06, owner decision): a stale current-season DB row younger than `MAX_SERVE_STALE_MS` (3 days) is served immediately and refreshed after the response through `after()` (`lib/data/snapshotRefresh.ts`: calendar, results, qualifying, sprint, pit stops; `has*` validation, `source='jolpica'`, one refresh per snapshot per minute per instance, skipped during `next build`). A missing row, a content-invalid row, or a row older than the cap still goes live to the Jolpica proxy. Standings are served stale and left to the hourly cron, because the leader-change push compares stored vs fetched leader and a page-triggered refresh would swallow it [VERIFIED: `lib/data/f1.ts`, `lib/data/snapshotRefresh.ts`, `tests/snapshot-refresh.test.ts`, `tests/snapshot-refresh-read.test.ts`].

### Deployment and branches

- Current shipping branch is `main`, even with `origin/main` [VERIFIED: `git status` at the start of this analysis].
- No workflow deploys the site; `ci.yml` only checks pull requests [VERIFIED].
- Docs say Vercel deploys the web app [VERIFIED: `README.md`]. The git event that triggers that deploy was not read from a Vercel project setting [UNVERIFIED].
- Only `main` is worked on; side branches are not opened, and merged or commit-less ones are deleted (owner rule 2026-10-08, `AGENTS.md`). On 2026-10-08 `agent/season-history`, `claude/admiring-feynman-60ofyp` and `claude/blissful-curie-q5c4ck` had no commit missing from `main` and were deleted; `feat/apex-frontend-rebuild` was no longer on the remote. `agent/pilot-setup` has 255 commits not in `main` and stays until the owner decides (section 13) [VERIFIED: `git rev-list --count origin/main..origin/<branch>`, 2026-10-08].
- `railway/` was removed. The 2026-09-29 log says the Railway cron was never deployed and was replaced by GitHub Actions [VERIFIED: log plus `Test-Path railway` is false].

---

## 5. Security, secrets and cost exposure (env handling, .gitignore coverage, auth, abuse and quota risks)

Last verified: 2026-10-02

### Env handling

`.gitignore` ignores `.env*` and un-ignores `.env.example`. `git ls-files` shows only `.env.example` tracked. `git check-ignore` matches `.env.local`, `.env.local.append`, and `.env.sentry-build-plugin` [VERIFIED].

Names only. No values are recorded here.

`.env.example` keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `CRON_SECRET_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL`.

`.env.local` keys present: `CRON_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_OIDC_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`.

`.env.local.append` keys: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `CRON_SECRET_KEY`.

`.env.sentry-build-plugin` key: `SENTRY_AUTH_TOKEN`.

Next.js does not load `.env.local.append` by default [INFERRED: Next env file names; the append file is separate]. Sentry DSN names are not in `.env.local`.

Until 2026-10-01 these names were read in code but missing from `.env.example`; they were added with empty values [VERIFIED: `lib/news/rewrite.ts`, `lib/cronAuth.ts`, `lib/rateLimit.ts`, `sentry.*.config.ts`, `instrumentation-client.ts`, `next.config.ts`, `scripts/sync-f1-scheduled.ts`]: `GROQ_API_KEY`, `GROQ_NEWS_MODELS`, `GEMINI_NEWS_MODELS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_UPLOAD_SOURCE_MAPS`, `SITE_URL`.

`REDIS_URL` is in `.env.local` and is not referenced under `lib/` [VERIFIED: search]. It looks unused.

`CRON_SECRET` is the name Vercel injects. `CRON_SECRET_KEY` is the legacy alias. `isCronAuthorized` accepts either, compares with `timingSafeEqual`, and fails closed when neither is set [VERIFIED: `lib/cronAuth.ts`]. The live unauthenticated call returned 401, so production has some secret configured [VERIFIED]. Which of the two names is set in the Vercel project was not opened [UNVERIFIED].

The 2026-10-01 log says `NEXT_PUBLIC_SITE_URL` on Vercel, and the GitHub Actions secret/variable, were still pending after the move to the eight host [VERIFIED: `logs/2026-10-01.md`]. This pass did not re-check GitHub Actions run history or the Vercel env screen [UNVERIFIED]. The live canonical is already the eight host, so a missing `NEXT_PUBLIC_SITE_URL` is not currently breaking the public canonical [VERIFIED: HTML]. `VERCEL_URL` can explain that without the explicit variable [INFERRED: `getSiteUrl` order].

### Auth

There are no user accounts. Public data is world-readable by RLS design: published stories and radio moments, all circuits, all `f1_snapshots`, all `news_cache`, all `news_stories`, all `circuit_weather` [VERIFIED: SQL]. `push_subscriptions` and `notified_sessions` are revoked from `anon` [VERIFIED: SQL].

Cron writes use the service role on the server [VERIFIED: `lib/supabase.ts` comments and cron imports].

### Abuse and quota

- Public JSON routes call `rateLimit` or `applyRateLimit`: news, season, careers, circuits, live-timing (30/min), push register (10/min) [VERIFIED: grep and the two route files read]. If Upstash env is absent, the limit is per server instance only [VERIFIED: `lib/rateLimit.ts`]. The master plan still lists “Upstash env on Vercel” as debt [VERIFIED: `docs/plans/master-plan.md`]. Local `.env.local` has the Upstash names. Production presence was not confirmed in this pass, and the 2026-09-28 log already said it could not be confirmed [VERIFIED: log]. [UNVERIFIED] for the current eight project.
- Cron routes have a trigger lock. With Upstash it is a distributed SET NX. Without it, the lock is in-memory [VERIFIED: `lib/cronAuth.ts`]. A leaked cron secret can still start a 300s function on every instance if the distributed lock is absent [INFERRED: from that fallback].
- `f1-season` cannot be turned into an open proxy: the only user input is `path`, matched to a whitelist, appended to a fixed Jolpica host [VERIFIED: route].
- `live-timing` can still spend OpenF1 quota on a cache miss. The code treats a fan-out as the failure mode it already fixed once [VERIFIED: route comments and `logs/2026-09-28.md`].
- News rewrite runs on the hourly GitHub cron and can call Groq and Gemini for up to 300s [VERIFIED: `maxDuration` and `sync-news.yml`]. The 2026-10-01 log records one real run of about 200s, 94 stories, 51 original EN+TR rewrites [VERIFIED: log text; this pass did not repeat the cron].
- `sync-f1-race-aware.yml` no longer runs `npm ci`: the due-check was run in a copy with no `node_modules` and printed its skip line (2026-10-01). It still wakes hourly; only the install was removed. Not run in GitHub Actions itself.
- Analytics and Speed Insights are now opt-in (see section 2); no vendor call happens before Accept.
- Sentry `tracesSampleRate` is 1.0 in development and 0.1 otherwise [VERIFIED: `sentry.server.config.ts`]. Upload of source maps is gated on `SENTRY_UPLOAD_SOURCE_MAPS=true` plus a token [VERIFIED: `next.config.ts`]. This build tried an upload and the project was not found.

Placeholder legal mailboxes mean a privacy or DMCA request sent from the site goes nowhere [INFERRED: `.example` addresses in the page source].

---

## 6. Quality gates (tests, lint, build, typecheck: what exists, what actually passes)

Last verified: 2026-10-01 (current numbers: section 2, 2026-10-08)

| Gate | Exists | This run (2026-10-01, Node v22.18.0, npm 10.9.3, `node_modules` already present) |
|---|---|---|
| `npm test` | Yes. Vitest, node environment, 30s timeout, `tests/**/*.test.ts` | Pass. 178/178 |
| `npm run lint` | Yes. ESLint 9, `eslint-config-next` 16.2.7. Ignores `.claude`, `.superpowers`, `mobile`, `old-versions-valuable-files` | Pass with 11 warnings, 0 errors. Warnings are unused vars in `assets/scripts/generate-historical-assets.mjs`, `assets/scripts/generate-pwa-icons.mjs`, `components/standings/StandingsLeaderCard.tsx`, and intentionally unused parameters in `lib/assets/f1-icons.ts` |
| `npx tsc --noEmit` | No npm script. `tsconfig.json` has `strict` and `noEmit` | Pass. Exit 0 |
| `npm run build` | Yes. `next build`. `build:vercel` is the same command | Pass. Exit 0. Sentry upload skipped (`Project not found`). `metadataBase` warned as `http://localhost:3000` during this local build. Route table included static legal pages, ISR anthology/circuits/news/teams/glossary, and dynamic home, season, entity, and API routes |
| Playwright | Dependency only | Not run. No config |
| CI on pull request | Yes, `.github/workflows/ci.yml` (2026-10-01) | Not yet run on GitHub [UNVERIFIED]. Whether branch protection requires it is an owner/GitHub setting |
| `npm ci` from a clean tree | Not run | [UNVERIFIED] whether a clean install matches the lockfile on Node 24, which is what `engines` asks for |

The build’s own TypeScript step also finished (“Finished TypeScript in 2.2min”) [VERIFIED: build log].

Mobile (`cd mobile && npm start`) was not run. `mobile/` is outside git and outside the ESLint and `tsconfig` include/exclude rules (`tsconfig` excludes `mobile`) [VERIFIED].

---

## 7. Conventions and working systems (patterns, rules and processes that are well established in this project and could be reused in other projects)

Last verified: 2026-10-01

These are patterns the code and the tests actually share. They are reusable. The agent-constitution files that contradict them are listed in section 9 and are not part of this set.

1. **One temporal module.** `lib/f1Calendar.ts` is the leaf for “what season is it” and “is this session live”. Callers import it. Tests cover it (`tests/f1Calendar.test.ts`).
2. **Read path is database, then static, then live, with an explicit invalid-content check.** Historical seasons do not call the live API. `tests/f1-read-fallback.test.ts` locks the order.
3. **Write path for F1 snapshots is one function.** Lessons and `lib/f1Ingest.ts` describe update-first when `round` is null, because Postgres unique constraints do not collapse NULL. The partial unique index migration is the matching schema fix.
4. **Migrations are timestamped SQL files only.** The lessons file records that an untimestamped file was skipped by the Supabase CLI. The eight files on disk follow `YYYYMMDDHHMMSS_name.sql`.
5. **RLS is not enough.** The initial migration also `GRANT`s. Later private tables `REVOKE ALL` from `anon` instead of relying on missing policies.
6. **Cron auth is shared, timing-safe, and fail-closed.** One helper, covered by `tests/cronAuth.test.ts` and `tests/api-cron-guard.test.ts`.
7. **Public proxies take a whitelist, not a URL.** `f1-season` is the pattern. `tests/api-f1-season.test.ts` (32 tests) and `tests/api-validation.test.ts` cover it.
8. **Rate limits degrade instead of taking the site down.** Upstash when configured, in-memory otherwise. `tests/rateLimit.test.ts` covers the memory window.
9. **Expensive upstream calls are cached and aborted.** Live timing: edge `s-maxage`, stampede guard, hard timeout. News image checks: bounded concurrency. Cron: `maxDuration` plus a trigger interval.
10. **SEO helpers are centralized.** `lib/seo.ts` builds canonicals and hreflang (`en` unprefixed, `tr` under `/tr`). `tests/localized-seo.test.ts` covers them. `sitemap.ts` and `robots.ts` are the crawl source.
11. **Preview deploys send `noindex`.** Both `next.config.ts` and `proxy.ts`.
12. **Photo-free grid until `sync-media` has filled `media_assets` (the table exists live and the code and workflow are deployed since 2026-10-06; the UI shows parametric SVG placeholders until the first `sync-media` run fills the table).** Driver, team, and car image helpers return null. `ApexFallback` draws initials from live data. `tests/f1-icons.test.ts` and `tests/driver-hero.test.ts` match that policy. Official logos are forbidden in `AGENTS.md`. A license-checked image pipeline (Wikimedia Commons → Supabase Storage → `media_assets`) exists on the backend and the UI reads it through `lib/media/read.ts` + `components/media/MediaAssetView.tsx`; attribution page `/media-sources`. See `docs/reference/media-sistemi.md` (2026-10-06). The migration is **not yet applied** to the live database, so every surface currently shows its placeholder.
13. **News is original text plus source links, not copied articles.** `lib/news/rewrite.ts` rejects an overlap of 7 or more consecutive words with the source. `tests/news-stories.test.ts` exists. Pages are not supposed to call the model.
14. **Logs are dated files.** `logs/YYYY-MM-DD.md`. A commit on 2026-10-01 deleted logs older than 15 days and said they remain in git history (`c23acc2`).
15. **Small unit tests around pure logic, not a browser, are the default gate.** Vitest config says so in a comment.

Agent rules that are written down but fight each other (auto-commit in `.cursor/rules/CURSOR.mdc` versus “do not commit unless asked” in `AGENTS.md`) are not a stable convention. See section 13.

---

## 8. History and recurring problems (from logs and git history: past bugs, repeated mistakes, what fixed them)

Last verified: 2026-10-06

247 commits on `main` [VERIFIED: `git rev-list --count HEAD`]. Logs on disk are only `logs/2026-09-21.md`, `2026-09-28.md`, `2026-09-29.md`, and `2026-10-01.md`, because older logs were deleted from the working tree on 2026-10-01 [VERIFIED: `logs/` search and commit `c23acc2`]. Older incidents below are from `docs/reference/muhendislik-dersleri.md` (dated 2026-06-10 in its header) and from commit subjects. Where the lessons file disagrees with later code, the later code wins. The lessons file is a history source, not a current map.

### Repeated themes

| Theme | What went wrong | What fixed it | Evidence |
|---|---|---|---|
| Production hostname drift | Docs and code have used `five`, then `seven`, then `eight`. Commit `6ab76cb` (2026-07-05) is `fix: kritik — hardcoded prod URL güncellendi (five → seven)`. `siteUrl.ts` still says seven. Live site is eight. Seven returns 404 | Update every hardcoded host in the same change as the Vercel project move. Prefer env over a constant | [VERIFIED: grep of the three hostnames, commit subject, live HTTP] |
| Docs frozen at the 2026-06-21 UI wipe | README, `proje-dizini.md`, `technical.md`, and all three constitution files said `components/` was deleted and pages are placeholders | The UI was rebuilt. The sentence was copied and not removed | [VERIFIED: those files versus 89 component files] |
| Stale or empty DB snapshots served as fresh | `fetched_at` was new but names were blank, so the UI showed dashes. Home and season also showed different points because revalidate differed | `isSeasonSnapshotContentInvalid()`, historical seasons stay on the DB, current season can fall through to Jolpica, season page is dynamic | [VERIFIED: lessons file; 2026-10-05 check confirmed 2026 calendar (23 races, R1 Australian GP) and standings (23 drivers, 11 teams) return HTTP 200 with X-Data-Source: snapshot and non-empty content] |
| NULL in unique keys | `UNIQUE (season, round, type)` treated each `round IS NULL` as distinct, so season rows duplicated | Partial unique index plus update-first ingest | [VERIFIED: lessons file and `20260606000001_partial_unique_index.sql`] |
| RLS without GRANT | Policies existed and anon still got Postgres `42501` | Explicit `GRANT SELECT` | [VERIFIED: lessons file and the grants in the initial migration] |
| Untimestamped migration skipped | Supabase CLI ignored a file whose name was not a timestamp | `20260603000001_...` pattern | [VERIFIED: lessons file; current filenames match] |
| Cron auth and schedule | Hobby plan cannot run sub-daily Vercel crons. A GitHub schedule without the repo secret failed every hour. Missing Vercel secret made the platform cron return 401 | Daily `vercel.json` plus GitHub Actions for hourly and 10-minute work. Bearer check. Schedule was re-enabled 2026-09-28 after the secret and `SITE_URL` var were set | [VERIFIED: lessons file, workflow comments, `logs/2026-09-28.md`; on 2026-10-05 gh run list confirmed all three workflows green and all four cron routes returned 401 without bearer] |
| Unlicensed images shipped | Real driver photos, team logos, car renders, and circuit photos were in production with no license record | Removed 2026-09-28 (`398739f`). Helpers return null. Fallback badges | [VERIFIED: `logs/2026-09-28.md`, `public/drivers` absent]. Anthology `public/stories` (124 files) was not in that removal list [VERIFIED: master plan removal list versus file count] |
| OpenF1 fan-out | `Cache-Control: no-store` on live timing meant one upstream call per viewer, against a shared 3 req/s cap | `s-maxage=5`, stampede guard, 8s timeout | [VERIFIED: `logs/2026-09-28.md` and `app/api/live-timing/route.ts`] |
| Encoding and layout | Mojibake (`Â·`, `â€”`) and a tablet season page blown out to ~4000px by flex `min-width: auto` | Character cleanup and `min-w-0` / `max-w-full` on the season strips (`a55e196`) | [VERIFIED: `logs/2026-09-29.md`] |
| News detail 404 | Database id and live aggregate id differed | Commit `9a148c9` (2026-07-13). Later, pages moved to `news_stories` ids | [VERIFIED: commit subject; current read path in technical.md] |
| Accidental commit of a half-finished route move | A pathspec-less commit included another agent’s incomplete `[locale]` move and would have broken the build | `git reset --soft` before push, then two separate commits. The log says they were not pushed until the owner agreed | [VERIFIED: `logs/2026-09-28.md`] |
| Parallel `next build` | Second build hit “Another next build process is already running” | Do not run two builds. Clear `.next` only when the lock is stale | [VERIFIED: lessons file. Not reproduced in this pass; one build was run] |
| Asset path and diacritics | Hardcoded `/drivers/{slug}.svg` 404’d after a season-folder move. Accented Ergast ids missed files | Season-aware resolver and alias tests. Later made moot for photos by the null-icon policy | [VERIFIED: lessons file and `tests/f1-icons.test.ts` still passing] |
| F1DB field name | Mapper read `driverResults`; the file uses `raceResults`, so results were empty | Mapper rewrite and a re-seed | [VERIFIED: lessons file. The 2026-09-28 log says a 1950–2017 backfill then showed 77/77 seasons. Not re-counted in this pass] |
| F1DB race and circuit names | Same class of bug again: the mapper read `race.name` and `race.circuit.*`, which do not exist (F1DB `races[]` carries only `grandPrixId` / `circuitId`), so every historical calendar row has blank `raceName`, `circuitName`, locality and country. Live: 22/22, 24/24, 24/24 blank for 2022/2024/2025, 0 blank for 2026. Historical round pages render an empty `<h1>` and a ` 2025 \| Apex` title | Adapter now resolves names through `grandsPrix` / `circuits` / `countries` (2026-10-06). Owner approved the re-seed; `seed-f1-history.ts --from 1950 --to 2025` ran against the live DB (2550 upserts, 0 errors; 2026 deliberately excluded so Jolpica rows are not overwritten by F1DB). After it: 0 blank names for 1950/1976/1988/2003/2009/2022/2024/2025, `/season/2025/round/3` title `Japanese Grand Prix 2025 \| Apex` and a filled `SportsEvent` | [VERIFIED: live `/api/season/{year}?cb=…` (the plain URL is CDN-cached for a few minutes), page `<title>`/`<h1>`/JSON-LD, 1149 F1DB races 1950–2025 with 0 blank name fields offline, `tests/f1db-adapter.test.ts`] |

The 2026-10-01 log says production `sync-f1` and `sync-news` were checked after the hostname move (92 stories, 42 original rewrites) and that GitHub’s secret/variable and Vercel `NEXT_PUBLIC_SITE_URL` were still to do [VERIFIED: log]. This analysis did not call the cron with a secret.

---

## 9. Documentation inventory (every doc, rule file, log: purpose, up to date or stale, duplicate or conflicting, applied plans that should be deleted)

Last verified: 2026-10-05

“Up to date” means it matches the code and the live host on 2026-10-01. “Stale” means a claim in it is false now.

### Root and agent rules

| File | Purpose | Status |
|---|---|---|
| `README.md` | Setup, routes, env table, stack, live URL | Current (2026-10-06) |
| `AGENTS.md` | Single canonical English rule file (canonical authority) | Current (2026-10-06) |
| `.cursor/rules/CURSOR.mdc` | Pointer to `AGENTS.md` | Current (2026-10-01) |
| `.claude/CLAUDE.md` | Pointer to `AGENTS.md` | Current (2026-10-01) |
| `.agents/rules/apex-anayasa.md` | Pointer to `AGENTS.md` | Current (2026-10-01) |

> **Root Document Rule (2026-10-06):** No documentation files are allowed in the project root directory except `README.md` and `AGENTS.md`. `PRODUCT.md` was moved to `docs/PRODUCT.md`, `ROADMAP.md` was merged into `docs/plans/master-plan.md` and retired, and `PROJECT_TREE.md` was deleted.

### Logs

| File | Purpose | Status |
|---|---|---|
| `logs/2026-10-01.md` | News rewrite verification, news UI, hostname move to eight | Newest session log. Pending env items may already be partly overtaken by the live canonical. Keep |
| `logs/2026-09-29.md` | Tablet/mojibake/anthology contrast, Railway removal, pit stops, weather, translation | Historical. Railway removal matches the tree. `SITE_URL` in that log still mentioned the five host |
| `logs/2026-09-28.md` | i18n plan, full history seed, live timing, photo removal, scale fixes, accidental commit | Historical and still the best account of those decisions |
| `logs/2026-09-21.md` | Home and glossary visual redesign | Historical. Some component paths it names (`app/tech-glossary/page.tsx`) moved under `app/[locale]/` |

Logs older than 15 days were removed from the tree on purpose (`c23acc2`). They are only in git history.

### docs/plans

| File | Purpose | Status |
|---|---|---|
| `docs/plans/master-plan.md` | The single live checklist | Header date and stale rows fixed 2026-10-01; WEB-UI.4-8 and QA boxes stay open (not measured) |

### docs/reference and docs/vision

| File | Purpose | Status |
|---|---|---|
| `docs/vision/apex-vision.md` | Master vision & mission compass (the foundational purpose of Apex) | Authoritative (2026-10-06) |
| `docs/vision/technical.md` | Agent technical summary | Current |
| `docs/vision/skills.md` | Skill trigger list referenced by the constitutions | Reference |
| `docs/reference/apex-reference.md` | Master living reference and measurement baseline | Current (2026-10-06) |
| `docs/reference/mimari.md` | Backend architecture and clockwork data flow | Current (2026-10-06) |
| `docs/reference/media-sistemi.md` | Media (image) system: sources, license gate, DB model, API contract, frontend rules, placeholder brief, operations | Current (2026-10-06). Migration applied and code deployed 2026-10-06; `media_assets` is empty until the first `sync-media` run |
| `docs/reference/yaris-hafta-sonu-dogrulama.md` | Race-weekend live verification runbook (live timing, sync/settled/SWR, push window, JSON-LD, CWV, Sentry), 2026 calendar, pass criteria | Current (2026-10-06). Delete when every item is closed |
| `docs/reference/muhendislik-dersleri.md` | Incident list, traps, and “do not break” rules (renamed from `PROJECT_LESSONS_AND_ROADMAP.md`) | Historical engineering memory |
| `docs/reference/hikaye-gorselleri-kaynak-listesi.md` | Owner worklist: which story image still has no verified source (generated by `npm run stories:credits -- --write` from `data/stories/image-credits.ts`) | Current (2026-10-07). Delete when no image is `unverified` |
| `docs/reference/anthology-image-map.md` | Canonical mapping of 17 stories to 57 image assets | Current (moved from `docs/` root) |
| `docs/reference/glossary-icon-prompts.md` | Generative prompts for glossary CAD / blueprint line-art icons | Current (moved from `docs/` root) |

### Other project docs

| File | Purpose | Status |
|---|---|---|
| `docs/README.md` | Master documentation map and navigation index | Current (2026-10-06) |
| `docs/PRODUCT.md` | Official product showcase and overview document (moved from root to `docs/PRODUCT.md`) | Current (2026-10-06) |
| `docs/DENETIM.md` | Mission and gaps brownfield audit report (moved from root to `docs/DENETIM.md`) | Active audit reference (2026-10-05) |
| `docs/procedures.md` | Repeatable operational and maintenance procedures (Procedures 1–8) | Current (Procedure 8 added 2026-10-06) |
| `docs/F1_Anlati_Stil_Kilavuzu.md` | House voice for anthology prose, derived from named YouTube channels, with an anti-plagiarism section | Editorial standard. Base reference. v2 layer in `docs/F1_Anlati_Stil_Kilavuzu_v2.md` |
| `docs/F1_Anlati_Stil_Kilavuzu_v2.md` | Acoustic signal analysis, page prosody, bilingual TR/EN cadence, and multiformat narrative matrix | Editorial standard v2 (2026-10-05) |

### docs/design

Last verified: 2026-10-06

Design authority is `docs/design/apex-design.md` (master design system architecture, synthesizing Apple design principles with Formula 1 identity) and `docs/design/apex-design-language.md` [VERIFIED: `AGENTS.md`, master plan]. Token definitions live in `docs/design/tokens.json` [VERIFIED].

On 2026-10-05, conflicting design essays (`design-styles/`, `colours/`, `typography/`, `trends/`, `design-techniques/`, `design.md/`) and unapproved skill directories were consolidated and removed. The single approved skill directory is `docs/design/skills/` containing the 5-layer orchestrated skills: `apple-design` (foundational), `high-end-visual-design` + `minimalist-ui` (execution), `industrial-brutalist-ui` (filtered telemetry), `react-view-transitions` (motion), and `ui-ux-pro-max` + `accesslint-audit` (quality audit).

Other general reference essays in `docs/design/` (`premium-design-philosophy.md`, `universal-design-principles.md`, `ux-laws-reference.md`, `tasarim-skilleri-rehberi.md`) remain background reading, secondary to `apex-design.md`.

### Applied plans and retired docs

- Deleted on 2026-10-01: `docs/PLAN.md`, `docs/plans/i18n-architecture.md`, `docs/plans/news-ui-brief.md`, `docs/plans/news-stories-ui-handoff.md`, `docs/plans/driver-hero-visual-redesign.md`, `docs/reference/proje-dizini.md`.
- Deleted on 2026-10-06 (Docs refinement procedure): `docs/reference/anthology-gorsel-temin.md`, `docs/reference/web-iyilestirme-onerileri-2026-07-05.md`, `docs/anthology-ingestion-report.md`, `docs/anthology-missing-assets-download-list.md`, `docs/anthology-image-remap-audit.md`, `docs/superpowers/`, and `old-versions-valuable-files/`.
- Retired on 2026-10-06: `ROADMAP.md` (root roadmap retired after transferring open items into `docs/plans/master-plan.md` Priority 8).
- Root document constraint: Only `README.md` and `AGENTS.md` are permitted in the project root directory. All documentation belongs under `docs/`.
- `docs/plans/master-plan.md` is the single live checklist and primary developer directive; integrated all tasks and vision points from `docs/plans/acil-eylem-plani.md` on 2026-10-06 and retired the separate file. Organized into prioritized phases with verified test and build baselines.

---

## 10. Gaps (difference between stated intent and reality, ordered by severity)

Last verified: 2026-10-05

1. **Legal mailboxes are placeholders.** `privacy@`, `dmca@`, `contact@apexstats.example` go nowhere. The consent gate now makes the privacy page true; the addresses are an owner decision. `ROADMAP.md` phase 1 and `AGENTS.md` still require a real contact before production is acceptable.
2. **Production hostname drift.** Fixed in code 2026-10-01 (one `PROD_SITE_URL`, eight host). Still open: `NEXT_PUBLIC_SITE_URL` is absent from `.env.local`, so a local production build warns `metadataBase` is localhost; the Vercel and GitHub `SITE_URL` values are owner-side (section 13).
3. **Anthology serves 56 files under `public/stories` and none has a verified source yet.** Owner rules of 2026-10-07: real photographs only (never AI-generated, never SVG), editorial non-commercial use stated on the page, original-source links where known, unknown sources listed for the owner (`data/stories/image-credits.ts`, `docs/reference/hikaye-gorselleri-kaynak-listesi.md`, `tests/story-images.test.ts`; UI is Antigravity task AG-1). The old ledger `docs/reference/stories-assets-ledger.md` was retired (its per-file facts moved into the credit records). Before 2026-10-02 there were 124 files; 0 had an author, source or license recorded, and 68 were referenced by nothing. The owner kept the folder and had the 68 unreferenced files deleted; the 56 remaining files are all referenced by `data/stories/content.ts` (checked: every path exists on disk), and every story's hero image is among them. `AGENTS.md` says an asset with an unclear license does not ship, so this stays open until the owner decides on rights (license, replace, or remove).
5. **PR gate exists but is unproven and not enforced by the repo.** `ci.yml` was added 2026-10-01; making it a required check is a GitHub setting (owner).
6. **Rate limiting and cron locking are only as strong as Upstash in production, which is unconfirmed for the current Vercel project.** The code degrades to per-instance memory. The news and F1 crons are also scheduled twice (Vercel daily and GitHub hourly).
7. **Sentry is wired and the upload failed** with `Project not found` for the org and project hardcoded in `next.config.ts`. Error monitoring may be dark. [UNVERIFIED: live Sentry ingest.]
8. **Node 24 is declared and Node 22 is what actually runs** locally and in the F1 sync workflow. The build passed on 22. An engine-strict environment could diverge. [UNVERIFIED: Node 24 was not installed here.]
9. **Mobile is documented as a shipping Expo app and is absent from git.** Store release items in the master plan cannot be done from `main`.
10. **Lighthouse and live QA backlog.** Frontend audit on 2026-10-05 measured and closed WEB-UI.4 (tablet breakpoint), WEB-UI.5 (season layout), WEB-UI.6 (list templates), and WEB-UI.7 (detail templates) across 375/768/1280px in Chromium with 0 overflow and 0 raw i18n keys [VERIFIED]. Live-race end-to-end and Lighthouse scores (WEB-UI.8) remain open.

---

## 11. Proposed roadmap (not implemented, ordered, each item with a done-criterion)

Last verified: 2026-10-02

These items are not done. Order follows section 10.

2. **Real legal mailboxes.** Replace `privacy@`, `dmca@`, `contact@apexstats.example` with addresses the owner monitors.
   Done when: each legal page's mailto is an address the owner has confirmed; a test message is received.
3. **License ledger for `public/stories`.** For each file: source, license, author, date, or remove it. Same standard already used for the grid.
   Done when: every file under `public/stories` is either listed with a license that allows this use, or deleted, and the site still builds.
5. **Prove CI.** Open a pull request and see `ci.yml` green on Node 24; then make it a required check (owner).
   Done when: the workflow is green on a real pull request and a failing `npm test` blocks merge.
6. **Confirm production Upstash, cron secrets, Groq, Gemini, and Sentry on the eight project.** Fix the Sentry org/project or stop uploading. Add the missing names to `.env.example` with empty values.
   Done when: the owner confirms those names exist in the Vercel project (values stay secret); a source-map upload either succeeds or is explicitly disabled; `.env.example` lists every name the server reads.
8. **Align Node.** Either run CI and local engines on 22, or install 24 and re-run the four gates.
   Done when: `.nvmrc`, `engines`, and the workflows name the same major version, and the four gates pass on that version.
9. **Decide the Expo app.** Track `mobile/` in git, or delete the “shipping app” claims from the master plan and technical.md.
   Done when: either `git ls-files mobile` is non-empty and the app typechecks, or the docs no longer tell agents to run `cd mobile`.
10. **Measure the open product checks once.** Lighthouse on home and news, one keyboard pass, one `/tr` pass, and a note of whether WEB-UI.4–8 checkboxes are already done.
    Done when: numbers for LCP, INP, CLS, and accessibility are written down from a real run, and the master-plan boxes match that run.

---

## 12. Agent rules

Last verified: 2026-10-01

Installed. The single canonical rule file is `/AGENTS.md` (permission model, forbidden actions, verification, migration safety, git hygiene, docs self-maintenance, logs, procedure triggers). `.claude/CLAUDE.md`, `.cursor/rules/CURSOR.mdc` and `.agents/rules/apex-anayasa.md` are one-line pointers to it. Procedures live in `docs/procedures.md`.

---

## 13. Open questions for owner

Last verified: 2026-10-02

1. ~~Which rule file wins?~~ Resolved 2026-10-01: `AGENTS.md`.
2. Is the current Vercel project still on the Hobby plan? The daily cron design assumes yes. That was not visible from the repo.
3. After the move to `project-anthology-eight`, are `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` or `CRON_SECRET_KEY`, Upstash, Groq, Gemini, and Sentry set on that Vercel project? The 2026-10-01 log said the site URL and the GitHub secret/variable were still pending. The public canonical is already eight. The dashboard was not opened.
4. What is the GitHub Actions `SITE_URL` variable today? If it is still five or seven, hourly sync and push notifications are calling a dead host.
5. `public/stories` stays (owner, 2026-10-02) and the 68 unreferenced files were deleted. Still open: whether the remaining 56 files may be used (no license record); to be discussed.
6. Are `privacy@apexstats.example`, `dmca@apexstats.example`, and `contact@apexstats.example` intentional placeholders? If a real address exists, it is not in the legal pages. Was the privacy text reviewed by anyone who can approve a KVKK notice? The repo does not say.
7. Is the Expo app in `mobile/` still a product? It is on disk and gitignored, so `main` does not contain it.
8. `agent/pilot-setup` has 255 commits that `main` lacks (oldest docs/CI/origin work from the pilot setup). Merge it, or delete it?
9. ~~Analytics for every visitor?~~ Resolved 2026-10-02: opt-in (owner decision), implemented.
10. Sentry org `anthology-z0` and project `project-anthology` were not found during this build. Is that the project to keep, or should source-map upload stay off?
11. The master plan’s unchecked UI and Lighthouse items were not re-measured in a browser in this pass. Which of WEB-UI.4, WEB-UI.5, WEB-UI.7, and WEB-UI.8 are still wanted?
12. Who is allowed to apply SQL to the production Supabase project? The logs say the owner applied the September 29 migrations by hand after `db push` timed out. This pass did not compare remote migration history to the eight files.

---

## 14. Re-verification log

Last verified: 2026-10-01

Re-checked by the pilot-setup agent on 2026-10-01 (commands run, not copied): `components/` = 89 ts/tsx files; `app/[locale]` = 20 `page.tsx`; `app/api` = 13 `route.ts`; 8 migrations; 22 test files; `public/stories` = 124 tracked files; `mobile/` gitignored, 0 tracked; `getSiteUrl()` fallback = seven host; live `/` on eight = 200 with eight canonical, seven = 404, unauthenticated `sync-news` = 401; all four cron routes contain `isCronAuthorized`; env names read in code match the list in section 5; workflows use Node 22 while `engines`/`.nvmrc` say 24; legal pages use `.example` mailboxes; layout mounts Analytics and Speed Insights. No `[VERIFIED]` claim was found false. One addition: `docs/design/README.md` cites a non-existent `apex-final-design.md` (fixed in the docs cleanup).
