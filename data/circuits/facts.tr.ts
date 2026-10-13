/**
 * Turkish editorial text for the circuit facts in facts.ts (same keys).
 * Only the prose fields; numbers, lap records and coordinates stay in facts.ts.
 */

export interface CircuitFactsTr {
  character?: string;
  signatureCorner?: string;
  note?: string;
}

export const CIRCUIT_FACTS_TR: Record<string, CircuitFactsTr> = {
  albert_park: {
    character: 'Yarı Sokak · Düşük İlk Tutuş · Hızlı Evrim',
    signatureCorner: '9–10. Viraj Süpürmesi (245 km/s · 4.2G)',
    note: 'Halka açık park gölü etrafında kurulan ve hafta sonu başında kauçuk birikimi sıfıra yakın yarı sokak pisti. Clark şikanının kaldırılmasıyla 2. ve 3. sektörler 320 km/s üzeri tam gaz koridoruna dönüştü; 9–10. viraj geçişindeki yüksek yanal G yükü, 11. virajdaki sert frenaj öncesi lastik karkasını tepe noktasına zorlar.',
  },
  bahrain: {
    character: 'Sert Boylamsal Frenaj · Aşındırıcı Granit',
    signatureCorner: '1. Viraj Firketesi & 10. Viraj Dış Eğim',
    note: 'Aşındırıcı kaba granit agrega ve çölden uçuşan ince kum tabakası. 330 km/s\'den 65 km/s\'ye inilen 1. viraj dahil dört devasa yavaşlama koridoru karbon disk sıcaklıklarını tırmandırırken, inişli ve dışa eğimli 10. viraj yükü boşalan sol ön lastiği kilitlenmeye iter.',
  },
  jeddah: {
    character: 'Kör Yüksek Hızlı Sokak · Aşırı Yanal Enerji',
    signatureCorner: '22–23. Viraj Duvar Koridoru (250 km/s)',
    note: 'Beton duvarlar ve SAFER bariyerleri arasında 250 km/s üzeri ortalama tur hızı. Sürekli kör beşinci ve altıncı vites kavisleri, kusursuz aerodinamik taban sızdırmazlığı ve sert süspansiyon ayarı ister; milimetrik bir direksiyon düzeltmesinin bile kaçış alanı yoktur.',
  },
  shanghai: {
    character: 'Ön Lastik Sınırlı · Kapanan Yarıçap · 1.2km Düzlük',
    signatureCorner: '1–2. Viraj Salyangoz Kompleksi & 13. Viraj Eğimi',
    note: '270 derecelik daralan spiral açılış, sol ön lastiği saniyeler boyunca kesintisiz yanal yüke maruz bırakarak termal tanelenmeye yol açar; ardından gelen 1.2 kilometrelik arka düzlükte araçlar 340 km/s hıza ulaşıp 14. virajda 6G yavaşlama üretir.',
  },
  suzuka: {
    character: 'Sekiz Figürü · Aerodinamik Mihenk Taşı · Aşırı Yanal G',
    signatureCorner: '1. Sektör Esses & 130R (305 km/s tam gaz)',
    note: 'Yüksek yere basma kuvveti ve aerodinamik verimliliğin küresel ölçütü. Esses bölümündeki aralıksız yokuş yukarı yön değişimleri ön aks zayıflığını anında cezalandırırken, 305 km/s ile dönülen 130R sol virajı 4.5G\'yi aşan kesintisiz yanal yük üretir.',
  },
  miami: {
    character: 'Düşük Sürtünmeli Düzlükler · Otoyol Altı Teknik Şikan',
    signatureCorner: '14–15. Viraj Bordür Şikanı',
    note: 'Çelişkili bir ayar dengesi: Çevre otoyol düzlüklerinde 340 km/s son sürat için düşük kanat profili zorunludur; ancak üst geçit altındaki tümsekli yavaş şikan, sert süspansiyon yaylarını cezalandırır ve mekanik esneklik gerektirir.',
  },
  imola: {
    character: 'Geleneksel Dalgalanma · Bordür Sürüşü · Saat Yönü Tersi',
    signatureCorner: 'Acque Minerali & Piratella İnişi',
    note: 'Sivri bordürler ve kör tepelerle dolu, saat yönünün tersine dönen park pisti. Acque Minerali\'deki şasi dengesi, taban venturi tünellerinin akışını bozmadan bordürleri ezmeyi gerektirir; pist pozisyonu geçiş fırsatlarının katbekat önündedir.',
  },
  monaco: {
    character: 'Maksimum Mekanik Tutuş · Maksimum Direksiyon Açısı',
    signatureCorner: 'Fairmont Firketesi (45 km/s) & Tünel Çıkışı (285 km/s)',
    note: 'Maksimum kanat açıları, yumuşatılmış viraj demirleri ve 45 km/s Fairmont firketesi için özel direksiyon geometrisi. Karanlık tünelden tam gaz çıkış, Nouvelle şikanının kör iniş frenajına bağlanır; tekerlek somunları çelik armco bariyerlerini sıyırır.',
  },
  villeneuve: {
    character: 'Dur-Kalk · Yüksek Fren Yükü · Düşük Yere Basma',
    signatureCorner: 'Şampiyonlar Duvarı (13–14. Viraj Çıkışı)',
    note: 'Kaliperler üzerinde şiddetli boylamsal yük oluşturan frenaj bölgeleri ve soğuma sağlayan uzun düzlükler. Son şikanın yüksek bordürlerinden fırlayan araçlar, 200 km/s hızla Şampiyonlar Duvarı\'na santimetreler mesafede teğet geçer.',
  },
  catalunya: {
    character: 'Aerodinamik Turnusol · Yüksek Karkas Kayma Kuvveti',
    signatureCorner: '3. Viraj Uzun Yüklü Sağ Kavis',
    note: 'Gerçek dünyanın nihai aerodinamik test laboratuvarı. 3. virajdaki uzun süreli yüksek G kuvveti sol ön lastik yanağını ezer; gerçek zemin etkili taban yere basma gücünü, düzlükte hava direncine takılan yapay kanat paketlerinden anında ayırır.',
  },
  red_bull_ring: {
    character: 'Kısa Tur Sprinti · 65m Tırmanış · Ağır Bordür Darbesi',
    signatureCorner: '3. Viraj Tepe Frenajı & 9–10. Viraj İnişi',
    note: '65 saniyenin altındaki dağ sprintinde dik tırmanışları bitiren üç ağır frenleme cebi bulunur. Son iki virajdaki sert bordür darbeleri karbon süspansiyon kollarını hırpalarken, 650 metre irtifa incelen havada turboları daha yüksek devirde dönmeye zorlar.',
  },
  silverstone: {
    character: 'Yüksek Yere Basma Tapınağı · Yanal G Zirveleri · Rüzgâr Hassasiyeti',
    signatureCorner: 'Maggotts–Becketts–Chapel Kompleksi (290 km/s · 5.1G)',
    note: 'Eski hava üssünden esen soğuk poyraz ve aşındırıcı asfalt bileşimi lastik karkasına muazzam kayma kuvveti uygular. 290 km/s ile dönülen Maggotts-Becketts-Chapel yön değişimleri kesintisiz 5G üreterek kusursuz taban sızdırmazlığı şart koşar.',
  },
  hungaroring: {
    character: 'Monaco Tipi Aero · Aralıksız Direksiyon Açısı · Termal Kapan',
    signatureCorner: '4. Viraj Kör İniş Sol & 11. Viraj Süpürmesi',
    note: 'Kavurucu yaz sıcağında maksimum kanat açıları. Diskleri veya lastik sırtını soğutacak uzun düzlük olmaması yüzünden kesintisiz direksiyon girdileri yüzey sıcaklığını fırlatır; sıralama turlarındaki temiz hava ve pist pozisyonu yarışı belirler.',
  },
  spa: {
    character: '102m İrtifa · Değişken Mikroiklim · Kanat Açısı Tavizi',
    signatureCorner: 'Eau Rouge–Raidillon Sıkışması (1.7G Dikey Yük)',
    note: 'Ardennes ormanında 7.004 kilometrelik parkurda 102 metrelik kot farkı. Eau Rouge tabanındaki dikey 1.7G sıkışma şasi tabanını asfalta ezer; takımları 2. sektördeki yüksek yere basma ihtiyacı ile Kemmel düzlüğündeki son sürat arasında acımasız bir kanat tavizine zorlar.',
  },
  zandvoort: {
    character: '19 Derece Eğim · Kumul Tepeleri · Sahil Kumu',
    signatureCorner: '3. Viraj Hugenholtz & 14. Viraj Luyendyk Eğimleri',
    note: 'Hugenholtz ve Luyendyk virajlarındaki 19 derecelik dik eğim araçları ve lastik karkaslarını asfalta yapıştırarak yan yana yarış çizgileri açar; Kuzey Denizi rüzgârları yarış çizgisine kesintisiz ince kum taşır.',
  },
  monza: {
    character: 'Minimum Sürtünme Paketi · %75 Tam Gaz · 350+ km/s',
    signatureCorner: 'Prima Variante Frenajı (350 → 70 km/s) & Curva Grande',
    note: 'Tıraşlanmış arka kanat flapları ve minimum sürtünmeli gövde paketiyle 350 km/s üzeri düzlük hızları. Turun %75\'inin tam gaz geçilmesi içten yanmalı motor dayanıklılığını sınarken, şikan bordürlerindeki sert zıplamalar zemin etkili venturi tabanlarını tehdit eder.',
  },
  baku: {
    character: 'Aerodinamik Çelişki · 2.2km Tam Gaz · Ortaçağ Darboğazı',
    signatureCorner: '8. Viraj Kale Geçişi (7.6m genişlik) & 1. Viraj Frenajı',
    note: 'Modern yarışın en büyük aerodinamik zıtlığı. Takımlar Hazar bulvarındaki 350 km/s sürat için kanatları inceltmek, ancak aynı zamanda 2 metre genişliğindeki aracı 8. virajın 7.6 metrelik ortaçağ kale darboğazından geçirecek mekanik ön tutuşu korumak zorundadır.',
  },
  marina_bay: {
    character: 'Tropikal Gece Nemi · Tur Başına 60+ Vites · Yüksek Termal Yük',
    signatureCorner: '1–3. Viraj Kombinasyonu & Yenilenen Körfez Sektörü',
    note: 'Kokpitte 50°C\'yi aşan sıcaklık ve %80 nem oranı. Dalgın cadde asfaltında tur başına 60\'ı aşkın vites değişimi pilotun dayanıklılığını tüketirken, ikinci vites çekiş çıkışları arka lastik karkas sıcaklıklarını optimum pencerenin dışına fırlatır.',
  },
  americas: {
    character: '41m Tepe Tırmanışı · Hızlı Yön Değişimi · Tümsekli Zemin',
    signatureCorner: '1. Viraj Kör Tırmanış Firketesi & 1. Sektör Esses',
    note: '1. virajdaki 41 metrelik dik tırmanış ve kör firkete girişte fren hissini sınar. Becketts ritmini taşıyan 1. sektör S virajları, tümsekli zemin üzerinde 4.5G\'lik yanal salınımlar üreterek sert taban ayarlarını cezalandırır.',
  },
  rodriguez: {
    character: '2.285m Rakım · %25 Seyrelmiş Hava · Maksimum Kanat, Monza Hızı',
    signatureCorner: 'Foro Sol Stadyum Arenası & 1. Viraj Frenajı',
    note: 'Deniz seviyesinden 2.285 metre yükseklikte hava yoğunluğu %25 düşer. Araçlar Monaco boyutunda kanatlarla piste çıkmasına rağmen hava direnci azlığı sayesinde 350 km/s üzeri Monza hızlarına ulaşır; güç üniteleri ve fren kaliperleri soğutucu hava kütlesi bulmakta zorlanır.',
  },
  interlagos: {
    character: 'Doğal Amfitiyatro · Ani Kot Farkları · Hava Durumu Kavşağı',
    signatureCorner: 'Senna S İniş Eğimi (1–2. Viraj) & Junção',
    note: '780 metre rakımda yer alan doğal amfitiyatro. Senna S virajındaki eğimli yokuş aşağı iniş ön aks tutuşunu ve sürücü dengesini sınarken, Junção\'dan ana düzlüğe tırmanan uzun tam gaz rampası motorları incelen havada nefessiz bırakır.',
  },
  vegas: {
    character: '15°C Altı Gece Soğuğu · 1.9km Strip Düzlüğü · Düşük Yüzey Pürüzlülüğü',
    signatureCorner: '350 km/s Strip Sonrası 14. Viraj Sert Frenajı',
    note: 'Gece yarısı 15°C\'nin altına düşen pist sıcaklığı ve pürüzsüz cadde asfaltı lastik ısıtmayı krize dönüştürür. 1.9 kilometrelik Strip düzlüğü lastik yüzey sıcaklığını emer; bu da 14. virajdaki sert frenajda ön tekerleklerin kilitlenmesine ve tanelenmeye yol açar.',
  },
  losail: {
    character: 'Aralıksız Hızlı Kavisler · Piramit Bordür Yorulması · Yanal Yük',
    signatureCorner: '12–14. Viraj Üçlü Tepe Yüksek G Süpürmesi',
    note: 'Frenaj dinlenmesi vermeyen aralıksız orta ve yüksek hızlı kavisler pilotları 4G üzeri yanal yüke maruz bırakır. 50 milimetrelik agresif piramit bordürler lastik karkasına şiddetli yapısal titreşim ileterek yanak yorulmasını zirveye taşır.',
  },
  yas_marina: {
    character: 'Gündüzden Geceye Termal Değişim · Çekiş İhtiyacı · Yenilenen Akış',
    signatureCorner: '5. Viraj Firketesi & 9. Viraj Eğimli Kavis',
    note: 'Pist yüzey sıcaklığının yarış boyunca 10°C\'ye kadar düştüğü alacakaranlık yarışı şasi dengesini arkadan kaymaya doğru kaydırır. 2. sektördeki akıcı kavisler, mekanik arka çekişi ödüllendiren yavaş otel virajlarına bağlanır.',
  },
  madring: {
    character: 'Melez Şehir Pisti · Dik Eğimli Viraj · Düşük G Teknik Bağlantılar',
    signatureCorner: 'Eğimli 4. Viraj & Valdebebas Kompleksi',
    note: 'IFEMA fuar alanları ile otoyol bağlantılarını birleştiren melez pist. Dik eğimli 4. viraj ve Valdebebas teknik döngüsündeki sert yavaşlama cepleri, yüksek aerodinamik yük altında süspansiyon sönümlemesini ve mekanik çekişi sınar.',
  },
  sepang: {
    character: 'Geniş Pist Ekseni · İkiz 1km Düzlük · Ekvatoral Nem',
    signatureCorner: '5–6. Viraj Yüksek G Kavisleri & 14. Viraj Firketesi',
    note: 'Geniş pist eni ve dar bir firkete ile birbirine bağlanan iki adet 1 kilometrelik düzlük. Tropikal nem radyatörleri termal sınırlarına iterken, 5–6. virajlardaki hızlı yön değişimleri sol ön lastik bileşimine ağır yanal yük bindirir.',
  },
};
