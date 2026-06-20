# Bölüm 4 — Mimari & Teknik Borç

## Özet

Apex F1 arşivinin veri mimarisi genel olarak doğru yönde: dış kaynak verisi `jsonb` snapshot olarak saklanıyor, okuma katmanı DB öncelikli ve mevcut sezon için staleness kontrolüyle canlı Jolpica'ya kaçabiliyor. `f1_snapshots` tek tablo modeli 2026+ için ölçeklenebilir; satır hacmi düşük, erişim deseni iyi indekslenmiş ve `round IS NULL` için sonradan eklenen partial unique index kritik bir açığı kapatıyor.

Ancak dokümantasyondaki bazı eski varsayımlar güncel kodla aynı değil. Kullanıcının değerlendirme maddesindeki "live API → snapshot → static" zinciri kodda birebir böyle değil; gerçek F1 okuma sırası `f1_snapshots` → static JSON → canlı Jolpica, fakat mevcut sezon snapshot'ı stale veya içerik olarak bozuksa DB'den canlıya erken bypass yapılıyor (`lib/data/f1.ts`). Haber tarafında `news_cache` artık ölü relation değil; `sync-news` cron'u tabloya yazıyor ve okuma katmanı onu birincil kaynak kabul ediyor (`app/api/cron/sync-news/route.ts`, `lib/data/news.ts`).

En önemli teknik borçlar test yüzeyinde ve cron davranışında: fallback/staleness, Supabase upsert semantiği, cron auth/env guard'ları ve gerçek ingestion süreleri unit/integration testlerle korunmuyor. `maxDuration = 300` normal günlük akış için yeterli görünüyor; retry, rate-limit veya full-season benzeri geniş kapsamlar için süre garantisi zayıf.

## Veri Mimarisi & Fallback Zinciri

F1 okuma katmanının gerçek davranışı `lib/data/f1.ts` içinde tanımlı. Sezon snapshot'ları için sıra şudur:

1. `f1_snapshots` tablosundan `(season, round IS NULL, type)` okunur.
2. Satır yoksa `public/data/f1/{season}/...` static JSON denenir.
3. Yalnızca `season >= CURRENT_SEASON` ise `/api/f1-season` üzerinden canlı Jolpica denenir.

Round snapshot'larında da aynı model var: `f1_snapshots` → `public/data/f1/{season}/rounds/{round}/{type}.json` → mevcut sezon için canlı Jolpica. Tarihsel sezonlarda Jolpica bilinçli olarak devre dışı; bu, `lib/data/f1.ts` yorumlarında da "historical must be in DB" ilkesiyle uyumlu.

Bu zincir "snapshot first" olduğu için arşiv ürünü açısından doğru: kullanıcı yolunda dış API'ye bağımlılık azalıyor, Supabase public read + static fallback ile ilk boyama daha deterministik oluyor. Robust tarafları:

- `fetchDbSnapshotRow()` Supabase hatasında fallback loglayıp zinciri kırmıyor.
- Mevcut sezon satırları `isCalendarSnapshotStale`, `isStandingsSnapshotStale` ve `isRoundSnapshotStale` ile zaman duyarlı kontrol ediliyor (`lib/f1/snapshotStaleness.ts`).
- F1DB kaynaklı boş/placeholder current-season verisi, örneğin boş `raceName` veya eksik `Constructors`, içerik geçerlilik guard'ıyla canlı Jolpica'ya yönlendiriliyor (`lib/data/f1.ts`).
- Tarihsel veride canlı API'ye düşülmemesi, Jolpica rate-limit ve veri değişkenliği riskini azaltıyor.

Riskli taraf: fallback sırası dokümantasyon ve zihinsel model açısından karışık. "live API → snapshot → static" ifadesi güncel koda göre doğru değil. Mimari kararın adı açıkça "DB snapshot primary, live only for current-season staleness" olmalı. Aksi halde ileride biri canlı API'yi kullanıcı yolunun birincil kaynağı sanıp latency/rate-limit riskini geri getirebilir.

## Veritabanı Şeması Değerlendirmesi

`f1_snapshots` tek tablo modeli korunmalı. `supabase/migrations/20260603000001_initial_schema.sql` sezon seviyesini `round IS NULL`, round seviyesini `round NOT NULL` olarak aynı tabloda tutuyor; `type` CHECK constraint ile kanonik değerleri zorluyor ve `source` provenance alanı içeriyor. Bu, `pre-plans/database-schema-plan.md` içindeki eski iki-tablolu modele dönmeme kararıyla uyumlu.

2026+ ölçeği açısından tablo hacmi sorun değil. Bir sezon için kabaca calendar + iki standings + her round için results/qualifying/sprint snapshot'ları var. 24 roundluk bir sezonda bile yıllık satır sayısı onlar mertebesinde kalır; 1950'den 2026+'ya tüm arşiv için bile tablo PostgreSQL açısından küçük kalır. `jsonb` saklama da bu aşamada doğru, çünkü UI Ergast/Jolpica `MRData` zarfını doğrudan tüketiyor ve şema dış kaynağa göre değişebilir.

Kritik düzeltme zaten yapılmış: `UNIQUE(season, round, type)` PostgreSQL'de `round NULL` satırlarını tekilleştirmez. `supabase/migrations/20260606000001_partial_unique_index.sql` içindeki `idx_f1_snapshots_season_type_no_round` bu açığı kapatıyor. `lib/f1Ingest.ts` de sezon seviyesinde plain upsert yerine update-first/insert-later yaparak partial unique index ile uyumlu çalışıyor.

Şema tarafında kalan borçlar:

- `f1_snapshots` için veri versiyonlama yok. Son snapshot üstüne yazılıyor; kaynak payload değiştiğinde diff/audit tutulmuyor.
- `source` alanı var ama confidence/priority modeli yok. F1DB tarihsel, Jolpica güncel, OpenF1 farklı domain için kullanılıyor; aynı `type` alanına farklı kaynak yazma stratejisi ileride açık belge gerektirir.
- `results` gibi analitik sorgular hâlâ `jsonb` içinden hesaplanıyor. Ürün "kariyer istatistikleri", "pilot bazlı tüm podyumlar" gibi ağır sorgulara büyürse `race_results` gibi türetilmiş relational tablo gerekebilir. Şimdi zorunlu değil.
- `radio_moments.round` şu anda `sync-radio` içinde `null` kalıyor; `f1_snapshots(season, round)` ile soft ilişki potansiyeli var ama ingestion bunu doldurmuyor (`app/api/cron/sync-radio/route.ts`).

## Haber Agregasyonu

`news_cache` artık ölü relation değil. Eski planda (`pre-plans/database-schema-plan.md`, `pre-plans/data-ingestion-plan.md`) "okunuyor ama yazılmıyor" tespiti doğruydu; güncel kod bunu kapatmış:

- `lib/news/aggregate.ts` RSS kaynaklarını topluyor, F1 filtrelemesi yapıyor, canonical URL ile dedupe ediyor, Jaccard title clustering uyguluyor ve 15 dakikalık warm-instance in-memory cache kullanıyor.
- `app/api/cron/sync-news/route.ts` `aggregate({ maxItems: 100 })` sonucunu `news_cache` tablosuna `url` conflict key'iyle upsert ediyor ve 30 günlük retention uyguluyor.
- `lib/data/news.ts` önce `news_cache` okuyor; boş veya hatalıysa `/api/news`, sonra `public/news-fallback.json` fallback'ine düşüyor.
- `app/api/news/route.ts` artık canlı RSS fallback route'u; public kullanıcı yolundaki tek kaynak değil.

Buradaki ana risk kalıcı cache'in upsert doğruluğunda. `sync-news` şu anda her item için ayrı upsert yapıyor; 100 item için kabul edilebilir, ama batch upsert daha temiz ve hızlı olur. Ayrıca `summary` alanına yazılmıyor, sadece `description` yazılıyor; `lib/data/news.ts` `row.summary ?? row.description` kullandığı için davranış bozulmuyor, fakat şema anlamı bulanık kalıyor.

## Test & Güvenilirlik

Aktif testler dar ama faydalı yüzeyleri koruyor:

- `tests/f1Calendar.test.ts`: `isRaceDone` ve `roundSuffixToSnapshotType` davranışını test ediyor.
- `tests/aggregate.test.ts`: RSS işleme çekirdeğinde dedupe, F1 filtreleme ve sort davranışını test ediyor.
- `tests/f1-icons.test.ts`: pilot/takım asset resolver davranışını ve diacritic normalizasyonunu test ediyor.

Kritik eksikler:

- `lib/data/f1.ts` için DB → static → live fallback testi yok.
- Current-season stale snapshot'ın canlı Jolpica'ya bypass ettiği path test edilmiyor.
- İçerik-invalid placeholder guard'ı test edilmiyor.
- `lib/f1Ingest.ts` sezon seviyesinde `round IS NULL` update-first davranışı ve partial unique index uyumu test edilmiyor.
- `app/api/cron/sync-f1/route.ts`, `sync-news` ve `sync-radio` için auth, env eksikliği, hata toplama ve başarılı response testleri yok.
- `news_cache` yazım mapping'i, retention delete ve `/api/news` fallback zinciri integration seviyesinde test edilmiyor.
- `lib/f1/snapshotStaleness.ts` ve `lib/f1/syncSchedule.ts` gibi zaman-duyarlı modüller ayrı edge-case testleriyle korunmuyor.

20 Vitest testinin geçiyor olması iyi bir taban, ama mimarinin en kritik parçası olan Supabase/Jolpica fallback ve cron ingestion davranışı henüz test piramidinin dışında.

## Cron & Ingestion

`vercel.json` günlük üç cron tanımlıyor: `sync-news` 06:00, `sync-f1?scope=season` 07:00, `sync-radio` 08:00. Üç route da `runtime = 'nodejs'`, `dynamic = 'force-dynamic'` ve `maxDuration = 300` kullanıyor (`app/api/cron/sync-f1/route.ts`, `app/api/cron/sync-news/route.ts`, `app/api/cron/sync-radio/route.ts`).

`sync-news` için 300 saniye fazlasıyla yeterli görünüyor. `lib/news/aggregate.ts` toplam RSS timeout'unu 12 saniyeyle sınırlıyor; ardından en fazla 100 upsert ve retention delete yapılıyor. Normal Supabase latency altında dakikalar mertebesine çıkmamalı.

`sync-f1` için 300 saniye normal current-season akışında muhtemelen yeterli. Route yalnızca `CURRENT_SEASON` çekiyor: calendar, gerekirse standings ve scope'a giren round'lar. Ancak `lib/f1/sources/jolpica.ts` hâlâ global 1200 ms fetch floor ile seri davranıyor; `lib/f1Ingest.ts` içindeki `runBounded` helper route içinde kullanılmıyor. Retry/backoff devreye girerse 300 saniye marjı hızla azalır. Ayrıca `scope=season` adı yanıltıcı: plandaki gibi 1950/2022..current backfill yapmıyor, current-season içinde daha geniş yenileme yapıyor.

`sync-radio` en riskli cron. OpenF1 adapter rate-limit nedeniyle session'ları sequential işliyor; her session için driver/radio fetch'i paralel, ama session döngüsü seri. Günlük tam sezon session listesi büyürse 300 saniye ve OpenF1 30 req/min limiti arasındaki gerçek davranış ölçülmeli. Ayrıca route meeting'den `round` türetmiyor; `round` her zaman `null` kalıyor.

## Teknik Borç Matrisi (Etki × Efor)

- Yüksek etki / Düşük efor: `sync-f1` scope adlarını ve dokümantasyonu gerçek davranışa hizala. Kod current-season yeniliyor; plan tarihsel full backfill anlatıyor.
- Yüksek etki / Düşük-Orta efor: `lib/data/f1.ts` fallback ve staleness için unit test ekle. Bu, kullanıcıya görünen arşiv doğruluğunu doğrudan korur.
- Yüksek etki / Orta efor: Cron route testleri ekle. Auth, eksik env, upstream hata ve partial success response'ları korunmalı.
- Yüksek etki / Orta efor: `sync-f1` Jolpica fetch stratejisini ölç ve gerekirse bounded concurrency'ye geçir. `runBounded` hazır ama kullanılmıyor.
- Orta etki / Düşük efor: `sync-news` mapping'inde `summary` alanını da doldur veya `description`/`summary` ayrımını belgeleyip sadeleştir.
- Orta etki / Düşük efor: `sync-news` item başı upsert yerine batch upsert kullan.
- Orta etki / Orta efor: `sync-radio` meeting verisinden round/circuit eşlemesi üret; `radio_moments` ile F1 takvimi arasındaki soft ilişkiyi kullanılabilir hale getir.
- Orta etki / Orta efor: Cron duration/latency metriklerini logla ve response'daki `durationMs` değerlerini kalıcı gözlemlenebilirliğe taşı.
- Düşük-Orta etki / Orta efor: `jsonb` üstünden sık hesaplanan istatistikler için materialized/türetilmiş tablo ihtiyacını gözlemle; şimdilik relational'a erken açma.
- Düşük etki / Düşük efor: `pre-plans/*` dokümanlarında tamamlanmış TODO'ları "tamamlandı" olarak işaretle veya güncel mimari dokümanına yönlendir.

## Öncelik Sırası (1-10)

1. `lib/data/f1.ts` için DB/static/live fallback, stale bypass ve content-invalid guard testlerini ekle.
2. `app/api/cron/sync-f1/route.ts` için auth, env, upstream hata ve başarılı ingestion response testlerini ekle.
3. `lib/f1Ingest.ts` sezon-level `round IS NULL` update-first davranışını test et; partial unique index kararını regression testle koru.
4. `sync-f1` scope terminolojisini düzelt: current-season refresh mi, full historical backfill mi netleştir.
5. Jolpica ingestion süresini ölç; 300 saniye içinde worst-case retry senaryosunu doğrula, gerekirse bounded concurrency uygula.
6. `sync-news` için `news_cache` mapping ve retention testleri ekle; `summary`/`description` alanlarını tutarlı hale getir.
7. `sync-radio` için round eşlemesini doldur ve cron süresini OpenF1 rate-limit altında ölç.
8. `lib/f1/snapshotStaleness.ts` ve `lib/f1/syncSchedule.ts` için zaman edge-case testleri ekle.
9. Cron response/loglarını kalıcı gözlemlenebilirliğe bağla; sadece response JSON'una güvenme.
10. Analitik ihtiyaçlar belirginleşirse `results` verisinden türetilmiş relational read model tasarla; şu aşamada `jsonb` snapshot modelini koru.
