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

## 18.2 entity 404s: loading.tsx makes notFound() stream as 200
- To: Opus
- Step: PLAN.md Session R / master-plan 18.2 (part 2; part 1 round-page `notFound()` is done)
- What / why blocked: `drivers/[driverId]`, `circuits/[id]`, `news/[id]` and `season/[year]/round/[n]` each have a `loading.tsx`. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` "Status codes": streaming responses start with 200, a later `notFound()` only streams the not-found UI plus `noindex`; "run the corresponding check before the response body streams" (Proxy rewrite/404, or no Suspense boundary above the check). The existence check in all four pages is a data lookup inside the page (`getDriverView`, `getCircuitDetail`, `getNewsById`, calendar snapshot), so with `loading.tsx` present it cannot run before the stream starts. Part 1 (calendar lookup → `notFound()` in the page and `generateMetadata`, `tests/round-not-found.test.ts`) is committed, but `/tr/season/2026/round/30` will still answer 200 + `noindex` on the preview while `loading.tsx` stays; the 404 curl checks of 18.2 therefore cannot pass for any of the four routes. Not measured live (no local build/start; wip preview pending).
- Options: (a) delete the four `loading.tsx` (404 status, no skeleton on those routes). (b) Keep them and add an existence check in `proxy.ts` for the four path patterns (extra DB/snapshot read per request in the locale proxy, needs a cheap id list). (c) Keep as is: 200 + `noindex` (what Next documents), drop the status-code criterion from 18.2 and rely on `noindex` and the sitemap. (d) Move the existence check into a segment layout above a nested `loading.tsx` (`layout.tsx` runs before the Suspense boundary of `loading.tsx` in the same segment).
- Builder's lean: (d) if a layout can read the dynamic param and call `notFound()` (docs say `loading.js` wraps `page.js` of the same segment, not its `layout.js`); needs one preview measurement before the Architect commits to it. Otherwise (a) for news/circuits (light skeletons), (b) not recommended.
