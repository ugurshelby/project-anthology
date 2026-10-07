# Anthology (Apex) — Master Plan

> **Temel Otorite ve Tek Canlı İş Listesi:** Bu döküman doğrudan geliştirici vizyonu ve direktifleri doğrultusunda oluşturulmuş en temel operasyonel rehberdir. Projedeki tüm planlama, geliştirme ve bakım adımları bu liste üzerinden yürütülür.  
> Bir madde yalnızca kodda veya ölçülmüş bir çalışma sonucunda doğrulandığında `[x]` olarak işaretlenir. Tamamlanan planlar ve süreçler geçmiş git kayıtlarına devredilir; dökümanda yalnızca aktif açık işler yer alır.  
> **Temel Vizyon Belgesi:** `docs/vision/apex-vision.md`  
> **Tasarım Sistemi Mimarisi:** `docs/design/apex-design.md` (Apple tasarım felsefesi + F1 teknik kimlik sentezi)  
> **Canlı Canlı Referans & Ölçümler:** `docs/reference/apex-reference.md`  
> **Canlı Host:** https://project-anthology-eight.vercel.app  
> **Son Güncelleme & Ölçüm:** 2026-10-07  

---

## 1. Vizyon ve Misyon

* **Vizyon (Nereye Ulaşmak İstiyoruz?):** Motor sporları tutkusunu ve zengin Formula 1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan harmonik bir veri mimarisiyle, gecikmesiz, akıcı, modern ve editoryal derinliği yüksek bir arayüzde birleştiren; F1 kültürünün küresel ölçekteki dijital başvuru ve deneyim merkezi olmak.
* **Misyon (Bunu Nasıl ve Ne İnşa Ederek Yapıyoruz?):** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi (sıfır takılma, kusursuz edge caching) ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

## 2. Mevcut Doğrulanmış Durum (Tüm Katmanların Ölçülmüş Gerçekliği)

| Katman | Ölçülen Durum | Kanıt & Metrik |
| :--- | :--- | :--- |
| **Birim & Entegrasyon Testleri** | ✅ 55 Test Dosyası, 479 Test Başarılı | `npx vitest run` (2026-10-07) |
| **Statik Tip Güvenliği** | ✅ Sıfır Tip Hatası | `npx tsc --noEmit` (kod 0) |
| **Kod Stili & Linter** | ✅ Sıfır Hata | `npm run lint` (0 error, 13 warnings, kod 0) |
| **Web Production Build** | ✅ 50/50 Sayfa ve Rota Derlendi | `npm run build` (Next.js Turbopack) |
| **Veri Katmanı & Fallback** | ✅ Supabase + Jolpica Fallback + F1DB | DB → Cache → Live Proxy kademeli okuma devrede |
| **Görsel & Varlık Altyapısı** | ✅ 56 hikâye görseli + medya sistemi canlı | `public/stories/` (56 PNG, hepsi kaynak kaydında, 0'ı doğrulanmış), `media_assets` 215/246 çözülmüş (2026-10-07) |
| **Tasarım Sistemi Orkestrasyonu** | ✅ Tamamlandı | `apex-design.md`, `tokens.json`, 5 katmanlı `skills/` |
| **Mobil Uygulama (Expo 56)** | ⏸️ Rafta (sahip kararı 2026-10-07) | `mobile/` diskte mevcut, gitignored; dokunulmaz, web mimari ve arayüz oturduktan sonra ele alınır |

**Kritik Kısıt:** `lib/f1Calendar.ts` projenin tek zamansal kaynağıdır. Sezon, pilot veya takım listelerinin koda hardcode edilmesi kesinlikle yasaktır.

---

## 3. Açık İşler: Önem Sırasına Göre Faz Planı

> Doğrulanıp tamamlanan maddeler bu listeden silindi; kanıtları `logs/` ve git geçmişindedir. Burada yalnızca açık (`[ ]`) ve kısmi (`[~]`) işler kalır. Her maddenin sahibi belirtilir: **(Claude)** backend/veri/API/veritabanı, **(Antigravity)** arayüz, **(Sahip)** karar, hesap, dış doğrulama.

### 🤝 Ajan Düzeni (sahip kararı, 2026-10-07)

- **Claude Code:** backend, API, veri, veritabanı, zamanlayıcı, medya çözümleyicisi, inceleme ve doğrulama. Commit eder; **push yalnızca sahibin onayıyla**; migration ve canlı veritabanı işlemleri sahibin o konuşmadaki yetkisiyle.
- **Antigravity:** yalnızca arayüz, tasarım ve arayüz metinleri (`components/`, `app/[locale]/**` içindeki görsel kısımlar, `messages/*.json`, `public/` tasarım varlıkları). **Commit ve push yetkisi yoktur** (`AGENTS.md`). İşini bitirince günün log'una yazar, dokunduğu plan maddesini `[~]` bırakır (asla `[x]` yapmaz), Claude doğrular ve commit eder.
- **Antigravity'nin dokunmadığı yerler:** `lib/`, `app/api/`, `supabase/`, `scripts/`, `data/media/`, `data/stories/image-credits.ts` (sahip doldurur), `.github/`, `vercel.json`, `AGENTS.md`, `mobile/`. Bir arayüz işi için bunlardan birinde değişiklik gerekirse plana not düşer, Claude yapar.
- **Aynı çalışma ağacı:** iki ajan paralel çalışırken yalnızca kendi dosyalarını düzenler; başka birinin değişikliğini geri almaz, stash'lemez.
- **Hatırlatma listesi (sahibin isteği):** site denetimi başlarken → 8.3 (medya kalite incelemesi) + 7.1 kaynak listesi + 7.2 editoryal inceleme; denetim düzeltmeleri bittikten sonra → 8.6 (1950–2017 genişletmesi); yarış hafta sonu → `docs/reference/yaris-hafta-sonu-dogrulama.md`.

### 🎨 Antigravity İş Listesi (frontend) — bu sırayla

- [ ] **AG-1 Hikâye görselleri: editoryal kullanım notu, kaynak satırı ve özgün sayfaya bağlantı (7.1'in arayüz kısmı):**
  - **Veri sözleşmesi (hazır, Claude):** `data/stories/image-credits.ts` — `getStoryImageCredit(src)` ve `isSourcedStoryImage(credit)`. Kayıt `{ status: 'unverified', hint }` veya `{ status: 'sourced', sourceUrl, sourceName, author?, license? }`. Bugün 56 kaydın hepsi `unverified`; sahip zamanla `sourced`'a çevirecek. **Manifest'i değiştirmeyin**; `sourced` görünümünü denemek için geçici yerel bir kayıt kullanın ve geri alın.
  - **Yapılacak:**
    1. Hikâye sayfasında (hero altı veya sayfa sonu) kısa not, `messages/en.json` + `messages/tr.json`: görseller **ticari olmayan, editoryal amaçla** kullanılır; hakları sahiplerine aittir; kaynak bilinen yerde belirtilir; hak sahipleri kaldırma talebi iletebilir (bağlantı: mevcut `/dmca` sayfası; gerçek e-posta 7.4'te gelecek, yer tutucuyu çoğaltmayın).
    2. Gövde görselleri (`StoryBody`) ve hero: kayıt `sourced` ise altyazının altında kaynak satırı (`<yazar> / <sourceName> · <lisans>`; yazar/lisans yoksa atlanır) ve **görsel + kaynak satırı `sourceUrl`'e bağlanır** (`target="_blank" rel="noopener noreferrer nofollow"`, klavye odağı görünür, yerelleştirilmiş `aria-label`). Kayıt `unverified` ise kaynak satırı ve bağlantı **çıkmaz**; yalnızca genel not görünür.
    3. `/media-sources`: yeni "Hikâye görselleri" bölümü — aynı not, "X görselden Y'sinin kaynağı kayıtlı" sayacı ve kaynağı kayıtlı görsellerin hikâyeye göre bağlantılı listesi. `unverified` olanlar **listelenmez** (sahibin iç listesidir).
    4. Hikâye görseli için **yapay zekâ veya SVG/çizim yer tutucu eklemeyin**; görsel yoksa mevcut görselsiz düzen kullanılır.
  - **Bitti sayılır:** `/anthology/<slug>` (EN ve `/tr`) masaüstü + mobil tarayıcıda kullanıldı (geçici `sourced` kayıtla ve kayıtsız hâliyle); `npx tsc --noEmit` ve `npm run lint` 0 hata; ilgili test (`tests/media-components.test.ts` veya yeni dosya); log'a ölçüm yazıldı. Commit etmez.
- [ ] **AG-2 Atıf rozeti `aria-label` yerelleştirmesi (8.7'nin küçük kalemi):** `MediaAttribution` rozetinin `aria-label` değeri sabit İngilizce (`Image license: …`); `messages/*.json` anahtarıyla yerelleştirilecek. Bitti: `/tr/drivers/norris` üzerinde etiket Türkçe, `/drivers/norris` üzerinde İngilizce; test eklendi.

### ⏱️ Faz 1: Kusursuz Saat — Veri Mimarisi, Canlı Senkronizasyon & Caching
*Vizyonun 1. önceliği: Arka planda saat gibi işleyen harmonik veri mimarisi ve sıfır gecikmeli yanıt.*

- [~] **1.1 OpenF1 Canlı Seans ve Zaman Senkronizasyonu Doğrulaması (Claude + Sahip, yarış hafta sonu):**
  - Doğrulandı: `/api/live-timing` rota simülasyonu (`tests/live-timing-route.test.ts`, 10 test): canlı pencere + 10 dk bitiş toleransı, `Cache-Control: public, s-maxage=5, stale-while-revalidate=15`, 25 eşzamanlı istek → 1 upstream turu (stampede guard), 5 sn TTL memo, upstream hata / 8 sn zaman aşımında son iyi sonucun sunulması, 502 (genel gövde) ve 429 (`Retry-After`) yolları. OpenF1 `sessions?session_key=latest` canlı probu: HTTP 200, 1.4 sn (2026-10-06; son seans 2026-10-04 Race, bitmiş → rota `live:false` döner).
  - Açık: gerçek bir yarış hafta sonunda canlı seansla `LiveRaceTracker` + rotanın uçtan uca gözlemi. (Eski plan metnindeki `s-maxage=3 / swr=9` koddan farklıydı; kod ve `apex-reference.md` `5 / 15` — OpenF1'in paylaşımlı 3 req/sn bütçesi — olarak doğrulandı.)
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.A (ilk fırsat: R17 Singapur, 9–11 Ekim).
- [~] **1.3 Snapshot & Ingest Ayrımı ve Idempotent Event-Trigger (Claude, yarış hafta sonu):**
  - Doğrulandı: `sync-f1` yerleşmiş (settled) snapshot'ı yeniden çekmiyor. Jolpica kaynaklı bir satır, due penceresinden ≥ 24 sa sonra çekildiyse final sayılır (`isSnapshotSettled`, `loadSnapshotFetchTimes`); yalnızca `source='jolpica'` satırları sayılır (F1DB placeholder'ı asla settled olmaz), DB okunamazsa her şey çekilir (fail-open), ertelenen yarış otomatik settled olmaktan çıkar, sonuç ve pit stop ayrı kapılanır, `?force=1` hepsini zorlar, yanıtta `settled` sayacı döner. Testler: `tests/sync-f1-idempotent.test.ts` (11 test).
  - Doğrulandı (sahip kararı uygulandı — "bayat satırı hemen sun, arkada yenile"): okuma yolu güncel sezonda bayat ama yakın tarihli (≤ 3 gün, `MAX_SERVE_STALE_MS`) DB satırını anında sunar ve yanıttan sonra `after()` ile arka planda Jolpica'dan yeniler (`lib/data/snapshotRefresh.ts`; takvim, sonuç, sıralama turu, sprint, pit stop; `has*` doğrulaması, `source='jolpica'`, sunucu örneği başına snapshot başına 60 sn bekleme, `next build` sırasında çalışmaz). Satır yok / içerik geçersiz / 3 günden eski ise eskisi gibi canlıya gider. Testler: `tests/snapshot-refresh.test.ts` (8), `tests/snapshot-refresh-read.test.ts` (5).
  - Bilinçli istisna: pilot/takım puan durumu arka planda yenilenmez, bayat sunulur ve `sync-f1` cron'u (1.6) yeniler — liderlik değişimi push bildirimi eski/yeni lideri karşılaştırdığı için sayfa kaynaklı bir yenileme bildirimi sessizce yutardı. Yarış sonrası puan durumu en fazla ~30 dk (QStash devredeyken) eski görünür.
  - Açık: gerçek yarış hafta sonunda gözlem (1.1 ile birlikte). Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.B.
- [~] **1.4 Push Bildirim Seans Penceresi Canlı Doğrulaması (Claude, yarış hafta sonu):**
  - Ölçüm (Supabase MCP, salt-okunur, 2026-10-06): `notified_sessions` 0 satır, `push_subscriptions` 0 satır ve **`service_role`'ün bu iki tabloda hiçbir yetkisi yok** (migration'lar yalnızca `anon/authenticated` için `REVOKE` yazmış, varsayılan yetkilere güvenmiş). Sonuç: `/api/push/register` ve `notify-sessions` bu tabloları okuyup yazamıyor; rota hataları yutuyor (`insert` hatası kontrol edilmiyor). Önceki "tablo devrede" notu yanlıştı.
  - Uygulandı (2026-10-06, sahip onayıyla): `supabase/migrations/20261006000002_push_service_role_grants.sql` — `service_role` artık iki tabloda SELECT/INSERT/UPDATE/DELETE yapabiliyor (`has_table_privilege` ile doğrulandı), anon/authenticated kapalı (gerçek anon REST: 401), `set_updated_at` uyarısı kalktı.
  - Not: push'un tek tüketicisi mobil uygulama (Expo token'ları) ve uygulama rafta; bu yüzden gerçek aboneye gönderim şimdilik test edilemez. Doğrulanacak olan zamanlama: oturumdan ~30 dk önce `notified_sessions` satırının oluşması (abone yoksa gönderim 0, satır yine yazılır).
  - Açık: bu doğrulama; `insert` hatasının loglanması (küçük kod iyileştirmesi, Claude). Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.C.
- [~] **1.6 Zamanlayıcı Güvenilirliği: GitHub `schedule` → Upstash QStash (Claude kodu hazır; Sahip kurulumu bekliyor):**
  - **Neden (araştırıldı, 2026-10-07):** GitHub zamanlanmış workflow'ları "best effort" çalıştırır; resmî belgesine göre yoğun yükte (özellikle her saatin başında) geciktirilir ve yeterince yoğunsa kuyruktaki işler **düşürülür**. Ölçüm (`gh run list`): `notify-sessions` kâğıt üzerinde 10 dk, gerçekte medyan 308 dk (~5 koşu/gün, beklenen 144); `sync-news`/`sync-media` saatlik, gerçekte ~5/gün; `sync-f1-race-aware` ~5/gün, en uzun aralık 9,4 sa. Bizim zamanlamamız geçerli (5 dk alt sınırına uyuyor, dakika 0'a konmamış, repo public) — **hata platformun sınırında ve bizim mimari seçimimizde**: zamana duyarlı işler (oturumdan 30 dk önce push, yarıştan 2,5 sa sonra sonuç) garantisiz bir tetikleyiciye bağlanmıştı.
  - **Yapıldı (Claude, 2026-10-07):** `scripts/sync-f1-scheduled.ts` geriye bakış 65 dk → 12 sa (GitHub yedeği için). QStash kodu: `lib/cron/qstashSchedules.ts` (4 zamanlama), `scripts/qstash-sync.ts` (`npm run qstash:sync`: kur/güncelle, `--dry-run`, `--list`, `--remove`, `--skip`), `tests/qstash-schedules.test.ts` (23 test). Rotalar değişmedi: QStash `Authorization: Bearer <CRON_SECRET>` başlığını iletir (`Upstash-Forward-Authorization`).
  - **Kapasite (Upstash ücretsiz plan, 2026-10-07'de fiyat sayfasından):** günde 1.000 mesaj, 10 aktif zamanlama, 15 dk HTTP yanıt süresi; her teslimat denemesi (retry dahil) 1 mesaj sayılır, sınırlar "soft". Bizim yük: `notify-sessions` */5 = 288, `sync-f1` */30 = 48, `sync-news` saatlik = 24, `sync-media` saatlik = 24 → **normal gün 384, en kötü durum (her koşu hata verip her retry kullanılsa) 480 mesaj; 4/10 zamanlama.** Test, en kötü durum kotanın %60'ını aşarsa kırmızı olur.
  - **Açık (Sahip, ~5 dk):** (1) Upstash console → QStash → *Details*: `QSTASH_TOKEN` ve `QSTASH_URL`; (2) bunları ve `CRON_SECRET` (Vercel'deki değer) terminal ortamına ya da `.env.local`'a koyun (commit edilmez); (3) `npm run qstash:sync -- --dry-run` sonra `npm run qstash:sync`; (4) `npm run qstash:sync -- --list` ve Upstash console → *Logs* ile ilk koşuyu görün; (5) bana haber verin. Mobil uygulama rafta olduğu için push'a ihtiyaç yoksa `-- --skip apex-notify-sessions` (günlük mesaj 384 → 96).
  - **Açık (Claude, QStash doğrulandıktan ~1 hafta sonra):** dört workflow'dan `schedule:` tetikleyicisini kaldırmak (yalnızca `workflow_dispatch` kalır) ki iki çağıran üst üste binmesin.

---

### 🔍 Faz 6: Production Release, SEO & Core Web Vitals
*Vizyonun 6. önceliği: Ürünün arama motorlarında kusursuz indekslenmesi ve performans tescili.*

- [~] **6.1 Structured Data (JSON-LD) Doğrulaması (Claude + Sahip):**
  - Doğrulandı (2026-10-07): ana sayfa `WebSite`, sürücü `Person`, takım `SportsTeam`, tur `SportsEvent`, hikâye `Article` ve Machinery `Vehicle` JSON-LD'leri mevcut ve parse ediliyor; ana sayfada `og:image` var. Tur sayfası artık `sportsEventJsonLd`'ye bağlı ve zorunlu alan koruması var (`name`, `circuitName`, `country`, `startDate` eksikse JSON-LD basılmaz; `tests/localized-seo.test.ts`). `robots.txt` ve `sitemap.xml` canlıda 200.
  - **Rich Results Test ve Schema Markup Validator:** herkese açık araçlar, giriş gerektirmez — sizden bir şey istenmiyor. Claude yarış hafta sonu oturumunda tarayıcı panelinden dener; captcha çıkarsa durur, adım sahibe kalır (`docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.D).
  - **Search Console (Sahip):** (1) Google hesabınızla search.google.com/search-console → *URL prefix* → `https://project-anthology-eight.vercel.app/`; (2) doğrulama yöntemi **HTML tag**: verdiği `content` değerini Vercel **Production** env `GOOGLE_SITE_VERIFICATION` olarak ekleyin (kod hazır: `app/[locale]/layout.tsx` meta etiketini basar; env eklenince redeploy gerekir) veya değeri bana yazın; (3) *Verify*; (4) *Sitemaps* → `sitemap.xml`; (5) birkaç gün sonra *Pages* ve *Enhancements* raporlarının ekran görüntüsünü paylaşın. Not: `*.vercel.app` için DNS doğrulaması yoktur; özel alan adı alınacaksa Search Console'u o alan adıyla kurmak daha doğru (sinyaller taşınmaz).
- [ ] **6.2 Core Web Vitals & Lighthouse Baseline (Sahip + Claude):**
  - Canlı prod ortamında LCP (<2.5s), INP (<200ms) ve CLS (<0.1) performans eşiklerinin ölçülerek tescillenmesi.
  - Prosedür: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.E.
- [~] **6.3 Sentry ve Hata Gözlemlenebilirliği (Sahip):**
  - Düzeltildi: kaynak haritası yüklenmediğinde release oluşturma kapatıldı (`next.config.ts`: `release.create` / `finalize` = `SENTRY_UPLOAD_SOURCE_MAPS=true` + token). `npm run build` çıktısında `Project not found` 0 kez (önceki build'de vardı).
  - Açık: prod'da hata yakalama / alert akışının doğrulanması (Sentry projesi `anthology-z0/project-anthology` erişimi — sahip).
  - Sahip adımları: `docs/reference/yaris-hafta-sonu-dogrulama.md` bölüm 3.F.

---

### 📱 Faz 7: Lisans Manifestosu, Sahip İncelemesi & Mobil Ekosistem
*Sahip kararları ve yasal netleştirme gerektiren maddeler.*

- [~] **7.1 `public/stories` Görselleri: Gerçek Fotoğraf, Kaynak Kaydı, Editoryal Kullanım Notu (Claude veri katmanı hazır; Antigravity AG-1; Sahip kaynak doğrulaması):**
  - **Sahip kararları (2026-10-07):** hikâye görselleri sahibin web'den bulup indirdiği **gerçek fotoğraflardır**; **asla yapay zekâ üretimi veya SVG/çizim olmaz** (`AGENTS.md` Forbidden). Sayfada görsellerin **ticari değil editoryal amaçla** kullanıldığı belirtilir; kaynağı bilinen görselde kaynak yazılır ve görsel **özgün kaynağa yönlenir**; kaynağı bulunamayanlar bir **risk listesinde** durur, sahip kaynağından bakıp tek tek doldurur.
  - **Yapıldı (Claude):** `data/stories/image-credits.ts` (56 görselin kaynak kaydı; `unverified` | `sourced`), `tests/story-images.test.ts` (6 test: SVG/raster olmayan dosya yok, her kullanılan görselin dosyası ve kaydı var, orphan yok, `sourced` kaydı https kaynak + yayıncı ister), `scripts/story-image-audit.ts` (`npm run stories:credits -- --write`), risk listesi `docs/reference/hikaye-gorselleri-kaynak-listesi.md` (hangi hikâyedeki hangi görsel; bilinenler).
  - **Ölçüm (2026-10-07):** 56 görsel / 17 hikâye; 0'ı kaynaklı. 33 dosya Canva dışa aktarımı (Ocak 2026; tasarım adı ve tarih gömülü, fotoğrafçı/kaynak/lisans yok), 23 dosya 2026-09-17'de ham web dosyası olarak eklenmiş (yalnızca özgün dosya adı kayıtlı). EXIF/IPTC/XMP taraması: telif, kaynak veya lisans alanı yok; tek yazar alanı Canva hesabının adı. Görsellere bakıldı: örneklenen dosyalar gerçek fotoğraf; AI olup olmadığı üstverden kanıtlanamaz, sahibin beyanına dayanır.
  - **Not (hukuki sınır):** "editoryal, ticari olmayan" notu kullanım amacını açıklar ve kaldırma taleplerini kolaylaştırır; **bir lisans yerine geçmez**. Kaynağı doğrulanamayan görsel riskli kalır; bu yüzden liste var.
  - Açık: **Antigravity AG-1** (arayüz); **Sahip:** listedeki görselleri kaynağından doğrulayıp manifest'i doldurmak — **site denetimi başlarken hatırlatılacak**.
- [ ] **7.2 Editoryal İnceleme (Sahip — site denetimi başlarken hatırlatılacak):**
  - Dönem renk listesi (`data/history/liveries.ts`) ve takım DNA metinleri (`data/history/team-dna.ts`). Sahip genel site denetimini kendisi yapıp hataları bildirecek; ajandan ayrıca olgusal doğrulama istenmedi.
  - Yeni frontend içeriği (kaynakla doğrulanmadı; sahip site denetiminde bildirecek): `data/circuits/lore.ts`, pist irtifa/telemetri sayıları (`CircuitElevationProfile`), `data/machinery/cars.ts`, `RegulationErasPanel`, `TyreThermalWindows`.
- [⏸] **7.3 Mobil Uygulama (Sahip — rafta):**
  - Sahip kararı (2026-10-07): `mobile/` **olduğu gibi kalır, geliştirmeye dokunulmaz**; tüm web işleri, mimari ve arayüz oturduktan sonra ele alınır (Expo Go / preview testi, mağaza süreçleri, git durumu). Push bildirimleri (1.4) bu yüzden şimdilik yalnızca zamanlama doğrulaması olarak izlenir.
- [ ] **7.4 Yasal Mailbox'lar (Sahip — en sonda):**
  - `privacy@`, `dmca@`, `contact@apexstats.example` yer tutucuları (`/media-sources` kaldırma bağlantısı dahil) gerçek e-posta adresleriyle değiştirilecek. Sahip kararı (2026-10-07): bütün işler bitip site tam oturduktan, mobil uygulama geliştirildikten ve kapsamlı güvenlik denetimi ile SEO çalışmaları tamamlandıktan sonra sahip temin edecek; o zamana kadar yer tutucular kalır (ajanlar yeni yer tutucu eklemez).

---

### 🖼️ Faz 8: Görsel Temin Sistemi (Media) — Canlıya Alma ve Arayüz Entegrasyonu
*Lisans doğrulamalı pilot/takım/araç/pist görselleri. Backend ve arayüz canlıda (2026-10-06, `f0f7f30`), migration'lar uygulandı, ilk dolum yapıldı.*

- [~] **8.1 Çözümleyici İyileştirmesi ve Eksiklerin Yeniden Denenmesi (Claude; push + canlı gözlem bekliyor):**
  - **Canlı durum (2026-10-07):** 246 varlıktan 215 çözülmüş (60/60 pilot, 12 takım logosu, 102 araç, 41 pist), 26 `missing`, 5 `pending`; zamanlanmış ve elle koşular yalnızca vadesi gelen satırları arar (çözülmüş 90 gün, onaylı 180 gün, `missing` 7–21 gün sonra), yani doğru olanlar tekrar aranmaz.
  - **Yapıldı (kodda, push bekliyor):** eksiklerin nedeni ayrıştırıldı. (a) Araçlar: fotoğraflar Commons'ta var ama başlıkta takım adı yok, kategoride şasi kodu var (`Ferrari SF1000 of Charles Leclerc`); desen 4 haneli/yeni kodları (SF1000, C39, AT01, RP20, R.S.20…) tanımıyordu → genişletildi; `CAR_MODELS` ile şasi adı sorgusu; sergi arabası (Honda ofisi AT02) ve yol aracı (SF90 Stradale) elenir. (b) Pistler: adında yarış sözcüğü olmayan mekânlar (Red Bull Ring, Kyalami) için pistin kendi Commons kategorisi kaynak oldu; Almanca `Luftaufnahme`, `start-finish` yazımları, `<yer> Grand Prix` sorgusu; at yarışı, pul, bisiklet/maraton, fuar/banner kareleri elenir. (c) `RESOLVER_VERSION=2`: canlıya geçince tüm `missing` satırlar bir kez yeniden denenir. (d) Storage yükleme geçici 5xx'te 3 kez denenir (`hockenheimring` 520). (e) `last_error` artık eşiğin altında kalan en iyi iki adayı yazar.
  - **Ölçüm (gerçek Wikimedia'ya karşı kuru çalıştırma, DB'ye yazmadan, 31 varlık):** 19 çözüldü (14/14 araç, 4 pist: Kyalami, Red Bull Ring, Miami, Hockenheimring; AVUS sonradan elendi), 12 `missing` kaldı. Örneklenen çözülen görsellere bakıldı (Kyalami ve Red Bull Ring havadan, 2020–2021 yarış/test kareleri uygun; Miami kalabalıklı grid karesi, Hockenheim Räikkönen aksiyon karesi → 8.3'te gözden geçirilecek). Kalan `missing` (serbest/uygun fotoğraf yok): Aintree (yalnızca at yarışı pisti), AVUS (pul/fuar), Yeongam (yalnızca yarış karesi), Jeddah/Madring (yalnızca şema), Losail (MotoGP kareleri), Las Vegas (etkinlik anlık görüntüleri) ve 6 takım logosu (Ferrari, Racing Bulls, Cadillac, Toro Rosso, AlphaTauri, Force India: serbest logo yok, bilinçli placeholder).
  - Açık: push sonrası `gh workflow run sync-media.yml` ile ilk koşuyu izlemek (requeue sayısı yanıtta `requeued`), sonuçları 8.3'e taşımak; kalan `pending` 5 varlığın (4 araç + `hockenheimring`) bu koşuda bitmesi.
- [ ] **8.3 İlk Dolum Sonrası Kalite İncelemesi (Sahip — site denetimi başlarken hatırlatılacak):**
  - Düşük güvenli seçimlerin SQL ile listelenip yanlışların `review='rejected'` yapılması (görsel anında gizlenir, sistem sıradakini seçer; SQL: `docs/reference/media-sistemi.md` §13). Bilinen zayıflar: bazı pistlerde etkinlik karesi (`anderstorp`, `estoril`, `watkins_glen`, `miami` kalabalık karesi, `hockenheimring` aksiyon karesi), Nürburgring tek viraj fotoğrafı, 2021 McLaren/Alfa/Williams garaj kareleri. Serbest logosu bulunamayan takımlar placeholder'da kalır (bilinçli).
- [ ] **8.6 Eski Sezonlar (1950–2017) Genişletmesi (Sahip — görsel site denetimi ve düzeltmeler bittikten sonra hatırlatılacak):**
  - `MEDIA_MIN_SEASON` (`lib/media/sync.ts`) düşürülerek aynı sistemle geriye genişletilecek.
- [ ] **8.7 Küçük Sertleştirmeler (Claude, isteğe bağlı, düşük risk):**
  - `/api/media` istemci IP'si belirsizken hız sınırını atlıyor; `downloadImage` host allow-list'ini yalnızca ilk URL'de uyguluyor (yönlendirmeler izlenir) ve gövde boyutunu `Content-Length` yoksa indirdikten sonra denetliyor; `notify-sessions` `notified_sessions` insert hatasını kontrol etmiyor.
  - Atıf rozeti `aria-label` yerelleştirmesi → **AG-2** (Antigravity).

---

## 4. Teknik Borç ve Çevre Takibi

| Madde | Durum | Önlem / Aksiyon |
| :--- | :--- | :--- |
| **`ci.yml` (PR Kapısı)** | GitHub'da henüz koşmadı | Pull request'te test edilip required check yapılması (sahip ayarı) |
| **Yasal Mailbox'lar** | `.example` yer tutucular | En sonda gerçek adreslerle güncellenecek (7.4, sahip kararı) |
| **Node Sürüm Uyumu** | Yerel: Node 22; `.nvmrc`: 24 | `.nvmrc` ve motor tanımları 22 ile uyumlu çalışıyor |
| **Vercel & Prod Değişkenleri** | Sentry, Upstash, Cron Secret; yeni: `GOOGLE_SITE_VERIFICATION` (6.1) | Prod ortam değişkenlerinin senkronizasyonu |
| **Supabase MCP bağlantısı** | Bağlayıcı yazma işlemlerini de kabul ediyor (salt-okunur amaçlanmıştı) | Ajanlar yalnızca sahibin onayladığı yazmaları yapar; istenirse bağlantıyı salt-okunur token ile yeniden kurun |
| **Uzak dal `claude/admiring-feynman-60ofyp`** | PR #2 merge edildi, dal silinmedi | Silme kararı sahibin |
