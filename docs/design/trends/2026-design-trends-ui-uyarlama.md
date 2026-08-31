# 2026 Design Trends — UI Çalışmaları İçin Uyarlama Rehberi

> Kaynak carousel'deki beş trend, aslında **poster/grafik tasarım** dünyasından geliyor — doğrudan bir UI ekranına birebir taşınamaz. Bu döküman her trendi önce görsel dilinin ne olduğunu tarif ederek, sonra **UI'a nasıl çevrilebileceğini** (nerede, ne ölçüde, hangi riskle) anlatarak ele alıyor. Amaç: trendi kopyalamak değil, arkasındaki görsel mantığı UI bileşenlerine (hero, kart, buton, tipografi) süzerek taşımak.

---

## 1. Exaggerated, Bold Text (Abartılı, Kalın Tipografi)

### Görsel dil
Harfler ekranı/posteri neredeyse tamamen dolduracak kadar büyük, kalın, bazen üst üste binen (`JANUARY JANUARY JANUARY` gibi tekrarlı katmanlama) veya distorted/psychedelic (Pulp Fiction posteri tarzı dalgalı harfler) tipografi. Renk kontrastı sert (neon sarı-siyah, kırmızı-sarı).

### UI'a çeviri
- **Hero başlıkları:** Bir landing page'in H1'i, ekran genişliğinin büyük kısmını kaplayan, `clamp()` ile ölçeklenen dev bir font-weight 800-900 başlık olabilir — bu zaten `gpt-taste` ve `high-end-visual-design` skillerinin "2-3 satır iron rule"uyla örtüşüyor.
- **Dikkatli kullanılacak yer:** Harf üstüne harf bindirme (`JANUARY JANUARY`) UI'da okunabilirliği bozar — bu tekniği **sadece dekoratif, statik bir görsel** (arka plan deseni, illüstrasyon) olarak kullan, gerçek okunması gereken metinde değil.
- **Riskli nokta:** Psychedelic/distorted harfler (Pulp Fiction tarzı) marka kimliği için tek seferlik bir logotype/başlık olabilir, ama gövde metninde veya tekrar eden UI elemanlarında asla kullanılmaz — erişilebilirlik ve okunabilirlik ihlali olur.

### Nerede kullanılır (proje eşleşmesi)
Obsession'ın editorial marka sayfalarında bir "hero moment" olarak; Apex'in brutalist büyük numaralarında zaten benzer bir mantık var (`clamp(4rem, 10vw, 15rem)` — bkz. `tasarim-skilleri-rehberi.md`, `industrial-brutalist-ui`).

---

## 2. Collage, Style Composition (Kolaj Kompozisyonu)

### Görsel dil
Birden fazla fotoğraf/görüntü parçasının üst üste, kesilmiş kenarlarla, farklı boyut ve açılarda bir araya getirilmesi. Genellikle bir kırmızı/renkli şerit veya yıldız şekli kompozisyonu "imzalıyor". Polaroid/dergi kesiği estetiği hakim.

### UI'a çeviri
- **Bento grid'in organik versiyonu:** Kolaj mantığı, asimetrik bento grid'lerde (farklı `col-span`/`row-span` kombinasyonları) zaten var — buradaki fark, kolajın kartların **kendi içinde** üst üste binen görsel katmanlar barındırması.
- **Uygulanabilir yer:** Bir "hakkımızda"/portföy sayfasında, tek bir hero görseli yerine 3-4 küçük görüntünün hafif döndürülmüş/üst üste binen bir kompozisyonu (bkz. `high-end-visual-design`'daki "Z-Axis Cascade" — kartların hafif rotasyonla üst üste binmesi, aynı tekniğin UI karşılığı).
- **Dikkat:** Kolajdaki "kesik kenar" efekti (clip-path ile düzensiz kenar) mobilde performans ve okunabilirlik sorunu yaratabilir — mobil breakpoint'te kolaj basitleşip tek bir görsele düşmeli.

### Nerede kullanılır
Obsession'ın 10 markalı editorial yapısında her markanın "hikaye" bölümünde; EVEREST'in Pinterest-vari masonry/bento layout'unda kolaj hissi zaten doğal olarak var.

---

## 3. Blueprint, Design Style (Teknik Çizim / Mavi Baskı Estetiği)

### Görsel dil
Koyu mavi zemin + beyaz/açık mavi çizgiler, ölçü işaretleri, teknik çizim referansları (mimari plan, harf anatomisi diyagramı gibi). "Mühendislik dokümantasyonu" hissi — hassas, ölçülü, güvenilir.

### UI'a çeviri
- **Bu, `industrial-brutalist-ui`'nin Swiss Industrial modunun mavi bir varyasyonu** — ASCII çerçeveleme, crosshair, ölçü işaretleri (`10x`, `6.18x` gibi altın oran diyagramındaki notasyonlar) doğrudan bu estetiğin UI karşılığı.
- **Uygulanabilir yer:** Data-heavy dashboard'larda (Apex'in telemetri ekranları), teknik ürün sayfalarında (bir SaaS'ın "nasıl çalışır" bölümü), veya bir design system'in kendi dökümantasyon sayfasında (token/grid gösterimi — tam olarak `premium-design-philosophy.md`'deki Aurea altın oran diyagramı gibi).
- **Renk notu:** Bu palet aslında `60-30-10-renk-kurali.md`'nin monokrom örneklerinden biri olarak okunabilir — koyu mavi %60 zemin, açık mavi çizgiler %30 yapı, beyaz vurgu %10.

### Nerede kullanılır
Apex F1'in teknik telemetri/spec sayfalarında; bir design system'in kendi iç dökümantasyonunda (grid/spacing gösterimi) doğal bir uyum var.

---

## 4. Imperfect, Design Style (Kusurlu / El Çizimi Estetiği)

### Görsel dil
Kasıtlı olarak "düzensiz" — el çizimi karakterler, çocuksu illüstrasyon, düzensiz/eğri tipografi (Crush, Be Naive posterleri), sıcak ve samimi bir ton. Mükemmeliyetçi/kurumsal olmayan, "insan eli değmiş" hissi.

### UI'a çeviri
- **Bu, premium/lüks tasarım felsefesiyle (bkz. `premium-design-philosophy.md`) doğrudan gerilimde** — o döküman "hassasiyet, geometrik uyum, sınırlı palet" derken bu trend kasıtlı düzensizliği övüyor. İkisi **aynı projede karışmaz**; bu trend bilinçli bir marka kararı olarak (sıcak, samimi, "kurumsal olmayan" bir ton isteniyorsa) seçilmeli.
- **Uygulanabilir yer:** Topluluk/sosyal ürünlerde (Rosso'nun bazı sosyal/eğlenceli bölümleri), bir etkinlik/davet sayfasında, illüstrasyon-ağırlıklı empty-state tasarımlarında (bkz. `loading-states-process-feedback.md` — "Empty States: Composed illustration" maddesi bu estetikle iyi eşleşir).
- **Dikkat:** El-çizimi fontlar gövde metninde asla kullanılmaz — sadece illüstrasyon/başlık/empty-state gibi dekoratif noktalarda, okunabilirlik gerektirmeyen yerlerde.

### Nerede kullanılır
FinPilot'un "her şey çok ciddi/finansal" hissini yumuşatmak için bir onboarding illüstrasyonunda; Rosso'nun kullanıcıya "resmi değiliz" mesajı vermek istediği empty-state/başarı ekranlarında.

---

## 5. Monochrome, Design Style (Monokrom / Siyah-Beyaz)

### Görsel dil
Tek renk ailesi (siyah-beyaz-gri tonları), yüksek kontrastlı fotoğraf (dağ, manzara, mimari), editorial serif+sans karışık tipografi. Sakin, sinematik, "dergi kapağı" hissi.

### UI'a çeviri
- **Bu trend zaten `60-30-10-renk-kurali.md`'de detaylı işlendi** — monokrom paletlerin bile 60:30:10 oranıyla çalıştığı (Samurai Jack kış örneği) doğrudan bu estetiğin UI/renk-sistemi karşılığı.
- **Uygulanabilir yer:** Obsession'ın editorial otomotiv sayfalarında (özellikle siyah-beyaz fotoğraf ağırlıklı bir marka bölümünde), Apex'in Swiss Industrial modunda, EVEREST'in cinematic galerisinde.
- **Tipografi notu:** Görsellerdeki serif+sans karışımı (`wander`, `Fearless` gibi başlıklar), `cinematic-fonts-reference.md`'deki Perfectly Nineties / Romens Dawn gibi editorial serif'lerle doğrudan örtüşüyor.

### Nerede kullanılır
Obsession, EVEREST, Apex — zaten koyu/monokrom ağırlıklı olan üç proje için ek bir onay: bu yön 2026'da güçlenen bir trend, mevcut yön isabetli.

---

## Genel Uyarı: Poster ≠ UI

Bu beş trendin hepsi **statik, tek-anlık kompozisyonlar** (poster, Instagram carousel'i) için tasarlanmış. UI'a taşırken üç şeyi hep sorgula:

1. **Tekrarlanabilir mi?** Bir poster bir kere görülür; bir UI bileşeni yüzlerce kez, farklı içerikle tekrar render edilir. Kolaj/imperfect gibi "el işi" hisleri, dinamik veriyle (kullanıcı adı, değişken içerik) beslendiğinde bozulabilir — bu yüzden bu trendleri genellikle **statik/dekoratif** noktalarda (hero, empty-state, marka anı) kullan, veri-yoğun/tekrarlayan bileşenlerde değil.
2. **Responsive mi?** Blueprint'teki teknik çizim yoğunluğu veya kolajın kesik kenarları mobilde nasıl davranır? Her trend için mobil fallback'i baştan tanımla.
3. **Erişilebilir mi?** Abartılı tipografi ve el-çizimi fontlar kontrastı ve okunabilirliği bozabilir — `universal-design-principles.md`'deki İlke 5 (Erişilebilirlik) her zaman bu trendlerin üstünde kalır.

## Hızlı Referans Tablosu

| Trend | En uygun proje/bağlam | En riskli kullanım |
|---|---|---|
| Exaggerated Bold Text | Hero başlıkları, marka anları | Gövde metni, tekrarlayan UI |
| Collage Composition | Portföy/editorial "hikaye" bölümleri | Veri-yoğun dashboard'lar |
| Blueprint Style | Teknik dashboard, design system dökümantasyonu | Sıcak/samimi ton istenen ürünler |
| Imperfect Style | Empty-state, onboarding, topluluk hissi | Finansal/kurumsal ciddiyet gereken ekranlar |
| Monochrome Style | Editorial otomotiv, cinematic galeri, brutalist dashboard | Renkli/enerjik marka kimlikleri |
