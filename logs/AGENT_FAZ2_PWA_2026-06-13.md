# AGENT LOG — Faz 2: PWA (2026-06-13)

Kaynak: `docs/APEX_MASTER_PLAN.md` §4. Kapsam: SADECE Faz 2.

## Ne yapıldı

### İkonlar (chevron logosundan üretildi)
- `assets/icons/app-icon.svg`: brand chevron (DESIGN_SYSTEM mark) — #0a0a0a
  zemin, #ff1801 accent + beyaz @35% ikincil, maskable safe-zone padding'li.
- `assets/scripts/generate-pwa-icons.mjs`: `sharp` ile SVG→PNG. Üretilen:
  `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180).
- `package.json` script: `npm run gen:pwa-icons`.

### Manifest
- `app/manifest.ts` (Next 16 App Router convention → `/manifest.webmanifest`):
  name/short_name "Apex" (SITE_NAME), theme_color #ff1801, background #0a0a0a,
  display standalone, start_url /, 192+512 ikonlar (any + maskable ayrı entry —
  Next 16 tipi "any maskable" birleşiğini kabul etmiyor).

### Service worker (offline)
- `public/sw.js`:
  - Navigations (HTML): network-first → cache → offline shell (/).
  - Static asset (_next/static, /icons, font/img): cache-first.
  - BYPASS (asla cache'lenmez): `/api/`, `/monitoring`, `/feed.xml`,
    `/sitemap.xml`, `/robots.txt`. Cross-origin (haber CDN, Supabase) pass.
  - CACHE_VERSION 'apex-v1'; activate'te eski cache'ler temizlenir.
- `components/providers/ServiceWorkerRegister.tsx`: client, `load` sonrası
  register; sadece production (HMR'de stale cache olmasın); hata non-fatal.

### Layout entegrasyonu
- `app/layout.tsx`: `metadata.icons` (favicon.svg + 192/512 png) +
  `metadata.appleWebApp` + apple-touch-icon; yeni `viewport` export
  (themeColor #ff1801, colorScheme dark — Next 16 themeColor metadata'da değil
  viewport'ta); `<ServiceWorkerRegister />` mount.

## Değişen dosyalar
Yeni: `app/manifest.ts`, `public/sw.js`,
`components/providers/ServiceWorkerRegister.tsx`,
`assets/icons/app-icon.svg`, `assets/scripts/generate-pwa-icons.mjs`,
`public/icons/{icon-192,icon-512,apple-touch-icon}.png`.
Güncellenen: `app/layout.tsx`, `package.json`.

## Çalıştırılan komutlar
- `node assets/scripts/generate-pwa-icons.mjs` → 3 ikon üretildi (chevron
  doğrulandı; ilk denemede scale çok büyüktü → translate/scale düzeltildi).
- `npm run build` → ✅ 0 TS hatası; `/manifest.webmanifest` static route eklendi.
  (Ara hata: manifest `purpose: 'any maskable'` Next 16 tipinde geçersiz →
  ayrı any + maskable entry'lere bölündü.)
- `npm test` → ✅ 7 dosya / 52 test yeşil.
- `npx eslint` (manifest, layout, ServiceWorkerRegister) → 0 hata.

## Karşılaşılan hatalar ve çözümleri
- İkon ilk render'da chevron taşıyordu (scale 13.7 + stroke 34) → scale 16,
  stroke-width 2.6, translate(144 112) ile ortalandı, safe-zone tamam.
- Next 16 manifest `purpose` tek değer ister → any/maskable ayrıldı.
- Next 16 `themeColor` `metadata`'da deprecated → `viewport` export'una taşındı.

## ⚠️ Manuel aksiyon
- Yok (PWA tamamen kod tarafı). Deploy sonrası Chrome DevTools > Application >
  Manifest + Service Workers ile install edilebilirliği doğrula; Lighthouse
  PWA/Installable check'i geçmeli.

## Sonraki adım
- Faz 2 tamamlandı. Faz 3 (pilot/takım profil sayfaları) plana göre sıradaki.
