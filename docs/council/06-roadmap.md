# Bölüm 6 — Eksik Özellikler & Yol Haritası

> **Platform:** APEX (Project Anthology) · https://project-anthology-five.vercel.app  
> **Stack:** Next.js 16 App Router, React 19, Supabase, Vercel Hobby  
> **Tarama tarihi:** 2026-06-11 · Kaynak: `app/`, `components/`, `lib/`, `data/`, `docs/PROJECT_LESSONS_AND_ROADMAP.md`

---

## Özet

APEX, Formula 1 için **karanlık sinematik bir arşiv ve hafta sonu komuta merkezi** olarak konumlanmış. Canlı puan durumu, sezon arşivi, pist detayları, anthology hikâyeleri, team radio, haber özeti, glossary ve "On This Day" gibi özellikler üretimde. Ancak fanların en çok aradığı **yarış sonuç grid'i, qualifying tablosu, pilot kariyer sayfaları, head-to-head ve global arama** henüz yok. Veri altyapısı (`f1_snapshots`, Jolpica/OpenF1/F1DB adapter'ları) birçok derinleştirmeyi **mevcut stack ile** mümkün kılıyor; canlı timing, telemetri ve video arşivi ise büyük yatırım gerektirir.

**Stratejik öncelik:** Önce DB'deki mevcut snapshot'ları yüzeye çıkar (qualifying/sprint/full results), sonra editorial anthology ile veriyi birleştir, en son canlı/telemetry katmanını değerlendir.

---

## Mevcut Özellik Envanteri

| Alan | Rota / Bileşen | Veri kaynağı | Durum |
|------|----------------|--------------|-------|
| Ana dashboard | `/` · `CompactBentoDashboard` | Jolpica + Supabase `f1_snapshots` | ✅ Lider, top-10 pilot, top-3 takım, son yarış podyumu, geri sayım |
| Canlı puan | Home + `/season` | `standings_drivers/constructors` | ✅ Staleness guard ile taze |
| Sezon arşivi | `/season?year=` · `SeasonExplorer` | `getSeasonData()` API | ✅ 2018–güncel UI; API 1950+ kabul eder |
| Yarış takvimi | `CalendarScroller` | `calendar` snapshot | ✅ Pist linki (`/circuits/{id}`) |
| Son yarış özeti | `BentoLastRaceTile` + Season recap | `results` snapshot | ✅ Podyum, pole, fastest lap |
| Sezon rekorları | Season Records | Tüm round `results` | ✅ Puan, galibiyet, podyum, 1-2 (pit-stop yok) |
| Pilot/takım drawer | `EntityDrawer` | Sezon bağlamı props | ✅ Sezon içi wins/podiums; kariyer yok |
| Pist listesi | `/circuits` | Güncel sezon takvimi | ✅ SVG track map grid |
| Pist detay | `/circuits/[id]` | Calendar + `results` + `facts.ts` | ✅ Stats, karakter, **Past Winners**, **canlı hava** (Open-Meteo) |
| Anthology | `/anthology`, `/anthology/[slug]` | Supabase `stories` | ✅ Uzun form; `GlossaryLink` |
| Team radio | Anthology sayfası | OpenF1 → `radio_moments` | ✅ Transcript + `<audio>`; sync cron |
| Haberler | `/news` + home tile | RSS aggregate (5 kaynak) | ✅ Dedupe/cluster; dış link |
| Tech glossary | `/tech-glossary` | `data/glossary/terms.ts` (~12 terim) + lastikler | ✅ Expand kartlar |
| Lastik tahsisi | `BentoTyreTile` | **Statik** `WEEKEND_ALLOCATION` | ⚠️ Gerçek Pirelli tahsisi değil |
| On This Day | `BentoOnThisDayTile` | Tüm `results` snapshot'ları | ✅ Tarihsel GP kazananları |
| Ingestion | Cron: sync-f1, sync-news, sync-radio | Vercel günde 1×3 | ⚠️ Hobby limiti |
| Tarihsel seed | `npm run seed:f1db` | F1DB → Supabase | ✅ 2018+; Past Winners DB'ye bağlı |
| Test | Vitest | `tests/*.test.ts` | ✅ Kısmi (aggregate, icons, calendar) |

**Navigasyon:** Anthology · News · Circuits · Season · Glossary (`SiteNav.tsx`)

**Bilinçli sınırlamalar (koddan):**
- UI dili tamamen İngilizce; Türkçe lokalizasyon yok.
- `BentoTyreTile` sabit C3/C4/C5 set sayısı kullanıyor.
- Qualifying/sprint snapshot'ları ingest ediliyor ama tam grid UI yok (yalnızca pole).
- `circuits` Supabase tablosu tanımlı ama kullanılmıyor.
- Vercel Hobby: günde 1 cron/path; yarış haftası tazeliği read-layer staleness ile telafi.

---

## Fan İhtiyaçları — Eksikler

### Yüksek arama hacmi, platformda yok

1. **Yarış sonuç tablosu (P1–P20)** — Grid, interval, DNF nedeni, pit sayısı. Veri `results` snapshot'ta var; ayrı `/season/[year]/[round]` veya drawer yok.
2. **Qualifying & Sprint grid** — `qualifying` ve `sprint` ingest ediliyor; UI'da yalnızca pole satırı.
3. **Pilot sayfası** — "Hamilton kariyer", "Verstappen istatistik". `EntityDrawer` tek sezon; `/drivers/[id]` yok.
4. **Takım sayfası** — Sezon geçmişi, pilot geçmişi, renk/livery arşivi.
5. **Global arama** — Pilot, pist, hikâye, radio, glossary terimi. Hiç search index/UI yok.
6. **Head-to-head / karşılaştırma** — İki pilot puan, galibiyet, grid pozisyonu.
7. **Canlı / hafta sonu modu** — FP/Q/R session saatleri, canlı sıralama, SC/VSC. Yalnızca "Next Race" geri sayımı var.
8. **Ceza & steward kararları** — Sık aranan; veri kaynağı yok.
9. **Gerçek lastik tahsisi & stint analizi** — Statik tile yerine round bazlı compound seçimi.
10. **Video / foto arşivi** — F1.com'un güçlü alanı; Apex'te yok.

### Orta öncelik

11. **1950–2017 sezon UI** — `F1_SEASON_MIN=1950`, seed 2018+; kullanıcı "2000–2026 arşiv" beklerken UI 2018'den başlıyor.
12. **Tarihsel pist layout'ları** — `assets/f1-circuits/circuits/*.geojson` çok yıllı; detay sayfası güncel layout.
13. **Radio keşfi** — Filtre (pilot, takım, yıl, GP), öne çıkan anlar, anthology hikâyelerine çapraz link.
14. **Haber içerik zenginleştirme** — Özet + etiket + "APEX angle" kartları; şu an tamamen outbound.
15. **Fantasy / tahmin / quiz** — Engagement; auth gerekir.
16. **Bildirim / takvim export** — iCal, push (PWA).
17. **Türkçe (veya çoklu dil)** — Türkiye F1 kitlesi için büyük boşluk.

### Düşük öncelik / niş

18. Telemetri haritası, sector times, pit-stop rekortmenleri (veri yok; `PROJECT_LESSONS` notu).
19. Teknik regülasyon yılı bazlı diff (2022→2026 aerodinamik).
20. Sosyal paylaşım kartları (OG image var; story-specific radio OG yok).

---

## Derinleştirme Fırsatları

Mevcut özelliklerin **aynı stack ile** güçlendirilebileceği alanlar:

### Ana sayfa (Bento)
- **Lastik tile:** OpenF1 veya Pirelli duyurusu parse → round bazlı compound; fallback statik.
- **On This Day:** Kazanan ikonu, `/season?year=` ve `/anthology` linki, aynı gün radio moment.
- **News tile:** Kaynak rozeti, konu etiketi (sprint, transfer, tech), carousel (v1.2 B1 açık).
- **Race tile:** Qualifying/race session saatleri (`CalendarRace.Qualifying/Sprint` zaten typed).

### Season Explorer
- **Round detay modal/sayfa:** Mevcut `fetchRoundSnapshot` ile full results + quali + sprint tabları.
- **Takvim kartı:** "View results" (bitmiş round) vs pist linki (gelecek).
- **EntityDrawer:** Çok sezonluk wins (DB aggregate), nationality/DOB (Ergast driver endpoint veya F1DB).
- **Constructor bar chart:** Mevcut `AnimatedBar` ile sezon içi puan evrimi (round bazlı standings history — yeni snapshot türü veya türetilmiş).

### Circuits
- **Past Winners:** Pilot ikonu, `/season` linki; boşsa seed uyarısı (operasyonel).
- **Tarihsel layout seçici:** GeoJSON/SVG yıl varyantları (`assets/f1-circuits/circuits/`).
- **Anthology cross-link:** Pist adı → ilgili hikâyeler (metadata tag).
- **Hafta sonu forecast:** Open-Meteo hourly → "Rain probability" (fan favorisi).

### Anthology & Radio
- **Hikâye ↔ veri:** Story `year` + GP → ilgili `results` özeti embed.
- **Radio playlist:** Yarış bazlı sıralı dinleme; transcript arama (client-side).
- **Yeni hikâye pipeline:** `seed:stories` genişletme; kategori filtre (legends, tragedy, rivalry).

### Glossary
- Terim sayısını 12'den 50+'ya çıkar; `GlossaryLink` ile anthology/season tooltipleri.
- Lastik bölümüne ıslak/intermediate/compound strateji senaryoları.

### Haberler
- `news_cache` tablosunu aktif kullan (şu an aggregate öncelikli); etiketleme + "APEX Picks".
- Race weekend modunda "This GP" filtresi (başlık keyword + circuit alias).

### Veri & Ops (görünmez ama kritik)
- `seed:f1db` prod doğrulama → Past Winners doluluğu.
- 2026 boş snapshot'ların Jolpica ile temizlenmesi.
- Hobby cron sınırı: GitHub Actions `workflow_dispatch` live sync (repo'da mevcut, schedule kapalı).

---

## Rekabet Farkı

| Boyut | f1.com | Autosport / RaceFans | **APEX** |
|-------|--------|----------------------|----------|
| Konum | Resmi kaynak, video, live timing | Orijinal haber, analiz, yorum | **Sinematik arşiv + duygusal anlatı** |
| Canlı veri | Timing, tracker, resmi stream | Live blog, hızlı haber | Standings + countdown; **canlı timing yok** |
| Arşiv | İstatistik (ücretli/kısıtlı) | Makale arşivi | **Sezon explorer, Past Winners, On This Day** |
| Görsel kimlik | Kurumsal kırmızı | Gazete/blog | **Dark cinematic, bento, 0 radius** |
| Ses / hikâye | F1 TV | Podcast, editorial | **Team radio + anthology long-form** |
| Pist | 3D track | Teknik analiz | **SVG lap line + trackside weather** |
| Eğitim | F1 Academy içerik | Teknik yazılar | **Tech glossary + lastik görsel** |
| Topluluk | F1 app sosyal | Yorum bölümü | **Yok** (salt okunur) |
| Dil | Çoklu | EN ağırlıklı | **Yalnızca EN** |

**APEX'in savunulabilir nişi:** "F1'nin Spotify Wrapped'ı gibi" — duygusal arşiv, radio anları, pist atmosferi ve sezon hikâyesi; haber kaynağı veya resmi timing yerine geçmez.

**Kaçınılması gereken kopya:** Autosport/RaceFans ile haber yarışı, F1.com ile live timing yarışı. Bunun yerine: **veri + anlatı + estetik** üçlüsü.

---

## Uygulanabilirlik Matrisi

| Özellik | Değer (1-10) | Efor (S/M/L/XL) | Stack Uyumu | Bağımlılık |
|---------|:------------:|:---------------:|:-------------:|------------|
| Round sonuç sayfası (full grid) | 9 | S | ✅ `results` snapshot hazır | UI route + `mrdata` parser genişletme |
| Qualifying / Sprint tablosu | 8 | S | ✅ Snapshot ingest var | Season round sayfası |
| Past Winners seed doğrulama | 8 | S | ✅ F1DB seed script | Prod `seed:f1db` |
| Sezon arşiv UI 2000–2017 | 7 | M | ✅ API 1950+ | F1DB seed genişletme + asset |
| Pilot profil sayfası (`/drivers/[id]`) | 9 | M | ✅ F1DB/Ergast | Çok sezon aggregate sorgu |
| Takım profil sayfası | 8 | M | ✅ Mevcut constructor data | Tarihsel renk/ikon (`team-colors`) |
| Global arama (cmd+K) | 8 | M | ✅ Supabase + statik index | Client index build, RSC search API |
| On This Day zenginleştirme | 6 | S | ✅ | Link + ikon |
| Radio filtre & playlist | 7 | S | ✅ `radio_moments` | Client UI |
| Anthology ↔ yarış embed | 7 | M | ✅ stories + snapshots | Editorial metadata |
| Gerçek lastik tahsisi | 6 | M | ⚠️ Kaynak belirsiz | Pirelli scrape veya manuel DB |
| Session schedule (FP/Q/R) | 7 | S | ✅ `CalendarRace` sessions | Home + circuit tile |
| Puan evrimi grafiği | 6 | M | ⚠️ Round standings history yok | Yeni türetilmiş cache veya ingest |
| Open-Meteo race forecast | 6 | S | ✅ Open-Meteo hourly | CSP zaten açık |
| Tarihsel pist layout | 7 | M | ✅ GeoJSON assets | SVG picker UI |
| Haber etiket + GP filtresi | 5 | S | ✅ `aggregate.ts` | Keyword map |
| Head-to-head karşılaştırma | 7 | M | ✅ results DB | İki pilot aggregate |
| Ceza/steward tracker | 6 | L | ❌ Kaynak yok | Manuel editorial veya üçüncü parti API |
| Pit-stop / tyre stint analizi | 5 | L | ❌ Snapshot'ta yok | OpenF1 extended veya FastF1 |
| Canlı timing / leaderboard | 9 | XL | ⚠️ OpenF1 rate limit | Pro cron + WebSocket/SSE |
| Telemetri haritası | 8 | XL | ⚠️ | OpenF1 + canvas/WebGL |
| Video embed arşivi | 6 | XL | ❌ Lisans | F1 official API / YouTube CMS |
| Kullanıcı hesabı / favoriler | 5 | L | ⚠️ Supabase Auth | Auth + RLS tasarımı |
| Türkçe i18n | 7 | L | ✅ next-intl uyumlu | Çeviri + routing |
| PWA + bildirim | 4 | L | ⚠️ Vercel | Service worker |
| Fantasy / tahmin | 4 | XL | ❌ | Auth + oyun mantığı |

**Efor:** S = 1–3 gün, M = 1–2 hafta, L = 1 ay, XL = 1+ ay / ekip

---

## Kısa / Orta / Uzun Vadeli Öneriler

### Kısa vade (0–4 hafta) — "Veriyi yüzeye çıkar"

1. **`/season/[year]/round/[n]`** — Results + Qualifying + Sprint sekmeleri; mevcut ingest'i kullan.
2. **Past Winners & 2018–2025 backfill teyidi** — Prod `seed:f1db`; boş pistler için ops checklist.
3. **Session saatleri** — Next Race tile + circuit header'da FP/Q/S/R zamanları.
4. **Radio filtre** — Yıl, pilot, takım; anthology'den audio öne çıkanlar.
5. **On This Day linkleri** — İlgili sezon ve anthology cross-link.
6. **Glossary genişletme** — 30+ terim; DRS, undercut, plank, porpoising vb.

### Orta vade (1–3 ay) — "Arşiv derinliği + keşif"

1. **Pilot & takım profil sayfaları** — Çok sezon istatistik, ikon/renk, EntityDrawer'dan promote.
2. **Global arama** — Pist, pilot, hikâye, terim, radio transcript.
3. **Sezon arşiv 2000–2017 UI** — Seed genişletme + sezon pill'leri; asset audit.
4. **Tarihsel pist layout seçici** — GeoJSON yıl varyantları.
5. **Anthology ↔ veri embed** — Hikâye altında "Bu GP sonuçları" kartı.
6. **Head-to-head** — İki pilot seçici, galibiyet/podyum/puan karşılaştırma.
7. **Haber "GP mode"** — Yarış haftası filtre + öne çıkan 3 başlık.
8. **GitHub Actions live sync** — Secret + `workflow_dispatch`; Hobby cron boşluğunu kapat.

### Uzun vade (3–12 ay) — "Farklılaşma veya büyük yatırım"

1. **Hafta sonu canlı mod** — OpenF1 session leaderboard (rate limit + Pro plan cron).
2. **Telemetri / sector viz** — Seçili round replay (canvas, büyük UX işi).
3. **Editorial "APEX Originals"** — AI değil, insan yazımı kısa analiz; anthology markasıyla.
4. **Türkçe (ve opsiyonel TR haber kaynağı)** — i18n + yerel SEO.
5. **Kullanıcı katmanı** — Favori pilot, kayıtlı radio, kişisel "On This Day".
6. **Regülasyon zaman çizelgesi** — Glossary ile birleşik 1950→2026 kural evrimi.
7. **Vercel Pro geçişi** — 15 dk live cron; `pre-plans/data-ingestion-plan.md` orijinal tasarımına dönüş.

---

## Sonuç

APEX, **haber sitesi veya resmi F1 klonu olmak yerine** duygusal arşiv platformu olarak en güçlü konumda. En hızlı değer üreten hamle, zaten ingest edilen **qualifying/sprint/results** verisini round detay sayfalarına açmak ve **pilot/takım profilleri + arama** ile keşfedilebilirliği artırmaktır. Büyük yatırım gerektiren canlı timing ve telemetri, Pro plan cron ve OpenF1 kapasitesi netleşmeden ertelenmeli; anthology + radio + pist atmosferi ise mevcut stack'in **birincil diferansiyatörü** olarak derinleştirilmelidir.
