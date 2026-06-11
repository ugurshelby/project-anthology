# Bölüm 2 — Performans Değerlendirmesi

## Özet

Apex'in mevcut performans mimarisi genel olarak doğru yönde: `/` ve `/season` canlı veri odaklı, `/circuits` ise ISR ile dengeli. En kritik riskler, ana sayfa ve sezon verisinde tekrar eden sorgu/fallback zincirleri ve istemci bundle'ını büyüten geniş client-component yüzeyi. Özellikle `SafeImage` (`components/ui/SafeImage.tsx`) ve büyük `SeasonExplorer` (`components/season/SeasonExplorer.tsx`) kombinasyonu, TTI/hydration maliyetini artırma potansiyeline sahip.

## Metrik Tahminleri / Riskler

- **LCP riski (orta-yüksek, ana sayfa):** Hero'da görsel tabanlı lider kartı (`components/home/BentoLeaderTile.tsx`) ilk viewport'ta ve `priority` yok; gerçek kullanıcıda 2.5s+ LCP olasılığı artar.
- **TTFB riski (orta, `/` ve `/season`):** `revalidate=0` + çoklu Supabase/fallback okuması (`app/page.tsx`, `lib/data/f1.ts`) dinamik yanıt süresini yükseltebilir.
- **Hydration/JS riski (orta-yüksek, `/season`):** `SeasonExplorer` tamamen client (`'use client'`) ve geniş etkileşim/markup taşıyor.
- **CPU riski (orta, server):** Haber tarafında `jsdom` kullanımı (`lib/news/aggregate.ts`) cold-start ve işlem süresini artırabilir.
- **DB okuma hacmi riski (orta-yüksek):** `getSeasonData` içinde round bazlı paralel sonuç çekimi (`lib/data/f1.ts`) sezon ilerledikçe lineer büyür.

## Sayfa Bazlı Analiz (/, /season, /circuits)

- **`/` (`app/page.tsx`)**
  - `revalidate = 0` doğru; canlı F1 bağlamı için uygun.
  - Aynı request içinde `fetchSeasonSnapshotTyped` üç kez + `fetchRoundSnapshot` + `getOnThisDay` çalışıyor; veri tazelik kontrolünde tekrar okuma maliyeti var (`lib/data/f1.ts`).
  - `aggregate({ maxItems: 6 })` server-side çalışıyor; cache var ama instance-local (`lib/news/aggregate.ts`), çoklu cold instance'ta tekrar maliyet oluşabilir.

- **`/season` (`app/season/page.tsx`)**
  - `revalidate = 0` + `dynamic = 'force-dynamic'` canlı sezon için tutarlı; ancak iki ayar birlikte kısmen tekrar (explicitlik dışında ek fayda sınırlı).
  - `getSeasonData` veri seti kapsamlı ve pahalı: son yarış sonuç/sıralama + tüm biten turların sonuçları (`lib/data/f1.ts`).
  - UI tarafında `SeasonExplorer` client olduğu için payload/hydration maliyeti yüksek (`components/season/SeasonExplorer.tsx`).

- **`/circuits` (`app/circuits/page.tsx`)**
  - `revalidate = 900` karar olarak doğru: günlük sync edilen kaynak için 15dk ISR yeterli denge.
  - Sayfa sorgusu hafif (`getCurrentSeasonCircuitCards`), N+1 görünmüyor (`lib/data/circuits.ts`).
  - Bu route performans açısından en stabil görünen bölüm.

## Image & LCP

- Projede `next/image` kullanımı `SafeImage` üzerinden konsolide (`components/ui/SafeImage.tsx`), bu iyi.
- **Eksik `priority`:**
  - Ana LCP adayı olan lider görseli (`components/home/BentoLeaderTile.tsx`) `fill` kullanıyor ama `priority` yok.
  - Haber kartları (`components/home/BentoNewsTile.tsx`) fold altında kalabildiği için `priority` gerekmiyor.
  - `/season` ve `/circuits` hero'larda LCP çoğunlukla metin; ikon görseller için `priority` zorunlu değil.
- `sizes` sadece bazı alanlarda tanımlı (`BentoLeaderTile`, `BentoNewsTile`); diğer fill/responsive kritik görsellerde tutarlılaştırmak transfer optimizasyonu sağlar.

## Veri Katmanı (Supabase/API)

- **Tekrarlı staleness sorguları:** `fetchSeasonSnapshotTyped` ve `fetchRoundSnapshot`, güncel sezon için ek olarak `getRacesForStaleness` çağırıyor (`lib/data/f1.ts`). Aynı request'te birden fazla kez tetiklenebiliyor.
- **`getOnThisDay` geniş tarama yapıyor:** `f1_snapshots` içinde `type='results'` tüm satırlar çekilip uygulama tarafında filtreleniyor (`lib/data/f1.ts`). Veri büyüdükçe maliyet artar.
- **`getSeasonData` fan-out riski:** `fetchAllRoundResults` ile tamamlanmış her tur için snapshot çekiliyor (`lib/data/f1.ts`); sezon sonuna doğru pahalı hale gelir.
- **API cache iyi:** `/api/season/[year]` route'unda yıl bazlı `Cache-Control` var (`app/api/season/[year]/route.ts`), özellikle historical sezonlar için doğru.
- **Fetch cache belirsizliği:** `fetchSiteJson` içinde açık `next.revalidate`/`cache` belirtilmemiş (`lib/data/siteUrl.ts`); dinamik route'larda no-store davranışı baskın olsa da explicit strateji daha güvenli olur.

## Animasyon & GPU

- Pozitif: `will-change` kalıcı değil; transition başlangıcında set edilip bitince temizleniyor (`components/ui/AnimatedBar.tsx`, `components/ui/FlipDigit.tsx`). Bu disiplin doğru.
- Pozitif: `prefers-reduced-motion` fallback'leri var (`app/globals.css`, ilgili client bileşenler).
- Risk: Ana sayfada birden fazla sürekli animasyon katmanı var (neon divider, pulse, hero streak vb. `app/globals.css`); düşük cihazlarda kompozit/render maliyeti artabilir.
- Risk seviyesi şu an **orta**; kritik bir anti-pattern (global sürekli `will-change`) görünmüyor.

## Vercel Hobby Limitleri

- Mevcut yapı genel olarak Hobby'de çalışır; fakat headroom sınırlı.
- **Fonksiyon süresi riski:** RSS toplama + `jsdom` (`lib/news/aggregate.ts`) ve sezon fan-out sorguları (`lib/data/f1.ts`) peak anlarda süre limitine yaklaşabilir.
- **Bant genişliği riski:** Hero/news görselleri yoğun kullanımda bandwidth tüketimini artırır; optimize edilmiş `sizes`/priority stratejisi önemli.
- **Cron yeterliliği:** Mevcut yaklaşım cron-destekli mimariye uygun; ancak cron sıklığı arttıkça Hobby kotası dikkat gerektirir.

## Öncelikli İyileştirmeler (Etki/Efor: S/M/L)

- **`BentoLeaderTile` LCP görseline `priority` ekle** (`components/home/BentoLeaderTile.tsx`) — **Etki: Yüksek / Efor: S**
- **`getRacesForStaleness` sonucunu request-scope memoize et** (`lib/data/f1.ts`) — **Etki: Yüksek / Efor: M**
- **`getOnThisDay` için DB tarafında tarih filtresi/limit stratejisi uygula** (`lib/data/f1.ts`) — **Etki: Orta-Yüksek / Efor: M**
- **`getSeasonData` içinde round fan-out için üst sınır veya incremental cache katmanı ekle** (`lib/data/f1.ts`) — **Etki: Yüksek / Efor: L**
- **`SafeImage` client yüzeyini daralt (kritik olmayan yerlerde server-side `Image`)** (`components/ui/SafeImage.tsx`, kullanım noktaları) — **Etki: Orta / Efor: L**
- **`fetchSiteJson` için explicit cache politikası tanımla** (`lib/data/siteUrl.ts`) — **Etki: Orta / Efor: S**
