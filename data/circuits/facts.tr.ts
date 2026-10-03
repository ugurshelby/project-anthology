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
    character: 'Yarı sokak pisti, akıcı ve hızlı',
    signatureCorner: '9–10. viraj süpürmesi',
    note: 'Park içinden geçen bu sokak-kalıcı pist 2022\'de yeniden asfaltlandı ve şikanını kaybetti; takvimin en hızlı turlarından birine dönüştü.',
  },
  bahrain: {
    character: 'Sert frenleme, çekiş',
    signatureCorner: '1. viraj firketesi',
    note: 'Çölün ortasındaki bu pistte yavaş virajlara sert fren yapılır; fren soğutması ve firketelerden çıkıştaki arka çekiş yarışı belirler.',
  },
  jeddah: {
    character: 'Yüksek hızlı sokak pisti',
    signatureCorner: '22–23. viraj duvarları',
    note: 'F1\'in en hızlı sokak pisti: beton duvarlar arasında körlemesine, gazdan çekilmeden geçilen kırılmalar neredeyse hiç pay bırakmaz.',
  },
  shanghai: {
    character: 'Uzun virajlar, uzun düzlük',
    signatureCorner: '1–2. viraj spirali',
    note: 'Salyangoz kabuğunu andıran açılış kompleksi sürekli daralır ve takvimin en uzun düzlüklerinden birine çıkar.',
  },
  suzuka: {
    character: 'Akıcı, tam teslimiyet isteyen pist',
    signatureCorner: '130R / Esses',
    note: 'Sekiz şeklindeki bu klasikte Esses ve 130R, ham güçten çok ritmi ve aerodinamik dengeyi ödüllendirir.',
  },
  miami: {
    character: 'Karma sokak pisti, üç sektör',
    signatureCorner: '13–16. viraj şikanı',
    note: 'Hızlı açılış ve kapanış sektörleri, sert araçları cezalandıran yavaş ve teknik bir orta bölümü arasına alır.',
  },
  imola: {
    character: 'Eski usul, kerb ağırlıklı',
    signatureCorner: 'Acque Minerali',
    note: 'Saat yönünün tersine dönen, dar ve nostaljik bir pist: sollama zordur, sıralama pozisyonu altın değerindedir.',
  },
  monaco: {
    character: 'En yavaş ve en dar sokak pisti',
    signatureCorner: 'Casino / Fairmont firketesi',
    note: 'Mutlak sıralama turu pisti: bariyerler birkaç santim ötede, F1\'in en dar virajı burada ve sollamaya neredeyse yer yok.',
  },
  villeneuve: {
    character: 'Dur-kalk, düşük tutuş',
    signatureCorner: 'Şampiyonlar Duvarı',
    note: 'Düşük tutuşlu zeminde uzun düzlükler ve sert frenleme bölgeleri var; son şikanın duvarı dünya şampiyonlarını bile yakaladı.',
  },
  catalunya: {
    character: 'Aerodinamik ölçüt pisti',
    signatureCorner: '3. viraj, uzun sağ',
    note: 'Her takım burayı avucunun içi gibi bilir: hızlı ve yavaş virajların dengeli karışımı, aerodinamik zayıflığı saklamaz.',
  },
  red_bull_ring: {
    character: 'Kısa ve güç isteyen pist',
    signatureCorner: '3. viraj yokuşu',
    note: 'Süre olarak yılın en kısa turu: üç büyük tırmanış ve sert frenleme, güç ünitelerini ve frenleri zorlar.',
  },
  silverstone: {
    character: 'Hızlı, yüksek enerjili',
    signatureCorner: 'Maggotts–Becketts',
    note: 'Dünya Şampiyonası\'nın ilk mekânı. Maggotts–Becketts–Chapel kompleksi, yüksek hızda yön değiştirmenin en büyük sınavlarından biridir.',
  },
  hungaroring: {
    character: 'Dolambaçlı, "duvarsız Monako"',
    signatureCorner: '4. viraj, inişli sol',
    note: 'Düzlüğü neredeyse olmayan sıkı ve ritmik bir tur: saf hızdan çok yere basma kuvveti ve pist pozisyonu belirleyicidir.',
  },
  spa: {
    character: 'En uzun, hızlı ve havası değişken pist',
    signatureCorner: 'Eau Rouge / Raidillon',
    note: 'Ardennes ormanından geçen takvimin en uzun turu. Eau Rouge–Raidillon\'u gazdan çekmeden geçmek bir geçit törenidir; yerel hava pisti ikiye bölebilir.',
  },
  zandvoort: {
    character: 'Eğimli, kum tepeleri arasında eski usul',
    signatureCorner: 'Eğimli 3. ve 14. viraj',
    note: 'Dik eğimli virajlar araçların yüksek hız taşımasına ve yan yana gitmesine izin verir; dar bir sahil şeridinde nostaljik bir his.',
  },
  monza: {
    character: 'Hızın Tapınağı',
    signatureCorner: 'Parabolica',
    note: 'Yılın en düşük yere basma kuvvetli pisti: uzun düzlükler ve şikanlar, Parabolica\'ya girerken maksimum hız ve lastik dibi mücadelesi demek.',
  },
  baku: {
    character: 'Sokak pisti, en uzun düzlük',
    signatureCorner: 'Kale bölümü',
    note: '2,2 km\'lik bir düzlüğe, ortaçağdan kalma dar bir kale bölümü eklenmiş: hiçbir sokak pistinde hız aralığı bu kadar geniş değil.',
  },
  marina_bay: {
    character: 'Sıcak, tümsekli gece pisti',
    signatureCorner: '1–3. viraj kompleksi',
    note: 'Fiziksel olarak çok yıpratıcı bir gece yarışı: nem, tümsekler ve uzun turdaki duvarlar yılın en zorlarından biri yapar.',
  },
  americas: {
    character: 'Karma, Tilke\'nin amiral gemisi',
    signatureCorner: 'Esses (3–6. viraj)',
    note: 'Eski pistlerin büyük virajlarını ödünç alan modern bir tasarım: yokuş yukarı 1. viraj ve Silverstone tarzı Esses öne çıkar.',
  },
  rodriguez: {
    character: 'Yüksek rakım, ince hava',
    signatureCorner: 'Stadyum / Foro Sol',
    note: '2.200 metrede ince hava yere basma kuvvetini ve soğutmayı kırpar; stadyum bölümü turu dolu bir beyzbol arenasından geçirir.',
  },
  interlagos: {
    character: 'Kısa, saat yönünün tersine, inişli çıkışlı',
    signatureCorner: 'Senna S',
    note: 'Kısa turu, büyük kot farkı ve öngörülemeyen havasıyla sık sık dram üreten, saat yönünün tersine dönen kompakt bir hız treni.',
  },
  vegas: {
    character: 'Soğuk, hızlı Strip sokak pisti',
    signatureCorner: 'Strip düzlüğü',
    note: 'Las Vegas Strip boyunca uzanan uzun ve düşük tutuşlu bir gece sokak pisti; soğuk pist sıcaklığında lastiği ısıtmak asıl mesele.',
  },
  losail: {
    character: 'Akıcı, orta-hızlı',
    signatureCorner: '12–14. viraj süpürmeleri',
    note: 'Eski bir MotoGP pisti: sabit yarıçaplı hızlı süpürmeler, uzun ve pürüzsüz bir turda ön lastikleri ağır yükler.',
  },
  yas_marina: {
    character: 'Gündüzden geceye, çekiş',
    signatureCorner: '5–6–7. viraj şikanı',
    note: 'Geleneksel sezon finali: yarış boyunca pist soğur ve yavaş virajlardan çıkıştaki çekiş her şeyi belirler.',
  },
  madring: {
    character: '2026\'nın yeni pisti, melez sokak',
    signatureCorner: 'Eğimli 4. viraj',
    note: 'Madrid\'in 2026\'da takvime giren yeni melez pisti: eğimli bir viraj, sokak ve kalıcı pist bölümlerinin karışımı.',
  },
  sepang: {
    character: 'Geniş, yüksek lastik aşınması, tropikal nem',
    signatureCorner: '5–6. viraj yüksek hızlı süpürmesi ve 14. viraj firkete',
    note: 'Hermann Tilke tasarımı klasik pist: ani bastıran tropikal muson yağmurları, yoğun nem ve yüksek hızlı yön değişimleriyle meşhurdur.',
  },
};
