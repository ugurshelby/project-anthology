# AGENT LOG — Sinematik hero (Stitch) + homepage featured-news entegrasyonu
**Tarih:** 2026-06-06 · **Agent:** Claude Code · **Branch:** main

## Ne yapıldı
Stitch'te üretilen 2 tasarım (Atmospheric Hero + Featured News Hero, desktop+mobile)
projeye entegre edildi. Stitch'in renk/font değerleri bizim design-system token'larına
(`var(--accent)`, `var(--paper)`, `font-display`) çevrildi — CDN Tailwind / Material Symbols
bağımlılığı TAŞINMADI, sadece görsel tasarım.

- **AtmosphericHero (6 sayfayı birden etkiler):** içerik artık tam MERKEZ (`items-center justify-center text-center`); başlık `clamp(5rem,16vw,12rem)` (önce 4/14/10); globals.css hero katmanları Stitch değerlerine ince-ayar: spotlight TL `15% 15%`/0.08, TR `85% 15%`/0.06, red glow `50% 100%`/0.15, light-streak top 55% blur 8px 12s. `prefers-reduced-motion` korundu.
- **NewsFeaturedHero (yeniden yazıldı):** 100vh full-bleed haber görseli + Stitch gradient (transparent→rgba(0,0,0,.35) 45%→#0a0a0a) + film grain (feTurbulence 0.65) + alttan kırmızı glow; içerik alt-merkez: kırmızı kaynak/tarih + yanıp sönen nokta + dev başlık clamp(2.5rem,7vw,5.5rem) + summary + "Read story →" (ok hover'da kayar).
- **Backend `getFeaturedNews()` (lib/data/news.ts):** görseli olan (image_url≠favicon) en yeni haberi seçer; yoksa en yeniye, hiç haber yoksa null'a düşer. getLatestNews'i yeniden kullanır (DB→/api/news→static zinciri paylaşılır).
- **Homepage (app/page.tsx):** featured haber varsa NewsFeaturedHero, yoksa ANTHOLOGY AtmosphericHero fallback. Featured RSC'de fetch.
- **News (app/news/page.tsx):** featured artık getFeaturedNews() (görselsiz haber featured olmaz); grid'den featured `id` ile çıkarıldı (çift gösterim yok).

## Değişen dosyalar
- components/ui/AtmosphericHero.tsx, components/ui/NewsFeaturedHero.tsx
- app/globals.css
- app/page.tsx, app/news/page.tsx, app/season/page.tsx, app/circuits/page.tsx, app/radio/page.tsx, app/anthology/page.tsx, app/tech-glossary/page.tsx (hero clamp + merkez)
- lib/data/news.ts (getFeaturedNews)
- lib/f1/mrdata.ts (PoleInfo.driverCode — önceki season çalışmasından, linter)

## Çalıştırılan komutlar
- `npm run build` → exit 0, 30/30 sayfa.
- Salt-okunur DB kontrolü: news_cache'te 8/8 haber görselli → featured hero gerçek veriyle çalışır.
- Canlı dev (localhost:3000) doğrulama: homepage ilk h1 = "Lewis Hamilton stuns F1 fans..." (featured render oluyor), "Read story" linki + clamp(2.5rem,7vw,5.5rem) sayfada.

## Stitch referans ekranları (F1 Tracker projesi 2945783334156170940)
- Atmospheric Hero Desktop f7c2f84c14f24bc39f7f8579beb5888d / Mobile 41d0934cff264acfaef59f462b0663ca
- Featured News Hero Desktop 82f64317cc464775ac116f47783cfc32 / Mobile 0d34f16a46f04cc795a5d97c690ddf55

## Kapsam dışı bırakılanlar (commit'e dahil değil)
- lib/assets/f1-icons.ts (benim işim değil, başka çalışma)
- supabase/.temp/cli-latest (CLI cache)

## Sonraki adım
- Vercel prod deploy doğrulaması (push sonrası homepage'de featured hero).
- Opsiyonel: cron sync-news düzenli çalıştığından emin ol ki featured hep güncel kalsın.
