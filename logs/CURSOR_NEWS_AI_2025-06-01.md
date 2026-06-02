## Yapilanlar
- `npm install @google/generative-ai` kuruldu.
- `lib/smartImage.ts` eklendi:
  - `getSmartNewsImageUrl(originalUrl, w, h)`
  - `getSmartFeaturedUrl` (1200x630)
  - `getSmartGridUrl` (600x338)
  - `getSmartMobileUrl` (400x225)
- `lib/newsSummary.ts` eklendi:
  - `generateNewsSummary(title, description)`
  - model: `gemini-1.5-flash`
  - generation config: `maxOutputTokens: 150`, `temperature: 0.3`
  - `Promise.race` ile 5s timeout
  - key yoksa/hata varsa `null`
- `app/api/news/summary/route.ts` eklendi:
  - sadece `POST`
  - body: `{ url, title, description }`
  - `news_cache` tablosunda url bazli mevcut `summary` kontrolu
  - cache varsa direkt donus
  - yoksa Gemini cagrisi + `news_cache` upsert
  - IP bazli in-memory rate limit: 10 req/dk
  - hata durumlarinda `200` + `{ summary: null }`
- `app/(site)/_components/news-feed-client.tsx` guncellendi:
  - direkt `image` kullanimlari kaldirildi, smart image helperlarina gecildi
  - featured: `getSmartFeaturedUrl`
  - grid: `getSmartGridUrl`
  - mobile: `getSmartMobileUrl`
  - bos/eksik gorsel fallback: `#141414` panel + merkezde kirmizi racing flag icon
  - kart tiklaninca panel acilmasi:
    - aninda source/date/title
    - panel acilinca `/api/news/summary` POST
    - yukleme aninda 3 satir shimmer
    - summary null/hata ise aciklama fallback
    - altta ghost CTA: `READ FULL STORY ->`
    - kapatma: `x` butonu, dis alana tiklama, `Escape`
- `app/globals.css` guncellendi:
  - yeni fallback/image/panel/shimmer/ghost-link stilleri
- `next.config.ts` image remote domain listesi guncellendi:
  - `res.cloudinary.com`
  - `images.autosport.com`
  - `images.motorsport.com`
  - `cdn.the-race.com`
  - `/api/news` yanitindan kesfedilen ek alanlar:
    - `storage.ghost.io`
    - `cdn-1.motorsport.com` ... `cdn-9.motorsport.com`

## Dogrulama
- `npm run build` basarili.
- Dev ortaminda `/api/news` ve `/news` endpoint kontrol edildi.
- `/news` HTML iceriginde Cloudinary host dogrulandi (`res.cloudinary.com` mevcut).
- `/api/news/summary` endpointi 200 status donuyor ve hata durumunda `summary: null` davranisini koruyor.

## Hatalar / Riskler
- Gemini cagrisi su anda `gemini-1.5-flash` modeli icin 404 donuyor:
  - `models/gemini-1.5-flash is not found for API version v1beta`
  - Bu nedenle summary uretimi `null` kalabiliyor ve `news_cache.summary` populate olmuyor.

## Sonraki Adim
- ⚠️ MANUEL AKSIYON GEREKLI: Kullanilan Gemini API key/proje icin `gemini-1.5-flash` model erisimi acilmali veya model adi mevcut Google API model listesine gore guncellenmeli. Bu adim tamamlanmadan `news_cache.summary` alaninin dolmasi beklenmez.
