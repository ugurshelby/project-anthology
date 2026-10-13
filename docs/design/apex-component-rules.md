# Apex Component Rules — sahip kuralları

> **Otorite:** Bu dosyadaki her kural sahibin (owner) kendi koyduğu kuraldır ve bağlayıcıdır (`AGENTS.md` → Design authority). Ajanlar bu kuralları yorumlamaz, gevşetmez, "daha iyi" diye değiştirmez; bir kural uygulanamıyorsa durur ve sahibe sorar. Yeni kuralı yalnızca sahip ekler; ajan sahibin cümlesini buraya tarih ve bölümle yazar.
> Token, tipografi ve renk değerleri burada tekrarlanmaz: `docs/design/apex-design.md` §3–§5.
> Kodla zorlanan kurallar testin adıyla işaretlidir; test kırmızıysa kural bozulmuştur.

---

## 1. Navigasyon (sahip, 2026-10-10)

### 1.1 Önem sırası — tek kaynak
- Sayfalar anlam ve önemlerine göre **tek bir listede** sıralanır: `NAV_PAGES_BY_RANK` (`components/layout/nav-items.ts`). Masaüstü ve mobil düzen bu listeden türetilir; hiçbir yüzeyde sıra elle verilmez.
- Yeni sayfa bu listeye **önemine göre doğru sıraya** eklenir; bir tarafa elle eklenmez.
- Güncel sıra (sahip değiştirebilir): Sezon, Grid, Haberler, Pistler, Antoloji, Araçlar, Sözlük.

### 1.2 Masaüstü (md ve üstü)
- **Ana sayfa (APEX ARŞİV) her zaman merkezde:** hem navbar'ın hem sayfanın yatay merkezinde. Ölçü: logonun merkezi ile sayfanın merkezi arasındaki fark en fazla 1 px.
- **Dil seçici sağ kenarda, sayfalardan ayrık:** kendi kenar sütununda, ince bir ayırıcı çizgiyle. Sol kenarda aynı genişlikte boş bir sütun durur, böylece merkez kaymaz.
- **Boşluklar tek ölçüye bağlı:** sayfa kenarı ile dil seçici, dil seçici ile sayfalar, sayfalar ile logo arasındaki boşlukların hepsi aynı değerdir (`--nav-g`).
- **Merkezden dışa sıralama:** en önemli sayfa logonun hemen solunda, ikinci sağında, üçüncü solda bir dışarıda, dördüncü sağda bir dışarıda… diye dışa doğru dizilir.
- **Eşit alan, simetri:** her sayfaya eşit genişlik ayrılır; iki tarafta da aynı sayıda yuva bulunur. Sayfa sayısı tekse en dıştaki sağ yuva boş kalır, logo kaymaz.
- **Taşma yok:** hiçbir sayfa adı yuvasından taşmaz ve kesilmez (EN ve TR ölçülür). Sığmadığı genişlikte düzen iki satıra geçer: üstte logo + dil seçici, altta merkezin iki yanına bölünmüş sayfalar (md–xl). xl ve üstünde tek satırdır.
- **Durumlar:**
  - Seçili sayfa: accent renkli yazı + accent alt çizgi.
  - Hover: yazı açılır + soluk alt çizgi.
  - Klavye odağı: accent halka.
  - Ana sayfa seçiliyken APEX logosu diğer sayfaların seçili hâlinden **belirgin biçimde ayrışır**.
  - **Güncelleme (sahip, 2026-10-13, masaüstü):** "navbarda apex ana sayfası seçili olduğundaki durumunu kırmızı kutu olayını beğenmedim onu düzelt, genel anlamda navbar biraz daha elegant ve modern olabilir, yerleşim boyutlar iyi." Kırmızı dolu kutu kullanılmaz; yerleşim ve boyutlar korunur.

### 1.2.1 Yıl seçici (sahip, 2026-10-13)
- Grid ve detay sayfalarındaki yıl seçici: "2020ler 2010lar yazmana gerek yok direkt yıllar yeterli." On yıl başlıkları gösterilmez, yalnızca yıllar.

### 1.3 Mobil (md altı)
- Alt dock: Ana sayfa + önem sırasındaki ilk sayfalar (`MOBILE_DOCK_PAGE_COUNT`), kalanlar "+" menüsünde **aynı önem sırasıyla**.
- Ana sayfa seçiliyken dolu accent zemin; diğer sayfalar seçiliyken soluk accent zemin + accent yazı. Böylece ana sayfa burada da ayrışır.

Testler: `tests/nav-items.test.ts` (sıra, simetri, boş yuva, merkezden dışa dizilim, mobil sıra).

---

## 2. Ana sayfa (sahip, 2026-10-10)

### 2.1 Haberler kartı
- Başlık doğrudan **"Haberler" / "News"** olur ("Telgraf Akışı", "The Wire" gibi takma adlar kullanılmaz).
- Kartta **3 haber** gösterilir (`HOME_NEWS_COUNT`, `lib/home/homeLayout.ts`). Sunucudan da yalnızca bu kadarı istenir. Haberler kartın yüksekliğini doldurur; altta veya üstte boşluk bırakılmaz.

### 2.2 Tarihte Bugün kartı
- Görselsiz gösterilmez, görsel o olayla **ilgili** olmalıdır. Sıra (`lib/home/onThisDayImage.ts`):
  1. O sezonun kazanan aracı,
  2. kazanan pilot,
  3. pist.
- Hiçbiri yoksa ilgisiz bir fotoğraf konmaz; tipografik görünüm kalır. Görselin kredisi kartın üzerinde görünür.

Testler: `tests/on-this-day-image.test.ts`.

### 2.3 Hero: hafta sonu programı
- Bakan biri "yarış ne zaman, hangi saate göre?" diye sormamalı.
- Program ayrı bir panelde durur. Panelin başlığı saat dilimini **bir kez ve açıkça** söyler: "Senin saatin · GMT+3".
- Her satırda seans adı, gün/tarih ve büyük saat bulunur. Pistin yerel saati küçük olarak "Pist …" diye yazılır ("Yerel" kelimesi kullanılmaz; kimin yereli olduğu belirsizdir).
- Yarış satırı accent ile vurgulanır; bitmiş seanslar soluklaşır ve "Bitti" yazar.
- Gösterilen seanslar: FP1, Sprint (varsa), Sıralama, Yarış; zaman sırasıyla.
- **Yarış sırasında (sahip, 2026-10-11):** canlı sıralama yoksa (OpenF1 ücretsiz plan) "kilitli" denmez; geri sayımın yerinde **"Lights out"** paneli durur: beş start ışığı yanıp birlikte söner, yeşil ışıktan beri işleyen yarış saati ve sonuçların bayraktan birkaç dakika sonra burada olacağı yazar. "Lights out" her dilde İngilizce kalır (F1'in kendi ifadesi). Bayraktan sonra "Bayrak düştü" ve yarış sayfasına bağlantı.

### 2.4 Paddock bento: sağ sütun
- Sağ sütun dikey olarak ikiye bölünür: **üstte Son Yarışın Kazananı, altta Antoloji**. İki kart eşit önemdedir: birebir aynı boyutta, aynı kart kabuğunda.
- Kazanan kartı içeriği: pilot numarası, ad ve soyad, takım (takım rengi sol çizgi, numara ve parıltıda), yarış adı, pist, tarih ve tüm sonuçlara bağlantı. Pilot fotoğrafı varsa kredisiyle birlikte gösterilir.
- Hero'da ayrıca "son yarışın kazananı" kutusu yoktur; bilgi tek yerde durur.
- *Uygulama notu (Claude, 2026-10-11, sahip yetkisiyle; sahip değiştirebilir):* yarış bitip resmî sonuç henüz yayımlanmamışken (Jolpica genelde 1–3 saat sonra) kart iskelet göstermez, önceki yarışın kazananını da "son yarış" diye sunmaz. Bitmiş yarışın adı, pisti ve tarihi ile "Resmî sonuçlar yolda" yazar; sonuç gelince kendiliğinden kazanan kartına döner.
- Mobilde üç sütun aynı genişlikte kaydırılan kartlardır (`w-[min(85vw,22rem)]`); sağ sütun mobilde de iki eşit kart olarak kalır.

---

## 3. Teknik Sözlük: Lastik sıcaklık pencereleri (sahip, 2026-10-12)

Bileşen: `components/glossary/TyreThermalWindows.tsx`. Sahibin brifinden bağlayıcı maddeler, sahibin cümleleriyle (tam brif: `docs/plans/master-plan.md` U-1):

- **Görsel dil:** "Projemizin kendi tasarım sistemini temel alarak; iOS estetiğinde (… pürüzsüz frosted-glass dokular, mükemmel border-radius oranları, canlı ama rafine renkler ve akıcı yaylı/spring mikro animasyonlar)". "Kaba ve kontrastı düşük kutular yerine; katmanlı derinlik, zarif iç ışıma (inner glow), ince translucent bordürler ve modern bir dark-mode cam dokusu".
- **Tipografi:** "monospaced/aşırı teknik havayı kır; bilgiyi tek bakışta aktaran, net bir hiyerarşiye sahip modern bir tipografik ritim".
- **Bilgi panelleri** (Kabarcıklanma, Granüllenme): "sayfanın altına atılmış statik metin kutuları gibi değil; keşfedilebilir, interaktif kartlar, akordeonlar ya da dokunulduğunda yumuşakça açılan bağlamsal bilgi pencereleri".
- **C1–C5 seçimi:** "iOS tarzı akıcı … 'segmented pill control'"; "seçim hapı (active pill indicator) spring animasyonuyla akarak kaysın"; "Her hamurun kendi kimlik rengi … arayüzün geneline hafif, sofistike bir ambient glow … yaysın."
- **Termal gösterge (bileşenin kalbi):** "Sıcaklık aralığını (Soğuk / Optimum Çalışma / Aşırı Isınma) adeta dinamik bir Apple Health halkası ya da lüks bir otomobil kadranı akıcılığında sun." "'Optimum Aralık' ve 'Zirve Tutuş (Peak)' alanını neon sertliğinde değil, zarif bir nefes alma efekti (subtle pulse glow)" ile göster. Hamur değişince aralıklar ve ibreler "yaylı fizik (spring physics) ile esneyerek yeni konumuna aksın". "Kullanıcı parmağıyla veya imleciyle bar üzerinde gezinebilmeli (scrubbing/slider hissi); derece değiştikçe lastiğin termal risk durumu (Graining vs. Blistering) canlı bir geri bildirimle hissettirilmeli."
- **Metrikler:** "Isınma Hızı", "Aşınma Direnci", "Min/Maks Eşik" "temiz, geniş boşluklu (airy), mikro göstergelere veya zarif progress barlara sahip modern KPI kartları".
- **Mobil/tablet:** "her şey başparmakla kolayca gezilebilir, ritmik ve hafif hissedilmeli."
- *Uygulama notu (Claude, `AGENTS.md` sınırları):* kadran klavyeyle de kullanılır (`role="slider"`, ok tuşları), seçim grubu `role="radiogroup"`; `prefers-reduced-motion` açıkken yaylar ve nefes efekti durur; yay değerleri `lib/motion.ts` (`APEX_MOTION`, `apex-design.md` §6).

---

## 4. Grid sayfası (sahip, 2026-10-13)

- "toggle ihtiyaç da yok zaten direkt orijinal default ve sabit olarak takıma göre sıralama olsun ve o düzende kalsın." Takım / sürücü sıralaması anahtarı yoktur; sayfa her zaman takıma göre düzenlidir.
- Takım kartı düzeni korunur ("solda takım sağda pilotlar ve puan çubukları takım rengi kullanımı kart içinde görselin hafif fade ile geçişli olması vs harika"); pilot görselleri bulundukları alana göre konumlandırılır, yüz kırpılmaz ("hamiltonun kafası gözükmüyor bile").

## 5. Ana sayfa: Apex kimliği (sahip, 2026-10-13)

- "kullanıcı apexe girdiğinde ana sayfada apex'in logosunu görmüyor ne olduğunu görmüyor tam vs o açıdan boş alanlar daha iyi kullanılabilir, bunun bir f1 sitesi olduğu tasarımla daha iyi anlatılabilir. genel hero section güzel ama apex anlamında eksik."

## 6. Teknik Sözlük: lastik bileşikleri, kavram kartları, kural değişiklikleri (sahip, 2026-10-13)

- Lastik bileşikleri: "üstünde yatay slide ile hepsi yanyana da var bu anlamsız olmuş 7 kartlı direkt lastiği anlatan tıklayınca detaylanan akıllı kompakt kart gibi bi tasarım iyi olur ama yine lastik termal komponentindeki gibi yaratıcılığını kat, animasyonlar vs de olsun akıcı ve anlatıcılığı iyi olsun."
- Kavram kartları: "her kart için görselimiz var kendi ürettiğimiz ama küçücük şuan görünmüyolar kullanıcılar her kavramı görseli de rahat görerek, anlayarak öğrenebilmeli."
- Kural değişiklikleri: "redesign edilmeli. özellikle burda çok metin olduğu için buna uygun düşün."
- Ölçüt: §3'teki lastik termal penceresi ("harika olmuş") bu bileşenlerin kalite çıtasıdır.
