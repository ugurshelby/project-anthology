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
  - Ana sayfa seçiliyken APEX logosu accent zemin ve çerçeveyle diğer sayfaların seçili hâlinden **belirgin biçimde ayrışır**.

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

### 2.4 Paddock bento: sağ sütun
- Sağ sütun dikey olarak ikiye bölünür: **üstte Son Yarışın Kazananı, altta Antoloji**. İki kart eşit önemdedir: birebir aynı boyutta, aynı kart kabuğunda.
- Kazanan kartı içeriği: pilot numarası, ad ve soyad, takım (takım rengi sol çizgi, numara ve parıltıda), yarış adı, pist, tarih ve tüm sonuçlara bağlantı. Pilot fotoğrafı varsa kredisiyle birlikte gösterilir.
- Hero'da ayrıca "son yarışın kazananı" kutusu yoktur; bilgi tek yerde durur.
- Mobilde üç sütun aynı genişlikte kaydırılan kartlardır (`w-[min(85vw,22rem)]`); sağ sütun mobilde de iki eşit kart olarak kalır.
