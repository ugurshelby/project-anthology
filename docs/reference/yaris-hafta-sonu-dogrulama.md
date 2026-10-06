# Yarış Hafta Sonu Canlı Doğrulama Rehberi

Last verified: 2026-10-06

Bu doküman, **gerçek bir yarış hafta sonunda** yapılabilecek canlı doğrulamaları (master-plan 1.1, 1.3, 1.4, 6.1, 6.2, 6.3 ve medya) tek yerde toplar. Sahip yarış zamanı yeni bir oturum açıp "**yarış hafta sonu doğrulamasını başlat — `docs/reference/yaris-hafta-sonu-dogrulama.md`**" dediğinde ajan bu dokümanı okur ve sırayla uygular. Sonuçlar `logs/YYYY-MM-DD.md` içine, geçen maddeler `docs/plans/master-plan.md` içine işlenir (ölçülmeden kutu işaretlenmez).

Ajanın bu dokümanı kullanırken uyacağı kurallar (AGENTS.md ile aynı):
- Canlı veritabanında **yalnızca okuma** (Supabase MCP, `SELECT`). Yazma, migration veya tohumlama için sahibin o oturumdaki açık onayı gerekir.
- Cron uçları gizli anahtarla elle çağrılmaz; sonuçlar GitHub Actions log'larından okunur (`gh run view --log`).
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

**Önerilen ilk deneme: R17 Singapur** — sprint hafta sonu olduğu için sprint + quali + yarış üç oturumu tek hafta sonunda kapsar.

### R17 için zaman çizelgesi (kodun hesapladığı pencereler)

| Olay | UTC | TR | Dayanak |
|---|---|---|---|
| Sprint bildirim penceresi | Cmt ~08:25–08:35 | ~11:25–11:35 | `notify-sessions`: oturumdan ~30 dk önce (±5 dk), GitHub workflow'u her 10 dk |
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
| 1 | Medya migration'ı (`20261006000001_media_assets.sql`) | **Uygulandı** (2026-10-06, MCP). Kod henüz canlıda değilse `sync-media` çalışmaz; tablo boş. Yarış doğrulamasının zorunlu parçası değil. |
| 2 | **Push tablolarında `service_role` yetkisi** (`20261006000002_push_service_role_grants.sql`) | **Uygulandı** (2026-10-06, MCP; `has_table_privilege` ile doğrulandı). Önceki ölçümde yetki yoktu. |
| 3 | Test aboneliği (push için) | `push_subscriptions` 0 satır; mobil uygulama yayında değil. Bölüm 3.C'deki yöntemle sahibin onayıyla bir test satırı eklenebilir. |
| 4 | `MEDIA_CONTACT` Vercel Production | Eklendi (sahip, 2026-10-06). |
| 5 | GitHub secret `CRON_SECRET_KEY` + var `SITE_URL` | Diğer workflow'larla ortak, kullanımda. |

---

## 3. Doğrulamalar

Her madde: **ne**, **ne zaman**, **nasıl**, **geçme ölçütü**, **başarısızsa**.

### A. Canlı zamanlama (master-plan 1.1) — oturum sırasında

- **Ne:** `/api/live-timing` + ana sayfadaki `LiveRaceTracker`, gerçek bir OpenF1 oturumunda.
- **Nasıl:**
  1. Oturum başladıktan 2–3 dk sonra: `curl -s -D - https://project-anthology-eight.vercel.app/api/live-timing` (yanıt gövdesi ve başlıklar).
  2. 10 sn arayla iki kez daha çağır; farkı karşılaştır. Aynı 5 sn içinde iki çağrı aynı yanıtı döndürmeli (önbellek).
  3. Tarayıcıda ana sayfayı aç (yarış penceresinde), ağ sekmesinde `/api/live-timing` isteklerinin ~12 sn aralıkla gittiğini ve başka dış istek olmadığını doğrula.
  4. Oturum bittikten >10 dk sonra tekrar çağır.
- **Geçme ölçütü:** oturum sırasında `live:true`, `sessionName` doğru (Sprint/Qualifying/Race), `rows` ≥ 18 ve `position` artan sırada, `teamColour` `#rrggbb`, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, tekrarlayan çağrılar tipik olarak `X-Vercel-Cache: HIT`/`STALE` (edge önbelleği; zorunlu ölçüt değil, içerik aynıysa yeterli), tracker sıralamayı güncelliyor; bitişten >10 dk sonra `live:false, rows:[]`.
- **Başarısızsa:** `502 {"error":"Live timing unavailable"}` → OpenF1 hız sınırı/kesinti; Vercel function log'una bakılır (Vercel MCP bu hesapta yok; sahip dashboard'dan log'u paylaşır). `live:false` ama oturum sürüyorsa → OpenF1 `sessions?session_key=latest` ham yanıtını (`curl https://api.openf1.org/v1/sessions?session_key=latest`) karşılaştır (`date_start/date_end`).
- Birim düzeyinde zaten doğrulanan davranışlar: `tests/live-timing-route.test.ts`.

### B. Snapshot senkronu, idempotency ve stale-while-revalidate (master-plan 1.3) — oturum sonrası

- **Ne:** `sync-f1` due penceresinde çalışıyor mu, `settled` mantığı doğru mu, bayat satır anında sunulup arkada yenileniyor mu.
- **Nasıl:**
  1. GitHub Actions: `gh run list --workflow=sync-f1-race-aware.yml --limit 10`; due penceresini izleyen :12 koşusunu bul, `gh run view <id> --log` ile "window(s) due — triggering live sync" ve yanıt JSON'unu (`upserted`, `skipped`, `settled`, `errors`) oku.
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
  1. Oturumdan ~30 dk önceki koşuyu bul: `gh run list --workflow=notify-sessions.yml --limit 12`, `gh run view <id> --log` → `sessionsChecked: 1` ve `notified: N` (abone yoksa 0).
  2. `select * from notified_sessions where season = 2026 and round = 17 order by notified_at;` → sprint, qualifying ve race için birer satır, `notified_at` ilgili oturumdan 25–35 dk önce.
  3. Aynı oturum için ikinci satır **olmamalı** (dedupe; her 10 dk'lık koşuda tekrar bildirilmemeli).
- **Test aboneliği (sahip onayıyla):** gerçek abone yoksa, Expo biçiminde sahte bir token ile `/api/push/register` (POST) çağrısı yapılabilir; bu canlı DB'ye yazar, bu yüzden o anda sahibin açık onayı alınır ve iş bitince sahip SQL Editor'den satırı siler. Sahte token'a gönderim Expo tarafında `DeviceNotRegistered` ile düşer; amaç yalnızca "bildirim denendi + dedupe satırı yazıldı" kanıtıdır.
- **Geçme ölçütü:** 2'de üç satır, 3'te tekrar yok, 1'de koşu log'unda hata yok.
- **Bilinen zayıf nokta:** `notify-sessions` `notified_sessions` insert hatasını kontrol etmiyor (yetki hatası sessiz kalır); düzeltme önerisi master-plan 1.4'te.

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

| Madde | Ölçüt | Sonuç | Kanıt (komut, çıktı özeti) |
|---|---|---|---|
| 1.1 Canlı zamanlama | A | geçti / kaldı / ölçülmedi | |
| 1.3 Senkron + settled + SWR | B | | |
| 1.4 Push penceresi | C | | |
| 6.1 JSON-LD | D (ajan) + sahip testleri | | |
| 6.2 CWV | E | | |
| 6.3 Sentry | F (sahip) | | |

Doldurduktan sonra: `logs/YYYY-MM-DD.md` bölümü + `docs/plans/master-plan.md` (yalnız ölçülenler `[x]` → silinir) + gerekirse `apex-reference.md` ölçüm satırları. Bu rehberin kendisi, tüm maddeler kapandığında silinir (git geçmişi arşivdir).
