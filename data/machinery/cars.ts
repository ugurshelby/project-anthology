/**
 * Machinery — The definitive catalog of Formula 1's most iconic engineering masterpieces.
 *
 * Each vehicle represents an era-defining technical breakthrough:
 * Active suspension, double diffusers, lowline turbo packaging, wedge architecture,
 * or ground-effect venturi mastery.
 *
 * Pure data model + CAD wireframe geometry (zero copyright photographic risk).
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
  cadSilhouetteSvg: string; // Architectural wireframe side profile
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
      power: '650–690 bhp @ 2.5 bar boost',
      rpm: '12,500 RPM',
      aspiration: 'Turbocharged',
    },
    chassis: {
      weightKg: 540,
      transmission: 'McLaren 6-speed manual longitudinal',
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
    keyInnovationEn: 'Ultra-lowline chassis architecture with 30° reclined cockpit geometry.',
    keyInnovationTr: '30° yatık kokpit geometrisi ile ultra alçak gövde mimarisi ve hava akımı minimizasyonu.',
    technicalBreakthroughEn: 'Gordon Murray designed an ultra-lowline monocoque that forced the driver into an unprecedented 30-degree reclined seating position. By lowering the engine and driver center of gravity, frontal area was slashed by nearly 30%, directing pristine airflow directly to the massive rear wing.',
    technicalBreakthroughTr: 'Gordon Murray, pilotu benzeri görülmemiş 30 derecelik yatık bir oturma pozisyonuna zorlayan ultra alçak bir monokok tasarladı. Motor ve sürücünün ağırlık merkezini alçaltarak ön kesit alanını yaklaşık %30 oranında azalttı ve hava akımını türbülanssız şekilde devasa arka kanada yönlendirdi.',
    aerodynamicsEn: 'Optimized low-drag configuration that maximized rear wing efficiency while maintaining high straight-line velocity despite fuel-flow restrictions.',
    aerodynamicsTr: 'Yakıt akışı kısıtlamalarına rağmen düzlük hızını korurken arka kanat verimliliğini maksimize eden düşük sürtünmeli hava akış profili.',
    legacyEn: 'Won 15 out of 16 races in 1988 — the most dominant single-season percentage in Formula 1 history until the 2023 season.',
    legacyTr: '1988 sezonunda 16 yarışın 15\'ini kazanarak 2023 sezonuna kadar Formula 1 tarihinin en yüksek tek sezon galibiyet oranına sahip aracı oldu.',
    accentColor: '#ff1801',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Turbocharger', 'Monocoque', 'Downforce', 'Drag'],
    cadSilhouetteSvg: 'M 10 70 L 60 70 L 80 52 L 140 45 L 210 38 L 260 38 L 300 48 L 360 52 L 410 52 L 440 65 L 470 65 L 470 75 L 400 75 L 390 68 L 340 68 L 330 75 L 120 75 L 110 68 L 70 68 L 60 75 Z',
  },
  {
    id: 'williams-fw14b',
    name: 'FW14B',
    fullName: 'Williams FW14B Renault',
    year: 1992,
    constructorId: 'williams',
    constructorName: 'Williams',
    designer: ['Adrian Newey', 'Patrick Head'],
    engine: {
      spec: 'Renault RS3C / RS4',
      cylinders: '67° V10',
      displacement: '3,493 cc (3.5L)',
      power: '750+ bhp',
      rpm: '14,400 RPM',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 505,
      transmission: 'Williams 6-speed transverse semi-automatic',
      monocoque: 'Carbon fibre and aramid composite monocoque',
      brakes: 'Carbone Industrie carbon discs and pads',
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
    keyInnovationEn: 'Fully computer-controlled active hydraulic suspension & blown diffuser.',
    keyInnovationTr: 'Tam bilgisayar kontrollü aktif hidrolik süspansiyon ve üflemeli difüzör.',
    technicalBreakthroughEn: 'Equipped with a reactive active suspension system programmed by Paddy Lowe, the FW14B maintained an absolute, perfectly flat aerodynamic platform through every corner, dive, roll, and pitch angle. Coupled with fly-by-wire traction control and semi-automatic paddle shifters, it operated on a completely different technological dimension.',
    technicalBreakthroughTr: 'Paddy Lowe tarafından programlanan reaktif aktif süspansiyon sistemi sayesinde FW14B; her viraj, frenleme ve hızlanmada kusursuz derecede düz bir aerodinamik platform sağladı. Çekiş kontrolü ve yarı otomatik vites kulakçıklarıyla birleştiğinde rakiplerinden tamamen farklı bir teknolojik boyuttaydı.',
    aerodynamicsEn: 'Newey\'s sculpted sidepods and blown diffuser delivered unrelenting ground downforce because the active suspension kept ride height millimeter-perfect at all speeds.',
    aerodynamicsTr: 'Newey\'nin zarif yan sidepodları ve üflemeli difüzörü, aktif süspansiyonun taban yüksekliğini milimetrik hassasiyette sabit tutması sayesinde kesintisiz bir yer basma gücü üretti.',
    legacyEn: 'Often heralded as the most technologically advanced single-seater in Grand Prix history, leading Nigel Mansell to 9 wins and the World Championship.',
    legacyTr: 'Grand Prix tarihinin teknolojik açıdan en gelişmiş tek koltuklusu olarak kabul edilir; Nigel Mansell\'i 9 galibiyetle açık ara dünya şampiyonluğuna taşımıştır.',
    accentColor: '#005aff',
    secondaryColor: '#f5d300',
    relatedGlossaryTerms: ['Active Suspension', 'Traction Control', 'Blown Diffuser', 'Downforce'],
    cadSilhouetteSvg: 'M 10 72 L 55 72 L 75 55 L 130 46 L 205 39 L 265 39 L 310 46 L 370 50 L 420 50 L 450 63 L 475 63 L 475 74 L 410 74 L 398 67 L 345 67 L 335 74 L 125 74 L 115 67 L 72 67 L 62 74 Z',
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
      power: '920–950 bhp',
      rpm: '19,100 RPM',
      aspiration: 'Naturally Aspirated',
    },
    chassis: {
      weightKg: 605,
      transmission: 'Ferrari 7-speed longitudinal semi-automatic titanium case',
      monocoque: 'Carbon-fibre and honeycomb composite',
      brakes: 'Brembo ventilated carbon-carbon discs',
    },
    achievements: {
      races: 18,
      wins: 15,
      poles: 12,
      podiums: 30,
      titles: ['WDC', 'WCC'],
      winRate: '83.33%',
    },
    drivers: [
      { id: 'michael_schumacher', name: 'Michael Schumacher', number: 1, isChampion: true },
      { id: 'barrichello', name: 'Rubens Barrichello', number: 2 },
    ],
    era: 'V10 Golden Age',
    eraTr: 'V10 Altın Çağı',
    keyInnovationEn: 'Harmonic perfection of screaming 19,000 RPM V10 with bespoke Bridgestone compound chemistry.',
    keyInnovationTr: '19.000 devirlik çığlık atan V10 motorun ve özel Bridgestone lastik hamurunun kusursuz harmonisi.',
    technicalBreakthroughEn: 'The F2004 set lap records that stood for well over a decade (including Monza, Melbourne, and Shanghai). Rory Byrne\'s periscopic exhaust exits, ultra-tight rear gearbox casing, and the howling 950hp Tipo 053 engine operated at zero mechanical failure rate.',
    technicalBreakthroughTr: 'F2004; Monza, Melbourne ve Şanghay dahil olmak üzere on yılı aşkın süre kırılamayan pist rekorlarına imza attı. Rory Byrne\'nin periskop egzoz çıkışları, ultra dar arka şanzıman yapısı ve 950 beygirlik Tipo 053 motor sıfır mekanik arıza oranıyla çalıştı.',
    aerodynamicsEn: 'Periscopic exhaust cooling and flip-up aero appendages that maximized flow attachment over the rear beam wing.',
    aerodynamicsTr: 'Periskop egzoz soğutması ve arka kiriş kanadı üzerindeki hava tutunmasını artıran aerodinamik kulakçıklar.',
    legacyEn: 'The absolute pinnacle of the screaming V10 era. Michael Schumacher clinched 13 victories to take his 7th World Championship title.',
    legacyTr: 'V10 çağının mutlak zirvesi. Michael Schumacher 13 yarış zaferiyle 7. Dünya Şampiyonluğunu bu şaheser ile mühürledi.',
    accentColor: '#e80020',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Downforce', 'Diffuser', 'Monocoque', 'Power-to-weight ratio'],
    cadSilhouetteSvg: 'M 12 70 L 60 70 L 82 53 L 138 43 L 210 36 L 270 36 L 315 45 L 368 49 L 425 49 L 452 64 L 478 64 L 478 74 L 412 74 L 400 66 L 348 66 L 336 74 L 126 74 L 114 66 L 70 66 L 58 74 Z',
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
    technicalBreakthroughEn: 'Born from Honda\'s massive 16-month research programme before their sudden withdrawal, the car featured a revolutionary double-decker diffuser. By channeling airflow under the gearbox through holes in the rear impact structure, it generated double the rear downforce of competitors without incurring drag penalties.',
    technicalBreakthroughTr: 'Honda\'nın spordan çekilmeden önce yürüttüğü 16 aylık devasa araştırma programının eseri olan araç, devrim niteliğinde iki katlı bir difüzöre sahipti. Şanzımanın altındaki hava akışını arka darbe yapısındaki kanallardan geçirerek rakiplerine kıyasla sürtünme cezası olmadan iki kat arka basma gücü üretti.',
    aerodynamicsEn: 'Pioneered extreme outwash front-wing endplates, sending dirty wake outside the front tires to feed the high-pressure underfloor.',
    aerodynamicsTr: 'Ön tekerleklerin dışına kirli havayı tahliye ederek taban altı yüksek basınç alanını besleyen uç plakası dışa akış (outwash) konseptinin öncüsü oldu.',
    legacyEn: 'Bought for £1 by Ross Brawn, the team won both Drivers and Constructors Championships in its sole year of existence — the greatest fairytale in motorsport.',
    legacyTr: 'Ross Brawn tarafından sembolik 1 Pound\'a satın alınan takım, var olduğu tek yılda hem Pilotlar hem Markalar Şampiyonluğunu kazandı; motor sporları tarihinin en büyük peri masalı.',
    accentColor: '#e1f700',
    secondaryColor: '#ffffff',
    relatedGlossaryTerms: ['Double Diffuser', 'Outwash', 'Downforce', 'Aerodynamic Wake'],
    cadSilhouetteSvg: 'M 10 71 L 58 71 L 80 54 L 135 44 L 205 38 L 265 38 L 312 47 L 365 51 L 420 51 L 448 64 L 474 64 L 474 74 L 408 74 L 396 67 L 344 67 L 332 74 L 122 74 L 110 67 L 68 67 L 56 74 Z',
  },
  {
    id: 'lotus-72',
    name: 'Lotus 72',
    fullName: 'Team Lotus 72 Ford Cosworth',
    year: 1970,
    constructorId: 'lotus',
    constructorName: 'Team Lotus',
    designer: ['Colin Chapman', 'Maurice Philippe'],
    engine: {
      spec: 'Ford Cosworth DFV',
      cylinders: '90° V8',
      displacement: '2,993 cc (3.0L)',
      power: '440 bhp',
      rpm: '10,500 RPM',
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
    technicalBreakthroughEn: 'Colin Chapman relocated the cooling radiator from the nose to sidepods, inventing the wedge silhouette that defined single-seater racing for the next 50 years. Inboard front brakes reduced unsprung weight dramatically, and torsion bar springs gave unmatched ride control.',
    technicalBreakthroughTr: 'Colin Chapman radyatörü burundan yanlara (sidepod) taşıyarak sonraki 50 yıl boyunca tüm tek koltuklu yarış araçlarını tanımlayan kama silüetini icat etti. Gövde içi frenler yaylanmayan kütleyi dramatik biçimde düşürdü, burulma çubuklu süspansiyon ise benzersiz bir yol tutuş sağladı.',
    aerodynamicsEn: 'First car designed from the outset with integrated aerodynamic bodywork creating downforce without needing parasitic auxiliary wing struts.',
    aerodynamicsTr: 'Parazit yardımcı kanat payandalarına ihtiyaç duymadan basma gücü üreten entegre gövde aerodinamiğiyle sıfırdan tasarlanan ilk yarış otomobili.',
    legacyEn: 'Raced across six full seasons (1970–1975), winning 3 Constructors Championships and 2 Drivers titles. The architectural grandfather of modern Formula 1.',
    legacyTr: '1970\'ten 1975\'e kadar altı tam sezon yarışarak 3 Markalar ve 2 Pilotlar Şampiyonluğu kazandı; modern Formula 1 mimarisinin büyükbabası.',
    accentColor: '#d4af37',
    secondaryColor: '#1a1a1a',
    relatedGlossaryTerms: ['Monocoque', 'Downforce', 'Inboard Brakes'],
    cadSilhouetteSvg: 'M 10 74 L 50 74 L 70 60 L 125 52 L 195 44 L 255 44 L 295 50 L 350 54 L 405 54 L 435 66 L 465 66 L 465 75 L 400 75 L 390 69 L 340 69 L 330 75 L 118 75 L 108 69 L 68 69 L 58 75 Z',
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
      transmission: 'Red Bull 8-speed seamless-shift hydraulic',
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
    keyInnovationEn: 'Extreme anti-dive/anti-squat suspension maintaining zero-pitch Venturi ground-effect sealing without porpoising.',
    keyInnovationTr: 'Yunuslama (porpoising) yaşamadan Venturi zemin etkisini koruyan ekstrem anti-dive/anti-squat süspansiyon geometrisi.',
    technicalBreakthroughEn: 'While every other competitor struggled with brutal aerodynamic bouncing (porpoising), Newey engineered an extreme mechanical suspension geometry (over 45° anti-dive front wishbones and massive anti-squat rear geometry) that kept the car\'s underfloor venturi tunnels at an absolute static distance from the asphalt at all speeds.',
    technicalBreakthroughTr: 'Diğer tüm takımlar şiddetli aerodinamik dalgalanma (yunuslama/porpoising) ile boğuşurken Newey, aracın taban altındaki Venturi tünellerini her hızda asfalttan milimetrik sabit mesafede tutan ekstrem bir süspansiyon geometrisi (45 dereceyi aşan anti-dive ön salıncaklar ve anti-squat arka yapı) geliştirdi.',
    aerodynamicsEn: 'Hyper-efficient beam wing and DRS interaction, shedding massive drag down straights while developing crushing suction through high-speed sweeps.',
    aerodynamicsTr: 'Düzlüklerde sürtünmeyi yok eden, yüksek hızlı virajlarda ise ezici bir yer çekim vakumu üreten hiper verimli DRS ve kiriş kanat etkileşimi.',
    legacyEn: 'The most statistically dominant car ever created in Grand Prix history: 21 wins in 22 races (95.45% win rate), obliterating the 35-year record of the McLaren MP4/4.',
    legacyTr: 'Grand Prix tarihinin istatistiksel olarak en baskın aracı: 22 yarışta 21 galibiyet (%95.45 kazanma oranı) ile McLaren MP4/4\'ün 35 yıllık rekorunu tarihe gömdü.',
    accentColor: '#1e41ff',
    secondaryColor: '#f5d300',
    relatedGlossaryTerms: ['Ground Effect', 'Porpoising', 'Venturi Tunnels', 'DRS', 'Downforce'],
    cadSilhouetteSvg: 'M 10 71 L 62 71 L 84 53 L 142 42 L 215 35 L 275 35 L 320 44 L 372 48 L 430 48 L 456 63 L 482 63 L 482 73 L 416 73 L 404 65 L 352 65 L 340 73 L 130 73 L 118 65 L 72 65 L 60 73 Z',
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
