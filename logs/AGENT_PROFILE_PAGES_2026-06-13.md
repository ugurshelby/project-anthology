# AGENT LOG — Faz 3: Pilot & Takım Profil Sayfaları (2026-06-13)

Kaynak: `docs/APEX_MASTER_PLAN.md` §5. Kapsam: Faz 3 Aşama 1–5 (MVP dikey dilim).

## Ne yapıldı

### Aşama 1 — Sezon-bazlı renk paleti
- `config/team-colors.ts`: `SeasonPalette` interface, `getSeasonPalette()`, `teamPaletteCssVars()`.
- McLaren, Ferrari, Mercedes, Red Bull, Williams için tarihsel paletler (≥3 dönem).
- CSS custom properties: `--team-primary`, `--team-secondary`, `--team-accent`.
- `app/globals.css`: profil hero / grid / motion-narrative sınıfları.

### Aşama 1.5 — Veri katmanı
- `lib/f1/mrdata.ts`: `DriverStandingRow.driverId`, `ConstructorStandingRow.constructorId` (Jolpica slug).
- `lib/data/entities.ts`: `getDriverProfile`, `getTeamProfile`, `getCurrentDrivers`, `getCurrentTeams`, sezon listeleri.
- `lib/data/news.ts`: `getNewsForEntity()` — `news_cache` ILIKE filtresi.

### Aşama 2 — Takım profil sayfası
- `app/teams/[constructorId]/page.tsx` (RSC): atmospheric hero, sezon seçici, standings, pilotlar, haberler.
- `components/profile/SeasonPills.tsx`, `RelatedNews.tsx`.

### Aşama 3 — Pilot profil sayfası
- `app/drivers/[driverId]/page.tsx` (RSC): ad-merkezli hero (büst + takım rengi glow), sezon stats, haberler.

### Aşama 4 — Grid sayfaları + nav
- `app/drivers/page.tsx`, `app/teams/page.tsx`: güncel sezon grid kartları.
- `components/ui/SiteNav.tsx`: Drivers + Teams linkleri.
- `app/sitemap.ts`: `/drivers`, `/teams` statik rotalar.

### Aşama 5 — EntityDrawer → profil navigasyonu
- `components/season/SeasonExplorer.tsx`: mobil liste, masaüstü tablo ve constructor listesi
  `openDriver` / `openTeam` ile `/drivers/[id]?season=` ve `/teams/[id]?season=` yönlendirir;
  `driverId`/`constructorId` yoksa EntityDrawer fallback korunur.
- `components/home/BentoStandingsTile.tsx`: satırlar `driverId` varsa profil `Link`.
- `components/home/BentoConstructorsTile.tsx`: takım satırları profil `Link`; tile altında “Full season →”.
- `components/home/BentoLeaderTile.tsx`: şampiyona lideri profil `Link`.

## Commit
- `0d4b41c` — `feat: driver and team profile pages + EntityDrawer navigation refactor`

## Çalıştırılan komutlar
- `npm test` → ✅ 7 dosya / 52 test yeşil.
- `npx tsc --noEmit` → ✅ 0 hata.
- `npm run build` → ✅ başarılı; `/drivers`, `/drivers/[driverId]`, `/teams`, `/teams/[constructorId]` route'ları üretildi.

## Kapsam dışı (bilinçli backlog)
- Kariyer aggregate (F1DB live), kalıcı pilot numarası hero, takım merkezi haritası, araç görselleri, statik hikaye metinleri.

## Hariç tutulan dosyalar (bu commit'te yok)
- `components/ui/OdometerDigit.tsx` (Faz 1 polish, ayrı diff)
- `plans/v1.2-polish.md` silme, `claude-chat.md`, `logs/lighthouse/`, `.cursor/plans/`
