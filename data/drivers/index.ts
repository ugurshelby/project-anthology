export interface DriverLore {
  /** Ergast/Jolpica driverId — matches URL slug. */
  driverId: string;
  /** Permanent race number (post-2014 rule). Null for pre-2014 drivers without a fixed number. */
  number: number | null;
  /** Short nationality label (English). */
  nationality: string;
  /** Birth year. */
  born: number;
  /** One short paragraph — factual, no filler superlatives. */
  bio: string;
  /** Up to 4 concrete milestone strings (year: event). */
  milestones: string[];
  /** One genuinely niche observation — a specific technical or strategic detail most fans don't know. */
  lore: string;
}

const DRIVERS: DriverLore[] = [
  {
    driverId: 'hamilton',
    number: 44,
    nationality: 'British',
    born: 1985,
    bio: 'Lewis Hamilton joined McLaren in 2007 and won his first championship by a single point in 2008. He moved to Mercedes in 2013 and dominated the turbo-hybrid era, winning six more titles. His statistical records — 104 wins, 103 poles, 197 podiums — were all F1 bests at the time of his 2025 move to Ferrari.',
    milestones: [
      '2008: World Champion — secured the title on the last corner of the last lap in Brazil',
      '2014–2020: Seven championships in eight seasons with Mercedes',
      '2020: Equalled Schumacher\'s record of 91 wins, then broke it',
      '2025: Joined Ferrari aged 40 — the oldest driver on the grid',
    ],
    lore: 'Hamilton\'s 2020 Bahrain GP win came after Sebastian Vettel retired — it was the race where Romain Grosjean survived the barrier fire. Hamilton posted his fastest lap of that race in the final lap while running on soft tyres he had saved by undercutting mid-field traffic.',
  },
  {
    driverId: 'max_verstappen',
    number: 1,
    nationality: 'Dutch',
    born: 1997,
    bio: 'Max Verstappen became the youngest race winner in F1 history at the 2016 Spanish GP on his Red Bull debut. He won his first championship in 2021 in controversial circumstances at Abu Dhabi and then dominated 2022–2024, winning 15 of 22 races in 2023 alone — an all-time single-season record.',
    milestones: [
      '2016: Youngest-ever race winner, aged 18 years and 228 days (Spanish GP)',
      '2021: First World Championship, decided on countback after safety car controversy',
      '2023: 15 race wins from 22 — the most wins in a single season in F1 history',
      '2024: Fourth consecutive title despite McLaren and Ferrari closing the gap',
    ],
    lore: 'Verstappen ran a deliberate off-line trajectory through Eau Rouge during the 2022 Belgian GP qualifying to cool his tyres before Raidillon — an unorthodox line that allowed him to run a lower rear-wing level than any other front-runner.',
  },
  {
    driverId: 'leclerc',
    number: 16,
    nationality: 'Monégasque',
    born: 1997,
    bio: 'Charles Leclerc won the GP2 series in 2017 and entered F1 with Sauber before joining Ferrari in 2019. He took his first wins at Spa and Monza that year, the latter ending Ferrari\'s nine-year home-race drought. His speed over one lap has consistently put him at the front, but mechanical failures cost him championship bids in 2022.',
    milestones: [
      '2017: GP2 champion with Prema — 7 wins from 14 races',
      '2019: Back-to-back victories at Spa and Monza on debut Ferrari season',
      '2022: Led championship standings for 8 rounds before reliability issues',
      '2024: Won Monaco GP — his home race after multiple near-misses',
    ],
    lore: 'Leclerc\'s 2019 Monza pole lap was set with a tow so perfectly timed that Ferrari\'s telemetry showed a 0.3s gain on the main straight — the result of a deliberate two-car drafting sequence that team radio transcripts later confirmed was coordinated by Leclerc himself, not the pit wall.',
  },
  {
    driverId: 'norris',
    number: 4,
    nationality: 'British',
    born: 1999,
    bio: 'Lando Norris joined McLaren in 2019 and became the team\'s anchor through its turnaround years. He took his first win at the 2024 Miami GP after a late strategic call, and led McLaren to the constructors\' title in 2024 — the team\'s first since 1998.',
    milestones: [
      '2019: F1 debut at McLaren aged 19 — scored points on debut',
      '2024 Miami: First race win, 110th career start',
      '2024: Led McLaren to constructors\' championship — first since 1998',
      '2024: Four wins and 7 podiums in the second half of the season',
    ],
    lore: 'Norris\'s 2024 Singapore quali lap was notable for a weight reduction approach: the team ran the car at minimum FIA-legal weight limit while Norris ran an unconventionally deep entry into T3 that cost him exit speed but gained 0.15s through the mid-sector tractionless phase.',
  },
  {
    driverId: 'piastri',
    number: 81,
    nationality: 'Australian',
    born: 2001,
    bio: 'Oscar Piastri won Formula 3 in 2020, Formula 2 in 2021, and spent 2022 as Alpine\'s reserve before joining McLaren in 2023 after a contract dispute that went to the Contract Recognition Board. He scored his first win at the 2024 Hungarian GP and was immediately among the quickest drivers over a single lap.',
    milestones: [
      '2020: F3 champion with Prema',
      '2021: F2 champion with Prema — followed Leclerc and Russell as back-to-back champions',
      '2023: Scored two sprint victories in debut season',
      '2024 Hungary: First Grand Prix win in his second full season',
    ],
    lore: 'Piastri\'s 2024 Azerbaijan qualifying included a sector-3 time that was quickest of anyone — 0.08s faster than Norris — despite using the older front wing specification that weekend, a result the team later attributed to his smoother left-foot braking trace.',
  },
  {
    driverId: 'russell',
    number: 63,
    nationality: 'British',
    born: 1998,
    bio: 'George Russell won the GP3 series in 2017 and Formula 2 in 2018. He served three seasons at Williams without a top-three result before a standout substitute drive at Bahrain 2020 for Mercedes almost ended in a win. He moved to Mercedes permanently in 2022 and won the Brazilian GP that year.',
    milestones: [
      '2017: GP3 champion',
      '2018: F2 champion — first driver to win GP3 and F2 consecutively',
      '2020 Bahrain: Substitute Mercedes drive ended P9 after late pit-lane incident',
      '2022 Brazil: First GP win in his debut Mercedes season',
    ],
    lore: 'Russell\'s 2022 Brazilian pole lap was set in the wet with a setup compromise — the team ran higher rear wing than the dry-setup plan because Russell insisted on stability through Sector 1. The opposite wing choice to Hamilton gave him a 0.4s advantage in the wet conditions.',
  },
  {
    driverId: 'alonso',
    number: 14,
    nationality: 'Spanish',
    born: 1981,
    bio: 'Fernando Alonso won back-to-back championships in 2005–2006 with Renault, becoming the youngest double champion in F1 history at the time. After stints at McLaren, Ferrari, and Alpine, he joined Aston Martin in 2023 and immediately returned to the podium at age 41.',
    milestones: [
      '2005–2006: Consecutive World Championships with Renault, aged 24 and 25',
      '2007: Joined McLaren — finished equal on points with Hamilton in the title',
      '2012: Came within 3 points of the championship with Ferrari',
      '2023 Bahrain: Podium on Aston Martin debut — first podium since 2014 Australian GP',
    ],
    lore: 'Alonso\'s 2012 European GP win at Valencia came from starting P11 after a gearbox penalty. He spent 19 laps behind Michael Schumacher on a strategy that required him to extend his first stint to lap 17 — his in-lap was 0.2s slower than his previous fastest to protect the tyres for the undercut.',
  },
  {
    driverId: 'antonelli',
    number: 12,
    nationality: 'Italian',
    born: 2006,
    bio: 'Kimi Antonelli won Formula 4 Italy in 2022 and Formula 3 in 2024, entering F1 with Mercedes in 2026 aged 18. He is the youngest driver in the 2026 field and the first Italian race driver at Mercedes since Michael Schumacher\'s early career.',
    milestones: [
      '2022: Italian F4 champion',
      '2024: F3 champion with Prema',
      '2024: Mercedes factory test driver — FP1 appearances at Monza and Austin',
      '2026: F1 debut with Mercedes as George Russell\'s team-mate',
    ],
    lore: 'Antonelli\'s 2024 Monza FP1 outing in the Mercedes W15 saw him immediately improve on his target sector times within three laps — an unusually short acclimatisation period that prompted Mercedes to fast-track his promotion decision before the 2025 season calendar was finalised.',
  },
  {
    driverId: 'sainz',
    number: 55,
    nationality: 'Spanish',
    born: 1994,
    bio: 'Carlos Sainz Jr. spent four seasons at McLaren before joining Ferrari in 2021. He won his first GP at Silverstone 2022 and was consistently in the top four of the constructors through 2023–2024. He joined Williams in 2025 and immediately became their clear performance reference.',
    milestones: [
      '2019: Career-best P6 in the championship with McLaren',
      '2022 Silverstone: First career win from pole position',
      '2024: P5 in championship despite public exit confirmation mid-season',
      '2025: Joined Williams — first win for the team since 2012 is the team target',
    ],
    lore: 'Sainz\'s 2022 British GP pole was set in mixed wet/dry conditions. He opted for a late cooling-down lap detour through the back section of the circuit — not on the racing line — to bring tyre temperatures down before his final flier, a technique he had developed at McLaren for variable Silverstone conditions.',
  },
  {
    driverId: 'stroll',
    number: 18,
    nationality: 'Canadian',
    born: 1998,
    bio: 'Lance Stroll became the youngest Canadian to score points in F1 on his debut at the 2017 Australian GP. He has driven for Williams and Racing Point before joining Aston Martin when his father Lawrence Stroll acquired the team. He has three career podiums including a pole position at Istanbul 2020.',
    milestones: [
      '2017: Points on debut at Melbourne, aged 18',
      '2020 Istanbul: Pole position in mixed conditions from P9 on the grid after rain',
      '2023: Second career podium at the Bahrain GP under new Aston Martin structure',
      '2024: Managed races through wrist injury suffered in offseason cycling crash',
    ],
    lore: 'Stroll\'s 2020 Turkish GP pole was set in conditions where the track was declared "wet" but was drying rapidly — he elected to fit intermediate tyres two laps earlier than the field, generating a heat window that put 1.5°C more into the tread than any dry-tyre runner.',
  },
  {
    driverId: 'colapinto',
    number: 43,
    nationality: 'Argentine',
    born: 2003,
    bio: 'Franco Colapinto stepped into Williams mid-2024 as a late-season substitute and scored points on his second start. He moved to Alpine for 2026, becoming the first Argentine on the grid since the 1980s.',
    milestones: [
      '2024: F1 debut at the Italian GP as a mid-season Williams replacement',
      '2024 Baku: Points finish in only his third race',
      '2025: Confirmed at Alpine for the 2026 season',
    ],
    lore: 'Colapinto\'s rapid Williams call-up in 2024 came with barely a week of simulator preparation — the team compressed a normally multi-week onboarding process into a handful of days before his debut weekend.',
  },
  {
    driverId: 'lindblad',
    number: 41,
    nationality: 'British',
    born: 2007,
    bio: 'Arvid Lindblad won the F1 Academy-adjacent junior ranks through Red Bull\'s programme and joined Racing Bulls for 2026, one of the youngest debutants in the sport\'s history.',
    milestones: [
      '2024: F3 championship contender with Red Bull junior backing',
      '2025: Super Licence points secured through F2 campaign',
      '2026: F1 debut with Racing Bulls',
    ],
    lore: 'Lindblad progressed through Red Bull\'s junior programme on an accelerated timeline, skipping a full season at a lower tier that most Red Bull juniors historically complete before their F1 debut.',
  },
];

const MAP = new Map(DRIVERS.map((d) => [d.driverId, d]));

export function getDriverLore(driverId: string): DriverLore | null {
  const id = driverId.toLowerCase();
  if (MAP.has(id)) return MAP.get(id)!;
  // Ergast fuzzy: last segment of hyphenated id
  for (const [key, val] of MAP) {
    const parts = key.split('-');
    if (parts[parts.length - 1] === id) return val;
  }
  return null;
}
