# AGENT LOG — Responsive Home Bento Grid
**Tarih:** 2026-06-21
**Commit:** `feat: responsive home bento grid — desktop asymmetric L, tablet twin-column, mobile paired grid`

---

## Amaç
6 home kartı (Championship Leader, Next Race, Driver Standings, Constructor
Standings, Last Race Recap, Tyre Compounds) için spec'teki 3-breakpoint
responsive layout'u uygulamak. Genişlikler fluid (1fr), yalnızca satır
yükseklikleri sabit.

## Layout (grid-template-areas, breakpoint başına ayrı set)

| Breakpoint | İsim | Grid |
|---|---|---|
| Mobile <768px | Paired Grid | 2 col · rows 240/170/160/160 · 2 hero full-width + 4 kart 2×2 |
| Tablet 768–1023 (md) | Twin Column | 2 col · rows 280/200/200 · 2 hero yan yana + 4 kart 2×2 |
| Desktop ≥1024 (lg) | Asymmetric L | 4 col · rows 240/240/200 · Leader 2×2 sol, Next sağ-üst, Drivers+Constructors sağ-orta, LastRace+Tyre alt yarımlar |

- Gap sabit 16px, tüm breakpoint'lerde.
- Kartlar `grid-area` adıyla yerleştirilir (nth-child değil) → JSX sırası serbest, layout okunabilir.
- `md` breakpoint kullanıldı (Tailwind v4 varsayılan 768px) — spec'e uygun, mevcut `sm` (640) tablet sınırından `md`'ye çekildi.

## Spec'ten bilinçli sapmalar (kullanıcı onaylı)
1. **Hero accent rengi:** Spec sabit `#ff1801` istiyordu; kullanıcı kararıyla **takım rengi korundu**. `.bento-hero` class'ı `--hero-accent` CSS değişkeni okur; Leader tile bunu lider pilotun takım rengine set eder, Next Race set etmez → brand red'e düşer. Nötr gradient base (`#161413→#141414→#150e0d`) + sağ-alt köşe radial glow (`--hero-accent` %16) spec'e uygun uygulandı.
2. **Kapsam:** Spec 6 kart; mevcut home'daki News (3'lü grid + divider) **aynen korundu**. On This Day, 6 kart ile News arasında **tam-yatay, iki yandan NeonDivider'lı, daha detaylı kendine özel panele** çevrildi (`BentoOnThisDayPanel`): sol ray (FROM THE ARCHIVE + dev başlık + bugünün tarihi) + sağ takım-renkli kazanan kartları (yıl Bebas + GP + kazanan + takım logosu).

## Değişen dosyalar
- `app/globals.css` — `.home-bento` named-grid-areas (3 breakpoint), `.bento-hero` (gradient + --hero-accent), eski `.bento-hero-tile`/`.bento-mid-row` kaldırıldı
- `components/home/CompactBentoDashboard.tsx` — 3 ayrı responsive bloktan tek `.home-bento` grid'e refactor + On This Day panel + dividerlar
- `components/home/BentoOnThisDayPanel.tsx` — YENİ tam-yatay editöryel panel
- `components/home/BentoLeaderTile.tsx` — `.bento-hero` + `--hero-accent: teamColor`
- `components/home/BentoRaceTile.tsx` — sidebar variant `.bento-hero`
- `components/home/BentoOnThisDayTile.tsx` — SİLİNDİ (dead code, panel yerine geçti)
- Kart component'lerinin İÇİ değişmedi (mimariye sadık)

## Test
- `npm run build` → 0 hata (24.9s) ✓
- `npx tsc --noEmit` → 0 hata ✓
- Playwright 390 / 820 / 1280px → 3 layout da spec grid alanlarına uyuyor ✓ (`test-results/bento-{mobile,tablet,desktop}-*.png`)
- On This Day paneli mock veriyle doğrulandı (`test-results/otd-panel-*.png`); canlıda bugün için veri yoksa panel gizlenir (graceful), tek divider kalır.
- Console: yalnızca lokal Vercel Analytics/Speed-Insights 404'leri (prod'da yok) — hidrasyon/React hatası yok.

## Not
- `prefers-reduced-motion`: layout media-query bazlı, ekstra geçiş yok; hero glow statik (instant render) — spec'e uygun.
- `CompactBentoDashboardProps`'taki `previousPanel`/`afterNextPanel` artık dashboard'da kullanılmıyor ama interface'te kaldı (page.tsx null geçiyor, zararsız).
