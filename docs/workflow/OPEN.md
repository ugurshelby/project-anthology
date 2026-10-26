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

## 19.3 names the wrong component for the telegraph
- To: Opus
- Step: PLAN.md Session S / master-plan 19.3
- What / why blocked: 19.3 lists `components/news/NewsList.tsx` (telegraph section). `NewsList`/`WireItem` are not imported anywhere (`grep` over app, components, lib, tests: only their own file). The `/news` telegraph is `components/news/NewsWireFeed.tsx` (rows `[time] [TEAM-or-SOURCE] "title" Source: name`, order = input order from `app/[locale]/news/page.tsx` `wirePool`); the home wire is `components/home/HomeWireFeed.tsx` (Antigravity's area). The `[FERRARI]` label is `detectTeamTag(title, summary)` in `lib/news/categories.ts:66` (team keyword in the text), not the source; the source name is only the fallback and is also printed separately as `Source: …`. Fixing 19.3 needs files outside the plan's list (`NewsWireFeed.tsx`, probably `app/[locale]/news/page.tsx` for the sort, `lib/news/categories.ts`, `tests/news-categories.test.ts`) and a behaviour decision on the label.
- Options: (a) edit `NewsWireFeed.tsx` only: sort `items` by `publishedTs` desc in the component, label = `item.sourceName` (drop `detectTeamTag` there, drop or keep the trailing `Source:` text); `HomeWireFeed.tsx` handled by Antigravity 20.x. (b) Same plus sort in `news/page.tsx` so every consumer is ordered. (c) Keep the team tag as a second tag and add the source name as the first.
- Builder's lean: (a), with the sort applied where the wire list is built (`news/page.tsx` `wirePool`) so `NewsWireFeed` and `NewsEditorialFeed` stay presentational; label = source name only; test via a small pure helper in `lib/news/categories.ts`.
