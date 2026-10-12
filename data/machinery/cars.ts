/**
 * Machinery — The definitive catalog of Formula 1's most iconic engineering masterpieces.
 *
 * Each vehicle represents an era-defining technical breakthrough:
 * Active suspension, double diffusers, lowline turbo packaging, wedge architecture,
 * or ground-effect venturi mastery.
 *
 * Pure data model + CAD wireframe geometry (zero copyright photographic risk).
 *
 * Facts checked 2026-10-12: season results (races, wins, poles, podiums) against
 * the F1DB index in data/history; engine, gearbox and designer figures against
 * each car's Wikipedia infobox. Claims no source supports were removed or
 * softened (FW14B "blown diffuser", F2004 "zero failures", invented percentages).
 */

export interface MachineryCar {
  id: string;
  name: string;
  fullName: string;
  year: number;
  constructorId: string;
  constructorName: string;
  designer: string[];
  engine: {
    spec: string;
    cylinders: string;
    displacement: string;
    power: string;
    rpm: string;
    aspiration: 'Naturally Aspirated' | 'Turbocharged' | 'Turbo Hybrid';
  };
  chassis: {
    weightKg: number;
    transmission: string;
    monocoque: string;
    brakes: string;
  };
  achievements: {
    races: number;
    wins: number;
    poles: number;
    podiums: number;
    titles: ('WDC' | 'WCC')[];
    winRate: string;
  };
  drivers: {
    id: string;
    name: string;
    number?: number;
    isChampion?: boolean;
  }[];
  era: 'Classic (Pre-1980)' | 'Turbo Era' | 'Electronic Wizardry' | 'V10 Golden Age' | 'V8 Aero Revolution' | 'Ground Effect 2.0';
  eraTr: 'Klasik Çağ (1980 Öncesi)' | 'Turbo Çağı' | 'Elektronik Büyücülük' | 'V10 Altın Çağı' | 'V8 Aero Devrimi' | 'Zemin Etkisi 2.0';
  keyInnovationEn: string;
  keyInnovationTr: string;
  technicalBreakthroughEn: string;
  technicalBreakthroughTr: string;
  aerodynamicsEn: string;
  aerodynamicsTr: string;
  legacyEn: string;
  legacyTr: string;
  accentColor: string;
  secondaryColor: string;
  relatedGlossaryTerms: string[];
}

export const MACHINERY_CARS: MachineryCar[] = [
  {
    id: 'mclaren-mp4-4',
    name: 'MP4/4',
    fullName: 'McLaren MP4/4 Honda',
    year: 1988,
    constructorId: 'mclaren',
    constructorName: 'McLaren',
    designer: ['Gordon Murray', 'Steve Nichols'],
    engine: {
      spec: 'Honda RA168E',
      cylinders: '80° V6',
      displacement: '1,494 cc (1.5L)',
      power: '675 hp (2.5 bar boost limit)',
      rpm: '12,500 RPM',
      aspiration: 'Turbocharged',
    },
    chassis: {
      weightKg: 540,
      transmission: 'Weismann-McLaren 6-speed manual',
      monocoque: 'Carbon fibre & Kevlar honeycomb composite',
      brakes: 'Carbon-carbon disc brakes',
    },
    achievements: {
      races: 16,
      wins: 15,
      poles: 15,
      podiums: 25,
      titles: ['WDC', 'WCC'],
      winRate: '93.75%',
    },
    drivers: [
      { id: 'senna', name: 'Ayrton Senna', number: 12, isChampion: true },
      { id: 'prost', name: 'Alain Prost', number: 11 },
    ],
    era: 'Turbo Era',
    eraTr: 'Turbo Çağı',
    keyInnovationEn: 'Ultra-lowline chassis with a steeply reclined driving position.',
    keyInnovationTr: 'Pilotu iyice yatıran oturma pozisyonuyla ultra alçak gövde mimarisi.',
    technicalBreakthroughEn: 'Under technical director Gordon Murray and chief designer Steve Nichols, McLaren built a very low monocoque that laid the driver back in the cockpit. The low engine and driver cut frontal area and the centre of gravity, and fed cleaner air to the rear wing.',
    technicalBreakthroughTr: 'Teknik direktör Gordon Murray ve baş tasarımcı Steve Nichols yönetiminde McLaren, pilotu kokpitte geriye yatıran çok alçak bir monokok yaptı. Alçak motor ve pilot, ön kesit alanını ve ağırlık merkezini düşürdü, arka kanada daha temiz hava gönderdi.',
    aerodynamicsEn: 'Optimized low-drag configuration that maximized rear wing efficiency while maintaining high straight-line velocity despite fuel-flow restrictions.',
    aerodynamicsTr: 'Yakıt akışı kısıtlamalarına rağmen düzlük hızını korurken arka kanat verimliliğini maksimize eden düşük sürtünmeli hava akış profili.',
    legacyEn: 'Won 15 out of 16 races in 1988 — the most dominant single-season percentage in Formula 1 history until the 2023 season.',
    legacyTr: '1988 sezonunda 16 yarışın 15\'ini kazanarak 2023 sezonuna kadar Formula 1 tarihinin en yüksek tek sezon galibiyet oranına sahip aracı oldu.',
    accentColor: '#ff1801',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Turbocharger', 'Monocoque', 'Downforce', 'Drag'],
  },
  {
    id: 'williams-fw14b',
    name: 'FW14B',
    fullName: 'Williams FW14B Renault',
    year: 1992,
    constructorId: 'williams',
    constructorName: 'Williams',
    designer: ['Patrick Head', 'Adrian Newey', 'Frank Dernie'],
    engine: {
      spec: 'Renault RS3C / RS4',
      cylinders: '67° V10',
      displacement: '3,493 cc (3.5L)',
      power: '700–750 bhp',
      rpm: '14,500 RPM',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 505,
      transmission: 'Williams 6-speed sequential semi-automatic',
      monocoque: 'Carbon fibre and aramid composite monocoque',
      brakes: 'Carbon-carbon discs',
    },
    achievements: {
      races: 16,
      wins: 10,
      poles: 15,
      podiums: 21,
      titles: ['WDC', 'WCC'],
      winRate: '62.5%',
    },
    drivers: [
      { id: 'mansell', name: 'Nigel Mansell', number: 5, isChampion: true },
      { id: 'patrese', name: 'Riccardo Patrese', number: 6 },
    ],
    era: 'Electronic Wizardry',
    eraTr: 'Elektronik Büyücülük',
    keyInnovationEn: 'Computer-controlled active suspension, traction control and a semi-automatic gearbox.',
    keyInnovationTr: 'Bilgisayar kontrollü aktif süspansiyon, çekiş kontrolü ve yarı otomatik şanzıman.',
    technicalBreakthroughEn: 'Williams\' own active suspension (devised by Frank Dernie, with Paddy Lowe\'s electronics group) held the car at a near-constant ride height under braking, cornering and acceleration. Together with traction control and the semi-automatic gearbox, it put the car a step ahead of the field.',
    technicalBreakthroughTr: 'Williams\'ın kendi aktif süspansiyonu (Frank Dernie\'nin tasarımı, Paddy Lowe\'un elektronik ekibiyle) aracı frenlemede, virajda ve hızlanmada neredeyse sabit bir yükseklikte tuttu. Çekiş kontrolü ve yarı otomatik şanzımanla birlikte aracı rakiplerinin bir adım önüne taşıdı.',
    aerodynamicsEn: 'Because the active suspension kept the ride height steady, Newey\'s aerodynamics could run close to the ground and keep their downforce through every phase of a corner.',
    aerodynamicsTr: 'Aktif süspansiyon taban yüksekliğini sabit tuttuğu için Newey\'nin aerodinamiği yere yakın çalışıp virajın her anında basma kuvvetini koruyabildi.',
    legacyEn: 'Often heralded as the most technologically advanced single-seater in Grand Prix history, leading Nigel Mansell to 9 wins and the World Championship.',
    legacyTr: 'Grand Prix tarihinin teknolojik açıdan en gelişmiş tek koltuklusu olarak kabul edilir; Nigel Mansell\'i 9 galibiyetle açık ara dünya şampiyonluğuna taşımıştır.',
    accentColor: '#005aff',
    secondaryColor: '#f5d300',
    relatedGlossaryTerms: ['Active Suspension', 'Traction Control', 'Downforce'],
  },
  {
    id: 'ferrari-f2004',
    name: 'F2004',
    fullName: 'Scuderia Ferrari F2004',
    year: 2004,
    constructorId: 'ferrari',
    constructorName: 'Ferrari',
    designer: ['Rory Byrne', 'Ross Brawn', 'Aldo Costa'],
    engine: {
      spec: 'Ferrari Tipo 053',
      cylinders: '90° V10',
      displacement: '2,997 cc (3.0L)',
      power: '865 hp race trim · 900–940 hp qualifying trim',
      rpm: '18,800 RPM race · 19,000 RPM qualifying',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 605,
      transmission: 'Ferrari 7-speed sequential semi-automatic',
      monocoque: 'Carbon-fibre and honeycomb composite',
      brakes: 'Brembo ventilated carbon-carbon discs',
    },
    achievements: {
      races: 18,
      wins: 15,
      poles: 12,
      podiums: 29,
      titles: ['WDC', 'WCC'],
      winRate: '83.33%',
    },
    drivers: [
      { id: 'michael_schumacher', name: 'Michael Schumacher', number: 1, isChampion: true },
      { id: 'barrichello', name: 'Rubens Barrichello', number: 2 },
    ],
    era: 'V10 Golden Age',
    eraTr: 'V10 Altın Çağı',
    keyInnovationEn: 'A V10 revving to 19,000 rpm in qualifying trim, matched to bespoke Bridgestone tyres.',
    keyInnovationTr: 'Sıralama ayarında 19.000 devre çıkan V10 motor ve ona özel geliştirilmiş Bridgestone lastikleri.',
    technicalBreakthroughEn: 'The F2004 set lap records that stood for well over a decade (including Monza, Melbourne and Shanghai). Rory Byrne\'s periscope exhausts, the tightly packaged rear end and the Tipo 053 V10 (865 hp in race trim) made a fast car that was also very reliable.',
    technicalBreakthroughTr: 'F2004; Monza, Melbourne ve Şanghay dahil on yılı aşkın süre kırılamayan tur rekorları kırdı. Rory Byrne\'ın periskop egzozları, sıkı paketlenmiş arka bölüm ve Tipo 053 V10 (yarış ayarında 865 hp) hem hızlı hem çok güvenilir bir araç çıkardı.',
    aerodynamicsEn: 'Periscopic exhaust cooling and flip-up aero appendages that maximized flow attachment over the rear beam wing.',
    aerodynamicsTr: 'Periskop egzoz soğutması ve arka kiriş kanadı üzerindeki hava tutunmasını artıran aerodinamik kulakçıklar.',
    legacyEn: 'The absolute pinnacle of the screaming V10 era. Michael Schumacher clinched 13 victories to take his 7th World Championship title.',
    legacyTr: 'V10 çağının mutlak zirvesi. Michael Schumacher 13 yarış zaferiyle 7. Dünya Şampiyonluğunu bu şaheser ile mühürledi.',
    accentColor: '#e80020',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Downforce', 'Diffuser', 'Monocoque', 'Power-to-weight ratio'],
  },
  {
    id: 'brawn-bgp-001',
    name: 'BGP 001',
    fullName: 'Brawn GP BGP 001 Mercedes',
    year: 2009,
    constructorId: 'brawn',
    constructorName: 'Brawn GP',
    designer: ['Jörg Zander', 'Loïc Bigois', 'Ross Brawn'],
    engine: {
      spec: 'Mercedes-Benz FO 108W',
      cylinders: '90° V8',
      displacement: '2,398 cc (2.4L)',
      power: '750 bhp',
      rpm: '18,000 RPM (FIA Limited)',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 605,
      transmission: 'Brawn 7-speed semi-automatic longitudinal',
      monocoque: 'Moulded carbon fibre composite',
      brakes: 'Brembo carbon-carbon discs',
    },
    achievements: {
      races: 17,
      wins: 8,
      poles: 5,
      podiums: 15,
      titles: ['WDC', 'WCC'],
      winRate: '47.06%',
    },
    drivers: [
      { id: 'button', name: 'Jenson Button', number: 22, isChampion: true },
      { id: 'barrichello', name: 'Rubens Barrichello', number: 23 },
    ],
    era: 'V8 Aero Revolution',
    eraTr: 'V8 Aero Devrimi',
    keyInnovationEn: 'Double Diffuser exploiting loophole in 2009 rear crash structure regulations.',
    keyInnovationTr: '2009 arka kaza yapısı kuralındaki boşluğu kullanan çift katmanlı difüzör (Double Diffuser).',
    technicalBreakthroughEn: 'Honda started the car early in 2008 and kept developing it after announcing its withdrawal that December. Its double-decker diffuser used an opening at the rear of the floor to feed a second, higher diffuser deck, giving far more rear downforce than rivals until the FIA ruled the design legal and others copied it.',
    technicalBreakthroughTr: 'Honda aracı 2008\'in başında geliştirmeye başladı ve aralık ayında çekildiğini açıkladıktan sonra da sürdürdü. İki katlı difüzör, tabanın arkasındaki bir açıklıktan daha yüksekteki ikinci bir difüzör katına hava besleyerek rakiplerden çok daha fazla arka basma kuvveti üretti; FIA tasarımı yasal sayınca diğerleri de kopyaladı.',
    aerodynamicsEn: 'Pioneered extreme outwash front-wing endplates, sending dirty wake outside the front tires to feed the high-pressure underfloor.',
    aerodynamicsTr: 'Ön tekerleklerin dışına kirli havayı tahliye ederek taban altı yüksek basınç alanını besleyen uç plakası dışa akış (outwash) konseptinin öncüsü oldu.',
    legacyEn: 'Ross Brawn bought the team from Honda (reportedly for a token £1), and it won both the Drivers\' and Constructors\' Championships in its only season — one of motorsport\'s great fairytales.',
    legacyTr: 'Ross Brawn takımı Honda\'dan (söylendiğine göre sembolik 1 sterline) satın aldı; takım tek sezonunda hem Pilotlar hem Markalar şampiyonluğunu kazandı. Motor sporlarının en büyük peri masallarından biri.',
    accentColor: '#e1f700',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Double Diffuser', 'Outwash', 'Downforce', 'Aerodynamic Wake'],
  },
  {
    id: 'lotus-72',
    name: 'Lotus 72',
    fullName: 'Team Lotus 72 Ford Cosworth',
    year: 1970,
    constructorId: 'lotus',
    constructorName: 'Team Lotus',
    designer: ['Colin Chapman', 'Maurice Philippe', 'Tony Rudd'],
    engine: {
      spec: 'Ford Cosworth DFV',
      cylinders: '90° V8',
      displacement: '2,993 cc (3.0L)',
      power: '440–465 hp',
      rpm: '10,000–10,800 RPM',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 530,
      transmission: 'Hewland FG400 5-speed manual',
      monocoque: 'Aluminium sheet monocoque with steel subframes',
      brakes: 'Inboard ventilated disc brakes front and rear',
    },
    achievements: {
      races: 75,
      wins: 20,
      poles: 17,
      podiums: 39,
      titles: ['WDC', 'WCC'],
      winRate: '26.67%',
    },
    drivers: [
      { id: 'rindt', name: 'Jochen Rindt', isChampion: true },
      { id: 'fittipaldi', name: 'Emerson Fittipaldi', isChampion: true },
      { id: 'peterson', name: 'Ronnie Peterson' },
    ],
    era: 'Classic (Pre-1980)',
    eraTr: 'Klasik Çağ (1980 Öncesi)',
    keyInnovationEn: 'Sidepod radiators, wedge profile, inboard brakes, and anti-dive suspension.',
    keyInnovationTr: 'Yan radyatörler (sidepod), kama burun profili, içten frenler ve anti-dive süspansiyon.',
    technicalBreakthroughEn: 'Colin Chapman moved the radiators from the nose to sidepods and gave the car a wedge profile, a layout single-seaters followed for decades. Inboard brakes cut unsprung weight, and torsion-bar springs gave fine ride control.',
    technicalBreakthroughTr: 'Colin Chapman radyatörleri burundan yan gövdelere taşıdı ve araca kama profili verdi; tek koltuklular bu düzeni on yıllarca izledi. Gövde içi frenler yaylanmayan kütleyi azalttı, burulma çubuklu yaylar ince bir yol tutuşu sağladı.',
    aerodynamicsEn: 'The wedge body and side radiators made the whole car part of the aerodynamic package, instead of relying on wings bolted onto a cigar-shaped chassis.',
    aerodynamicsTr: 'Kama gövde ve yan radyatörler, puro biçimli bir şasiye kanat eklemek yerine aracın tamamını aerodinamiğin parçası yaptı.',
    legacyEn: 'Raced across six full seasons (1970–1975), winning 3 Constructors Championships and 2 Drivers titles. The architectural grandfather of modern Formula 1.',
    legacyTr: '1970\'ten 1975\'e kadar altı tam sezon yarışarak 3 Markalar ve 2 Pilotlar Şampiyonluğu kazandı; modern Formula 1 mimarisinin büyükbabası.',
    accentColor: '#d4af37',
    secondaryColor: '#1a1a1a',
    relatedGlossaryTerms: ['Monocoque', 'Downforce', 'Inboard Brakes'],
  },
  {
    id: 'redbull-rb19',
    name: 'RB19',
    fullName: 'Oracle Red Bull Racing RB19',
    year: 2023,
    constructorId: 'red_bull',
    constructorName: 'Red Bull Racing',
    designer: ['Adrian Newey', 'Pierre Waché', 'Ben Waterhouse'],
    engine: {
      spec: 'Honda RBPTH001',
      cylinders: '90° V6 Turbo Hybrid',
      displacement: '1,600 cc (1.6L)',
      power: '1,000+ bhp (ICE + MGU-K + MGU-H)',
      rpm: '15,000 RPM',
      aspiration: 'Turbo Hybrid',
    },
    chassis: {
      weightKg: 798,
      transmission: '8-speed seamless-shift semi-automatic',
      monocoque: 'Carbon-composite monocoque',
      brakes: 'Carbon composite discs and calipers',
    },
    achievements: {
      races: 22,
      wins: 21,
      poles: 14,
      podiums: 30,
      titles: ['WDC', 'WCC'],
      winRate: '95.45%',
    },
    drivers: [
      { id: 'max_verstappen', name: 'Max Verstappen', number: 1, isChampion: true },
      { id: 'perez', name: 'Sergio Pérez', number: 11 },
    ],
    era: 'Ground Effect 2.0',
    eraTr: 'Zemin Etkisi 2.0',
    keyInnovationEn: 'A stable ground-effect platform: pull-rod front suspension and a floor that kept its downforce without porpoising.',
    keyInnovationTr: 'Kararlı bir zemin etkisi platformu: çekme çubuklu ön süspansiyon ve yunuslama (porpoising) yapmadan basma kuvvetini koruyan taban.',
    technicalBreakthroughEn: 'While several rivals fought aerodynamic bouncing (porpoising) under the 2022 rules, Red Bull\'s pull-rod front and push-rod rear suspension held the floor\'s Venturi tunnels at a steady height, so the car kept its downforce at every speed.',
    technicalBreakthroughTr: '2022 kurallarında birçok rakip aerodinamik zıplamayla (yunuslama) uğraşırken Red Bull\'un çekme çubuklu ön ve itme çubuklu arka süspansiyonu tabanın Venturi tünellerini sabit bir yükseklikte tuttu; araç her hızda basma kuvvetini korudu.',
    aerodynamicsEn: 'Hyper-efficient beam wing and DRS interaction, shedding massive drag down straights while developing crushing suction through high-speed sweeps.',
    aerodynamicsTr: 'Düzlüklerde sürtünmeyi yok eden, yüksek hızlı virajlarda ise ezici bir yer çekim vakumu üreten hiper verimli DRS ve kiriş kanat etkileşimi.',
    legacyEn: 'The most statistically dominant car ever created in Grand Prix history: 21 wins in 22 races (95.45% win rate), obliterating the 35-year record of the McLaren MP4/4.',
    legacyTr: 'Grand Prix tarihinin istatistiksel olarak en baskın aracı: 22 yarışta 21 galibiyet (%95.45 kazanma oranı) ile McLaren MP4/4\'ün 35 yıllık rekorunu tarihe gömdü.',
    accentColor: '#1e41ff',
    secondaryColor: '#f5d300',
    relatedGlossaryTerms: ['Ground Effect', 'Porpoising', 'Venturi Tunnels', 'DRS', 'Downforce'],
  },
];

export function getMachineryCar(id: string): MachineryCar | undefined {
  return MACHINERY_CARS.find((c) => c.id === id);
}

export function getAllMachineryCars(): MachineryCar[] {
  return MACHINERY_CARS;
}

/** Accent-free, lower-case, underscore-separated id: "Sergio Pérez" / "sergio-perez" -> "sergio_perez". */
function idSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Cars a driver raced in. Matching is EXACT (no substring): "bruno_senna" must never match
 * Ayrton Senna's car. When the profile name is known it is authoritative; otherwise the id is
 * compared with the listed id or the slug of the listed full name (F1DB ids are name slugs).
 */
export function getMachineryCarsForDriver(driverId: string, driverName?: string): MachineryCar[] {
  const idNorm = idSlug(driverId);
  const nameNorm = driverName ? idSlug(driverName) : null;
  return MACHINERY_CARS.filter((c) =>
    c.drivers.some((d) => {
      const listedName = idSlug(d.name);
      if (nameNorm) return nameNorm === listedName;
      return idNorm === idSlug(d.id) || idNorm === listedName;
    }),
  );
}

/**
 * Cars a team built. Exact match on the listed constructor id or the slug of its name
 * ("Team Lotus" -> team_lotus), so the 2012 `lotus_f1` team does not pick up the 1970 Lotus 72.
 */
export function getMachineryCarsForTeam(constructorId: string): MachineryCar[] {
  const norm = idSlug(constructorId);
  return MACHINERY_CARS.filter(
    (c) => norm === idSlug(c.constructorId) || norm === idSlug(c.constructorName),
  );
}

export function getMachineryCarsForSeason(year: number): MachineryCar[] {
  return MACHINERY_CARS.filter((c) => c.year === year);
}
