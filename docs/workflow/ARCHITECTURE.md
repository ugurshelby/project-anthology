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
- Every public API route rate-limits through `applyRateLimit` (`lib/rateLimit.ts`); header-less requests share one bucket at 1/5 quota, never unlimited.
- Live RSS/image scanning runs only in the `sync-news` cron; pages read the database.
- Future auth (none today): passwords use Argon2id (RFC 9106; m=47104 KiB, t=1, p=1), PHC string format, CSPRNG salt, verify-then-rehash for migration. Never MD5/SHA/bcrypt. Reference: `docs/reference/security-docs/`.

## Open architectural questions
See `OPEN.md`. Decisions live in `DECISIONS.md`.
