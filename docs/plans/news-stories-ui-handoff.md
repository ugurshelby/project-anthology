# Haber Hikâyeleri — Arka Plan Özeti ve Arayüz Devir Planı

> **Kime:** antigravity (arayüz / editoryal) · **Kimden:** Claude (arka plan) · **Tarih:** 2026-09-29
> **Amaç:** Arka planda ne kurulduğunu, verinin şeklini ve mantığını anlatmak; arayüzün bunu kullanıcı
> deneyimi, kullanım kolaylığı ve proje tasarım diliyle uyumlu biçimde göstermesini kalite kapılarına bağlamak.
> **Sınır:** `lib/news/*`, `app/api/cron/*`, `supabase/migrations/*`, `lib/data/news.ts` Claude'un alanı.
> Arayüz bunlara dokunmadan `NewsItem` üzerinden çalışır. Ton/ses ayarı (`lib/news/voice.ts`) editoryal olduğu için antigravity'nindir.

---

## 1. Arka planda ne yapıldı (sade anlatım)

Eskiden her haber kaynağının (The Race, Autosport, Motorsport.com, BBC, RaceFans) aynı olayı yazan makalesi
sitede ayrı ayrı görünüyordu. Örnek: Alonso'nun sözleşmesi bir haftada 4-5 kez çıkıyordu.

Şimdi arka planda (siteyi gezen kimse beklemeden) şu zincir çalışıyor:

```
RSS (5 kaynak) → aynı olayı yazanları grupla → TEK "hikâye" → yapay zekâ özgün EN+TR özet yazar
              → en iyi görseli seç → news_stories tablosuna yaz → 7 günden eskiyi sil
```

Sayfalar yalnızca `news_stories` tablosunu okur. Hiçbir ziyaretçi dış servis çağrısı tetiklemez.

**Ölçüm (canlı veri, 7 gün):** 189 makale → 96 hikâye; 26 hikâye birden çok kaynağın birleşimi (58 makale).

## 2. Veri yapısı

Tablo: `news_stories` (bir satır = gerçek dünyada bir olay). Arayüz ham satırı değil, `getLatestNews()` /
`getNewsById()` ile gelen **`NewsItem`** nesnesini kullanır:

| Alan | Anlamı | Arayüz için not |
|---|---|---|
| `id` | Hikâyenin kalıcı kimliği | `/news/[id]` rotası bunu kullanır. **Eski URL-hash id'leri artık geçerli değil** (eski bağlantılar 404 olabilir; kabul edildi) |
| `title`, `summary` | Özgün İngilizce başlık / özet | Yapay zekâ yazamadıysa en iyi kaynağın kendi metni (bkz. §3) |
| `titleTr`, `summaryTr` | Türkçe başlık / özet | `null` olabilir → mevcut `localizedNews*` yardımcıları İngilizceye düşer. `summaryTr` yalnızca yapay zekâ yazdıysa dolu |
| `image` | Kapak görseli URL'i | **Boş string olabilir.** Placeholder ASLA yazılmaz. Kaynaklar arasından ulaşılabilir en büyük görsel seçilir |
| `sourceLinks` | `[{name, url, title}]` — hikâyeyi yazan her kaynak | Detay sayfasında atıf + yönlendirme için. 1-5 eleman |
| `sources` | Yalnızca kaynak adları | Liste rozetleri için |
| `sourceName`, `url` | İlk kaynak | Geriye dönük uyum; yeni arayüz `sourceLinks` kullanmalı |
| `publishedAt`, `publishedTs`, `dateLabel` | En yeni üye makalenin zamanı | Hikâye yeni kaynak kazanırsa zamanı güncellenir |

**Saklama:** yalnızca son 7 gün. Daha eski hikâye silinir; arayüz "arşiv" vaadinde bulunmamalı.

## 3. Mantık — arayüzün bilmesi gereken davranışlar

1. **Görsel kuralı.** Liste/manşet (`getLatestNews`) yalnızca kapağı olan hikâyeleri döndürür.
   `/news` sayfası `includeImageless` ile görselsizleri de alır (wire akışı için). Detay sayfası (`getNewsById`)
   görselsiz hikâyeyi de açar → **kapak alanı hiç render edilmemeli** (boş kutu, gri blok, favicon yok).
2. **Yazım durumu.** Hikâye önce kaynağın kendi başlığı/özetiyle görünür, yapay zekâ sırası gelince özgün metinle
   değişir (cron 30 dk'da bir). Arayüz iki durumu da sorunsuz göstermeli; "çevriliyor/yazılıyor" gibi durum metni gösterme.
3. **Yeniden yazım yalnızca yeni/değişen hikâyede.** Hikâyeye yeni kaynak eklenirse metin bir kez yenilenir;
   kullanıcı aynı `id` altında güncellenmiş metni görür.
4. **Telif güvenliği arka planda.** Kaynak cümleleriyle 5+ ardışık kelime örtüşen çıktı reddedilir.
   Arayüz kaynak metnini asla kendisi eklememeli; yalnızca `title/summary` ve `sourceLinks` gösterilir.
5. **Atıf zorunlu.** Detay sayfasında hangi kaynaklardan derlendiği ve her birine giden link görünür olmalı.

## 4. Arayüz görevleri (antigravity)

- [ ] **Haber detay** (`app/[locale]/news/[id]/page.tsx`): "Kaynaklar / Sources" bloğu — `sourceLinks` listesi,
      her satır kaynak adı + makale başlığı + dışarı yönlendirme (`target="_blank" rel="noopener noreferrer"`,
      ikonla dış link olduğu belli). Tek kaynaklı hikâyede de aynı blok.
- [ ] **Görselsiz detay**: kapak alanı yok, başlık bloğu yukarı akar; düzen kaymamalı (CLS < 0.1).
- [ ] **Liste kartları / manşet**: birden çok kaynak varsa küçük "N kaynak" işareti (isteğe bağlı, sade).
- [ ] **Wire akışı** (görselsizler): mevcut davranış korunur, yeni veri şekliyle doğrulanır.
- [ ] `lib/news/voice.ts` tonunu ev sesine göre ince ayar (bkz. `docs/F1_Anlati_Stil_Kilavuzu.md`): haber kısa,
      somut, sakin; anthology hikâyesi değil. Değişiklikten sonra cron'un ürettiği 5 örnek metni gözden geçir.
- [ ] **Saat ve konum** (önceki iş): `circuits.data.location.timeZone` artık DB'de; `LocalTime` bileşeni diğer
      saat gösterimlerine (round detay vb.) uygulanacak.

## 5. Kalite kapıları (bitti sayılması için hepsi geçmeli)

**Tasarım dili**
- [ ] `docs/design/` ilgili dosyalar okunmuş; mevcut bileşen dili (kart, etiket, boşluk, tipografi ölçeği) korunmuş.
- [ ] AI-slop yok (saf siyah, neon, generic şablon). Yeni bileşen `high-end-visual-design`, denetim `ui-ux-pro-max` ile.
- [ ] Yeni ikon/renk yalnızca mevcut token'lardan.

**Kullanıcı deneyimi / kullanım kolaylığı**
- [ ] Kaynak linkleri tek dokunuşla bulunur; dokunma hedefi ≥ 44×44 px (mobil).
- [ ] Türkçe ve İngilizce ziyaretçi için doğru dilde başlık/özet; TR yoksa sessizce EN'e düşer, arayüz kırılmaz.
- [ ] Boş durum: hiç haber yoksa anlamlı, sade mesaj (mevcut `news.length === 0` dalı korunur).
- [ ] Uzun başlık/özet taşmaz (satır kısaltma), tek kaynaklı ve 5 kaynaklı hikâye iki uçta da düzgün.
- [ ] Dışarı gidilen linkte kullanıcı yönlendirileceğini önceden anlar (ikon + `aria-label`).

**Erişilebilirlik / performans**
- [ ] `accesslint-audit` sıfır kritik ihlal; WCAG AA kontrast; klavye ile tüm linklere ulaşılır, odak görünür.
- [ ] `prefers-reduced-motion` saygı görür.
- [ ] Görseller `next/image` (boyut belirli), görselsizde ayrılmış boş alan yok; Lighthouse a11y ≥ 95, LCP ≤ 2.5 sn, CLS < 0.1.

**Doğrulama adımları (kanıt istenir)**
1. `npm run lint` (0 hata) · `npm test` (hepsi yeşil) · `npm run build` (0 hata).
2. Yerel sunucuda ekran görüntüsü: **375 / 768 / 1280 px** — `/news`, görselli detay, görselsiz detay, çok kaynaklı detay.
3. TR (`/tr/news/...`) ve EN (`/news/...`) yan yana kontrol.
4. Sonuç `logs/YYYY-AA-GG.md`'ye, bu planın maddeleri `[x]` olarak işlenir.

## 6. Bağımlılıklar ve durum (Claude tarafı)

- [x] Kümeleme, yeniden yazım, pipeline, okuma katmanı, testler (177/177), `/news` sayfası DB'den okuyor
- [ ] **Efendim:** `20260929000004_news_stories.sql` Supabase'te çalıştırılacak
- [ ] **Efendim:** ücretsiz `GEMINI_API_KEY` (opsiyonel yedek `GROQ_API_KEY`) eklenecek
- [ ] Cron'un gerçek çıktısı doğrulanınca antigravity'ye örnek hikâye listesi verilecek
- [ ] Vercel deploy sonrası sync-news 30 dk'da bir çalışacak (GitHub Actions)

Arayüz çalışması, tablo dolmadan da başlayabilir: veri yokken sistem eski `news_cache`'e düşer ve
sayfalar kırılmaz; yeni alanlar (`sourceLinks`) yalnızca hikâye satırlarında dolu gelir.
