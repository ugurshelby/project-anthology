# AGENT — v1.1 Faz A + Faz C-C1 — 2026-06-07

Plan: `plans/v1.1-improvements.md` (Faz A navigasyon/mobil/hero + Faz C-C1 güvenlik header'ları).

## Ne yapıldı

### Faz A — Navigasyon + Mobil + Hero
- **A1+A3 Navbar:** Hamburger (`.menu-icon`) tamamen kaldırıldı. Nav linkleri artık her viewport'ta
  görünür. Logo merkezde, linkler iki yana bölündü (sol: Anthology/News/Circuits, sağ: Season/Glossary;
  Home = ortadaki brand). `.site-nav-inner` 3 sütun grid (`1fr auto 1fr`). Mobilde (`<lg`) küçük
  font/gap; 380px altında flanklar logonun altına iner (yatay scroll engellenir). 6 link korundu
  (Radio eklenmedi — kullanıcı kararı).
- **A2 Mobil alt navbar kaldırıldı:** `MobileBottomNav` `layout.tsx`'ten çıkarıldı, dosya silindi
  (`components/ui/MobileBottomNav.tsx`), `globals.css`'teki `.mobile-bottom-nav*` kuralları silindi.
  `.site-main` alt padding'i sıfırlandı (`--mobile-nav-height` offset kaldırıldı).
- **A4 Homepage hero:** `NewsFeaturedHero` homepage'den kaldırıldı (`/news`'te KALDI). Yeni:
  `AtmosphericHero` + "PROJECT ANTHOLOGY" (`clamp(3.5rem,16vw,12rem)`) + yeni `RaceHeroPanels`
  (Previous | Next-büyük+countdown | Then). 3 panel de `/circuits/[id]`'ye link. Ayrı "Race Countdown"
  section silindi (countdown ortadaki panele taşındı). `getFeaturedNews()` çağrısı homepage'den kaldırıldı.
- **A6 Season mobil dikey standings:** Driver standings responsive — `md+` mevcut tablo (`hidden md:block`),
  `<md` dikey kart listesi (`md:hidden`, takım-renkli şerit + pos + ikon + isim + puan). Aynı `standings` verisi.
- **A5 Mobil overflow guard:** `html` + `body`'ye `overflow-x:hidden` (+ `body max-width:100%`). En büyük
  overflow kaynağı (`min-w-[480px]` tablo) mobilde gizlendiği için kalkıyor.

### Faz C — SEO & Güvenlik (URL-bağımsız kısım)
- **C1 Güvenlik header'ları:** `next.config.ts`'e `headers()` eklendi (Sentry wrapper içindeki config'e).
  Tüm route'lar (`/:path*`) için: pragmatik CSP + `X-Frame-Options: SAMEORIGIN` +
  `X-Content-Type-Options: nosniff` + `Cross-Origin-Opener-Policy: same-origin` +
  `Referrer-Policy: strict-origin-when-cross-origin`. CSP `connect-src`: self + Supabase + Sentry +
  Vercel insights + Jolpica + OpenF1. `img-src 'self' data: blob: https:` (next/image + haber CDN).

## Değişen dosyalar
- `components/ui/SiteNav.tsx` — hamburger kaldır, leftLinks/rightLinks split
- `components/ui/MobileBottomNav.tsx` — **SİLİNDİ**
- `components/ui/RaceHeroPanels.tsx` — **YENİ** (server component, 3 panel)
- `app/layout.tsx` — MobileBottomNav import+kullanım kaldırıldı
- `app/page.tsx` — hero değişimi, RaceHeroPanels, Race Countdown section silindi, featured kaldırıldı
- `app/season/page.tsx` — mobil dikey standings
- `app/globals.css` — nav grid/mobil düzen, menu-icon + mobile-bottom-nav temizliği, overflow-x guard, site-main padding
- `lib/f1/mrdata.ts` — `getRaceAfter(races, round)` saf helper eklendi
- `next.config.ts` — `headers()` + CSP + güvenlik header'ları
- `plans/v1.1-improvements.md` — **YENİ** (plan)

## Çalıştırılan komutlar
- `npm run build` → **exit 0**, 51/51 sayfa, 0 TS hatası.
- `curl localhost:3000` (6 rota + 2 detay) → hepsi **200** (CSP sonrası site kırılmadı).
- `curl -I localhost:3000` → 5 güvenlik header'ı doğrulandı.
- DOM teyidi: homepage'de PROJECT ANTHOLOGY + Next Race/Previous panelleri; `menu-icon`/`mobile-bottom-nav` YOK;
  `nav-links-left`/`nav-links-right` VAR; season'da hem mobil ul hem desktop tablo.

## Hatalar / çözümler
- Build log'unda `[data] fallback static → /api/f1-season (proxy)` (2026 round 14 results) — hata değil,
  read layer fallback'i çalışıyor (DB'de o round sonucu yok).

## Sonraki adım
- **Push kullanıcı onayı bekliyor** (plan gereği faz başına ayrı commit + onaylı push).
- Faz C-C2/C3: yeni production URL gelince (canonical + siteUrl.ts + deploy).
- Faz B: carousel, ESC/back, bento, hava durumu, glossary expand.
- ⚠️ Açık not: Season driver standings DB'de boş (`standings_drivers` yok) — veri/cron konusu, layout değil.
- ⚠️ Görsel teyit: mobil 360/390px `scrollWidth<=clientWidth` ve navbar mobil görünümü tarayıcıda
  kullanıcı tarafından bakılmalı (oturumda screenshot tooling yok).
