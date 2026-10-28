# OPEN

Builder appends blocked decisions. `To:` says who answers: `Opus` (Architect answers into `DECISIONS.md` and removes the entry), `Sonnet` or `Haiku` (a Builder session must redo or check something), `Owner` (only when the step cannot continue without the owner; owner questions that do not block a step stay in the final report).

<!-- Entry format
## <short title>
- To: Opus | Sonnet | Haiku | Owner
- Step: PLAN.md / master-plan step number
- What / why blocked:
- Options:
- Builder's lean:
-->

## 18.1 live standings rows and DNF line do not match the plan (H1, 2026-10-28)
- To: Opus
- Step: master-plan 18.1 (`b37bd7b` on origin/main, 2026-10-26 23:39+03)
- What / why blocked: live `https://project-anthology-eight.vercel.app/tr/season` driver table has 20 rows, Pérez absent (expected 23). `/tr/season/1989` driver table has 26 rows (expected 30) and no "yarış dışı" summary line (expected DNF ≥ 200). Deploy time of `b37bd7b` not verified (Vercel MCP 403), so it may be a stale deploy or a remaining limit.
- Options: (a) confirm the deployment containing `b37bd7b` and re-run H1; (b) if live is current, a limit or filter remains in `lib/f1/mrdata.ts` or the page.
- Builder's lean: (a) first.

## 18.3 circuit tab counts on live do not match the plan (H1, 2026-10-28)
- To: Opus
- Step: master-plan 18.3 item 1 (not yet in git log)
- What / why blocked: `/tr/circuits` shows Tümü 23, Yaklaşan 5, Tamamlanan 18. Plan expects the next race counted in Yaklaşan: 6 and Tamamlanan 17. DRS check on `/tr/circuits/americas` passed (no DRS text).
- Options: decide whether the 18.3 change is still pending (status `[~]`, no commit) or deployed without the count fix.
- Builder's lean: pending; confirm and leave the box open.

## 20.5 mobile target count is 1, expected 0 (H1, 2026-10-28)
- To: Opus
- Step: master-plan 20.5 verify (< 24 px targets = 0)
- What / why blocked: on 12 pages at 375 px, text < 11 px is 0 everywhere, no horizontal overflow, and the one target < 24 px on each page is the skip link "İçeriğe geç" (1×1 px, hidden until focus). The literal criterion gives 1. Three-element contrast was not measured (translucent header and photo backgrounds; "2026 · 18. YARIŞ" text no longer on home).
- Options: (a) exempt visually hidden skip links from the target count and state that rule in the master plan; (b) keep the literal rule and give the skip link a 24 px box on focus only (it is already focus-only).
- Builder's lean: (a), a measurement rule rather than a UI change. Contrast still needs a measurement method for translucent backgrounds.
