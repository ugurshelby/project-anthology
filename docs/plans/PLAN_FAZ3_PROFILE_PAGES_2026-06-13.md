# PLAN — Faz 3: Pilot & Takım Profil Sayfaları (MVP) — 2026-06-13

> Kaynak: `docs/APEX_MASTER_PLAN.md` §5.
> Kapsam kararı (kullanıcı onayı): **MVP dikey dilim** + **sadece sezon verisi**.
> Kariyer aggregate (F1DB live), public/cars görselleri, takım merkezi haritası,
> data/teams + data/drivers statik hikaye metinleri → SONRAKİ dalga (backlog).

## Durum (2026-06-13)
- ✅ Aşama 1 — sezon-bazlı renk paleti (`config/team-colors.ts`)
- ✅ Aşama 1.5 — veri katmanı (`mrdata.ts` slug'lar, `lib/data/entities.ts`, `news.ts`)
- ✅ Aşama 2 — takım profil sayfası (`app/teams/[constructorId]/page.tsx`)
- ✅ Aşama 3 — pilot profil sayfası (`app/drivers/[driverId]/page.tsx`)
- ✅ Aşama 4 — grid sayfaları + navbar + sitemap
- 🔄 Aşama 5 — SeasonExplorer → sayfa nav: TAMAMLANDI (`0d4b41c`).
- ✅ Doğrulama: build/test/tsc yeşil · Faz 3 commit `0d4b41c` · log yazıldı.

### Önceki fazlar (bağlam)
- ✅ Faz 0 (commit `492eb56`/`ee128a1`/`d68cd0f`), ✅ Faz 2 PWA (commit `f140758`).

## Veri Gerçekliği (Karardan Koda)
- `getSeasonData(year)` → `standings` (DriverStandingRow), `constructors`
  (ConstructorStandingRow), `driverStats` (wins/podiums/round). DB-first snapshot.
- Standings row'ları şu an `driverId`/`constructorId` TAŞIMIYOR → URL slug'ı için
  Jolpica stable id'leri (`max_verstappen`, `red_bull`) gerekiyor.
  **Çözüm:** mrdata extractor'larına `driverId`/`constructorId` eklenecek
  (raw payload'da Driver.driverId + Constructor.constructorId mevcut).
- Driver/team SVG asset'leri sezon bazlı VAR (public/drivers/{yıl}, public/teams/{yıl}).
- Haberler: `news_cache` ILIKE (mevcut `lib/data/news.ts` + aggregate).

## Aşama 1 — Sezon-bazlı renk paleti altyapısı
- `config/team-colors.ts`:
  - `SeasonPalette { primary; secondary; accent }` interface.
  - Seçili 5 takıma tarihsel palet (en az 3 dönem): McLaren, Ferrari, Mercedes,
    Red Bull, Williams. `seasonPalettes?: Record<number, SeasonPalette>`.
  - `getSeasonPalette(teamId, season)`: tam eşleşme → en yakın geçmiş yıl →
    mevcut primary/secondary/accent fallback.
  - CSS değişken üreticisi: `teamPaletteCssVars(palette)` →
    `--team-primary/secondary/accent`.
- Default (takım yok): `#0a0a0a / #ff1801 / #cc1400`.

## Aşama 1.5 — Veri katmanı (slug + entity lookup)
- `mrdata.ts`: DriverStandingRow'a `driverId`, ConstructorStandingRow'a
  `constructorId` ekle (extractor + tip). Geriye dönük uyumlu (opsiyonel değil,
  raw'dan map'lenir; yoksa '' ).
- `lib/data/entities.ts` (YENİ):
  - `getDriverProfile(driverId, season)`: o sezon standings'ten satırı bul,
    roster/takım bilgisini çıkar.
  - `getTeamProfile(constructorId, season)`: constructor standing + o sezon
    pilotları.
  - `getCurrentDrivers()` / `getCurrentTeams()`: grid için CURRENT_SEASON.
  - Sezon listesi: bir sürücünün/takımın hangi sezonlarda standings'te olduğu —
    MVP'de yalnızca CURRENT_SEASON + son birkaç sezonu tara (sınırlı fan-out).

## Aşama 2 — Takım profil sayfası `/teams/[constructorId]`
- RSC. `generateMetadata` (canonical, OG, twitter).
- Hero: 60-30-10 (palette CSS değişkenleri), takım amblemi (teamIconSrc),
  güncel sezon standings chip. Atmosferik katmanlar (mevcut hero dili).
- Sezon seçici (pill) — client island; seçim URL query (`?season=`) veya
  client state; renk geçişi 800ms CSS var (reduced-motion instant).
- İçerik: o sezon standings (pozisyon/puan/galibiyet), o sezon pilotları,
  ilgili haberler (3 kart, SADECE CURRENT_SEASON).

## Aşama 3 — Pilot profil sayfası `/drivers/[driverId]`
- RSC. Hero: büyük numara YERİNE (numara verisi standings'te yok) → büyük pilot
  adı + büst SVG + takım rengi glow (glassmorphism gradient --secondary→--accent).
  NOT: plan "büyük numara" diyor ama permanent number standings snapshot'ında
  yok → ad-merkezli hero (büst + isim) MVP'de daha sağlam. Numara backlog.
- Sezon seçici, o sezon stats (pozisyon/puan/galibiyet/podyum), takım,
  ilgili haberler (3 kart, CURRENT_SEASON).

## Aşama 4 — Grid sayfaları
- `/drivers`: CURRENT_SEASON pilot grid (büst + isim + takım + puan).
- `/teams`: CURRENT_SEASON takım grid (amblem + isim + puan).
- Hover: takım rengi border-left glow. Link → profil.
- Navbar: "Drivers" + "Teams" linkleri (SiteNav + MobileBottomNav uyumu).
- `app/sitemap.ts`: yeni statik rotalar.

## Aşama 5 — EntityDrawer → sayfa navigasyonu
- `SeasonExplorer`: pilot/takım satır/kartları artık `/drivers/[id]` ve
  `/teams/[id]`'ye `Link`. EntityDrawer KALDIRILMAZ (geriye dönük) ama tıklama
  davranışı sayfaya yönlendirir (plan: "EntityDrawer yerine sayfa açılsın").
  MVP: satırlar Link olur; drawer kullanılmıyorsa import temizlenir.

## Doğrulama
- `npm run build` 0 hata · `npm test` yeşil · değişen dosyalarda lint temiz.
- Yeni sayfalar sitemap'te.
- `logs/AGENT_FAZ3_PROFILE_PAGES_2026-06-13.md`.

## Kapsam Dışı (bilinçli — backlog)
Kariyer aggregate (F1DB live read), public/cars araç görselleri, takım merkezi
haritası, data/teams + data/drivers statik hikaye metni, kalıcı pilot numarası
hero, kask/tulum renk şeması bölümü, anthology hikaye join.
