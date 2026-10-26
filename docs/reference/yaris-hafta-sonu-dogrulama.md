# Yarış Hafta Sonu Canlı Doğrulama Rehberi

Last verified: 2026-10-26 (R18 Session F sonuçları §4; §2b QStash 2026-10-20; 3.A R17 sonucu 2026-10-11)

Bu doküman, **gerçek bir yarış hafta sonunda** yapılabilecek canlı doğrulamaları (master-plan 1.1, 1.3, 1.4, 6.1, 6.2, 6.3 ve medya) tek yerde toplar. Sahip yarış zamanı yeni bir oturum açıp "**yarış hafta sonu doğrulamasını başlat — `docs/reference/yaris-hafta-sonu-dogrulama.md`**" dediğinde ajan bu dokümanı okur ve sırayla uygular. Sonuçlar `logs/YYYY-MM-DD.md` içine, geçen maddeler `docs/plans/master-plan.md` içine işlenir (ölçülmeden kutu işaretlenmez).

Ajanın bu dokümanı kullanırken uyacağı kurallar (AGENTS.md ile aynı):
- Canlı veritabanında **yalnızca okuma** (Supabase MCP, `SELECT`). Yazma, migration veya tohumlama için sahibin o oturumdaki açık onayı gerekir.
- Cron uçları gizli anahtarla elle çağrılmaz; sonuçlar GitHub Actions log'larından (`gh run view --log`) ya da QStash kuruluysa Upstash console → *Logs*'tan okunur.
- Gizli değer yazdırılmaz, commit edilmez. `gh` oturumu `ugurshelby` hesabında açık.
- Canlı uçlara toplu yük bindirilmez (`/api/live-timing` dakikada 30 istekle sınırlı).
- Yerel build/sunucu gerekirse: aynı anda iki `next build` çalıştırılmaz.

---

## 1. Takvim (UTC; Türkiye saati = UTC+3)

Kaynak: Jolpica 2026 takvimi (2026-10-06 alındı). Takvim değişebilir: oturumdan önce `https://api.jolpi.ca/ergast/f1/2026.json` ile yeniden kontrol edin.

| Tur | Yarış (UTC) | Yarış (TR) | Diğer oturumlar (UTC) |
|---|---|---|---|
| **R17 Singapur (sprint)** | Paz 2026-10-11 12:00 | 15:00 | FP1 Cum 10-09 08:30 · Sprint Quali Cum 12:30 · **Sprint Cmt 10-10 09:00** · **Quali Cmt 13:00** |
| R18 ABD | Paz 2026-10-25 20:00 | 23:00 | FP1 10-23 17:30 · FP2 21:00 · FP3 10-24 17:30 · **Quali 10-24 21:00** |
| R19 Meksika | Paz 2026-11-01 20:00 | 23:00 | FP1 10-30 18:30 · FP2 22:00 · FP3 10-31 17:30 · **Quali 10-31 21:00** |
| R20 Brezilya | Paz 2026-11-08 17:00 | 20:00 | FP1 11-06 15:30 · FP2 19:00 · FP3 11-07 14:30 · **Quali 11-07 18:00** |
| R21 Las Vegas | Paz 2026-11-22 04:00 | 07:00 | FP1 11-20 00:30 · FP2 04:00 · FP3 11-21 00:30 · **Quali 11-21 04:00** |
| R22 Katar | Paz 2026-11-29 16:00 | 19:00 | FP1 11-27 13:30 · FP2 17:00 · FP3 11-28 14:30 · **Quali 11-28 18:00** |
| R23 Abu Dabi | Paz 2026-12-06 13:00 | 16:00 | FP1 12-04 09:30 · FP2 13:00 · FP3 12-05 10:30 · **Quali 12-05 14:00** |

**Sıradaki doğrulama: R18 ABD (2026-10-23 … 25)** — sprint yok; qualifying + yarış iki oturum. R17 Singapur (sprint) 2026-10-11'de koşuldu; 3.A orada OpenF1 401 nedeniyle ölçülemedi.

### R18 için zaman çizelgesi (kodun hesapladığı pencereler)

R18 sprint hafta sonu değildir. Qualifying Cmt 21:00 UTC'dir; TR saatiyle gece yarısını geçer (Paz 00:00), yarış TR'de Paz 23:00'dür ve sonuç koşuları Pzt sabaha sarkar.

| Olay | UTC | TR | Dayanak |
|---|---|---|---|
| Quali bildirim penceresi | Cmt 20:25–20:35 | Cmt 23:25–23:35 | `notify-sessions`: `NOTIFY_WINDOW_MS` 30 dk ± 5 dk. QStash `*/10` ise tek uygun tik 20:30; GitHub `*/10` yedek (güvenilmez); `notified_sessions` çift bildirimi engeller |
| **Quali canlı** | Cmt 21:00 → ~22:00 | Paz 00:00 → ~01:00 | OpenF1 `date_start`–`date_end` (+10 dk tolerans) |
| Quali senkronu (due) | Cmt 22:30 | Paz 01:30 | `QUALI_SYNC_OFFSET_MS` = +90 dk; QStash `sync-f1` `*/30` tiki 22:30 ve 23:00 |
| Yarış bildirim penceresi | Paz 19:25–19:35 | Paz 22:25–22:35 | aynı (tik 19:30) |
| **Yarış canlı** | Paz 20:00 → ~22:00 | Paz 23:00 → Pzt ~01:00 | OpenF1; arayüz `RACE_LIVE_WINDOW_MS` = yarış başlangıcından 4 sa (Pzt 00:00 UTC'ye kadar "live") |
| Yarış sonucu + pit stop (due) | Paz 22:30 | Pzt 01:30 | `RACE_RESULTS_OFFSET_MS` = +2,5 sa; tik 22:30 |
| Puan durumu (due) | Paz 23:00 | Pzt 02:00 | `STANDINGS_OFFSET_MS` = +3 sa; tik 23:00 |
| Settled (final) kontrolü | quali: Paz 22:30 sonrası · yarış: Pzt 22:30 sonrası · puan: Pzt 23:00 sonrası | quali: Pzt 01:30 · yarış: Sal 01:30 · puan: Sal 02:00 | due + 24 sa (`SNAPSHOT_SETTLE_AFTER_MS`) |

Kapsam: `sync-f1` `scope=live` (`isRoundInLiveScope`) yarış gününden (UTC 23:59:59) sonra 7 gün boyunca turu işler (`lib/f1/syncSchedule.ts`); QStash çağrısında `scope` verilmez, yani sezon kapsamı geçerlidir ve yalnızca due penceresi gelmiş ve settled olmamış snapshot'lar çekilir.

Not: FP1–FP3 için bildirim **gönderilmez** (yalnız qualifying, sprint, race bildirilir).

---|---|---|---|
| Sprint bildirim penceresi | Cmt ~08:25–08:35 | ~11:25–11:35 | `notify-sessions`: oturumdan ~30 dk önce (±5 dk); QStash her 5 dk (kuruluysa), GitHub yedeği her 10 dk ama güvenilmez |
| **Sprint canlı** | Cmt 09:00 → ~10:00 | 12:00 → ~13:00 | OpenF1 `date_start`–`date_end` (+10 dk tolerans) |
| Sprint sonuç senkronu (due) | Cmt 10:30 → ilk koşu ~10:42 | 13:30 → ~13:42 | `SPRINT_SYNC_OFFSET_MS` = +90 dk; `sync-f1-race-aware` her saat :12 |
| Quali bildirim penceresi | Cmt ~12:25–12:35 | ~15:25–15:35 | aynı |
| **Quali canlı** | Cmt 13:00 → ~14:00 | 16:00 → ~17:00 | OpenF1 |
| Quali senkronu (due) | Cmt 14:30 → ~14:42 | 17:30 → ~17:42 | `QUALI_SYNC_OFFSET_MS` = +90 dk |
| Yarış bildirim penceresi | Paz ~11:25–11:35 | ~14:25–14:35 | aynı |
| **Yarış canlı** | Paz 12:00 → ~14:00 | 15:00 → ~17:00 | OpenF1; arayüz `RACE_LIVE_WINDOW_MS` = yarış başlangıcından 4 sa |
| Yarış sonucu + pit stop (due) | Paz 14:30 → ~14:42 | 17:30 → ~17:42 | `RACE_RESULTS_OFFSET_MS` = +2,5 sa |
| Puan durumu (due) | Paz 15:00 → ~15:12 | 18:00 → ~18:12 | `STANDINGS_OFFSET_MS` = +3 sa |
| Settled (final) kontrolü | Pzt 14:30 sonrası | Pzt 17:30 sonrası | due + 24 sa (`SNAPSHOT_SETTLE_AFTER_MS`) |

Not: Sprint Quali (Cum 12:30) için bildirim **gönderilmez** (yalnız qualifying, sprint, race bildirilir).

---

## 2. Ön koşullar (hafta sonundan ÖNCE tamamlanmalı)

2026-10-06 itibarıyla durum:

| # | Koşul | Durum |
|---|---|---|
| 1 | Medya migration'ı (`20261006000001_media_assets.sql`) | **Uygulandı** (2026-10-06, MCP). Kod ve workflow canlıda (2026-10-06); tablo ilk `sync-media` koşusuna kadar boş. Yarış doğrulamasının zorunlu parçası değil. |
| 2 | **Push tablolarında `service_role` yetkisi** (`20261006000002_push_service_role_grants.sql`) | **Uygulandı** (2026-10-06, MCP; `has_table_privilege` ile doğrulandı). 2026-10-08 yeniden ölçüldü: `service_role` iki tabloda SELECT/INSERT/UPDATE/DELETE true, `anon` SELECT ve `authenticated` INSERT false. |
| 3 | Test aboneliği (push için) | `push_subscriptions` 0 satır; mobil uygulama yayında değil. Bölüm 3.C'deki yöntemle sahibin onayıyla bir test satırı eklenebilir. |
| 4 | `MEDIA_CONTACT` Vercel Production | Eklendi (sahip, 2026-10-06). |
| 5 | GitHub secret `CRON_SECRET_KEY` + var `SITE_URL` | Diğer workflow'larla ortak, kullanımda. |
| 6 | **OpenF1 canlı erişim (kimlik doğrulama)** | **Kod hazır, kimlik bilgisi yok** (2026-10-11): OpenF1 canlı seans süresince kimliksiz tüm isteklere 401 veriyor. `OPENF1_USERNAME`/`OPENF1_PASSWORD` yoksa rota 200 `{live:true, restricted:true}` döner ve 3.A'nın "kilitli" ölçütü uygulanır; varsa tam ölçüt. Abonelik kararı master-plan 1.7. |

---

## 2b. Zamanlayıcı gerçeği (2026-10-20 ölçümü)

Upstash MCP (`qstash_list_schedules` + `logs_list`, eu, 2026-10-20 ~12:50 UTC): QStash 4 zamanlama çalışıyor, hepsi POST, `retries: 3`, `isPaused: false`, son durum SUCCESS:
- `sync-f1` `*/30` (`scd_5SQTf1Ru…`): son tetik 12:30Z → DELIVERED 200, 11,7 sn. Aynı gün bir koşu 184,5 sn sürdü (200); `maxDuration` 300 sn, yani pay dar.
- `notify-sessions` `*/10` (`scd_6H9JdCRn…`, bugün 12:02Z'de açıldı): ilk iki tik (12:20Z, 12:30Z) DELIVERED 200, ~1,5 sn.
- `sync-news` `11 *` (`scd_7XFsWyvs…`): son 11:11Z → 200, 22 sn.
- `sync-media` `41 *` (`scd_7PjUexMo…`): son 12:41Z → 200, 7,3 sn.

Kod (`lib/cron/qstashSchedules.ts`) ile sapma: canlıda `retries: 3` (kod 0/1) ve notify `*/10` (kod `*/5`); düzeltme master-plan 1.8. GitHub `schedule` tetikleri yedek olarak R18 boyunca açık kalır (best-effort: 2026-10-07'de `notify-sessions` günde ~5 koşu, medyan ~5 sa). Doğrulama oturumunda:
- Koşular Upstash console → *Logs*'ta ve MCP `logs_list` (service `qstash`, region `eu`) çıktısında görünür; aranacak kayıt `DELIVERED` + `responseStatus: 200`. `CREATED → ACTIVE → DELIVERED` zinciri bir tetiktir.
- Çift zamanlayıcı (GitHub + QStash) idempotenttir; çift koşu hata sayılmaz (master-plan 1.6).
- Belirli bir pencereyi zorlamak gerekirse ilgili workflow elle tetiklenir: `gh workflow run notify-sessions.yml`, `gh workflow run sync-f1-race-aware.yml` (sahibin o anki onayıyla).
- Bir koşunun "yok" olması hata sayılmaz; önce QStash logu, sonra `gh run list --workflow=<ad>.yml --limit 10` ile bakın.
- `sync-f1-scheduled.ts` 12 saat geriye bakar; geç gelen koşu kaçan pencereyi telafi eder. `notify-sessions` için telafi yoktur (bildirim zaman duyarlıdır): tik 20:30/19:30 kaçarsa bildirim gönderilmez.

---

## 3. Doğrulamalar

Her madde: **ne**, **ne zaman**, **nasıl**, **geçme ölçütü**, **başarısızsa**.

### A. Canlı zamanlama (master-plan 1.1) — oturum sırasında

- **Ne:** `/api/live-timing` + ana sayfadaki `LiveRaceTracker`, gerçek bir OpenF1 oturumunda.
- **Nasıl:**
  0. **İlk iş (ham OpenF1):** `curl -s -i "https://api.openf1.org/v1/sessions?session_key=latest"`. **401** ise "kilitli" ölçütü geçerlidir (OpenF1 aboneliği yok, sahip kararı 2026-10-20) ve aşağıdaki "Kimlik bilgisi yokken geçme ölçütü" uygulanır; tam ölçüt ölçülemez.
  1. Oturum başladıktan 2–3 dk sonra: `curl -s -D - https://project-anthology-eight.vercel.app/api/live-timing` (yanıt gövdesi ve başlıklar).
  2. 10 sn arayla iki kez daha çağır; farkı karşılaştır. Aynı 5 sn içinde iki çağrı aynı yanıtı döndürmeli (önbellek).
  3. Tarayıcıda ana sayfayı aç (yarış penceresinde), ağ sekmesinde `/api/live-timing` isteklerinin ~12 sn aralıkla gittiğini ve başka dış istek olmadığını doğrula.
  4. Oturum bittikten >10 dk sonra tekrar çağır.
- **Geçme ölçütü:** oturum sırasında `live:true`, `sessionName` doğru (Sprint/Qualifying/Race), `rows` ≥ 18 ve `position` artan sırada, `teamColour` `#rrggbb`, rota `Cache-Control: public, s-maxage=5, stale-while-revalidate=15` yazar ama **Vercel `s-maxage`/`stale-while-revalidate`'i tarayıcıya giden yanıttan siler**, canlıda yalnızca `Cache-Control: public` görünür (2026-10-11 ölçümü; başlık birim testinde doğrulanır), tekrarlayan çağrılar tipik olarak `X-Vercel-Cache: HIT`/`STALE` (edge önbelleği; zorunlu ölçüt değil, içerik aynıysa yeterli), tracker sıralamayı güncelliyor; bitişten >10 dk sonra `live:false, rows:[]`.
- **R17 sonucu (2026-10-11, ölçülemedi):** yarış sırasında `/api/live-timing` 502 verdi. Neden: OpenF1 `401 {"detail":"Live F1 session in progress. Global API access (including past sessions) is restricted to authenticated users until the session ends. …"}` (`sessions`, `meetings`, `drivers`, `position`, `intervals` ve geçmiş `sessions?year=2024` dahil, 13:16Z–13:55Z). Ayrıntı: `logs/2026-10-11.md` §2. Bu sınamayı yapmadan önce her seferinde ilk iş ham OpenF1 yanıtına bakın: `curl -s -i "https://api.openf1.org/v1/sessions?session_key=latest"`; 401 ise 502'nin nedeni budur ve geri kalan ölçütler ölçülemez (1.7).
- **Kimlik bilgisi yokken geçme ölçütü (2026-10-11 düzeltmesinden sonra):** oturum sırasında `200 {"live":true,"restricted":true,…,"rows":[]}` (canlıda `Cache-Control: public`; 60 sn edge önbelleği `X-Vercel-Cache: HIT`/`STALE` ile görülür); ana sayfada "Canlı veri seans boyunca kilitli" metni; ağ sekmesinde `/api/live-timing` istekleri ~60 sn aralıkla ve kırmızı (502) istek yok.
- **Başarısızsa:** `502 {"error":"Live timing unavailable"}` (artık `Retry-After: 15` ile) → önce yukarıdaki ham OpenF1 yanıtı: **401** = canlı seans kimlik doğrulaması (kimlik bilgisi yok); 429/5xx = OpenF1 hız sınırı/kesinti; Vercel function log'una bakılır (Vercel MCP bu hesapta yok; sahip dashboard'dan log'u paylaşır). `live:false` ama oturum sürüyorsa → OpenF1 `sessions?session_key=latest` ham yanıtını (`curl https://api.openf1.org/v1/sessions?session_key=latest`) karşılaştır (`date_start/date_end`).
- Birim düzeyinde zaten doğrulanan davranışlar: `tests/live-timing-route.test.ts`.

### B. Snapshot senkronu, idempotency ve stale-while-revalidate (master-plan 1.3) — oturum sonrası

- **B0. Yarış sonrası OpenF1 geçici verisi (2026-10-11'den beri):** yarış seansı bittikten ve OpenF1 sonucu yayımladıktan sonraki ilk `sync-f1` koşusunda (QStash ile en geç ~30 dk) yanıtta `provisional.status: "written"`; `f1_snapshots`'ta o turun `results` satırı ve iki puan durumu satırı `source='openf1'`, puan durumu `StandingsTable.round` = yarışın turu. Ana sayfa kazanan kartı ve tur sayfası sonucu gösterir. Jolpica sonucu yayımlayınca satırlar `source='jolpica'` olur, yanıtta `provisional.status: "jolpica-has-results"`. Ara durumlar: `session-running`, `not-published`, `locked` (hata değildir).

- **Ne:** `sync-f1` due penceresinde çalışıyor mu, `settled` mantığı doğru mu, bayat satır anında sunulup arkada yenileniyor mu.
- **Nasıl:**
  1. QStash kuruluysa: Upstash console → *Logs*'ta `/api/cron/sync-f1` teslimatları (HTTP 200 + yanıt gövdesi: `upserted`, `skipped`, `settled`, `errors`). Değilse GitHub Actions: `gh run list --workflow=sync-f1-race-aware.yml --limit 10`; due penceresini izleyen :12 koşusunu bul, `gh run view <id> --log` ile "window(s) due — triggering live sync" ve yanıt JSON'unu (`upserted`, `skipped`, `settled`, `errors`) oku.
  2. Veritabanı (Supabase MCP, salt-okunur):
     ```sql
     select type, round, source, fetched_at from f1_snapshots
     where season = 2026 and round = 17 order by type, fetched_at;
     ```
     Beklenen: `qualifying`, `sprint`, `results`, `pitstops` satırları, hepsi `source='jolpica'`, `fetched_at` ilgili due zamanından sonra. Puan durumu: `select type, fetched_at from f1_snapshots where season=2026 and round is null;` → `standings_*` `fetched_at` yarış+3 sa sonrası.
  3. **Stale-while-revalidate gözlemi:** due zamanından hemen sonra ve cron koşusundan önce `/season/2026/round/17` sayfasını aç. Sayfa hızlı gelmeli (Jolpica beklemesi yok). ~1–2 dk sonra (2. sorgu ile) `results`/`qualifying` `fetched_at` değerinin arka plan yenilemesiyle ilerlediğini doğrula. Puan durumu bu yolla **yenilenmez** (bilinçli); yalnız saatlik cron günceller.
  4. **Settled kontrolü:** due + 24 sa sonrası (Pzt 14:30Z+) bir `sync-f1` koşusunun log'unda `settled > 0` ve ilgili tur için upstream çağrısı olmadığını (`upserted` düşük) doğrula.
- **Geçme ölçütü:** 1'de due sonrası koşu başarılı ve `errors: []`; 2'de beklenen satırlar ve kaynaklar; 3'te sayfa gecikmesiz + arka plan yenilemesi gözlemlendi; 4'te `settled` sayacı > 0.
- **Başarısızsa:** koşu yok → workflow `schedule`/Actions kotası; `errors` dolu → mesajı `jolpica` hız sınırı / ağ olarak sınıflandır; `fetched_at` due'dan önce → Jolpica sonucu henüz yayınlamamış olabilir (`hasResults` false, sonraki saatte yeniden dener).
- Güvenlik: `?force=1` yalnızca sahibin o anki açık onayıyla.

### C. Push bildirim penceresi (master-plan 1.4) — oturumdan ~30 dk önce

- **Ne:** `notify-sessions` doğru anda oturumu buluyor, `notified_sessions` dedupe satırı yazılıyor, abone varsa gönderim deneniyor.
- **Ön koşul:** bölüm 2 madde 2 (grant migration'ı) **uygulandı**. 2026-10-06 ölçümü: `notified_sessions` 0 satır, `push_subscriptions` 0 satır (henüz abone/oturum yok); yetki düzeltmesi öncesinde rota hataları yutup 200 dönüyordu, bu yüzden hafta sonunda yetkinin hâlâ yerinde olduğunu da ilk iş olarak `has_table_privilege('service_role', ...)` ile teyit edin.
- **Nasıl:**
  1. Oturumdan ~30 dk önceki koşuyu bul: `gh run list --workflow=notify-sessions.yml --limit 12`, `gh run view <id> --log` → `sessionsChecked: 1`, `claimed: 1`, `deduped: 0`, `failed: []` ve `notified: N` (abone yoksa 0). Aynı pencerede ikinci bir koşu `claimed: 0, deduped: 1` döner.
  2. `select * from notified_sessions where season = 2026 and round = 17 order by notified_at;` → sprint, qualifying ve race için birer satır, `notified_at` ilgili oturumdan 25–35 dk önce.
  3. Aynı oturum için ikinci satır **olmamalı** (dedupe; her 10 dk'lık koşuda tekrar bildirilmemeli).
- **Test aboneliği (sahip onayıyla):** gerçek abone yoksa, Expo biçiminde sahte bir token ile `/api/push/register` (POST) çağrısı yapılabilir; bu canlı DB'ye yazar, bu yüzden o anda sahibin açık onayı alınır ve iş bitince sahip SQL Editor'den satırı siler. Sahte token'a gönderim Expo tarafında `DeviceNotRegistered` ile düşer; amaç yalnızca "bildirim denendi + dedupe satırı yazıldı" kanıtıdır.
- **Geçme ölçütü:** 2'de üç satır, 3'te tekrar yok, 1'de koşu log'unda hata yok.
- **Düzeltildi (2026-10-08):** rota artık önce `notified_sessions` satırını yazıp ("claim") sonra gönderiyor. `23505` = daha önce gönderilmiş (`deduped`); başka bir yazma hatası gönderimi engeller ve koşu 500 döner (`failed` listesinde oturum), yani yetki hatası artık sessiz kalmaz ve her koşuda tekrar gönderim olmaz. Aboneler okunamazsa hiçbir oturum talep edilmez, sonraki koşu yeniden dener.

### D. JSON-LD ve SEO (master-plan 6.1)

- **Ajan (otomatik):** canlıdan şu sayfaların HTML'ini al ve `<script type="application/ld+json">` bloklarını ayrıştır: `/`, `/drivers/norris`, `/teams/mclaren`, `/season/2026/round/17`, `/season/2025/round/3`, `/anthology/brawn-2009`, `/machinery/ferrari-f2004`.
  - Beklenen tipler: `WebSite` (tümü) + `Person`, `SportsTeam`, `SportsEvent`, `Article`, `Vehicle`.
  - Zorunlu alanlar boş olmamalı: `SportsEvent` → `name`, `startDate`, `location.name`, `location.address.addressCountry`; `Person` → `name`; `SportsTeam` → `name`; `Article` → `headline`, `datePublished`. Ayrıca `og:image` meta etiketi ve `canonical` her sayfada olmalı.
  - 2026-10-06'da ölçülen eksik: tarihsel tur `SportsEvent` alanları boştu (yeniden tohumlamayla düzeldi); ana sayfada `og:image` yoktu (kod düzeltildi, bu sürüm canlıya çıktıktan sonra doğrulanır).
- **Sahip (elle):** [Rich Results Test](https://search.google.com/test/rich-results) ve [Schema Markup Validator](https://validator.schema.org/) ile yukarıdaki URL'lerden en az `SportsEvent` ve `Article` sayfalarını dene; Search Console → URL Denetimi → "Yayındaki URL'yi test et". Sonuçları (uyarı/hata sayısı) oturuma ilet. Search Console erişimi ajanda yok.

### E. Core Web Vitals / Lighthouse (master-plan 6.2)

- **Ajan:** PageSpeed Insights API (anahtarsız düşük hacimde çalışır, 429 gelirse sahip bir API anahtarı verir; anahtar dosyada saklanmaz):
  `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=mobile&category=performance` (ve `strategy=desktop`).
  URL'ler: `/`, `/season/2026`, `/grid`, `/drivers/norris`, `/circuits/spa`, `/machinery/ferrari-f2004`.
  Okunacaklar: `lighthouseResult.audits` → LCP, CLS, TBT; `loadingExperience.metrics` (CrUX saha verisi, varsa) → LCP, INP, CLS.
- **Geçme ölçütü (plan eşikleri):** LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (mobil). Saha verisi yoksa laboratuvar değerleri kaydedilir ve "saha verisi yok" notu düşülür.
- **İki ölçüm öner:** yarış dışı sakin bir saatte ve yarış penceresinde (canlı tracker açıkken) — fark CWV riskini gösterir.
- Sonuçlar `docs/reference/apex-reference.md` ölçüm tablosuna ve ilgili log'a işlenir.

### F. Sentry (master-plan 6.3)

- **Sahip gerektirir:** Sentry projesine (`anthology-z0/project-anthology`) erişim. Ajan Sentry'ye erişemez.
- **Kontrol listesi (sahip):** Vercel Production'da `SENTRY_DSN` ve `NEXT_PUBLIC_SENTRY_DSN` tanımlı mı (değerleri paylaşma, yalnız var/yok); Sentry'de son 24 saatte olay geliyor mu; bir **uyarı kuralı** (ör. "yeni sorun → e-posta") var mı. Hata yakalama doğrulaması için sahip bilerek bir hata üretebilir (ör. var olmayan bir API yolu 404 üretir ama Sentry'ye gitmez; gerçek bir sunucu hatası gerekir) ve olayın panelde göründüğünü ajana bildirir.
- Derleme tarafı zaten düzeltildi (`next build` çıktısında `Project not found` yok).

### G. Medya (migration uygulandıysa)

- `curl -s "https://project-anthology-eight.vercel.app/api/media?type=driver&keys=norris,hamilton"` → her anahtar için `status: image|placeholder`.
- İlerleme (salt-okunur): `select entity_type, status, count(*) from media_assets group by 1,2 order by 1,2;` — ayrıntılı sorgular `docs/reference/media-sistemi.md` Bölüm 13. Yanlış görsel gizleme ve kalite incelemesi sahibin site denetimine bırakıldı (master-plan 8.3).

---

## 4. Sonuç şablonu (ajan doldurur)

| Madde | Ölçüt | Sonuç (R18 sütunu dahil) | Kanıt (komut, çıktı özeti) |
|---|---|---|---|
| 1.1 Canlı zamanlama | A | R17: ölçülemedi · R18 yarış: kilitli ölçüt GEÇTİ · R18 quali: canlı ölçülmedi | R17 (2026-10-11): OpenF1 401; `logs/2026-10-11.md` §2. R18 yarış (2026-10-25T20:12Z): OpenF1 401; `/api/live-timing` 200 `{live:true,restricted:true,rows:[]}`, `Cache-Control: public`, 502 yok; ana sayfada 60 sn aralıkla 200 (11. ve 71. sn) ve "kısıtlıdır" metni. `live:false`: 22:17Z'de hâlâ `live:true` (canlı pencere yarış başlangıcından 4 sa), 2026-10-26T00:55:49Z'de `{live:false,sessionName:"Race",rows:[]}` (`X-Vercel-Cache: HIT`). Quali gecesi (10-24/25): oturum çalışmadı, canlı ölçülmedi. `logs/2026-10-25.md`, `logs/2026-10-26.md` |
| 1.3 Senkron + settled + SWR | B | R17: — · R18: quali tekrar yazmama GEÇTİ; results/pitstops/standings AÇIK | Quali (id 64481) `fetched_at` 22:30:03.716Z, sonraki 4 tikte (23:00–00:30Z) değişmedi. Results (id 64500) ve pitstops (id 64504) her tikte yeniden yazıldı (23:30:04Z → 00:30:07Z; 23:30:06Z → 00:30:09Z): kod due+24 sa (settled eşiği 22:30Z 10-26) dolana kadar yeniden çeker. Standings (id 231/232, `round` NULL) 00:30:06Z. Settle sonrası iki ardışık tik ölçülmedi. `logs/2026-10-26.md` |
| 1.4 Push penceresi | C | R17: — · R18: GEÇTİ (quali geri kurulum, yarış canlı) | `notified_sessions` R18 quali 20:30:04.674Z, yarış 19:30:03.063Z (tek satır); iki pencerede de GitHub `schedule` koşusu yok, QStash tiki 200 (yarış 19:30:00Z, 2515 ms) ⇒ tetikleyen QStash; `push_subscriptions` 0. `logs/2026-10-25.md` |
| 1.7 OpenF1 kilit ve geçici sonuç | A (kilitli) | R18 yarış: GEÇTİ · quali: canlı ölçülmedi | Yarış: OpenF1 401 (20:12Z–22:27Z), ilk 200 22:32:16Z; `results` satırı `source='openf1'` 22:30:09.8Z (22 satır), 23:30:04Z'de `jolpica` ile yerinde değişti; `provisional.status` dizisi logs_list'ten okunamadı. `logs/2026-10-26.md` |
| 1.9 gözlemi: kilit açılma süresi | — | R18 yarış: 32,3 dk · quali: canlı ölçülmedi | `date_end` 22:00:00Z; son 401 22:27:16Z, ilk 200 22:32:16Z (27,3–32,3 dk); `session_result` 22 satır. `logs/2026-10-26.md` |
| Jolpica gecikmesi (taban çizgisi) | — | R18 | Quali: ilk `jolpica` satırı 2026-10-25T20:00:06Z (bitişten ~22 sa; 11:00Z'de Jolpica `total: 0`); yarış sonucu: `results` 23:30:04Z, `pitstops` 23:30:06Z (bitişten 1 sa 30 dk). `logs/2026-10-25.md`, `logs/2026-10-26.md` |
| QStash `sync-f1` hafta sonu (1.6 kapısı) | — | R18 | Yarış sonrası tikler 22:30, 23:00, 23:30, 00:00, 00:30Z DELIVERED 200; 3 günlük `qstash_get_stats`: `failed` 0, `dlq` 0, `error`/`retry` toplam 64 (hangi zamanlama bilinmiyor). `logs/2026-10-26.md` |
| 6.1 JSON-LD | D (ajan) + sahip testleri | R17: — · R18: ölçülmedi | Session F kapsamı dışı |
| 6.2 CWV | E | R17: — · R18: ölçülmedi | Session F kapsamı dışı |
| 6.3 Sentry | F (sahip) | R17: — · R18: ölçülmedi | Session F kapsamı dışı |

Doldurduktan sonra: `logs/YYYY-MM-DD.md` bölümü + `docs/plans/master-plan.md` (yalnız ölçülenler `[x]` → silinir) + gerekirse `apex-reference.md` ölçüm satırları. Bu rehberin kendisi, tüm maddeler kapandığında silinir (git geçmişi arşivdir).
