# Architecture (one page, Architect edits only)

Last verified: 2026-10-20. Authority: code and tests > `AGENTS.md` > this file. Long form: `docs/reference/apex-reference.md`.

## Stack
Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Supabase (Postgres), Upstash (Redis, QStash), Sentry, Vercel (production from `main`). Locale proxy is `proxy.ts`.

## Layout
- `app/` routes and API handlers (cron handlers fail closed with `isCronAuthorized`).
- `lib/` data layer (snapshot layer, `lib/f1Calendar.ts` for time and season, `lib/data/siteUrl.ts` for the origin).
- `components/`, `messages/` + `i18n/` (next-intl), `data/`, `supabase/migrations/`, `tests/` (Vitest), `scripts/`.
- `docs/` all documentation; `logs/` dated measured facts; `mobile/` shelved.

## Invariants
- No hardcoded season, driver or team lists.
- Single site-origin constant. No public proxy route taking a URL.
- Migrations are append-only, timestamped, with GRANT/REVOKE.
- Server-only secrets never reach client bundles.

## Open architectural questions
See `OPEN.md`. Decisions live in `DECISIONS.md`.
