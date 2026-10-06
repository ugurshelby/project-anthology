export interface CircuitLoreMoment {
  id: string;
  year: number;
  titleEn: string;
  titleTr: string;
  heroDriver: string;
  storyEn: string;
  storyTr: string;
  lapOrDetailEn: string;
  lapOrDetailTr: string;
  tag: string;
}

export const CIRCUIT_LORE: Record<string, CircuitLoreMoment[]> = {
  monaco: [
    {
      id: 'senna-1988-pole',
      year: 1988,
      titleEn: "Senna's Transcendental Dimension",
      titleTr: "Senna'nın Doğaüstü Boyutu",
      heroDriver: 'Ayrton Senna',
      storyEn:
        'Ayrton Senna qualified on pole by an unfathomable 1.427 seconds over Alain Prost in identical McLaren MP4/4 machinery. He later recounted experiencing an out-of-body tunnel state beyond conscious driving control.',
      storyTr:
        "Ayrton Senna, özdeş McLaren MP4/4 ile Alain Prost'a 1.427 saniye fark atarak pole pozisyonunu aldı. Daha sonra bunu bilinçli kontrolün ötesinde, başka bir boyutta sürüş deneyimi olarak tarif etti.",
      lapOrDetailEn: 'Pole lap: 1:23.998 (+1.427s gap)',
      lapOrDetailTr: 'Pole turu: 1:23.998 (+1.427s fark)',
      tag: 'Qualifying Apex',
    },
    {
      id: 'panis-1996-monsoon',
      year: 1996,
      titleEn: 'Panis in the Monaco Monsoon',
      titleTr: 'Yağmur Altında Panis Mucizesi',
      heroDriver: 'Olivier Panis',
      storyEn:
        'Only 3 cars took the chequered flag in the most attritional Monaco GP in history. Olivier Panis drove from 14th on the grid in tricky wet-dry conditions to take Ligier’s emotional final F1 win.',
      storyTr:
        'Tarihin en kaotik Monaco yarışında yalnızca 3 araç finiş görebildi. Olivier Panis, 14. sıradan başlayarak kuruyan pistte Ligier’e duygusal son Formula 1 zaferini getirdi.',
      lapOrDetailEn: 'Started P14 · Finished P1 (3 finishers)',
      lapOrDetailTr: '14. Başlangıç · 1. Finiş (Yalnızca 3 araç)',
      tag: 'Monsoon Chaos',
    },
  ],
  spa: [
    {
      id: 'hakkinen-schumacher-2000',
      year: 2000,
      titleEn: 'The Split-Second Kemmel Double Overtake',
      titleTr: 'Kemmel Düzlüğü Üçlü Geçişi',
      heroDriver: 'Mika Häkkinen',
      storyEn:
        'Lap 41 at 330 km/h: Michael Schumacher squeezed past backmarker Ricardo Zonta on the left. In a flash of genius, Mika Häkkinen lunged down the unsighted damp right flank, sandwiching Zonta and snatching the lead.',
      storyTr:
        "41. turda 330 km/s hızla Michael Schumacher tur bindirilen Ricardo Zonta'yı soldan geçti. Mika Häkkinen milisaniyelik kararla sağdaki ıslak boşluğa dalarak Zonta'yı sandviç yaptı ve liderliği kaptı.",
      lapOrDetailEn: 'Lap 41 · 330 km/h braking duel',
      lapOrDetailTr: '41. Tur · 330 km/s frenleme düellosu',
      tag: 'Overtake of the Century',
    },
  ],
  silverstone: [
    {
      id: 'hamilton-2008-deluge',
      year: 2008,
      titleEn: 'Hamilton’s 68-Second Deluge Masterclass',
      titleTr: 'Hamilton’ın 68 Saniyelik Yağmur Resitali',
      heroDriver: 'Lewis Hamilton',
      storyEn:
        'While rivals spun multiple times in treacherous standing water, 23-year-old Lewis Hamilton drove with immaculate car control to cross the line an astounding 1 minute and 8 seconds ahead of P2 Nick Heidfeld.',
      storyTr:
        "Rakipler su birikintilerinde defalarca spin atarken, 23 yaşındaki Lewis Hamilton kusursuz araç kontrolüyle 2. sıradaki Nick Heidfeld'e 1 dakika 8 saniye (68 sn) fark atarak kazandı.",
      lapOrDetailEn: '+68.577s winning margin over P2',
      lapOrDetailTr: '2. sıraya +68.577s galibiyet farkı',
      tag: 'Wet Masterclass',
    },
  ],
  monza: [
    {
      id: 'vettel-2008-minardi-miracle',
      year: 2008,
      titleEn: 'The Toro Rosso Rain Miracle',
      titleTr: 'Toro Rosso ve Vettel Yağmur Mucizesi',
      heroDriver: 'Sebastian Vettel',
      storyEn:
        'In blinding spray at the Temple of Speed, Sebastian Vettel became the youngest race winner in history, handing the former Minardi squad their maiden victory with supreme composure.',
      storyTr:
        "Hız Tapınağı Monza'da şiddetli sağanak altında Sebastian Vettel, tarihin en genç yarış kazanan pilotu oldu ve eski Minardi takımına rüya gibi ilk ve tek bağımsız zaferini hediye etti.",
      lapOrDetailEn: 'Pole + Win in Toro Rosso STR3',
      lapOrDetailTr: 'STR3 ile Pole ve Galibiyet',
      tag: 'Underdog Triumph',
    },
  ],
  interlagos: [
    {
      id: 'hamilton-glock-2008',
      year: 2008,
      titleEn: 'Is That Glock?! — Heartbreak & Glory',
      titleTr: 'Son Viraj, Son Metreler: Glock Geçişi',
      heroDriver: 'Lewis Hamilton',
      storyEn:
        'Felipe Massa crossed the line thinking he was champion. 750 metres back, rain intensified; Timo Glock struggled on dry tyres at Junção. Hamilton squeezed past in the final seconds to clinch the title by 1 point.',
      storyTr:
        "Felipe Massa şampiyon olduğunu düşünerek çizgiyi geçti. 750 metre geride son viraj Junção'da kuru zemin lastikleriyle kayan Glock'u son saniyede geçen Hamilton, 1 puanla şampiyonluğa uzandı.",
      lapOrDetailEn: 'Final lap, final corner · Title decided by 1 point',
      lapOrDetailTr: 'Son tur, son viraj · 1 puanla şampiyonluk',
      tag: 'Championship Decider',
    },
  ],
  suzuka: [
    {
      id: 'raikkonen-2005-lap-last-pass',
      year: 2005,
      titleEn: 'Räikkönen from P17 to Final Lap Heroics',
      titleTr: '17. Sıradan Başlayıp Son Turda Zirveye',
      heroDriver: 'Kimi Räikkönen',
      storyEn:
        'Starting 17th after wet qualifying, the Iceman produced one of the fastest charges in history, hunting down Giancarlo Fisichella and sealing victory around the outside of Turn 1 on the very last lap.',
      storyTr:
        '17. sıradan başlayan Kimi Räikkönen, son turun ilk virajında Fisichella’yı dışarıdan geçerek Formula 1 tarihinin en görkemli geri dönüş galibiyetlerinden birine imza attı.',
      lapOrDetailEn: 'P17 → P1 · Turn 1 outside pass on lap 53',
      lapOrDetailTr: '17. → 1. · Son turda 1. viraj dışından geçiş',
      tag: 'Comeback Legend',
    },
  ],
};

export function getCircuitLoreMoments(circuitId: string): CircuitLoreMoment[] {
  const norm = circuitId.toLowerCase().replace(/-/g, '_');
  return (
    CIRCUIT_LORE[norm] ||
    CIRCUIT_LORE[circuitId.toLowerCase()] ||
    []
  );
}
