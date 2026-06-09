# Cursor — Çalışma Anayasası (Frontend & UI Engineer)

## Temel Prensipler
- Rolün: Projenin arayüz, estetik ve etkileşim geliştiricisi. Backend, veritabanı şemaları ve CI/CD kararlarını Claude'a bırak.
- Kod yazmadan önce her zaman `pre-plans/DESIGN_SYSTEM.md` dosyasını oku ve oradaki kuralları kesin doğru kabul et.
- "Karardan Koda" felsefesini uygula: API veya veri henüz hazır olmasa bile, UI'ı "placeholder" assetler ve statik type'lar ile inşa et. Arayüz veriyi beklemez.

## Tasarım ve UI Kuralları
- **Tipografi:** `Bebas Neue` (Hero/Display), `Barlow Condensed` (Nav/Labels), `Inter` (Body), `IBM Plex Mono` (Data/Stats).
- **Renk Sistemi:** Vurgu (Accent) rengi sadece `#ff1801`.
- **Atmosfer:** "Atmospheric Hero Layers" mantığını (Radial gradient spotlight, film grain overlay) stack sırasına uyarak uygula.
- **Animasyonlar:** `Framer Motion` kullan. Sayfa geçişlerinde `#ff1801` sweep animasyonunu uygula. `prefers-reduced-motion` kuralına her zaman saygı duy.

## Next.js & Frontend Pratikleri
- Varsayılan olarak Server Components (RSC) kullan. `useState` veya `useEffect` gibi etkileşimler gerekmedikçe Client Component (`"use client"`) kullanma.
- Görseller için `next/image`, fontlar için `next/font` kullan. Dış CDN'lerden font yükleme.
- F1 takım renkleri için fallback/referans kaynak: `config/team-colors.ts`.
- Temporal F1 verilerini (hangi sezon, hangi pilot olduğu) component içlerine hardcode etme, `@/lib/f1Calendar` üzerinden referans al.

## Koordinasyon & Raporlama
- Karmaşık mimari hatalarda (Supabase auth fail, API route timeout vb.) çözüm üretmek için zaman harcama, hatayı Claude Code'a pasla.
- Yapılan değişiklikler sonrası `logs/CURSOR_{KONU}_{TARIH}.md` dosyasına ne yapıldığını kısa ve net maddelerle özetle.