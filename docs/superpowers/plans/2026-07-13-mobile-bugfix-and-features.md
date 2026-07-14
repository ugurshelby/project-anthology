# Mobile Bugfix + Push Notifications + Track Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 13 user-reported UI bugs, differentiate the Grid/Season mobile tabs, port glassmorphic track maps to mobile circuit detail, and ship the push-notification sending side (registration already exists from a prior round).

**Architecture:** Bug fixes are independent, file-scoped edits across the mobile Expo app and (where the report actually points at web) the Next.js web app — verified against the real code before writing tasks, since several originally-reported bugs turned out to already be fixed, systemic across more files than reported, or actually a web-side issue rather than mobile. Push notifications add one new Vercel API route plus a hook into the existing `sync-f1` cron; the scheduler that calls it lives on Railway (existing `railway/apex-sync-f1-cron/` pattern), not `vercel.json` — flagged to the user before that step per the spec's approval gate.

**Tech Stack:** Expo 56 / React Native 0.85 (mobile), Next.js 16 + React 19 (web), Supabase/Postgres, `expo-server-sdk`, `expo-blur` (new dependency for glassmorphism).

## Global Constraints

- Mobile repo is a separate git repo nested at `mobile/` — commits there are independent of the root web repo's history.
- Every task: `tsc --noEmit` clean before commit. Mobile additionally: `npx expo export --platform android` clean. Web additionally: `npm run build` clean.
- No new hardcoded season/driver/team data outside `lib/f1Calendar.ts`'s existing patterns (root CLAUDE.md rule).
- `vercel.json` must NOT get a new cron line — the notify-sessions scheduler goes on Railway. Flag to the user before touching Railway config (approval gate from the spec).
- Do not silently under-deliver: FP1/FP2/FP3 session times do not exist anywhere in the current Jolpica ingest pipeline (verified — no `FirstPractice`/`SecondPractice`/`ThirdPractice` field is fetched or stored anywhere). The push-notification cron in this plan only supports Qualifying/Sprint/Race. The mobile notification-preferences screen already has FP1/FP2/FP3 toggles from a prior round; this plan leaves them visible but inert (documented, not hidden) rather than silently building nothing for them or silently removing them without telling the user.

---

## Part A — Bug fixes (each its own commit, no approval needed)

### Task A1: Fix Lindblad permanent-number lookup (live driverId includes first name)

**Files:**
- Modify: `mobile/lib/entityAssets.ts:58` (add an alias key to `DRIVER_NUMBER`)
- Modify: `mobile/lib/entityAssets.ts:170-174` (`driverPermanentNumber`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `driverPermanentNumber(driverId)` behavior unchanged in signature, fixed in correctness.

**Root cause (verified via a live curl to production — `curl https://project-anthology-seven.vercel.app/api/season/2026` — not just static-code reading):** every other driver's live `driverId` is a bare surname (`hamilton`, `norris`, `russell`, ...) matching `DRIVER_NUMBER`'s keys exactly. Arvid Lindblad is the one exception: his live `driverId` is `"arvid_lindblad"`, not `"lindblad"`. The map has `lindblad: 41` but the lookup key that actually arrives at runtime is `arvid_lindblad`, so it misses and falls through to `'—'`. A `.toLowerCase()` fix alone does NOT resolve this — `"arvid_lindblad".toLowerCase()` is still `"arvid_lindblad"`, still not equal to `"lindblad"`. (`.toLowerCase()` is still worth adding for consistency with sibling lookups like `teamLogoUrl`/`carImageUrl`/`circuitMapUrl`, which all normalize case before their lookup — but it is not sufficient by itself and must not be treated as the fix.)

- [ ] **Step 1: Add the alias key**

Current (`mobile/lib/entityAssets.ts:58`):
```ts
  lindblad: 41,
```
Change to (add a new line immediately after, do not replace the existing key — in case anything else looks it up by bare surname):
```ts
  lindblad: 41,
  arvid_lindblad: 41,
```

- [ ] **Step 2: Normalize the lookup for consistency (does not by itself fix the bug, but matches sibling functions)**

Current code (`mobile/lib/entityAssets.ts:170-174`):
```ts
export function driverPermanentNumber(driverId: string | undefined): string {
  if (!driverId) return '—';
  const n = DRIVER_NUMBER[driverId];
  return n != null ? String(n) : '—';
}
```

Replace with:
```ts
export function driverPermanentNumber(driverId: string | undefined): string {
  if (!driverId) return '—';
  const n = DRIVER_NUMBER[driverId.toLowerCase()];
  return n != null ? String(n) : '—';
}
```

- [ ] **Step 3: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd mobile
git add lib/entityAssets.ts
git commit -m "fix: Lindblad'ın permanentNumber lookup'u artık live API'nin driverId'si (arvid_lindblad) ile eşleşiyor"
```

---

### Task A2: Fix systemic Anthology duplicate-image bug (15 of 17 stories)

**Files:**
- Modify: `data/stories/content.ts` (root web repo — this file is the single source both web and mobile `fetchStory`/`fetchStories` read from)

**Interfaces:**
- Consumes: nothing new — pure data edit.
- Produces: nothing new — same `Story`/`StoryBlock` shape, only `src` string values change.

**Root cause (verified via full audit of all 17 stories):** in 15 of 17 stories, `heroImage` is `.../landscape/01.png`, and the *same* `landscape/01.png` file is reused verbatim as one of the body `image` blocks — even though distinct `02.png` (and often `03.png`) files already exist on disk in the same folder and are never referenced anywhere. Two stories (`senna-monaco`, `hamilton-silverstone`) are already clean. One story (`imola-1994`) has the duplicate but has no spare file to swap to.

- [ ] **Step 1: Fix the 13 stories with a spare `02.png` (or `03.png`) available**

For each of these slugs, find the image block whose `src` equals the story's `heroImage` value (always `.../landscape/01.png`) and change that one block's `src` to `.../landscape/02.png` (leave `heroImage` itself unchanged — it's correct as the hero, the duplication is only in the reused body block):

- `hunt-lauda` — block captioned "Hunt in the rain, Zandvoort" (or equivalent) → `/stories/hunt-lauda/landscape/02.png`
- `massa-2008` — block captioned "Interlagos grid in the rain" → `/stories/massa-2008/landscape/02.png`
- `schumacher-ferrari` — block captioned "Ferrari F2004 silhouette" → `/stories/schumacher-ferrari/landscape/02.png`
- `hakkinen-schumacher` — block captioned "Häkkinen, focus through Eau Rouge" → `/stories/hakkinen-schumacher/landscape/02.png`
- `button-canada` — block captioned "Parc Jean-Drapeau under rain" → `/stories/button-canada/landscape/02.png`
- `fangio-nurburgring` — block captioned "Maserati 250F lines and muscle" → `/stories/fangio-nurburgring/landscape/02.png`
- `dijon-1979` — block captioned "Villeneuve's 312T4" → `/stories/dijon-1979/landscape/02.png`
- `brawn-2009` — block captioned "Button's 2009 motif" → `/stories/brawn-2009/landscape/02.png`
- `schumacher-1994-spain` — block captioned "Benetton B194 exhaust flames" → `/stories/schumacher-1994-spain/landscape/02.png`
- `collins-fangio-1956` — block captioned "Ferrari D50 Monza 1956 track action" → `/stories/collins-fangio-1956/landscape/02.png`
- `monaco-1982` — block captioned "Didier Pironi Ferrari Monaco 1982 stalled" → `/stories/monaco-1982/landscape/02.png`
- `jerez-1997` — block captioned "Schumacher Villeneuve Jerez 1997 crash contact" → `/stories/jerez-1997/landscape/02.png`
- `senna-donington-1993` — block captioned "Senna McLaren MP4/8 Donington water spray" → `/stories/senna-donington-1993/landscape/02.png`

For each edit: open `data/stories/content.ts`, locate the story by its `"slug":` key, find the `image`-type block whose `"src"` matches the `heroImage` value exactly, and change only that string's filename from `01.png` to `02.png`. Do not touch `heroImage`, captions, or any other block.

- [ ] **Step 2: Fix `jaguar-monaco-diamond` (already scoped in the design doc)**

At `data/stories/content.ts` around line 795, the block captioned "Christian Klien, Jaguar R5, Loews hairpin crash, Monaco 2004":
```ts
{
  "type": "image",
  "src": "/stories/jaguar-monaco-diamond/landscape/01.png",
  "caption": "Christian Klien, Jaguar R5, Loews hairpin crash, Monaco 2004.",
  "layout": "landscape"
},
```
Change `src` to `/stories/jaguar-monaco-diamond/landscape/02.png`.

- [ ] **Step 3: Handle `imola-1994` (no spare file on disk)**

Run: `ls public/stories/imola-1994/*/`
Expected: only `01.png` in each of `landscape/`, `full/`, `portrait/` — confirms no `02.png` exists to swap to.

Find `imola-1994`'s image block that duplicates `heroImage` (`.../landscape/01.png`). Since `full/01.png` is a distinct file already sitting unused in that story (verified: `full` folder is never referenced in this story's blocks), point the duplicated block at `full/01.png` instead of `landscape/01.png` (keep the `layout` field as `"full"` to match the aspect ratio the image actually is — check the image's real aspect ratio if unsure; if it was originally `layout: "landscape"`, change `layout` to `"full"` too since the file is now the `full/` crop).

- [ ] **Step 4: Verify no remaining duplicates**

Run this check against the full file:
```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('data/stories/content.ts', 'utf8');
const stories = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
let bad = 0;
for (const s of stories) {
  const seen = new Set([s.heroImage]);
  for (const b of s.blocks) {
    if (b.type === 'image' && seen.has(b.src)) {
      console.log('DUP:', s.slug, b.src);
      bad++;
    }
    if (b.type === 'image') seen.add(b.src);
  }
}
console.log(bad === 0 ? 'OK: no duplicates' : \`FAIL: \${bad} duplicates remain\`);
"
```
Expected: `OK: no duplicates` (this inline script assumes `content.ts` exports a plain JSON-parseable array literal; if the file has TS-specific syntax around the array, adjust the slice bounds or run a quick manual re-check of the 14 edited stories instead — the point of this step is confirming zero `heroImage`-in-blocks duplication remains, however you verify it).

- [ ] **Step 5: Commit the content.ts fix**

```bash
git add data/stories/content.ts
git commit -m "fix: anthology hikayelerinde tekrarlayan hero görseli — 14 hikayede body image block'u farklı crop'a (02.png) yönlendirildi"
```

- [ ] **Step 6: Re-seed the live Supabase `stories` table**

**Critical — do not skip:** `data/stories/content.ts` is only the tracked source file; both web and mobile actually read from the live Supabase `stories` table (`scripts/seed-stories.ts` upserts `content.ts` into it, keyed on `slug`, idempotent). Editing `content.ts` alone does not change what users see until this re-seed runs.

Run: `npx tsx scripts/seed-stories.ts --dry-run`
Expected: dry-run output shows the 14 affected slugs would be updated (upserted), no errors.

Run: `npx tsx scripts/seed-stories.ts`
Expected: real upsert completes, console confirms all `storyContent.length` rows processed with no errors. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (already required by the project — check `.env.local` exists with this key before running; if missing, stop and report rather than guessing at credentials).

- [ ] **Step 7: Spot-check the live fix**

Run: `curl -s "https://project-anthology-seven.vercel.app/api/stories/jaguar-monaco-diamond" | grep -o '"src":"[^"]*"'` (adjust the endpoint path if the actual live story-detail API route differs — check `app/api/stories/` or however the web app's `fetchStory` resolves its URL if this exact path 404s)
Expected: no two `src` values in the output (excluding portrait) are identical to each other or to the story's `heroImage`.

---

### Task A3: Anthology story-card subtitle word-boundary truncation

**Files:**
- Create: `lib/text/truncateToWord.ts` (root web repo — shared logic, ported to mobile in the same task since both platforms show story subtitles on cards)
- Create: `mobile/lib/truncateToWord.ts` (mobile copy — mobile repo has no shared-package boundary with web, so duplicate the small pure function rather than adding a cross-repo dependency)
- Modify: `components/anthology/StoryCard.tsx:31` (web)
- Modify: `mobile/components/anthology/StoryCard.tsx:45-49` (mobile)

**Interfaces:**
- Produces: `truncateToWord(text: string, maxChars: number): string` — trims to the last complete word within `maxChars`, appends `'…'` if truncated, returns the original string unchanged if it's already within budget.

**Root cause (verified):** neither platform manually char-slices — both already use `line-clamp-2` (web CSS) / `numberOfLines={2}` (mobile) which are word-boundary-respecting at the rendering layer. The "hi..." mid-word cut the user saw happens when the line box's last visible word is itself short and sits right at the wrap boundary — a real visual symptom, but the fix requested ("kelime bazlı truncate") is best delivered by pre-truncating the *string* to a safe character budget at a word boundary before it ever reaches the line-clamp, so the displayed text never risks an awkward end-of-line word fragment regardless of card width or font-scaling.

- [ ] **Step 1: Write the shared truncation function (web)**

Create `lib/text/truncateToWord.ts`:
```ts
/**
 * Truncate to the last complete word within `maxChars`, appending an
 * ellipsis. Returns the input unchanged if it already fits.
 */
export function truncateToWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const safe = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trimEnd()}…`;
}
```

- [ ] **Step 2: Apply it in web's StoryCard**

Current (`components/anthology/StoryCard.tsx:31`):
```tsx
{story.subtitle ? <p className="body-md mt-1 line-clamp-2 text-text-mid">{story.subtitle}</p> : null}
```
Replace with (add the import at the top of the file: `import { truncateToWord } from '@/lib/text/truncateToWord';`):
```tsx
{story.subtitle ? (
  <p className="body-md mt-1 line-clamp-2 text-text-mid">
    {truncateToWord(story.subtitle, wide ? 160 : 100)}
  </p>
) : null}
```

- [ ] **Step 3: Verify web build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean.

- [ ] **Step 4: Commit web change**

```bash
git add lib/text/truncateToWord.ts components/anthology/StoryCard.tsx
git commit -m "fix: anthology kart altyazısı artık kelime sınırında kesiliyor (mid-word truncate düzeltmesi)"
```

- [ ] **Step 5: Port to mobile**

Create `mobile/lib/truncateToWord.ts` with the identical function body from Step 1.

Current (`mobile/components/anthology/StoryCard.tsx:45-49`):
```tsx
{story.subtitle && (
  <Text style={[Typography.bodyMd, { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18 }]} numberOfLines={2}>
    {story.subtitle}
  </Text>
)}
```
Replace with (add `import { truncateToWord } from '../../lib/truncateToWord';` at the top):
```tsx
{story.subtitle && (
  <Text style={[Typography.bodyMd, { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18 }]} numberOfLines={2}>
    {truncateToWord(story.subtitle, featured ? 160 : 100)}
  </Text>
)}
```

- [ ] **Step 6: Verify and commit mobile change**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

```bash
cd mobile
git add lib/truncateToWord.ts components/anthology/StoryCard.tsx
git commit -m "fix: anthology kart altyazısı artık kelime sınırında kesiliyor (mobile)"
```

---

### Task A4: Strengthen Anthology card gradient so category badge never collides with a bright image subject

**Files:**
- Modify: `components/anthology/StoryCard.tsx:22` (web)
- Modify: `mobile/components/anthology/StoryCard.tsx:27-31` (mobile)

**Interfaces:** none — pure visual constant change.

- [ ] **Step 1: Web — darken the image opacity slightly and strengthen the scrim's bottom stop**

Current (`components/anthology/StoryCard.tsx:20-22`):
```tsx
className="object-cover opacity-45 transition-opacity duration-150 group-hover:opacity-60"
/>
<span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
```
Replace with:
```tsx
className="object-cover opacity-40 transition-opacity duration-150 group-hover:opacity-55"
/>
<span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg from-10% via-bg/60 via-45% to-transparent" />
```

- [ ] **Step 2: Mobile — strengthen the LinearGradient's lower stop**

Current (`mobile/components/anthology/StoryCard.tsx:27-31`):
```tsx
<LinearGradient
  colors={['transparent', 'rgba(10,9,8,0.55)', 'rgba(10,9,8,0.95)']}
  locations={[0.25, 0.6, 1]}
  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: featured ? 220 : 160 }}
/>
```
Replace with:
```tsx
<LinearGradient
  colors={['transparent', 'rgba(10,9,8,0.65)', 'rgba(10,9,8,0.97)']}
  locations={[0.2, 0.55, 1]}
  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: featured ? 240 : 175 }}
/>
```

- [ ] **Step 3: Verify both platforms**

Run: `npx tsc --noEmit && npm run build` (web), `cd mobile && npx tsc --noEmit` (mobile).
Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add components/anthology/StoryCard.tsx
git commit -m "fix: anthology kart gradient'i güçlendirildi — kategori etiketi parlak görsellerde artık daha okunur"
cd mobile
git add components/anthology/StoryCard.tsx
git commit -m "fix: anthology kart gradient'i güçlendirildi (mobile)"
```

---

### Task A5: Fix Anthology story detail title-contrast (verify existing gradient is sufficient, strengthen if needed)

**Files:**
- Modify: `mobile/app/anthology/[slug].tsx:113-117`

**Interfaces:** none.

**Note:** the detail screen already has a 3-stop gradient (`mobile/app/anthology/[slug].tsx:113-117`, `['transparent', 'rgba(10,9,8,0.6)', 'rgba(10,9,8,0.98)']`) behind the title — stronger than the list card's. Apply the same proportional strengthening as Task A4 for consistency rather than leaving it as a separate, slightly-weaker treatment.

- [ ] **Step 1: Strengthen the gradient**

Current (`mobile/app/anthology/[slug].tsx:113-117`):
```tsx
<LinearGradient
  pointerEvents="none"
  colors={['transparent', 'rgba(10,9,8,0.6)', 'rgba(10,9,8,0.98)']}
  locations={[0.15, 0.55, 1]}
  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%' }}
/>
```
Replace with:
```tsx
<LinearGradient
  pointerEvents="none"
  colors={['transparent', 'rgba(10,9,8,0.7)', 'rgba(10,9,8,0.99)']}
  locations={[0.1, 0.5, 1]}
  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '88%' }}
/>
```

- [ ] **Step 2: Verify and commit**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

```bash
cd mobile
git add app/anthology/\[slug\].tsx
git commit -m "fix: anthology hikaye detay başlığı görsel üzerinde daha okunur (gradient güçlendirildi)"
```

---

### Task A6: Fix team logo contrast on dark cards (McLaren, Aston Martin, Cadillac)

**Files:**
- Modify: `mobile/app/(tabs)/profiles.tsx:158-178` (`TeamCard`'s logo container)
- Modify: `mobile/components/standings/StandingsRow.tsx:148-163` (`ConstructorStandingsRow`'s logo container)

**Interfaces:** none — visual-only change to an inline style object.

**Root cause (verified):** the logo container background is `Colors.surfaceRaised` (`#1e1c19`, a dark charcoal). Team logos that are themselves dark-colored (Aston Martin's dark green wordmark, Cadillac's black/gold crest) blend into this background. Fix: use a fixed light chip background behind every logo, consistent across all teams.

- [ ] **Step 1: Fix `TeamCard` in profiles.tsx**

Current (`mobile/app/(tabs)/profiles.tsx:158-165`):
```tsx
<View style={{
  width: 56, height: 56, borderRadius: 10,
  backgroundColor: Colors.surfaceRaised,
  borderWidth: 2, borderColor: color + '60',
  alignItems: 'center', justifyContent: 'center',
  marginRight: 14,
  padding: 9,
}}>
```
Replace with:
```tsx
<View style={{
  width: 56, height: 56, borderRadius: 10,
  backgroundColor: 'rgba(255,255,255,0.92)',
  borderWidth: 2, borderColor: color + '60',
  alignItems: 'center', justifyContent: 'center',
  marginRight: 14,
  padding: 9,
}}>
```

- [ ] **Step 2: Fix `ConstructorStandingsRow` in StandingsRow.tsx**

Current (`mobile/components/standings/StandingsRow.tsx:149-155`):
```tsx
<View style={{
  width: 48, height: 48, borderRadius: 8, marginHorizontal: 4,
  backgroundColor: Colors.surfaceRaised,
  borderWidth: 1, borderColor: teamColor + '55',
  alignItems: 'center', justifyContent: 'center',
  padding: 8,
}}>
```
Replace with:
```tsx
<View style={{
  width: 48, height: 48, borderRadius: 8, marginHorizontal: 4,
  backgroundColor: 'rgba(255,255,255,0.92)',
  borderWidth: 1, borderColor: teamColor + '55',
  alignItems: 'center', justifyContent: 'center',
  padding: 8,
}}>
```

- [ ] **Step 3: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd mobile
git add "app/(tabs)/profiles.tsx" components/standings/StandingsRow.tsx
git commit -m "fix: takım logoları artık sabit açık zemin üzerinde — koyu logolar (Aston Martin, Cadillac) artık görünür"
```

---

### Task A7: Fix `DriverCard` points-color inconsistency (P4+ reads as red/error)

**Files:**
- Modify: `mobile/app/(tabs)/profiles.tsx:111-120`

**Interfaces:** none.

**Root cause (verified):** `DriverCard`'s points text color is `isTop3 ? color : Colors.apexRed` — every driver outside the top 3 (P4 and below, not just P2) renders in `apexRed`, which reads as an error/warning state. Its sibling `TeamCard` in the same file already uses the correct neutral pattern (`isTop3 ? color : Colors.textHi`), and `StandingsRow.tsx`'s two components use `isLeader ? teamColor : Colors.textHi` — neutral for everyone except the literal leader. `DriverCard` is the one outlier.

- [ ] **Step 1: Fix the points color**

Current (`mobile/app/(tabs)/profiles.tsx:111-120`):
```tsx
<View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
  <Text style={[Typography.dataMono, {
    color: isTop3 ? color : Colors.apexRed,
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 22,
  }]}>
    {driver.points}
  </Text>
  <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
</View>
```
Replace with:
```tsx
<View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
  <Text style={[Typography.dataMono, {
    color: isTop3 ? color : Colors.textHi,
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 22,
  }]}>
    {driver.points}
  </Text>
  <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
</View>
```

- [ ] **Step 2: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd mobile
git add "app/(tabs)/profiles.tsx"
git commit -m "fix: DriverCard puan rengi artık P4+ için kırmızı değil, nötr (TeamCard/StandingsRow ile tutarlı)"
```

---

### Task A8: Unify countdown format

**Files:**
- Modify: `mobile/components/race/RaceCountdown.tsx:37-44`

**Interfaces:** none.

**Root cause (verified):** the days value renders in `Typography.hero` (large display type) while hours:minutes:seconds renders in `Typography.dataMono` at a visibly smaller, differently-styled size right next to it on the same baseline — this is the "mixed styles" the user saw. Fix: render all four units in one consistent `dataMono` treatment, days included, removing the display-type/mono split.

- [ ] **Step 1: Unify the countdown row**

Current (`mobile/components/race/RaceCountdown.tsx:37-44`):
```tsx
<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
  <Animated.Text style={[Typography.hero, { color: Colors.textHi }, animStyle]}>{days}</Animated.Text>
  <Text style={[Typography.labelCaps, { marginBottom: 4, color: Colors.textMid }]}>DAYS</Text>
  <Text style={[Typography.dataMono, { marginLeft: 8, color: Colors.textMid }]}>
    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
  </Text>
</View>
```
Replace with:
```tsx
<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
  <Animated.Text style={[Typography.dataMono, { color: Colors.textHi, fontSize: 34, fontFamily: 'JetBrainsMono_700Bold' }, animStyle]}>
    {String(days).padStart(2, '0')}
  </Animated.Text>
  <Text style={[Typography.dataMono, { color: Colors.textHi, fontSize: 34, fontFamily: 'JetBrainsMono_700Bold' }]}>
    :{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
  </Text>
  <Text style={[Typography.labelCaps, { marginBottom: 6, color: Colors.textMid }]}>D H M S</Text>
</View>
```

- [ ] **Step 2: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd mobile
git add components/race/RaceCountdown.tsx
git commit -m "fix: geri sayım formatı artık tek tip (gün dahil hepsi dataMono, DD:HH:MM:SS)"
```

---

### Task A9: Differentiate News/Anthology tab icons

**Files:**
- Modify: `mobile/app/(tabs)/_layout.tsx:33-39` (`IconAnthology`)

**Interfaces:** none — `IconAnthology`'s signature (`{ color }: IconProps`) is unchanged.

**Root cause (verified):** `IconNews` is a rectangle with two horizontal lines (document/article shape), `IconAnthology` is a folded-spine rectangle — both are rectangular document silhouettes that read very similarly at 22px in the tab bar, especially in the inactive gray state. Fix: replace `IconAnthology` with an open-book silhouette (two facing pages, a distinct shape from a flat rectangle).

- [ ] **Step 1: Replace the Anthology icon**

Current (`mobile/app/(tabs)/_layout.tsx:33-39`):
```tsx
function IconAnthology({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5C4 18.119 5.119 17 6.5 17H20V3H6.5C5.119 3 4 4.119 4 5.5V19.5C4 20.881 5.119 22 6.5 22H20V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
```
Replace with:
```tsx
function IconAnthology({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6C10.5 4.8 8.3 4 6 4C4.9 4 4 4.3 3.3 4.7C3.1 4.8 3 5 3 5.2V17.7C3 18.1 3.4 18.4 3.8 18.2C4.4 17.9 5.2 17.7 6 17.7C8.3 17.7 10.5 18.5 12 19.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 6C13.5 4.8 15.7 4 18 4C19.1 4 20 4.3 20.7 4.7C20.9 4.8 21 5 21 5.2V17.7C21 18.1 20.6 18.4 20.2 18.2C19.6 17.9 18.8 17.7 18 17.7C15.7 17.7 13.5 18.5 12 19.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 6V19.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
```

Note: the folder-icon glyph used elsewhere (e.g. `mobile/app/(tabs)/anthology.tsx`'s empty-state icon, `mobile/app/glossary.tsx`'s "TERMINOLOGY" button icon, `mobile/app/(tabs)/news.tsx`'s "TERMINOLOGY" button icon) intentionally still uses the old folded-spine shape — those are unrelated to the tab bar and out of scope; only the tab-bar `IconAnthology` changes, since that's the one competing for visual distinction against `IconNews` at a glance.

- [ ] **Step 2: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd mobile
git add "app/(tabs)/_layout.tsx"
git commit -m "fix: Anthology tab ikonu artık News'ten görsel olarak ayırt edilebiliyor (açık kitap silüeti)"
```

---

### Task A10: Fix News card black-render (gradient-on-fallback stacking) and unify the 5 duplicated back-button implementations

**Files:**
- Modify: `mobile/app/(tabs)/news.tsx:59-73` (`ExpandableNewsCard`'s fallback + gradient)
- Create: `mobile/components/ui/BackButton.tsx`
- Modify: `mobile/app/anthology/[slug].tsx:131-140`, `mobile/app/driver/[id].tsx:18-33`, `mobile/app/team/[id].tsx:62-70`, `mobile/app/circuit/[id].tsx:16-31`, `mobile/app/glossary.tsx:122-130` — replace each screen's own copy-pasted back-button block with the shared component.

**Interfaces:**
- Produces: `BackButton` — a component with no props (always calls `router.back()`), matching the existing absolute-positioned `top:16, left:16` pattern used by `driver/[id].tsx` and `circuit/[id].tsx`.

**Root cause (verified by a dedicated research pass, corrected from the plan's original theory):**

1. **News black-card:** NOT a missing-fallback bug (a fallback already exists: source-name text on `Colors.surfaceRaised`). The real cause is gradient-on-fallback stacking: `ExpandableNewsCard` (`mobile/app/(tabs)/news.tsx:59-73`) always layers `LinearGradient colors={['transparent', 'rgba(10,9,8,0.55)', 'rgba(10,9,8,0.92)']}` over the image area regardless of whether `item.imageUrl` exists. When it doesn't, that gradient sits on top of the already near-black `Colors.surfaceRaised` (`#1e1c19`) fallback, compounding to a nearly-fully-black card with only tiny 9px source-name text visible — reading as "fully black/empty" in a screenshot, especially on a `big` card (`imageHeight = 220`).
2. **Back-arrow inconsistency:** NOT a "some screens have it, some don't" issue — every detail screen already has one. The real issue: 5 separate screens (`anthology/[slug].tsx`, `driver/[id].tsx`, `team/[id].tsx`, `circuit/[id].tsx`, `glossary.tsx`) each hand-roll their own near-identical `Pressable` + `Svg`/`Path` chevron block, and `team/[id].tsx`'s copy is positioned differently (in normal document flow, `marginBottom: 24`) than the other four (absolutely positioned, `top:16, left:16` over the hero image) — a real, visible layout inconsistency between `team/[id].tsx` and its siblings.
3. **News source-name duplication as literally described (twice in one card) was NOT found** — no component renders `item.source` twice. Not fixing this specific sub-claim; it may have been a one-off screenshot artifact or perception across two adjacent components (Home's `NewsCard` directly above the News tab's `ExpandableNewsCard`), not a real code defect.

- [ ] **Step 1: Fix the News card gradient-on-fallback stacking**

Current (`mobile/app/(tabs)/news.tsx:59-73`, inside `ExpandableNewsCard`):
```tsx
<View style={{ height: imageHeight }}>
  {item.imageUrl ? (
    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
  ) : (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>{item.source.toUpperCase()}</Text>
    </View>
  )}
  <LinearGradient
    colors={['transparent', 'rgba(10,9,8,0.55)', 'rgba(10,9,8,0.92)']}
    locations={[0.3, 0.65, 1]}
    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
  />
  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: big ? 16 : 12 }}>
    <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 9 }]}>{item.source.toUpperCase()} · {timeLabel}</Text>
    <Text
      style={[Typography.cardTitle, { color: Colors.textHi, fontSize: big ? 18 : 14, lineHeight: big ? 22 : 18, marginTop: 4 }]}
      numberOfLines={expanded ? undefined : big ? 3 : 3}
    >
      {item.title}
    </Text>
  </View>
</View>
```
Replace with (only render the gradient when there's an actual image to scrim over; give the no-image fallback its own self-contained readable footer instead of relying on the gradient+overlay text pattern):
```tsx
<View style={{ height: imageHeight }}>
  {item.imageUrl ? (
    <>
      <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(10,9,8,0.55)', 'rgba(10,9,8,0.92)']}
        locations={[0.3, 0.65, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
      />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: big ? 16 : 12 }}>
        <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 9 }]}>{item.source.toUpperCase()} · {timeLabel}</Text>
        <Text
          style={[Typography.cardTitle, { color: Colors.textHi, fontSize: big ? 18 : 14, lineHeight: big ? 22 : 18, marginTop: 4 }]}
          numberOfLines={expanded ? undefined : big ? 3 : 3}
        >
          {item.title}
        </Text>
      </View>
    </>
  ) : (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceRaised, padding: big ? 16 : 12, justifyContent: 'flex-end' }}>
      <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 9 }]}>{item.source.toUpperCase()} · {timeLabel}</Text>
      <Text
        style={[Typography.cardTitle, { color: Colors.textHi, fontSize: big ? 18 : 14, lineHeight: big ? 22 : 18, marginTop: 4 }]}
        numberOfLines={expanded ? undefined : big ? 3 : 3}
      >
        {item.title}
      </Text>
    </View>
  )}
</View>
```

- [ ] **Step 2: Verify the News fix**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit the News fix**

```bash
cd mobile
git add "app/(tabs)/news.tsx"
git commit -m "fix: news kartında görsel yoksa artık gradient siyah zemin üzerine yığılmıyor (siyah/boş kart bug'ı)"
```

- [ ] **Step 4: Extract the shared BackButton component**

Create `mobile/components/ui/BackButton.tsx`:
```tsx
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

/** Shared back-chevron button — absolutely positioned over a detail screen's hero. */
export function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={16}
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        backgroundColor: 'rgba(10,10,10,0.6)', borderRadius: 20, padding: 8,
      }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19L5 12L12 5" stroke={Colors.textHi} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}
```

- [ ] **Step 5: Replace each screen's local back-button with the shared component**

For `mobile/app/circuit/[id].tsx` and `mobile/app/driver/[id].tsx` (both already have a local `function BackButton() { ... }` matching this exact shape): delete the local function definition, add `import { BackButton } from '../../components/ui/BackButton';` at the top, keep the `<BackButton />` usage in the JSX unchanged (same component name, now imported instead of locally defined).

For `mobile/app/anthology/[slug].tsx:131-140` and `mobile/app/glossary.tsx:122-130` (inline `Pressable` blocks, not extracted local functions): replace the inline block with `<BackButton />` and add the same import. Read each file's exact surrounding JSX first (the inline block may be wrapped in a `SafeAreaView edges={['top']}` in `[slug].tsx` — preserve that wrapper, only replace the `Pressable`+`Svg` internals with `<BackButton />`).

For `mobile/app/team/[id].tsx:62-70` (the one positioned differently, in normal flow rather than absolute): replace its inline block with `<BackButton />` too — since `BackButton` is always `position: 'absolute', top: 16, left: 16`, this also fixes the positioning inconsistency by construction. Read the surrounding JSX first to confirm removing the inline `Pressable` from normal flow doesn't leave a layout gap (it shouldn't, since absolute positioning removes it from flow) — check the header area still looks correct relative to the team-color background/logo below it.

- [ ] **Step 6: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean, and confirms no leftover unused `Svg`/`Path` imports in files that no longer use them directly (remove any that become unused).

- [ ] **Step 7: Commit**

```bash
cd mobile
git add components/ui/BackButton.tsx app/anthology/\[slug\].tsx app/driver/\[id\].tsx app/team/\[id\].tsx app/circuit/\[id\].tsx app/glossary.tsx
git commit -m "refactor: 5 ayrı kopyalanmış geri butonu tek paylaşılan BackButton bileşenine indirgendi (team detail'deki konum tutarsızlığı da düzeldi)"
```

---

## Part B — Grid vs Season differentiation

### Task B1: Make Grid tab lead with photo-forward driver/team cards (already true), Season tab lead with compact list (needs stripping down)

**Files:**
- Modify: `mobile/components/standings/StandingsRow.tsx` (compact-ify both row components)

**Interfaces:**
- Consumes: `Driver`, `Constructor` types (unchanged).
- Produces: same exported `DriverStandingsRow`/`ConstructorStandingsRow` component signatures.

**Context:** Grid (`profiles.tsx`) already shows large 88px-tall photo cards with team-pattern textures — this is already the "who's who" card view the spec asks for, no change needed there. Season (`season.tsx` via `StandingsRow.tsx`) currently shows 72px/64px-tall rows that are visually close to Grid's cards (same gradient-over-team-pattern treatment, same photo-forward layout, just smaller) — this is the actual overlap the user flagged. Season's rows should shrink further and drop the photo, becoming a genuinely compact data-first list (position, name, points) so it reads as "status", not a smaller version of Grid's "who's who" cards.

- [ ] **Step 1: Compact `DriverStandingsRow`**

Current (`mobile/components/standings/StandingsRow.tsx:19-103`), replace the whole function body with a photo-free, denser row:
```tsx
export function DriverStandingsRow({ item }: DriverRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isLeader = item.position === 1;

  return (
    <Pressable
      onPress={() => router.push(`/driver/${item.driverId}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        marginBottom: 4,
      })}
    >
      <View style={{
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: teamColor + '35',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 44,
          backgroundColor: Colors.surface,
        }}>
          <View style={{ width: 3, height: '100%', backgroundColor: teamColor }} />
          <View style={{ width: 32, alignItems: 'center' }}>
            <Text style={[Typography.dataMono, { color: isLeader ? teamColor : Colors.textLow, fontSize: 13, fontFamily: 'JetBrainsMono_700Bold' }]}>
              {item.position}
            </Text>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 14, lineHeight: 17 }]} numberOfLines={1}>
              {item.familyName.toUpperCase()}
            </Text>
            <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 9 }]} numberOfLines={1}>
              {item.constructorName.toUpperCase()}
            </Text>
          </View>
          <View style={{ paddingRight: 12, alignItems: 'flex-end' }}>
            <Text style={[Typography.dataMono, { color: isLeader ? teamColor : Colors.textHi, fontFamily: 'JetBrainsMono_700Bold', fontSize: 15 }]}>
              {item.points}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Compact `ConstructorStandingsRow`**

Current (`mobile/components/standings/StandingsRow.tsx:105-190`), replace the whole function body:
```tsx
export function ConstructorStandingsRow({ item }: ConstructorRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isLeader = item.position === 1;

  return (
    <Pressable
      onPress={() => router.push(`/team/${item.constructorId}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        marginBottom: 4,
      })}
    >
      <View style={{
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: teamColor + '35',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 44,
          backgroundColor: Colors.surface,
        }}>
          <View style={{ width: 3, height: '100%', backgroundColor: teamColor }} />
          <View style={{ width: 32, alignItems: 'center' }}>
            <Text style={[Typography.dataMono, { color: isLeader ? teamColor : Colors.textLow, fontSize: 13, fontFamily: 'JetBrainsMono_700Bold' }]}>
              {item.position}
            </Text>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 14, lineHeight: 17 }]} numberOfLines={1}>
              {item.name.toUpperCase()}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 9 }]}>
              {item.wins} WIN{item.wins !== 1 ? 'S' : ''}
            </Text>
          </View>
          <View style={{ paddingRight: 12, alignItems: 'flex-end' }}>
            <Text style={[Typography.dataMono, { color: isLeader ? teamColor : Colors.textHi, fontFamily: 'JetBrainsMono_700Bold', fontSize: 15 }]}>
              {item.points}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
```

Note: `TeamPattern` and `teamLogoUrl`/`Image` imports become unused in this file after this change — remove the now-dead `import { Image } from 'expo-image'`, `import { teamLogoUrl } from '../../lib/entityAssets'`, and `import { TeamPattern } from '../ui/TeamPattern'` lines if no longer referenced anywhere else in the file.

- [ ] **Step 3: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean (confirms no leftover unused-but-required imports and no type errors).

- [ ] **Step 4: Commit**

```bash
cd mobile
git add components/standings/StandingsRow.tsx
git commit -m "redesign: Season sekmesi kompakt liste görünümüne geçti (fotoğrafsız, veri-öncelikli) — Grid'in kart görünümünden ayrıştı"
```

---

## Part C — Track maps (mobile glassmorphic port)

### Task C1: Add `expo-blur` dependency

**Files:**
- Modify: `mobile/package.json`

- [ ] **Step 1: Install**

Run: `cd mobile && npx expo install expo-blur`
Expected: adds `expo-blur` at the SDK-56-compatible version to `package.json` and `package-lock.json`.

- [ ] **Step 2: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd mobile
git add package.json package-lock.json
git commit -m "chore: expo-blur eklendi (pist haritası glassmorphic kart için)"
```

---

### Task C2: Port the glassmorphic track-map treatment to mobile circuit detail

**Files:**
- Modify: `mobile/app/circuit/[id].tsx:118-129`

**Interfaces:**
- Consumes: `circuitCoverUrl(id)` (already imported and used for the hero at line 40, `const cover = circuitCoverUrl(id);`), `circuitMapUrl(id)` (already imported, `const map = circuitMapUrl(id);`), `BlurView` from `expo-blur` (new).

**Reference (web's exact treatment, `app/circuits/[id]/page.tsx:81-113`):** real cover photo behind at 50% opacity with a bg-gradient scrim, then a `backdrop-blur-2xl` frosted glass panel (`rgba(255,255,255,0.08)` background, `1px` white/15 border, inset highlight shadow) containing the flat track-map SVG.

- [ ] **Step 1: Import `BlurView`**

At the top of `mobile/app/circuit/[id].tsx`, add:
```tsx
import { BlurView } from 'expo-blur';
```

- [ ] **Step 2: Replace the flat track-map card with the glassmorphic version**

Current (`mobile/app/circuit/[id].tsx:118-129`):
```tsx
{map ? (
  <View style={{ marginHorizontal: 20, marginTop: 20 }}>
    <Text style={[Typography.headline, { fontSize: 20, marginBottom: 8 }]}>TRACK MAP</Text>
    <View style={{
      height: 220, backgroundColor: Colors.surface, borderRadius: 12,
      borderWidth: 1, borderColor: Colors.hairline, alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <Image source={{ uri: map }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
    </View>
  </View>
) : null}
```
Replace with:
```tsx
{map ? (
  <View style={{ marginHorizontal: 20, marginTop: 20 }}>
    <Text style={[Typography.headline, { fontSize: 20, marginBottom: 8 }]}>TRACK MAP</Text>
    <View style={{ height: 240, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.hairline }}>
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.35 }}
          contentFit="cover"
        />
      ) : null}
      <LinearGradient
        colors={['rgba(10,9,8,0.7)', 'rgba(10,9,8,0.5)']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <BlurView
          intensity={40}
          tint="light"
          style={{
            width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <Image source={{ uri: map }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
        </BlurView>
      </View>
    </View>
  </View>
) : null}
```

- [ ] **Step 3: Verify**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd mobile
git add app/circuit/\[id\].tsx
git commit -m "feat: pist haritası kartı artık glassmorphic — gerçek pist fotoğrafı zemininde blur cam efekti (web ile parite)"
```

---

## Part D — Push notifications (sending side)

### Task D1: Add `notified_sessions` dedupe table

**Files:**
- Create: `supabase/migrations/20260714000001_notified_sessions.sql`

**Interfaces:**
- Produces: `notified_sessions` table — `(season int, round int, session_type text, notified_at timestamptz)`, unique on `(season, round, session_type)`, used by Task D2 to avoid double-notifying the same session.

- [ ] **Step 1: Write the migration**

```sql
-- notified_sessions — dedupe guard for /api/cron/notify-sessions.
-- One row per (season, round, session_type) that has already been pushed;
-- the cron checks this before sending so a session is never notified twice
-- across repeated 5-10min cron invocations.
create table if not exists public.notified_sessions (
  id            bigint generated always as identity primary key,
  season        integer not null check (season >= 1950 and season <= 2100),
  round         integer not null check (round >= 1 and round <= 99),
  session_type  text not null check (session_type in ('qualifying', 'sprint', 'race')),
  notified_at   timestamptz not null default now(),
  constraint notified_sessions_unique unique (season, round, session_type)
);

alter table public.notified_sessions enable row level security;

-- Service-role key only (same pattern as push_subscriptions) — no anon/authenticated access.
revoke all on public.notified_sessions from anon, authenticated;
```

- [ ] **Step 2: Apply the migration**

Follow the project's existing Supabase migration workflow (check `supabase/migrations/` for how prior migrations were applied — likely `supabase db push` or the Supabase dashboard SQL editor, per this project's established pattern). Confirm the table exists:

Run: `supabase db push` (or equivalent per project convention)
Expected: migration applies cleanly, no conflicts with existing tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260714000001_notified_sessions.sql
git commit -m "feat: notified_sessions tablosu — session bildirimi dedupe guard'ı"
```

---

### Task D2: Add `/api/cron/notify-sessions` endpoint

**Files:**
- Create: `app/api/cron/notify-sessions/route.ts`
- Create: `lib/push/sendExpoPush.ts`

**Interfaces:**
- Consumes: `isCronAuthorized`, `isCronTriggerAllowed` (from `lib/cronAuth.ts`, already exist), `CURRENT_SEASON`, `sessionStartMs`, `raceStartMs` (from `lib/f1Calendar.ts`, already exist), `fetchCalendar` (from `lib/f1/sources/jolpica.ts`, already exists), `getSupabaseAdmin` (from `lib/supabase.ts`, already exists).
- Produces: `sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void>` — thin wrapper around `expo-server-sdk`'s `Expo` client, used by both this task and Task D3.

**Scope (explicit, per Global Constraints):** only `qualifying`, `sprint`, `race` sessions are notified — Jolpica's calendar response has `Qualifying`/`Sprint` sub-slots and the race's own `date`/`time`, but no `FirstPractice`/`SecondPractice`/`ThirdPractice` fields exist anywhere in this codebase's ingest pipeline. FP1/FP2/FP3 preferences remain in the mobile UI (`mobile/lib/notifications.ts`'s `SESSION_TYPES`) but are inert until practice-session times are added to the calendar fetch — out of scope for this plan.

- [ ] **Step 1: Write the shared Expo-push-sending helper**

Create `lib/push/sendExpoPush.ts`:
```ts
import { Expo, type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a batch of Expo push messages, chunked per Expo's own recommendation.
 * Logs (not throws) on a per-chunk send failure so one bad chunk doesn't
 * abort the rest — callers get the tickets to inspect for per-message errors.
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error('[sendExpoPushNotifications] chunk send failed:', err);
    }
  }
  return tickets;
}
```

- [ ] **Step 2: Write the notify-sessions route**

Create `app/api/cron/notify-sessions/route.ts`:
```ts
/**
 * Cron: notify-sessions
 *
 * Checks upcoming session start times (qualifying / sprint / race — FP1-3
 * excluded, no practice-session data exists in the ingest pipeline) and
 * pushes a notification ~30 minutes before each starts, to subscribers who
 * opted into that session type. Dedupes via notified_sessions so repeated
 * 5-10min cron invocations never double-notify the same session.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (same as sync-f1/sync-news).
 * Triggered by a Railway scheduler, NOT a vercel.json cron entry (Vercel
 * Hobby-plan crons are limited to once/day; this needs 5-10min granularity).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { CURRENT_SEASON, type CalendarRace } from '@/lib/f1Calendar';
import { fetchCalendar } from '@/lib/f1/sources/jolpica';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendExpoPushNotifications } from '@/lib/push/sendExpoPush';
import type { ExpoPushMessage } from 'expo-server-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NOTIFY_WINDOW_MS = 30 * 60 * 1000;
const NOTIFY_WINDOW_TOLERANCE_MS = 5 * 60 * 1000;
const MIN_TRIGGER_INTERVAL_MS = 60_000;

type SessionType = 'qualifying' | 'sprint' | 'race';

interface UpcomingSession {
  round: number;
  sessionType: SessionType;
  startMs: number;
  raceName: string;
}

function findUpcomingSessions(races: CalendarRace[], now: number): UpcomingSession[] {
  const out: UpcomingSession[] = [];
  for (const race of races) {
    const round = Number(race.round);
    if (!round) continue;

    const checks: Array<[SessionType, number | null]> = [
      ['qualifying', race.Qualifying?.date
        ? Date.parse(race.Qualifying.time ? `${race.Qualifying.date}T${race.Qualifying.time}` : `${race.Qualifying.date}T12:00:00Z`)
        : null],
      ['sprint', race.Sprint?.date
        ? Date.parse(race.Sprint.time ? `${race.Sprint.date}T${race.Sprint.time}` : `${race.Sprint.date}T12:00:00Z`)
        : null],
      ['race', race.date
        ? Date.parse(race.time ? `${race.date}T${race.time}` : `${race.date}T12:00:00Z`)
        : null],
    ];

    for (const [sessionType, startMs] of checks) {
      if (startMs == null || !Number.isFinite(startMs)) continue;
      const untilStart = startMs - now;
      if (untilStart > 0 && Math.abs(untilStart - NOTIFY_WINDOW_MS) <= NOTIFY_WINDOW_TOLERANCE_MS) {
        out.push({ round, sessionType, startMs, raceName: race.raceName ?? `Round ${round}` });
      }
    }
  }
  return out;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isCronTriggerAllowed('notify-sessions', MIN_TRIGGER_INTERVAL_MS)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const now = Date.now();
  const calendarData = await fetchCalendar(CURRENT_SEASON);
  const races = (
    (calendarData.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable?.Races ?? []
  );

  const upcoming = findUpcomingSessions(races, now);
  if (upcoming.length === 0) {
    return NextResponse.json({ notified: 0, reason: 'no sessions in window' });
  }

  const db = getSupabaseAdmin();
  let notifiedCount = 0;

  for (const session of upcoming) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: already } = await (db.from('notified_sessions') as any)
      .select('id')
      .eq('season', CURRENT_SEASON)
      .eq('round', session.round)
      .eq('session_type', session.sessionType)
      .maybeSingle();
    if (already) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subs } = await (db.from('push_subscriptions') as any)
      .select('token, preferences')
      .not('token', 'is', null);

    const targets = (subs ?? []).filter(
      (s: { preferences: Record<string, boolean> }) => s.preferences?.[session.sessionType] === true,
    );

    if (targets.length > 0) {
      const messages: ExpoPushMessage[] = targets.map((s: { token: string }) => ({
        to: s.token,
        sound: 'default',
        title: `${session.raceName} — ${session.sessionType.toUpperCase()} in 30 minutes`,
        body: 'Session starts soon. Tap to open Apex.',
        data: { round: session.round, sessionType: session.sessionType },
      }));
      await sendExpoPushNotifications(messages);
      notifiedCount += messages.length;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.from('notified_sessions') as any).insert({
      season: CURRENT_SEASON,
      round: session.round,
      session_type: session.sessionType,
    });
  }

  return NextResponse.json({ sessionsChecked: upcoming.length, notified: notifiedCount });
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/notify-sessions/route.ts lib/push/sendExpoPush.ts
git commit -m "feat: /api/cron/notify-sessions — seans başlangıcından 30dk önce push bildirimi (qualifying/sprint/race)"
```

---

### Task D3: Hook championship-leader-change detection into `sync-f1`

**Files:**
- Modify: `app/api/cron/sync-f1/route.ts:83-95`

**Interfaces:**
- Consumes: `sendExpoPushNotifications` (from Task D2's `lib/push/sendExpoPush.ts`).

**Critical constraint (verified):** `upsertF1Snapshot` for season-level rows (`round === null`, which includes `standings_drivers`/`standings_constructors`) does an **update-in-place** on the existing row (`app/api/cron/sync-f1/route.ts` → `lib/f1Ingest.ts:96-116`) — there is no history table. This means the *previous* leader must be read **before** `ingestSeasonSnapshot` overwrites the row in the same cron run, not looked up afterward (by then it's gone).

- [ ] **Step 1: Read the previous leader before ingesting the new snapshot**

Current (`app/api/cron/sync-f1/route.ts:83-95`):
```ts
// 4) Standings — refresh when any race results window has passed
const refreshStandings = scope === 'season' || shouldFetchStandings(races, now);
if (refreshStandings) {
  const driverSt = await fetchDriverStandings(CURRENT_SEASON);
  if (hasDriverStandings(driverSt)) {
    await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
  }

  const constrSt = await fetchConstructorStandings(CURRENT_SEASON);
  if (hasConstructorStandings(constrSt)) {
    await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
  }
}
```
Replace with:
```ts
// 4) Standings — refresh when any race results window has passed
const refreshStandings = scope === 'season' || shouldFetchStandings(races, now);
if (refreshStandings) {
  const db = getSupabaseAdmin();

  // Read the CURRENT (about-to-be-overwritten) leader before ingesting the
  // new snapshot — upsertF1Snapshot updates season-level rows in place, so
  // there is no history to look back on after the write.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prevDriverRow } = await (db.from('f1_snapshots') as any)
    .select('data')
    .eq('season', CURRENT_SEASON)
    .is('round', null)
    .eq('type', 'standings_drivers')
    .maybeSingle();
  const prevDriverLeaderId = extractDriverLeaderId(prevDriverRow?.data ?? null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prevConstrRow } = await (db.from('f1_snapshots') as any)
    .select('data')
    .eq('season', CURRENT_SEASON)
    .is('round', null)
    .eq('type', 'standings_constructors')
    .maybeSingle();
  const prevConstrLeaderId = extractConstructorLeaderId(prevConstrRow?.data ?? null);

  const driverSt = await fetchDriverStandings(CURRENT_SEASON);
  if (hasDriverStandings(driverSt)) {
    await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
    const newDriverLeaderId = extractDriverLeaderId(driverSt as unknown);
    if (prevDriverLeaderId && newDriverLeaderId && prevDriverLeaderId !== newDriverLeaderId) {
      await notifyLeaderChange('driver', driverSt as unknown);
    }
  }

  const constrSt = await fetchConstructorStandings(CURRENT_SEASON);
  if (hasConstructorStandings(constrSt)) {
    await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
    const newConstrLeaderId = extractConstructorLeaderId(constrSt as unknown);
    if (prevConstrLeaderId && newConstrLeaderId && prevConstrLeaderId !== newConstrLeaderId) {
      await notifyLeaderChange('constructor', constrSt as unknown);
    }
  }
}
```

- [ ] **Step 2: Add the leader-extraction and notify helpers**

At the top of `app/api/cron/sync-f1/route.ts`, add to the imports:
```ts
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendExpoPushNotifications } from '@/lib/push/sendExpoPush';
import type { ExpoPushMessage } from 'expo-server-sdk';
```

Below the existing helper functions (near `authError()`), add:
```ts
interface DriverStandingRow {
  Driver?: { driverId?: string; familyName?: string };
}
interface ConstructorStandingRow {
  Constructor?: { constructorId?: string; name?: string };
}

function extractDriverLeaderId(data: unknown): string | null {
  const list = (data as {
    MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: DriverStandingRow[] }> } };
  })?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
  return list?.[0]?.Driver?.driverId ?? null;
}

function extractConstructorLeaderId(data: unknown): string | null {
  const list = (data as {
    MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: ConstructorStandingRow[] }> } };
  })?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
  return list?.[0]?.Constructor?.constructorId ?? null;
}

async function notifyLeaderChange(kind: 'driver' | 'constructor', data: unknown): Promise<void> {
  const db = getSupabaseAdmin();
  const leaderName =
    kind === 'driver'
      ? (data as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: DriverStandingRow[] }> } } })
          ?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]?.Driver?.familyName
      : (data as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: ConstructorStandingRow[] }> } } })
          ?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0]?.Constructor?.name;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (db.from('push_subscriptions') as any)
    .select('token, preferences')
    .not('token', 'is', null);

  const targets = (subs ?? []).filter(
    (s: { preferences: Record<string, boolean> }) => s.preferences?.standings === true,
  );
  if (targets.length === 0) return;

  const messages: ExpoPushMessage[] = targets.map((s: { token: string }) => ({
    to: s.token,
    sound: 'default',
    title: kind === 'driver' ? 'New championship leader' : 'New constructors’ leader',
    body: leaderName ? `${leaderName} now leads the ${kind === 'driver' ? 'drivers’' : 'constructors’'} championship.` : 'The championship lead has changed.',
    data: { kind },
  }));
  await sendExpoPushNotifications(messages);
}
```

- [ ] **Step 3: Add `standings` as a mobile notification preference**

Current (`mobile/lib/notifications.ts:9`):
```ts
export const SESSION_TYPES = ['fp1', 'fp2', 'fp3', 'qualifying', 'sprint', 'race'] as const;
```
This constant governs session-start toggles only — `standings` is a distinct preference (leader-change, not session-start), so it should not be added to `SESSION_TYPES`. Instead, add it as a separate toggle in the notifications screen.

Current (`mobile/app/notifications.tsx`, the `useState` initializer):
```tsx
const [prefs, setPrefs] = useState<Record<SessionType, boolean>>(
  SESSION_TYPES.reduce((acc, t) => ({ ...acc, [t]: t === 'qualifying' || t === 'sprint' || t === 'race' }), {} as Record<SessionType, boolean>)
);
```
Replace with a prefs shape that includes `standings` alongside `SessionType`:
```tsx
type NotificationPrefs = Record<SessionType, boolean> & { standings: boolean };

const [prefs, setPrefs] = useState<NotificationPrefs>({
  ...SESSION_TYPES.reduce((acc, t) => ({ ...acc, [t]: t === 'qualifying' || t === 'sprint' || t === 'race' }), {} as Record<SessionType, boolean>),
  standings: true,
});
```

Add a toggle row for it below the `SESSION_TYPES.map(...)` block in the same screen, following the exact same `View`/`Switch` pattern already used for session rows, labeled `"Championship lead changes"`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (web), `cd mobile && npx tsc --noEmit` (mobile).
Expected: both clean.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/sync-f1/route.ts
git commit -m "feat: sync-f1 artık şampiyonluk lideri değiştiğinde push bildirimi gönderiyor"
cd mobile
git add app/notifications.tsx
git commit -m "feat: bildirim tercihlerine 'şampiyonluk lideri değişti' tercihi eklendi"
```

---

### Task D4: Flag Railway cron setup to the user (approval gate — do not implement autonomously)

**Files:** none — this task is a stop-and-notify checkpoint, not a code change.

**Context:** per the spec's explicit approval gate and the user's own question ("cron vercel'e mi railway'e mi eklenecek?"), the scheduler that calls `/api/cron/notify-sessions` every 5-10 minutes belongs on Railway, following the existing `railway/apex-sync-f1-cron/` pattern — NOT a new `vercel.json` line. This is production infrastructure configuration outside the repo's own version control (a Railway service/cron setting), so it needs a explicit heads-up before being touched, per root `CLAUDE.md`'s Bölüm 7 security-gate rule ("Canlı/production deploy ... önce mutlaka onay alırım").

- [ ] **Step 1: Inspect the existing Railway cron script for the pattern to mirror**

Run: `find railway/apex-sync-f1-cron -type f`
Read whatever script/config is there (likely a small Node/shell script that curls the Vercel endpoint with the `CRON_SECRET` bearer token on a schedule) to confirm the exact pattern used for `sync-f1`'s trigger.

- [ ] **Step 2: Report to the user before making any Railway change**

Do not run `railway` CLI commands, do not create a new Railway service/cron, and do not modify `railway/apex-sync-f1-cron/` yet. Instead, report back with:
- The exact existing pattern found in Step 1.
- A concrete proposal: either extend the existing script to also curl `/api/cron/notify-sessions` on a tighter interval, or add a second sibling cron script (`railway/apex-notify-sessions-cron/`) mirroring the same structure.
- Wait for explicit go-ahead before touching Railway.

This task's deliverable is the report itself — implementation of whichever option the user picks happens as a fast follow-up once approved, not inside this plan's automated task list.

---

## Self-Review Notes (for whoever executes this plan)

- **Spec coverage:** all 13 bugs (A1-A9, A10 covers the two that verification showed are already-correct), Grid/Season split (B1), track maps (C1-C2), and push notifications (D1-D4) are covered. Season archive, shareable cards, and the home-screen widget remain explicitly out of scope per the approved spec.
- **Platform-correction note:** during planning, direct code verification showed a few of the originally-reported "mobile" bugs (word-truncation, badge/image contrast) actually apply more precisely once you look at the shared `data/stories/content.ts` and both platforms' `StoryCard` components — Tasks A3/A4 fix both platforms rather than mobile-only, since the underlying data and component pattern are shared or mirrored.
- **The anthology image bug turned out to be systemic** (15 of 17 stories, not just the one reported) — Task A2 fixes all of them in one pass rather than just the reported example, per the user's own "bu tarz hataları" (errors of this kind) instruction to catch the whole class, not just the one instance.
- **Type consistency check:** `NotificationPrefs` in Task D3 Step 3 extends the existing `Record<SessionType, boolean>` rather than replacing it, so `loadPrefs`/`savePrefs` in `mobile/lib/notifications.ts` continue to round-trip correctly through `AsyncStorage` — verify `registerForPushNotifications`'s parameter type is loosened from `Record<SessionType, boolean>` to `Record<string, boolean>` or `NotificationPrefs` if `notifications.tsx` now passes the wider shape; check this at implementation time and adjust `mobile/lib/notifications.ts`'s signature if `tsc` flags a mismatch.
