# PLAN

Written by the Architect. Executed by the Builder. Long-lived checklist: `docs/plans/master-plan.md`; this file is the active queue per model. Step details (files, exact change, signatures, verify) live in the master-plan step with the same number; a Builder implements that step exactly and ticks it in both files.

Written: 2026-10-20 (Opus 5.5, Architect). Rewritten 2026-10-28 (Opus, operator): parallel waves and per-letter sessions replaced by three standing sessions (`DECISIONS.md` 2026-10-28 "Three standing sessions"). Waves 1–4 history: git log of this file up to `af13796`.

Shared rules for every queue:
- Three standing sessions, one per model: **Opus**, **Sonnet**, **Haiku**. Each works its queue top to bottom, one step at a time. Effort changes per step with `/effort`; the model never changes inside a session. Never two sessions on the same model at once.
- Start every step with `git status`. If the step's files are dirty from another queue's uncommitted work, wait or take the next unblocked step. Stage only your own files (pathspec adds). One commit per step, local.
- Commit and push: Sonnet and Haiku commit locally; the Opus session audits, then pushes `main` after the owner approves (a `wip/<topic>` branch for CI and preview when routes, config, dependencies or migrations changed; AGENTS.md).
- Blocked or conflicting with the code: append to `OPEN.md` with `To:`, skip to the next unblocked step, report.
- Live checks need `*.vercel.app` reachable (the owner's home network failed TLS on 2026-10-27; use the phone hotspot).
- Race weekend R19: 2026-10-30 → 11-01. No code freeze unless the owner sets one; do not push between Quali start and race end without the owner's OK.

---

## Opus queue (Architect, operator; owner-mandated Faz 13/14 Builder)

### O1 — 13.3 Track telemetry data (Builder)
Run: Opus 5.5 / high for the script change, then `/effort medium` for the run — owner-mandated model (Faz 13).
Depends on: 13.2 on `main` (done). Run outside any F1 session window (R19 FP1 starts 2026-10-30).
Steps:
- [~] 13.3 — done locally 2026-10-28 (`6f6a8fc` gates, `a9a36e5` data; log "13.3 track telemetry run with gates"); open: `wip/` CI + preview, push with owner approval. Master-plan "13.3" including the 2026-10-28 addition (length ±3 % and `brakingPct` ≤ 35 gates, fall back one then two seasons, else skip and log).
Acceptance: master-plan 13.3 verify; the day's log has the summary table and every fallback or skip with its reason.
Stop conditions: more than a third of circuits skipped, or OpenF1 terms or shape changed → `OPEN.md` `To: Opus` (answer it in the same session as Architect, in `DECISIONS.md`).

### O2 — Operator audit (standing)
Run: Opus / medium — audit, commit, push.
After each finished Sonnet or Haiku step: commits, scope, gates (`npx tsc --noEmit`, `npm run lint`, `npx vitest run`), i18n balance, no attribution, browser check for UI steps; answer `OPEN.md`; tick or reopen boxes; push with the owner's approval.

### O3 — 9.4 GCP service selection (Architect) — done 2026-10-28
Run: Opus / xhigh — cost, scope and security decision; no code.
Depends on: 9.0 done. Target: by 2026-11-03 (credit ends 2026-12-18; 9.3 reminder early November).
Steps:
- [ ] 9.4 — master-plan "9.4".

### O4 — 8.13 PASS verdict, then CDN/ISR caching design
Run: Opus / medium for the 8.13 verdict; Opus / xhigh for caching (cost and architecture).
Depends on: Sonnet's 8.13 measurement; caching after 8.12 (master-plan "Teknik borç": pages are `private, no-store`).

---

## Sonnet queue (Builder, including the former Antigravity UI items)

Run (queue): Sonnet / medium unless a step says otherwise.

- [x] **S1 8.2** — master-plan "8.2". First step. Then 8.3. Browser checks at 375 and 1440 px logged (LCP `img` attributes, `currentSrc`). Stop: `next/image` rejects `loader` with `fetchPriority`/`loading`, or no srcset for the custom loader → `OPEN.md` `To: Opus`.
- [x] **S2 8.3** (2026-10-28, Opus; `VariantImage` client wrapper) — master-plan "8.3".
- [x] **S3 19.3** (2026-10-28, Opus; home telegraph part of 20.3 done with it) — master-plan "19.3" (`NewsWireFeed.tsx`, `news/page.tsx` `wirePool`, `lib/news/categories.ts`).
- [ ] **S4 20.2** — master-plan "20.2" (needs 8.3 on `main`; 18.5 helpers).
- [ ] **S5 20.3** — master-plan "20.3" (needs 19.3 on `main`; `sortWireByTime`).
- [ ] **S6 1.8** — master-plan "1.8". Owner sets repo secret `QSTASH_TOKEN` first.
- [ ] **S7 19.2** — master-plan "19.2". `/effort high`.
- [ ] **S8 9.2** — master-plan "9.2" (vertex → gemini → groq, daily Vertex cap). `/effort high`. Needs the owner's `VERTEX_API_KEY` in Vercel.
- [ ] **S9 8.9** — master-plan "8.9". `/effort high`. Also decide with the Opus session what replaces the missing `public/news-fallback.json` (master-plan "Teknik borç").
- [ ] **S10 8.10** — master-plan "8.10" (needs 8.9 on `main`).
- [ ] **S11 8.11** — master-plan "8.11" (one designed team mark; owner reviews).
- [ ] **S12 8.11b** — master-plan "8.11b".
- [ ] **S13 8.12** — master-plan "8.12" (needs 8.2, 8.3, 8.5 on `main`).
- [ ] **S14 8.13** — master-plan "8.13" measurement (PASS verdict in the Opus queue).
- [ ] **S15 15.2** — master-plan "15.2" (only after the owner ran 15.1), then **13.4** (needs 13.3 on `main`).
- Dated: **9.3** by 2026-12-14; **9.7** 2026-12-12 → 14 (with the owner in Claude in Chrome). **9.5** only if 9.4 chooses it.
- On the owner's pick: **8.8(b)** (`/effort low`).

Acceptance (every step): the master-plan verify passes; one commit per step; UI steps checked in the browser at 375 and 1440 px with no console error, measured values in the day's log.

---

## Haiku queue (fully specified steps and read-only checks)

Run (queue): Haiku / low. Every check has an exact expected result; a mismatch is written to the day's log and `OPEN.md` `To: Opus`, never fixed or reinterpreted.

### H1 — Live checks after the 2026-10-28 push
Depends on: `main` deployed on Vercel; `*.vercel.app` reachable.
- [x] 1.3 — master-plan "1.3" (read-only SQL). Matched 2026-10-28, log "Haiku H1".
- [x] (2026-10-28; 18.x, 19.1, 20.1, 20.4, 20.5 closed, 8.1 and 8.5 stay `[~]` for their run counts) Live lines of 18.1, 18.2 (noindex criterion), 18.3, 18.4, 19.1 (first `sync-news` SQL count), 8.1 (`/api/media`), 8.5 (driver width count after 3 `sync-media` runs), 14.5 (`/api/news` gone: 404), 20.1 and 20.4 (text greps on `/tr/grid`, `/tr/anthology`, `/tr/circuits`), 20.5 (375 px iframe measurement, `logs/2026-10-23.md` method).
Acceptance: results in the day's log; boxes ticked where the expected result matched, others stay `[~]` with what is open.

### H2 — R19 weekend (2026-10-30 → 11-01)
- [ ] After R19 Qualifying (2026-10-31) ends: every 10 min until 60 min after `date_end`, `f1_snapshots` row for 2026 round 19 `qualifying` (source, `fetched_at`, `apexProvisional`); log the minutes from `date_end` (1.10 latency).
- [ ] When the provisional row exists: `/tr/season/2026/round/19` shows "Geçici sonuç · OpenF1" (1.11); when the Jolpica row replaces it, the label is gone.

### H3 — 8.4 Anthology first card
- [ ] 8.4 — master-plan "8.4" (needs 8.2 on `main`).

### H4 — Log retention (weekly)
- [ ] Delete logs older than 15 days (master-plan 0.1 rule), only files under `logs/`.
