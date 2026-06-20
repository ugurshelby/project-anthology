# GLOBAL UI/UX & FRONTEND GUIDELINES FOR AI AGENTS (design.md)

> **AGENT DIRECTIVE:** Bu doküman, tüm UI/UX tasarımları ve frontend kod üretimleri için kesin kuralları içerir. Amacımız; "Halo Etkisi" ile ilk 50 milisaniyede lüks hissiyatı veren [1], beyaz boşluklarla bilişsel yükü sıfıra indiren [2], erişilebilir ve "Modern Endüstriyel Sofistike" veya "Premium Minimalist" estetiğe sahip arayüzler üretmektir. Ürettiğin her kod parçası ve tasarım kararı bu kurallara harfiyen uymak zorundadır.

## 1. GÖRSEL HİYERARŞİ VE ALAN YÖNETİMİ (Layout & Spacing)
Lüks ve premium hissiyat, öğeleri sıkıştırmaktan değil, boşlukları (whitespace) stratejik olarak kullanmaktan geçer [3].

*   **8-Nokta (8pt) Grid Sistemi:** Tüm padding, margin, yükseklik ve genişlik değerleri 8'in katları olmalıdır [4, 5]. İkonlar arası mesafe veya küçük metin boşlukları gibi çok ince ayarlar için yalnızca **4pt yarı-adım** kullanılabilir [4, 5].
*   **Kutu Boyutlandırma:** Frontend kodunda CSS `box-sizing: border-box` kuralını kesin olarak uygula [6]. Bu, border ve padding değerlerinin genişlik/yükseklik hesaplamasını bozmasını engeller [6].
*   **Bento Grid Düzeni:** Kart tabanlı arayüzlerde Japon bento kutularından ilham alan asimetrik ancak matematiksel olarak kusursuz "Bento Grid" yapısını kullan [7]. Öğeler arasında tutarlı boşluklar (gap: 12-24px) ve aynı oranda köşe radyusu (border-radius: 12-24px) belirle [8]. Sütun sayısını karmaşayı önlemek için en fazla 4-5 ile sınırla [8].

## 2. ERİŞİLEBİLİRLİK VE DOKUNMATİK HEDEFLER (Accessibility-First)
Erişilebilirlik bir seçenek değil, temel yasal ve etik bir zorunluluktur [9]. Tasarımlar herkes için çalışmalıdır [10].

*   **Minimum Dokunmatik Alan:** İnteraktif tüm öğeler (butonlar, ikonlar vb.) minimum **44x44pt (iOS)** veya **48x48dp (Android)** boyutunda olmalı, aralarında en az 8pt güvenli boşluk bırakılmalıdır [11, 12]. Kullanıcının fiziksel rahatlığı için öğelerin merkezleri arasında en az 60pt mesafe bulunmalıdır [13].
*   **Renk Kontrastı:** WCAG 2.1 standartlarına göre gövde metinleri arka planla en az **4.5:1**, büyük metinler ise **3:1** kontrast oranına sahip olmalıdır [10, 14]. Mümkünse APCA (Gelişmiş Algısal Kontrast Algoritması) standartlarını kullanarak, büyük UI etiketleri için Lc ~60, gövde metni için Lc ~75, ince/küçük metinler için Lc ~90 değerlerini hedefle [15]. 
*   **Sadece Renge Güvenme:** Hata veya başarı durumlarını (validation) yalnızca yeşil veya kırmızı renklerle değil, ikonlar ve destekleyici metinlerle de belirt [16, 17].

## 3. TİPOGRAFİ (Typography)
Tipografi arayüzün sesidir; estetik ve okunabilirlik arasında matematiksel bir uyum gerektirir [6].

*   **Satır Uzunluğu ve Yüksekliği:** Bir paragrafın genişliği okunabilirliği korumak için **maksimum 75 karakter** ile sınırlandırılmalıdır [18, 19]. Satır yüksekliği (line-height) font boyutuyla ters orantılı olmalıdır: Küçük metinler için geniş (1.5 - 1.6), büyük başlıklar için daha dar (1.1 - 1.2) satır yüksekliği kullan [19, 20].
*   **Buton Etiketleri:** Buton metinleri için standart gövde metni (body) stillerini kopyalama [19]. Butonlar, optik olarak tam merkeze oturtulmuş, amaca yönelik özel tipografi stilleri ve kilitli satır yükseklikleri gerektirir [19].
*   **Hiyerarşi:** Geleneksel grileştirme yerine, hiyerarşi kurarken ikonların ve daha az önemli metinlerin kontrastını arka planla aynı renk tonunu (hue) koruyarak düşür [21].

## 4. RENK VE KARANLIK MOD SİSTEMATİĞİ (Color & Dark Mode)
Renkler statik birer süsleme değil; kullanıcı davranışını yönlendiren psikolojik tetikleyicilerdir [22].

*   **60-30-10 Kuralı:** Tasarımlarda renk dağılımını %60 ana renk (nötr/arka plan), %30 marka rengi (ikincil) ve %10 vurgu (accent) rengi olacak şekilde kurgula [23].
*   **Hayalet Buton Yasağı:** Tasarımda tıklanabilirliği ve dönüşüm oranlarını öldürdüğü için sadece dış çizgiden ibaret (içi boş) "Ghost Button" (Hayalet Buton) kullanımından kesinlikle kaçın [24].
*   **Karanlık Mod (Dark Mode) Kuralları:** Aydınlık modu olduğu gibi tersine çevirme (invert etme) [25]. Göz yorgunluğunu (halation) engellemek için saf siyah arka plan üzerine aşırı doygun veya çok parlak beyaz metinler koymaktan kaçın; yumuşak gri, kırık beyaz (off-white) ve doygunluğu düşürülmüş tonlar kullan [25].

## 5. KULLANICI DENEYİMİ VE FORMLAR (Form UX & Interaction)
Bir arayüzde etkileşim maliyeti (interaction cost) ne kadar düşükse, dönüşüm o kadar yüksektir [26, 27].

*   **Alanları Minimize Et:** Sadece zorunlu bilgileri iste. Eğer isteğe bağlı bir alan varsa, yıldız (*) yerine açıkça "İsteğe Bağlı" (Optional) olarak etiketle [28]. Ad ve soyad gibi bilgileri bölmek yerine "Tam Ad" şeklinde tek bir alanda topla [29].
*   **Dropdown Kullanımından Kaçın:** Mobil ve modern web tasarımlarında seçili öğeler 5'ten az ise asla açılır menü (dropdown) kullanma; bunun yerine tek dokunuşla seçilebilen radyo butonları veya segmentli kontroller kullan [30].
*   **Etiket ve Hata Yönetimi:** Etiketleri her zaman form alanının üzerine (top-align) yerleştir [31]. Hataları ekranın en üstünde değil, doğrudan ilgili form alanının altında (inline) göster [32]. Hata mesajlarında asla kullanıcıyı suçlayıcı ifadeler kullanma (örn: "Yanlış numara girdiniz" yerine "Bu numara hatalı" gibi nötr ifadeler seç) [33].

## 6. YAPAY ZEKA VE AJAN (AGENTIC) ARAYÜZ PATTERNLERİ
Eğer projede yapay zeka özellikleri (AI özellikleri) varsa, kullanıcıda güven oluşturmak için şu UI standartlarını uygula [34, 35]:

*   **Tevazu Prensibi (Deference Principle):** Yapay zekanın ürettiği öneriler, kullanıcının ana içeriğini asla gasp etmemelidir [36]. AI çıktılarını görsel hiyerarşide bir kademe alta yerleştir (örneğin; dokunarak genişletilebilen ince bir özet kutusu) [37].
*   **Süreç Belirteçleri (Shimmer/Glow):** Yapay zeka aktif olarak çalışırken (işlem sürerken), o bileşenin etrafında animasyonlu bir parlama (shimmer) veya renkli bir çerçeve döndür [38, 39]. İşlem bittiğinde bu animasyonu kesinlikle durdur; durağan, kalıcı bir animasyon bırakmak kullanıcı güvenini zedeler [40, 41].
*   **Kaynak Bildirimi (Source Attribution):** AI'ın ürettiği bir metin veya sonuç varsa, bu verinin nereden alındığını veya "Yapay Zeka Tarafından Üretildiğini" ufak bir ikon/etiket ile daima belirt [36, 42].
*   **Kontrol ve İptal (Undo):** AI ajanının yaptığı işlemler için her zaman net bir "Geri Al" (Undo) ve "Önizleme" (Impact Preview) seçeneği sun [43, 44].

## 7. FRONTEND KODLAMA VE MİMARİ STANDARTLAR
*   **Bileşen (Component) Mimarisi:** Modern, ölçeklenebilir frontend yapıları için React, Tailwind CSS ve shadcn/ui ekosistemini standart olarak kabul et [45, 46].
*   **Performans:** Görsel animasyonları ve 3D efektleri (Liquid Glass, mikro etkileşimler) yalnızca kullanıcıya "amaçlı bir geri bildirim" sağlamak (Peak-End Rule) için kullan [47, 48]. Sistemi yavaşlatan aşırı karmaşık ve anlamsız animasyonlardan kaçın; sayfa performansını tasarım sürecinin çekirdek bir parçası olarak değerlendir [49-51].