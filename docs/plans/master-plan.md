# Anthology (Apex) — Master Plan

> **Temel Otorite ve Tek Canlı İş Listesi:** Bu döküman doğrudan geliştirici vizyonu ve direktifleri doğrultusunda oluşturulmuş en temel operasyonel rehberdir. Projedeki tüm planlama, geliştirme ve bakım adımları bu liste üzerinden yürütülür.  
> Bir madde yalnızca kodda veya ölçülmüş bir çalışma sonucunda doğrulandığında `[x]` olarak işaretlenir. Tamamlanan planlar ve süreçler geçmiş git kayıtlarına devredilir; dökümanda yalnızca aktif açık işler yer alır.  
> **Temel Vizyon Belgesi:** `docs/vision/apex-vision.md`  
> **Tasarım Sistemi Mimarisi:** `docs/design/apex-design.md` (Apple tasarım felsefesi + F1 teknik kimlik sentezi)  
> **Canlı Canlı Referans & Ölçümler:** `docs/reference/apex-reference.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme & Ölçüm:** 2026-10-06  

---

## 1. Vizyon ve Misyon

* **Vizyon (Nereye Ulaşmak İstiyoruz?):** Motor sporları tutkusunu ve zengin Formula 1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan harmonik bir veri mimarisiyle, gecikmesiz, akıcı, modern ve editoryal derinliği yüksek bir arayüzde birleştiren; F1 kültürünün küresel ölçekteki dijital başvuru ve deneyim merkezi olmak.
* **Misyon (Bunu Nasıl ve Ne İnşa Ederek Yapıyoruz?):** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi (sıfır takılma, kusursuz edge caching) ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

## 2. Mevcut Doğrulanmış Durum (Tüm Katmanların Ölçülmüş Gerçekliği)

| Katman | Ölçülen Durum | Kanıt & Metrik |
| :--- | :--- | :--- |
| **Birim & Entegrasyon Testleri** | ✅ 49 Test Dosyası, 407 Test Başarılı | `npx vitest run` (19.8s, 0 hata, %100 yeşil) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata | `npm run lint` (0 error, 15 warnings, kod 0) |
| **Web Production Build** | ✅ 50/50 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack, kod 0) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Varlık Altyapısı** | ✅ 64 Varlık Yolu Denetlendi, 0 Kırık Yol | `public/brand/`, `public/circuits/` (25 SVG), `public/tyres/` (11 SVG), `public/glossary-icons/` (20 WebP), `public/stories/` (56 PNG) |
| **Tasarım Sistemi Orkestrasyonu** | ✅ Tamamlandı | `apex-design.md`, `tokens.json`, 5 katmanlı `skills/` |
| **Mobil Uygulama (Expo 56)** | ⚠️ Beklemede | `mobile/` diskte mevcut, gitignored; sahip incelemesi bekliyor |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Açık İşler: Önem Sırasına Göre Faz Planı

> Doğrulanıp tamamlanan maddeler (1.2, 2.1, 2.2, 3.1–3.3, 4.1–4.2, 5.1–5.2) bu listeden silindi; kanıtları `logs/2026-10-06.md` ve git geçmişindedir. Burada yalnızca açık (`[ ]`) ve kısmi (`[~]`) işler kalır.

---

### ⏱️ Faz 1: Kusursuz Saat — Veri Mimarisi, Canlı Senkronizasyon & Caching
*Vizyonun 1. önceliği: Arka planda saat gibi işleyen harmonik veri mimarisi ve sıfır gecikmeli yanıt.*

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması:**
  - Doğrulandı: `/api/live-timing` rota simülasyonu (`tests/live-timing-route.test.ts`, 10 test): canlı pencere + 10 dk bitiş toleransı, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, 25 eşzamanlı istek → 1 upstream turu (stampede guard), 5 sn TTL memo, upstream hata / 8 sn zaman aşımında son iyi sonucun sunulması, 502 (genel gövde) ve 429 (`Retry-After`) yolları. OpenF1 `sessions?session_key=latest` canlı probu: HTTP 200, 1.4 sn (2026-10-06; son seans 2026-10-04 Race, bitmiş → rota `live:false` döner).
  - Açık: gerçek bir yarış hafta sonunda canlı seansla `LiveRaceTracker` + rotanın uçtan uca gözlemi. (Eski plan metnindeki `s-maxage=3 / swr=9` koddan farklıydı; kod ve `apex-reference.md` `5 / 15` — OpenF1'in paylaşımlı 3 req/sn bütçesi — olarak doğrulandı.)
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.A.
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger:**
  - Doğrulandı: `sync-f1` yerleşmiş (settled) snapshot'ı yeniden çekmiyor. Jolpica kaynaklı bir satır, due penceresinden ≥ 24 sa sonra çekildiyse final sayılır (`isSnapshotSettled`, `loadSnapshotFetchTimes`); yalnızca `source='jolpica'` satırları sayılır (F1DB placeholder'ı asla settled olmaz), DB okunamazsa her şey çekilir (fail-open), ertelenen yarış otomatik settled olmaktan çıkar, sonuç ve pit stop ayrı kapılanır, `?force=1` hepsini zorlar, yanıtta `settled` sayacı döner. Testler: `tests/sync-f1-idempotent.test.ts` (11 test).
  - Doğrulandı (sahip kararı uygulandı — "bayat satırı hemen sun, arkada yenile"): okuma yolu güncel sezonda bayat ama yakın tarihli (≤ 3 gün, `MAX_SERVE_STALE_MS`) DB satırını anında sunar ve yanıttan sonra `after()` ile arka planda Jolpica'dan yeniler (`lib/data/snapshotRefresh.ts`; takvim, sonuç, sıralama turu, sprint, pit stop; `has*` doğrulaması, `source='jolpica'`, sunucu örneği başına snapshot başına 60 sn bekleme, `next build` sırasında çalışmaz). Satır yok / içerik geçersiz / 3 günden eski ise eskisi gibi canlıya gider. Testler: `tests/snapshot-refresh.test.ts` (8), `tests/snapshot-refresh-read.test.ts` (5).
  - Bilinçli istisna: pilot/takım puan durumu arka planda yenilenmez, bayat sunulur ve saatlik `sync-f1` cron'u yeniler — liderlik değişimi push bildirimi eski/yeni lideri karşılaştırdığı için sayfa kaynaklı bir yenileme bildirimi sessizce yutardı. Yarış sonrası puan durumu en fazla ~1 saat eski görünebilir.
  - Açık: gerçek yarış hafta sonunda gözlem (1.1 ile birlikte). Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.B.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması:**
  - Ölçüm (Supabase MCP, salt-okunur, 2026-10-06): `notified_sessions` 0 satır, `push_subscriptions` 0 satır ve **`service_role`'ün bu iki tabloda hiçbir yetkisi yok** (migration'lar yalnızca `anon/authenticated` için `REVOKE` yazmış, varsayılan yetkilere güvenmiş). Sonuç: `/api/push/register` ve `notify-sessions` bu tabloları okuyup yazamıyor; rota hataları yutuyor (`insert` hatası kontrol edilmiyor). Önceki "tablo devrede" notu yanlıştı.
  - Uygulandı (2026-10-06, sahip onayıyla): `supabase/migrations/20261006000002_push_service_role_grants.sql` — `service_role` artık iki tabloda SELECT/INSERT/UPDATE/DELETE yapabiliyor (`has_table_privilege` ile doğrulandı), anon/authenticated kapalı (gerçek anon REST: 401), `set_updated_at` uyarısı kalktı.
  - Açık: yarış hafta sonunda oturumdan ~30 dk önce `notified_sessions` satırının oluşması (abone yoksa gönderim 0, satır yine yazılır); `insert` hatasının loglanması (küçük kod iyileştirmesi). Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.C.
- [~] **2.3 Takım İçi Pilot Düellosu (Head-to-Head):**
  - Hazır: `getSeasonHeadToHead(year)` (`lib/data/f1.ts`, `lib/f1/headToHead.ts`; `tests/head-to-head.test.ts`, 6 test) takım bazında gerçek Sıralama ve Yarış H2H sayımını verir (iki toplu sorgu, upstream çağrısı yok).
  - Açık (frontend): `GarageTeamPanel`'deki `TeammateHeadToHead` şu an şampiyona puanı/sırasına göre; grid sayfası `getSeasonHeadToHead` ile beslenip Quali / Race skorunu göstermeli.
- [~] **2.4 Ana Sayfa Sezon Renk Senkronizasyonu:**
  - `HomeWireFeed` `season` prop'unu destekliyor, ancak tek çağrı yeri (`app/[locale]/page.tsx`) `season` geçirmiyor ve ana sayfada geçmiş sezon seçimi akışı yok → davranış henüz erişilebilir değil. Açık (frontend/ürün): hangi akışta geçmiş sezon bağlamı verileceğine karar verip prop'u bağlamak.

---

### ⚙️ Faz 4: Machinery — İkonik Araçlar Koleksiyonu
*Vizyonun 4. önceliği: Formula 1'in ikonik şasi, motor ve mühendislik şaheserlerini sergileyen vitrin.*

- [~] **4.3 Çapraz Bağlantılar:**
  - Araç detay sayfaları sözlüğe (`/tech-glossary?q=`) ve diğer sayfalara bağlı, `/machinery` ana navigasyon ve footer'da. Açık: ters yön yok — pilot / takım / sezon sayfalarından `/machinery/[id]`'ye bağlantı bulunmuyor.

---

### 📖 Faz 5: Tech Glossary 2.0 (Regülasyonlar ve Çağlar)
*Vizyonun 5. önceliği: Teknik kuralların sporu nasıl şekillendirdiğini gösteren eğitici arşiv.*

- [~] **5.3 Dinamik Sözlük Köprüleri:**
  - Araç sayfası terim çipleri sözlük aramasına bağlı. Açık: terimlerin hikaye ve yarış sayfalarında otomatik vurgulanıp sözlüğe linklenmesi yok.

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals
*Vizyonun 6. önceliği: Ürünün arama motorlarında kusursuz indekslenmesi ve performans tescili.*

- [~] **6.1 Structured Data (JSON-LD) Doğrulaması:**
  - Ölçüm (canlı, 2026-10-06): ana sayfa `WebSite`; sürücü `Person`, takım `SportsTeam`, tur `SportsEvent` ve hikâye `Article` JSON-LD'leri mevcut ve parse ediliyor. Kusurlar: (a) tarihsel tur `SportsEvent`'inde `name`, `location.name`, `addressLocality`, `addressCountry` boştu — kök neden F1DB adaptörüydü, düzeltilip canlı DB yeniden tohumlandı, `/season/2025/round/3` artık `Japanese Grand Prix` / `Suzuka` / `Japan` basıyor (canlı doğrulandı); (b) ana sayfada `og:image` yoktu → `app/[locale]/page.tsx` metadata'sına `/opengraph-image` eklendi, yerelde doğrulandı (canlıda ana sayfa `og:image` görünüyor).
  - `lib/seo.ts`'e `sportsEventJsonLd` / `vehicleJsonLd` kurucuları eklendi (Machinery detayı `Vehicle` basıyor, yerelde doğrulandı); `sportsEventJsonLd` tur sayfasına bağlı değil (sayfa hâlâ satır içi nesne kullanıyor) ve zorunlu alan koruması yok.
  - Açık: tur sayfasını `sportsEventJsonLd`'ye bağlayıp zorunlu alan boşken JSON-LD basmamak; schema validator + Search Console doğrulaması (sahip erişimi).
  - Doğrulama adımları: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.D.
- [ ] **6.2 Core Web Vitals & Lighthouse Baseline:**
  - Canlı prod ortamında LCP (<2.5s), INP (<200ms) ve CLS (<0.1) performans eşiklerinin ölçülerek tescillenmesi.
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.E.
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği:**
  - Düzeltildi: kaynak haritası yüklenmediğinde release oluşturma kapatıldı (`next.config.ts`: `release.create` / `finalize` = `SENTRY_UPLOAD_SOURCE_MAPS=true` + token). `npm run build` çıktısında `Project not found` 0 kez (önceki build'de vardı).
  - Açık: prod'da hata yakalama / alert akışının doğrulanması (Sentry projesi `anthology-z0/project-anthology` erişimi — sahip).
  - Sahip adımları: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.F.
---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem
*Sahip kararları ve yasal netleştirme gerektiren maddeler.*

- [ ] **7.1 `public/stories` 56 Görselin Lisans Manifestosu:**
  - Kalan 56 hikaye görselinin açık lisans kayıtlarının (Public Domain / CC-BY) tamamlanması veya alternatif teknik illüstrasyonlarla güncellenmesi (sahip kararı).
- [ ] **7.2 Editoryal İnceleme (Sahip):**
  - Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`). Sahip genel site denetimini kendisi yapıp hataları bildirecek; ajandan ayrıca olgusal doğrulama istenmedi.
  - Yeni frontend içeriği (kaynakla doğrulanmadı; sahip site denetiminde bildirecek): `data/circuits/lore.ts`, pist irtifa/telemetri sayıları (`CircuitElevationProfile`), `data/machinery/cars.ts`, `RegulationErasPanel`, `TyreThermalWindows`.
- [ ] **7.3 Mobil Uygulama (Sahip):**
  - Cihazda Expo Go / preview test, App Store / Google Play süreçleri ve `mobile/` deposunun git durumu.
- [ ] **7.4 Yasal Mailbox'lar (Sahip):**
  - `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucularının sahibin izlediği gerçek e-posta adresleriyle değiştirilmesi.

---

### 🖼️ Faz 8: Görsel Temin Sistemi (Media) — Canlıya Alma ve Arayüz Entegrasyonu
*Lisans doğrulamalı pilot/takım/araç/pist görselleri. Backend ve arayüz canlıda (2026-10-06, `f0f7f30`), migration'lar uygulandı; `media_assets` tablosu henüz boş olduğu için arayüz placeholder gösterir. `sync-media.yml` workflow'u GitHub'da aktif; ilk koşuyla tablo dolmaya başlar.*

- [~] **8.1 Migration'ı Canlıya Uygula ve İlk Dolumu Başlat:**
  - **Uygulandı (sahip onayıyla, 2026-10-06, Supabase MCP `execute_sql`):** `20261006000001_media_assets.sql` (yalnızca satır içi SQL yorumları çıkarılarak) ve `20261006000002_push_service_role_grants.sql`; `supabase_migrations.schema_migrations` kayıtları repo sürümleriyle eklendi (10 kayıt, repodaki 10 dosyayla birebir). Doğrulama: `media_assets` + `media_sync_state` + 6 indeks, RLS açık; `media_assets` politikası yalnızca `resolved` ve `rejected` olmayan satırlar; anon yalnızca 20 arayüz kolonunu okuyabiliyor (13 özel kolon kapalı); gerçek anon REST: genel kolonlar 200, `last_error` ve `select=*` 401; `media` bucket (public, 3 MB, `image/webp`); `service_role` 4 tabloda tam yetkili; `set_updated_at` `search_path=""`, güvenlik uyarısı kalktı.
  - `MEDIA_CONTACT` Vercel Production'a eklendi (sahip, 2026-10-06); değer repoya yazılmaz.
  - Canlıya çıktı (2026-10-06): `/media-sources`, `/api/media` (anahtarlar placeholder döner) ve `/api/cron/sync-media` (yetkisiz 401) canlıda; `sync-media` workflow'u aktif listede. Açık: ilk koşu (saatlik tetik ya da `workflow_dispatch`; ilk dolum ~245 varlık, birkaç saat) ve `media-sistemi.md` Bölüm 13'teki SQL ile ilerleme kontrolü.
  - `.github/workflows/sync-media.yml` saatlik (Vercel Hobby sub-daily cron'a izin vermediği için `vercel.json`'a konmadı), repo secret `CRON_SECRET_KEY` + var `SITE_URL` diğer workflow'larla ortak. Henüz koşmadı.
- [~] **8.2 Arayüz Entegrasyonu (frontend):**
  - Doğrulandı (2026-10-06, yerel build, tarayıcı): `MediaAssetView` + 4 türde parametrik SVG placeholder (`components/media/placeholders/`) pilot, takım, grid paneli, makine, pist ve ana sayfa yüzeylerine bağlı; DB boşken tüm sayfalar placeholder ile hatasız açılıyor (kırık görsel 0, hydration hatası 0, istemci `/api/media` çağrısı yok). `/media-sources` (lisans, marka ve takedown sayfası) ve altbilgi bağlantısı çalışıyor. Testler: `media-components.test.ts` (7), `media-machinery-keys.test.ts` (7).
  - Machinery eşlemesi düzeltildi: `redbull-rb19` slug'ı curated ile hizalandı, `lotus-72` curated listeye eklendi (Commons'tan elle seçilen 3 dosya, kuru çalıştırmada CC BY-SA 3.0 ile çözüldü); 6/6 araç için `iconic:<id>` girdisi var ve test koruyor.
  - Açık: gerçek bir görsel + atıf rozeti (ⓘ) + marka notunun tarayıcıda görülmesi — migration ve ilk dolumdan sonra yapılabilir (şu an yalnızca birim testlerle doğrulandı).
- [ ] **8.3 İlk Dolum Sonrası Kalite İncelemesi (sahip — site denetimi başlarken hatırlatılacak):**
  - Düşük güvenli seçimlerin SQL ile listelenip yanlışların `review='rejected'` yapılması (görsel anında gizlenir, sistem sıradakini seçer). Bilinen zayıflar: bazı pistlerde etkinlik karesi (`anderstorp`, `estoril`, `watkins_glen`), Nürburgring tek viraj fotoğrafı, 2021 McLaren/Alfa/Williams garaj kareleri. Serbest logosu bulunamayan takımlar placeholder'da kalır (bilinçli): Ferrari, Racing Bulls, Cadillac, Toro Rosso, AlphaTauri, Force India.
- [ ] **8.6 Eski Sezonlar (1950–2017) Genişletmesi (sahip — görsel site denetimi ve düzeltmeler bittikten sonra hatırlatılacak):**
  - `MEDIA_MIN_SEASON` (`lib/media/sync.ts`) düşürülerek aynı sistemle geriye genişletilecek.
- [ ] **8.7 Küçük Sertleştirmeler (isteğe bağlı, düşük risk):**
  - `/api/media` istemci IP'si belirsizken hız sınırını atlıyor; `downloadImage` host allow-list'ini yalnızca ilk URL'de uyguluyor (yönlendirmeler izlenir) ve gövde boyutunu `Content-Length` yoksa indirdikten sonra denetliyor.

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request'te test edilip required check yapılması (sahip ayarı) |
| **Yasal Mailbox'lar** | `.example` yer tutucular | Gerçek adreslerle güncellenecek (sahip kararı) |
| **Node Sürüm Uyumu** | Yerel: Node 22; `.nvmrc`: 24 | `.nvmrc` ve motor tanımları 22 ile uyumlu çalışıyor |
| **Vercel & Prod Değişkenleri** | Sentry, Upstash, Cron Secret | Prod ortam değişkenlerinin senkronizasyonu |
