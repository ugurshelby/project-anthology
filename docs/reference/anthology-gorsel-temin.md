# Anthology Görsel Temin Rehberi

> Efendim, anthology (hikaye) görsellerini temin ederken bu dosyayı kullanın.
> Tek eksik acil iş **imola-1994** için yeni bir fotoğraf. Gerisi referans.

---

## 1. Görsel boyut standartları

Hikaye görselleri üç `layout` tipinde tutulur. Her tip ayrı bir alt klasöre girer:

| Kullanım | Oran | Minimum boyut | Klasör |
|---|---|---|---|
| Hub kart kapağı (`heroImage`) | 16:9 | **1200×675 px** | `landscape/` |
| Hikaye detay hero | 16:9 | **1600×900 px** | `landscape/` |
| İçerik görseli — full / landscape | 16:9 | **1600×900 px** | `full/` veya `landscape/` |
| İçerik görseli — portrait | 3:4 | **1200×1600 px** | `portrait/` |

- Format: **PNG**.
- Dosya adları sıralı: `01.png`, `02.png`, `03.png` …
- Yol şeması: `public/stories/<hikaye-slug>/<layout>/<NN>.png`
  (örnek: `public/stories/hunt-lauda/landscape/02.png`).

---

## 2. ACİL — imola-1994 için gereken yeni fotoğraf

**Sorun:** "The Black Weekend" (imola-1994) hikayesinde, "Tamburello" bölümündeki
landscape görsel bloğu, hikayenin hero görseliyle **aynı dosyayı** tekrar
kullanıyor (`landscape/01.png`). Diğer 16 hikayede bu tekrar düzeltildi ama
imola-1994'te değiştirilecek yedek dosya yok (`full/01.png` hero ile birebir
aynı; `portrait/01.png` zaten başka blokta kullanılıyor).

**İhtiyaç:** imola-1994 için **yeni, farklı bir landscape (16:9) fotoğraf**.
- Konu önerisi: Imola pisti / Tamburello virajı / 1994 atmosferi (hero'daki
  kareden farklı bir açı/an).
- Boyut: 16:9, min **1600×900 px**, PNG.
- Nereye: `public/stories/imola-1994/landscape/02.png` olarak kaydedin.

**Fotoğraf hazır olunca bana söyleyin** — `data/stories/content.ts`'teki
imola-1994 "Tamburello" bloğunun `src`'sini `landscape/01.png` → `landscape/02.png`
yapıp, canlı Supabase `stories` tablosunu yeniden seed ederim (`scripts/seed-stories.ts`).
content.ts:420-425'teki istisna yorumunu da kaldırırım.

---

## 3. Mevcut durum — hangi hikayede kaç görsel var

17 hikaye. imola-1994 hariç hepsi tam (her `layout` klasöründe eşit sayıda
dosya). Sayılar = her hikayenin `landscape/`=`full/`=`portrait/` dosya adedi:

| Hikaye (slug) | Görsel adedi | Durum |
|---|---|---|
| imola-1994 | 1 | ⚠️ **02.png gerekiyor** (bkz. Bölüm 2) |
| hamilton-silverstone | 1 | Tam (tek görselli hikaye) |
| brawn-2009, button-canada, dijon-1979, fangio-nurburgring, hakkinen-schumacher, hunt-lauda, senna-monaco | 2 | Tam |
| collins-fangio-1956, jaguar-monaco-diamond, jerez-1997, massa-2008, monaco-1982, schumacher-1994-spain, schumacher-ferrari, senna-donington-1993 | 3 | Tam |

---

## 4. Yeni görsel eklerken (genel akış)

Bir hikayeye görsel eklemek/değiştirmek isterseniz:
1. Dosyayı doğru klasöre koyun (`public/stories/<slug>/<layout>/NN.png`).
2. Bana söyleyin; `data/stories/content.ts`'te ilgili hikayenin blok `src`'sini
   güncellerim.
3. content.ts tek başına yeterli değil — canlıda görünmesi için
   `npx tsx scripts/seed-stories.ts` ile Supabase `stories` tablosu yeniden
   seed edilmeli (idempotent, slug bazlı upsert). Bunu ben çalıştırırım.
