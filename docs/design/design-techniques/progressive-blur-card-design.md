# Progressive Blur Card — Tasarım Tekniği

> Görsel içeriğin (fotoğraf, hero image) üzerine metin/UI elemanı yerleştirirken kontrastı garanti eden, kademeli (progressive) blur + gradient fill tekniği. Kart, profil, listing, ürün görseli gibi tüm "içerik üstüne metin" senaryolarında kullanılabilir.

---

## Ne İşe Yarar

Bir fotoğrafın üzerine direkt metin koyduğunda okunabilirlik fotoğrafın rengine/parlaklığına göre değişir. Bu teknik, fotoğrafın alt kısmına **kademeli olarak artan bir blur + karartma/aydınlatma gradyanı** uygulayarak metnin her zaman yüksek kontrastla okunmasını sağlar. Sonuç: hem "glassmorphic" hem de editorial/premium bir görünüm.

---

## Adım Adım Uygulama

### 1. Base Frame Oluştur
- Kartın ana gövdesini oluşturan bir frame/container oluştur.
- Köşe yuvarlaklığı (corner radius) ve görsel bu frame'in içine yerleştirilir.
- Görsel, frame'i tamamen dolduracak şekilde (fill/cover) konumlanmalı.

### 2. Blur Background Katmanı Ekle
- Görselin **alt yarısını** kaplayan ayrı bir frame/layer oluştur.
- Bu layer'a **Background Blur** efekti uygula:
  - Mod: **Progressive** (Uniform değil)
  - Start: `0`
  - End: `80` (yoğun blur için üst sınır; 60–100 arası denenebilir)
- Aynı layer'a bir **gradient fill** ekle (linear, yukarıdan aşağıya):
  - Stop 1 (üstte, %0): renk `FFFFFF` (açık tema) / `000000` (koyu tema), opacity `0%`
  - Stop 2 (altta, %70): aynı renk, opacity `100%`
- Blur'un başladığı nokta ile gradient'in şeffaflıktan opak'a geçtiği nokta **hizalı** olmalı — böylece blur arttıkça karartma/aydınlatma da artar, sert bir geçiş çizgisi oluşmaz.

### 3. İçeriği Yerleştir
- Metin, ikon, buton gibi UI elemanlarını blur'lu alanın içine yerleştir.
- **Alt padding'i sıkı tut** (dar/az boşluk) — bu, en yoğun blur/kontrast bölgesinde metnin kalmasını sağlar ve okunabilirliği garantiler.
- Genel içerik hiyerarşisi (örnek: profil kartı):
  - İsim + doğrulama rozeti (bold, en yüksek kontrast)
  - Kısa açıklama (2 satır, ikincil kontrast)
  - Metrik satırı (rating, kazanç, ücret vb.)
  - CTA butonu (dolu/solid, en altta, en yüksek tıklama önceliği)

### 4. Fill ve Blur Değerleriyle Oynayarak İnce Ayar Yap
- Gradient opacity, blur start/end değerleri ve renk stop'larını görselin kendi tonuna göre ayarla.
- Koyu, düşük kontrastlı fotoğraflarda daha düşük opacity yeterli olabilir; parlak/yüksek detaylı fotoğraflarda blur end değerini artır.
- Amaç: ışık/gölge geçişinin doğal görünmesi, yapay bir "kutu" hissi vermemesi.

### 5. Dark Mode Uyarlaması
- Aynı teknik dark mode'da da birebir çalışır.
- Tek fark: blur frame'in **fill rengini `000000` yap** (light mode'da `FFFFFF` yerine).
- Bu, koyu temada "derin, premium glassmorphic" bir his yaratır; teknik/parametreler (start/end, opacity stop'ları) aynı kalır.

---

## Hızlı Referans (Parametreler)

| Parametre | Light Mode | Dark Mode |
|---|---|---|
| Blur tipi | Progressive | Progressive |
| Blur start | 0 | 0 |
| Blur end | 80 | 80 |
| Gradient yönü | Linear, yukarıdan aşağıya | Linear, yukarıdan aşağıya |
| Fill rengi | `#FFFFFF` | `#000000` |
| Stop 1 | %0 konum, %0 opacity | %0 konum, %0 opacity |
| Stop 2 | %70 konum, %100 opacity | %70 konum, %15 opacity (daha ince ayar) |
| Alt padding | Sıkı / dar | Sıkı / dar |

> Not: Görneklerdeki dark mode versiyonunda stop 2 opacity `%15` gibi düşük tutulmuş — bu, koyu görsellerde zaten yeterli doğal kontrast olduğu için gradyanın daha "ince" bir katman olarak çalışmasını sağlıyor. Kendi görsellerinde bu değeri kontrole göre ayarla.

---

## Kullanım Alanları
- Profil / kullanıcı kartları (isim, rating, CTA)
- Listing kartları (Airbnb tarzı: konum, fiyat, "Reserve" butonu)
- Ürün/portföy kartları
- Hero image üzerine başlık + alt bilgi
- Herhangi bir "görsel + üstüne UI" kompozisyonu

## Uygulama Notları (Figma)
- `F` tuşu ile frame oluşturulur (adım 1).
- Blur efekti: **Background blur → Progressive** modu (Figma'nın yerleşik özelliği).
- Gradient fill: **Linear gradient**, stop'lar renk paneli üzerinden ayarlanır.
- Teknik framework-agnostic'tir; CSS'te `backdrop-filter: blur()` + `mask-image: linear-gradient()` kombinasyonuyla veya `mix-blend-mode` ile de birebir üretilebilir (web projelerinde GSAP/Tailwind ile uygularken bu yaklaşım kullanılabilir).
