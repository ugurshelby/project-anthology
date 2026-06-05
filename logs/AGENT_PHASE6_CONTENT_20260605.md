# AGENT LOG — Phase 6: İçerik Sayfaları (anthology / tech-glossary)
**Tarih:** 2026-06-05
**Sorumlu:** Claude Code (veri + logic) — Cursor UI dilimi bu oturumda da Claude tarafından yapıldı

## Ne yapıldı
1. **migration-source kurtarma:** İçerik eski git HEAD'de değil, **initial commit `a07f942`** içindeydi.
   `git show a07f942:migration-source/{storyMetadata,storyContent}.ts` ile 17 tam hikaye kurtarıldı
   (radioArchive.js da mevcut, Phase ileride radio için kullanılabilir). **Örnek seed verisi YAZILMADI** —
   gerçek kurtarılan içerik kullanıldı.
2. **Tracked içerik modülü:** `scripts/build-story-content.ts` ile kurtarılan dosyalar tek seferde
   `data/stories/content.ts`'ye dönüştürüldü. Eski flat `/Foo.jpg` görsel path'leri gerçek
   `public/stories/{slug}/{layout}/{NN}.png` şemasına yeniden eşlendi (layout başına sıralı index,
   diskteki dosya sayısına clamp). `data/stories/types.ts` paylaşılan tipler.
3. **Seed:** `scripts/seed-stories.ts` (+ `npm run seed:stories`) → `stories` tablosuna 17 hikaye
   `published=true`, `content` jsonb (subtitle/year/category/heroImage/blocks). Idempotent
   upsert(onConflict 'slug'). sort_order = 9999 - yıl (yeni → önce). **17 upsert, 0 hata.**
4. **Veri katmanı:** `lib/data/stories.ts` — `getPublishedStories()`, `getStoryBySlug()`,
   `getStorySlugs()` (RSC, RLS published filtresi, jsonb → typed view).
5. **`/anthology`:** RSC liste sayfası. `StoryCard` client component — DESIGN_SYSTEM kart spec'i:
   full-bleed 16/9 image, gradient overlay (transparent 30% → 0.85), IBM Plex Mono kategori,
   Bebas Neue başlık, in-place expand (300ms cubic-bezier 0.77,0,0.18,1), border-left 3→6px hover,
   0 radius/shadow. SafeImage placeholder fallback.
6. **`/anthology/[slug]`:** Detay sayfası. jsonb blocks render (paragraph/quote/heading/image),
   `generateStaticParams` (17 SSG path), `generateMetadata` (dinamik OG title/description + image).
   Paragraflar `<GlossaryLink>` ile sarılı.
7. **`/tech-glossary`:** Statik içerik. **Karar:** glossary terimleri DB değil tracked TS modülü
   (`data/glossary/terms.ts`, 11 terim) — sabit referans kümesi, anchor slug gerekli, hem sayfa hem
   linker build-time tüketiyor, DB round-trip gereksiz. Kategoriye göre gruplu kart listesi.
8. **`components/GlossaryLink.tsx`:** Metindeki teknik terimleri regex ile yakalar → `/tech-glossary#slug`.
   Kelime sınırı `\b`, case-insensitive, **terim başına tek link** (ilk eşleşme), alias desteği
   (DRS = Drag Reduction System), uzun yüzey formu önce. Saf server component (per-call RegExp,
   shared mutable state yok — React purity uyumlu).
9. **Nav:** `SiteNav`'a Anthology + Glossary linkleri eklendi.

## Değiştirilen / eklenen dosyalar
- YENİ: `data/stories/types.ts`, `data/stories/content.ts` (auto-gen), `data/glossary/terms.ts`
- YENİ: `scripts/build-story-content.ts`, `scripts/seed-stories.ts`
- YENİ: `lib/data/stories.ts`
- YENİ: `app/anthology/page.tsx`, `app/anthology/_components/StoryCard.tsx`, `app/anthology/[slug]/page.tsx`
- YENİ: `app/tech-glossary/page.tsx`, `components/GlossaryLink.tsx`
- DEĞİŞ: `app/globals.css` (glossary-link + story-prose stilleri), `components/ui/SiteNav.tsx`,
  `package.json` (seed:stories), `app/api/cron/sync-radio/route.ts` (lint: `let round` → `const`)

## Çalıştırılan komutlar
```
git show a07f942:migration-source/storyMetadata.ts   # kurtarma
npx tsx scripts/build-story-content.ts               # 17 story → data/stories/content.ts
npx tsx scripts/seed-stories.ts --dry-run
npm run seed:stories                                 # 17 upsert, 0 hata
npm run build                                        # exit 0, 27/27 sayfa
npm run lint
curl .../anthology .../anthology/senna-monaco .../tech-glossary   # smoke 200
```

## Karşılaşılan hatalar ve çözümleri
1. **migration-source HEAD~N'de yok** → tüm history arandı; içerik `a07f942` (initial commit)'te bulundu.
2. **Görsel path uyuşmazlığı** (eski `/Foo.jpg` ↔ yeni `public/stories/{slug}/...`) → transform script
   layout+index ile yeniden eşledi; SafeImage placeholder güvencesi.
3. **`StoryInsert[]` upsert → `never[]` tip hatası** → `Database` tipi `Relationships: never[]` array
   generic'i bozuyor; `lib/f1Ingest.ts` desenindeki gibi cast edildi.
4. **GlossaryLink lint: impure function / immutable mutation** → module-level global RegExp yerine
   per-call `new RegExp` (saf render).
5. **Beklenmeyen page.tsx değişiklikleri** (CRLF + className normalize, başka süreçten) → Phase 6 dışı,
   `git checkout` ile geri alındı; commit'e dahil edilmedi.

## Doğrulama (DoD)
- [x] `/anthology` 200, 17 hikaye kartı render
- [x] `/anthology/[slug]` 200, jsonb içerik render, 17 SSG path prerender
- [x] `/tech-glossary` 200, 11 terim kategoriye gruplu
- [x] GlossaryLink çalışıyor (senna-donington-1993: "active suspension" linklendi, count=1)
- [x] `npm run build` → exit 0 (27/27 sayfa)

## Sonraki adım
- Phase 7 (SEO + QA): sitemap.ts/robots.ts, JSON-LD, next/og dinamik OG image, headless smoke.
- Phase 5 Task 5 (User): anthology/glossary destek görselleri (.webp) — opsiyonel.
- radioArchive.js içeriği ileride radio_moments transcript seed için kullanılabilir.
