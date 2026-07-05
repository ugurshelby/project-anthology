# Design: BoxBox-İlhamlı İyileştirmeler — Standings Lider, Haber Detay, Circuit

> Kaynak: `design/boxbox-mobile/screens-spec.md` (Gemini analizi) + Efendim'in yönlendirmesi. Referans **katı şablon değil, ilham** — Apex sinematik kimliği (`docs/design/apex-design-language.md`, Barlow Condensed + JetBrains Mono + Apex Red) korunur, BoxBox'ın renk canlılığı/premium-satış öğeleri alınmaz.
> Kapsam: **web'in mobil responsive tarafı önce**, `mobile/` (Expo) app'e şimdilik dokunulmuyor (ayrıca ele alınacak, bkz. memory `anthology-boxbox-mobile-reference`).

---

## 1. Standings — Lider Hero

**Mevcut durum:** `components/home/FlatStandingsList.tsx` tüm satırları (P1 dahil) aynı düz hairline-row stilinde gösteriyor — 32px avatar, tek satır.

**Değişiklik:** P1 satırı listeden ayrılıp üstte, `ProfileHero`'nun küçük/kompakt bir varyantı gibi öne çıkarılıyor:
- Takım rengine göre `radial-gradient` glow arka plan (`--team-secondary` üzerinden, `color-mix` ile — mevcut `ProfileHero`'daki teknikle tutarlı).
- Sürücü portresi (varsa `driverIconSrc`) sağda/arkada, yoksa sadece glow + büyük tipografi.
- Puan (`row.points`) büyük `hero-number` tarzı rakam.
- Diğer satırlar (P2+) mevcut `FlatStandingsList` stilinde, hiçbir değişiklik yok.

**Uygulama:** Hem `HomeDataColumn`/`FlatStandingsList` (home sayfası) hem `/season` standings tablosunda aynı bileşen kullanılacak — tek bir `StandingsLeaderCard` component'i yazılıp her iki yerde import edilecek (kod tekrarını önlemek için).

**Responsive:** Mobilde tam genişlik kompakt kart (~120px yükseklik); desktop'ta biraz daha büyük, `ProfileHero`'nun ölçeğine yaklaşan bir varyant.

---

## 2. Haber — Kendi Detay Sayfamız + Kapak Görseli Zorunlu

**Mevcut durum:** `/news` tüm kartları dış linke (`target="_blank"`) yönlendiriyor; `WireItem` (liste elemanları) hiç görsel göstermiyor, sadece metin. Kendi detay route'umuz yok.

**Karar (Efendim onayı):** Kapak görseli olmayan haberler **listeden tamamen gizlenir** — `hasRealImage()` filtresi `getLatestNews()` sonrası uygulanır, `/news` ve homepage'deki haber listeleri yalnızca gerçek görselli item'ları gösterir.

**Yeni route: `/news/[id]`**
- Üstte kapak görseli (BoxBox'taki gibi ekranın ~%40'ı, altta gradient-to-bg mask — mevcut `NewsHero`'daki `bg-gradient-to-t from-bg via-bg/60` tekniği zaten var, aynısı kullanılacak).
- Kaynak adı + tarih (`label-caps`), başlık (`headline-lg`), `summary` (RSS'ten gelen özet metni — mevcut veri modelinde zaten var, `NewsItem.summary`).
- Alt kısımda "Read More" butonu → orijinal kaynağa (`item.url`) `target="_blank"` ile gider (içerik bizim değil, aggregation; tam metni RSS'te yok).
- `id` route param'ı `NewsItem.id`'yi kullanır. **Not:** `getLatestNews()` DB/API/static fallback zincirinden geliyor, kalıcı bir "slug" değil — detay sayfası `getLatestNews(60)` çekip `id` ile filtreleyerek bulacak (mevcut `getNewsForEntity` ile aynı desen).

**`/news` liste sayfası — responsive relayout:**
- **Mobil (`< md`):** Tek sütun, her kart **tam genişlik + zorunlu kapak görseli**, BoxBox'taki gibi "büyük kart" hissi (mevcut `NewsHero` boyutuna yakın, ama liste elemanı olarak tekrarlanan). Text-only `WireItem` mobilde artık kullanılmıyor.
- **Desktop (`≥ lg`):** 3 sütunlu grid (`grid-cols-3`), her kart görselli, `WireItem`'ın yerini görsel içeren bir `NewsCard` alıyor.
- Homepage'deki `HomeDataColumn` içindeki haber özeti de aynı görselli-kart mantığına geçer (şu an muhtemelen `WireItem` kullanıyor — kontrol edilip güncellenecek).

**Değişecek/yeni dosyalar:**
| Dosya | Değişiklik |
|---|---|
| `app/news/[id]/page.tsx` | Yeni — haber detay sayfası |
| `app/news/page.tsx` | Liste query'sinde `hasRealImage` filtresi + yeni grid layout |
| `components/news/NewsList.tsx` | `WireItem` yerine görselli `NewsCard` (mobil tam genişlik / desktop grid item), `NewsHero` korunur (öne çıkan haber için) |
| `lib/data/news.ts` | Yeni bir `getNewsById(id)` yardımcı fonksiyonu (mevcut `getLatestNews` + filtre) |

---

## 3. Circuit Sayfası — İyileştirme (Yeniden Yazım Değil)

**Mevcut durum zaten iyi** (Efendim: "fena değil") — `BentoGrid` + track map + teknik dossier + kazananlar listesi çalışıyor.

**BoxBox'tan alınacak, kimliğe uyarlanmış iyileştirmeler:**
- Pist haritasının (`circuit.svgSrc`) arkasına hafif bir ışık/derinlik katmanı — BoxBox'taki sıcak sarı-mavi glow yerine **takım rengi değil, nötr Apex Red'in çok düşük opaklıklı bir radial glow'u** (`ProfileHero`'daki wash tekniğiyle tutarlı), tamamen düz `BentoCard` zemininden ayrışsın.
- Mobilde dossier (Circuit Data) ile track map sırası gözden geçirilecek — BoxBox'ta önce büyük sayı verileri (Top Speed, Laps) sonra harita geliyor; bizim `TechnicalDossier` zaten buna yakın ama `span={8}`/`span={4}` sırası mobilde tek kolona düşünce hangisinin önce geleceğini kontrol edip mobil önceliğini (harita mı veri mi önce) netleştireceğiz.
- **Alınmayacak:** BoxBox'ın canlı sarı/yeşil/mavi/turuncu ikon blokları — Apex'in "tek accent (Apex Red)" kuralına ters, atlanıyor.

Bu madde küçük, düşük riskli bir polish — büyük bir refactor gerektirmiyor.

---

## Uygulama Sırası

1. `StandingsLeaderCard` — hem home hem `/season`'a uygulanır (en izole, en düşük risk).
2. Haber: `getNewsById` + `/news/[id]` + liste relayout (en büyük iş, veri katmanı + 2 sayfa + component değişikliği).
3. Circuit polish (küçük, son).

## Test / Doğrulama
- `tsc --noEmit`, mevcut Vitest suite.
- Görsel doğrulama: bu ortamda tarayıcı erişimi yok (önceki oturumda da bu kısıt vardı) — Efendim `npm run dev` ile kontrol edebilir, ya da commit sonrası Vercel preview/production'da bakılır.
- `hasRealImage` filtresinin haber listesini boşaltmadığından emin olunur (ya da çok azaltmadığından) — RSS kaynaklarının gerçek görsel oranı `lib/news/aggregate.ts`'de kontrol edilecek.
