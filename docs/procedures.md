# Procedures

The owner triggers these with a phrase (Turkish or English). Rules in `/AGENTS.md` apply to all of them: work on `main` (small commits, gates green before every push; never a side branch, risky changes are asked first and then done on `main`), never force-push, never use secrets or the live database, never decide owner questions.

## Common ending (every procedure)

1. Update the docs the work made false, and the `Last verified` lines of the touched sections in `docs/reference/apex-reference.md`.
2. Write the log entry in `logs/YYYY-MM-DD.md` (log rule below).
3. Run the gates: smallest relevant test, `npm run lint`, `npx tsc --noEmit`; `npm run build` when routes, config, data pages or migrations changed.
4. Commit (pathspec-scoped) and push to `main` once the gates pass (or to the agent branch for risky changes).
5. Delete any plan file whose last step is now done (after the log entry and the commit, in its own follow-up commit).
6. Report to the owner in Turkish: found, changed and why, how verified (command + result), commits, not done and why, "Needs owner".

## Log rule

`logs/YYYY-MM-DD.md`. Only measured facts: command, result, counts, status codes. No intentions, no unverified claims, no secret values. Delete log files older than 15 days.

## 1. Frontend audit

- Triggers: "frontend denetim turu", "arayüzü denetle", "frontend audit".
- Scope: pages under `app/[locale]/` and `components/`.
- Steps: read `docs/vision/apex-vision.md`, `docs/design/apex-design.md`, and `docs/design/apex-design-language.md`; run the dev server (placeholder env only, never a real env file) and check every page at 375, 768 and 1280 px (overflow, tap targets, safe area); keyboard-only pass and visible focus; the `/tr` locale (missing strings, layout breaks, `tests/i18n-messages.test.ts`); empty and error states; previews and cards match real data (no invented numbers or names); no browser-side request to `/api/cron/*` or to upstream APIs (check network and `grep` in client components); `prefers-reduced-motion`; contrast.
- May change: components, styles, messages, tests, inside the existing design language only. No new visual language, no new dependencies.
- Only report: any screen not used in a browser (mark "not verified", never infer from code), design-direction questions, anything needing new assets or licensing, performance numbers that need Lighthouse access.
- Docs: master-plan boxes only if verified; reference section 2 and 10.
- Output: list of findings with page, width, fix or reason it was not fixed.

## 2. Security and cost audit

- Triggers: "güvenlik denetimi", "maliyet kontrolü", "security audit".
- Scope: `app/api/**`, `lib/rateLimit.ts`, `lib/cronAuth.ts`, `next.config.ts`, `lib/security/csp.ts`, `.github/workflows`, `vercel.json`, `.gitignore`, `.env.example`.
- Steps: every public route is rate-limited and validated; every cron route calls `isCronAuthorized`; proxies take whitelisted paths only; quota exposure (OpenF1, Jolpica, Groq, Gemini, MyMemory) per visitor action; `git ls-files` shows no `.env*` except `.env.example`; `.gitignore` covers new file types; env names read in code (`grep process.env`) versus `.env.example`; crons scheduled twice (`vercel.json` vs workflows); idle CI minutes (steps that run when nothing is due); no secret values in code, docs, or logs.
- May change: `.env.example` (names only), rate-limit or validation code with tests, workflow steps that waste minutes when provably safe.
- Only report: dashboard or provider state (Vercel plan, Upstash, Sentry, GitHub variables), consent and privacy decisions, anything needing a secret.
- Docs: reference sections 4 and 5.
- Output: findings ranked by severity and cost, fixes made, "Needs owner".

## 3. Data and pipeline health

- Triggers: "veri hattı kontrolü", "haber hattı kontrolü", "data health".
- Scope: read-only; never run a script that loads `.env.local` or a real env file (placeholder values, or report it). Public pages and public JSON routes, public Supabase reads that need no secret, `.github/workflows` state readable without a secret, code of `app/api/cron/*`.
- Steps: history index (`data/history/meta.json`) release versus the latest F1DB release (public GitHub API, read-only); snapshot freshness and content validity (`isSeasonSnapshotContentInvalid` logic against what pages show); `news_stories` freshness, count, EN/TR fields present, source links present; cron routes answer 401 without a token (`curl` without a secret is allowed); workflow files and last runs if visible via public `gh run list`; schedule overlap between Vercel and GitHub.
- May change: tests and guards in code when a defect is found and is pure logic.
- Only report: anything needing a secret, the Vercel/Supabase/Upstash/Sentry dashboards, or a cron call with a token. List these under "Needs owner".
- Docs: reference sections 4 and 8; master-plan boxes only if verified.
- Output: table of check, command, result, status.

## 4. Docs freshness sweep

- Triggers: "doküman taraması", "bayat dokümanları temizle", "docs sweep".
- Scope: `README.md`, `AGENTS.md`, `docs/**` (not vendored skill packs), `logs/`, `.env.example`.
- Steps: compare each claim (routes, env names, counts, hosts, branches, commands) with the code; fix false lines; delete fully applied plans and false docs (git history is the archive; no archive folders); ensure no docs exist in root except `README.md` and `AGENTS.md`; keep `docs/plans/master-plan.md` as the only live checklist and make boxes match code; review and keep `docs/PRODUCT.md` fresh; keep the reference current; delete logs older than 15 days.
- May change: any doc. Never edit `docs/design/` essays beyond the README index, and never vendored skill packs.
- Only report: docs about mobile or licensing that wait on an owner decision.
- Docs: reference section 9.
- Output: list of deleted, fixed, kept files with reason.

## 5. Bug triage from live testing

- Triggers: "şu hatayı düzelt: ...", "canlıda şunu gördüm: ...", "fix this bug".
- Scope: the reported behavior only.
- Steps: reproduce first (local dev, test, or read-only live request) and record the exact steps; find the cause; fix minimally; add a regression test when the logic is pure (`tests/*.test.ts`); run the gates; do not refactor around it.
- May change: the code that causes the bug, its test, and docs it made false.
- Only report: bugs that need live data changes, secrets, dashboards, or a design decision.
- Docs: reference section 8 if the bug is a new recurring class.
- Output: reproduction, cause, fix, test, gate results.

## 6. Merge readiness

- Triggers: "main'e hazır mı", "merge öncesi kontrol", "ready to merge".
- Scope: the unpushed commits on `main` compared with `origin/main`.
- Steps: `git diff --stat origin/main...HEAD`; confirm every changed screen was used in a browser (otherwise list it as not verified); run `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`; list risks (migrations, env names, routes, cron, copyright, docs drift); recommend merge or not.
- May change: nothing except trivial fixes the gates require.
- Only report: the recommendation. Do not push if a gate fails.
- Docs: none unless a gate exposes a false doc.
- Output: diff summary, four gate results, risks, recommendation.

## 7. Routine session

- Triggers: "rutin kontrol", "bakım oturumu", "maintenance session".
- Scope: procedures 3, 2 and 4, in that order, in one pass.
- Steps: run each procedure; fix what is safe; collect the rest.
- May change: what each of those procedures allows.
- Only report: everything under their "only report" lines.
- Docs: as in those procedures.
- Output: one combined report in the common format, with a single "Needs owner" list.

## 8. Docs refinement

- Scope: `docs/**` (özellikle `docs/plans/master-plan.md`, `docs/PRODUCT.md`, `docs/reference/`, `docs/` kök dizini ve `docs/README.md`). Tek canlı eylem planı `docs/plans/master-plan.md`'dir.
- Steps:
  1. `docs/vision/apex-vision.md`'yi temel referans ve pusula alarak tüm dokümantasyonu tara.
  2. Kök dizin hijyenini sağla: Ana proje dizininde yalnızca `README.md` ve `AGENTS.md` kalabilir; tüm diğer dokümanlar `docs/` altında toplanmalıdır.
  3. `docs/plans/master-plan.md` içindeki tamamlanmış işleri (`[x]`) temizle; yalnızca açık işleri bırak (`[ ]` / `[~]`) ve bunları vizyon-misyon hiyerarşisine göre (Kusursuz Saat Veri Altyapısı, Yaşayan Sezon & Grid, Pistler & Topoğrafya, Machinery İkonik Araçlar, Tech Glossary 2.0, Telif-Güvenli Görseller, Mobil/Kalite) sırala.
  4. Rapor ve referans yaşam döngüsü: İncelenip açık işleri `master-plan.md`'ye aktarılan referans veya rapor dokümanları (ör. denetim raporları) repodan silinmelidir; eski/bayat raporlar saklanmaz (arşiv git geçmişidir).
  5. Proje tanıtım vitrini (`docs/PRODUCT.md`): Mimari, arayüz ve vizyonel kararları yansıtacak şekilde her refinemenet işlemi sonunda güncel tutulmalıdır.
  6. `docs/reference/` ve `docs/` kök dizinindeki bayat, çözülmüş veya geçici raporları sil; yaşayan dökümanları vizyon doğrultusunda güncelle ve adlarını anlaşılır yap.
  7. Tüm iç bağlantıları (link/path) doğrula; sıfır kırık link sağla.
  8. `docs/README.md` master dokümantasyon dizinini ve haritasını güncelle.
- May change: `docs/**`, `docs/README.md`, `docs/reference/apex-reference.md`.
- Only report: silinen, güncellenen ve yeniden adlandırılan dosyalar.
- Output: temizlenmiş doküman listesi, güncel açık işler özeti, kapı kontrol sonuçları.
