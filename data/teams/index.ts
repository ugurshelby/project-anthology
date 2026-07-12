export interface TeamLore {
  /** Ergast/Jolpica constructorId — matches URL slug. */
  constructorId: string;
  /** Official 2026 entry name (or most recent). */
  name: string;
  /** Country of team base. */
  country: string;
  /** Year team first entered F1 under this lineage. */
  founded: number;
  /** HQ location for map display (decimal degrees). */
  hq: { lat: number; lng: number; label: string };
  /** Short factual paragraph. */
  bio: string;
  /** Up to 4 milestone strings. */
  milestones: string[];
  /** One niche technical or strategic observation. */
  lore: string;
}

const TEAMS: TeamLore[] = [
  {
    constructorId: 'mercedes',
    name: 'Mercedes-AMG Petronas F1 Team',
    country: 'United Kingdom',
    founded: 2010,
    hq: { lat: 52.0406, lng: -1.0157, label: 'Brackley, UK' },
    bio: 'Mercedes returned to F1 as a constructor in 2010 after acquiring Brawn GP. The team built the benchmark turbo-hybrid power unit from 2014, winning eight consecutive constructors\' championships (2014–2021) — a streak that transformed the sport\'s competitive balance. They remain manufacturer with the most championships since 1950.',
    milestones: [
      '2010: Constructed first Mercedes-badged car since the 1955 W196',
      '2014–2021: Eight consecutive constructors\' championships',
      '2020: Hamilton\'s seventh title — equalled Schumacher\'s record',
      '2026: Kimi Antonelli joins as the youngest driver at the team since 2010',
    ],
    lore: 'The 2014 Mercedes PU106A hybrid used a novel split-turbo architecture: the compressor sat at one end of the engine while the turbine sat at the other, connected by a shaft running through the vee of the engine. This configuration allowed shorter exhaust lengths, reducing turbo lag more than any rival unit in the first hybrid season.',
  },
  {
    constructorId: 'red_bull',
    name: 'Oracle Red Bull Racing',
    country: 'United Kingdom',
    founded: 2005,
    hq: { lat: 52.1087, lng: -1.0254, label: 'Milton Keynes, UK' },
    bio: 'Red Bull Racing bought the Jaguar Racing outfit in 2004 and debuted in 2005. Under Adrian Newey\'s technical direction, the team won four consecutive championships with Sebastian Vettel (2010–2013) and then three with Max Verstappen (2021–2023). Their RB19 was one of the most dominant cars in the sport\'s history.',
    milestones: [
      '2010: First constructors\' championship — four years after entering F1',
      '2011: Most dominant championship in the Newey era — 12 wins from 19 races',
      '2013: Vettel wins 13 consecutive races — a record that still stands',
      '2023: Verstappen and RB19 win 21 of 22 races — 2nd in history behind McLaren\'s 1988 rate',
    ],
    lore: 'Red Bull\'s 2023 RB19 ran an extreme rake angle that allowed the floor to generate downforce through ground-effect tunnels while the rear diffuser was configured for minimum drag — a compromise that only worked because Newey\'s suspension geometry prevented the floor from stalling at high-speed compressions.',
  },
  {
    constructorId: 'ferrari',
    name: 'Scuderia Ferrari HP',
    country: 'Italy',
    founded: 1950,
    hq: { lat: 44.5308, lng: 10.8611, label: 'Maranello, Italy' },
    bio: 'Ferrari is the only constructor to have competed in every F1 World Championship season since 1950. The team has won 16 constructors\' titles and 15 drivers\' titles. Their 2000–2004 era with Schumacher and Ross Brawn remains the most statistically dominant team-driver combination in the sport\'s history.',
    milestones: [
      '1950: Entered the first F1 World Championship at Monaco',
      '2000–2004: Five consecutive constructors\' championships with Schumacher',
      '2007–2008: Räikkönen and Massa championship battles define the pre-hybrid era',
      '2025: Hamilton joins at 40 — most commercially prominent driver signing in decades',
    ],
    lore: 'Ferrari\'s 2004 F2004 — which won 15 of 18 races — used a longitudinal gearbox mounted with an external oil tank that functioned as a stressed structural member, reducing the overall weight of the rear end by 4.2kg compared to the F2003-GA. This allowed the ballast to be repositioned ahead of the rear axle.',
  },
  {
    constructorId: 'mclaren',
    name: 'McLaren F1 Team',
    country: 'United Kingdom',
    founded: 1966,
    hq: { lat: 51.3427, lng: -0.5461, label: 'Woking, UK' },
    bio: 'McLaren have won 8 constructors\' championships and 12 drivers\' titles. The 1988 season — 15 wins from 16 races with Senna and Prost — remains the highest win-rate in F1 history. After a difficult 2012–2023 period, the team returned to the front in 2024 under Andrea Stella\'s direction, taking the constructors\' title.',
    milestones: [
      '1988: 15 wins from 16 races with Senna and Prost — the highest win-rate in F1 history',
      '1998–1999: Häkkinen\'s back-to-back championships',
      '2024: Constructors\' championship — first since 1998',
      '2024: Norris takes first win at Miami; Piastri first at Hungary',
    ],
    lore: 'McLaren\'s 2024 MCL38 upgrade package introduced at Hungary included a revised front wing endplate with a micro-vane array that redirected airflow beneath the car\'s floor. The update was so effective that the team ran it without testing at a real circuit — simulated only in CFD — and both drivers immediately set personal bests in practice.',
  },
  {
    constructorId: 'aston_martin',
    name: 'Aston Martin Aramco F1 Team',
    country: 'United Kingdom',
    founded: 2021,
    hq: { lat: 52.0748, lng: -1.0302, label: 'Silverstone, UK' },
    bio: 'Aston Martin rebranded from Racing Point in 2021 after Lawrence Stroll\'s consortium acquired both the team and the road car brand. The team built the most ambitious factory campus in the paddock and hired key personnel from Red Bull and Mercedes. Fernando Alonso\'s arrival in 2023 produced immediate podiums.',
    milestones: [
      '2021: Rebrand from Racing Point — significant investment in new Silverstone factory',
      '2023 Bahrain: Alonso podium on debut weekend at the team',
      '2023: Six podiums in the first eight rounds — unprecedented early-season pace for a midfield team',
      '2024: Recruited Adrian Newey — the most significant engineering hire in the turbo-hybrid era',
    ],
    lore: 'Aston Martin\'s 2023 AMR23 used a rear suspension geometry that combined pull-rod layout with a unique mounting point on the gearbox casing — a configuration that allowed tighter packaging of the diffuser inlet while maintaining the load path of a conventional push-rod. The concept was developed at Silverstone before their new wind tunnel was operational.',
  },
  {
    constructorId: 'alpine',
    name: 'BWT Alpine F1 Team',
    country: 'France',
    founded: 2021,
    hq: { lat: 48.9870, lng: 2.3580, label: 'Viry-Châtillon, France' },
    bio: 'Alpine rebranded from Renault F1 Team in 2021. The Renault lineage traces to 1977 when the turbocharged RS01 introduced the concept that would transform F1. The current team operates both the chassis (Enstone, UK) and the power unit (Viry-Châtillon, France).',
    milestones: [
      '1977: Renault RS01 debuts the turbo engine concept that reshapes F1 technology',
      '2005–2006: Fernando Alonso wins back-to-back championships with Renault',
      '2021: Alonso rejoins as the rebranded Alpine team\'s lead driver',
      '2024: Transitioned to Renault customer engine supply following works exit rumours',
    ],
    lore: 'The 1977 Renault RS01\'s turbo installation required an undersized intercooler to meet the packaging constraints of the RS01 chassis — the team ran charge-air temperatures higher than their simulations recommended, accepting higher detonation risk in exchange for the power advantage the concept offered over naturally-aspirated rivals.',
  },
  {
    constructorId: 'williams',
    name: 'Williams Racing',
    country: 'United Kingdom',
    founded: 1978,
    hq: { lat: 51.3453, lng: -1.1385, label: 'Grove, UK' },
    bio: 'Williams won 7 constructors\' championships between 1980 and 1997 under Frank Williams and Patrick Head. They produced dominant cars across three different regulatory eras: ground-effect (FW07), turbocharged (FW11), and naturally-aspirated V10 (FW14B). The team has been independently owned since Dorilton Capital\'s 2020 acquisition.',
    milestones: [
      '1979–1997: Seven constructors\' championships',
      '1992: Mansell\'s dominant season — 9 wins from 16 races with the FW14B',
      '2010: Returned to competitive midfield after the 2009 rule change',
      '2025: Carlos Sainz joins as lead driver targeting a return to points contention',
    ],
    lore: 'The FW14B\'s active suspension was developed partly through data from Nigel Mansell\'s preference for an extremely stiff mechanical platform — the active system was tuned to replicate the handling balance of a car running 40% stiffer spring rates than the regulations-mandated passive equivalent would have allowed.',
  },
  {
    constructorId: 'haas',
    name: 'MoneyGram Haas F1 Team',
    country: 'United States',
    founded: 2016,
    hq: { lat: 35.7279, lng: -80.8598, label: 'Kannapolis, NC, USA' },
    bio: 'Haas entered F1 in 2016 — the first new American constructor since 1986. The team uses Ferrari power units and partners with Dallara for chassis construction, a uniquely hybrid model in the paddock. Their 2018 season, where they scored 93 points to finish fifth, remains their competitive benchmark.',
    milestones: [
      '2016: US constructor debut — first since Haas CNC Racing in 1986',
      '2018: Fifth in constructors\' championship — 93 points with Magnussen and Grosjean',
      '2022: Magnussen returns after a season away — scores points in his first race back',
      '2023: Nico Hülkenberg joins and immediately becomes team\'s performance reference',
    ],
    lore: 'Haas\'s 2018 VF-18 benefited from a close technical partnership with Ferrari that went beyond the listed "listed parts" allowance — the car\'s cooling architecture was designed around the Ferrari PU\'s specific thermal envelope, allowing Haas to run lower rear bodywork than their rivals using the same engine.',
  },
  {
    constructorId: 'rb',
    name: 'Visa Cash App RB F1 Team',
    country: 'Italy',
    founded: 2006,
    hq: { lat: 44.6952, lng: 11.1839, label: 'Faenza, Italy' },
    bio: 'Operating from the historic Minardi factory in Faenza, the team has competed under the Toro Rosso and AlphaTauri names before the 2024 rebrand to RB. It serves as Red Bull\'s driver development programme — Vettel, Ricciardo, Verstappen, Sainz, Kvyat, Gasly, and Tsunoda all raced here before or between senior Red Bull drives.',
    milestones: [
      '2006: Toro Rosso enters as Minardi\'s successor after Red Bull acquisition',
      '2008: Vettel wins the Italian GP — Toro Rosso\'s only race win as the team',
      '2016: Verstappen makes F1 debut here before mid-season transfer to Red Bull',
      '2024: Rebrand to RB — new identity while maintaining the Faenza base',
    ],
    lore: 'Toro Rosso\'s 2008 Monza win with Vettel used a Ferrari power unit that was technically a "customer" spec but included internal specification changes — specifically a revised fuel injector mapping — that were not available to other Ferrari customers that season.',
  },
  {
    constructorId: 'kick_sauber',
    name: 'Stake F1 Team Kick Sauber',
    country: 'Switzerland',
    founded: 1993,
    hq: { lat: 47.4980, lng: 8.2185, label: 'Hinwil, Switzerland' },
    bio: 'Sauber Motorsport entered F1 in 1993 and has operated continuously under various commercial partnerships (BMW Sauber, Alfa Romeo, Stake/Kick Sauber). The team will transition to Audi works status from 2026. Their Swiss base in Hinwil, maintained since their debut, is the only F1 team operating from a German-speaking country.',
    milestones: [
      '1993: First season — immediately score points despite limited resources',
      '2007–2009: BMW Sauber partnership — Robert Kubica wins the Canadian GP in 2008',
      '2019: Rebrand to Alfa Romeo Racing — competitive revival with Räikkönen',
      '2026: Audi works team entry begins — first German manufacturer since BMW left in 2009',
    ],
    lore: 'The 2008 BMW Sauber F1.08 that Kubica drove to victory in Canada used a bespoke front brake duct design developed by Sauber\'s aerodynamicists in Hinwil — not shared from BMW\'s Munich facility — that directed more airflow to the inner brake surface, solving a thermal management issue the team had carried from the 2007 car.',
  },
  {
    constructorId: 'audi',
    name: 'Audi F1 Team',
    country: 'Switzerland',
    founded: 2026,
    hq: { lat: 47.4980, lng: 8.2185, label: 'Hinwil, Switzerland' },
    bio: 'Audi\'s F1 works entry begins in 2026, built on the Sauber Motorsport lineage that has raced continuously from Hinwil since 1993 (as Sauber, BMW Sauber, Alfa Romeo, and Stake/Kick Sauber). The Volkswagen Group\'s factory backing makes Audi the first German manufacturer on the grid since BMW\'s 2009 exit, retaining the Swiss chassis base while adding a new power-unit programme.',
    milestones: [
      '1993: Sauber lineage enters F1 from the same Hinwil base still used today',
      '2007–2009: BMW Sauber era — Kubica\'s 2008 Canadian GP win',
      '2022: Audi confirms its F1 entry, acquiring a stake in the Sauber Group',
      '2026: Audi works team debut — first German manufacturer since BMW left in 2009',
    ],
    lore: 'Audi\'s F1 power-unit programme was built at a dedicated Neuburg facility rather than retrofitted into an existing road-car engine plant — a from-scratch approach the manufacturer took specifically to meet the 2026 regulations\' 50/50 combustion/electric power split without inheriting legacy packaging compromises.',
  },
  {
    constructorId: 'cadillac',
    name: 'Cadillac F1 Team',
    country: 'United States',
    founded: 2026,
    hq: { lat: 35.2271, lng: -80.8431, label: 'Charlotte, NC, USA' },
    bio: 'Cadillac joins the 2026 grid as F1\'s eleventh team, backed by General Motors and TWG Motorsports. It is the first new constructor entry since Haas in 2016 and only the second American-badged manufacturer team in the sport\'s history. The team runs Ferrari power units in its debut seasons while GM develops its own power unit for a later entry.',
    milestones: [
      '2023: TWG Motorsports first files its F1 entry bid with the FIA',
      '2024: FIA approves the entry as the sport\'s eleventh team',
      '2025: General Motors confirmed as the entry\'s manufacturer partner, racing as Cadillac',
      '2026: F1 grid debut — first new constructor since Haas in 2016',
    ],
    lore: 'Cadillac\'s bid was initially submitted without a confirmed power-unit supplier, which the other nine teams cited as a key objection during FIA review — the entry was only approved once GM committed to both a customer Ferrari deal for the early seasons and a longer-term in-house power-unit programme.',
  },
];

const MAP = new Map(TEAMS.map((t) => [t.constructorId, t]));

export function getTeamLore(constructorId: string): TeamLore | null {
  return MAP.get(constructorId.toLowerCase()) ?? null;
}
