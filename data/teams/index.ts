/**
 * Editorial profiles for the current teams, in the Apex house voice
 * (docs/F1_Anlati_Stil_Kilavuzu.md & docs/F1_Anlati_Stil_Kilavuzu_v2.md §7.C):
 * institutional mythology, factory culture, verified milestones and founding ethos.
 *
 * English is the base text; `tr` holds the Turkish version.
 */

export interface TeamChapter {
  title: string;
  text: string;
  era?: string;
}

export interface TeamQuote {
  text: string;
  context: string;
  year?: number;
}

export interface TeamLoreText {
  /** The core editorial identity opening and synthesis in the Apex house voice. */
  bio: string;
  /** Concrete milestones ("year: event"). Flexible length. */
  milestones: string[];
  /** Checked detail or iconic heritage fact. */
  lore: string;
  /** Institutional legacy chapters (Maranello mythology, Ron Dennis factory culture, Adrian Newey aerodynamics, etc.). */
  chapters?: TeamChapter[];
  /** Verified founder or team quote. */
  quote?: TeamQuote;
}

export interface TeamLore extends TeamLoreText {
  /** Ergast/Jolpica constructorId — matches URL slug. */
  constructorId: string;
  /** Current entry name. */
  name: string;
  /** Country of team base. */
  country: string;
  /** First season in Formula 1 under this name. */
  founded: number;
  /** HQ location for map display (decimal degrees). */
  hq: { lat: number; lng: number; label: string };
  /** Turkish version of the text fields. */
  tr: TeamLoreText;
}

const TEAMS: TeamLore[] = [
  {
    constructorId: 'mercedes',
    name: 'Mercedes-AMG Petronas F1 Team',
    country: 'United Kingdom',
    founded: 2010,
    hq: { lat: 52.0406, lng: -1.0157, label: 'Brackley, UK' },
    bio: 'Mercedes-AMG is modern Formula 1’s ultimate engineering machine, proving that championships are won through forensic factory discipline in Brackley and Brixworth long before cars hit the track on a Sunday. After the mythic 1954–1955 W196 Silver Arrows era, it returned in 2010 by acquiring Brawn GP. When the hybrid regulations arrived in 2014, Mercedes had understood them first—unleashing an unprecedented run of eight consecutive constructors’ titles through 2021.',
    chapters: [
      {
        title: 'The Split-Turbo Revolution',
        era: '2014–2016',
        text: 'Engineers in Brixworth separated the turbine and compressor, unlocking a thermodynamic advantage that left rivals reeling while Lewis Hamilton and Nico Rosberg waged an intense intra-team civil war.',
      },
      {
        title: 'The Relentless Eight',
        era: '2017–2021',
        text: 'Repelling aggressive Ferrari championship bids through tactical execution and tyre science, securing eight consecutive constructors’ world crowns—the longest unbroken dynasty in Formula 1 history.',
      },
    ],
    milestones: [
      '1954: first season as a works team with the revolutionary W196',
      '2010: returns as a full works team after acquiring Brawn GP',
      '2014: first hybrid-era title, igniting eight consecutive world championships',
      '2025: 18-year-old Kimi Antonelli succeeds Lewis Hamilton',
    ],
    lore: 'The team’s 2014 title was the first of eight consecutive constructors’ championships, ending in 2021.',
    tr: {
      bio: 'Mercedes-AMG, yarışların pazar günü padokta değil, aylar önce Brackley ve Brixworth fabrikalarındaki mühendislik disiplininde kazanıldığını kanıtlayan modern Formula 1 makinesidir. 1954’teki W196 gümüş mirasının ardından 2010’da Brawn GP’yi devralarak geri döndü. 2014 hibrit regülasyonlarını padoğun geri kalanından önce çözdü ve 2014–2021 arasında art arda sekiz Markalar Şampiyonluğu kazanarak spor tarihinin en uzun hegomonyasını kurdu. Bu tür bir üstünlük tesadüfle değil, cerrahi fabrika kültürüyle inşa edilir.',
      chapters: [
        {
          title: 'Ayrık Turbo Devrimi',
          era: '2014–2016',
          text: 'Brixworth mühendislerinin geliştirdiği ayrık turbo mimarisi, Lewis Hamilton ve Nico Rosberg arasındaki garaj içi savaş sürerken rakipleri çaresiz bırakan bir güç üstünlüğü yarattı.',
        },
        {
          title: 'Sekiz Yıllık Hükümdarlık',
          era: '2017–2021',
          text: 'Ferrari’nin şampiyonluk tehditlerini taktiksel kusursuzluk ve lastik yönetimiyle savuşturup Formula 1 tarihinin en uzun markalar serisini tamamlama.',
        },
      ],
      milestones: [
        '1954: W196 ile fabrika takımı olarak ilk sezon',
        '2010: Brawn GP’yi satın alarak fabrika takımı olarak dönüş',
        '2014: hibrit çağının ilk şampiyonluğu ve art arda sekiz unvanın başlangıcı',
        '2025: 18 yaşındaki Kimi Antonelli, Hamilton’ın koltuğuna oturur',
      ],
      lore: 'Takımın 2014 şampiyonluğu, 2021’de biten art arda sekiz Markalar Şampiyonluğu’nun ilkiydi.',
    },
  },
  {
    constructorId: 'red_bull',
    name: 'Oracle Red Bull Racing',
    country: 'Austria',
    founded: 2005,
    hq: { lat: 52.1087, lng: -1.0254, label: 'Milton Keynes, UK' },
    bio: 'Red Bull entered Formula 1 as a drinks company and built an empire that dismantled the sport’s aristocratic elite. Born in 2005 from the remnants of Jaguar, Milton Keynes fused Adrian Newey’s aerodynamic genius with Helmut Marko’s ruthless junior driver academy and an uncompromising hunger to win. Four consecutive double world championships with Sebastian Vettel were followed by Max Verstappen’s record-shattering ground-effect era. They seek no paddock consensus; they manufacture raw speed.',
    chapters: [
      {
        title: 'The High-Rake Dynasty',
        era: '2010–2013',
        text: 'Pioneering exhaust-blown diffusers and aggressive high-rake floor concepts, carrying Sebastian Vettel to four consecutive drivers’ and constructors’ world titles.',
      },
      {
        title: 'The Ground-Effect Hegemony',
        era: '2021–2024',
        text: 'Surviving the dramatic 2021 finale to build the RB18 and RB19, rewriting Formula 1 history with 21 victories from 22 Grands Prix in 2023.',
      },
    ],
    milestones: [
      '2005: first season, transforming the Jaguar factory in Milton Keynes',
      '2009: first Grand Prix victory, China, with Sebastian Vettel',
      '2010 to 2013: four consecutive constructors’ and drivers’ world championships',
      '2023: 21 wins from 22 races, the most dominant season in Formula 1 history',
    ],
    lore: 'Max Verstappen won 19 Grands Prix in 2023 alone; no car in motorsport history had achieved such a win percentage.',
    tr: {
      bio: 'Red Bull, Formula 1’e bir içecek şirketinin pazarlama deneyi olarak giren ve padoktaki aristokrat devleri dize getiren bir yarış imparatorluğudur. 2005’te Jaguar’ın enkazından kurulan takım, Adrian Newey’nin aerodinamik dehasını, Helmut Marko’nun tavizsiz genç pilot fırınını ve acımasız bir kazanma kültürünü harmanladı. Sebastian Vettel ile dört, Max Verstappen ile dört ardışık şampiyonluk kazandı. Padokta dost aramazlar; sadece saf tur zamanı üretirler.',
      chapters: [
        {
          title: 'Vettel ve Üflemeli Difüzör Çağı',
          era: '2010–2013',
          text: 'Yüksek eğimli şasi (high-rake), egzoz gazıyla beslenen taban aerodinamisi ve Sebastian Vettel ile gelen dört ardışık çifte dünya şampiyonluğu.',
        },
        {
          title: 'Zemin Etkisi ve Verstappen Hükmü',
          era: '2021–2024',
          text: '2021 Abu Dabi finalinin ardından RB18 ve RB19 ile tarihin en ezici sezon dominasyonu: 2023’te 22 yarışın 21’ini kazanarak kırılan tarihi rekor.',
        },
      ],
      milestones: [
        '2005: Milton Keynes’teki eski Jaguar fabrikasında ilk sezon',
        '2009: ilk galibiyet, Çin GP, Sebastian Vettel',
        '2010–2013: art arda dört Markalar ve Sürücüler Dünya Şampiyonluğu',
        '2023: 22 yarışın 21’ini kazanarak Formula 1 tarihinin en baskın sezonu',
      ],
      lore: 'Verstappen, 2021’den 2024’e art arda dört yıl pilotlar şampiyonluğunu kazandı.',
    },
  },
  {
    constructorId: 'ferrari',
    name: 'Scuderia Ferrari',
    country: 'Italy',
    founded: 1950,
    hq: { lat: 44.5308, lng: 10.8611, label: 'Maranello, Italy' },
    bio: 'Ferrari is not merely a racing team; it is the fundamental axis of Formula 1, the only outfit to have contested every World Championship season since 1950. Every chassis rolling through the gates of Maranello carries the weight of a secular religion more fiercely guarded than the Italian state itself. It holds outright records for victories and titles, yet it also bears the heaviest burden of expectation in global sport. Every spring demands redemption; when it falls short, politics ignite, crisis follows, and the cycle begins anew.',
    chapters: [
      {
        title: 'The Patriarch’s Creed',
        era: '1950–1988',
        text: 'Enzo Ferrari’s uncompromising focus on the internal combustion engine and the pure racing ethos that forged the myth of the Prancing Horse across four decades.',
      },
      {
        title: 'The Schumacher Golden Age',
        era: '1996–2006',
        text: 'Jean Todt, Ross Brawn, Rory Byrne, and Michael Schumacher building the most clinical, invincible dynasty Formula 1 had ever witnessed—six consecutive constructors’ crowns.',
      },
      {
        title: 'The Red Renaissance',
        era: '2024–',
        text: 'Charles Leclerc breaking the emotional Monaco and Monza curses, setting the stage for Lewis Hamilton’s arrival in 2025 to pursue an historic eighth world championship.',
      },
    ],
    milestones: [
      '1950: World Championship debut at Monaco, the season’s second race',
      '1951: first Grand Prix victory, Silverstone, with José Froilán González',
      '1999 to 2004: six consecutive constructors’ world championships with Schumacher',
      '2025: seven-time world champion Lewis Hamilton joins Scuderia Ferrari',
    ],
    lore: 'Ferrari is the only team to have competed in every Formula 1 World Championship season since 1950.',
    tr: {
      bio: 'Ferrari yalnızca bir Formula 1 takımı değildir; şampiyonanın varoluş sebebidir ve 1950’den bu yana her sezonda start almış tek değişmezidir. Maranello’daki fabrika kapısından çıkan her şasi, sadece bir mühendislik ürünü değil, İtalyan devlet aygıtından ve kiliseden daha tutkulu bir inanç sisteminin bayrağıdır. En çok yarış ve en çok şampiyonluk rekoru ondadır; fakat en ağır bekleyişin faturası da Maranello’ya kesilir. Her bahar kazanmak zorundadırlar; kazanamadıklarında politika başlar, kriz büyür ve döngü baştan başlar.',
      chapters: [
        {
          title: 'Kurucunun İnadı',
          era: '1950–1988',
          text: 'Enzo Ferrari’nin içten yanmalı motora sarsılmaz bağlılığı ve Şahlanan At mitini inşa eden saf yarış tutkusu.',
        },
        {
          title: 'Schumacher Altın Çağı',
          era: '1996–2006',
          text: 'Jean Todt, Ross Brawn, Rory Byrne ve Michael Schumacher’in kurduğu kusursuz teşkilat: arka arkaya altı Markalar Şampiyonluğu ve sporu yeniden tanımlayan disiplin.',
        },
        {
          title: 'Kızıl Rönesans',
          era: '2024–',
          text: 'Charles Leclerc ile kırılan Monako ve Monza lanetleri, ardından 2025’te sekizinci unvan avı için Maranello’ya adım atan Lewis Hamilton.',
        },
      ],
      milestones: [
        '1950: sezonun ikinci yarışı Monaco GP ile dünya şampiyonasına ilk katılım',
        '1951: ilk Grand Prix zaferi, Silverstone, José Froilán González',
        '1999–2004: Michael Schumacher ile art arda altı Markalar Şampiyonluğu',
        '2025: yedi kez dünya şampiyonu Lewis Hamilton Ferrari’ye katılır',
      ],
      lore: 'Ferrari, 1950’den beri Formula 1 Dünya Şampiyonası’nın her sezonuna katılmış tek takımdır.',
    },
  },
  {
    constructorId: 'mclaren',
    name: 'McLaren Mastercard F1 Team',
    country: 'United Kingdom',
    founded: 1966,
    hq: { lat: 51.3427, lng: -0.5461, label: 'Woking, UK' },
    bio: 'McLaren is a monument of racing perfectionism stretching from Bruce McLaren’s muddy garage to Ron Dennis’s surgically sterile Woking Technology Centre. Present in Formula 1 since 1966, the team married raw garagiste tenacity with technological innovation and the fiercest intra-team rivalries the sport ever saw—Senna against Prost, Hamilton against Alonso. After years of painful wilderness, Andrea Stella’s forensic overhaul carried McLaren back to consecutive constructors’ crowns in 2024 and 2025.',
    chapters: [
      {
        title: 'Carbon Fibre & The MP4 Legacy',
        era: '1981–1993',
        text: 'John Barnard’s carbon-fibre monocoque revolution in the MP4/1, culminating in the peerless MP4/4 of 1988 that won 15 of 16 races under Senna and Prost.',
      },
      {
        title: 'The Silver Arrows Era',
        era: '1998–2008',
        text: 'Mika Häkkinen’s dual titles over Schumacher, followed by Lewis Hamilton clinching his maiden crown on the final corner of the 2008 Brazilian Grand Prix.',
      },
      {
        title: 'The Papaya Resurgence',
        era: '2024–',
        text: 'Lando Norris and Oscar Piastri leading McLaren back to the pinnacle of Formula 1, taking its first constructors’ titles since 1998, in 2024 and 2025.',
      },
    ],
    milestones: [
      '1966: Formula 1 debut at the Monaco Grand Prix',
      '1974: Emerson Fittipaldi delivers McLaren’s first constructors’ world title',
      '1988: the MP4/4 wins 15 of 16 Grands Prix in devastating fashion',
      '2024 and 2025: back-to-back constructors’ world championships',
    ],
    lore: 'McLaren has raced in every season since its 1966 debut.',
    tr: {
      bio: 'McLaren, Bruce McLaren’ın atölyesinden Ron Dennis’in cerrahi saflıktaki Woking Teknoloji Merkezi’ne uzanan bir mükemmeliyetçilik anıtıdır. 1966’dan bu yana sporda olan takım, ham garajist ruhunu padoğun en sert iç rekabetleriyle (Senna-Prost, Hamilton-Alonso) ve teknolojik öncülüğüyle birleştirdi. 1988’de MP4/4 ile 16 yarışın 15’ini kazanarak çağının sınırlarını çizdi. Yıllar süren krizlerin ardından küllerinden doğarak 2024 ve 2025’te Markalar Şampiyonluğu’nu geri aldı. Geri dönmeyi bilen bir takım.',
      chapters: [
        {
          title: 'Karbon Fiber Devrimi ve MP4 Çağı',
          era: '1981–1993',
          text: 'John Barnard’ın ilk karbon fiber şasisi MP4/1 ve Ron Dennis idaresinde Senna ile Prost’un Formula 1 tarihini değiştiren garaj içi savaşı.',
        },
        {
          title: 'Gümüş Oklar ve Son Viraj',
          era: '1998–2008',
          text: 'Mika Häkkinen’in Schumacher’e karşı iki unvanı ve Lewis Hamilton’ın 2008 Brezilya’da son virajda tek puanla kazandığı ilk şampiyonluk.',
        },
        {
          title: 'Papaya Rönesansı',
          era: '2024–',
          text: 'Andrea Stella yönetiminde orta sıralardan zirveye uzanan kusursuz teknik tırmanış: Lando Norris ve Oscar Piastri ile 1998’den sonra ilk Markalar zaferleri.',
        },
      ],
      milestones: [
        '1966: Formula 1’de ilk yarış, Monako GP',
        '1974: Emerson Fittipaldi ile ilk Markalar Şampiyonluğu',
        '1988: MP4/4 ile 16 yarışın 15’ini kazanarak ezici rekor',
        '2024 ve 2025: art arda Markalar Şampiyonluğu zaferleri',
      ],
      lore: 'McLaren, 1966’daki ilk yarışından beri her sezonda yarışmıştır.',
    },
  },
  {
    constructorId: 'aston_martin',
    name: 'Aston Martin Aramco F1 Team',
    country: 'United Kingdom',
    founded: 2021,
    hq: { lat: 52.0748, lng: -1.0302, label: 'Silverstone, UK' },
    bio: 'Aston Martin is the most ambitious reincarnation of a Silverstone racing pedigree tracing back to Jordan Grand Prix in 1991. Saved from administration in 2018 by Lawrence Stroll and transformed from Racing Point into British Racing Green in 2021, the operation invested in a state-of-the-art technological campus directly opposite the British Grand Prix circuit. Fernando Alonso’s arrival in 2023 produced eight podiums, signaling the team’s transformation from plucky underdog to frontline constructor.',
    milestones: [
      '1991: born as Jordan Grand Prix, winning four races over a decade',
      '2018: Stroll consortium rescues Force India, establishing Racing Point',
      '2021: rebrands as Aston Martin, returning the marquee to F1 after 61 years',
      '2023: Fernando Alonso scores eight podiums in a breakthrough campaign',
    ],
    lore: 'The Aston Martin name had last appeared on a Formula 1 grid in 1960.',
    tr: {
      bio: 'Aston Martin, çok eski bir yarış DNA’sının en modern ve iddialı adıdır. 1991’de Eddie Jordan’ın kurduğu ve sonrasında Force India ile Racing Point olarak orta sıralarda mucizeler yaratan fabrika, Lawrence Stroll’un konsorsiyumuyla yeşile büründü. Silverstone’da kurulan son teknoloji rüzgâr tüneli kampüsü ve Fernando Alonso’nun gelişiyle takım, podyum yarışçısından unvan adaylığına evrildi.',
      milestones: [
        '1991: Jordan Grand Prix adıyla kuruluş ve orta sıralarda parlayan miras',
        '2018: Stroll konsorsiyumu Force India’yı kurtarır, Racing Point kurulur',
        '2021: 61 yıl sonra Aston Martin adı resmi fabrika projesiyle gride döner',
        '2023: Fernando Alonso ilk sezonunda sekiz podyumla çıkış yapar',
      ],
      lore: 'Aston Martin adı Formula 1’de en son 1960’ta görülmüştü.',
    },
  },
  {
    constructorId: 'alpine',
    name: 'BWT Alpine Formula One Team',
    country: 'France',
    founded: 2021,
    hq: { lat: 51.9086, lng: -1.4339, label: 'Enstone, UK' },
    bio: 'Alpine represents the storied Enstone factory in Oxfordshire, an outfit that has reinvented itself repeatedly: Toleman, Benetton, Renault, Lotus, and Renault once more. This facility took Ayrton Senna to his first podium in 1984, carried Michael Schumacher to his maiden titles in 1994–1995, and toppled Ferrari with Fernando Alonso in 2005–2006. Under Alpine colors, Esteban Ocon’s sensational 2021 Hungarian Grand Prix triumph proved that Enstone’s giant-killing spirit never fades.',
    milestones: [
      '1984: Toleman takes Ayrton Senna to his maiden Formula 1 podium at Monaco',
      '1995: Benetton-Renault wins the constructors’ world championship from Enstone',
      '2005 and 2006: back-to-back world titles with Renault and Fernando Alonso',
      '2021: Esteban Ocon claims Alpine’s breakthrough victory in Hungary',
    ],
    lore: 'The 2005 and 2006 championships were won by the very same factory in Enstone that builds Alpine’s chassis today.',
    tr: {
      bio: 'Alpine, adını sporda en sık değiştirmiş ama ruhunu hep korumuş Enstone fabrikasının Fransız bayrağı altındaki son kalesidir. Toleman’da Ayrton Senna’nın ilk parıltısından, Benetton’da Michael Schumacher unvanlarına ve Renault’da Fernando Alonso zaferlerine kadar bu fabrika hep devleri devirmeyi bildi. 2021 Macaristan’da gelen sürpriz zafer, Enstone’un pes etmeyen genetiğinin kanıtıdır.',
      milestones: [
        '1984: Toleman, Ayrton Senna ile Monako’da ilk F1 podyumunu alır',
        '1995: Benetton-Renault Enstone’dan ilk Markalar Şampiyonluğu’nu çıkarır',
        '2005 ve 2006: Renault ve Fernando Alonso ile ardışık dünya şampiyonlukları',
        '2021: Esteban Ocon Macaristan GP’sinde Alpine’in ilk zaferini kazanır',
      ],
      lore: '2005 ve 2006 şampiyonluklarını, bugün Alpine’in şasilerini üreten Enstone’daki aynı fabrika kazandı.',
    },
  },
  {
    constructorId: 'williams',
    name: 'Williams Racing',
    country: 'United Kingdom',
    founded: 1978,
    hq: { lat: 51.3453, lng: -1.1385, label: 'Grove, UK' },
    bio: 'Williams is the noble bastion of the garagiste tradition, built from sheer grit by Sir Frank Williams and Patrick Head. From 1980 through 1997, Grove claimed nine constructors’ world championships and crowned seven different drivers’ champions, refusing to bow to manufacturer giants. Run as an unyielding family business until 2020, Williams is now undergoing a deep technical restoration under James Vowles, with Carlos Sainz’s arrival in 2025 heralding a serious return to front-running ambition.',
    milestones: [
      '1978: first season as Williams Grand Prix Engineering',
      '1980: Alan Jones delivers Williams’s maiden constructors’ and drivers’ titles',
      '1992: Nigel Mansell and the active-suspension FW14B dominate the sport',
      '1997: Jacques Villeneuve claims the team’s ninth constructors’ championship',
    ],
    lore: 'Williams has won nine constructors’ world championships; only Ferrari and McLaren have won more.',
    tr: {
      bio: 'Williams, bağımsız garajist geleneğinin Formula 1 tarihindeki en asil kalesidir. Sir Frank Williams ve Patrick Head’in neredeyse yoktan var ettiği takım, 1980 ile 1997 arasında 9 Markalar Şampiyonluğu kazandı ve yedi farklı pilotu dünya şampiyonu yaptı. Tekerlekli sandalyeden yönetilen bu aile takımı, büyük otomotiv devlerine boyun eğmedi. Carlos Sainz’ın 2025’te takıma katılması, Grove fabrikasında geçmişin şampiyonluk ciddiyetinin yeniden uyandığının en somut kanıtıdır.',
      milestones: [
        '1978: Williams Grand Prix Engineering olarak ilk tam sezon',
        '1980: Alan Jones ile ilk Markalar ve Sürücüler Dünya Şampiyonluğu',
        '1992: Nigel Mansell ve aktif süspansiyonlu FW14B çağı domine eder',
        '1997: Jacques Villeneuve ile dokuzuncu ve son Markalar Şampiyonluğu',
      ],
      lore: 'Takım dokuz Markalar Şampiyonluğu kazandı; ondan fazlasını yalnızca Ferrari ve McLaren kazandı.',
    },
  },
  {
    constructorId: 'haas',
    name: 'TGR Haas F1 Team',
    country: 'United States',
    founded: 2016,
    hq: { lat: 35.7279, lng: -80.8598, label: 'Kannapolis, NC, USA' },
    bio: 'Haas is Formula 1’s bold experiment in lean operational efficiency. Founded by American industrialist Gene Haas, the team stunned the paddock by scoring points on its debut in Australia 2016. Sourcing non-listed components from Ferrari and partnering with Dallara for chassis production, Haas demonstrated how much of a modern grand prix team can be outsourced. Under Ayao Komatsu, the team refined its technical execution, pairing Esteban Ocon with Oliver Bearman.',
    milestones: [
      '2016: Romain Grosjean finishes sixth in Australia on the team’s debut',
      '2018: achieves fifth place in the constructors’ standings, its best result',
      '2022: Kevin Magnussen takes a shock pole position in wet conditions at Interlagos',
      '2025: establishes a technical partnership with Toyota Gazoo Racing',
    ],
    lore: 'Haas scored points in its very first race in 2016, a feat achieved by only a handful of constructors in F1 history.',
    tr: {
      bio: 'Haas, modern Formula 1’in "daha az kaynakla daha fazlasını başarma" deneyidir. Amerikalı sanayici Gene Haas tarafından kurulan takım, 2016 Avustralya’daki ilk yarışında puan alarak gridin yerleşik düzenini sarstı. Ferrari’den izin verilen parçaları tedarik edip Dallara şasisini kullanan model, sporun ne kadarının dışarıdan sağlanabileceğini sorgulattı. Esteban Ocon ve Oliver Bearman ile takım yeni bir profesyonellik eşiğine adım attı.',
      milestones: [
        '2016: Romain Grosjean ile ilk yarışında P6 bitirerek tarihi başlangıç',
        '2018: Markalar sıralamasında beşincilik, takım tarihinin en iyi derecesi',
        '2022: Kevin Magnussen Brezilya’da ıslak zeminde tarihi pole pozisyonunu alır',
        '2025: Toyota Gazoo Racing ile teknik ortaklık kurarak güçlenir',
      ],
      lore: 'Haas, 2016’daki ilk yarışında puan alan ender takımlardan biridir.',
    },
  },
  {
    constructorId: 'rb',
    name: 'Visa Cash App Racing Bulls',
    country: 'Italy',
    founded: 2006,
    hq: { lat: 44.6952, lng: 11.1839, label: 'Faenza, Italy' },
    bio: 'Faenza operates with a dual mandate: fight ruthlessly in the midfield while forging Red Bull’s next world champion. Evolving from Gian Carlo Minardi’s beloved underdog outfit into Scuderia Toro Rosso, AlphaTauri, and now Racing Bulls, the Italian team produced two of the sport’s most romantic underdog triumphs—Sebastian Vettel in 2008 and Pierre Gasly in 2020, both at Monza: Vettel in the rain, Gasly after a red flag. The brand identities shift; the racing spirit of Faenza endures.',
    milestones: [
      '2006: Red Bull purchases Minardi, creating Scuderia Toro Rosso',
      '2008: 21-year-old Sebastian Vettel takes pole and victory at a wet Monza',
      '2020: Pierre Gasly claims an emotional victory at Monza as AlphaTauri',
      '2024: rebrands as Visa Cash App RB; Racing Bulls from 2025',
    ],
    lore: 'Both of the team’s historic Grand Prix victories were achieved at the Temple of Speed in Monza.',
    tr: {
      bio: 'Faenza merkezli takımın iki temel misyonu vardır: gridde savaşmak ve Red Bull’un bir sonraki dünya şampiyonunu yetiştirmek. Sevilen ve mütevazı Minardi’nin küllerinden Toro Rosso olarak doğan ekip, iki kez podyumun zirvesine çıktı: 2008’de Sebastian Vettel ve 2020’de Pierre Gasly ile; ikisi de Monza’da: Vettel yağmurda, Gasly kırmızı bayrak sonrası. İsimler Toro Rosso’dan AlphaTauri ve Racing Bulls’a evrilse de Faenza’nın saf yarış tutkusu hiç sönmedi.',
      milestones: [
        '2006: Red Bull Minardi’yi satın alır, Toro Rosso olarak yarışır',
        '2008: 21 yaşındaki Sebastian Vettel Monza’da pole ve galibiyet alır',
        '2020: Pierre Gasly AlphaTauri ile Monza’da unutulmaz bir zafer kazanır',
        '2024: Visa Cash App RB adını alır; 2025’ten itibaren Racing Bulls',
      ],
      lore: 'Takımın iki Grand Prix zaferi de İtalya’nın Hız Tapınağı Monza’da geldi.',
    },
  },
  {
    constructorId: 'kick_sauber',
    name: 'Stake F1 Team Kick Sauber',
    country: 'Switzerland',
    founded: 1993,
    hq: { lat: 47.4980, lng: 8.2185, label: 'Hinwil, Switzerland' },
    bio: 'Sauber has preserved an unbroken tradition of Swiss engineering craftsmanship in Hinwil since 1993. Founded by Peter Sauber, the team served as the launchpad for legends including Kimi Räikkönen, Felipe Massa, and Robert Kubica, who delivered the team’s sole victory at Canada in 2008 during the BMW Sauber partnership. Now preparing for the ultimate transition into the Audi factory squad, Hinwil stands on the precipice of a defining new era.',
    milestones: [
      '1993: debut at Kyalami, scoring points in its very first race',
      '2001: Kimi Räikkönen debuts and powers Sauber to fourth in the championship',
      '2008: Robert Kubica and Nick Heidfeld score a 1-2 finish in Montreal',
      '2026: Hinwil fully transitions into the official Audi works team',
    ],
    lore: 'Sauber scored points on its debut in 1993 with JJ Lehto finishing fifth in South Africa.',
    tr: {
      bio: 'Sauber, 1993’ten bu yana Peter Sauber’in kurduğu Hinwil’deki İsviçre fabrikasında tarafsız bir zanaatkârlıkla varlığını sürdüren köklü bir bağımsızdır. Kimi Räikkönen, Felipe Massa ve Robert Kubica gibi yıldızların ilk basamağı oldu. BMW ortaklığında 2008 Kanada zaferini tadan fabrika, şimdi motor sporlarının en büyük üreticilerinden birine, Audi fabrika takımına dönüşüyor.',
      milestones: [
        '1993: Kyalami’deki ilk yarışında JJ Lehto ile puan alarak giriş yapar',
        '2001: Kimi Räikkönen gride adım atar ve Sauber takımı dördüncü sıraya taşır',
        '2008: Robert Kubica ve Nick Heidfeld Montreal’de duble zafer elde eder',
        '2026: Hinwil resmen Audi fabrika takımına dönüşür',
      ],
      lore: 'Sauber, 1993’teki ilk yarışında beşinci olarak puan alma başarısı göstermişti.',
    },
  },
  {
    constructorId: 'audi',
    name: 'Audi Revolut F1 Team',
    country: 'Germany',
    founded: 2026,
    hq: { lat: 47.4980, lng: 8.2185, label: 'Hinwil, Switzerland' },
    bio: 'Audi did not enter Formula 1 to learn; it entered when the technical slate was wiped clean. Acquiring the Hinwil operation and developing a bespoke hybrid power unit at Neuburg an der Donau, the German manufacturer aligned its entry with the 2026 engine overhaul. Dominators of Le Mans, the World Rally Championship, and Dakar, Audi brings Teutonic industrial might to Formula 1 as a complete factory outfit.',
    milestones: [
      '2022: Audi officially announces its Formula 1 entry for 2026',
      '2024: acquires full ownership of Sauber Group to control chassis and power unit',
      '2026: first Grand Prix as a full works manufacturer',
    ],
    lore: 'Audi’s power unit is designed and built in Neuburg, Germany, the first Formula 1 engine built in Germany since BMW left after 2009.',
    tr: {
      bio: 'Audi, Formula 1’e katılmak için sıfırdan başlamadı; rüzgâr tüneli ve tesisleriyle padoğun en yetkin merkezlerinden Hinwil fabrikasını bünyesine katarak Neuburg an der Donau’da geliştirilen güç ünitesiyle birleştirdi. Le Mans ve Dünya Ralli Şampiyonası’nı domine eden Alman mühendislik devi, 2026 kural sıfırlamasını tam fabrika takımı olarak zirveye oynamak için seçti.',
      milestones: [
        '2022: Audi 2026 motor regülasyonlarıyla Formula 1’e gireceğini resmen duyurur',
        '2024: Sauber Grubu’nun tüm hisselerini satın alarak tam kontrolü sağlar',
        '2026: ilk yarışına tam teşekküllü bir fabrika takımı olarak başlar',
      ],
      lore: 'Audi’nin güç ünitesi Almanya Neuburg’da üretilmektedir; BMW’nin 2009 sonunda ayrılmasından bu yana Almanya’da üretilen ilk F1 motorudur.',
    },
  },
  {
    constructorId: 'cadillac',
    name: 'Cadillac Formula 1 Team',
    country: 'United States',
    founded: 2026,
    hq: { lat: 35.2271, lng: -80.8431, label: 'Charlotte, NC, USA' },
    bio: 'Cadillac is the eleventh team on the Formula 1 grid, breaking open an entry process that had rejected newcomers for years. Born from General Motors and TWG Global’s joint resolve, the American powerhouse established operational bases in Fishers, Charlotte, and Silverstone. Anchoring its maiden campaign with grand prix winners Valtteri Bottas and Sergio Pérez, Cadillac prioritized proven telemetry discipline and veteran racecraft over rookie volatility.',
    milestones: [
      '2024: General Motors registers with the FIA as a power unit manufacturer from 2028',
      '2025: approved by Formula 1 and the FIA as the championship’s eleventh constructor',
      '2026: debuts with race winners Valtteri Bottas and Sergio Pérez',
    ],
    lore: 'Cadillac is the first new constructor admitted to Formula 1 since Haas in 2016.',
    tr: {
      bio: 'Cadillac, yıllardır yeni katılımcılara kapıların kapalı tutulduğu Formula 1 padoğuna on birinci takım olarak adım atan Amerikan otomotiv devidir. General Motors ve TWG Global ortaklığında doğan proje, Indianapolis ve Charlotte tesislerinin gücünü gride taşıdı. Valtteri Bottas ve Sergio Pérez ikilisiyle yola çıkan ekip, ilk sezonunda deneyime ve sağlam temellere yaslanmayı seçti.',
      milestones: [
        '2024: General Motors, 2028’den itibaren güç ünitesi üreticisi olarak FIA’ya kayıt yaptırır',
        '2025: FIA ve F1 tarafından şampiyonanın 11. takımı olarak onaylanır',
        '2026: Valtteri Bottas ve Sergio Pérez tecrübesiyle ilk yarışına çıkar',
      ],
      lore: 'Cadillac, 2016’daki Haas katılımından bu yana Formula 1’e kabul edilen ilk yeni üreticidir.',
    },
  },
];

const MAP = new Map(TEAMS.map((t) => [t.constructorId, t]));

/** Editorial profile of a team; with `locale` "tr" the text fields are in Turkish. */
export function getTeamLore(constructorId: string, locale?: string): TeamLore | null {
  const lore = MAP.get(constructorId.toLowerCase());
  if (!lore) return null;
  if (locale !== 'tr') return lore;
  return { ...lore, ...lore.tr };
}
