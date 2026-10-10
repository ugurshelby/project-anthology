# Apex agent rules (canonical)

Apex (package `project-anthology`) is an unofficial Formula 1 archive and live-data site: Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Supabase, deployed on Vercel from `main`.
Every agent tool (Claude Code, Cursor, others) follows this file. Nothing else is authoritative about rules.

## Authority order

1. The code and the tests.
2. This file (`AGENTS.md`).
3. `docs/reference/apex-reference.md` (living reference, each section has a `Last verified` date).
4. Everything else (plans, logs, design essays, vendored skill packs). If it disagrees with 1-3, it is wrong: fix it or delete it.

The foundational purpose and vision of this project is `docs/vision/apex-vision.md` (bu projenin temel amacı ve vizyonu `docs/vision/apex-vision.md` dökümanıdır; çalışmalar bu vizyon çerçevesinde yapılmalıdır).
Design authority is `docs/design/apex-design.md` (master design system architecture) and `docs/design/apex-design-language.md`. The owner's own component and layout rules are in `docs/design/apex-component-rules.md`: they are binding, they win over any other design doc or skill pack, and agents never relax or reinterpret them (ask the owner instead). The other files under `docs/design/` are a library, not law.

## Permission model

- Always commit and push to `main` only (owner decision, 2026-10-08; "her zaman yalnızca main dala commit push edilir"). No pull requests. Commit small, run the verification gates, then push. Vercel deploys every push to `main` to production, so never push with a failing gate.
- Never open a side branch, for any reason, including risky or large changes (many files, migrations, dependency or config changes): for those, ask the owner first, then do them on `main`. If a session or tool starts you on another branch (for example a `claude/...` session branch), bring the work onto `main` (fast-forward or merge commit) and push `main`.
- Branch cleanup: a branch other than `main` that is merged into `main`, or has no commit that `main` lacks (`git log origin/main..origin/<branch>` is empty), is deleted locally and on `origin`. A branch with unique commits is never deleted silently: report it to the owner, who decides whether it is merged or dropped.
- Never force-push `main`, never rewrite its history.
- Do not touch the live database, do not run `supabase db push`, do not call cron endpoints with a secret, unless the owner asks in the current conversation.
- Never print, log or commit secret values. Names only.
- Do not decide owner questions (analytics consent, legal mailbox addresses, `public/stories` licensing, the `mobile/` app, Node version, state of Vercel/Upstash/Sentry/GitHub variables). List them in the report.
- Start every task with `git status`. If the tree is dirty with work that is not yours, stop and report; do not stash, discard or commit it.
- Do not skip hooks, do not change git config.
- Two agents share one working tree: Claude Code (backend, data, API, database, review) and Antigravity (frontend, design, UI copy). Only Claude Code commits and pushes. Antigravity never runs `git commit`, `git push`, `git stash`, `git reset` or `git checkout -- <path>`; when its work is done it writes what it did and what it measured into the day's log, marks the plan items it worked on `[~]` with what is still open (it never marks one done), and says so in its final report. Claude Code verifies the work, ticks or reopens the plan items, commits with pathspec-scoped adds, and pushes only after the owner approves.

## Forbidden

- Hardcoded season, driver or team lists. Time and season come from `lib/f1Calendar.ts`; data comes from the snapshot layer.
- Official F1, team or sponsor logos, and photographs without a license record (source, author, license, date) in the same change.
- AI-generated images, SVGs or drawn illustrations under `public/stories` (owner rule, 2026-10-07): story images are real photographs, each with a record in `data/stories/image-credits.ts` (`tests/story-images.test.ts` enforces it). Story pages say the images are used editorially, not commercially, name the source where it is recorded and link the image to its original page; an image whose source is unknown stays on the owner's list (`docs/reference/hikaye-gorselleri-kaynak-listesi.md`).
- A second site-origin constant. The only origin is `getSiteUrl()` in `lib/data/siteUrl.ts` (fallback must be a live host).
- A cron handler without `isCronAuthorized` (fail closed). Cron and upstream APIs are never called from the browser.
- Committing `.env*` (except `.env.example`).
- Editing a migration that has already been applied.
- A public proxy route that takes a URL instead of a whitelisted path.
- Silencing lint warnings or using `any`/ts-ignore escapes instead of fixing the cause.
- Markdown or documentation files in the project root directory. Only `README.md` and `AGENTS.md` are permitted in the root; all documentation belongs under `docs/`.

## Verification rule

Done means measured. Before saying a change is done:

- Run the smallest relevant Vitest file, then `npm run lint`.
- Run `npx tsc --noEmit` for any TypeScript change.
- Run `npm run build` when routes, `next.config.ts`, data-reading pages, or migrations changed. Never run two `next build` at once.
- Never run a script that loads `.env.local` or any real env file. If a script needs env, run it with empty or placeholder values; if it cannot run that way, report it instead.
- A UI change is not done until the changed screen was used in a browser. If no browser is available, report the check as not verified; never infer it from code.
- Report each command and its result (pass/fail counts, exit code). Say plainly what was not run and why.
- Do not claim anything you did not measure. Do not leave a failing gate that you caused.

Next.js 16 has breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before changing Next.js behavior. The locale proxy is `proxy.ts`, not `middleware.ts`.

## Migration safety

- DB changes are a new timestamped file `supabase/migrations/YYYYMMDDHHMMSS_name.sql`. Include `GRANT`/`REVOKE`, not only RLS policies.
- Before any live apply: a read-only check of the live state, and an explicit owner go-ahead in the current conversation. Never paste SQL into production on your own.

## Git hygiene

- When a new file type or folder appears, check `.gitignore` before committing.
- When code starts reading a new env variable, add its name to `.env.example` with an empty value. Never its value.
- Commits are small, with a clear message. Use pathspec-scoped adds; never blanket-add in a shared working tree.

## Docs self-maintenance

- A change that makes a doc false updates that doc in the same commit (README, `docs/reference/apex-reference.md`, `docs/vision/technical.md`, `docs/plans/master-plan.md`, `.env.example`).
- Root doc hygiene: No documentation files are allowed in the project root directory. Only `README.md` and `AGENTS.md` reside in root.
- Product showcase (`docs/PRODUCT.md`): `docs/PRODUCT.md` is the official project showcase and overview document. Whenever a docs refinement or docs freshness procedure is executed, `docs/PRODUCT.md` must be reviewed and kept fresh so architecture, UI, and vision decisions remain current.
- Report and reference lifecycle: Any reference or audit report (e.g., audit findings) that has been thoroughly reviewed and its actionable items transferred into a plan document (`docs/plans/master-plan.md`) must be retired/deleted. Do not keep stale documents; git history is the archive.
- When a procedure touches a section of the reference, update its `Last verified` line.
- A plan whose last step is done is deleted (after its log entry and commit). Git history is the archive. No archive folders.
- `docs/plans/master-plan.md` is the single live checklist. Tick a box only after verifying it in code or by a measured run.

## Logs

- `logs/YYYY-MM-DD.md`, one section per task: only measured facts (command, result, counts, status codes), what changed, what is still open.
- No intentions, no unverified claims, no secret values.
- Delete log files older than 15 days.

## Procedures

When the owner says one of these phrases, follow the matching procedure in `docs/procedures.md`.

| Phrase (TR / EN) | Procedure |
|---|---|
| "frontend denetim turu", "arayüzü denetle" / frontend audit | 1. Frontend audit |
| "güvenlik denetimi", "maliyet kontrolü" / security and cost audit | 2. Security and cost audit |
| "veri hattı kontrolü", "haber hattı kontrolü" / data health | 3. Data and pipeline health |
| "doküman taraması", "bayat dokümanları temizle" / docs sweep | 4. Docs freshness sweep |
| "şu hatayı düzelt: ...", "canlıda şunu gördüm: ..." / bug report | 5. Bug triage |
| "main'e hazır mı", "merge öncesi kontrol" / merge readiness | 6. Merge readiness |
| "rutin kontrol", "bakım oturumu" / routine session | 7. Routine session (3, 2, 4) |
| "docs refinement prosedürü", "dokümanları rafine et" / docs refinement | 8. Docs refinement |

## Product and brand limits

- Apex is independent and unofficial; F1/FIA/team names are used descriptively only, never implying endorsement.
- Server-only secrets never enter client bundles. User and API input uses the existing validation and rate-limit helpers.
- UI: keep the existing Apex design language, mobile first, keyboard and focus visible, `prefers-reduced-motion`, WCAG AA contrast, explicit loading/error/empty/stale states.
- News is original text with source links; an overlap of 7 or more consecutive source words is rejected by `lib/news/rewrite.ts`.
- Skill packs under `.agents/skills` and `.claude/skills` are vendored: do not edit them.
