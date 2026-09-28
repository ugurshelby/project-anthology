# Çoklu Dil Mimarisi (i18n) — Uygulama Planı

> **Durum:** Onaylandı (Efendim, 2026-09-28) — mimari kararlar sabit, uygulama **antigravity** tarafından
> yapılacak. Bu dosya "ne/nasıl" sorusuna cevap verir; kod değişikliği bu oturumda yapılmadı.
>
> **Rol ayrımı:** Backend/API/mimari agent (Claude) bu planı hazırladı ve gerektiğinde DB migration'ını
> uygulayacak. Sayfa/bileşen düzeyinde uygulama, metin çıkarımı ve arayüz detayları **antigravity**'nin işi.
> **Anthology hikaye metinleri bu planın kapsamı dışında** — içerik antigravity'nin editöryel alanı;
> burada yalnızca hikaye içeriğinin *nerede* saklanacağına dair bir şema önerisi var, metnin kendisine
> hiçbir agent bu plan üzerinden dokunmaz.

---

## 1. Mevcut Durum (tespit)

- **Dil desteği yok.** `app/layout.tsx:91` → `lang="en"` sabit. `next-intl`/`react-intl` kurulu değil,
  `middleware.ts` yok, `[locale]` route segmenti yok.
- Tüm UI metinleri (nav, buton, etiket) İngilizce ve component içine gömülü (hardcode).
- İçerik kaynakları:
  - **Haberler** (`lib/news/aggregate.ts`) — canlı RSS, İngilizce kaynaklardan (The Race vb.). Gerçek zamanlı
    çeviri kapsam dışı (bkz. §7).
  - **Anthology hikayeleri** (`stories` tablosu, `content jsonb`, tek dil, `slug` unique) — antigravity şu an
    üzerinde çalışıyor.
  - **Glossary** (`data/glossary/terms.ts`, `data/glossary/tyres.ts`) — statik TS içerik, tek dil.

## 2. Karar Özeti (Efendim onaylı)

| Karar | Değer |
|---|---|
| Diller | **EN** (varsayılan) + **TR** |
| URL stratejisi | EN prefix'siz (`/season`), TR `/tr` prefix'li (`/tr/season`) — mevcut indekslenmiş URL'ler bozulmaz |
| Kütüphane | **`next-intl`** — App Router native, Server Component desteği, Next.js middleware ile birebir uyumlu |
| Kapsam (bu faz) | Tam mimari kurulumu: routing, middleware, mesaj sistemi, dil değiştirici, SEO/hreflang. Sayfa sayfa metin çıkarımı antigravity'nin ardışık işi. |

**Neden next-intl:** `react-intl` App Router'da Server Component'lerle doğal çalışmıyor (context tabanlı);
`next-intl` özellikle Next.js App Router için tasarlandı, `next-intl/middleware` ile locale negotiation'ı
hazır veriyor, `localePrefix: 'as-needed'` modu bizim EN-prefixsiz/TR-prefixli isteğimizi doğrudan destekliyor.

---

## 3. Klasör / Routing Değişikliği

Next.js App Router'da locale-prefixed routing, tüm sayfa rotalarının `[locale]` segmenti altına taşınmasını
gerektirir. **API rotaları, `sitemap.ts`, `robots.ts`, `manifest.ts`, `feed.xml`, `opengraph-image.tsx`
bunun dışında kalır** (sistem rotaları, dil bağımsız).

```
app/
├── [locale]/                    ← YENİ — tüm sayfa rotaları buraya taşınır
│   ├── layout.tsx                ← eski app/layout.tsx buraya taşınır; <html lang={locale}>
│   ├── page.tsx                  ← eski app/page.tsx
│   ├── (legal)/...
│   ├── anthology/...
│   ├── circuits/...
│   ├── drivers/...
│   ├── grid/...
│   ├── news/...
│   ├── season/...
│   ├── teams/...
│   └── tech-glossary/...
├── api/                          ← DEĞİŞMEZ (locale dışı)
├── robots.ts                     ← DEĞİŞMEZ (locale dışı, ama sitemap hreflang emit eder)
├── sitemap.ts                    ← DEĞİŞMEZ konumda, içerik locale-aware olur (§6)
├── manifest.ts                   ← DEĞİŞMEZ
├── feed.xml/                     ← DEĞİŞMEZ
├── opengraph-image.tsx           ← DEĞİŞMEZ (veya locale param'lı hale getirilebilir — opsiyonel)
└── globals.css                   ← DEĞİŞMEZ
```

**Dinamik parametreli sayfalar** (`[year]`, `[n]`, `[driverId]`, `[constructorId]`, `[id]`, `[slug]`) aynı
şekilde `[locale]` altına taşınır; `generateStaticParams` locale × mevcut param kartezyen çarpımı üretir
(next-intl'in `setRequestLocale` + kendi yardımcı fonksiyonları bunu standartlaştırır).

**Not:** Bu, brownfield projede **en riskli adım** — çok sayıda dosya taşınır. Antigravity bunu tek bir
commit'te, build+lint+test yeşil kalacak şekilde yapmalı; ara adımda kırık state push edilmemeli.

---

## 4. Middleware & Locale Negotiation

`middleware.ts` (proje kökünde, mevcut `proxy.ts` ile karışmasın — ayrı dosya):

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // en: /season · tr: /tr/season
  localeDetection: true,      // Accept-Language header + NEXT_LOCALE cookie
});

export const config = {
  // API, statik dosyalar, Next internals hariç her şey
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- İlk ziyarette `Accept-Language` header'ına göre otomatik yönlendirme (TR tarayıcı → `/tr/...`).
- Kullanıcı manuel dil seçerse `NEXT_LOCALE` cookie ile kalıcı hale gelir (URL prefix her durumda öncelikli).
- **`vercel.json` cron rotaları ve `/api/**` middleware matcher'a hiç girmez** — cron auth/CRON_SECRET_KEY
  akışı etkilenmez.

`next.config.ts`'e `next-intl/plugin` sarmalayıcısı eklenir:

```ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

---

## 5. Mesaj Sistemi (UI Chrome Metinleri)

```
messages/
├── en.json
└── tr.json
```

**Namespace yapısı** (component/sayfa ağacını yansıtır, karışıklığı önler):

```jsonc
{
  "nav": { "season": "Season", "grid": "Grid", "circuits": "Circuits", "news": "News", "anthology": "Anthology", "glossary": "Glossary" },
  "home": { "lastRoundWinner": "Last Round Winner", "seasonComplete": "{done}/{total} RACES COMPLETED", "..." : "..." },
  "season": { "driverStandings": "Driver Standings", "..." : "..." },
  "roundDetail": { "raceClassification": "Race Classification", "qualifying": "Qualifying", "sprint": "Sprint", "notYetAvailable": "Results not yet available for this round." },
  "news": { "loadMore": "Load More", "..." : "..." },
  "anthology": { "longRead": "Long Read", "openArchive": "Open the archive", "..." : "..." },
  "glossary": { "searchPlaceholder": "Search terms…", "allCount": "All ({count})", "..." : "..." },
  "footer": { "..." : "..." },
  "common": { "loading": "Loading…", "error": "Something went wrong" }
}
```

- **`anthology` namespace'i yalnızca kabuk metinleri içindir** (buton, rozet, "Long Read", "Open the archive").
  Hikayenin başlığı/gövdesi/altyazısı **buraya asla girmez** — bkz. §8.
- Server Component'lerde `getTranslations({ locale, namespace })`, Client Component'lerde `useTranslations(namespace)`.
- `en.json` ↔ `tr.json` anahtar bütünlüğü için `tests/i18n-messages.test.ts` — iki dosyanın key set'i birebir
  aynı olmalı (eksik çeviri sessizce default locale'e düşmesin, CI'da yakalansın).

---

## 6. SEO Etkisi (mevcut işle entegrasyon)

Yeni biten SEO çalışması (dynamic metadata, sitemap, robots, JSON-LD) locale-aware hale gelmeli:

| Dosya | Değişiklik |
|---|---|
| `app/sitemap.ts` | Her URL girdisine `alternates.languages: { en: <url>, tr: <url-with-/tr>, 'x-default': <en-url> }` eklenir (Next.js sitemap API bunu native destekliyor) |
| Her `generateMetadata` | `alternates.canonical` locale'e göre hesaplanır + `alternates.languages` (hreflang) eklenir — merkezi bir `lib/seo.ts` yardımcı fonksiyonu (`localizedAlternates(path, locale)`) önerilir, her sayfada tekrar yazılmasın |
| `app/robots.ts` | Değişmez — sitemap URL'i tek, içeriği locale-aware |
| `components/seo/JsonLd.tsx` kullanan sayfalar | `inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US'` alanı eklenir |
| `app/opengraph-image.tsx` | Opsiyonel: locale param'ı alıp başlığı yerelleştirebilir (düşük öncelik) |
| `app/[locale]/layout.tsx` | `<html lang={locale}>` — `generateStaticParams` ile `en`/`tr` build-time üretilir |

---

## 7. Kapsam Dışı Bırakılanlar (bilinçli karar, gizli boşluk değil)

| Alan | Karar | Gerekçe |
|---|---|---|
| **Haberler (`/news`, home Wire)** | Her iki locale'de de İngilizce kalır | Canlı RSS; gerçek zamanlı makine çevirisi telif/doğruluk riski taşır. İleride `GEMINI_API_KEY` ile başlık çevirisi değerlendirilebilir — ayrı görev. |
| **Glossary terim içeriği** | Bu planın kapsamında değil | Statik ama uzun editöryel içerik (`data/glossary/`) — stories ile aynı mantıkla ayrı ele alınmalı, antigravity/editöryel karar. |
| **Anthology hikaye metni** | Bu planın kapsamında değil | §8'deki şema önerisi yalnızca *saklama* biçimi hakkında; metnin kendisi antigravity'nin editöryel işi. |

---

## 8. Anthology İçerik Şeması — Öneri (uygulama antigravity'nin takdirinde)

Mevcut `stories` tablosu tek dilli (`slug` unique, `content jsonb` tek sütun). Çoklu dil için şema önerisi:

**Seçenek A (önerilen) — `locale` sütunu + composite unique:**
```sql
alter table public.stories add column locale text not null default 'en';
alter table public.stories drop constraint stories_slug_key;
alter table public.stories add constraint stories_slug_locale_key unique (slug, locale);
```
Aynı `slug` altında `locale='en'` ve `locale='tr'` satırları bağımsız içerik taşır (biri olmadan diğeri
yayınlanabilir — kademeli çeviriye izin verir). `getStoryBySlug(slug, locale)` imzası güncellenir, TR
satırı yoksa EN'e fallback (sessiz 404 yerine).

**Seçenek B — ayrı `stories_i18n` tablosu:** `story_id` FK ile `stories`'e bağlı, `locale`+`content jsonb`.
Daha normalize ama mevcut basit şemaya göre gereksiz karmaşıklık; **A önerilir**.

Bu migration antigravity içerik üretimine başlamadan **önce** Claude (backend agent) tarafından
`supabase/migrations/` altında uygulanabilir — talep geldiğinde ayrı bir iş olarak ele alınacak, bu plana
dahil değil.

---

## 9. Dil Değiştirici — Arayüz Gereksinimi (görsel tasarım antigravity'de)

**Bileşen:** `components/layout/LocaleSwitcher.tsx`

**Davranış gereksinimleri:**
- Mevcut path + query string korunarak yalnızca locale segmenti değişir (`next-intl/navigation`'ın
  `usePathname`/`useRouter` sarmalayıcıları bunu otomatik yönetir — elle string manipülasyonu yapılmaz).
  Örn. `/tr/season/2026/round/15` ⇄ `/season/2026/round/15`.
- Yalnızca 2 dil olduğu için **dropdown değil, ikili toggle/segmented pill** önerilir — projede zaten
  kullanılan iOS segmented control paternine uyar (`GlossaryExplorer` kategori filtresi, 2026-09-21).
- `aria-label="Change language"` + her seçenek için `aria-current` / `aria-pressed`.
- Aktif dil `accent` (#ff1801) rengiyle vurgulanır (mevcut tasarım dili — `docs/design/apex-design-language.md` §1).

**Yerleşim:**
- **Desktop** (Split Cinema, ≥1024px): sticky nav'da, sağ uçta (`NAV_ITEMS`'tan sonra), `label-caps` tipografi.
- **Mobil** (Poster Dense, <768px): 5 sekmelik tab-bar'da yer yok → **"More" sheet/menu** içine eklenir
  (Teams/Circuits/News/Glossary ile birlikte, `apex-design-language.md` §2).

Kesin görsel/etkileşim detayları (ikon mu metin mi "EN·TR", pill vs. switch, animasyon) antigravity'nin
tasarım kararı — burada yalnızca davranışsal/erişilebilirlik sözleşmesi tanımlanıyor.

---

## 10. Uygulama Fazları (antigravity için sıralı checklist)

- [ ] **Faz 0 — İskelet:** `next-intl` kur, `next.config.ts` plugin sarmalayıcısı, `middleware.ts`,
      boş `messages/en.json` + `messages/tr.json` (`{}`), `app/[locale]/layout.tsx` (eski root layout
      taşınır). Build/lint/test yeşil, görsel fark yok (tek dil EN, prefix yok) doğrulanır.
- [ ] **Faz 1 — Route taşıma:** Tüm sayfa rotaları `app/[locale]/` altına taşınır; iç `Link`/`redirect`
      import'ları `next-intl/navigation` sarmalayıcılarına geçirilir; `generateStaticParams` locale
      eklenir. API/sitemap/robots/manifest **taşınmaz**.
- [ ] **Faz 2 — Metin çıkarımı:** Sayfa/bileşen bazında hardcode İngilizce string'ler `messages/en.json`'a
      taşınır, component'ler `useTranslations`/`getTranslations`'a geçirilir. (Haberler, glossary terim
      içeriği, hikaye metni **hariç** — §7.)
- [ ] **Faz 3 — TR çeviri:** `messages/tr.json` doldurulur (UI chrome metinleri, ~50-100 anahtar tahmini).
- [ ] **Faz 4 — Dil değiştirici:** `LocaleSwitcher` bileşeni, desktop nav + mobil More sheet entegrasyonu (§9).
- [ ] **Faz 5 — SEO wiring:** `sitemap.ts` hreflang, `lib/seo.ts` `localizedAlternates()` helper, her
      sayfanın `generateMetadata`'sı güncellenir, `JsonLd` `inLanguage` (§6).
- [ ] **Faz 6 — QA:** `npm run test` (mesaj key bütünlüğü testi dahil), `npm run lint`, `npm run build`,
      manuel EN/TR gezinme, Lighthouse a11y tekrar ölçümü, mevcut indekslenmiş EN URL'lerin **hiç
      değişmediği** doğrulanır (canonical/redirect kontrolü).

---

## 11. Referans

| Konu | Kaynak |
|---|---|
| next-intl App Router entegrasyonu | https://next-intl.dev/docs/getting-started/app-router |
| Next.js sitemap hreflang API | `next/dist/docs` (App Router `sitemap.ts` `alternates.languages`) |
| Mevcut tasarım dili | `docs/design/apex-design-language.md` |
| Mevcut SEO altyapısı | `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `components/seo/JsonLd.tsx` |
| Stories şeması | `supabase/migrations/20260603000001_initial_schema.sql`, `lib/data/stories.ts`, `data/stories/types.ts` |
