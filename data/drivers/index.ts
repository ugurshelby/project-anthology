/**
 * Editorial profiles for the current grid, in the Apex house voice
 * (docs/F1_Anlati_Stil_Kilavuzu.md & docs/F1_Anlati_Stil_Kilavuzu_v2.md §7.C):
 * a thesis in the first lines, facts that can be checked, one short sentence
 * that lands decisively. Every claim here was checked against the F1 history
 * index or is a widely documented fact; statistics that change (wins, podiums,
 * points) live in the data, not in this prose.
 *
 * English is the base text; `tr` holds the Turkish version of the same profile.
 */

export interface DriverChapter {
  title: string;
  text: string;
  era?: string;
}

export interface DriverQuote {
  text: string;
  context: string;
  year?: number;
}

export interface DriverLoreText {
  /** The core editorial narrative opening and synthesis in the Apex house voice. */
  bio: string;
  /** Concrete milestones ("year: event"). Flexible length. */
  milestones: string[];
  /** Checked detail / signature lore. */
  lore: string;
  /** Deep narrative chapters for legendary or multi-era drivers (Hamilton, Alonso, Verstappen). */
  chapters?: DriverChapter[];
  /** Verified primary source quote carrying the driver's inner philosophy. */
  quote?: DriverQuote;
}

export interface DriverLore extends DriverLoreText {
  /** Ergast/Jolpica driverId — matches URL slug. */
  driverId: string;
  /** Permanent race number. */
  number: number | null;
  /** Short nationality label (English). */
  nationality: string;
  /** Birth year. */
  born: number;
  /** Turkish version of the text fields. */
  tr: DriverLoreText;
}

const DRIVERS: DriverLore[] = [
  {
    driverId: 'hamilton',
    number: 44,
    nationality: 'British',
    born: 1985,
    bio: 'Lewis Hamilton reached Formula 1 in 2007 and rewrote the statistical boundaries of global motorsport. Missing the world title by a single point in his rookie season, he clinched his maiden crown on the final corner in Brazil in 2008. His 2013 move to Mercedes was widely labeled a gamble; it became the most devastating dynasty of the hybrid era, yielding six more titles and 84 grand prix victories. In 2025, at 40 years old, he began again in Ferrari red.',
    chapters: [
      {
        title: 'The Silver Prodigy',
        era: '2007–2012',
        text: 'Mentored by Ron Dennis, Hamilton pushed Fernando Alonso to the brink as a rookie before claiming the 2008 world championship on the soaking final lap at Interlagos.',
      },
      {
        title: 'The Brackley Hegemony',
        era: '2013–2021',
        text: 'Persuaded by Niki Lauda to join Mercedes, Hamilton dismantled records across the V6 hybrid turbo era, equaling Michael Schumacher’s benchmark seven world titles.',
      },
      {
        title: 'The Maranello Pilgrimage',
        era: '2025–',
        text: 'A seismic late-career transition to Scuderia Ferrari, uniting Formula 1’s most decorated driver with its most storied institution in pursuit of an eighth world crown.',
      },
    ],
    milestones: [
      '2007: sensational rookie campaign, missing the title by one point',
      '2008: first world championship, clinched on the final corner in Brazil',
      '2013: departs McLaren for Mercedes-AMG',
      '2020: equal Michael Schumacher with a seventh world championship',
      '2025: joins Scuderia Ferrari at age 40',
    ],
    lore: 'He won for the first time in his sixth Grand Prix, Canada 2007, and took pole position the same weekend: the first of more than 100 victories.',
    tr: {
      bio: 'Lewis Hamilton 2007’de Formula 1’e geldi ve ilk sezonunda şampiyonluğu tek bir puanla kaçırdı. Brezilya 2008’in son virajına kadar beklemedi: ilk unvan son yüz metrede geldi. 2013’te Mercedes’e geçişi o gün bir kumar sayılıyordu; V6 hibrit çağında altı şampiyonluk daha ekleyerek Michael Schumacher’in rekorlarına ortak oldu. 2025’te, 40 yaşında, sekizinci unvanın peşinde Ferrari kırmızısına büründü.',
      chapters: [
        {
          title: 'Gümüş Mucize ve İlk Taç',
          era: '2007–2012',
          text: 'Ron Dennis himayesinde yetişen saf hız, Fernando Alonso ile fırtınalı çaylak ortaklığı ve 2008 Interlagos’un son metrelerinde gelen ilk dünya şampiyonluğu.',
        },
        {
          title: 'Brackley Hanedanı',
          era: '2013–2021',
          text: 'Niki Lauda’nın iknasıyla başlayan Mercedes çağı: 84 galibiyet, 78 pole pozisyonu ve hibrit dönemde kırılan akıl almaz istatistik rekorları.',
        },
        {
          title: 'Maranello Haccı',
          era: '2025–',
          text: 'Kırk yaşında Ferrari’ye geçiş: kariyerin son büyük sayfasında Enzo Ferrari’nin efsanesiyle birleşerek tarihin sekizinci unvanını aramak.',
        },
      ],
      milestones: [
        '2007: çaylak sezonunda şampiyonluğu tek puanla kaçırdı, ikinci oldu',
        '2008: Brezilya’nın son turunda ilk dünya şampiyonluğunu kazanır',
        '2013: McLaren’dan Mercedes-AMG’ye geçer',
        '2020: Michael Schumacher’e yetişerek yedinci dünya şampiyonluğunu alır',
        '2025: 40 yaşında Scuderia Ferrari’ye katılır',
      ],
      lore: 'İlk galibiyetini altıncı Grand Prix’sinde, 2007 Kanada’da aldı; aynı hafta sonu pole pozisyonunu da kazandı.',
    },
  },
  {
    driverId: 'max_verstappen',
    number: 1,
    nationality: 'Dutch',
    born: 1997,
    bio: 'Max Verstappen reached Formula 1 at 17 without a road driving license, forged through the relentless training of his father Jos. On his Red Bull debut in Spain 2016, he won to become the youngest grand prix victor in history. His maiden world championship was seized on the final lap of Abu Dhabi 2021; the titles that followed dismantled the record books entirely, including a staggering 19 victories from 22 races in 2023.',
    chapters: [
      {
        title: 'The Ruthless Prodigy',
        era: '2015–2020',
        text: 'A meteoric rise from Toro Rosso to victory on his Red Bull debut in Barcelona 2016, rewriting the rules of wheel-to-wheel racecraft with uncompromising aggression.',
      },
      {
        title: 'The Unstoppable Dynasty',
        era: '2021–2024',
        text: 'A titanic title fight against Hamilton in 2021 followed by the most statistically dominant campaigns in history: 15 wins in 2022 and 19 in 2023.',
      },
    ],
    milestones: [
      '2015: Formula 1 debut with Toro Rosso aged 17 years and 166 days',
      '2016: wins Spanish GP on Red Bull debut, youngest winner in F1 history',
      '2021: claims maiden world championship in Abu Dhabi finale',
      '2023: shatters records with 19 wins from 22 races in a single season',
    ],
    lore: 'He won 15 races in 2022 and 19 in 2023. No driver had ever won more than 13 in a single season before him.',
    tr: {
      bio: 'Max Verstappen 17 yaşında, henüz sivil ehliyeti dahi yokken Formula 1’e geldi; babası Jos’un sert tezgâhından geçmiş saf bir yarış makinesiydi. 2016 İspanya’da, Red Bull’daki ilk yarışında kazanarak tarihin en genç Grand Prix galibi oldu. İlk şampiyonluğu 2021 Abu Dabi’nin son turunda geldi; sonraki üç unvanı ise sporu tek taraflı bir güç gösterisine çevirdi: 2023’te 22 yarışın 19’unu kazanarak kırılması imkânsız bir sezon rekoru inşa etti.',
      chapters: [
        {
          title: 'Tavizsiz Çaylak ve İlk Zafer',
          era: '2015–2020',
          text: 'Toro Rosso günleri, Barcelona 2016’da ilk Red Bull yarışında gelen tarihi zafer ve savunma kurallarını yeniden yazdıran agresif tekerlek tekerleğe yarışçılık.',
        },
        {
          title: 'Zemin Etkisi Fırtınası',
          era: '2021–2024',
          text: '2021’deki destansı şampiyonluk savaşının ardından 2022’de 15, 2023’te 19 galibiyetle spor tarihinin en yıkıcı sezon üstünlüğü.',
        },
      ],
      milestones: [
        '2015: 17 yaş 166 günlükken Toro Rosso ile Formula 1 tarihinin en genç pilotu',
        '2016: Red Bull’daki ilk yarışında İspanya GP’sini kazanarak en genç galip unvanı',
        '2021: Abu Dabi finalinin son turunda ilk dünya şampiyonluğunu alır',
        '2023: 22 yarışın 19’unu kazanarak tek sezondaki en ezici rekoru kırar',
      ],
      lore: '2022’de 15, 2023’te 19 yarış kazandı. Ondan önce hiçbir sürücü bir sezonda 13’ten fazla yarış kazanmamıştı.',
    },
  },
  {
    driverId: 'alonso',
    number: 14,
    nationality: 'Spanish',
    born: 1981,
    bio: 'Fernando Alonso is Formula 1’s enduring paradox: can the most complete driver of a generation be measured by the titles he did not win? In 2005 and 2006 with Renault, he brought Michael Schumacher’s five-year reign to an end. In 2010 and 2012, driving Ferrari machinery that had no business contending, he missed titles by a combined seven points. Into his forties with Aston Martin, his predatory racecraft remains the sharpest in the paddock.',
    chapters: [
      {
        title: 'The Matador & Giant Killer',
        era: '2001–2006',
        text: 'Emerging from Minardi to lead Flavio Briatore’s Renault squad, dethroning Michael Schumacher with back-to-back world championships.',
      },
      {
        title: 'The Defiant Near-Misses',
        era: '2010–2014',
        text: 'Wringing miracles from aerodynamically compromised Ferrari chassis, losing the 2010 and 2012 championships in dramatic season finales by four and three points.',
      },
      {
        title: 'The Unbroken Racer',
        era: '2021–',
        text: 'Returning after Le Mans triumphs to score podiums into his fifth decade with Aston Martin, proving that pure racecraft defies the passage of time.',
      },
    ],
    milestones: [
      '2001: Formula 1 debut with Minardi',
      '2003: maiden victory at the Hungarian Grand Prix',
      '2005 and 2006: back-to-back world championships with Renault',
      '2012: runner-up by three points with Ferrari in a legendary campaign',
      '2023: eight podiums with Aston Martin in his 20th Formula 1 season',
    ],
    lore: 'He returned in 2021 after two years away and finished third in Qatar, securing his first podium in seven years.',
    tr: {
      bio: 'Fernando Alonso, Formula 1’in yaşayan vicdanı ve en çetin paradoksudur: Bir kuşağın en eksiksiz yarışçısı, kazandığı iki şampiyonlukla mı, yoksa kaçırdığı üç şampiyonlukla mı ölçülür? 2005 ve 2006’da Renault ile Michael Schumacher hegemonyasını yıktı. 2010 ve 2012’de orada olmaması gereken Ferrari araçlarıyla şampiyonluğu toplam yedi puanla kaybetti. Kırklı yaşlarında Aston Martin ile podyumlar alırken hâlâ gridin en vahşi yarış zekâsıdır.',
      chapters: [
        {
          title: 'Devleri Yıkan Matador',
          era: '2001–2006',
          text: 'Minardi’de yağmur altındaki ilk kıvılcım ve Flavio Briatore ile Renault’da Schumacher’in beş yıllık hükümdarlığını sonlandıran iki ardışık dünya şampiyonluğu.',
        },
        {
          title: 'Kıl Payı Kaçan Mucizeler',
          era: '2010–2014',
          text: 'Red Bull’un aerodinamik olarak fersah fersah üstün olduğu yıllarda Ferrari’yi şampiyonluk kapısına kadar taşıyan ve Abu Dabi ile Interlagos finallerinde toplam yedi puanla kaçan unvanlar.',
        },
        {
          title: 'Yenilmez İnat',
          era: '2021–',
          text: 'Le Mans zaferlerinin ardından gride dönen, Aston Martin’de 40’lı yaşlarında gençleri tekerlek tekerleğe avlayan saf yarış tutkusu.',
        },
      ],
      milestones: [
        '2001: Minardi ile Formula 1’e ilk adım',
        '2003: Macaristan’da ilk zafer, dönemin en genç Grand Prix galibi',
        '2005 ve 2006: Renault ile art arda iki kez Dünya Şampiyonu',
        '2012: Ferrari ile destansı sezonda üç puan farkla ikincilik',
        '2023: Aston Martin ile 20. sezonunda sekiz podyum alarak zirvede kalır',
      ],
      lore: '2021’de iki yıllık aranın ardından döndü ve Katar’da üçüncü oldu; yedi yıl sonraki ilk podyumuydu.',
    },
  },
  {
    driverId: 'leclerc',
    number: 16,
    nationality: 'Monégasque',
    born: 1997,
    bio: 'Charles Leclerc grew up in the shadow of Sainte Dévote, carrying the memories of his late father Hervé and godfather Jules Bianchi. Following a dominant rookie F2 crown in 2017 and a standout year at Sauber, he joined Ferrari in 2019 and conquered Spa and Monza back-to-back, ending a nine-year drought at the Temple of Speed. His qualifying wizardry defies physics over a single lap, and in 2024 he finally shattered his hometown curse by winning the Monaco Grand Prix from pole position.',
    milestones: [
      '2017: FIA Formula 2 champion in his rookie season',
      '2019: back-to-back victories at Spa-Francorchamps and Monza for Ferrari',
      '2022: championship runner-up with three grand prix victories',
      '2024: wins the Monaco Grand Prix from pole position on home soil',
    ],
    lore: 'Ferrari had not won at Monza since Fernando Alonso in 2010. Leclerc ended the nine-year wait in 2019, from pole.',
    tr: {
      bio: 'Charles Leclerc, Monako’da Sainte-Dévote virajının gölgesinde büyüdü; babası Hervé ve manevi ağabeyi Jules Bianchi’nin hatırasıyla yarıştı. 2018’de Sauber çaylağı olarak parladı, 2019’da Ferrari’ye geçip Spa ve Monza’da art arda kazanarak Tifosi’nin kalbine taht kurdu. Tek turdaki hızının eşi benzeri yok; fakat şampiyonluk Maranello’nun operasyonel sancılarıyla hep bir adım ötede kaldı. 2024’te evinde, Monaco Grand Prix’sini kazanarak çocukluk lanetini nihayet kırdı.',
      milestones: [
        '2017: çaylak sezonunda FIA Formula 2 şampiyonu',
        '2019: Spa ve Monza’yı art arda kazanarak Ferrari’nin 9 yıllık ev hasretini bitirir',
        '2022: sezonu üç galibiyetle dünya ikincisi olarak tamamlar',
        '2024: Monako Grand Prix’sini pole pozisyonundan kazanarak ev lanetini kırar',
      ],
      lore: 'Ferrari Monza’da 2010’da Fernando Alonso’dan beri kazanamamıştı. Leclerc bu beklemeyi 2019’da pole’dan başlayarak bitirdi.',
    },
  },
  {
    driverId: 'norris',
    number: 4,
    nationality: 'British',
    born: 1999,
    bio: 'Lando Norris spent five patient seasons bearing the tag of the driver who would win one day. That day arrived in Miami 2024 on his 110th start, and in 2025 he became world champion, the year McLaren took its second consecutive constructors’ crown. His progression from midfield apprentice to title challenger is the story of modern McLaren itself: loyalty, relentless technical development, and ruthless speed when the opportunity appears.',
    milestones: [
      '2019: Formula 1 debut with McLaren at age 19',
      '2020: maiden podium at the Austrian Grand Prix',
      '2024: breakthrough victory at the Miami Grand Prix in his 110th start',
      '2024 and 2025: spearheads McLaren to back-to-back constructors’ titles',
    ],
    lore: 'He took his first career podium in 2020 at the Red Bull Ring with a blistering fastest lap on the final tour.',
    tr: {
      bio: 'Lando Norris ilk beş sezonunu, padoğun "bir gün kesin kazanır" dediği sürücü olarak geçirdi. O gün, 110. yarışında, 2024 Miami Grand Prix’sinde geldi. 2025’te dünya şampiyonu oldu; McLaren aynı yıl üst üste ikinci Markalar Şampiyonluğunu kazandı. Nezaketini kaybetmeyen ama sınırda acımasızlaşabilen modern şampiyon profili.',
      milestones: [
        '2019: 19 yaşında McLaren ile Formula 1’e adım atar',
        '2020: Avusturya GP’sinde son turdaki mor sektörle ilk podyumunu alır',
        '2024: 110. yarışında Miami Grand Prix’sini kazanarak şeytanın bacağını kırar',
        '2024–2025: McLaren’ı art arda iki Markalar Şampiyonluğuna taşır',
      ],
      lore: 'İlk podyumuna 2020’de Avusturya’da son turda attığı en hızlı tur sayesinde ulaştı.',
    },
  },
  {
    driverId: 'piastri',
    number: 81,
    nationality: 'Australian',
    born: 2001,
    bio: 'Oscar Piastri won Formula 3 in 2020 and Formula 2 in 2021 as a rookie on his first attempt. After a year on the sidelines that triggered a high-profile Contract Recognition Board ruling in McLaren’s favor, he arrived on the grid with unshakeable composure. Winning the Qatar sprint in his rookie year and claiming his first grand prix in Hungary 2024, Piastri represents a rare breed: zero theatricality, ice-cold telemetry precision.',
    milestones: [
      '2020: FIA Formula 3 champion in his rookie campaign',
      '2021: FIA Formula 2 champion in his rookie campaign',
      '2023: Qatar sprint victory and podium on debut season',
      '2024: maiden Grand Prix victory in Hungary',
    ],
    lore: 'Qatar 2023 saw him secure both a sprint win on Saturday and a grand prix podium on Sunday in his rookie season.',
    tr: {
      bio: 'Oscar Piastri çaylak sezonunda F3’ü (2020) ve F2’yi (2021) kazandı; bir yıl Alpine yedeği olarak bekledikten sonra mahkeme kararıyla McLaren’a geçti. 2023 Katar’da sprint yarışını kazandı, 2024 Macaristan’da ilk Grand Prix zaferine ulaştı. Telsizde nabzı yükselmeyen, hata yapmayan ve duygusunu piste yansıtmayan bir çelik zihin.',
      milestones: [
        '2020: çaylak sezonunda FIA Formula 3 şampiyonu',
        '2021: çaylak sezonunda FIA Formula 2 şampiyonu',
        '2023: ilk sezonunda Katar sprint zaferi ve podyum',
        '2024: Macaristan Grand Prix’sinde ilk Grand Prix zaferi',
      ],
      lore: 'Katar 2023’te cumartesi sprint zaferi, pazar günü ilk Grand Prix podyumu alarak tarihe geçti.',
    },
  },
  {
    driverId: 'russell',
    number: 63,
    nationality: 'British',
    born: 1998,
    bio: 'George Russell swept through GP3 and Formula 2 at the first time of asking before enduring a grueling three-year apprenticeship at the back of the grid with Williams. His stand-in drive for Mercedes at Sakhir 2020 offered a glimpse of championship caliber, cruelly denied by pit errors. Promoted to a permanent Mercedes seat in 2022, he scored his maiden grand prix win in Brazil. He is now the established technical spearhead of Brackley.',
    milestones: [
      '2017: GP3 champion in rookie season',
      '2018: FIA Formula 2 champion in rookie season',
      '2020: leads Sakhir GP as Mercedes substitute before pit-stop heartbreak',
      '2022: maiden Grand Prix victory at Interlagos in Brazil',
    ],
    lore: 'At the 2020 Sakhir GP standing in for Hamilton, he qualified second by 0.026s and led 59 laps before a puncture ended his victory bid.',
    tr: {
      bio: 'George Russell GP3 ve F2 şampiyonluklarının ardından üç yılını Williams’ın arka sıralarında çıraklık ederek geçirdi. 2020 Sakhir’de Hamilton’ın yerine Mercedes koltuğuna oturup yarışın büyük bölümünü lider götürdü; zafer talihsiz bir pit hatasıyla elinden alındı. 2022’de kalıcı koltuğu aldı ve Brezilya’da ilk galibiyetine ulaştı. Şimdi Mercedes garajının doğal lideridir.',
      milestones: [
        '2017: çaylak sezonunda GP3 şampiyonu',
        '2018: çaylak sezonunda FIA Formula 2 şampiyonu',
        '2020: Sakhir GP’sinde Mercedes vekili olarak yarışın büyük kısmını lider götürür',
        '2022: Brezilya GP’sinde ilk Grand Prix zaferini kazanır',
      ],
      lore: '2020 Sakhir Grand Prix’sinde Hamilton’ın yerine yarışırken yarışın büyük bölümünde lider gitti; geç gelen lastik patlağı zaferi elinden aldı.',
    },
  },
  {
    driverId: 'antonelli',
    number: 12,
    nationality: 'Italian',
    born: 2006,
    bio: 'Andrea Kimi Antonelli arrived in Formula 1 at 18 entrusted with the most heavily scrutinized seat of the modern era: the Mercedes drive vacated by Lewis Hamilton. Born in Bologna, he conquered Italian F4 in 2022 and FRECA in 2023, largely bypassing the conventional junior ladder to jump directly into the Brackley cockpit. Blessed with explosive natural car control, he was afforded almost no time to be an apprentice.',
    milestones: [
      '2022: Italian Formula 4 champion with 13 victories',
      '2023: Formula Regional European champion with Prema',
      '2024: multiple race winner in FIA Formula 2',
      '2025: Formula 1 debut with Mercedes-AMG at age 18',
    ],
    lore: 'Mercedes announced his promotion in late August 2024 at Monza before his maiden Formula 2 campaign had even concluded.',
    tr: {
      bio: 'Andrea Kimi Antonelli Formula 1’e 18 yaşında geldi ve padok tarihinin en ağır emanetini devraldı: Lewis Hamilton’ın boşalttığı Mercedes fabrika koltuğu. İtalyan F4 ve FRECA şampiyonluklarının ardından tek sezonluk F2 basamağını adeta atlayarak doğrudan Brackley’nin zirvesine fırlatıldı. Çaylak olmak için neredeyse hiç vakit tanınmadı; üzerindeki baskı devasa, saf yeteneği tartışmasız.',
      milestones: [
        '2022: 13 galibiyetle İtalyan Formula 4 şampiyonu',
        '2023: Formula Regional European şampiyonu',
        '2024: Prema ile Formula 2’de yarış galibi',
        '2025: 18 yaşında Mercedes-AMG ile Formula 1’e ilk adım',
      ],
      lore: 'Mercedes onu, Formula 2 sezonu daha bitmeden, Ağustos 2024’ün sonunda Monza’da açıkladı.',
    },
  },
  {
    driverId: 'sainz',
    number: 55,
    nationality: 'Spanish',
    born: 1994,
    bio: 'Carlos Sainz transformed the famous rally surname of his father into an analytical, cerebral art form. Across stints at Toro Rosso, Renault, McLaren, and Ferrari, he established a reputation as the driver engineers trust implicitly. Dropped by Ferrari for Hamilton in 2025, he responded by winning the Australian Grand Prix just two weeks after surgery for appendicitis, before joining Williams to lead an historic factory revival.',
    milestones: [
      '2015: Formula 1 debut with Toro Rosso alongside Verstappen',
      '2019: maiden podium in Brazil with McLaren',
      '2022: first pole position and grand prix win at Silverstone with Ferrari',
      '2024: heroic victory in Melbourne weeks after appendicitis surgery',
      '2025: signs with Williams Racing to anchor the team’s resurgence',
    ],
    lore: 'Ferrari announced Hamilton for 2025 in February 2024; Sainz responded weeks later by taking victory in Melbourne.',
    tr: {
      bio: 'Carlos Sainz iki kez dünya ralli şampiyonu babasının soyadını bir avantaja değil, bir zanaata dönüştürdü. Toro Rosso, Renault, McLaren ve Ferrari duraklarının hepsinde takımların vazgeçemediği teknik akıl oldu. Ferrari’nin 2025 için kendisini bıraktığını bildiği sezonda, apandisit ameliyatından iki hafta sonra Melbourne 2024’te zafere ulaştı. 2025’te Williams’a katılarak bağımsız bir devi ayağa kaldırma meydan okumasını üstlendi.',
      milestones: [
        '2015: Toro Rosso ile ilk Formula 1 yarışı',
        '2019: McLaren ile Brezilya’da ilk podyum',
        '2022: Silverstone’da Ferrari ile ilk pole ve ilk galibiyet',
        '2024: ameliyattan iki hafta sonra Melbourne GP zaferi',
        '2025: Williams Racing’e geçerek takımın yeniden doğuş lideri olur',
      ],
      lore: 'Ferrari Hamilton’ı 2025 için duyurduktan hemen sonra, Sainz Melbourne’de zafer kazanarak cevabını pistte verdi.',
    },
  },
  {
    driverId: 'albon',
    number: 23,
    nationality: 'Thai',
    born: 1996,
    bio: 'Alexander Albon has lived two Formula 1 careers. Promoted to Red Bull after just twelve races at Toro Rosso in 2019, he scored two podiums before losing his seat under the intense Milton Keynes spotlight. Spending 2021 as a reserve, he re-emerged with Williams in 2022 to become the undeniable technical pillar of Grove, demonstrating exceptional tyre defense and racecraft in machinery that frequently had to punch above its weight.',
    milestones: [
      '2019: rapid promotion to Red Bull Racing after half a rookie season',
      '2020: maiden Formula 1 podiums at Mugello and Bahrain',
      '2022: returns to Formula 1 with Williams Racing',
      '2023: spearheads Williams to seventh in the constructors’ championship',
    ],
    lore: 'At Monza in 2023, he defended seventh place against Lando Norris and Lewis Hamilton for over 30 consecutive laps.',
    tr: {
      bio: 'Alexander Albon Londra’da doğdu, Tayland bayrağı altında yarışıyor ve şimdiden iki farklı kariyer yaşadı. 2019’da Toro Rosso’daki 12 yarışın ardından Red Bull’a terfi etti, 2020’de iki podyum aldı ve yine de koltuğu kaybetti. 2021’i yedek olarak kenarda geçirdikten sonra 2022’de Williams ile döndü ve takımın vazgeçilmez belkemiği oldu.',
      milestones: [
        '2019: Toro Rosso’daki 12 yarışın ardından Red Bull’a terfi',
        '2020: Mugello ve Bahreyn’de Red Bull ile iki podyum',
        '2022: Williams ile Formula 1’e geri dönüş',
        '2023: Williams’ı markalar şampiyonasında yedinciliğe taşır',
      ],
      lore: '2023 Monza’da Lando Norris ve Lewis Hamilton’a karşı 30 tur boyunca kusursuz savunma yaparak P7’yi korudu.',
    },
  },
  {
    driverId: 'gasly',
    number: 10,
    nationality: 'French',
    born: 1996,
    bio: 'Pierre Gasly’s career is a masterclass in psychological resilience. Demoted from Red Bull to Toro Rosso after twelve races in 2019, he answered with a heroic second place in Brazil that autumn before claiming an emotional, red-flagged victory at Monza in 2020 for AlphaTauri. Now anchoring Alpine’s works program, Gasly turned career heartbreak into an indelible grand prix triumph.',
    milestones: [
      '2016: GP2 Series champion',
      '2019: demoted from Red Bull, claims sensational second place in Brazil',
      '2020: maiden Grand Prix victory at Monza for AlphaTauri',
      '2023: joins Alpine Formula One Team',
    ],
    lore: 'His Monza 2020 victory was the first Grand Prix win for a French driver since Olivier Panis at Monaco in 1996.',
    tr: {
      bio: 'Pierre Gasly’nin kariyeri, zihinsel direncin spor tarihindeki en güçlü derslerinden biridir. 2019’da Red Bull’dan Toro Rosso’ya geri gönderildikten sonra Brezilya’da podyumla, 2020’de ise Monza’da AlphaTauri ile tarihi bir galibiyetle yanıt verdi. 2023’ten bu yana Alpine’in fabrika projesini sırtlayan Gasly, düşüşü bir zafere çevirmeyi bildi.',
      milestones: [
        '2016: GP2 Series şampiyonu',
        '2019: Red Bull’dan geri gönderilip Brezilya’da P2 ile podyuma çıkar',
        '2020: Monza’da İtalya Grand Prix’sini kazanarak tarihi zafer alır',
        '2023: Alpine Formula 1 Takımı’na geçer',
      ],
      lore: 'Monza 2020, 1996 Monako’da Olivier Panis’ten bu yana bir Fransız pilotun kazandığı ilk Grand Prix zaferiydi.',
    },
  },
  {
    driverId: 'ocon',
    number: 31,
    nationality: 'French',
    born: 1996,
    bio: 'Esteban Ocon’s journey to Formula 1 was funded by family sacrifice and determined grit. Defeating Max Verstappen to the 2014 European F3 title, he reached F1 through Manor and Force India, weathered a year on the sidelines in 2019, and returned to claim Alpine’s historic victory at the 2021 Hungarian Grand Prix. Moving to Haas in 2025, his uncompromising racing style remains his defining trademark.',
    milestones: [
      '2014: FIA European Formula 3 champion ahead of Max Verstappen',
      '2016: Formula 1 debut with Manor Racing at Spa',
      '2021: breakthrough Grand Prix victory in Hungary for Alpine',
      '2025: moves to Haas F1 Team',
    ],
    lore: 'At Hungary in 2021, he defended the lead against Sebastian Vettel for 65 laps to claim his maiden victory.',
    tr: {
      bio: 'Esteban Ocon, karavanda yaşayan ailesinin fedakârlıklarıyla motor sporları basamaklarını tırmandı. 2014’te Max Verstappen’i geçerek Avrupa F3 şampiyonu oldu. Manor ve Force India günlerinin ardından bir yıl kenarda bekledi; 2021 Macaristan’da Alpine ile kariyerinin ilk ve tek Grand Prix zaferine ulaştı. 2025’te Haas’a katılarak yeni bir sayfa açtı.',
      milestones: [
        '2014: Max Verstappen’in önünde Avrupa F3 şampiyonu',
        '2016: Manor ile Belçika GP’sinde ilk F1 yarışı',
        '2021: Macaristan Grand Prix’sinde Alpine ile ilk zafer',
        '2025: Haas F1 Takımı’na transfer olur',
      ],
      lore: '2021 Macaristan’da Sebastian Vettel’e karşı 65 tur boyunca liderliği savunarak ilk zaferini kazandı.',
    },
  },
  {
    driverId: 'hulkenberg',
    number: 27,
    nationality: 'German',
    born: 1987,
    bio: 'Nico Hülkenberg carried a statistical anomaly nobody envied: over 200 grand prix starts without a podium. Yet the German’s raw speed was undisputed—GP2 champion in 2009, a stunning wet pole at Interlagos in 2010 for Williams, and overall victory at the 2015 24 Hours of Le Mans with Porsche on his debut. In 2025, his Silverstone podium for Sauber provided long-overdue justice before anchoring Audi’s works entry in 2026.',
    milestones: [
      '2009: GP2 Series champion in rookie campaign',
      '2010: sensational wet pole position in Brazil as a Williams rookie',
      '2015: wins the 24 Hours of Le Mans on his debut with Porsche',
      '2025: maiden Formula 1 podium at Silverstone after 230+ starts',
      '2026: leads Audi’s official works entry',
    ],
    lore: 'He won Le Mans in 2015 while actively competing as a full-time Formula 1 driver for Force India.',
    tr: {
      bio: 'Nico Hülkenberg kimsenin kıskanmadığı bir istatistiği sırtında taşıdı: podyumsuz 200’den fazla yarış. Fakat saf hızı hiçbir zaman sorgulanmadı: 2009 GP2 şampiyonu, 2010’da Williams ile Brezilya’da yağmurda pole, 2015’te Porsche ile ilk denemesinde Le Mans 24 Saat zaferi. 2025’te Sauber ile Silverstone’da nihayet podyuma çıkarak hak ettiği selamı aldı; 2026’da Audi fabrika takımının lideridir.',
      milestones: [
        '2009: çaylak sezonunda GP2 Series şampiyonu',
        '2010: Brezilya GP’sinde ıslak zeminde Williams ile pole pozisyonu',
        '2015: Porsche ile ilk denemesinde Le Mans 24 Saat galibi',
        '2025: 230’dan fazla yarışın ardından Silverstone’da ilk F1 podyumu',
        '2026: Audi fabrika projesine liderlik eder',
      ],
      lore: '2015’te Le Mans 24 Saat’i kazandığında aynı zamanda Force India ile aktif bir F1 pilotuydu.',
    },
  },
  {
    driverId: 'tsunoda',
    number: 22,
    nationality: 'Japanese',
    born: 2000,
    bio: 'Yuki Tsunoda arrived in Formula 1 with raw speed, backing from Honda, and volatile team radio communications. Across four seasons at Faenza, the Japanese driver matured into an exceptional qualifier and the clear leader of Racing Bulls. His explosive corner entry speed and relentless development established him as one of the most consistent performers in the modern midfield.',
    milestones: [
      '2020: top rookie in FIA Formula 2 with three victories',
      '2021: Formula 1 debut with AlphaTauri, fourth place at Abu Dhabi',
      '2024: clear team leader at Racing Bulls, scoring consistent points',
    ],
    lore: 'At Abu Dhabi in 2021, he qualified eighth and finished fourth, missing out on a maiden podium by less than a second.',
    tr: {
      bio: 'Yuki Tsunoda Formula 1’e Honda desteği, patlayıcı bir viraj giriş hızı ve ateşli telsiz konuşmalarıyla geldi. Faenza’da geçirdiği dört sezonda öfkesini olgunlaştırarak Racing Bulls’un tartışmasız liderine dönüştü. Tek turdaki hızı ve lastik yönetimindeki gelişimiyle modern orta sıranın en istikrarlı isimlerinden biridir.',
      milestones: [
        '2020: FIA Formula 2’de üç galibiyetle yılın çaylağı',
        '2021: AlphaTauri ile ilk F1 yarışı, Abu Dabi finalinde P4',
        '2024: Racing Bulls’un açık ara lideri olarak sürekli puan toplar',
      ],
      lore: '2021 Abu Dabi finalinde dördüncü bitirerek podyumu bir saniyeden az farkla kaçırdı.',
    },
  },
  {
    driverId: 'stroll',
    number: 18,
    nationality: 'Canadian',
    born: 1998,
    bio: 'Lance Stroll entered Formula 1 in 2017 shadowed by questions regarding his billionaire father’s wealth. Yet his career record provides concrete rejoinders: a podium in Baku as an 18-year-old rookie, a sensational wet-weather pole position at Istanbul Park in 2020, and multiple podium finishes across varying machinery. While driving for Aston Martin alongside Fernando Alonso, Stroll remains an enigmatic, wet-weather specialist.',
    milestones: [
      '2016: dominant FIA European Formula 3 champion',
      '2017: maiden podium in Baku with Williams in rookie season',
      '2020: sensational wet pole position at the Turkish Grand Prix',
      '2021: permanent anchor of Aston Martin’s works program',
    ],
    lore: 'His pole at Istanbul Park in 2020 was achieved in treacherous, freezing rain, beating Max Verstappen by nearly three tenths.',
    tr: {
      bio: 'Lance Stroll 2017’de Formula 1’e geldiğinden bu yana babasının servetiyle ilgili soruları sırtında taşıdı. Ancak kayıtlar somut cevaplar verir: 18 yaşında çaylakken Bakü’de podyum, 2020 İstanbul Park’ta dondurucu yağmurda tarihi bir pole pozisyonu ve üç podyum. Aston Martin’de Fernando Alonso ile yarışırken, özellikle ıslak zemin koşullarında gridin en tehlikeli yeteneklerinden biridir.',
      milestones: [
        '2016: ezici üstünlükle Avrupa Formula 3 şampiyonu',
        '2017: Williams ile Bakü’de 18 yaşında ilk F1 podyumu',
        '2020: Türkiye Grand Prix’sinde ıslak zeminde tarihi pole pozisyonu',
        '2021: Aston Martin fabrika projesinin değişmez pilotu',
      ],
      lore: '2020 İstanbul Park’taki pole pozisyonunu dondurucu sağanak altında Max Verstappen’in 0.3 saniye önünde aldı.',
    },
  },
  {
    driverId: 'bearman',
    number: 87,
    nationality: 'British',
    born: 2005,
    bio: 'Oliver Bearman was propelled onto the world stage at 18 when Carlos Sainz was struck by appendicitis at the 2024 Saudi Arabian Grand Prix. With just hours of preparation on the terrifying, high-speed Jeddah Corniche, Bearman qualified eleventh and finished seventh for Scuderia Ferrari. Securing a full-time Haas seat for 2025, the Briton validated his junior pedigree in a single, flawless afternoon.',
    milestones: [
      '2021: Italian and ADAC Formula 4 double champion',
      '2024: emergency Ferrari substitute in Saudi Arabia, finishing seventh',
      '2024: scores points for Haas at Baku as substitute driver',
      '2025: full-time Formula 1 debut campaign with Haas',
    ],
    lore: 'In Jeddah 2024, he held off Lando Norris and Lewis Hamilton in the closing laps to claim P7 on his debut.',
    tr: {
      bio: 'Oliver Bearman, 2024 Suudi Arabistan Grand Prix’sinde Carlos Sainz apandisitle hastaneye kaldırılınca 18 yaşında Ferrari kokpitine atıldı. Dünyanın en tehlikeli sokak pisti Cidde’de bir günden az hazırlıkla P7 bitirdi ve puan aldı. 2025 için Haas tam zamanlı koltuğunu kapan genç İngiliz, çaylak baskısını tek bir kusursuz yarışta darmadağın etti.',
      milestones: [
        '2021: İtalyan ve ADAC F4 çifte şampiyonu',
        '2024: Cidde’de Ferrari vekili olarak P7 bitirip ilk yarışında puan alır',
        '2024: Bakü’de Haas ile yarışıp yine puan alır',
        '2025: Haas F1 Takımı ile tam zamanlı ilk sezonuna başlar',
      ],
      lore: '2024 Cidde yarışının son turlarında Lando Norris ve Lewis Hamilton’ın baskısına direnerek yedinciliği korudu.',
    },
  },
  {
    driverId: 'bortoleto',
    number: 5,
    nationality: 'Brazilian',
    born: 2004,
    bio: 'Gabriel Bortoleto mirrored Oscar Piastri’s feat by capturing the FIA Formula 3 (2023) and Formula 2 (2024) titles back-to-back as a rookie. Entering Formula 1 in 2025 with Sauber, he became Brazil’s first full-time Formula 1 driver since Felipe Massa in 2017. Remaining with the Hinwil squad as it morphs into Audi in 2026, Bortoleto possesses an aggressive racing intellect mentored by Fernando Alonso.',
    milestones: [
      '2023: FIA Formula 3 champion in rookie season with Trident',
      '2024: FIA Formula 2 champion in rookie season with Invicta',
      '2025: Formula 1 debut with Sauber, first full-time Brazilian since Massa',
      '2026: anchors the Audi works project',
    ],
    lore: 'At Monza 2024 in Formula 2, he started last (P22) and drove through the entire field to win the feature race.',
    tr: {
      bio: 'Gabriel Bortoleto, Piastri’nin izinden giderek çaylak sezonlarında hem F3’ü (2023) hem F2’yi (2024) kazandı. 2025’te Sauber ile gride girerek Felipe Massa’nın 2017’deki vedasından sonra F1’de tam sezon yarışan ilk Brezilyalı oldu. Fernando Alonso’nun menajerliğinde yetişen genç yetenek, 2026’da Audi fabrika takımına dönüşecek yapının temel taşıdır.',
      milestones: [
        '2023: çaylak sezonunda FIA Formula 3 şampiyonu',
        '2024: çaylak sezonunda FIA Formula 2 şampiyonu',
        '2025: Sauber ile F1’e adım atar; Massa’dan sonra tam sezon yarışan ilk Brezilyalı',
        '2026: Audi fabrika takımının resmi pilotu olur',
      ],
      lore: '2024 Monza Formula 2 ana yarışında son sıradan (P22) başlayıp tüm grubu geçerek yarışı kazandı.',
    },
  },
  {
    driverId: 'colapinto',
    number: 43,
    nationality: 'Argentine',
    born: 2003,
    bio: 'Franco Colapinto ended Argentina’s 23-year Formula 1 exile when Williams called him up at Monza 2024 to replace Logan Sargeant. In just his second grand prix at Baku, he qualified ninth and scored eighth, matching Alex Albon’s pace immediately. Moving to Alpine, Colapinto electrified South American motorsport with fearless overtaking and infectious charisma.',
    milestones: [
      '2024: Formula 1 debut at Monza with Williams',
      '2024: eighth place in Baku, scoring points on his second grand prix',
      '2025: joins Alpine Formula One Team mid-season',
    ],
    lore: 'No Argentine had started a Formula 1 Grand Prix since Gastón Mazzacane in 2001.',
    tr: {
      bio: 'Franco Colapinto, Arjantin’in 23 yıllık Formula 1 hasretini 2024 Monza’da Williams kokpitine geçerek bitirdi. Yalnızca ikinci yarışı olan Bakü’de P8 bitirip puan alarak padoğu sarstı. Alpine’e transfer olan genç Arjantinli, korkusuz atakları ve Latin tutkusuyla gridin en çok konuşulan yeni figürlerinden biri oldu.',
      milestones: [
        '2024: Monza’da Williams ile Formula 1’e adım atar',
        '2024: Bakü’de ikinci yarışında sekizinci olarak puan alır',
        '2025: sezon ortasında Alpine’e katılır',
      ],
      lore: '2001’de Gastón Mazzacane’den bu yana Formula 1 yarışına çıkan ilk Arjantinli sürücüdür.',
    },
  },
  {
    driverId: 'hadjar',
    number: 6,
    nationality: 'French',
    born: 2004,
    bio: 'Isack Hadjar, dubbed the "Little Prost" by Helmut Marko, endured the cruelest grand prix debut when he crashed on the formation lap at Melbourne in 2025. Five months later, he answered with a blistering podium finish at Zandvoort. Formula 2 runner-up in 2024, Hadjar’s raw qualifying pace and aggressive racecraft secured him a Red Bull Racing seat for 2026.',
    milestones: [
      '2024: FIA Formula 2 championship runner-up with four wins',
      '2025: debut season with Racing Bulls, podium at the Dutch Grand Prix',
      '2026: promoted to Oracle Red Bull Racing',
    ],
    lore: 'Helmut Marko personally championed his career from Formula Regional, noting his Alain Prost-like cerebral race management.',
    tr: {
      bio: 'Helmut Marko tarafından "Küçük Prost" olarak nitelendirilen Isack Hadjar, 2025 Melbourne’deki ilk yarışında formasyon turunda kaza yaparak kariyerinin en acı başlangıcını yaşadı. Beş ay sonra Zandvoort’ta podyuma çıkarak cevabını verdi. 2024 F2 ikincisi olan Hadjar, saf hızıyla 2026’da Red Bull Racing koltuğunu kazandı.',
      milestones: [
        '2024: dört galibiyetle FIA Formula 2 ikincisi',
        '2025: Racing Bulls ile ilk sezonunda Hollanda GP’sinde podyum',
        '2026: Oracle Red Bull Racing fabrika takımına terfi eder',
      ],
      lore: 'Helmut Marko onun Alain Prost’u andıran zihinsel yarış yönetimini keşfedip bizzat arkasında durmuştur.',
    },
  },
  {
    driverId: 'lawson',
    number: 30,
    nationality: 'New Zealander',
    born: 2002,
    bio: 'Liam Lawson made emergency substitution his superpower. Stepping in for an injured Daniel Ricciardo at AlphaTauri in 2023, he qualified brilliantly and scored points in the sweltering heat of Singapore. After patient reserve duty, Lawson earned permanent status within the Red Bull family, known for unrelenting wheel-to-wheel tenacity.',
    milestones: [
      '2022: third in FIA Formula 2 and Super Formula runner-up in 2023',
      '2023: points finish in Singapore as emergency AlphaTauri stand-in',
      '2025: permanent full-time seat within the Red Bull Racing / RB pool',
    ],
    lore: 'At Singapore in 2023, he knocked Max Verstappen out of Q2 in qualifying on one of Red Bull’s toughest weekends.',
    tr: {
      bio: 'Liam Lawson acil durum vekilliğini süper gücüne dönüştürdü. 2023’te Daniel Ricciardo eli kırılınca AlphaTauri’ye çağrıldı ve Singapur’un cehennem sıcağında puan aldı. Red Bull ailesi içinde pes etmeyen tekerlek tekerleğe inadıyla kalıcı koltuğu kazandı.',
      milestones: [
        '2022: FIA Formula 2 üçüncüsü ve Japonya Super Formula ikincisi',
        '2023: acil vekil olarak girdiği Singapur GP’sinde puan alır',
        '2025: Red Bull / Racing Bulls havuzunda tam zamanlı kalıcı pilot olur',
      ],
      lore: '2023 Singapur sıralama turlarında Max Verstappen’i Q2’de eleyerek dikkatleri üzerine çekti.',
    },
  },
  {
    driverId: 'bottas',
    number: 77,
    nationality: 'Finnish',
    born: 1989,
    bio: 'Valtteri Bottas spent five seasons at Mercedes as the dependable cornerstone of the most dominant era in Formula 1 history. Securing ten grand prix victories, twenty pole positions, and contributing to five consecutive constructors’ titles, the Flying Finn re-established his identity at Alfa Romeo and Sauber before anchoring Cadillac’s maiden Formula 1 campaign in 2026.',
    milestones: [
      '2013: Formula 1 debut with Williams, maiden podium in Austria 2014',
      '2017: first grand prix win in Russia with Mercedes-AMG',
      '2017 to 2021: five consecutive constructors’ world titles with Mercedes',
      '2026: anchors Cadillac Formula 1 Team’s inaugural grid entry',
    ],
    lore: 'Signed by Mercedes in January 2017 following Nico Rosberg’s shock retirement, Bottas won his fourth race for the team in Sochi.',
    tr: {
      bio: 'Valtteri Bottas beş yıl boyunca Mercedes’in tarihteki en baskın döneminin vazgeçilmez taşı oldu. 10 Grand Prix zaferi, 20 pole pozisyonu ve beş Markalar Şampiyonluğu kazandırdı. Alfa Romeo ve Sauber’de yarışçı kimliğini özgürleştiren Fin pilot, 2026’da Cadillac’ın ilk F1 macerasını tecrübesiyle yönetmektedir.',
      milestones: [
        '2013: Williams ile F1’e ilk adım, 2014 Avusturya’da ilk podyum',
        '2017: Rusya Soçi’de Mercedes ile ilk Grand Prix zaferi',
        '2017–2021: Mercedes ile beş ardışık Markalar Şampiyonluğu',
        '2026: Cadillac F1 Takımı’nın kurucu kıdemli pilotu olur',
      ],
      lore: 'Nico Rosberg’in şok emekliliği sonrası Ocak 2017’de Mercedes’e katıldı ve dördüncü yarışında Soçi’de kazandı.',
    },
  },
  {
    driverId: 'perez',
    number: 11,
    nationality: 'Mexican',
    born: 1990,
    bio: 'Sergio Pérez is the legendary tyre whisperer of modern Formula 1. After podium heroics for Sauber and Force India, he took an iconic maiden victory at Sakhir in 2020 after dropping to dead last on the opening tour. Partnering Max Verstappen at Red Bull, he secured crucial victories at Monaco, Baku, and Singapore while helping capture consecutive constructors’ titles before bringing his veteran pedigree to Cadillac in 2026.',
    milestones: [
      '2011: Formula 1 debut with Sauber, podium in Malaysia 2012',
      '2020: wins Sakhir Grand Prix from last place on lap one for Racing Point',
      '2022: prestigious victory at the Monaco Grand Prix with Red Bull',
      '2026: joins Cadillac Formula 1 Team alongside Valtteri Bottas',
    ],
    lore: 'His Sakhir 2020 victory came in his 190th start, then the longest wait for a maiden win in Formula 1 history.',
    tr: {
      bio: 'Sergio Pérez modern Formula 1’in "lastik fısıldayıcısı"dır. Sauber ve Force India ile podyumlar aldıktan sonra 2020 Sakhir’de ilk turda sonuncu sıraya düşüp 87. turda zafere uzanarak tarihe geçti. Red Bull’da Monako, Bakü ve Singapur’da kazanıp Markalar unvanlarına katkı sağlayan tecrübeli Meksikalı, 2026’da Cadillac’ın öncüsüdür.',
      milestones: [
        '2011: Sauber ile ilk yarış, 2012 Malezya’da ıslakta ilk podyum',
        '2020: Racing Point ile sonunculuktan gelip Sakhir GP’sini kazanır',
        '2022: Red Bull ile prestijli Monaco Grand Prix zaferi',
        '2026: Valtteri Bottas ile birlikte Cadillac F1 Takımı’na katılır',
      ],
      lore: '2020 Sakhir galibiyeti 190. yarışında geldi; o dönem Formula 1 tarihindeki en uzun ilk galibiyet bekleyişiydi.',
    },
  },
  {
    driverId: 'doohan',
    number: 7,
    nationality: 'Australian',
    born: 2003,
    bio: 'Jack Doohan carries the motorsport pedigree of five-time MotoGP world champion Mick Doohan, translated into single-seater precision. A race winner in Formula 3 and Formula 2, he served as Alpine’s reserve driver before stepping into a full-time seat in 2025, bringing committed aggression and technical focus to Enstone.',
    milestones: [
      '2021: FIA Formula 3 championship runner-up with four wins',
      '2023: third in FIA Formula 2 with three feature race victories',
      '2025: full-time Formula 1 debut with Alpine',
    ],
    lore: 'His father Mick won five consecutive 500cc motorcycle world championships between 1994 and 1998.',
    tr: {
      bio: 'Jack Doohan, beş kez MotoGP dünya şampiyonu Mick Doohan’ın yarışçı genetiğini tek koltuklu Formula 1 saflığına taşıdı. F3 ve F2 galibiyetlerinin ardından Alpine’in test pilotu olarak pişti ve 2025’te Enstone’da tam zamanlı yarış koltuğuna oturdu.',
      milestones: [
        '2021: dört galibiyetle FIA Formula 3 ikincisi',
        '2023: üç ana yarış galibiyetiyle FIA Formula 2 üçüncüsü',
        '2025: Alpine ile tam zamanlı Formula 1 pilotu olur',
      ],
      lore: 'Babası Mick Doohan, 1994–1998 arasında art arda beş kez 500cc dünya şampiyonu olmuş efsanedir.',
    },
  },
  {
    driverId: 'lindblad',
    number: 41,
    nationality: 'British',
    born: 2007,
    bio: 'Arvid Lindblad was born in London in 2007 and enters Formula 1 as the youngest driver on the 2026 grid. A standout product of Red Bull’s junior academy, Lindblad claimed the Macau F4 World Cup and won in both F3 and F2 before earning promotion to Racing Bulls with an unblemished slate.',
    milestones: [
      '2023: wins the prestigious Macau Formula 4 World Cup',
      '2024: multiple race winner in FIA Formula 3',
      '2026: Formula 1 debut with Racing Bulls',
    ],
    lore: 'He became the first driver born in 2007 to start an official Formula 1 grand prix weekend.',
    tr: {
      bio: 'Arvid Lindblad 2007’de Londra’da doğdu ve 2026 gridinin en genç sürücüsü olarak Formula 1’e adım attı. Red Bull gençlik akademisinin en parlak ürünlerinden biri olarak Macau F4 ve alt serilerde kazandı; Racing Bulls koltuğunda geleceğini inşa etmeye başladı.',
      milestones: [
        '2023: prestijli Macau Formula 4 Dünya Kupası zaferi',
        '2024: FIA Formula 3’te çoklu yarış galibi',
        '2026: Racing Bulls ile Formula 1’e ilk adım',
      ],
      lore: '2007 doğumlu olup resmi bir Formula 1 yarış hafta sonuna çıkan ilk pilottur.',
    },
  },
];

const MAP = new Map(DRIVERS.map((d) => [d.driverId, d]));

/** Editorial profile of a driver; with `locale` "tr" the text fields are in Turkish. */
export function getDriverLore(driverId: string, locale?: string): DriverLore | null {
  const lore = MAP.get(driverId.toLowerCase());
  if (!lore) return null;
  if (locale !== 'tr') return lore;
  return { ...lore, ...lore.tr };
}
