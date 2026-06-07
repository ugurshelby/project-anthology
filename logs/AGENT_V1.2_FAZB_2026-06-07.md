# AGENT — v1.2 Faz B (B2/B4/B5/B6) — 2026-06-07

Plan: `plans/v1.2-polish.md` B bölümü. B1 (NewsCarousel) zaten tamamlanmıştı, dokunulmadı.
B3 (bento) önceki oturumda bitmişti. Bu oturum: **B2, B4, B5, B6**.

## Ne yapıldı

### B2 — Detay sayfalarında geri / ESC
- **YENİ `components/ui/BackButton.tsx`** (`'use client'`): `useRouter().back()` + `useEffect` ESC
  (`keydown` → Escape) listener. `window.history.length <= 1` (doğrudan giriş/paylaşılan link) ise
  `fallbackHref`'e `router.push`. Animasyon yok → reduced-motion nötr. `aria-label="Back to … (or press Escape)"`.
- `app/circuits/[id]/page.tsx` ve `app/anthology/[slug]/page.tsx`'teki statik "← All …" linkleri
  `<BackButton fallbackHref=… label=… />` ile değiştirildi. Kullanılmayan `Link` importları temizlendi.

### B4 — Season race calendar tıklanabilir
- `app/season/page.tsx` calendar kartları: `circuitId` varsa kart `<Link href={/circuits/${circuitId}}>`
  ile sarılıyor (hover opacity), yoksa eski `<div>` kalıyor. Kart içeriği `cardInner` fragment'ına
  çıkarılıp tek yerden render edildi (link/non-link dallarında tekrar yok). `Link` import eklendi.

### B5 — Circuits detay hava durumu (Open-Meteo, env-siz)
- Karar: calendar snapshot `Location` lat/long sağlamıyor (`lib/f1Calendar.ts` `CalendarCircuit.Location`
  yalnız locality/country) → plan B5'in statik koordinat yolu kullanıldı.
- **`data/circuits/facts.ts`:** `CircuitFacts`'e `lat?`/`lon?` eklendi; **24 pistin hepsine** koordinat girildi.
- **`lib/data/circuits.ts`:** `CircuitWeather` tipi + `getCircuitWeather(lat, lon)` — Open-Meteo
  `current` endpoint (no key, server-side), 6s AbortController timeout, `next: { revalidate: 900 }`,
  WMO kod→özet map. Hata/eksik koordinatta `null` döner (panel zarifçe gizlenir).
- **`app/circuits/[id]/page.tsx`:** `getCircuitWeather(facts.lat, facts.lon)` await; `weather` null değilse
  panel (sıcaklık + özet + feels-like + rüzgâr + day/night). `null` ise panel render edilmez.
- **`next.config.ts`:** CSP `connect-src`'e `https://api.open-meteo.com` eklendi (ileriye dönük; fetch
  zaten server-side ama hijyen).

### B6 — Tech Glossary kartları in-place expand
- **YENİ `components/ui/GlossaryCard.tsx`** (`'use client'`): term collapsed, tıklayınca tanım
  `max-height` 300ms `cubic-bezier(0.77,0,0.18,1)` ile açılır. `aria-expanded` + `aria-controls`,
  "+"→45° dönen ikon. `#slug` hash hedefiyse `requestAnimationFrame` ile otomatik açılır (GlossaryLink
  zıplamaları açık kartta iner). reduced-motion'da geçiş yok (lazy `useState` initializer, SSR-safe).
  `id={slug}` + `scroll-mt-20` korundu (anchor + GlossaryLink uyumu).
- `app/tech-glossary/page.tsx`: `<dl>` term render'ı `<GlossaryCard term={t} />` grid'i ile değiştirildi
  (tyre bölümüne dokunulmadı).

## Değişen / yeni dosyalar
- YENİ: `components/ui/BackButton.tsx`, `components/ui/GlossaryCard.tsx`
- DEĞİŞ: `app/circuits/[id]/page.tsx`, `app/anthology/[slug]/page.tsx`, `app/season/page.tsx`,
  `app/tech-glossary/page.tsx`, `data/circuits/facts.ts`, `lib/data/circuits.ts`, `next.config.ts`

## Çalıştırılan komutlar
- Her madde sonrası `npm run build` → exit 0.
- `npm run lint` → 0 error, 3 warning (hepsi `old-versions-valuable-files/`, excluded).
- `npm run start` (:3100) + curl runtime teyidi.

## Hatalar / çözümler
1. **Build `Type error: Cannot find name 'AppRoutes'`** (`.next/dev/types/validator.ts`) — bayat
   typegen artefaktı (B4 typed-route href değil). `Remove-Item -Recurse .next` + temiz build → exit 0.
2. **Lint error `Calling setState synchronously within an effect`** (GlossaryCard) — `useEffect`
   içindeki iki `setState`. Çözüm: `reduceMotion` lazy `useState` initializer'a (SSR-safe), hash
   auto-open `requestAnimationFrame` ile defer edildi → 0 error.

## Runtime doğrulama (localhost:3100, prod build)
- B5: `/circuits/monaco` → `23°C · Partly cloudy`, Feels Like 24°C, Wind 10 km/h, Day (canlı Open-Meteo).
- B2: `/circuits/monaco` + `/anthology/senna-monaco` → `aria-label="Back to … (or press Escape)"`.
- B4: `/season` → calendar kartları `href="/circuits/albert_park|americas|baku|…"`.
- B6: `/tech-glossary` → 11 `aria-expanded="false"` + `aria-controls="…-def"` (collapsed default).
- Route tablosu: `/circuits/[id]` artık `● … 15m 1y` (ISR; weather build'de fetch, 15dk revalidate).

## Sonraki adım
- Push sonrası prod görsel kontrol (mobil): weather panel, glossary expand animasyonu, ESC davranışı.
- Açık devreden: C (testler/a11y/Lighthouse) + D (görsel denetim). B tamam.
