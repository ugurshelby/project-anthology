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
    character: 'Yarı sokak · Başta düşük tutuş · Hızlı gelişen pist',
    signatureCorner: '9–10. viraj kavisi',
    note: 'Albert Park Gölü çevresindeki kamu yolları; hafta sonu boyunca lastik izi birikene dek kaygan. 2022 düzenlemesi yavaş bir şikanı kaldırıp turun arka bölümünü uzun bir tam gaz koşusuna çevirdi; hızlı 9–10. viraj kavisine artık çok daha yüksek hızla gelinir.',
  },
  bahrain: {
    character: 'Sert frenaj · Aşındırıcı zemin · Arka çekiş',
    signatureCorner: '1. viraj firketesi ve 10. viraj',
    note: 'Aşındırıcı asfalt ve rüzgârın taşıdığı çöl kumu arka lastikleri hızla yıpratır. 1. viraj başta olmak üzere dört sert frenaj fren sıcaklıklarını yükseltir; yokuş aşağı sola dönen 10. viraj, yükü boşalan sol ön lastiğin kilitlendiği klasik noktadır.',
  },
  jeddah: {
    character: 'Hızlı sokak pisti · Kör virajlar · Her yanda duvar',
    signatureCorner: '22–23. virajlar',
    note: 'Formula 1’in en hızlı sokak pisti: beton duvarlar arasında, kaçış alanı neredeyse olmayan, beşinci ve altıncı viteste kör kıvrımlar zinciri. Araç yüksek hızda dengeli olmalı; küçük bir düzeltme kolayca duvara dönüşür.',
  },
  shanghai: {
    character: 'Ön lastik sınırlı · Daralan virajlar · 1,2 km arka düzlük',
    signatureCorner: '1–2. viraj sarmalı',
    note: 'Açılıştaki sarmal giderek daralır, sol ön lastiği saniyelerce yükler ve tanelenmeye davet eder. Yaklaşık 1,2 km’lik arka düzlük, turun en sert frenajıyla 14. viraj firketesinde biter.',
  },
  suzuka: {
    character: 'Sekiz biçimi · Aerodinamik ölçüt · Hızlı yön değişimi',
    signatureCorner: 'S virajları ve 130R',
    note: 'Yüksek yere basma kuvvetli bir aracın ölçütü. Yokuş yukarı S virajları art arda yön değişimleriyle tembel bir ön ucu hemen ele verir; hızlı sol 130R çok yüksek hızda cesaret ve dengeli bir platform ister.',
  },
  miami: {
    character: 'Düşük sürtünme · Uzun düzlükler · Yavaş, tümsekli şikan',
    signatureCorner: '14–15. viraj şikanı',
    note: 'Bir ayar uzlaşması: uzun düzlükler için düşük kanat, ama dar 14–15. viraj şikanı yavaş ve tümseklidir, sert bir aracı cezalandırır. Takımlar son sürat ile süspansiyon esnekliği arasında seçim yapar.',
  },
  imola: {
    character: 'Eski usul · Bordür sürüşü · Saat yönünün tersi',
    signatureCorner: 'Acque Minerali ve Piratella',
    note: 'Parkın içinden, saat yönünün tersine, sert bordürler ve kör tepelerle akan bir tur. Acque Minerali tabanı bozmadan bordürü kullanabilen bir araç ister; geçiş alanı az olduğu için pist pozisyonu yarış temposundan daha değerlidir.',
  },
  monaco: {
    character: 'En yüksek yere basma · En geniş direksiyon açısı · Bariyerler dibinde',
    signatureCorner: 'Fairmont firketesi ve tünel',
    note: 'Formula 1’in en yavaş virajı Fairmont firketesi için en yüksek kanat, yumuşak ayar ve özel direksiyon geometrisi. Tur, tam gaz tünelden doğrudan Nouvelle şikanının frenajına iner; bariyerler tur boyunca birkaç santim ötededir.',
  },
  villeneuve: {
    character: 'Dur-kalk · Frenlere ağır · Düşük yere basma',
    signatureCorner: 'Şampiyonlar Duvarı (son şikan)',
    note: 'Uzun düzlüklerin sonundaki sert frenajlar burayı yılın frenlere en ağır pistlerinden biri yapar. Pilotlar son şikanda bordürü yoğun kullanır; çıkışta sağ tekerlekler Şampiyonlar Duvarı’na santimler kalır.',
  },
  catalunya: {
    character: 'Aerodinamik ölçüt · Yüksek lastik yükü',
    signatureCorner: '3. viraj uzun sağ',
    note: 'Her takımın ezbere bildiği test pisti. 3. virajdaki uzun, yüklü sağ dönüş sol ön lastiğe yaslanır ve bir aracın yere basma kuvvetinin gerçek olup olmadığını hemen gösterir.',
  },
  red_bull_ring: {
    character: 'Kısa tur · Dik tırmanışlar · Bordür darbeleri',
    signatureCorner: '3. viraj tırmanışı ve 9–10. virajlar',
    note: 'Yılın en kısa turlarından biri, yaklaşık 65 saniye. Üç sert frenaj yokuş yukarı koşuların sonunda gelir; son iki virajın bordürleri süspansiyonu hırpalar; deniz seviyesinden 700 metreye yakın yükseklikteki ince hava yere basma kuvvetinden ve soğutmadan çalar.',
  },
  silverstone: {
    character: 'Yüksek hız · Yüksek yanal yük · Rüzgâra duyarlı',
    signatureCorner: 'Maggotts–Becketts–Chapel',
    note: 'Rüzgâra açık eski bir hava üssü, aşındırıcı bir zemin. Maggotts–Becketts–Chapel dizisi yüksek hızda yön değiştirmenin en büyük sınavlarından biridir; dengeli bir taban ve keskin bir ön uç ister.',
  },
  hungaroring: {
    character: 'Monaco tipi yere basma · Sürekli direksiyon · Yaz sıcağı',
    signatureCorner: '4. viraj kör sol ve 11. viraj',
    note: 'Yaz ortası sıcağında en yüksek yere basma kuvveti. Frenleri ve lastikleri soğutacak düzlük neredeyse yok, direksiyon hep dönük; sıcaklıklar tırmanır. Yarışların çoğunu sıralama pozisyonu ve temiz hava belirler.',
  },
  spa: {
    character: 'Büyük kot farkı · Değişken hava · Kanat uzlaşması',
    signatureCorner: 'Eau Rouge–Raidillon',
    note: 'Takvimin en uzun turu: Ardennes ormanında 7,004 km, yaklaşık 100 metre kot farkı. Eau Rouge’un dibindeki sıkışma aracı piste bastırır, ardından kör bir tepe gelir; takımlar virajlı orta sektör için yere basma kuvvetini Kemmel düzlüğündeki hızla takas etmek zorundadır.',
  },
  zandvoort: {
    character: 'Eğimli virajlar · Kumullar · Pistte kum',
    signatureCorner: '3. viraj (Hugenholtz) ve 14. viraj (Luyendyk)',
    note: '3. viraj (19 derece) ve son viraj olan 14. viraj (18 derece) eğimlidir; bu, kumulların arasındaki dar, eski usul pistte pilotların birden fazla çizgi denemesine izin verir. Deniz rüzgârı piste kum taşır.',
  },
  monza: {
    character: 'En düşük sürtünme · Çoğunlukla tam gaz · Son sürat',
    signatureCorner: 'Prima Variante ve Curva Grande',
    note: 'Takımlar 350 km/sa civarındaki düzlük hızları için en ince kanatlarını getirir; turun yaklaşık dörtte üçü tam gaz geçer. Şikanlara sert frenaj ve yoğun bordür kullanımı tabanı ve frenleri sınar.',
  },
  baku: {
    character: 'Düşük sürtünme ve dar virajlar · 2,2 km tam gaz · Kale bölümü',
    signatureCorner: '8. viraj kale bölümü',
    note: 'Sokak pistleri arasında en geniş hız aralığı. Takımlar sahil boyunca yaklaşık 2,2 km’lik tam gaz koşu için kanatları inceltir, ama 8. virajdaki yaklaşık 7,6 metre genişliğindeki eski şehir kale bölümünden aracı geçirecek tutuşa da ihtiyaç duyar.',
  },
  marina_bay: {
    character: 'Gece yarışı · Sıcak ve nem · Tümsekli sokaklar',
    signatureCorner: '1–3. virajlar',
    note: 'Fiziksel olarak çok zorlu bir gece yarışı: uzun, tümsekli bir sokak turunda sıcak, nem ve aralıksız vites değişimi. Çok sayıdaki yavaş çıkış arka lastikleri yükler ve çalışma aralığının dışına iter.',
  },
  americas: {
    character: '1. virajda dik tırmanış · Hızlı S virajları · Tümsekli zemin',
    signatureCorner: '1. viraj ve 1. sektör S virajları',
    note: 'Yaklaşık 41 metrelik tırmanış, frenaj noktasını kestirmenin zor olduğu kör ve geniş 1. viraja çıkar. Birinci sektörün S virajları Silverstone’daki Maggotts–Becketts’ten esinlenmiştir; tümsekli zemin çok alçak ayarlanmış aracı cezalandırır.',
  },
  rodriguez: {
    character: '2.285 m rakım · İnce hava · Yüksek son sürat',
    signatureCorner: 'Stadyum bölümü ve 1. viraj',
    note: 'Deniz seviyesinden 2.285 metre yükseklikte hava yaklaşık beşte bir daha incedir. Takımlar en yüksek kanatla çıkar ama yine de yılın en yüksek son süratlerinden bazılarına ulaşır; motorlar, turbolar ve frenler soğumakta zorlanır.',
  },
  interlagos: {
    character: 'Saat yönünün tersi · Doğal çanak · Değişken hava',
    signatureCorner: 'Senna S ve Junção',
    note: 'Deniz seviyesinden yaklaşık 780 metre yükseklikte, doğal bir çanağın içinde saat yönünün tersine bir tur. Yokuş aşağı Senna S ön tutuşu ve dengeyi sınar; Junção’dan çizgiye uzanan uzun tırmanış iyi bir çıkışı ödüllendirir.',
  },
  vegas: {
    character: 'Soğuk gece · 1,9 km Strip düzlüğü · Pürüzsüz zemin',
    signatureCorner: 'Strip’in sonunda 14. viraj',
    note: 'Pürüzsüz cadde asfaltında soğuk bir gece yarışı; asıl sorun lastikleri ısıtmak. 1,9 km’lik Strip boyunca lastikler daha da soğur; ön tekerlek kilitlenmesi ve tanelenme 14. virajdaki frenajda başlar.',
  },
  losail: {
    character: 'Hızlı kavisler · Yüksek yanal yük · Bordürler',
    signatureCorner: '12–14. virajlar',
    note: 'Aralarında neredeyse hiç frenaj olmayan orta ve yüksek hızlı kavisler; pilotlar turun neredeyse tamamında yanal yük taşır. Bordür darbeleri burada lastiklere zarar verdi; Pirelli bu yarışta stint uzunluğu sınırı koydu.',
  },
  yas_marina: {
    character: 'Gündüzden geceye · Çekiş · 2021’de yenilendi',
    signatureCorner: '5. viraj firketesi ve 9. viraj',
    note: 'Alacakaranlık yarışı: güneş batarken pist soğur ve araç dengesi yarış boyunca değişir. 2021 değişiklikleri turun ortasını hızlandırdı; sondaki yavaş otel bölümü ise hâlâ çekişi ödüllendirir.',
  },
  madring: {
    character: 'Sokak ve kalıcı pist karışımı · Eğimli viraj · Teknik',
    signatureCorner: 'Eğimli viraj ve yavaş teknik bölüm',
    note: 'Madrid’deki IFEMA fuar alanı çevresinde, kamu yollarını kalıcı bölümlerle birleştiren yeni bir pist. Eğimli virajı ve art arda gelen yavaş, teknik dönüşleri yük altında denge ve iyi çekiş ister.',
  },
  sepang: {
    character: 'Çok geniş pist · İki uzun düzlük · Sıcak ve nem',
    signatureCorner: '5–6. virajlar',
    note: 'Yavaş bir firketeyle birbirine bağlanan iki uzun düzlüğe sahip çok geniş bir pist. Sıcak ve nem soğutmayı sınıra iter; 5–6. virajlardaki hızlı yön değişimleri sol ön lastiğe ağır yük bindirir.',
  },
};
