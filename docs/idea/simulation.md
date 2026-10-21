# Kişisel Gelişim ve Proje Vizyon Belgesi: Formula 1 Mühendislik Temelleri ve Apex Simülasyon Entegrasyonu

---

### 1. Giriş ve Amaç

Bu çalışma planının temel amacı; Formula 1 dünyasındaki teknik dinamikleri ve yarış mekaniğini derinlemesine kavramak, mühendislik nosyonunu geliştirmek ve bu kazanımları halihazırda yürütülen **Apex** projesine entegre ederek platformu salt bir yarış takip sitesinden interaktif bir **F1 Analitik ve Simülasyon Motoru** seviyesine taşımaktır.

---

### 2. Alınacak Eğitimler ve Odak Alanları

Eğitim süreci, MathWorks Academy tarafından sunulan ve F1 takımlarının doğrudan kullandığı modelleme araçlarını kapsayan 3 temel kurstan oluşmaktadır:

1. **MATLAB Onramp (2 Saat):**
* **Odak:** Telemetri ve zaman serisi verilerinin matematiksel analizi, veri manipülasyonu ve matris hesaplamaları.
* **Kazanım:** F1 araçlarının sensör çıktılarından gelen ham hız, gaz/fren, devir ve ivme verilerini işlenebilir kılmak.


2. **Simulink Onramp (3 Saat):**
* **Odak:** Dinamik sistemler, blok diyagram modelleme, durum akışları (State-Flow) ve kontrol algoritmaları.
* **Kazanım:** Yarış şartlarının mantıksal durumlarını (pist koşulları, pit periyodu, lastik aşınma evreleri) blok tabanlı matematiksel kurallarla simüle edebilmek.


3. **Simscape Battery Onramp (1 Saat):**
* **Odak:** Batarya paketleri, hücrelerin şarj/deşarj (SoC) karakteristikleri ve termal davranış modellemesi.
* **Kazanım:** 2026 regülasyonları ile önemi katlanacak olan MGU-K enerji geri kazanımı ve deşarj optimizasyonunun mantığını kavramak.



---

### 3. Apex Projesine Entegrasyon ve Simülasyon Hedefleri

Eğitimlerden elde edilen matematiksel ve fiziksel modelleme yetkinlikleri, **FastF1 API** gibi açık kaynak yarış telemetrisi verileriyle beslenerek Apex platformunda şu araçlara dönüştürülecektir:

* **"What If?" (Karşıolgusal Strateji) Simülatörü:**
* Geçmiş yarışlardaki pit zamanlamalarını, lastik bileşeni seçimlerini ve stint uzunluklarını yeniden kurgulama olanağı.
* Tur başına lastik aşınma eğrisi (degradation), yakıt tüketimi kaynaklı hafifleme ve pit yolu kayıp sürelerini hesaba katan dinamik tur zamanı projeksiyonu.
* Değiştirilen strateji sonucunda pilotun sanal pist pozisyonunu diğer rakiplerin gerçek zaman damgalarıyla karşılaştırarak alternatif yarış sonuçlarını hesaplama.


* **2026 Hibrit Enerji ve Boost Tahminleyicisi:**
* Simscape Battery prensipleri temel alınarak pilotların düzlüklerdeki "Boost / Overtake" modu kullanımlarının batarya ömrü ve hızlanma üzerindeki etkilerini görselleştirme.


* **Telemetri ve "Ghost Lap" Kıyaslama Arayüzü:**
* İki pilot arasındaki zaman farklarının vites geçişleri, aerodinamik sürtünme veya erken gaz kesme (lift & coast) tercihlerinden kaynaklanan paylarını modelleyerek kullanıcıya sunma.



---

### 4. Beklenen Çıktılar

* **Kişisel Gelişim:** Yarışları salt görsel bir rekabet olarak değil, arka plandaki telemetri, termal kısıtlar ve stratejik kararlar boyutuyla çok daha bilinçli analiz edebilme.
* **Portfolyo ve Ürün Değeri:** Apex’i sektörde benzeri az bulunan interaktif bir mühendislik simülatörüyle zenginleştirerek hem kullanıcı deneyimini yükseltmek hem de yazılım/veri analitiği alanında somut bir proje çıktısı elde etmek.