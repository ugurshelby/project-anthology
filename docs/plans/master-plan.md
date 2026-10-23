# Apex — Master Plan

> Tek canlı iş listesi. Yalnızca açık (`[ ]`), kısmi (`[~]`) ve rafta (`[⏸]`) maddeler burada; biten madde ölçülüp commit edilince silinir (git geçmişi arşivdir).
> Kurallar: `AGENTS.md` ("Two-session workflow", "Migration safety"). Model/effort: `docs/workflow/model-effort.md`. Vizyon: `docs/vision/apex-vision.md`. Aktif oturum dilimleri: `docs/workflow/PLAN.md`.
> Canlı host: https://project-anthology-eight.vercel.app · Son denetim: 2026-10-20 (Opus 5.5, Architect).

## Kurallar (bu plan için)

1. **Bir faz = bir oturum = bir model.** Her faz `Run:` ve `Owner:` taşır; adım yalnızca farklıysa kendi `Run:` satırını taşır.
2. **Owner değerleri:** `Opus` (Architect), `Opus 5.5` (sahip şartıyla uygulayan oturum, Faz 13/14), `Sonnet`, `Haiku` (yalnızca tam tarif edilmiş mekanik adım), `Antigravity` (commit yetkisi yok), `owner`.
3. **Model şartı (sahip kararı, korunur):** Faz 13 ve Faz 14 **Claude Opus 5.5** ile icra edilir; effort tablodan seçilir.
4. **Yarış haftası kod dondurma:** 2026-10-23 00:00 → 2026-10-26 12:00 (TR) arasında `main`'e kod push'u yok; yalnızca `logs/`, `docs/` ve plan işaretleri.
5. **Sahip adımları** sahip "proje hazır" diyene kadar bekler (Faz 16); ajanlar kritik blokaj yoksa talep etmez. Sahibin elle işi en aza indirilir: ajanın yapabildiği her şeyi ajan yapar.
6. **Paralel çalışma:** aynı dalgadaki oturumların dosya listeleri çakışmaz. `npm install` yapan oturum (14.2) tek başına koşar (paylaşılan `node_modules`).
7. **Migration:** bu planda migration gerektiren adım yok. 13.2 tasarımı migration getirirse o adım **Opus / xhigh migration denetimi** (AGENTS "Migration safety") ister ve ayrı adım olarak eklenir.

## Ölçülmüş durum (2026-10-20)

| Konu | Ölçüm | Kaynak |
|---|---|---|
| Test dosyası | 73 `tests/*.test.*` | dosya sayımı; tam `npm test` bu denetimde koşulmadı |
| CI | `ci.yml` son koşu 2026-10-02 (PR); `main` push'unda tetiklenmiyor, `wip/**` tetikleyicisi hiç koşmadı | `gh run list --workflow ci.yml` |
| QStash (eu) | 4 zamanlama: `sync-f1` `*/30`, `sync-news` `11 *`, `sync-media` `41 *` (SUCCESS) + `notify-sessions` `*/10` (`scd_6H9JdCRnRKTPCoRhnG5owiiFF2UN`, 2026-10-20 MCP ile açıldı). Hepsi MCP varsayılanı `retries: 3`; kod `retries` 0/1 ve notify için `*/5` diyor (sapma, 1.8) | Upstash MCP `qstash_list_schedules`; `lib/cron/qstashSchedules.ts` |
| GitHub `schedule:` | 4 workflow hâlâ zamanlı: `sync-f1-race-aware`, `sync-news`, `sync-media`, `notify-sessions` | `.github/workflows/*.yml` |
| Rate limit | 10 genel rotadan 2'si `applyRateLimit` kullanıyor; 7'si `clientIP !== 'unknown'` (hiç eşleşmeyen) eski korumayla tam kotada; `push/register` `fallback:unknown` için limiti **atlıyor** | `grep` `app/api` |
| Bağımlılık | `npm audit`: 23 (3 critical, 14 high). `next` 16.2.7 → 16.4.2 (minor), `vitest` 3 → 5 (major, tinypool), `sharp` 0.34 → 0.35 (major); `eslint-config-next` için önerilen "fix" 14.2.35'e düşürme (yanlış, uygulanmaz) | `npm audit --json` |
| Haber | `/api/news` her önbellek ıskasında 5 RSS + görsel HEAD taraması; tek tüketicisi `lib/data/news.ts` adım 2 (sunucu içi geri düşüş) | `app/api/news/route.ts`, `lib/data/news.ts:241` |
| LLM zinciri | Kod sırası **Groq → Gemini** (`lib/news/rewrite.ts:131`); dosya başı yorumu "Gemini → Groq" diyor | `lib/news/rewrite.ts:4,131` |
| Hikâye görselleri | 56 dosya; manifest 59 satır: 2 `sourced`, 57 `unverified` | `public/stories`, `data/stories/image-credits.ts` |
| Yasal adresler | `apexstats.example` 10 yerde (`messages/en.json`, `messages/tr.json`) | `grep` |
| SEO | `GOOGLE_SITE_VERIFICATION` meta bağlı; JSON-LD tipleri: WebSite, Person, SportsTeam, SportsEvent, Article, Organization, Place, Vehicle | `app/[locale]/layout.tsx:45` |
| Sentry | Kod hazır, DSN yokken hiçbir şey yüklenmiyor (`sendDefaultPii: false`) | `lib/monitoring/clientErrors.ts`, `tests/client-errors.test.ts` |
| Pist telemetrisi | FastF1 / hız tuzağı / sektör sınırı verisi kodda **yok**; yalnızca `data/circuits/{facts,topography,lore}.ts` | `grep` |
| Ekran görüntüleri | 16 sayfa × 6 görüntü (`npm run screenshots`), `screenshots/` gitignored | `screenshots/` |
| Migration | Canlı 10/10 sürüm repo ile eşleşiyor | `list_migrations` |
| Loglar | 15 günden eski 5 dosya duruyor (2026-09-28 … 2026-10-03) | `logs/` |

**Kritik kısıt:** zaman ve sezon yalnızca `lib/f1Calendar.ts`; sezon/pilot/takım listesi hardcode yasak.

---

## Faz 0 — Bakım

### [x] 0.1 Eski logları sil
- Run: Haiku / low — tek komut, karar yok
- Owner: Haiku · Depends on: — · Dalga 1
- Dosyalar: `logs/2026-09-28.md`, `logs/2026-09-29.md`, `logs/2026-10-01.md`, `logs/2026-10-02.md`, `logs/2026-10-03.md` (silinir; başka dosyaya dokunma)
- Değişiklik: `git rm` bu 5 dosya. Commit: `chore(logs): drop logs older than 15 days`.
- Doğrulama: `ls logs` → en eski dosya `2026-10-05.md`; `git status --short` yalnızca bu 5 silmeyi gösterir.

---

## Faz 1 — R18 ABD GP canlı doğrulama (2026-10-23 … 25)

### [x] 1.0 Doğrulama rehberini R18'e güncelle
- Run: Sonnet / medium — yargı isteyen doküman güncellemesi
- Owner: Sonnet · Depends on: — · Dalga 1 · Bitiş: 2026-10-22
- Dosyalar: `docs/reference/yaris-hafta-sonu-dogrulama.md` (yalnızca bu)
- Değişiklik:
  1. "R17 için zaman çizelgesi" bölümünü R18 için yeniden yaz: pencereleri `lib/f1Calendar.ts` ve `app/api/cron/sync-f1/route.ts` (`isRoundInLiveScope`) ile `app/api/cron/notify-sessions/route.ts`'nin hesapladığı biçimde, UTC ve TR saatiyle.
  2. §2b "Zamanlayıcı gerçeği"ni 2026-10-20 ölçümüyle değiştir: QStash 3 zamanlama (sync-f1 `*/30`, sync-news `11 *`, sync-media `41 *`), notify-sessions yalnızca GitHub `*/10`; GitHub zamanlamaları R18 boyunca yedek olarak kalır.
  3. §3.A'nın ilk adımı: ham OpenF1 `curl -s -i "https://api.openf1.org/v1/sessions?session_key=latest"`; 401 ise "kilitli" ölçütü (abonelik yok, sahip kararı 2026-10-20).
  4. §4 sonuç tablosuna R18 sütunu ekle; `Last verified: 2026-10-2x` satırını güncelle.
- Doğrulama: `grep -n "R18" docs/reference/yaris-hafta-sonu-dogrulama.md` ≥ 4 satır; `grep -c "R17 için zaman çizelgesi"` = 0.

### [~] 1.1, 1.3, 1.4, 1.7 Canlı hafta sonu ölçümleri (tek oturum)
- Run: Sonnet / high — canlı yarış hata ayıklama, kenar durumları
- Owner: Sonnet · Depends on: 1.0 · Dalga 2 (kod dondurma içinde; kod değişikliği yok, bulgular `OPEN.md`'ye `To: Opus`)
- Dosyalar: `logs/2026-10-23.md`, `logs/2026-10-24.md`, `logs/2026-10-25.md`, `docs/reference/yaris-hafta-sonu-dogrulama.md` §4, bu dosyada Faz 1 kutuları
- Adımlar (rehber §3):
  - **1.1** Canlı zamanlama (§3.A): Quali 10-24 ve yarış 10-25 sırasında `/api/live-timing` yanıtı, `Cache-Control`, `X-Vercel-Cache`, tracker davranışı.
  - **1.3** Snapshot/idempotency (§3.B, B0): yarış sonrası ilk `sync-f1` (QStash, ≤30 dk) yanıtında `provisional.status`, `f1_snapshots` satırları (read-only `supabase` MCP), ikinci koşuda `upserted` artmaz.
  - **1.4** Push penceresi (§3.C) — Run: Sonnet / medium: Quali ve yarıştan ~30 dk önce `notified_sessions` kaydı (read-only SQL).
  - **1.7** OpenF1 erişimi (abonelik yok, sahip kararı 2026-10-20): "kilitli" ölçütü — `200 {live:true, restricted:true}` + arayüz metni; yarış bitişinde `provisionalSync` sonucu. 1.9 bir pasif gözlem eklediyse onu da ölçer.
- Doğrulama: her alt madde için log'da komut + sonuç; geçen alt madde silinir, kalan `[~]` ve neyin açık olduğu yazılır.

### [ ] 1.6 GitHub `schedule:` tetikleyicilerini kaldır
- Run: Haiku / low — üç dosyada aynı blok silinir
- Owner: Haiku · Depends on: 1.1-1.7 oturumunun log'unda QStash `sync-f1`'in yarış hafta sonu SUCCESS gösterdiğinin yazılı olması · Dalga 3
- Dosyalar: `.github/workflows/sync-f1-race-aware.yml`, `.github/workflows/sync-news.yml`, `.github/workflows/sync-media.yml`, `.github/workflows/notify-sessions.yml`
- Değişiklik: her dosyada `on:` altındaki `schedule:` anahtarını ve altındaki `- cron:` satırını sil; `workflow_dispatch:` kalır. Başka satıra dokunma. (QStash 4 rotayı da tetikliyor, 2026-10-20.)
- Doğrulama: `grep -n "schedule:" .github/workflows/sync-*.yml .github/workflows/notify-sessions.yml` → çıktı yok; `grep -c "workflow_dispatch" ` aynı 4 dosyada her biri ≥ 1; her dosya için `npx --yes js-yaml <dosya> >/dev/null` çıkış 0.

### [ ] 1.8 QStash zamanlamalarını koda eşitle (retries ve notify `*/5`)
- Run: Sonnet / medium — betik bayrağı + workflow, ölçülü doğrulama
- Owner: Sonnet (+ owner tek seferlik secret) · Depends on: 14.2 `main`'de (`node_modules` değişimi bitmiş) · Dalga 5 (K'nın `apex-reference.md` değişikliğinden sonra)
- Neden: MCP yalnızca `retries: 3` ile zamanlama açabiliyor; kod 0/1 diyor ve bütçe testi (`tests/qstash-schedules.test.ts`, en kötü durum ≤ %60 kota) buna göre. Bugünkü canlı en kötü durum 960/1000 mesaj/gün.
- Dosyalar: `scripts/qstash-sync.ts`, yeni `lib/cron/qstashPrune.ts`, yeni `tests/qstash-prune.test.ts`, yeni `.github/workflows/qstash-sync.yml`, `docs/reference/apex-reference.md` (zamanlayıcı bölümü)
- Değişiklik:
  1. `lib/cron/qstashPrune.ts`: `export function schedulesToPrune(live: { scheduleId: string; destination: string }[], managed: readonly QStashSchedule[], siteUrl: string): string[]` — hedef URL'si yönetilen bir `path`'e eşit olup kimliği yönetilen `id` olmayan (`scd_…`) zamanlamaların kimlikleri.
  2. `scripts/qstash-sync.ts`: `--prune` bayrağı; önce `apex-*` zamanlamaları uygular, hepsi 2xx dönerse `schedulesToPrune` sonucunu siler; herhangi bir hata → silmeden çıkış 1.
  3. `.github/workflows/qstash-sync.yml`: yalnızca `workflow_dispatch`; `npm ci`, ardından `npm run qstash:sync -- --prune`; env `QSTASH_TOKEN: ${{ secrets.QSTASH_TOKEN }}`, `SITE_URL: ${{ vars.SITE_URL }}`; `permissions: contents: read`.
- Sahip (tek seferlik): repo secret `QSTASH_TOKEN` (Upstash console → QStash → Details).
- Ajan: `gh workflow run qstash-sync.yml`; ardından `qstash_list_schedules` (eu).
- Doğrulama: `npx vitest run tests/qstash-prune.test.ts tests/qstash-schedules.test.ts` yeşil; `npx tsc --noEmit` 0; canlıda tam 4 kayıt, kimlikler `apex-*`, `retries` koddakiyle aynı, `scd_` kalmamış; ilk tetiklemeler SUCCESS.

### [x] 1.9 Ücretsiz canlı veri alternatifi (OpenF1 aboneliği yok)
- Run: Opus / xhigh — mimari + kaynak/kullanım koşulu riski
- Sonuç (2026-10-20, `DECISIONS.md` "1.9 Free live-data alternative"): seans sırasında ücretsiz ve koşullara uygun bir canlı sıralama kaynağı yok. F1 live timing reddedildi (F1 arşivi 2026-10-15'te F1 TV kimliğine kapattı, ölçüldü: `static/2026/Index.json` 401; SignalR kalıcı bağlantı = Vercel dışı çalışma zamanı; yeniden kullanım koşulu yok). Dürüst kilitli mod kalır; kazanım bayraktan sonra: OpenF1 ücretsiz katmanı kilit kalkınca (~30 dk) Sıralama ve Sprint geçici sonuçları (1.10), arayüzde "geçici" etiketi ve veri kaynağı atfı (1.11). R18 gözlemi `PLAN.md` Session F'de.

### [ ] 1.10 OpenF1'den geçici Sıralama ve Sprint sonuçları
- Run: Sonnet / high — veri doğruluğu, çok dosyalı cron adımı, kenar durumlar
- Owner: Sonnet · Depends on: kod dondurmanın bitmesi (2026-10-26) · Dalga 3 (oturum Q)
- Dosyalar: `lib/f1/sources/openf1.ts`, `lib/f1/provisional.ts`, `lib/f1/provisionalSync.ts`, `app/api/cron/sync-f1/route.ts`, `tests/provisional-openf1.test.ts`, `tests/provisional-sync.test.ts`, `docs/reference/apex-reference.md` (sync-f1 yanıt şekli geçiyorsa)
- Değişiklik:
  1. `openf1.ts`: `export async function fetchSessionsOfYear(year: number, sessionName: 'Qualifying' | 'Sprint'): Promise<OpenF1Session[]>` → `openf1Fetch<OpenF1Session>('sessions', { year, session_name: sessionName })`.
  2. `provisional.ts`:
     - `buildProvisionalResults` girdisine `key?: 'Results' | 'SprintResults'` (varsayılan `'Results'`); `Races[0]` içindeki dizi bu anahtarla yazılır.
     - `buildProvisionalResults` ve `buildProvisionalStandings` çıktılarında `MRData.apexProvisional: true` (Jolpica satırlarında bu alan yok; bugünkü tüketiciler okumaz, 1.11 okur).
     - Yeni `export function formatLapTime(seconds: number): string` → `m:ss.SSS` (`86.123` → `"1:26.123"`, `90` → `"1:30.000"`).
     - Yeni `export function buildProvisionalQualifying(input: { season: number; race: CalendarRace; results: OpenF1SessionResult[]; roster: OpenF1Driver[]; ids: IdentityMap }): Json | null`: sürücü numarasına göre tekilleştir; `position` sayı olup `dsq`/`dns` olmayanlar artan sırada, kalanlar sonda; her satır `{ number, position: String(i + 1), Driver, Constructor, Q1?, Q2?, Q3? }`; `duration` dizi ise 0./1./2. eleman sayıysa `formatLapTime` ile Q1/Q2/Q3, tek sayıysa yalnızca Q1, `null` eleman alan yazmaz; `identityFor` null dönen satır atlanır; satır kalmazsa `null`. Sarmalayıcı `buildProvisionalResults` ile aynı (`MRData.RaceTable.Races[0]`), dizi anahtarı `QualifyingResults`, `apexProvisional: true`.
  3. `provisionalSync.ts`:
     - `export type ProvisionalSessionStatus = 'no-session' | 'jolpica-has-data' | 'already-written' | 'session-not-found' | 'session-running' | 'locked' | 'not-published' | 'written' | 'error'`; `export interface ProvisionalSessionOutcome { status: ProvisionalSessionStatus; round: number | null }`.
     - `export async function syncProvisionalSessionFromOpenF1(opts: { kind: 'qualifying' | 'sprint'; races: CalendarRace[]; now: Date; stats: IngestStats }): Promise<ProvisionalSessionOutcome>`. Sıra: (a) takvim seansı `kind === 'qualifying' ? race.Qualifying : race.Sprint`; `sessionStartMs` (`lib/f1Calendar.ts`) ≤ `now` ve `now − start ≤ PROVISIONAL_WINDOW_MS` olan en geç yarış; yoksa `no-session`. (b) `loadRows`; o turun `kind` satırı `jolpica` → `jolpica-has-data`, `openf1` → `already-written` (OpenF1 çağrısı yapılmadan). (c) `fetchSessionsOfYear`; `|date_start − start| < 6 sa` olan oturum yoksa `session-not-found`. (d) `now < date_end + AFTER_SESSION_END_MS` → `session-running`. (e) `fetchSessionResult` boş → `not-published`. (f) `fetchLiveDrivers`; `buildIdentityMap` (`entryLists`: aynı turun `sprint` ve `qualifying` satırları, `round − 1` `results`; `driverStandings`/`constructorStandings`: sezon puan durumu satırları); `qualifying` → `buildProvisionalQualifying`, `sprint` → `buildProvisionalResults({ …, key: 'SprintResults' })`; `null` → `not-published`; aksi hâlde `upsertF1Snapshot(CURRENT_SEASON, round, kind, snapshot, 'openf1')`, `stats.upserted++`, `written`. `catch`: `isOpenF1Restricted` → `locked`; diğer hata `stats.errors`'a `provisional ${kind} R${round}: …`, `error`.
  4. `sync-f1/route.ts` adım 6: mevcut çağrıdan sonra sırayla (paralel değil; OpenF1 3 req/sn) `qualifying` ve `sprint` için çağır; yanıta `provisionalSessions: { qualifying, sprint }` ekle; dosya başındaki "Response shape" yorumunu güncelle.
- Kurallar: yeni zamanlayıcı, migration veya env yok (`qualifying`/`sprint` tipleri ve `source='openf1'` DB'de izinli). Jolpica adımı `isSettled` ile yalnızca `jolpica` satırlarına bakar (`loadSnapshotFetchTimes`), bu yüzden geçici satır Jolpica'yı engellemez ve Jolpica satırı onu ezer.
- Test: `provisional-openf1.test.ts` — `formatLapTime`; Q1/Q2/Q3 eşlemesi (`[86.1, null, null]` yalnızca Q1); DSQ ve `position: null` sonda; sprint `SprintResults` anahtarı; üç builder'da `apexProvisional === true`. `provisional-sync.test.ts` — `jolpica` satırı varken OpenF1 mock'u hiç çağrılmaz; seans sürerken `session-running`; `OpenF1RestrictedError` → `locked`; yazımda `upsertF1Snapshot(…, 'qualifying', …, 'openf1')`; takvimde `Sprint` yoksa `no-session`.
- Doğrulama: `npx vitest run tests/provisional-openf1.test.ts tests/provisional-sync.test.ts tests/sync-f1-idempotent.test.ts` yeşil; `npx tsc --noEmit` 0; `npx eslint lib/f1 app/api/cron/sync-f1` 0; `npm run build` `wip/` üzerinde yeşil. Canlı ilk gözlem R19 Sıralama (2026-10-31 21:00Z): sonraki `sync-f1` yanıtında `provisionalSessions.qualifying.status` ve `f1_snapshots` satırı (read-only), log'a.

### [ ] 1.11 Geçici veri etiketi ve veri kaynağı atfı
- Run: Antigravity (own model) — arayüz ve metin; Claude Code doğrular, commit eder
- Owner: Antigravity · Depends on: 1.10 `main`'de · Dalga 4 (J/K/L/M dosyalarıyla çakışmaz)
- Dosyalar: `components/season/ResultsTable.tsx` (ve sonuç/sıralama/sprint tablosunu çizen bileşen), `components/layout/SiteFooter.tsx`, `messages/tr.json`, `messages/en.json`
- Değişiklik: snapshot `MRData.apexProvisional === true` ise tablo başlığının yanında "Geçici sonuç · OpenF1" / "Provisional · OpenF1" etiketi ve tek cümle açıklama ("Resmî sonuç yayımlanınca güncellenir"). Altbilgiye veri kaynağı satırı: Jolpica F1 ve OpenF1 bağlantıları, "CC BY-NC-SA 4.0". `docs/design/apex-component-rules.md` bağlayıcı.
- Doğrulama: Antigravity log'a yazar ve `[~]` işaretler; Claude Code `npx tsc --noEmit` 0, `npm run lint` 0, `npx vitest related --run <değişen dosyalar>` yeşil; tarayıcıda `apexProvisional` içeren bir tur sayfası (yerel fixture) ve altbilgi görülür.
---

## Faz 7 — Editoryal (Antigravity)

### [x] 7.2 Editoryal inceleme: dönem renkleri ve takım DNA
- Run: Antigravity (own model) — editoryal metin; sahip onaylar
- Owner: Antigravity · Depends on: — · Dalga 1
- Dosyalar: `data/history/liveries.ts`, `data/history/team-dna.ts` (yalnızca bunlar)
- Değişiklik: olgu teyidi ve dil düzeltmesi yapıldı. Günün log'una kaydedildi.
- Doğrulama (Claude Code, 2026-10-21): `npx vitest run tests/editorial-content.test.ts tests/history-palette.test.ts tests/history-career.test.ts` 3 dosya / 171 test geçti; `npx tsc --noEmit` 0; `npx eslint` iki dosya 0.
- Doğrulama (Claude Code): `npx vitest run tests/editorial-content.test.ts` yeşil, `npx tsc --noEmit` 0.

### [⏸] 7.3 Mobil uygulama — rafta (sahip kararı). Gündeme alınmaz.

---

## Faz 8 — Medya ve haber: "kusursuz" kapısı

Sahip tanımı (2026-10-20): tüm görseller eksiksiz ve hızlı yüklenir, placeholder yoktur, fallback güvenlidir, otomatik güncellemeler güvenlidir, yeni kaynak/varlık geldiğinde görsel kendiliğinden temin edilir. Aynı tanım haberler için geçerli. Ölçülebilir karşılığı:

| Kod | Ölçüt (medya: pilot, takım, pist, tur, hikâye; haber: liste + detay) | Ölçüm |
|---|---|---|
| K1 Eksiksiz | Görsel gösteren her varlıkta onaylı/lisans kayıtlı görsel var; haber listesinde görselsiz öğe 0 | read-only SQL sayımı (`media_assets`, `news_stories`) + varlık listesi farkı = 0 |
| K2 Hızlı | 16 temsilci sayfada mobil laboratuvar LCP < 2,5 s, görsel kaynaklı CLS < 0,1; LCP görseli öncelikli | Lighthouse mobil, 16 sayfa |
| K3 Placeholder yok | Canlı 16 sayfada kırık (`naturalWidth = 0`) veya yer tutucu görsel 0 | tarayıcıda DOM taraması |
| K4 Güvenli fallback | Upstream görsel düşünce zincir lisanslı yedeğe iner, yer tutucuya inmez; her kademe testli | birim testleri (çözümleyici, `lib/data/news.ts`) |
| K5 Güvenli otomatik güncelleme | `sync-media` ve `sync-news` 7 gün kesintisiz SUCCESS; otomatik eklenen her görselin lisans kaydı var | QStash günlükleri + SQL |
| K6 Yeni kaynak | Yeni varlık (pilot/takım/sezon) veya yeni RSS kaynağı ≤ 24 saatte görselini alır | fixture'lı test + bir canlı gözlem |

### [ ] 8.0 Kapı denetimi: K1–K6 ölç, eksikleri adımlara çevir
- Run: Opus / xhigh — ölçüt tasarımı ve çok katmanlı plan
- Owner: Opus (Architect; ölçer, kod yazmaz) · Depends on: — · Dalga 3
- Yapar: K1–K6'yı canlıya karşı ölçer (read-only `supabase` MCP, Upstash günlükleri, tarayıcı paneli, Lighthouse); her geçmeyen ölçüt için bu fazda 8.1… adımları tam tarifle yazar (dosya, değişiklik, doğrulama, `Run:`); geçenleri ölçümüyle log'a yazar.
- Dosyalar: bu dosyada Faz 8, `DECISIONS.md`, `logs/<gün>.md`.
- Doğrulama: K1–K6'nın her biri için ölçüm komutu ve sayı log'da; her FAIL için en az bir adım var.

### [⏸] 8.6 Eski sezonlar (1950–2017) medya genişletmesi
- Run: plan Opus / high; uygulama Sonnet / medium
- Owner: Opus → Sonnet · Depends on: Faz 8 kapısı K1–K6 PASS · 9.3 kredisiyle birlikte düşünülür.

---

## Faz 9 — Google Cloud (kredi bitişi 2026-12-16)

Sahip kararları (2026-10-21, `DECISIONS.md` "Faz 9 GCP"): Apex için ayrı GCP projesi; 2026-12-16'ya kadar bu projeye en çok **150 $** kredi (300 $'ın yarısı); kredi bitince Apex'in GCP maliyeti **aylık 5–10 $** (sahibin kartı). Konsol işlerini sahibin tarayıcısındaki Claude in Chrome oturumu yapar; **anahtar değerleri sohbete, log'a, dosyaya yazılmaz**, Vercel'e yalnızca sahip taşır (ajanların Vercel env yetkisi yok). Zincirin son halkası her zaman ücretsiz katman kalır: GCP anahtarı env'den kaldırılınca haber yeniden yazımı AI Studio → Groq ile sürer.

### [ ] 9.0 GCP projesi, faturalandırma, bütçe ve kredi kapsamı
- Run: Claude in Chrome (sahip onaylı konsol oturumu) + owner — konsol işleri; anahtar ve fatura sahibin
- Owner: owner · Depends on: — · Dalga 3 (2026-10-26'dan sonra; repo dosyasına dokunmaz, her oturumla paralel)
- Yapılacaklar (konsol):
  1. Supabase projesinin bölgesini oku (read-only `supabase` MCP veya Supabase paneli); GCP bölgesi ona en yakın AB bölgesi (aday `europe-west1` / `europe-west3`).
  2. Yeni proje (ör. `apex-f1`), faturalandırma hesabına bağla; Billing → Credits: deneme kredisinin kalan tutarı, bitiş tarihi ve **hangi hizmetleri kapsadığı** (Vertex AI, Gemini API ücretli katmanı, Compute Engine, Cloud Run, Vision) ekran okumasıyla log'a.
  3. İki bütçe (yalnızca bu proje): "apex-credit" 150 $ (bitiş 2026-12-16; uyarı %25/50/75/90/100, gerçekleşen + tahmini) ve "apex-monthly" 10 $/ay (uyarı %50/90/100). Bütçe harcamayı durdurmaz; sert sınır API kotalarıdır (madde 4).
  4. API'ler yalnızca gerektikçe açılır. Açılan her AI API'si için Quotas sayfasında günlük ve dakikalık istek üst sınırı (değer 9.4'te ölçülen hacimden; o zamana kadar varsayılan) — Denial of Wallet sınırı (16.8 ile aynı iş).
  5. Kimlik bilgisi: 9.4 kararından önce anahtar üretilmez.
- Doğrulama: log'da proje kimliği, bölge, bağlı faturalandırma, iki bütçe ve eşikleri, kredi kapsamı listesi, açık API listesi; hiçbir anahtar değeri yok.

### [ ] 9.4 GCP hizmet seçimi (Architect)
- Run: Opus / xhigh — maliyet, kapsam ve güvenlik kararı; Architect, kod yazmaz
- Owner: Opus · Depends on: 9.0 · Dalga 3
- Karar verir ve `DECISIONS.md`'ye yazar (her aday için: ne kazandırır, kredi döneminde ve sonrasında aylık maliyet tahmini — fiyat sayfasından, tarihli —, risk, sonra ne olur):
  1. **LLM uç noktası:** Vertex AI (express mode API anahtarı) mı, Apex projesinde faturalandırılan Gemini API anahtarı mı — 9.0'ın ölçtüğü kredi kapsamına göre; env adı; kredi sonrası tahmini aylık maliyet (`sync-news` hacmi × ölçülen token). 5–10 $'ı aşıyorsa 2026-12-16'da GCP anahtarı zincirden çıkar.
  2. **Diğer Google API adayları** (en az): Cloud Vision (medya adaylarında resmî logo / yüz tespiti, AGENTS logo yasağının otomatik kapısı), Cloud Monitoring uptime check, Cloud Run Jobs (8.6 toplu medya çözümlemesi, tek seferlik), Cloud Translation, Imagen (yalnızca `public/stories` dışı deneme, sahip onayı). Reddedilenler gerekçesiyle.
  3. **Uzak geliştirme makinesi** (9.5): yerel ölçümle karar (aşağıdaki ölçüt).
  4. Kredi sonrası tutulacakların listesi ve aylık toplam ≤ 10 $.
- Çıktı: seçilen her iş için bu dosyada tam tarifli adım (dosyalar, env adı, doğrulama); 9.2'nin env adı ve uç noktası.
- Doğrulama: karar girdisinde her aday için maliyet/kazanç/risk satırı; kredi sonrası toplam tahmin satırı.

### [ ] 9.2 LLM zinciri: Gemini (GCP) → Gemini (AI Studio) → Groq
- Run: Sonnet / high — sağlayıcı zinciri, maliyet ve örtüşme korumaları
- Owner: Sonnet · Depends on: 9.4 (uç nokta + env adı), 14.4 (aynı dosya), sahip anahtarı Vercel'e girdi · Dalga 5
- Dosyalar: `lib/news/rewrite.ts`, yeni `tests/news-rewrite-order.test.ts`, `.env.example`
- Değişiklik: `PROVIDERS` sırası Gemini-GCP → Gemini-AI-Studio → Groq; GCP anahtarı için 9.4'ün env adı `.env.example`'a boş değerle; env yoksa sağlayıcı atlanır (zincir bugünkü gibi çalışır); dosya başı yorumu koda uydur. Sıra testi: anahtarlar stub'lanınca ilk çağrılan `gemini-gcp`; GCP anahtarı yokken ilk çağrılan AI Studio.
- Doğrulama: `npx vitest related --run lib/news/rewrite.ts` yeşil; `npx tsc --noEmit` 0; `npx eslint lib/news/rewrite.ts` 0; canlıda ilk `sync-news` sonrası log'da sağlayıcı adı (read-only).

### [ ] 9.5 Uzak geliştirme makinesi (yalnızca ölçüm haklı çıkarırsa)
- Run: Sonnet / medium — ölç, karşılaştır, pilotu yönet · Owner: Sonnet + owner (VM, SSH anahtarı ve güvenlik duvarı sahip onaylı) · Depends on: 9.4 · Dalga 4
- Bugünkü ölçüm (2026-10-21): GitHub CI (ücretsiz, Linux) tüm kapı 129 sn — lint 7, tsc 6, test 7, build 82 sn. Yerel (Windows) bilinen süreler: `vitest run` 35–70 sn, `npm run build` ~4 dk, `npm run lint` ~1 dk. Fark büyük ölçüde Windows dosya sistemi/tarayıcı koruma kaynaklı; tam kapı zaten `wip/` CI'da ücretsiz koşuyor.
- Sıra (ucuzdan pahalıya; bir önceki yeterliyse sonrakine geçilmez):
  1. Yerel tekrar ölçüm: `npx tsc --noEmit`, `npx vitest run`, `npm run lint` süreleri (aynı gün, aynı makine) log'a.
  2. Ücretsiz seçenekler (sahip kararı, güvenlik ayarı olduğu için sahip yapar): depo klasörü için Windows Defender dışlaması veya depoyu WSL2 Linux dosya sistemine taşıma; aynı üç ölçüm.
  3. Hâlâ yavaşsa GCP pilotu: tek Linux VM (8 vCPU sınıfı, Spot tercih), yalnızca IAP üzerinden SSH (genel 22 kapalı), boşta otomatik kapanma, `.env*` yok; Claude Code masaüstü SSH hedefi olarak. Kredi dönemi tahmini ve gerçek saatlik fiyat 9.4'te.
- Kapanış: VM 2026-12-12'ye kadar silinir (disk dahil; kredi sonrası 5–10 $ bütçesine sığmaz) — 9.7.
- Doğrulama: log'da her seçenek için üç komutun süresi; seçilen yol ve gerekçe.

### [ ] 9.3 Kredi dönemi tek seferlik işler (2026-12-12'ye kadar)
- Run: Sonnet / medium — tek seferlik betikler, harcama sahip onaylı
- Owner: Sonnet · Depends on: 9.0, 9.4, sahip onayı · Dalga 5 (Kasım başı hatırlatma)
- 9.4'ün seçtikleri: 8.6 toplu medya çözümlemesi (Cloud Run Jobs), Cloud Monitoring uptime check, Vision ile mevcut medya kayıtlarının logo/yüz taraması (rapor; silme sahip kararı). AI görsel/ikon denemesi `public/stories`'e giremez (AGENTS). 15.1 ekran görüntüsü denetiminin sahip koşusu kredili anahtarla yapılabilir.

### [ ] 9.7 Kredi bitişi kapanışı (2026-12-10 → 2026-12-12)
- Run: Claude in Chrome (sahip onaylı) + Sonnet / medium — envanter, silme, ölçüm
- Owner: owner · Depends on: — (sabit tarih) · Dalga: takvim
- Yapılacaklar: projedeki tüm kaynakların envanteri (Compute VM/disk/imaj, Cloud Run, Artifact Registry, Storage, açık API'ler, anahtarlar); 9.4 "tutulacaklar" listesinde olmayan her şey silinir; Billing raporunda son 30 günün maliyeti ve kredi sonrası günlük tahmin; tahmin 10 $/ay'ı aşarsa GCP anahtarı Vercel'den sahipçe kaldırılır (zincir ücretsiz katmana düşer).
- Doğrulama: log'da envanter öncesi/sonrası, kalan kaynaklar, 2026-12-17'den sonraki ilk hafta Billing raporu (≤ 2,5 $/hafta).

### [⏸] 9.1 Vercel + GCP hibrit (Cloud Run Jobs)
- Run: Opus / xhigh — mimari, yalnızca ihtiyaç doğarsa · Owner: Opus · Tetik: bir cron 300 sn sınırını ölçülerek aşarsa.

---

## Faz 13 — İleri pist telemetrisi (Claude Opus 5.5 şartı)

### [x] 13.1 Tasarım: hangi veri, hangi kaynak, nasıl taşınır
- Run: Opus 5.5 / xhigh — sahip şartı; veri doğruluğu ve mimari
- Sonuç (2026-10-21, `DECISIONS.md` "13.1 Track telemetry"): her güncel takvim pisti için tek ölçülmüş referans tur = oradaki en son tamamlanmış Sıralamanın resmî pole turu (2023+), OpenF1 ücretsiz geçmiş API'sinden. Node/TS betiği → pist başına statik JSON (`data/circuits/telemetry/`), git'te; tablo, migration, cron yok (13.3 migration denetimi gerekmez). FastF1/Python yok (F1 arşivi 2026-10-15'ten beri F1 TV kimliği istiyor). Ölçüm (Monza 2026 Q, oturum 11357): pole turu Jolpica ile birebir (GAS 1:21.786), 306 örnek / 81,3 sn, entegre tur uzunluğu resmîden +%0,9, 2026'da `drs` hep `null`.

### [ ] 13.2 Telemetri veri katmanı, betik ve testler
- Run: Opus 5.5 / high — sahip şartı (Builder); tarifi kesin veri kodu, kenar durumlar
- Owner: Opus 5.5 (Builder) · Depends on: 14.2 `main`'de (`vitest` sürümü) · Dalga 4 (oturum M; J/K/L dosyalarıyla çakışmaz)
- Dosyalar: yeni `lib/telemetry/types.ts`, yeni `lib/telemetry/derive.ts`, yeni `lib/telemetry/select.ts`, yeni `lib/data/circuitTelemetry.ts`, yeni `scripts/build-circuit-telemetry.ts`, yeni `data/circuits/telemetry/index.ts` (betik üretir; ilk sürüm boş harita), yeni `tests/telemetry-derive.test.ts`, yeni `tests/circuit-telemetry-data.test.ts`
- Değişiklik:
  1. `lib/telemetry/types.ts`:
     - `export type TelemetrySample = readonly [tMs: number, dM: number, kmh: number, gear: number, throttle: number, brake: 0 | 1, x: number, y: number]` — `tMs` turun başından, `dM` tamsayı metre, `throttle` 0–100, `x`/`y` 0–1000 kutusunda SVG yönünde (y aşağı).
     - `export interface TelemetrySource { provider: 'OpenF1'; license: 'CC BY-NC-SA 4.0'; url: 'https://openf1.org'; year: number; round: number; raceName: string; session: 'Qualifying'; sessionKey: number; meetingKey: number; driverNumber: number; driverId: string; driverCode: string; lapNumber: number; lapTime: string; lapDurationMs: number; fetchedAt: string }`
     - `export interface LapMetrics { lapLengthM: number; topSpeedKmh: number; minSpeedKmh: number; fullThrottlePct: number; brakingPct: number; gearShiftSteps: number }`
     - `export interface SlowPoint { dM: number; kmh: number; gear: number; x: number; y: number }`
     - `export interface SafetyCarHistory { years: number[]; races: number; withSafetyCar: number; withVsc: number }`
     - `export interface CircuitTelemetry { version: 1; circuitId: string; source: TelemetrySource; sectors: { s1Ms: number; s2Ms: number; s3Ms: number; boundariesM: [number, number] }; speedTraps: { i1Kmh: number | null; i2Kmh: number | null; stKmh: number | null }; metrics: LapMetrics; slowPoints: SlowPoint[]; safetyCar: SafetyCarHistory | null; samples: TelemetrySample[] }`
     - `export function isCircuitTelemetry(v: unknown): v is CircuitTelemetry` — alanların varlığı ve tipleri; `samples` her eleman 8 sayılık dizi.
  2. `lib/telemetry/derive.ts` (saf, G/Ç yok):
     - `export interface RawCarSample { date: string; speed: number; n_gear: number; throttle: number; brake: number }`; `export interface RawLocation { date: string; x: number; y: number }`.
     - `export function parseLapTime(s: string): number` — `"1:21.786"` → `81786` (ms); `"58.123"` → `58123`.
     - `export function normaliseTrace(points: { x: number; y: number }[], box = 1000): { x: number; y: number }[]` — tek ölçek (büyük kenar = `box`), y ters çevrilir, kısa eksende ortalanır, tamsayı.
     - `export function buildSamples(car: RawCarSample[], loc: RawLocation[], lapStartIso: string): TelemetrySample[]` — tarihe göre sıralar; `tMs` = tarih − tur başı (yuvarlanır); `dM` = hız (km/h → m/s) üzerinden yamuk entegrasyon, kümülatif kayan nokta, kayıtta yuvarlanır; `throttle` 0–100'e, `gear` 0–8'e kırpılır; `brake` = `brake > 0 ? 1 : 0`; `x`/`y` zamanca en yakın `loc` örneğinden, sonra `normaliseTrace`.
     - `export function lapMetrics(samples: readonly TelemetrySample[]): LapMetrics` — `lapLengthM` son `dM`; hız en büyük/en küçük; `fullThrottlePct` = başlangıç örneğinde `throttle ≥ 98` olan aralıkların süre payı (1 ondalık); `brakingPct` aynı yöntemle `brake = 1`; `gearShiftSteps` = ardışık örneklerde iki vites de ≥ 1 iken `Σ|Δgear|`.
     - `export function sectorBoundaries(samples: readonly TelemetrySample[], s1Ms: number, s2Ms: number): [number, number]` — `tMs = s1Ms` ve `s1Ms + s2Ms` anlarındaki `dM`, iki örnek arasında doğrusal ara değer, tamsayı.
     - `export function slowPoints(samples: readonly TelemetrySample[], minRiseKmh = 25): SlowPoint[]` — örnek i, sol ve sağda hızın `kmh_i + minRiseKmh`'e ulaştığı en yakın örnekler arasındaki en küçük hızsa (eşitlikte ilk indeks) yavaş noktadır; bir tarafta bu yükselme yoksa (tur kenarı) sayılmaz; `dM`'ye göre sıralı.
     - `export function safetyCarFlags(rows: { category: string | null; message: string | null }[]): { safetyCar: boolean; vsc: boolean }` — `category === 'SafetyCar'` ve mesaj `SAFETY CAR DEPLOYED` ile başlıyorsa `safetyCar`; `VSC DEPLOYED` veya `VIRTUAL SAFETY CAR DEPLOYED` ile başlıyorsa `vsc`.
  3. `lib/telemetry/select.ts` (saf):
     - `export function matchSessionByStart<T extends { date_start: string; is_cancelled?: boolean }>(sessions: T[], startMs: number, toleranceMs = 6 * 3_600_000): T | null` — iptal olmayan, başlangıcı toleransta olan en yakın oturum.
     - `export function pickPoleLap<T extends { driver_number: number; lap_duration: number | null; is_pit_out_lap: boolean }>(laps: T[], carNumber: number, poleTimeMs: number): T | null` — o arabanın, `|lap_duration × 1000 − poleTimeMs| ≤ 1.5` olan, pit çıkışı olmayan turu; birden çoksa en küçük farklı.
  4. `lib/data/circuitTelemetry.ts`: `export const getCircuitTelemetry = cache(async function getCircuitTelemetry(circuitId: string): Promise<CircuitTelemetry | null>)` — `TELEMETRY_LOADERS`'ta kendi anahtarı (`Object.hasOwn`) yoksa `null`; yükler, `isCircuitTelemetry` değilse `console.warn(`[circuitTelemetry] invalid file ${circuitId}`)` ve `null`. Yalnızca sunucu bileşenlerinden çağrılır (React `cache`).
  5. `scripts/build-circuit-telemetry.ts` (`npx tsx`; env okumaz, `.env*` yüklemez; `package.json`'a dokunulmaz):
     - Bayraklar: `--circuit <circuitId>` (tek pist), `--dry-run` (yalnızca takvim + oturum listeleri; hangi pist hangi yıl/oturum/pole eşleşir, tablo yazar, dosya yazmaz).
     - HTTP: kendi `getJson(url)`; OpenF1 çağrıları arasında ≥ 2.500 ms, Jolpica ≥ 500 ms; 429/≥ 500 → en çok 3 yeniden deneme (1, 2, 4 sn); OpenF1 401 → "OpenF1 canlı seans kilidi: seans penceresi dışında çalıştırın" yazar, o ana kadar yazılanları korur, çıkış 2. `User-Agent: project-anthology/1.0`. Tarih süzgeci sorgu dizesine olduğu gibi yazılır (`date>=…&date<…`).
     - Akış: pist kümesi = `CURRENT_SEASON` (`lib/f1Calendar.ts`) Jolpica takviminin `Circuit.circuitId`'leri. `Y = CURRENT_SEASON … 2023` için Jolpica `/{Y}.json` ve OpenF1 `sessions?year=Y&session_name=Qualifying` / `Race`. Her pist için en yeni Y: o pistteki yarışın `Qualifying` başlangıcı + 2 sa < şimdi ve `matchSessionByStart` eşleşmesi var. Jolpica `/{Y}/{round}/qualifying.json` 1. sıra: `number`, `Driver.driverId`, `Driver.code`, süre = `Q3 ?? Q2 ?? Q1` (`parseLapTime`). OpenF1 `laps?session_key=…&driver_number=…` → `pickPoleLap`; yoksa pist "pole turu bulunamadı" ile atlanır. `car_data` ve `location`: `date >= date_start` ve `< date_start + lap_duration + 0.5 sn`; < 100 örnek → atlanır. `buildSamples`, `lapMetrics`, `sectorBoundaries(duration_sector_1, duration_sector_2)`, `slowPoints`, hız tuzakları `i1_speed`/`i2_speed`/`st_speed`.
     - Güvenlik aracı geçmişi: 2023 … `CURRENT_SEASON` içinde o pistteki her yarış (başlangıç + 3 sa < şimdi, OpenF1 `Race` eşleşmesi var): `race_control?session_key=…` → `safetyCarFlags`; hiç yarış yoksa `safetyCar: null`.
     - Yazım: başarıda `data/circuits/telemetry/<circuitId>.json` = `JSON.stringify(data) + '\n'`; sonra klasördeki `*.json`'lardan `index.ts` yeniden üretilir: başlık yorumu "Generated by scripts/build-circuit-telemetry.ts — do not edit.", `export const TELEMETRY_LOADERS: Readonly<Record<string, () => Promise<unknown>>> = { <id>: () => import('./<id>.json').then((m) => m.default), … }` (alfabetik).
     - Özet tablo: pist, yıl, sürücü, tur süresi, örnek sayısı, tur uzunluğu ve `CIRCUIT_FACTS[id].lengthKm`'ye göre %, durum/atlama nedeni. ≥ 1 dosya yazıldıysa çıkış 0, hiç yoksa 1.
  6. `data/circuits/telemetry/index.ts` ilk sürüm: aynı başlık, boş harita `{}`.
- Test:
  - `tests/telemetry-derive.test.ts` (sentetik girdi): `parseLapTime` iki biçim; sabit 360 km/h × 10 sn → `dM` son değer 1000; `throttle` 104 → 100, `brake` 104 → 1; `fullThrottlePct` süre ağırlıklı (eşit aralıksız örneklerle); 8 → 3 vites = 5 adım, vites 0 adımları sayılmaz; `sectorBoundaries` ara değer; `slowPoints`: 300→80→300 bulunur, 10 km/h'lik çukur bulunmaz, kenardaki yükselmesiz minimum bulunmaz; `normaliseTrace` kutu, en-boy oranı, y ters; `safetyCarFlags` dört mesaj biçimi ve `Other` kategorisindeki "SAFETY CAR LIGHTS ON" → false; `matchSessionByStart` iptal ve tolerans; `pickPoleLap` 1,5 ms sınırı ve pit çıkış turu.
  - `tests/circuit-telemetry-data.test.ts` (uydurma veri yasağı): `data/circuits/telemetry/*.json` her dosya için `isCircuitTelemetry`; `source` alanları dolu, `provider === 'OpenF1'`, `2023 ≤ year ≤ CURRENT_SEASON`; saklı örneklerden `lapMetrics`/`sectorBoundaries`/`slowPoints` yeniden hesaplanır ve saklı değerlere eşit; son `tMs` ile `lapDurationMs` farkı ≤ 1.500; `CIRCUIT_FACTS[id].lengthKm` varsa `lapLengthM` ±%3 içinde; `tMs` ve `dM` azalmaz; `0 ≤ kmh ≤ 400`, `0 ≤ gear ≤ 8`, `0 ≤ throttle ≤ 100`; `0 < boundariesM[0] < boundariesM[1] < lapLengthM`; `TELEMETRY_LOADERS` anahtarları dosya adlarıyla birebir. Dosya yoksa tek test: harita boş.
- Doğrulama: `npx vitest run tests/telemetry-derive.test.ts tests/circuit-telemetry-data.test.ts` yeşil; `npx tsc --noEmit` 0; `npx eslint lib/telemetry lib/data/circuitTelemetry.ts scripts/build-circuit-telemetry.ts data/circuits/telemetry` 0; `npx tsx scripts/build-circuit-telemetry.ts --dry-run` env'siz çıkış 0 ve güncel takvimdeki her pist için bir satır (eşleşme ya da neden).

### [ ] 13.3 Telemetri verisini üret ve commit et
- Run: Opus 5.5 / medium — sahip şartı (Builder, 13.2 ile aynı oturum); betiği koşturmak, sonucu ölçmek
- Owner: Opus 5.5 (Builder) · Depends on: 13.2 · Dalga 4 (oturum M, 13.2'den sonra `/effort medium`)
- Dosyalar: `data/circuits/telemetry/*.json`, `data/circuits/telemetry/index.ts` (betik üretir), günün log'u
- Değişiklik: bir seans penceresi dışında (`docs/reference/yaris-hafta-sonu-dogrulama.md` takvimi; OpenF1 seans sırasında tüm API'yi kilitler) `npx tsx scripts/build-circuit-telemetry.ts` (~8–12 dk). 401 ile durursa pencere dışında yeniden. Atlanan pistler nedenleriyle log'a.
- Doğrulama: `npx vitest run tests/circuit-telemetry-data.test.ts` yeşil (her dosya için); `du -sh data/circuits/telemetry` ≤ 600 KB; `npx tsc --noEmit` 0; log'da özet tablo (pist, yıl, sürücü, tur süresi, uzunluk farkı %) ve atlananlar; `wip/` CI + Vercel preview yeşil, sonra `main`.

### [ ] 13.4 Pist sayfası telemetri arayüzü
- Run: Antigravity (own model) — arayüz ve metin; Claude Code (Opus 5.5 / medium) doğrular, commit eder
- Owner: Antigravity · Depends on: 13.3 `main`'de, 1.11 bitmiş (`messages/*.json` ortak) · Dalga 5
- Dosyalar: yeni `components/circuit/TelemetryTrace.tsx`, yeni `components/circuit/SpeedProfile.tsx`, yeni `components/circuit/TelemetryStats.tsx`, `components/circuit/CircuitElevationProfile.tsx`, `app/[locale]/circuits/[id]/page.tsx`, `messages/tr.json`, `messages/en.json`
- Değişiklik:
  - Sayfa `getCircuitTelemetry(id)`'yi mevcut `Promise.all`'a ekler. Telemetri varsa "blueprint" kartı `TelemetryTrace`'i gösterir (örneklerin `x`/`y` çizgisi, üç sektör renk/sınır işareti, `slowPoints` iğneleri: dokunma/üzerine gelme/klavye odağında hız ve vites); yoksa bugünkü MIT SVG aynen kalır.
  - Yeni bento satırı: `SpeedProfile` (mesafeye göre hız çizgisi, altında vites bandı ve gaz/fren şeritleri, sektör çizgileri) ve `TelemetryStats` (en yüksek/en düşük hız, tam gaz %, fren %, vites adımı "≥ N", hız tuzakları I1/I2/ST, "Güvenlik aracı: k / n yarış (yıllar)", kaynak satırı "OpenF1 · {year} Sıralama · {driverCode} pole turu {lapTime} · CC BY-NC-SA 4.0").
  - `CircuitElevationProfile`: telemetri varsa vites ve gaz kutucukları ölçülen değeri (`gearShiftSteps`, `fullThrottlePct`, "ölçüm" etiketiyle) gösterir; tahmin değeri gösterilmez.
  - Yasak: viraj numarası/adı, hız tuzağı konumu, DRS, lastik aşınması, downforce endeksi (kaynak yok); değerler saklandığı gibi, yalnızca görüntü biçimlenir; `prefers-reduced-motion`; mobil önce; `docs/design/apex-component-rules.md` §9 bağlayıcı (mor yalnızca tur rekoru).
- Doğrulama: Antigravity log'a yazar, `[~]` işaretler. Claude Code: `npx tsc --noEmit` 0, `npm run lint` 0, `npx vitest related --run <değişen dosyalar>` yeşil; tarayıcıda `/tr/circuits/monza` ve telemetrisi olmayan bir pist, 375 ve 1440 genişlikte (yatay kaydırma yok, iğneler klavyeyle odaklanır, konsol hatası yok); `docs/reference/apex-reference.md` pist sayfası veri kaynakları ve `Last verified`, `docs/PRODUCT.md` güncel; `wip/` CI + preview yeşil, sonra `main`.

---

## Faz 14 — Güvenlik ve maliyet sertleştirmesi (Claude Opus 5.5 şartı)

### [x] 14.1 Tüm genel rotalarda `applyRateLimit`; push bypass'ını kapat
- Run: Opus 5.5 / high — sahip şartı; güvenlik kodu, tarif kesin
- Owner: Opus 5.5 · Depends on: — · Dalga 1 (2026-10-22 18:00 TR'ye kadar push edilemezse 2026-10-26'ya kalır)
- Dosyalar: `app/api/push/register/route.ts`, `app/api/news/route.ts`, `app/api/media/route.ts`, `app/api/circuits/[id]/route.ts`, `app/api/drivers/[driverId]/career/route.ts`, `app/api/teams/[constructorId]/career/route.ts`, `app/api/season/[year]/route.ts`, `app/api/season/[year]/last-result/route.ts`, `lib/rateLimit.ts` (yalnızca yorum), `tests/rateLimit.test.ts`, yeni `tests/rate-limit-routes.test.ts`
- Değişiklik: her rotada `const clientIP = getClientIP(req.headers); if (clientIP !== 'unknown' …) { … rateLimit(clientIP, opts) … }` bloğunu `const { success, retryAfter } = await applyRateLimit(req.headers, { prefix, max, windowMs });` + mevcut 429 yanıtıyla değiştir; `prefix`/`max`/`windowMs` değerleri aynen korunur. `push/register`'daki `NODE_ENV`/`fallback:unknown` atlaması kalkar (test muafiyeti `applyRateLimit` içinde). `lib/rateLimit.ts:28` civarındaki "legacy guard" yorumu silinir. Kullanılmayan `getClientIP`/`rateLimit` importları kalkar.
- İmza: değişmez — `applyRateLimit(headers: Headers, opts: RateLimitOptions): Promise<RateLimitResult>`.
- Test: `tests/rate-limit-routes.test.ts` — `NODE_ENV` `production`'a stub'lanır, Upstash env boş (bellek içi limiter); başlıksız istekle `push/register` POST'u `max/5`+1. çağrıda 429 döner; başlıklı (`x-real-ip`) istek tam kotayı alır.
- Ek kontrol (yalnızca okuma): Vercel MCP `filter_project_envs` ile Production'da `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` **adlarının** varlığı log'a yazılır (değer okunmaz).
- Doğrulama: `grep -rn "clientIP !== 'unknown'" app/api` → çıktı yok; `grep -rln "applyRateLimit" app/api | wc -l` → 10; `npx vitest run tests/rateLimit.test.ts tests/rate-limit-routes.test.ts tests/api-media.test.ts` yeşil; `npx tsc --noEmit` 0; `npx eslint app/api lib/rateLimit.ts` 0.

### [ ] 14.2 Bağımlılık zafiyetleri + CI kapısı
- Run: Opus 5.5 / high — sahip şartı; major yükseltmeler, CI kapısı
- Owner: Opus 5.5 · Depends on: kod dondurmanın bitmesi (2026-10-26) · Dalga 3 · **tek başına koşar** (`node_modules`)
- Dosyalar: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, yeni `.github/workflows/security-audit.yml`, `docs/procedures.md` (§2), kırılırsa yalnızca ilgili `tests/*` ve `vitest.config.*`
- Değişiklik (sırayla, her biri ayrı commit):
  1. `next` ve `eslint-config-next` → aynı sürüm `16.4.2` (birbirine eşit sabit). Önce `node_modules/next/dist/docs/` yükseltme notları okunur.
  2. `npm audit fix` (**`--force` yok**) — geçişli düzeltmeler.
  3. `vitest` `^3.2.6` → `^5.0.5` (major; tinypool kritik). Kırılan yapılandırma/test düzeltilir; davranış testi silinmez.
  4. `sharp` `^0.34.5` → `^0.35.5` (major).
  5. `ci.yml`: `on.push.branches` = `['main', 'wip/**']`; `npm ci`'den sonra `- run: npm audit --omit=dev --audit-level=high` adımı.
  6. Dependabot uyarıları (PR açmaz; sahip onayı 2026-10-20): `gh api -X PUT repos/ugurshelby/project-anthology/vulnerability-alerts`. Dependabot security/version updates **açılmaz**, `.github/dependabot.yml` **eklenmez** (PR açarlar; politika PR yok).
  7. `.github/workflows/security-audit.yml`: `schedule: cron "0 6 * * 1"` (haftalık) + `workflow_dispatch`; `npm ci` ardından `npm audit --omit=dev --audit-level=high`; `permissions: contents: read`. Başarısızlık GitHub e-postasıyla sahibe düşer; ajan rutin oturumda okur.
  8. `docs/procedures.md` §2 (güvenlik denetimi): ilk adımlara `gh api "repos/ugurshelby/project-anthology/dependabot/alerts?state=open" --jq length` ve `gh run list --workflow security-audit.yml --limit 3` eklenir; açık uyarı = bir sonraki planın 14.x yükseltme adımı (`wip/` CI kapısıyla).
  - `eslint-config-next` için audit'in önerdiği 14.2.35 düşürmesi **uygulanmaz**.
- Doğrulama: yerel `npx tsc --noEmit` 0, `npm run lint` 0; `npm audit --omit=dev --audit-level=high` çıkış 0; `gh api repos/ugurshelby/project-anthology/vulnerability-alerts -i` → `204`; `gh workflow run security-audit.yml` sonrası koşu yeşil; `wip/deps-2026-10` push'u → CI (`gh run list --branch wip/deps-2026-10`) ve Vercel preview build yeşil; sonra `main`'e fast-forward (sahip onayıyla push), `wip/` dalı yerelde ve `origin`'de silinir. Kalan dev-only bulgular log'a sayıyla yazılır.

### [ ] 14.3 Zod ile şema doğrulama
- Run: Opus 5.5 / high — sahip şartı; çok dosyalı doğrulama refaktörü
- Owner: Opus 5.5 · Depends on: 14.1 (aynı rotalar), 14.2 (`package.json`) · Dalga 4
- Dosyalar: `package.json`, `package-lock.json`, yeni `lib/validation/api.ts`, `app/api/push/register/route.ts`, `app/api/f1-season/route.ts`, `app/api/media/route.ts`, `app/api/circuits/[id]/route.ts`, yeni `tests/validation-api.test.ts`
- Değişiklik: `npm install zod@^4`. `lib/validation/api.ts` şunları dışa verir: `pushRegisterBody` (token: boş olmayan string, üst sınır mevcut koddaki ile aynı; preferences: `z.record(z.string(), z.boolean())`, en çok `MAX_PREFERENCE_KEYS` anahtar), `f1SeasonQuery`, `mediaQuery`, `circuitIdParam` — her biri bugünkü elle yazılmış kuralın birebir karşılığı (izinli değer kümeleri, regex, uzunluk). Rotalar `safeParse` kullanır; hata → bugünkü durum kodu ve gövde aynen (400 metni değişmez). `sanitizePreferences` gibi elle yazılmış doğrulayıcılar silinir.
- İmza: `export const pushRegisterBody: z.ZodType<{ token: string; preferences: Record<string, boolean> }>` vb.; `export type PushRegisterBody = z.infer<typeof pushRegisterBody>`.
- Doğrulama: `npx vitest run tests/validation-api.test.ts` + mevcut rota testleri (`npx vitest related --run app/api/push/register/route.ts app/api/f1-season/route.ts app/api/media/route.ts "app/api/circuits/[id]/route.ts"`) yeşil; `npx tsc --noEmit` 0; `npm run lint` 0; `npm run build` `wip/` üzerinde yeşil.

### [ ] 14.4 LLM harcama tavanları (Denial of Wallet)
- Run: Opus 5.5 / medium — sahip şartı; küçük, net kapsam
- Owner: Opus 5.5 · Depends on: — · Dalga 4 (sahip konsol tavanları: 16.8)
- Opus 5.5 dosyaları: `lib/news/rewrite.ts`, yeni `tests/news-rewrite-limits.test.ts`
- Değişiklik: dosyadaki deneme/token/parti sınırlarını adlandırılmış `export const` sabitlere çıkar (yeni sınır koyma, mevcut değerleri koru); test bu sabitlerin üst sınırlarını ve bir koşudaki en fazla sağlayıcı çağrısını sabitler (OWASP LLM10).
- Doğrulama: `npx vitest run tests/news-rewrite-limits.test.ts` yeşil; `npx tsc --noEmit` 0; `npx eslint lib/news/rewrite.ts` 0.

### [ ] 14.5 `/api/news` canlı taramasını kaldır
- Run: Opus 5.5 / high — sahip şartı; rota ve geri düşüş zinciri
- Owner: Opus 5.5 · Depends on: 14.1 (`app/api/news/route.ts`) · Dalga 4
- Dosyalar: `app/api/news/route.ts` (silinir), `lib/data/news.ts`, `tests/news-stories.test.ts`, `tests/api-cron-guard.test.ts` (yalnızca `/api/news` referansı varsa), `docs/reference/apex-reference.md` (rota listesi)
- Değişiklik: `/api/news` rotası silinir (tek tüketicisi sunucu içi geri düşüştü). `getLatestNews` zinciri: `news_stories` → `news_cache` → `public/news-fallback.json`; adım 2 (`fetchSiteJson('/api/news')`) ve kullanılmayan `ApiNewsItem` dönüştürücüleri ancak statik geri düşüş kullanmıyorsa kalkar. `aggregate()` yalnızca `sync-news` cron'unda kalır.
- Doğrulama: `grep -rn "'/api/news'" app lib` → çıktı yok; `npx vitest related --run lib/data/news.ts` yeşil; `npx tsc --noEmit` 0; `npm run build` `wip/` üzerinde yeşil (rota sayısı bir azalır).

---

## Faz 15 — Ekran görüntüsü vision denetimi

### [x] 15.1 `scripts/audit-screenshots.ts`
- Run: Sonnet / medium — tek betik, sabit istek tavanı
- Owner: Sonnet · Depends on: — · Dalga 1
- Dosyalar: yeni `scripts/audit-screenshots.ts`, yeni `tests/audit-screenshots.test.ts` (`package.json`'a dokunulmaz; çalıştırma `npx tsx scripts/audit-screenshots.ts`)
- Değişiklik: `screenshots/<sayfa-id>/*-viewport.png` dosyalarını (16 × 3) okur; mevcut `GEMINI_API_KEY` ile Gemini REST'e (yeni bağımlılık yok, `fetch`) dört ölçütle (düzen, bileşen, tipografi, görsel kadraj) istek atar; çıktıyı `screenshots/<sayfa-id>/audit-report.md`'ye yazar. Sert tavan: `--max-requests` (varsayılan 48), `--dry-run` (istek atmadan plan yazar), `--page <id>`. Saf yardımcılar (`buildPrompt`, `listTargets`, `reportPath`) dışa verilir ve test edilir.
- Doğrulama: `npx vitest run tests/audit-screenshots.test.ts` yeşil; `npx tsx scripts/audit-screenshots.ts --dry-run` env'siz çalışır ve 48 hedef listeler; `npx tsc --noEmit` 0. Gerçek koşu **sahip** tarafından (betik anahtar ister; ajanlar gerçek env yüklemez).

### [ ] 15.2 Rapor bulgularını arayüze uygula
- Run: Antigravity (own model) — UI uygulaması
- Owner: Antigravity · Depends on: 15.1 + sahibin gerçek koşusu · Dalga 5
- Kurallar: `docs/design/apex-component-rules.md` bağlayıcı. Her sayfa sonrası tarayıcıda kontrol; commit Claude Code'da.

---

## Faz 16 — Yayın öncesi sahip paketi (tetik: sahip "proje hazır" der)

Bu fazın hiçbir adımı tetikten önce talep edilmez. Kod tarafı hazır olanlar: SEO meta + JSON-LD, Sentry (DSN'e bağlı), atıf arayüzü.

### [ ] 16.1 Gerçek iletişim bilgileri ve yasal adresler
- Run: owner, ardından Haiku / low — yer tutucu değişimi
- Owner: owner → Haiku · Depends on: tetik
- Dosyalar: `messages/en.json`, `messages/tr.json`
- Değişiklik: `privacy@apexstats.example`, `dmca@apexstats.example`, `contact@apexstats.example` → sahibin verdiği adresler (birebir metin değişimi); sahip başka iletişim bilgisi verirse aynı dosyalarda.
- Doğrulama: `grep -rc "apexstats.example" messages` → her dosya 0; `npx vitest run tests/i18n-messages.test.ts` yeşil.

### [ ] 16.2 Gerçek logo ve marka varlıkları
- Run: Antigravity (own model) — UI entegrasyonu
- Owner: owner → Antigravity · Depends on: tetik
- Sahip logoyu verir; Antigravity mevcut logo kullanım yerlerini değiştirir (favicon, manifest ikonları, OG görseli dahil); commit Claude Code'da, tarayıcıda kontrol.

### [ ] 16.3 Search Console + Rich Results (eski 6.1)
- Run: owner, ardından Sonnet / low — işaretleme kontrolü
- Owner: owner → Sonnet · Depends on: tetik
- Sahip: Vercel Production'a `GOOGLE_SITE_VERIFICATION`, Search Console doğrulama, `sitemap.xml` gönderimi.
- Sonnet: rehber §3.D; Rich Results Test'te ana sayfa, bir pilot, bir takım, bir tur, bir haber sayfası hatasız. Dosya: günün log'u.

### [ ] 16.4 Core Web Vitals saha takibi (eski 6.2)
- Run: Sonnet / medium — ölçüm ve kıyas
- Owner: Sonnet · Depends on: 16.3 + 28 gün CrUX verisi
- Hedef: mobil LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (rehber §3.E). Eşik dışı sayfa `OPEN.md` `To: Opus`.

### [ ] 16.5 Sentry DSN (eski 6.3)
- Run: owner, ardından Sonnet / low — yakalama kontrolü
- Owner: owner → Sonnet · Depends on: tetik
- Sahip: Vercel Production'a `NEXT_PUBLIC_SENTRY_DSN` ve `SENTRY_DSN`. Sonnet: rehber §3.F, bir test hatasının Sentry'de PII'siz göründüğünü log'a yazar.

### [ ] 16.6 Hikâye görseli kaynakları (eski 7.1)
- Run: owner, ardından Sonnet / low — manifest satır güncellemesi
- Owner: owner → Sonnet · Depends on: tetik
- Sahip: `docs/reference/hikaye-gorselleri-kaynak-listesi.md`'deki 57 `unverified` satırın kaynağını verir. Sonnet: `data/stories/image-credits.ts` satırlarını `status: 'sourced'` + kaynak alanlarıyla günceller.
- Doğrulama: `npx vitest run tests/story-images.test.ts` yeşil; `grep -c "status: 'unverified'" data/stories/image-credits.ts` beklenen kalan sayı.

### [ ] 16.7 Medya seçim kalite incelemesi (eski 8.3)
- Run: owner, ardından Sonnet / low — read-only SQL
- Owner: owner → Sonnet · Depends on: tetik, Faz 8 kapısı
- Sorgular: `docs/reference/media-sistemi.md` §13. `review='rejected'` yazmak veri değişikliğidir: sahip onayı.

### [ ] 16.8 LLM konsol harcama tavanları (14.4 sahip kısmı)
- Run: owner · Owner: owner · Depends on: tetik (GCP tarafı 9.0 madde 4'te kota olarak yapılır)
- GCP ve Groq konsollarında aylık sert tavan + hız alarmı.

---

## Faz 17 — Yarış simülasyonu (fikir; tetik: sahip "kurslara hakimim" der)

Kaynak: `docs/idea/simulation.md` (sahip, 2026-10-21). Sahip kendisi öğrenip dahil olmadan başlanmaz; amaç sağlam temelli, doğrulanmış bir model, "AI slop" değil.

### [⏸] 17.1 Simülasyon tasarımı (Architect, sahiple birlikte)
- Run: Opus / xhigh — model ve veri doğruluğu kararı; sahip oturumda
- Owner: Opus + owner · Tetik: sahibin açık sözü · Depends on: 13.3 (telemetri verisi)
- Karar verir: kapsam sırası (önce karşıolgusal strateji; enerji/boost en son, girdileri kamuya açık değil), veri kaynakları (OpenF1 2023+ laps/stints/pit, Jolpica tur süreleri ve pit stopları; FastF1 arşivi F1 TV kimliği istiyor), tur süresi modeli ve parametrelerin yarış verisinden kalibrasyonu, yayından önce geriye dönük test (gerçek yarış sonuçlarına karşı hata ölçütü ve eşik), arayüzde "model çıktısıdır" etiketi, hesaplamanın nerede koştuğu (tarayıcıda deterministik TS, sunucu gerekmez mi).
- Okuma (sahip için öneri, 17.1'den önce): Heilmeier ve ark. (TUM FTM) yarış simülasyonu makaleleri ve açık kaynak `TUMFTM/race-simulation` (özet ve Apex için uygulama fikirleri: `docs/idea/TUM_Yaris_Simulasyonu_Raporu.md`); MATLAB/Simulink kursları kavrayış içindir, Apex'te çalışma zamanı olmaz.

---

## Paralel Dalgalar

Aynı dalgadaki oturumların dosya listeleri çakışmaz (köprü dosyalarında — `PLAN.md`, bu dosya, `DECISIONS.md`, `OPEN.md` — yalnızca kendi maddesini birebir metin değişimiyle işaretler/ekler). Her oturum için ilk adım kalın.

| Dalga | Zaman | Oturum (model / effort) | İlk adım | Dosya alanı |
|---|---|---|---|---|
| **1** | şimdi → 2026-10-22 | A: Sonnet / medium | **1.0** | `docs/reference/yaris-hafta-sonu-dogrulama.md` |
| | | B: Opus 5.5 / high (Builder) | **14.1** | 8 rota + `lib/rateLimit.ts` + 2 test; push 10-22 18:00 TR'ye kadar |
| | | C: Sonnet / medium | **15.1** | `scripts/audit-screenshots.ts`, 1 test |
| | | D: Haiku / low | **0.1** | `logs/` (5 eski dosya) |
| | | E: Antigravity | **7.2** | `data/history/liveries.ts`, `team-dna.ts` |
| | | N: Opus / xhigh (Architect) | **1.9** ✓ | bu dosyada 1.9/1.10/1.11, `DECISIONS.md`, `PLAN.md` Session F |
| **2** | 2026-10-23 → 25 (kod dondurma) | F: Sonnet / high | **1.1** (sonra 1.4, 1.3, 1.7, 1.9 gözlemi) | `logs/2026-10-2{3,4,5}.md`, rehber §4 |
| | | G: Opus 5.5 / xhigh (Architect) | **13.1** ✓ | bu dosyada Faz 13, `DECISIONS.md`, `PLAN.md` |
| **3** | 2026-10-26 → | H: Opus 5.5 / high (Builder; tek kod oturumu) | **14.2** | `package*.json`, `ci.yml`, `security-audit.yml`, `docs/procedures.md`, kırılan testler |
| | | Claude in Chrome + owner | **9.0** | GCP konsolu (repo dosyası yok), günün log'u |
| | | Opus / xhigh (Architect) | **9.4** (9.0'dan sonra) | bu dosyada Faz 9, `DECISIONS.md` |
| | | I: Haiku / low | **1.6** | 4 workflow `.yml` (sync-*, notify-sessions) |
| | | O: Opus / xhigh (Architect, ölçer) | **8.0** | bu dosyada Faz 8, `DECISIONS.md`, günün log'u |
| | | Q: Sonnet / high | **1.10** | `lib/f1/provisional*.ts`, `lib/f1/sources/openf1.ts`, `sync-f1/route.ts`, 2 test |
| **4** | 14.2 `main`'de | J: Opus 5.5 / high | **14.3** | `package*.json`, `lib/validation/`, 4 rota |
| | | Sonnet / medium + owner | **9.5** (9.4 seçerse) | ölçüm, log; VM konsolda |
| | | K: Opus 5.5 / high | **14.5** | `lib/data/news.ts`, `app/api/news/`, 2 test, `apex-reference.md` |
| | | L: Opus 5.5 / medium | **14.4** | `lib/news/rewrite.ts`, 1 test |
| | | M: Opus 5.5 / high → medium (Builder) | **13.2** (sonra 13.3) | `lib/telemetry/`, `lib/data/circuitTelemetry.ts`, `scripts/build-circuit-telemetry.ts`, `data/circuits/telemetry/`, 2 test |
| | | Antigravity | **1.11** (1.10 `main`'de) | `ResultsTable.tsx`, `SiteFooter.tsx`, `messages/*.json` |
| | | 8.0'ın yazdığı 8.x adımları | 8.0 belirler | J/K/L/M ile çakışmayanlar bu dalgada, kalanlar Dalga 5 |
| **5** | Dalga 4 sonrası | P: Sonnet / medium | **1.8** | `scripts/qstash-sync.ts`, `lib/cron/qstashPrune.ts`, `qstash-sync.yml`, 1 test, `apex-reference.md` |
| | | Sonnet / high | **9.2** (9.4 bitti, sahip anahtarı Vercel'de) | `lib/news/rewrite.ts`, 1 test, `.env.example` |
| | | Antigravity | **15.2** (sahip 15.1'i koştuysa) | sayfa bileşenleri |
| | | Antigravity (15.2'den sonra; aynı ajan) | **13.4** (13.3 `main`'de) | `components/circuit/*Telemetry*`, `SpeedProfile.tsx`, `CircuitElevationProfile.tsx`, pist sayfası, `messages/*.json` |
| **6** | sahip "proje hazır" der | owner → Haiku / Sonnet / Antigravity | **16.1** | Faz 16 maddeleri |

Not: Dalga 4'te J `npm install zod` yapar; K/L/M yerel testlerini J'nin kurulumu bittikten sonra koşar. 1.8 için sahibin tek elle işi repo secret `QSTASH_TOKEN`; GCP kredisi 2026-12-16'da biter: 9.0 Dalga 3'te başlar, 9.7 kapanışı 2026-12-10 → 12 sabit tarihli; 9.3 Kasım başında hatırlatılır.

---

## Teknik borç ve çevre

| Madde | Durum | Aksiyon |
|---|---|---|
| CI `main` push'unda koşmuyor | Son koşu 2026-10-02 | 14.2 adım 5 (`push: main`) |
| QStash ↔ kod sapması | Canlı `retries: 3` (kod 0/1), notify `*/10` (kod `*/5`); en kötü durum 960/1000 mesaj/gün | 1.8 |
| Çift zamanlayıcı | GitHub + QStash aynı 4 rotayı tetikliyor (idempotent, zararsız) | 1.6 (R18 sonrası) |
| `rewrite.ts` yorum/kod çelişkisi | Yorum "Gemini → Groq", kod Groq → Gemini | 9.2 |
| Yasal adresler, logo | `.example` yer tutucu, geçici logo | 16.1, 16.2 |
| C-7 yerel `next start` SSL uyarısı | Yalnızca yerel; canlıyı etkilemez | izlenir |
| `any` / `eslint-disable` | 0 | korunur |
