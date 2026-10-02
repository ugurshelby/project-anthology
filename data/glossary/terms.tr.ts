/** Turkish text for glossaryTerms (same slugs). Category keys stay English; the UI translates them. */

export interface GlossaryTermTr {
  term: string;
  badge: string;
  keyImpact?: string;
  definition: string;
  aliases?: string[];
}

export const GLOSSARY_TERMS_TR: Record<string, GlossaryTermTr> = {
  'active-suspension': {
    term: 'Aktif Süspansiyon',
    badge: 'ŞASİ // 1994\'TE YASAKLANDI',
    keyImpact: 'Williams FW14B ve FW15C, platformu tur boyunca aerodinamik olarak en verimli duruşta tuttu.',
    definition: 'Sürüş yüksekliğini ve sertliği anlık ayarlayan, bilgisayar kontrollü süspansiyon; aracı aerodinamik açıdan en verimli duruşta tutar. 1990\'ların başında belirleyiciydi, 1994\'te yasaklandı.',
    aliases: ['aktif süspansiyon'],
  },
  diffuser: {
    term: 'Difüzör',
    badge: 'AERO // ZEMİN',
    keyImpact: 'Zemin altı akışı çıkışta genişletir: arka yere basma kuvvetinin ana kaynağı.',
    definition: 'Zeminin arkada yukarı kıvrılan bölümü. Aracın altındaki havayı hızlandırır, çıkışta genişleterek basıncı düşürür ve yere basma kuvveti üretir. 2009\'daki çift difüzör, bir yönetmelik boşluğunu muazzam bir avantaja çevirdi.',
    aliases: ['çift difüzör'],
  },
  downforce: {
    term: 'Yere Basma Kuvveti',
    badge: 'AERO // YÜK',
    keyImpact: 'Daha fazla yük, daha yüksek viraj hızı demek; bedeli düzlükteki sürüklenme.',
    definition: 'Aracı pistin üzerine bastıran aerodinamik yük; lastikler üzerinden mekanik tutuşu artırır. Daha fazla yere basma kuvveti, düzlükteki sürüklenme pahasına daha yüksek viraj hızı sağlar.',
    aliases: ['downforce'],
  },
  drs: {
    term: 'DRS',
    badge: 'AERO // YÖNETMELİK',
    keyImpact: 'DRS bölgesinde açıldığında yaklaşık 10–12 km/sa azami hız farkı.',
    definition: 'Sürüklenme Azaltma Sistemi: arka kanattaki, sürücünün açtığı bir kanatçık. Belirlenen bölgelerde sürüklenmeyi azaltıp sollamayı kolaylaştırır; yalnızca öndeki araca bir saniyeden az farkla yaklaşıldığında kullanılabilir.',
    aliases: ['Sürüklenme Azaltma Sistemi'],
  },
  ers: {
    term: 'ERS',
    badge: 'GÜÇ ÜNİTESİ // HİBRİT',
    keyImpact: 'MGU-K desteği yaklaşık 160 hp; MGU-H egzoz ısısını aynı bataryaya depolar.',
    definition: 'Enerji Geri Kazanım Sistemi: frenlemede (MGU-K) ve egzoz ısısından (MGU-H) enerji toplar, bataryada saklar ve ek güç olarak geri verir. Öncülü KERS, 2009\'da sahneye çıktı.',
    aliases: ['Enerji Geri Kazanım Sistemi', 'KERS'],
  },
  graining: {
    term: 'Graining (Taneleme)',
    badge: 'LASTİK // YÜZEY',
    keyImpact: 'Soğuk ya da kayan lastikte kauçuk şeritler halinde yuvarlanır; temas yüzeyi ve tutuş çöker.',
    definition: 'Lastik yüzeyinin yırtılması: kauçuk küçük şeritler halinde yuvarlanır, temas yüzeyini ve tutuşu azaltır. Soğuk ya da aşırı zorlanmış lastikle kaymaktan doğar.',
    aliases: ['taneleme'],
  },
  'ground-effect': {
    term: 'Zemin Etkisi',
    badge: 'AERO // 2022 YÖNETMELİĞİ',
    keyImpact: '2022 kuralları yere basma kuvvetinin büyük bölümünü yeniden zemine ve venturi tünellerine taşıdı.',
    definition: 'Zeminin ve alt gövdenin şekillendirilmesiyle aracın altında alçak basınç bölgesi yaratarak elde edilen yere basma kuvveti. 1970\'lerin sonu ile 1980\'lerin başındaki tasarımların merkezindeydi; 2022 yönetmeliğiyle geri döndü.',
    aliases: ['zemin etkisi'],
  },
  'parc-ferme': {
    term: 'Parc Fermé',
    badge: 'KURALLAR // SPORTİF',
    keyImpact: 'Yarış için sıralama ayarı kilitlenir; yalnızca kısa bir izinli ayar listesi serbesttir.',
    definition: 'Sıralama turlarından itibaren takımların aracın ayarını değiştirmesinin yasak olduğu durum. Araç, dar bir izinli ayar listesi dışında, sıralamadaki yapılandırmasıyla yarışa kilitlenir.',
    aliases: ['parc ferme', 'kapalı park'],
  },
  slipstream: {
    term: 'Slipstream (Hava Emişi)',
    badge: 'AERO // İZ',
    keyImpact: 'Takip eden araç için sürüklenmeyi azaltır: uzun düzlüklerde klasik sollama hazırlığı.',
    definition: 'Aracın arkasında oluşan alçak basınçlı hava cebi. Bu akımın içinden giden sürücü daha az sürüklenmeyle karşılaşır ve sollama için daha yüksek hız taşıyabilir.',
    aliases: ['tow', 'lastik dibi', 'hava emişi'],
  },
  turbo: {
    term: 'Turbo',
    badge: 'GÜÇ ÜNİTESİ // HİBRİT',
    keyImpact: '2014 sonrası hibrit güç ünitesi: MGU-H ile aynı mil üzerinde tek turbo.',
    definition: 'Egzoz gazlarıyla çalışan, motora daha fazla hava basarak güç artıran kompresör. İlk turbo çağını (1977–1988) tanımladı, 2014\'te hibrit güç üniteleriyle geri döndü.',
    aliases: ['turbo şarj', 'turboşarj'],
  },
  undercut: {
    term: 'Undercut',
    badge: 'STRATEJİ // PİT DUVARI',
    keyImpact: 'Tipik undercut penceresi: dışarıda kalan araca göre yaklaşık 1,5–2,5 sn taze lastik farkı.',
    definition: 'Bir sürücünün rakibinden önce pite girip taze lastiğin temposuyla, rakip pite girince onu geride bırakması stratejisi. Tersi, pist pozisyonu için dışarıda kalmak, overcut\'tır.',
    aliases: [],
  },
};
