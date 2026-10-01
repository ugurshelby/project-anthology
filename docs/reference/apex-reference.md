# Project Anthology (Apex) — reference

Living document. Authority order: code > `AGENTS.md` > this file > everything else. Each section carries a `Last verified` date; a procedure that touches a section updates that date. First written 2026-10-01 from a read-only analysis; the claims were re-checked on 2026-10-01 before this file became canonical (see section 14).

Package name: `project-anthology` [VERIFIED: `package.json`]. Product name used in the UI and docs: Apex [VERIFIED: `README.md`, `PRODUCT.md`, `messages/en.json`]. This file does not replace `docs/plans/master-plan.md` (the live checklist).

Evidence tags: **[VERIFIED]** means the command was run or the file was read. **[INFERRED]** means a conclusion from that evidence. **[UNVERIFIED]** means it could not be checked, with the reason.

---

## 1. Purpose and intended users (only what the repo states)

Last verified: 2026-10-01

Apex (Project Anthology) is an unofficial Formula 1 archive and live-data site. The README states that the season calendar, standings, driver and team profiles, circuits, news, and historical stories share one interface [VERIFIED: `README.md`].

`PRODUCT.md` states the users as Formula 1 followers who want to study season results and driver or team performance in depth on desktop, or check them quickly on mobile [VERIFIED: `PRODUCT.md`]. The same file states the purpose as an unofficial, copyright-safe, fast Formula 1 statistics and telemetry archive, with a calm, technical, authoritative brand, and WCAG 2.2 AA as the target [VERIFIED: `PRODUCT.md`].

`ROADMAP.md` states a further goal: move the product from a portfolio demo to something thousands of users can rely on, with traceable licenses, measurable SEO, and predictable performance [VERIFIED: `ROADMAP.md`]. That file does not record that this goal was accepted as a current release commitment beyond being written there.

The live URL named in the README, master plan, and agent rules is `https://project-anthology-eight.vercel.app` [VERIFIED: `README.md`, `docs/plans/master-plan.md`]. On 2026-10-01 that URL returned HTTP 200, title `Apex - F1 Archive`, canonical `https://project-anthology-eight.vercel.app` [VERIFIED: `Invoke-WebRequest` to `/`].

No file in the repo states a business owner, a company, or a revenue model. Those are not inferred here.

---

## 2. Current state summary (what works, what is broken, what is half-built; measured, not described)

Last verified: 2026-10-01

The web app is a working Next.js product, not a skeleton and not an idea with little code. `components/` contains 89 `.ts`/`.tsx` files and `app/[locale]/` contains 20 `page.tsx` files [VERIFIED: file search]. The June 2026 note that the frontend was deleted is false for the tree that exists today. See section 9.

### Measured as working on 2026-10-01

| Check | Result |
|---|---|
| Unit tests | `npm test` (Vitest 3.2.6): 22 files, 178/178 passed, 26.75s [VERIFIED] |
| Lint | `npm run lint`: exit 0, 0 errors, 11 warnings [VERIFIED] |
| Typecheck | `npx tsc --noEmit`: exit 0, no diagnostics [VERIFIED]. There is no `typecheck` script [VERIFIED: `package.json`] |
| Production build | `npm run build`: exit 0 in about 713s. Next.js 16.2.7 compiled, TypeScript finished, 34/34 static pages generated [VERIFIED] |
| Live home | HTTP 200 [VERIFIED] |
| Live `sitemap.xml` | HTTP 200; first URL is the eight host, with `en` / `tr` / `x-default` alternates [VERIFIED] |
| Live `robots.txt` | HTTP 200; allows `/` and the legal paths; disallows `/api/` and `/api/cron/` [VERIFIED] |
| Live cron without a token | `GET /api/cron/sync-news` returned HTTP 401 [VERIFIED] |
| Database reachability from this machine | The build logged successful Supabase reads of `news_stories`, `stories`, `radio_moments`, and `f1_snapshots` for season 2026, including round 15 results and qualifying [VERIFIED: build log] |
| Git | Branch `main` tracked `origin/main` at `c23acc2`. `git status` was clean before this file. 247 commits. A second branch `feat/apex-frontend-rebuild` exists at `330db35` [VERIFIED: `git status`, `git rev-list`, `git branch -vv`] |

### Broken or wrong relative to the code and the live host

- `lib/data/siteUrl.ts` still falls back to `https://project-anthology-seven.vercel.app` [VERIFIED: file]. That host returned HTTP 404 [VERIFIED: `Invoke-WebRequest`]. On Vercel the function prefers `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL`, and only then this constant [VERIFIED: `lib/data/siteUrl.ts`]. The live canonical is the eight host, so production is not currently serving the seven URL [VERIFIED: homepage HTML]. The constant is still a dead fallback.
- Local `npm run build` warned that `metadataBase` resolved to `http://localhost:3000` [VERIFIED: build log]. `.env.local` does not define `NEXT_PUBLIC_SITE_URL` [VERIFIED: key-name parse of `.env.local`]. A local production build therefore does not match the live canonical host.
- Sentry source-map upload during this build was skipped. The CLI reported `Project not found` for org `anthology-z0`, project `project-anthology` [VERIFIED: `next.config.ts` and the build log]. Whether production Sentry receives events was not checked.
- Legal pages link to placeholder mailboxes `privacy@apexstats.example`, `dmca@apexstats.example`, and `contact@apexstats.example` [VERIFIED: `app/[locale]/(legal)/*/page.tsx`].
- The privacy page says optional analytics stay off until consent [VERIFIED: `app/[locale]/(legal)/privacy/page.tsx`]. `app/[locale]/layout.tsx` always mounts `@vercel/analytics` and `@vercel/speed-insights` [VERIFIED]. A search of `*.ts`/`*.tsx` found no consent or cookie-banner component [VERIFIED: search].

### Half-built, or stated as open while the code has moved on

- `docs/plans/master-plan.md` still has unchecked items: tablet breakpoint (WEB-UI.4), season layout (WEB-UI.5), list template (WEB-UI.6), detail template (WEB-UI.7), Lighthouse (WEB-UI.8), permanent 2026 Jolpica snapshot fill, live-race end-to-end check, i18n phase-6 QA, and mobile store release [VERIFIED: file]. The same file, and the 2026-09-29 log, also say several of those UI pages were already built [VERIFIED: `logs/2026-09-29.md`]. The checkboxes and the code disagree. This analysis did not re-test every breakpoint in a browser.
- Playwright is a devDependency and is named in docs. There is no `playwright.config` and no Playwright npm script [VERIFIED: `package.json`, file search]. It was not run.
- `mobile/` exists on disk (Expo ~56, React Native 0.85.3) and is gitignored. `git ls-files mobile` returned 0 tracked files [VERIFIED]. It is not part of the git tree that `main` deploys. Mobile scripts were not run.
- There is no GitHub Actions workflow for lint, test, or build. The three workflows only call cron endpoints [VERIFIED: `.github/workflows/`].
- Node: this machine is v22.18.0. `package.json` `engines` and `.nvmrc` say 24. GitHub Actions `sync-f1-race-aware.yml` uses Node 22 [VERIFIED]. Tests and the build passed on Node 22 anyway.

`project-anthology-seven.vercel.app` is down (404). Older docs still name `project-anthology-five.vercel.app` [VERIFIED: `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md`]. The log of 2026-09-29 says the five project was deleted by the owner [VERIFIED: `logs/2026-09-29.md`]. The five host was not requested in this pass.

---

## 3. Architecture (stack, structure, data flow, directory map)

Last verified: 2026-10-01

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
- Historical seasons are read from the database. The current season can fall through to Jolpica when the snapshot is stale or content-invalid [VERIFIED: `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` describes this; `tests/f1-read-fallback.test.ts` passed, which covers that read order].
- News pages read `news_stories`, not the visitor’s browser calling RSS [VERIFIED: `docs/plans/news-stories-ui-handoff.md` and `docs/vision/technical.md` “Haber hikâyeleri” section; home page imports `getLatestNews`].

### Directory map

Paths below were confirmed by file search or `Test-Path` on 2026-10-01.

| Path | Role |
|---|---|
| `app/[locale]/` | Pages: home, season, season year, round, drivers, teams, grid, circuits, news, news id, anthology, glossary, disclaimer, privacy, terms, dmca |
| `app/api/` | 13 route handlers: four crons, `f1-season`, `live-timing`, `news`, `push/register`, season, circuit, driver career, team career |
| `app/sitemap.ts`, `app/robots.ts` | Crawl surface |
| `components/` | UI. 89 modules: layout, home, season, news, profile, anthology, glossary, legal, media |
| `lib/` | `data/`, `f1/`, `news/`, `api/`, `security/csp.ts`, `seo.ts`, `cronAuth.ts`, `rateLimit.ts`, `supabase.ts`, `f1Calendar.ts`, `f1Ingest.ts` |
| `data/` | Editorial content: drivers, teams, stories, glossary, circuit facts |
| `config/team-colors.ts` | Team color tokens |
| `i18n/`, `messages/en.json`, `messages/tr.json` | Locale routing and UI strings |
| `supabase/migrations/` | 8 SQL migrations. `supabase/config.toml` exists |
| `scripts/` | `seed-f1-history.ts`, `seed-stories.ts`, `sync-f1-scheduled.ts`, `verify-seed-coverage.ts`, `dedupe-f1-snapshots.ts` |
| `tests/` | 22 Vitest files. `vitest.config.ts` includes only `tests/**/*.test.ts` |
| `public/stories/` | 124 files still present. `public/drivers` and `public/teams` are absent [VERIFIED: `Test-Path` and file count] |
| `stories-images/` | 59 files. Local export noted in `stories-images/README.md` |
| `.github/workflows/` | `sync-f1-race-aware.yml`, `sync-news.yml`, `notify-sessions.yml` |
| `mobile/` | Expo app on disk only. Gitignored. Not in git |
| `docs/`, `logs/`, `design/` | Documentation and a separate design folder |
| `railway/`, `pre-plans/` | Not on disk [VERIFIED: `Test-Path`]. Older docs still mention them |

`next.config.ts` sets security headers (CSP from `lib/security/csp.ts`, HSTS, frame, referrer, permissions), `poweredByHeader: false`, a permanent redirect from `/radio` to `/anthology`, empty `images.remotePatterns`, and preview-only `X-Robots-Tag: noindex` when `VERCEL_ENV=preview` [VERIFIED: file]. `proxy.ts` sets the same preview robots header on page requests.

---

## 4. Data and infrastructure (DB, schema, migrations, external APIs, cron jobs, deployment, branch and deploy triggers)

Last verified: 2026-10-01

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

`f1_snapshots` stores Ergast-shaped JSON. Season-level rows use `round IS NULL`. Allowed `source` values in the initial check are `f1db`, `jolpica`, `openf1` [VERIFIED: initial SQL].

Whether the remote migration history matches these eight files one-for-one was not checked. `npx supabase migration list` was not run [UNVERIFIED: no remote migration diff]. The build did read `news_stories` and `f1_snapshots`, so those objects exist in the database this environment uses [VERIFIED: build log].

### External APIs

| Source | Where it is used | Notes in code |
|---|---|---|
| Jolpica / Ergast | `lib/f1/sources/jolpica.ts`, `app/api/f1-season/route.ts`, `scripts/sync-f1-scheduled.ts` | Proxy path is a whitelist regex. Host is hardcoded. Snapshot is returned before a live call [VERIFIED: `app/api/f1-season/route.ts`] |
| F1DB | `lib/f1/sources/f1db.ts`, `npm run seed:f1db` | Historical seed. Not re-run in this analysis |
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
| `sync-f1-race-aware.yml` | hourly, plus `workflow_dispatch` | `npm ci`, then `scripts/sync-f1-scheduled.ts`, which calls `sync-f1?scope=live` only when a session window is due |
| `sync-news.yml` | minute 7 of every hour, plus dispatch | `curl` to `/api/cron/sync-news` with Bearer `CRON_SECRET_KEY`, 420s max |
| `notify-sessions.yml` | every 10 minutes, plus dispatch | `curl` to `/api/cron/notify-sessions` |

All four cron routes call `isCronAuthorized` [VERIFIED: grep of `app/api/**/route.ts`]. `maxDuration` is 300s for sync-f1, sync-news, and sync-radio, and 60s for notify-sessions [VERIFIED: those files].

The YAML comments say Vercel Hobby allows one cron run per day, which is why the finer jobs moved to GitHub Actions [VERIFIED: workflow comments]. The actual Vercel plan on the current account was not opened [UNVERIFIED: no Vercel dashboard access in this pass].

Daily Vercel runs and the hourly GitHub runs both hit `sync-news` and `sync-f1`. The news route comment says a 60-second minimum interval and idempotent rewrites [VERIFIED: `sync-news.yml` header]. They can still double the provider cost once a day.

### Deployment and branches

- Current shipping branch is `main`, even with `origin/main` [VERIFIED: `git status` at the start of this analysis].
- No workflow in `.github/workflows/` builds or deploys the site [VERIFIED].
- Docs say Vercel deploys the web app [VERIFIED: `README.md`]. The git event that triggers that deploy was not read from a Vercel project setting [UNVERIFIED].
- `feat/apex-frontend-rebuild` still exists locally and on the remote. `docs/PLAN.md` still names that branch as current. `HEAD` is `main` [VERIFIED]. That plan is stale.
- `railway/` was removed. The 2026-09-29 log says the Railway cron was never deployed and was replaced by GitHub Actions [VERIFIED: log plus `Test-Path railway` is false].

---

## 5. Security, secrets and cost exposure (env handling, .gitignore coverage, auth, abuse and quota risks)

Last verified: 2026-10-01

### Env handling

`.gitignore` ignores `.env*` and un-ignores `.env.example`. `git ls-files` shows only `.env.example` tracked. `git check-ignore` matches `.env.local`, `.env.local.append`, and `.env.sentry-build-plugin` [VERIFIED].

Names only. No values are recorded here.

`.env.example` keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `CRON_SECRET_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL`.

`.env.local` keys present: `CRON_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_OIDC_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`.

`.env.local.append` keys: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `CRON_SECRET_KEY`.

`.env.sentry-build-plugin` key: `SENTRY_AUTH_TOKEN`.

Next.js does not load `.env.local.append` by default [INFERRED: Next env file names; the append file is separate]. Sentry DSN names are not in `.env.local`.

Code reads these names that are missing from `.env.example` [VERIFIED: `lib/news/rewrite.ts`, `lib/cronAuth.ts`, `lib/rateLimit.ts`, `sentry.*.config.ts`, `instrumentation-client.ts`, `next.config.ts`, `scripts/sync-f1-scheduled.ts`]: `GROQ_API_KEY`, `GROQ_NEWS_MODELS`, `GEMINI_NEWS_MODELS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_UPLOAD_SOURCE_MAPS`, `SITE_URL`.

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
- `sync-f1-race-aware.yml` runs `npm ci` on every hourly tick, including hours when the script then skips [VERIFIED: YAML step order]. That spends GitHub Actions minutes even when no sync is due [INFERRED].
- Analytics and Speed Insights load for every page view with no consent gate [VERIFIED: layout]. That is a policy and privacy mismatch, and it is also a vendor call on every visit.
- Sentry `tracesSampleRate` is 1.0 in development and 0.1 otherwise [VERIFIED: `sentry.server.config.ts`]. Upload of source maps is gated on `SENTRY_UPLOAD_SOURCE_MAPS=true` plus a token [VERIFIED: `next.config.ts`]. This build tried an upload and the project was not found.

Placeholder legal mailboxes mean a privacy or DMCA request sent from the site goes nowhere [INFERRED: `.example` addresses in the page source].

---

## 6. Quality gates (tests, lint, build, typecheck: what exists, what actually passes)

Last verified: 2026-10-01

| Gate | Exists | This run (2026-10-01, Node v22.18.0, npm 10.9.3, `node_modules` already present) |
|---|---|---|
| `npm test` | Yes. Vitest, node environment, 30s timeout, `tests/**/*.test.ts` | Pass. 178/178 |
| `npm run lint` | Yes. ESLint 9, `eslint-config-next` 16.2.7. Ignores `.claude`, `.superpowers`, `mobile`, `old-versions-valuable-files` | Pass with 11 warnings, 0 errors. Warnings are unused vars in `assets/scripts/generate-historical-assets.mjs`, `assets/scripts/generate-pwa-icons.mjs`, `components/standings/StandingsLeaderCard.tsx`, and intentionally unused parameters in `lib/assets/f1-icons.ts` |
| `npx tsc --noEmit` | No npm script. `tsconfig.json` has `strict` and `noEmit` | Pass. Exit 0 |
| `npm run build` | Yes. `next build`. `build:vercel` is the same command | Pass. Exit 0. Sentry upload skipped (`Project not found`). `metadataBase` warned as `http://localhost:3000` during this local build. Route table included static legal pages, ISR anthology/circuits/news/teams/glossary, and dynamic home, season, entity, and API routes |
| Playwright | Dependency only | Not run. No config |
| CI on pull request | No | Nothing in `.github/workflows/` runs these gates |
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
12. **Photo-free grid.** Driver, team, and car image helpers return null. `ApexFallback` draws initials from live data. `tests/f1-icons.test.ts` and `tests/driver-hero.test.ts` match that policy. Official logos are forbidden in `AGENTS.md`.
13. **News is original text plus source links, not copied articles.** `lib/news/rewrite.ts` rejects an overlap of 7 or more consecutive words with the source. `tests/news-stories.test.ts` exists. Pages are not supposed to call the model.
14. **Logs are dated files.** `logs/YYYY-MM-DD.md`. A commit on 2026-10-01 deleted logs older than 15 days and said they remain in git history (`c23acc2`).
15. **Small unit tests around pure logic, not a browser, are the default gate.** Vitest config says so in a comment.

Agent rules that are written down but fight each other (auto-commit in `.cursor/rules/CURSOR.mdc` versus “do not commit unless asked” in `AGENTS.md`) are not a stable convention. See section 13.

---

## 8. History and recurring problems (from logs and git history: past bugs, repeated mistakes, what fixed them)

Last verified: 2026-10-01

247 commits on `main` [VERIFIED: `git rev-list --count HEAD`]. Logs on disk are only `logs/2026-09-21.md`, `2026-09-28.md`, `2026-09-29.md`, and `2026-10-01.md`, because older logs were deleted from the working tree on 2026-10-01 [VERIFIED: `logs/` search and commit `c23acc2`]. Older incidents below are from `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` (dated 2026-06-10 in its header) and from commit subjects. Where the lessons file disagrees with later code, the later code wins. The lessons file is a history source, not a current map.

### Repeated themes

| Theme | What went wrong | What fixed it | Evidence |
|---|---|---|---|
| Production hostname drift | Docs and code have used `five`, then `seven`, then `eight`. Commit `6ab76cb` (2026-07-05) is `fix: kritik — hardcoded prod URL güncellendi (five → seven)`. `siteUrl.ts` still says seven. Live site is eight. Seven returns 404 | Update every hardcoded host in the same change as the Vercel project move. Prefer env over a constant | [VERIFIED: grep of the three hostnames, commit subject, live HTTP] |
| Docs frozen at the 2026-06-21 UI wipe | README, `proje-dizini.md`, `technical.md`, and all three constitution files still say `components/` was deleted and pages are placeholders | The UI was rebuilt. The sentence was copied and not removed | [VERIFIED: those files versus 89 component files] |
| Stale or empty DB snapshots served as fresh | `fetched_at` was new but names were blank, so the UI showed dashes. Home and season also showed different points because revalidate differed | `isSeasonSnapshotContentInvalid()`, historical seasons stay on the DB, current season can fall through to Jolpica, season page is dynamic | [VERIFIED: lessons file; tests for the read fallback passed. Not re-proven against production data in this pass] |
| NULL in unique keys | `UNIQUE (season, round, type)` treated each `round IS NULL` as distinct, so season rows duplicated | Partial unique index plus update-first ingest | [VERIFIED: lessons file and `20260606000001_partial_unique_index.sql`] |
| RLS without GRANT | Policies existed and anon still got Postgres `42501` | Explicit `GRANT SELECT` | [VERIFIED: lessons file and the grants in the initial migration] |
| Untimestamped migration skipped | Supabase CLI ignored a file whose name was not a timestamp | `20260603000001_...` pattern | [VERIFIED: lessons file; current filenames match] |
| Cron auth and schedule | Hobby plan cannot run sub-daily Vercel crons. A GitHub schedule without the repo secret failed every hour. Missing Vercel secret made the platform cron return 401 | Daily `vercel.json` plus GitHub Actions for hourly and 10-minute work. Bearer check. Schedule was re-enabled 2026-09-28 after the secret and `SITE_URL` var were set | [VERIFIED: lessons file, workflow comments, `logs/2026-09-28.md`]. Whether those GitHub schedules are green after the move to the eight host is [UNVERIFIED: Actions runs were not listed] |
| Unlicensed images shipped | Real driver photos, team logos, car renders, and circuit photos were in production with no license record | Removed 2026-09-28 (`398739f`). Helpers return null. Fallback badges | [VERIFIED: `logs/2026-09-28.md`, `public/drivers` absent]. Anthology `public/stories` (124 files) was not in that removal list [VERIFIED: master plan removal list versus file count] |
| OpenF1 fan-out | `Cache-Control: no-store` on live timing meant one upstream call per viewer, against a shared 3 req/s cap | `s-maxage=5`, stampede guard, 8s timeout | [VERIFIED: `logs/2026-09-28.md` and `app/api/live-timing/route.ts`] |
| Encoding and layout | Mojibake (`Â·`, `â€”`) and a tablet season page blown out to ~4000px by flex `min-width: auto` | Character cleanup and `min-w-0` / `max-w-full` on the season strips (`a55e196`) | [VERIFIED: `logs/2026-09-29.md`] |
| News detail 404 | Database id and live aggregate id differed | Commit `9a148c9` (2026-07-13). Later, pages moved to `news_stories` ids | [VERIFIED: commit subject; current read path in technical.md] |
| Accidental commit of a half-finished route move | A pathspec-less commit included another agent’s incomplete `[locale]` move and would have broken the build | `git reset --soft` before push, then two separate commits. The log says they were not pushed until the owner agreed | [VERIFIED: `logs/2026-09-28.md`] |
| Parallel `next build` | Second build hit “Another next build process is already running” | Do not run two builds. Clear `.next` only when the lock is stale | [VERIFIED: lessons file. Not reproduced in this pass; one build was run] |
| Asset path and diacritics | Hardcoded `/drivers/{slug}.svg` 404’d after a season-folder move. Accented Ergast ids missed files | Season-aware resolver and alias tests. Later made moot for photos by the null-icon policy | [VERIFIED: lessons file and `tests/f1-icons.test.ts` still passing] |
| F1DB field name | Mapper read `driverResults`; the file uses `raceResults`, so results were empty | Mapper rewrite and a re-seed | [VERIFIED: lessons file. The 2026-09-28 log says a 1950–2017 backfill then showed 77/77 seasons. Not re-counted in this pass] |

The 2026-10-01 log says production `sync-f1` and `sync-news` were checked after the hostname move (92 stories, 42 original rewrites) and that GitHub’s secret/variable and Vercel `NEXT_PUBLIC_SITE_URL` were still to do [VERIFIED: log]. This analysis did not call the cron with a secret.

---

## 9. Documentation inventory (every doc, rule file, log: purpose, up to date or stale, duplicate or conflicting, applied plans that should be deleted)

Last verified: 2026-10-01

“Up to date” means it matches the code and the live host on 2026-10-01. “Stale” means a claim in it is false now.

### Root and agent rules

| File | Purpose | Status |
|---|---|---|
| `README.md` | Setup, routes, stack, live URL | Mixed. Live URL and stack match. The 2026-06-21 “frontend reset, pages are placeholders” note is false. Routes omit `/tr`, `/grid`, `/news/[id]`, and the legal pages. Env table omits Groq, Upstash, and Sentry |
| `PRODUCT.md` | Users, purpose, brand, accessibility target | Current as a product statement. Accessibility is a target, not a measured result |
| `ROADMAP.md` | Four production phases: legal, SEO, UI, release | Aspirational. Several phase-1 pages exist, but placeholder emails and the analytics consent gap mean phase 1 is not met. No phase is checked off |
| `AGENTS.md` | Single canonical English rule file (rewritten 2026-10-01) | Current |
| `PROJECT_TREE.md` | Generated tree, including `.next` and tool folders | Snapshot, not a source of truth. Do not treat it as the map |
| `.cursor/rules/CURSOR.mdc` | Pointer to `AGENTS.md` | Current (2026-10-01) |
| `.claude/CLAUDE.md` | Pointer to `AGENTS.md` | Current (2026-10-01) |
| `.agents/rules/apex-anayasa.md` | Pointer to `AGENTS.md` | Current (2026-10-01) |
| `design/design.md` | Separate design note at repo `design/` | Not read line by line. Not the file the master plan cites as the design authority (`docs/design/apex-design-language.md`) |

### Logs

| File | Purpose | Status |
|---|---|---|
| `logs/2026-10-01.md` | News rewrite verification, news UI, hostname move to eight | Newest session log. Pending env items may already be partly overtaken by the live canonical. Keep |
| `logs/2026-09-29.md` | Tablet/mojibake/anthology contrast, Railway removal, pit stops, weather, translation | Historical. Railway removal matches the tree. `SITE_URL` in that log still mentioned the five host |
| `logs/2026-09-28.md` | i18n plan, full history seed, live timing, photo removal, scale fixes, accidental commit | Historical and still the best account of those decisions |
| `logs/2026-09-21.md` | Home and glossary visual redesign | Historical. Some component paths it names (`app/tech-glossary/page.tsx`) moved under `app/[locale]/` |

Logs older than 15 days were removed from the tree on purpose (`c23acc2`). They are only in git history.

### docs/plans and docs/PLAN.md

| File | Purpose | Status |
|---|---|---|
| `docs/plans/master-plan.md` | Agent checklist. Header says last update 2026-07-04; body contains 2026-10-01 items | Living checklist, internally inconsistent. Open checkboxes sit next to completed UI. Header date is stale. This is still the best single plan file |
| `docs/PLAN.md` | Long production plan. Header 2026-06-26. Says the active branch is `feat/apex-frontend-rebuild` and that components were deleted | **Stale snapshot.** Master plan says this file is the old phase history. Safe to archive. Do not follow it |
| `docs/plans/i18n-architecture.md` | next-intl plan. Header says implementation has not started and next-intl is not installed | **Applied.** `next-intl` is a dependency and `app/[locale]/` exists. Header is false. Archive or mark done. Do not use it as the current “not built” state |
| `docs/plans/news-ui-brief.md` | News UI brief. Header says draft, do not implement | **Applied** according to `logs/2026-10-01.md` and the news components on disk. Header is false |
| `docs/plans/news-stories-ui-handoff.md` | Backend handoff for the story UI, 2026-09-29 | Backend description matches `technical.md`. UI tasks were implemented on 2026-10-01. Archive the UI checklist; keep only if voice tuning is still wanted |
| `docs/plans/driver-hero-visual-redesign.md` | Brief for a photo-free driver hero | Master plan marks it implemented (`tests/driver-hero.test.ts` passed). Archive as a brief, not an open plan |

### docs/reference and docs/vision

| File | Purpose | Status |
|---|---|---|
| `docs/reference/mimari.md` | Backend architecture | Useful on stack and the single temporal source. Says Playwright is the e2e tool and that Vercel has 3 crons. Playwright does not run. GitHub crons are easy to miss if this is the only map. Header has no 2026-10 date |
| `docs/reference/proje-dizini.md` | Directory map. Dated as a rule the agent must read first | **Stale and harmful.** Still says components were deleted and pages render `<main>Sayfa adı</main>`. Do not use as the map |
| `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` | Incident list and “do not break” rules. Header 2026-06-10. Live URL is the five host | Valuable as history. **Stale as operations.** Open items include a history backfill and a disabled GitHub schedule that later logs say were done. Asset paths it mandates (`public/drivers/{season}/`) were removed. It says the home page calls live RSS; `app/[locale]/page.tsx` calls `getLatestNews` |
| `docs/reference/anthology-gorsel-temin.md` | How anthology images were obtained | Not fully read. Related to the 124 files still in `public/stories`. Treat as a sourcing note, not a license ledger |
| `docs/reference/web-iyilestirme-onerileri-2026-07-05.md` | Improvement notes. Describes a `PROD_SITE_URL` bug against the five host | Historical. The fallback bug class still exists, now with the seven host |
| `docs/vision/technical.md` | Agent technical summary. Header 2026-07-04 | **Mixed in one file.** Top still says pages are skeletons, components were deleted, and there are 3 migration files. Lower sections correctly describe photo-free icons, `news_stories`, Groq, pit stops, and `circuit_weather`. The two halves conflict |
| `docs/vision/skills.md` | Skill trigger list referenced by the constitutions | Not a product spec. Skill packs under `.agents/skills` and `.claude/skills` are vendored |

### Other project docs

| File | Purpose | Status |
|---|---|---|
| `docs/F1_Anlati_Stil_Kilavuzu.md` | House voice for anthology prose, derived from named YouTube channels, with an anti-plagiarism section | Editorial standard. It says transcript files live in `/workspace/f1-style/transcripts/`, which is not this repo. The guide itself is in-repo |
| `docs/glossary-icon-prompts.md` | Prompts for glossary icons | Asset-generation note. Not verified against current icons |
| `docs/anthology-ingestion-report.md` | 2026-09-17 report of race photographs copied into `/stories/...` | Historical ingestion record. Those subjects are real photographs. It is not a license ledger |
| `docs/anthology-missing-assets-download-list.md` | Missing-asset download list | Likely stale after ingestion. Not re-audited file by file |
| `docs/anthology-image-remap-audit.md` | Remap audit | Historical |
| `docs/anthology-image-map.md` | Image map | Historical. May still describe files under `public/stories` |
| `stories-images/README.md` | Export count: 57 images, 17 stories | Local export note |
| `old-versions-valuable-files/README.md` and `audit-raporu.md` | Archived material | Excluded from `tsconfig` and ESLint. Not current code |

### docs/design

`docs/design/apex-design-language.md` is the file the master plan calls the approved visual language [VERIFIED: master plan]. `docs/design/README.md` is the folder index.

These are generic design essays, not the Apex system. They conflict with each other (glassmorphism, neumorphism, brutalism, Swiss, dark-mode-first) and must not be treated as product law:

- `docs/design/design-styles/Neo-Brutalism Design System_ A Technical Specification.md`
- `docs/design/design-styles/Bento Grid Design System_ A Production-Grade Framework for Modular UI.md`
- `docs/design/design-styles/Editorial UI Design System_ The Architecture of Narrative Experience.md`
- `docs/design/design-styles/Card-Based UI System_ Professional Design Specification.md`
- `docs/design/design-styles/Dark Mode First Design_ A Production-Grade System Specification.md`
- `docs/design/design-styles/Swiss Design System (International Typographic Style).md`
- `docs/design/design-styles/Neumorphism_ A Comprehensive Design System Specification.md`
- `docs/design/design-styles/Brutalist UI Design System_ A Technical and Strategic Framework.md`
- `docs/design/design-styles/Minimalism Design System_ A Production-Grade Specification.md`
- `docs/design/design-styles/Glassmorphism Design System_ Technical Specification.md`

Also reference-only, not verified against the built UI: `colours/best-colour-combos.md`, `colours/60-30-10-renk-kurali.md`, `typography/best-font-pairings.md`, `typography/cinematic-fonts-reference.md`, `trends/2026-design-trends-ui-uyarlama.md`, `ux-laws-reference.md`, `universal-design-principles.md`, `premium-design-philosophy.md`, `tasarim-skilleri-rehberi.md`, `design-techniques/loading-states-process-feedback.md`, `design-techniques/progressive-blur-card-design.md`, and the files under `docs/design/design.md/` (`design-system-kurulum-rehberi.md`, `mobile-design.md`, `web-design.md`, `Universal Mobile UI_UX Design System Principles_ Foundation for design.md.md`, `Master Design System Architecture (design.md)_ A Unified Synthesis for Scalable Web Interfaces.md`).

The constitutions say `docs/design/` is the single authority, and also say that when design skills are active it is only inspiration [VERIFIED: `.cursor/rules/CURSOR.mdc` section 4]. That is an internal conflict.

### docs/superpowers (historical specs and plans)

All of these are dated June or July 2026. They are records of past work, not the current plan. Several still name the five or seven host.

- `docs/superpowers/plans/2026-07-13-mobile-bugfix-and-features.md`
- `docs/superpowers/plans/2026-06-25-mobile-app.md` (hardcodes the five host for the Expo API)
- `docs/superpowers/specs/2026-07-13-mobile-bugfix-and-features-design.md`
- `docs/superpowers/specs/2026-07-13-web-redesign-round2-design.md`
- `docs/superpowers/specs/2026-07-05-boxbox-inspired-improvements-design.md`
- `docs/superpowers/specs/2026-07-05-hero-redesign-design.md`
- `docs/superpowers/specs/2026-07-04-apex-web-responsive-design.md`
- `docs/superpowers/specs/2026-06-25-mobile-app-design.md`

`design/boxbox-mobile/screens-spec.md` and `design/stitch-design-pack/DESIGN.md` are the same class of design exploration.

### Vendored skill and tool docs (not project source)

Dozens of `SKILL.md`, `AGENTS.md`, and `CLAUDE.md` files under `.agents/skills/` and `.claude/skills/` (including `graphify`, `impeccable`, and `taste-skills`) are third-party packs. `.claude/skills/graphify/docs/**` is that tool’s own docs. They are not Apex specifications. ESLint already ignores `.claude`.

### Applied plans that should be archived, not followed

Do not delete them in silence. Move them to an archive folder or mark them applied, after the owner agrees:

1. `docs/PLAN.md` — superseded by `docs/plans/master-plan.md`, wrong branch, false frontend status.
2. `docs/plans/i18n-architecture.md` — implemented; header says it was not.
3. `docs/plans/news-ui-brief.md` — header forbids implementation; the UI shipped.
4. `docs/plans/driver-hero-visual-redesign.md` — implemented.
5. `docs/reference/proje-dizini.md` — false directory map. Replace or delete after this reference exists.
6. The June–July `docs/superpowers/**` mobile and redesign plans — historical. The mobile app they describe is not in git.

Keep `docs/plans/master-plan.md`, but fix the header date and close or rewrite the checkboxes that the 2026-09-29 log already said were stale. Keep `PROJECT_LESSONS_AND_ROADMAP.md` only as history until someone rewrites the open-item list.

---

## 10. Gaps (difference between stated intent and reality, ordered by severity)

Last verified: 2026-10-01

1. **Legal pages claim a real privacy and DMCA process. The mailboxes are `.example` placeholders, and analytics load without the consent the privacy page promises.** [VERIFIED: legal pages, layout, search for a consent component.] `ROADMAP.md` phase 1 and `AGENTS.md` say these surfaces are required before production is acceptable. The pages exist. The mechanism does not.
2. **The production hostname is not one value.** Live site and most new docs say eight. `lib/data/siteUrl.ts` falls back to seven, which 404s. Local build canonicals fell back to localhost because `NEXT_PUBLIC_SITE_URL` is absent in `.env.local`. Older docs still say five. This class of bug has already shipped once (`6ab76cb`).
3. **Anthology still serves a large set of photographs after a written photo-free, license-or-remove policy.** Grid photos were removed. `public/stories` still has 124 files. The ingestion report describes real race photographs. `AGENTS.md` says an asset with an unclear license does not ship. No per-file license ledger was found in this pass [UNVERIFIED: each file’s license was not opened].
4. **Agent rules contradict each other and contradict the code.** Three constitutions say the UI was deleted and say to commit and push at the end of every task. `AGENTS.md` says not to commit unless asked. A new agent that trusts `proje-dizini.md` will “rebuild” a UI that already exists.
5. **No pull-request gate runs lint, types, tests, or build.** Quality on 2026-10-01 was good only because this analysis ran the commands. `ROADMAP.md` phase 4 says those gates are part of release. They are not installed.
6. **Rate limiting and cron locking are only as strong as Upstash in production, which is unconfirmed for the current Vercel project.** The code degrades to per-instance memory. The news and F1 crons are also scheduled twice (Vercel daily and GitHub hourly).
7. **Sentry is wired and the upload failed** with `Project not found` for the org and project hardcoded in `next.config.ts`. Error monitoring may be dark. [UNVERIFIED: live Sentry ingest.]
8. **Node 24 is declared and Node 22 is what actually runs** locally and in the F1 sync workflow. The build passed on 22. An engine-strict environment could diverge. [UNVERIFIED: Node 24 was not installed here.]
9. **Mobile is documented as a shipping Expo app and is absent from git.** Store release items in the master plan cannot be done from `main`.
10. **Master-plan checkboxes and Lighthouse/QA items are not a reliable backlog.** i18n phase 6, live-race end-to-end, and Lighthouse are still open in the plan and were not measured here. [UNVERIFIED: no browser pass, no Lighthouse run.]
11. **`.env.example` is behind the code** (no Groq, Upstash, Sentry, `SITE_URL`). A new machine following the README will miss the news writer and the distributed limiter.
12. **`docs/vision/technical.md` contradicts itself** (skeleton pages at the top, `news_stories` pages at the bottom). Agents that stop at the header will make bad changes.

---

## 11. Proposed roadmap (not implemented, ordered, each item with a done-criterion)

Last verified: 2026-10-01

These items are not done. Order follows section 10.

1. **One public origin.** Remove the seven-host fallback or point it at eight. Set `NEXT_PUBLIC_SITE_URL` in every environment that builds metadata. Update README, lessons, and technical.md in the same change.
   Done when: a local production build does not warn that `metadataBase` is localhost; `siteUrl.ts` contains no host that returns 404; the live canonical stays `https://project-anthology-eight.vercel.app`.
2. **Make the privacy page true.** Either gate Analytics and Speed Insights behind an opt-in, or change the privacy copy so it does not say they are off until consent. Replace `privacy@`, `dmca@`, and `contact@apexstats.example` with addresses the owner monitors.
   Done when: a fresh browser session does not send analytics before consent, or the privacy page no longer claims that; each legal page’s mailto is an address the owner has confirmed; a test message to that address is received.
3. **License ledger for `public/stories` and `stories-images`.** For each file: source, license, author, date, or remove it. Same standard already used for the grid.
   Done when: every file under `public/stories` is either listed with a license that allows this use, or deleted, and the site still builds.
4. **Retire the false maps.** Archive the files in section 9’s “applied plans” list. Rewrite the top of `docs/vision/technical.md` and the “components deleted” lines in the three constitutions. Pick one agent rule file (see section 12).
   Done when: a search for `components/ silindi` and `iskelet placeholder` in agent rules and `docs/reference` returns nothing that describes the current tree.
5. **CI on pull requests.** One workflow: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, on the Node version the project actually standardizes.
   Done when: a commit that fails `npm test` cannot merge to `main`, and the workflow is green on current `main`.
6. **Confirm production Upstash, cron secrets, Groq, Gemini, and Sentry on the eight project.** Fix the Sentry org/project or stop uploading. Add the missing names to `.env.example` with empty values.
   Done when: the owner confirms those names exist in the Vercel project (values stay secret); a source-map upload either succeeds or is explicitly disabled; `.env.example` lists every name the server reads.
7. **Stop paying for idle hourly `npm ci`.** The race-aware workflow should skip install when no window is due, or the due-check should be a tiny script that does not install the whole app first.
   Done when: an hour with no due window finishes without `npm ci`, and a due window still calls `sync-f1` successfully.
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

Last verified: 2026-10-01

1. ~~Which rule file wins?~~ Resolved 2026-10-01: `AGENTS.md`.
2. Is the current Vercel project still on the Hobby plan? The daily cron design assumes yes. That was not visible from the repo.
3. After the move to `project-anthology-eight`, are `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` or `CRON_SECRET_KEY`, Upstash, Groq, Gemini, and Sentry set on that Vercel project? The 2026-10-01 log said the site URL and the GitHub secret/variable were still pending. The public canonical is already eight. The dashboard was not opened.
4. What is the GitHub Actions `SITE_URL` variable today? If it is still five or seven, hourly sync and push notifications are calling a dead host.
5. Should the 124 files in `public/stories` stay? The grid photo-free decision did not list them. There is no license ledger in the repo.
6. Are `privacy@apexstats.example`, `dmca@apexstats.example`, and `contact@apexstats.example` intentional placeholders? If a real address exists, it is not in the legal pages. Was the privacy text reviewed by anyone who can approve a KVKK notice? The repo does not say.
7. Is the Expo app in `mobile/` still a product? It is on disk and gitignored, so `main` does not contain it.
8. Is `feat/apex-frontend-rebuild` still needed, or is it an abandoned branch?
9. Should Analytics stay on for every visitor? The privacy page says no. The layout says yes. The repo does not record a decision that resolves both.
10. Sentry org `anthology-z0` and project `project-anthology` were not found during this build. Is that the project to keep, or should source-map upload stay off?
11. The master plan’s unchecked UI and Lighthouse items were not re-measured in a browser in this pass. Which of WEB-UI.4, WEB-UI.5, WEB-UI.7, and WEB-UI.8 are still wanted?
12. Who is allowed to apply SQL to the production Supabase project? The logs say the owner applied the September 29 migrations by hand after `db push` timed out. This pass did not compare remote migration history to the eight files.

---

## 14. Re-verification log

Last verified: 2026-10-01

Re-checked by the pilot-setup agent on 2026-10-01 (commands run, not copied): `components/` = 89 ts/tsx files; `app/[locale]` = 20 `page.tsx`; `app/api` = 13 `route.ts`; 8 migrations; 22 test files; `public/stories` = 124 tracked files; `mobile/` gitignored, 0 tracked; `getSiteUrl()` fallback = seven host; live `/` on eight = 200 with eight canonical, seven = 404, unauthenticated `sync-news` = 401; all four cron routes contain `isCronAuthorized`; env names read in code match the list in section 5; workflows use Node 22 while `engines`/`.nvmrc` say 24; legal pages use `.example` mailboxes; layout mounts Analytics and Speed Insights. No `[VERIFIED]` claim was found false. One addition: `docs/design/README.md` cites a non-existent `apex-final-design.md` (fixed in the docs cleanup).
