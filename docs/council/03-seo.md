# Bölüm 3 — SEO & Metadata Değerlendirmesi

> **Kapsam:** `lib/seo.ts`, `app/layout.tsx`, tüm `app/**/page.tsx` dosyaları, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/anthology/[slug]/opengraph-image.tsx`
> **Prod URL:** `https://project-anthology-five.vercel.app`

---

## Özet

Apex'in SEO altyapısı sağlam bir temel üzerine kurulmuş: tek kaynaklı URL yönetimi (`lib/seo.ts` + `lib/data/siteUrl.ts`), her rota için `generateMetadata` veya statik `metadata` nesneleri, dinamik OG görselleri, XML sitemap ve robots.txt mevcut. Kritik eksikler şunlardır: anasayfada `generateMetadata` yok, `/season` rotası query param bağımlı ama tek bir canonical URL veriyor, birkaç rotada canonical ya da Twitter kartı tanımsız, `/anthology` ve `/tech-glossary` sayfalarında OG görseli yok, RSS feed hiç yok ve devreye alınmamış `datePublished`/`dateModified`/`author` alanları Article JSON-LD'yi zayıflatıyor.

---

## Mevcut SEO Altyapısı

### Merkezi Kimlik: `lib/seo.ts`

- `SITE_NAME = 'Apex'`, `SITE_TAGLINE` tek noktadan yönetiliyor — tüm sayfalarda tutarlılık sağlıyor.
- `siteUrl()` → `lib/data/siteUrl.ts`'teki `getSiteUrl()` fonksiyonuna delege ediyor.
- URL çözümleme önceliği: `NEXT_PUBLIC_SITE_URL` → hardcoded `PROD_SITE_URL` (`https://project-anthology-five.vercel.app`) → `VERCEL_URL` → `localhost:3000`.
- `absoluteUrl(path)` helper'ı JSON-LD ve diğer bileşenler için tam URL üretimini standartlaştırıyor.
- `websiteJsonLd()` ve `articleJsonLd()` builder fonksiyonları JSON-LD üretimini merkezileştiriyor.

### `metadataBase`: `app/layout.tsx`

```ts
metadataBase: new URL(siteUrl())
```

Bu sayede alt sayfalarda verilen göreli canonical ve OG URL'leri (`'/season'`, `'/circuits/${id}'` vb.) Next.js tarafından otomatik olarak mutlak URL'e dönüştürülüyor. Doğru bir yaklaşım.

---

## JSON-LD & Structured Data

### Root Layout: `WebSite` Şeması (`app/layout.tsx`)

```json
{
  "@type": "WebSite",
  "name": "Apex",
  "url": "https://project-anthology-five.vercel.app",
  "publisher": { "@type": "Organization", ... }
}
```

**Durum:** Yeterli, ancak `SearchAction` (Sitelinks Searchbox) eklenebilir.

**Eksik alanlar:**
- `logo` (Organization içinde)
- `sameAs` (sosyal medya profilleri varsa)
- `SearchAction` (site içi arama varsa)

### Story Detay Sayfası: `Article` Şeması (`app/anthology/[slug]/page.tsx`)

`lib/seo.ts`'deki `articleJsonLd()` ile üretiliyor:

```json
{
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "url": "...",
  "mainEntityOfPage": { "@type": "WebPage" },
  "image": ["..."],
  "articleSection": "...",
  "publisher": { "@type": "Organization" }
}
```

**Eksik/Hatalı alanlar:**
- `datePublished` — **yok.** Story modelinde `year` var ama tam tarih formatında değil (`YYYY`). Google, `datePublished` olmayan makaleleri düşük öncelikli indexliyor.
- `dateModified` — **yok.**
- `author` — **yok.** `{ "@type": "Person" | "Organization" }` belirtilmeli.
- `@type` olarak `Article` yerine `NewsArticle` veya `BlogPosting` daha uygun olabilir (içerik türüne göre).

### Diğer Rotalar: JSON-LD Yok

- `/season`, `/circuits`, `/circuits/[id]`, `/news`, `/anthology`, `/tech-glossary` sayfaları için hiç JSON-LD tanımlı değil.
- `/circuits/[id]` için `SportsEvent` veya `Place` şeması, `/season` için `Dataset` veya `SportsOrganization` eklenebilir.

---

## Metadata & OG

### Rota Bazlı Değerlendirme

| Rota | `title` | `description` | `canonical` | OG `url` | OG `image` | Twitter Card |
|------|---------|---------------|-------------|----------|------------|--------------|
| `/` (homepage) | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Yok | ✅ opengraph-image.tsx | ❌ Yok |
| `/season` | ✅ | ✅ | ✅ `/season` | ✅ | ❌ Yok | ✅ |
| `/news` | ✅ | ✅ | ✅ `/news` | ✅ | ❌ Yok | ✅ |
| `/circuits` | ✅ | ✅ | ✅ `/circuits` | ✅ | ❌ Yok | ✅ |
| `/circuits/[id]` | ✅ dynamic | ✅ dynamic | ✅ `/circuits/${id}` | ✅ | ❌ Yok | ❌ Yok |
| `/anthology` | ✅ | ✅ | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Yok |
| `/anthology/[slug]` | ✅ dynamic | ✅ dynamic | ✅ `/anthology/${slug}` | ✅ | ✅ opengraph-image.tsx | ✅ |
| `/tech-glossary` | ✅ | ✅ | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Yok |

**Kritik Bulgular:**

1. **Anasayfa (`/`) — `metadata` nesnesi tanımsız.** `app/page.tsx`'de hiç `metadata` export yok. Root layout'taki default metadata (`title: 'Apex'`, `description: SITE_TAGLINE`) devreye giriyor, ancak anasayfaya özgü OG URL, canonical ve açıklama eksik.

2. **`/anthology` ve `/tech-glossary` — canonical ve OG URL yok.** Sosyal paylaşımlarda ve arama motorlarında bu sayfalar için göreli canonical çözümlenemiyor.

3. **`/circuits/[id]` — Twitter card yok.** `generateMetadata`'da `twitter` alanı tanımsız.

4. **OG image eksikliği:** `/season`, `/news`, `/circuits`, `/circuits/[id]`, `/anthology`, `/tech-glossary` rotalarında custom OG görseli yok; yalnızca root `opengraph-image.tsx` (genel site kartı) devreye giriyor. Bu rotalar sosyal paylaşımda özgün görsel üretemiyor.

### Güçlü Yanlar

- `app/anthology/[slug]/opengraph-image.tsx` — per-story dinamik OG görseli mükemmel uygulanmış: başlık uzunluğuna göre font boyutu ölçekleniyor, hata durumunda fallback var.
- `app/opengraph-image.tsx` — statik site kartı güvenilir şekilde tanımlı.
- `metadataBase` düzgün ayarlandığı için göreli URL'ler doğru resolve ediliyor.
- `template: '%s — Apex'` title şablonu tüm sayfalarda tutarlı başlık üretiyor.

---

## Sitemap / Robots / RSS

### Sitemap (`app/sitemap.ts`)

**Güçlü yanlar:**
- Supabase'den canlı `slug` ve `circuitId` çekiyor — statik olmayan, dinamik içerik indexleniyor.
- Boş liste toleransı var (Supabase bağlantı hatası → sitemap yine oluşuyor).
- `changeFrequency` ve `priority` değerleri mantıklı atanmış.

**Eksikler:**
- `lastModified: now` her rota için derleme/istek anını kullanıyor. Hikaye sayfaları için gerçek `updatedAt` tarihini kullanmak daha doğru olur — Google bu tarihle içerik tazeliğini değerlendiriyor.
- `alternates` (hreflang) tanımsız — şimdilik tek dil (en) olduğu için kritik değil.
- `/tech-glossary` sitemap'te var (`priority: 0.5`) ama `/` canonical'i doğru.

### Robots (`app/robots.ts`)

```
Allow: /
Disallow: /api/cron/, /api/
Sitemap: https://project-anthology-five.vercel.app/sitemap.xml
```

**Durum:** Yeterli. API yüzeyi crawlerlardan korunmuş.

**Öneri:** Vercel preview deploy'larının (`*.vercel.app` dışındaki) indexlenmemesi için `X-Robots-Tag` header'ı middleware'de eklenebilir (opsiyonel).

### RSS Feed — **Eksik**

Projede `rss.xml` veya `/feed` rotası **tanımlı değil.**

F1 haber platformları için RSS kritik bir dağıtım kanalıdır:
- Aggregatörler (Feedly, Inoreader) F1 içeriklerini RSS üzerinden takip ediyor.
- Google News entegrasyonu RSS/Atom feed talep ediyor.
- `/news` sayfası zaten harici RSS'leri aggregate ediyor; kendi içeriklerimiz (anthology hikayeleri) için bir `/feed.xml` rotası oluşturmak hem faydalı hem de makul efor gerektiriyor.

---

## URL Stratejisi

### `/season?year=YYYY` — Query Param Kullanımı

`/season` sayfası `?year=` parametresiyle yıl seçimi yapıyor. Metadata ise sabit:

```ts
alternates: { canonical: '/season' }
```

**Değerlendirme:**
- Google, `?year=2023` ile `?year=2024` sayfalarını aynı canonical'e (yani `/season`) pointing olarak görüyor.
- Parametre URL'lerini ayrıca indexlemiyor — bu **bilinçli ve doğru bir karar.**
- Ancak `<SeasonExplorer>` client tarafında state değiştirirken URL'yi pushState ile güncelliyor olabilir; bu durumda farklı yıl verisi aynı canonical altında sunuluyor — duplicate content riski düşük ama sıfır değil.
- Alternatif: Yıl rotaları `/season/2024`, `/season/2023` şeklinde ayrı segment'lara taşınırsa her sezon bağımsız indexlenebilir. Ancak mevcut UX ve SSR yaklaşımı bu değişikliği önemli ölçüde gerektirir.

### Diğer URL'ler

- `/circuits/[id]` — slug tabanlı, anlaşılır (ör. `silverstone`, `monza`). SEO dostu.
- `/anthology/[slug]` — human-readable slug, canonical doğru. SEO dostu.
- `/news` — harici linklere çıkan bir agregasyon sayfası; Google bu sayfayı "haber kaynağı" değil "link dizini" olarak değerlendirebilir. Kendi içerik olmaması indexleme değerini düşürüyor.

---

## Bulgular & Öneriler (Öncelik Sırasıyla)

### 🔴 Yüksek Öncelik

**1. Anasayfa `metadata` ekle (`app/page.tsx`)**

```ts
export const metadata: Metadata = {
  title: { absolute: 'Apex — F1 Archive' },
  description: SITE_TAGLINE,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Apex — F1 Archive',
    description: SITE_TAGLINE,
    url: '/',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Apex — F1 Archive', description: SITE_TAGLINE },
};
```

**2. `Article` JSON-LD'ye `datePublished` ve `author` ekle (`lib/seo.ts`)**

`articleJsonLd()` fonksiyonuna `publishedAt?: string` ve `authorName?: string` parametreleri eklenmeli. Story datasında `year` değil tam tarih varsa (veya seed sırasında ekleneceğinde) kullanılacak. Google'ın [Article yapılandırılmış veri rehberi](https://developers.google.com/search/docs/appearance/structured-data/article) bu alanları zorunlu sayıyor.

**3. `/anthology` ve `/tech-glossary` — canonical ve OG URL ekle**

Her iki sayfada `alternates: { canonical: '/anthology' }` ve `openGraph: { url: '/anthology' }` tanımsız. Mevcut root canonical'e (`/`) düşüyor.

### 🟡 Orta Öncelik

**4. RSS Feed oluştur (`app/feed.xml/route.ts`)**

Anthology hikayeleri için minimal bir Atom/RSS feed:

```ts
// app/feed.xml/route.ts
import { getPublishedStories } from '@/lib/data/stories';
import { absoluteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export async function GET() {
  const stories = await getPublishedStories();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${SITE_TAGLINE}</description>
    ${stories.map(s => `
    <item>
      <title>${s.title}</title>
      <link>${absoluteUrl(`/anthology/${s.slug}`)}</link>
      <description>${s.subtitle ?? ''}</description>
    </item>`).join('')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
```

Ardından `app/robots.ts`'de `sitemap` dizisine `/feed.xml` eklenmeli.

**5. `sitemap.ts` — story `lastModified` gerçek tarih kullanmalı**

Supabase'deki `updated_at` veya `created_at` alanı varsa `lastModified` olarak kullanılmalı:

```ts
const storyRoutes = slugs.map((s) => ({
  url: `${base}/anthology/${s.slug}`,
  lastModified: new Date(s.updatedAt ?? s.createdAt ?? now),
  ...
}));
```

Bu, Google'ın crawl bütçesini optimize etmesine yardımcı olur.

**6. `/circuits/[id]` — Twitter card ekle**

`generateMetadata`'ya `twitter: { card: 'summary_large_image', title: ..., description: ... }` eklenmeli.

**7. OG görsel kapsamını genişlet**

`/season`, `/circuits`, `/anthology` için `opengraph-image.tsx` dosyaları oluşturulabilir. Anthology detay sayfasının dinamik OG görseli örnek alınabilir — yalnızca başlık metni değiştirilerek aynı şablon diğer rotalara uygulanabilir.

### 🟢 Düşük Öncelik / İyileştirme

**8. `WebSite` JSON-LD'ye `SearchAction` ekle**

Site içi arama veya filtre özelliği varsa Sitelinks Searchbox için fırsat:

```json
"potentialAction": {
  "@type": "SearchAction",
  "target": "https://project-anthology-five.vercel.app/anthology?q={query}",
  "query-input": "required name=query"
}
```

**9. Vercel Preview Deploy indexlemesini engelle**

`middleware.ts`'de preview ortamında `X-Robots-Tag: noindex` header'ı eklenebilir:

```ts
if (process.env.VERCEL_ENV === 'preview') {
  response.headers.set('X-Robots-Tag', 'noindex');
}
```

**10. `/season` için yıl bazlı canonical stratejisi değerlendirmesi**

Uzun vadede `/season/2024`, `/season/2023` gibi segment bazlı rotalar her sezon için bağımsız indexlenebilir içerik üretir. Mevcut `?year=` yaklaşımı SEO açısından doğru (tek canonical) ancak yıl sayfaları organik aramada görünür olmayacak.

**11. `robots.ts` — `host` alanı**

`host` field'i Yandex tarafından destekleniyor ancak Google ve diğer büyük motorlar tarafından ignore ediliyor. Mevcut değer neutral, ancak gereksiz.

---

*Değerlendirme tarihi: 11 Haziran 2026 — `app/` dizini ve `lib/seo.ts` dosyaları üzerinden yapılan kod incelemesine dayanmaktadır.*
