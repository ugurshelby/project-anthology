# Universal Design Principles — Master Doküman

> **Hiyerarşik konum:** Bu döküman, tüm diğer tasarım dökümanlarının (60:30:10 renk kuralı, Premium Design Philosophy, Progressive Blur Card, Loading States, Design System Kurulum Rehberi, Cinematic Fonts, `web-design.md`, `mobile-design.md`, proje-özel `design.md` dosyaları) **üzerinde** durur. Bunlar birer *stil* veya *platform* katmanıdır; bu döküman ise stilden ve platformdan bağımsız, **her** görsel/dijital üründe (mobil app, web sitesi, dashboard, tek bir Instagram görseli, bir slayt, bir e-posta tasarımı) geçerli olan tabandır.
>
> **Kritik ayrım:** Bu döküman bir *estetik* dikte etmez. Minimalist de olabilirsin, brutalist de, maksimalist de, cinematic de — bu ilkeler hangi *stili* seçtiğini değil, seçtiğin stilin *nasıl davranması gerektiğini* tanımlar. Apex'in brutalist sıfır-radius dünyası ile EVEREST'in glassmorphic yumuşaklığı burada çelişmez; ikisi de aynı temel ilkelere (hiyerarşi, tutarlılık, erişilebilirlik, geri bildirim) uyar, sadece görsel dili farklıdır.

---

## 0. Tek Cümlelik Özet

> **Tasarım, kullanıcının beynine en az iş yükünü bindirerek doğru mesajı/eylemi en hızlı şekilde iletme disiplinidir — ve bunu yaparken kullanıcının bilişsel ve duygusal iyi oluşunu (well-being) hiçbir zaman verimlilik uğruna feda etmez.**

Bu tek cümle, aşağıdaki yedi ilkenin hepsinin köküdür.

---

## İlke 1 — Hiyerarşi ve Tek Odak

Her ekran, kart, sayfa veya tekil görsel (statik bir Instagram postu dahil) **bir tane** en önemli şeye sahip olmalı. İkinci bir "birincil" eleman varsa, biri ikincile düşürülmeli.

- **Squint Test (Kısma Testi):** Gözünü kısarak veya tasarım aracında blur uygulayarak bak — bulanık görünümde hâlâ öne çıkan tek bir şey olmalı (başlık, CTA, hero görseli). Birden fazla şey öne çıkıyorsa hiyerarşi bozuktur.
- **Statik içerikte de geçerli:** Etkileşimli bir UI olmasa bile (bir sosyal medya görseli, bir sunum slaydı) izleyicinin gözü nereye gitsin istiyorsun? O tek noktayı belirle, geri kalan her şeyi ona hizmet edecek şekilde geri plana at.
- **Vurgu bir para birimidir.** Ne kadar çok yerde kullanılırsa o kadar değersizleşir (bkz. 60:30:10 Renk Kuralı — bu ilkenin renk-özel uygulaması).

---

## İlke 2 — Bilişsel Yük Yönetimi (Cognitive Load)

İnsan beyni sınırlı bir işlem kapasitesine sahiptir; tasarımın işi bu kapasiteyi zorlamamaktır.

- **Hick's Law:** Karar süresi, sunulan seçenek sayısıyla orantılı artar. Kritik anlarda (checkout, onboarding, birincil CTA) seçenek sayısını minimumda tut.
- **Aşamalı açığa çıkarma (Progressive Disclosure):** Gelişmiş/nadir kullanılan özellikleri en başta gösterme; kullanıcı temel etkileşimi kavradıktan sonra tanıt.
- **Parçalara böl:** Karmaşık bir görevi tek büyük bir formda değil, sıralı küçük adımlarda sun.
- **F-Pattern / Z-Pattern:** Metin ağırlıklı içerikte kritik kelimeleri başlığın ilk iki kelimesine yerleştir; landing page'lerde doğal diagonal tarama yolunu (logo sol üst → değer önermesi merkez → CTA sağ alt) takip et.

---

## İlke 3 — Sistemleştirme, Keyfilik Değil

Hiçbir değer (renk, boşluk, font boyutu, köşe yuvarlaklığı) göz kararı seçilmez; hepsi bir **sistemin** (skala, token, grid) parçası olarak türetilir.

- **Design token mantığı (platform bağımsız):** Ham değer (`#3B82F6`, `16px`) yerine semantik isim (`color-primary`, `spacing-16`) kullan. İki katmanlı düşün:
  - **Primitive/Definition token:** Ham değer (`blue-500`, `spacing-8`) — paletin/skalanın tek doğruluk kaynağı.
  - **Semantic/Composite token:** Ham değeri bir UI rolüne bağlar (`color-background-brand`, `typography-heading-large`).
- **İsimlendirme şeması (5 basamak):** `tip-rol-niyet-varyant-durum` (örn. `color-content-default-on-brand`). Bu şema hem insan geliştiriciler hem de AI ajanları (Claude Code) için okunabilir ve regex ile doğrulanabilir olmalı.
- **8pt grid neredeyse evrenseldir:** Web ve mobilde boşluk skalası `4, 8, 16, 24, 32, 40, 48, 64` şeklinde ilerler; hassas hizalamalarda 4pt yarım adım kullanılır. Bu bir "kanun" değil, tutarlı bir varsayılan — bir proje farklı bir birim seçerse (örn. 6pt), o seçim de en az bu kadar disiplinli uygulanmalı.
- **Tipografi modüler oranla türetilir** (1.125, 1.25 veya 1.333 gibi bir çarpan), rastgele boyut seçilmez. Satır yüksekliği font boyutuyla ters orantılıdır: küçük metin geniş (1.5-1.7), büyük başlık dar (1.1-1.3) line-height alır.
- **Neden önemli:** Sistemleştirme olmadan her yeni ekran kendi kuralını icat eder; bu hem tutarsızlık hem de teknik/tasarım borcu yaratır (bkz. Design System Kurulum Rehberi).

---

## İlke 4 — Tutarlılık = Erişilebilirlik

Bir arayüzde konum, davranış ve görsel dil ne kadar tutarlıysa, kullanıcı o kadar az düşünerek kullanır — bu sadece kolaylık değil, **erişilebilirliğin kendisidir.**

- **Pozisyonel tutarlılık:** İkili aksiyonlarda (Onayla/Reddet, Evet/Hayır) konum hep aynı olmalı — "Reddet" hep solda, "Onayla" hep sağda gibi. Bu, renk körü kullanıcılar için birincil geri bildirim kanalıdır; renk algılanamasa bile konum/kas hafızası doğru eylemi seçtirir.
- **Layout flip yasak:** Aynı tür ekranlar arasında (örn. tüm ayar sayfaları, tüm form akışları) temel yerleşim mantığı değişmemeli.
- **Etkileşim durumları standart:** Her etkileşimli eleman en az dört durumu (Default, Hover/Focus, Disabled, Error) tutarlı bir görsel dille işaretlemeli — bu durumlar proje proje farklı *görünebilir* ama her projede *var olmalı*.

---

## İlke 5 — Erişilebilirlik ve Çoklu Kanal İletişim

Renk bir iletişim kanalıdır, ama **tek** kanal olamaz.

- **Kontrast:** Normal metin en az 4.5:1, büyük metin (18pt+ veya 14pt bold) en az 3:1 kontrast oranına sahip olmalı (WCAG 2.1 AA). Etkileşimli olmayan UI bileşenleri (border, ikon) komşu renklere karşı en az 3:1.
- **Asla sadece renk:** Başarı/hata/uyarı durumu asla yalnızca renkle iletilmez — ikon, metin veya desen mutlaka eşlik etmeli. Nüfusun ~%8'i (erkeklerde) kırmızı-yeşil renk körlüğü yaşıyor; bu kullanıcılar sembolün *anlamını* kaybetmiyor, sadece *rengi* farklı algılıyor — bu yüzden ikon/pozisyon/metin desteği anlamı taşımaya devam ediyor.
- **"On-" modifier mantığı:** Bir token'ın adı, hangi zemin üzerinde kontrast garantisi verdiğini içermeli (`color-content-on-brand` gibi) — bu, manuel kontrast testini gereksiz kılar ve hatayı isimlendirme seviyesinde önler.
- **Dark mode = Surface Lightness, gölge değil:** Karanlık zeminde gölgeler görünmez; hiyerarşi katman katman açılan yüzey tonlarıyla (`#121212 → #1E1E1E → #383838` gibi) kurulur. Saf siyah (`#000000`) zemin yerine derin kromatik nötr tonlar tercih edilir — saf siyah, açık metne karşı sert bir halo/flare etkisi yaratır.

---

## İlke 6 — Geri Bildirim ve Durum Dürüstlüğü

Sistem her zaman "şu an ne durumdayım" sorusunun cevabını vermeli — belirsizlik güvensizlik üretir.

- **Yükleme:** Tam sayfa yüklemelerde (10 saniyeyi geçebilecek durumlarda) belirsiz spinner değil, **layout'u yansıtan skeleton** kullan; süreç 10 saniyeyi geçiyorsa somut ilerleme çubuğu (yüzde/süre) göster. Spinner'ı sadece küçük, lokal modüllerde (buton içi vb.) kullan.
- **Hata:** Bir işlem yarıda kesildiğinde kullanıcı sıfırdan başlamak zorunda kalmamalı; kaldığı yerden devam edebilmeli (inline retry).
- **Çoklu işlem:** Bir öğenin başarısızlığı diğerlerini bloklamamalı — her öğe kendi bağımsız durumunu taşımalı.
- **Statik tasarımda karşılığı:** Etkileşim olmasa bile (bir görsel, bir kapak tasarımı) "bu ekran/görsel neyi temsil ediyor, izleyici ne düşünmeli" sorusunun cevabı belirsiz bırakılmamalı — bu da bir tür "durum dürüstlüğü"dür.

*(Bu ilkenin genişletilmiş uygulaması için: Loading States & Process Feedback dökümanı.)*

---

## İlke 7 — Kısıtlama Disiplini ve Kullanıcı İyi Oluşu

Verimlilik/etkileşim tek başına bir tasarım hedefi değildir; tasarım kullanıcının bilişsel ve duygusal sağlığını da gözetmelidir.

- **Az gürültü = çok güven.** Karmaşa çaresiz görünür; sadelik otorite ve güven işaret eder (bkz. Premium Design Philosophy).
- **"Efficiency-at-all-costs" bir tuzaktır.** Her etkileşimi otomatikleştirmek veya her anı "engagement" için optimize etmek, kullanıcıyı pasif tüketime ve "de-skilling"e (kendi yeteneklerinin körelmesine) sürükleyebilir. Bir özelliğin var olma amacı sorgulanmalı: *bu, kullanıcının gerçek ihtiyacına mı hizmet ediyor, yoksa sadece "meşgul görünme" hissi mi yaratıyor?*
- **Anlamlı sürtünme bazen doğrudur.** Her sürtünmeyi ortadan kaldırmak iyi tasarım değildir — bazı görevlerde (örn. hassas/geri dönüşü olmayan aksiyonlar) kasıtlı bir onay adımı, kullanıcıyı korur.
- **Kararların şeffaflığı:** Kullanıcıya bir sistemin (algoritma, otomasyon) ne yaptığını anlaması için asgari düzeyde ipucu ver — ham "kara kutu" sonuç yerine, kullanıcının kendi anlayışını inşa etmesine izin veren bir ara katman sun.
- **Bu ilke özellikle sosyal/duygusal ürünlerde (Rosso gibi) daha ağır basar, ama her projede bir zemin ilkesi olarak geçerlidir:** kullanıcıyı manipüle etmeyen, onu tüketmeyen, ona saygı duyan bir arayüz.

---

## Platform ve Bağlam Notu (Ne Zaman Ne Değişir)

Bu yedi ilke sabit kalır; **uygulama detayları** platforma göre değişir:

| Platform/Bağlam | Değişen şey | Sabit kalan ilke |
|---|---|---|
| Mobil (dokunmatik) | Bottom nav, 44×44px min dokunma alanı, thumb-zone CTA yerleşimi, hover yok | Hiyerarşi, erişilebilirlik, geri bildirim |
| Web (masaüstü) | 12-kolon grid, sidebar/mega menu, hover+focus state ayrımı, 1200-1440px max container | Hiyerarşi, tutarlılık, sistemleştirme |
| Statik görsel (Instagram, sunum) | Etkileşim yok, tek kare/an üzerinden mesaj iletilir | Hiyerarşi (İlke 1), kısıtlama disiplini (İlke 7) |
| Dashboard/SaaS | Yoğun bilgi, tab/sidebar navigasyon, veri tabloları | Bilişsel yük yönetimi, sistemleştirme |
| Doğu Asya pazarları | Daha yüksek bilgi yoğunluğu güven inşa eder (bkz. Premium Design Philosophy §9) | Aynı yedi ilke, farklı yoğunluk kalibrasyonu |

---

## Döküman Hiyerarşisi (Bu Sistemde Nasıl Konumlanıyor)

```
Universal Design Principles (bu döküman)
        │  — stilden/platformdan bağımsız taban
        ▼
Platform Katmanı — web-design.md, mobile-design.md
        │  — platforma özgü grid/tipografi/etkileşim detayları
        ▼
Stil/Felsefe Katmanı — Premium Design Philosophy, Cinematic Fonts,
        │  Progressive Blur Card, 60:30:10 Renk Kuralı, Loading States
        │  — "nasıl güzel/etkili görünsün" katmanı
        ▼
Proje-Özel design.md / CLAUDE.md — Apex, Rosso, FinPilot, EVEREST,
           The Origin, Obsession vb.
           — bir önceki üç katmanın somut, projeye özel uygulaması
```

**Çelişki kuralı:** Alt katman üst katmanla çelişemez, sadece onu somutlaştırır. Örn. Apex'in "zero shadow" kuralı, İlke 5'teki "Dark Mode = Surface Lightness" ilkesinin brutalist bir yorumudur — çelişmez, uygular.

---

## Hızlı Uygulama Kontrol Listesi (Proje Fark Etmeksizin)

- [ ] Bu ekranda/görselde tek bir "en önemli şey" var mı? (Squint test)
- [ ] Kritik andaki seçenek sayısı minimumda mı?
- [ ] Her değer (renk, boşluk, font) bir token/skala'dan mı geliyor, yoksa göz kararı mı?
- [ ] Aynı tür eylemler projenin her yerinde aynı konumda mı?
- [ ] Herhangi bir bilgi sadece renkle mi iletiliyor? (İkon/metin desteği var mı?)
- [ ] Kontrast oranları WCAG AA'yı karşılıyor mu?
- [ ] Dark mode gölgeyle değil yüzey açıklığıyla mı kuruluyor?
- [ ] Yükleme/hata/çoklu-işlem durumları kullanıcıya dürüst bilgi veriyor mu?
- [ ] Bu özellik gerçekten kullanıcıya mı hizmet ediyor, yoksa sadece "meşgul görünme" hissi mi yaratıyor?

---

### Kaynak Sentezi
Bu döküman şu kaynakların üst-seviye sentezidir: `tasarim-ilkeleri-research.md` (foundations/token/component/retrofit süreci), `Product Design Research Report for Rosso` (Slow Technology, bilişsel/duygusal iyi oluş ilkeleri — genelleştirilmiş), `Master Design System Architecture (design.md)` (token mimarisi, ownership model, "on-" modifier), `mobile-design.md` ve `Universal Mobile UI/UX Principles` (dokunmatik ergonomi, mobil grid/tipografi), `web-design.md` (masaüstü grid, mouse/keyboard etkileşimi). Platforma özgü detaylar için ilgili kaynak dökümana, stile özgü detaylar için stil katmanı dökümanlarına bakılmalı.
