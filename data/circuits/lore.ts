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
  sourceUrl?: string;
}

export const CIRCUIT_LORE: Record<string, CircuitLoreMoment[]> = {
  monaco: [
    {
      id: 'senna-1988-pole',
      year: 1988,
      titleEn: "Senna's Telemetry Dimension",
      titleTr: "Senna'nın Telemetri Sınırı",
      heroDriver: 'Ayrton Senna',
      storyEn:
        'McLaren telemetry timed Ayrton Senna 1.427 seconds faster than Alain Prost in identical MP4/4 machinery. Senna later described the lap as driving on instinct, beyond conscious control.',
      storyTr:
        'McLaren telemetrisi, Ayrton Senna\'nın aynı MP4/4 ile Alain Prost\'tan 1.427 saniye daha hızlı olduğunu kaydetti. Senna o turu daha sonra bilinçli kontrolün ötesinde, içgüdüyle sürmek diye anlattı.',
      lapOrDetailEn: 'Pole lap: 1:23.998 (+1.427s over Prost)',
      lapOrDetailTr: 'Pole turu: 1:23.998 (Prost\'a +1.427s fark)',
      tag: 'Qualifying Apex',
    },
    {
      id: 'panis-1996-monsoon',
      year: 1996,
      titleEn: 'Panis in the Monaco Deluge',
      titleTr: 'Monaco Sağanağında Panis İnadı',
      heroDriver: 'Olivier Panis',
      storyEn:
        'Only three cars reached the chequered flag after 75 laps of attrition in treacherous drying conditions. Starting 14th on the grid, Olivier Panis lunged past Eddie Irvine into the Loews hairpin and survived with zero pit errors to secure Ligier’s final Grand Prix victory.',
      storyTr:
        'Kuruyan pistte yaşanan 75 turluk kırımın ardından damalı bayrağı yalnızca üç araç görebildi. 14. sıradan başlayan Olivier Panis, Loews firketesinde Eddie Irvine\'ın içine dalarak yer kazandı ve hatasız pit stratejisiyle Ligier\'ye Formula 1 tarihindeki son zaferini kazandırdı.',
      lapOrDetailEn: 'Started P14 · Finished P1 (3 finishers)',
      lapOrDetailTr: '14. Başlangıç · 1. Finiş (Yalnızca 3 araç finişte)',
      tag: 'Wet Attrition',
    },
  ],
  spa: [
    {
      id: 'hakkinen-schumacher-2000',
      year: 2000,
      titleEn: 'The 330 km/h Kemmel Double Slipstream',
      titleTr: 'Kemmel Düzlüğünde 330 km/s Çiftli Geçiş',
      heroDriver: 'Mika Häkkinen',
      storyEn:
        'One lap after Michael Schumacher squeezed him onto the grass at Les Combes, Mika Häkkinen caught the Ferrari slipstream up Kemmel at 330 km/h. As Ricardo Zonta held the centre line, Schumacher went left; Häkkinen darted blind down the damp right flank and claimed the lead into the chicane.',
      storyTr:
        'Les Combes virajında Schumacher tarafından çimlere itildikten bir tur sonra Häkkinen, Kemmel Düzlüğü\'nde 330 km/s hızla Ferrari\'nin hava koridoruna girdi. Tur bindirilen Ricardo Zonta ortada kalınca Schumacher sola kırarken Häkkinen ıslak sağ şeride daldı ve şikan öncesinde liderliği aldı.',
      lapOrDetailEn: 'Lap 41 · 330 km/h three-wide braking duel',
      lapOrDetailTr: '41. Tur · 330 km/s hızla üçlü frenaj düellosu',
      tag: 'Overtake of the Century',
    },
    {
      id: 'spa-1998-pileup',
      year: 1998,
      titleEn: 'The 14-Car Deluge Carnage',
      titleTr: 'Ardennes Sağanağında 14 Araçlık Kaza',
      heroDriver: 'Damon Hill',
      storyEn:
        'Moments after the start in blinding Ardennes spray, David Coulthard aquaplaned into the pit wall on the downhill run to Eau Rouge, triggering a 13-car pileup—the largest single-incident crash in modern Formula 1 history. Damon Hill went on to take Jordan’s historic first 1-2 finish in the restarted race.',
      storyTr:
        'Ardennes sağanağında start verildikten saniyeler sonra David Coulthard, Eau Rouge inişinde su birikintisine kapılarak duvara çarptı ve arkasından gelen 14 aracı içine çeken tarihin en büyük zincirleme kazasını tetikledi. Yeniden başlatılan yarışı Damon Hill kazanarak Jordan takımına ilk duble zaferini getirdi.',
      lapOrDetailEn: 'Turn 1 downhill run · 14 cars eliminated',
      lapOrDetailTr: '1. viraj inişi · 13 araç kaza yaptı',
      tag: 'Chaos Survival',
    },
  ],
  silverstone: [
    {
      id: 'hamilton-2008-deluge',
      year: 2008,
      titleEn: 'Hamilton’s 68-Second Deluge Masterclass',
      titleTr: 'Hamilton’ın 68 Saniyelik Yağmur Farkı',
      heroDriver: 'Lewis Hamilton',
      storyEn:
        'While championship rivals spun five times in treacherous standing water, 23-year-old Lewis Hamilton lapped up to three seconds faster than the entire field. When he took the chequered flag, second-placed Nick Heidfeld was 68.5 seconds behind, with only the podium finishers on the lead lap.',
      storyTr:
        'Şampiyonluk rakipleri su birikintilerinde defalarca spin atarken 23 yaşındaki Lewis Hamilton tüm grid\'den tur başına üç saniye daha hızlı turlar attı. Damalı bayrağı geçtiğinde ikinci sıradaki Nick Heidfeld ile arasındaki fark 68.5 saniyeydi; podyum dışındaki tüm araçlar tur yemişti.',
      lapOrDetailEn: '+68.577s winning margin over P2',
      lapOrDetailTr: '2. sıraya +68.577s galibiyet farkı',
      tag: 'Wet Masterclass',
    },
    {
      id: 'hamilton-2020-three-wheels',
      year: 2020,
      titleEn: 'Crossing the Line on Three Wheels',
      titleTr: 'Üç Tekerlekle Damalı Bayrak',
      heroDriver: 'Lewis Hamilton',
      storyEn:
        'Leading on the final lap, Hamilton’s front-left tyre deflated on the Hangar Straight. With sparks flying and Max Verstappen closing, he nursed the car through Stowe, Vale and Club to cross the line 5.8 seconds ahead.',
      storyTr:
        'Son turda lider giden Hamilton\'ın sol ön lastiği Hangar düzlüğünde söndü ve araç janta indi. Max Verstappen arayı kapatırken Hamilton kıvılcımlar saçan aracı Stowe, Vale ve Club’dan geçirerek çizgiyi 5.8 saniye farkla önde geçti.',
      lapOrDetailEn: 'Final lap front-left tyre blowout · Won by 5.8s',
      lapOrDetailTr: 'Son turda sol ön lastik patlaması · 5.8s farkla galibiyet',
      tag: 'Mechanical Survival',
    },
  ],
  monza: [
    {
      id: 'vettel-2008-minardi-miracle',
      year: 2008,
      titleEn: 'The Faenza Rain Miracle',
      titleTr: 'Faenza Takımının Yağmur Zaferi',
      heroDriver: 'Sebastian Vettel',
      storyEn:
        'In torrential rain at the Temple of Speed, 21-year-old Sebastian Vettel took pole and controlled all 53 race laps in the customer Ferrari-powered Toro Rosso STR3, crossing the line 12.5 seconds clear of Heikki Kovalainen to secure the former Minardi outfit’s maiden victory.',
      storyTr:
        'Hız Tapınağı Monza\'da şiddetli yağmur altında 21 yaşındaki Sebastian Vettel, Toro Rosso STR3 ile pole pozisyonunu aldı ve 53 turluk yarışı baştan sona kontrol etti. Kovalainen\'in 12.5 saniye önünde finişe ulaşarak Faenza merkezli eski Minardi takımına tarihindeki ilk zaferi kazandırdı.',
      lapOrDetailEn: 'Pole + Win in Toro Rosso STR3',
      lapOrDetailTr: 'STR3 ile Pole ve Galibiyet',
      tag: 'Underdog Triumph',
    },
    {
      id: 'gasly-2020-redemption',
      year: 2020,
      titleEn: 'Gasly Defends the Parabolica by 0.4 Seconds',
      titleTr: 'Gasly’nin 0.4 Saniyelik Monza Savunması',
      heroDriver: 'Pierre Gasly',
      storyEn:
        'Following a red-flag standing restart and a ten-second penalty for Lewis Hamilton, Pierre Gasly inherited the race lead in his AlphaTauri. Over the final five laps, he absorbed relentless pressure from Carlos Sainz’s McLaren, crossing the finish line just 0.415 seconds ahead.',
      storyTr:
        'Kırmızı bayrak sonrası durarak kalkış ve Hamilton\'ın aldığı cezanın ardından Pierre Gasly, AlphaTauri ile liderliğe yükseldi. Son beş tur boyunca Carlos Sainz\'ın McLaren\'ının DRS baskısına direnerek bitiş çizgisini yalnızca 0.415 saniye farkla önde geçti.',
      lapOrDetailEn: 'Won by 0.415s over Carlos Sainz',
      lapOrDetailTr: 'Carlos Sainz\'a karşı 0.415s farkla zafer',
      tag: 'Underdog Triumph',
    },
  ],
  interlagos: [
    {
      id: 'hamilton-glock-2008',
      year: 2008,
      titleEn: 'Junção Corner: The One-Point Title Decider',
      titleTr: 'Junção Virajı: 1 Puanlık Şampiyonluk',
      heroDriver: 'Lewis Hamilton',
      storyEn:
        'Felipe Massa took the chequered flag to initial celebrations in the Ferrari pit box. 750 metres back, rain intensified; Timo Glock struggled for grip on dry compounds through Junção. Hamilton lunged down the inside into Turn 12 with two corners remaining to claim P5 and win the World Championship by one point.',
      storyTr:
        'Felipe Massa damalı bayrağı kazanan olarak geçtiğinde Ferrari garajı şampiyonluk kutlamalarına başlamıştı. Ancak son turda yağmur şiddetlendi; kuru zemin lastikleriyle kayan Timo Glock Junção virajında tutunamadı. Hamilton son iki viraj kala Glock\'un içine dalarak 5. sırayı aldı ve şampiyonluğu 1 puan farkla kazandı.',
      lapOrDetailEn: 'Final lap Turn 12 pass · Title decided by 1 point',
      lapOrDetailTr: 'Son tur 12. viraj geçişi · 1 puanla şampiyonluk',
      tag: 'Championship Decider',
    },
    {
      id: 'verstappen-2016-wet-geometry',
      year: 2016,
      titleEn: 'Verstappen’s 290 km/h Save & Deluge Charge',
      titleTr: 'Verstappen’in 290 km/s Kontrası ve Yağmur Çizgisi',
      heroDriver: 'Max Verstappen',
      storyEn:
        'In torrential rain, 19-year-old Max Verstappen saved a full 290 km/h tank-slapper on the pit straight without touching the armco barriers. Dropping to 16th following an ill-timed intermediate tyre gamble, he spent the final 16 laps finding grip on outside lines nobody else dared use, storming back to P3 on the podium.',
      storyTr:
        'Sağanak altında 19 yaşındaki Max Verstappen, ana düzlükte 290 km/s hızla savrulan aracını bariyerlere çarpmadan milimetrik bir kontra ile topladı. Yanlış ara lastik tercihi yüzünden 16. sıraya geriledikten sonraki 16 turda kimsenin cesaret edemediği dış çizgilerden geçişler yaparak podyumda 3. sıraya tırmandı.',
      lapOrDetailEn: 'P16 → P3 in 16 laps · 290 km/h straight-line save',
      lapOrDetailTr: '16 turda 16.lıktan 3.lüğe · 290 km/s düzlük kontrası',
      tag: 'Wet Masterclass',
    },
  ],
  suzuka: [
    {
      id: 'raikkonen-2005-lap-last-pass',
      year: 2005,
      titleEn: 'Räikkönen from P17 to Final-Lap Turn 1 Pass',
      titleTr: 'Räikkönen: 17. Sıradan Son Turda 1. Viraj Geçişi',
      heroDriver: 'Kimi Räikkönen',
      storyEn:
        'Starting 17th following wet qualifying, Kimi Räikkönen delivered a sequence of record-breaking race laps in the McLaren MP4-20. On the 53rd and final lap, he slipstreamed Giancarlo Fisichella down the pit straight, swept around the outside into Turn 1 at 310 km/h, and sealed one of F1’s greatest comeback victories.',
      storyTr:
        'Yağmurlu sıralama turları sonrası 17. cepten başlayan Kimi Räikkönen, McLaren MP4-20 ile yarış boyunca pist rekoru kıran turlar attı. 53. ve son turda Giancarlo Fisichella\'nın hava koridoruna girdi; 310 km/s hızla 1. virajın dış çizgisinden geçerek Formula 1 tarihinin en görkemli geri dönüş galibiyetlerinden birini aldı.',
      lapOrDetailEn: 'P17 → P1 · Turn 1 outside pass on lap 53',
      lapOrDetailTr: '17. → 1. · Son turda 1. viraj dışından geçiş',
      tag: 'Comeback Legend',
    },
    {
      id: 'senna-prost-1989-collision',
      year: 1989,
      titleEn: 'The Casio Triangle Championship Collision',
      titleTr: 'Casio Şikanında Şampiyonluk Çarpışması',
      heroDriver: 'Alain Prost & Ayrton Senna',
      storyEn:
        'On lap 47, Senna lunged down the inside of Prost into the Casio Triangle chicane. Prost turned in early, locking their McLaren MP4/5 wheels together. Prost climbed out as champion while Senna restarted through the chicane escape road, took the win on track, but was controversially disqualified by FISA stewards.',
      storyTr:
        '47. turda Senna, Casio Triangle şikanı girişinde Prost\'un içine daldı. Prost erken içeri kırarak iki McLaren MP4/5\'in tekerleklerini birbirine kilitledi. Prost araçtan inip şampiyonluğunu ilan ederken Senna kaçış yolundan dönüp yarışı kazandı; ancak FISA komiserleri tarafından tartışmalı biçimde diskalifiye edildi.',
      lapOrDetailEn: 'Lap 47 · Turn 16 collision deciding the title',
      lapOrDetailTr: '47. Tur · Şampiyonluğu belirleyen 16. viraj teması',
      tag: 'Championship Decider',
    },
  ],
  villeneuve: [
    {
      id: 'button-2011-rain-epic',
      year: 2011,
      titleEn: 'Button’s Four-Hour Deluge Marathon',
      titleTr: 'Button’ın Dört Saatlik Yağmur Maratonu',
      heroDriver: 'Jenson Button',
      storyEn:
        'The longest Grand Prix in Formula 1 history lasted 4 hours, 4 minutes under torrential Montreal rain. Jenson Button survived six pit stops, a drive-through penalty, collisions with Lewis Hamilton and Fernando Alonso, and dropped to dead last (P21). On lap 70, he pressured Sebastian Vettel into a half-spin at Turn 6 to snatch victory.',
      storyTr:
        'Montreal sağanağı altında 4 saat 4 dakika süren Formula 1 tarihinin en uzun yarışı. Jenson Button altı pit stop, pitten geçme cezası, takım arkadaşı Hamilton ve Alonso ile temasların ardından son sıraya (21.) düştü. 70. ve son turda Sebastian Vettel\'i 6. virajda hataya zorlayarak zaferi kaptı.',
      lapOrDetailEn: 'P21 → P1 · 6 pit stops · Final lap pass on Vettel',
      lapOrDetailTr: '21. → 1. · 6 pit stop · Son turda Vettel\'i geçiş',
      tag: 'Comeback Legend',
    },
    {
      id: 'wall-of-champions-1999',
      year: 1999,
      titleEn: 'The Wall of Champions Claiming Three Kings',
      titleTr: 'Üç Şampiyonu Yutan Şampiyonlar Duvarı',
      heroDriver: 'Damon Hill, Michael Schumacher, Jacques Villeneuve',
      storyEn:
        'In a single afternoon, three Formula 1 World Champions—Damon Hill (lap 14), Michael Schumacher (lap 29), and Jacques Villeneuve (lap 34)—made identical steering errors over the final chicane apex kerbs and sheared their right-side suspensions against the concrete wall, officially christening it the "Wall of Champions."',
      storyTr:
        'Aynı yarış günü içinde üç Formula 1 Dünya Şampiyonu—Damon Hill (14. tur), Michael Schumacher (29. tur) ve Jacques Villeneuve (34. tur)—son şikan bordüründe aynı hatayı yaparak sağ süspansiyonlarını beton duvara çarptı; o günden sonra bu viraj "Şampiyonlar Duvarı" adını aldı.',
      lapOrDetailEn: 'Turn 14 exit concrete wall · 3 World Champions eliminated',
      lapOrDetailTr: '14. viraj çıkışı beton duvar · 3 Dünya Şampiyonu yarış dışı',
      tag: 'Circuit Nemesis',
    },
  ],
  catalunya: [
    {
      id: 'schumacher-1996-torrential',
      year: 1996,
      titleEn: 'Schumacher’s Maiden Ferrari Torrential Masterclass',
      titleTr: 'Schumacher’in Yağmur Altında İlk Ferrari Zaferi',
      heroDriver: 'Michael Schumacher',
      storyEn:
        'In a torrential deluge at Montmeló, Michael Schumacher drove the recalcitrant Ferrari F310 on lines nobody else could find. Lapping up to four seconds per lap faster than the entire field, he took his first victory in Ferrari red, finishing 45 seconds clear of Jean Alesi with only three cars on the lead lap.',
      storyTr:
        'Montmeló\'daki şiddetli sağanak altında Michael Schumacher, zor yönetilen Ferrari F310 ile pistin ıslak zemininde rakiplerinden tur başına dört saniyeye varan farklar açtı. Ferrari tulumuyla ilk zaferini Jean Alesi\'nin 45 saniye önünde kazandı; damalı bayrağı yalnızca üç araç aynı turda görebildi.',
      lapOrDetailEn: '+45.3s winning margin in heavy rain',
      lapOrDetailTr: 'Şiddetli yağmurda +45.3s galibiyet farkı',
      tag: 'Wet Masterclass',
    },
    {
      id: 'verstappen-2016-youngest-win',
      year: 2016,
      titleEn: 'Verstappen’s 18-Year-Old Historic Maiden Triumph',
      titleTr: 'Verstappen’in 18 Yaşındaki Tarihi İlk Zaferi',
      heroDriver: 'Max Verstappen',
      storyEn:
        'Promoted to Red Bull just days before the Grand Prix, 18-year-old Max Verstappen capitalized on a first-lap collision between the two Mercedes cars. Running a two-stop strategy, he absorbed relentless pressure from Kimi Räikkönen’s Ferrari for 32 consecutive laps to become the youngest race winner in F1 history.',
      storyTr:
        'Yarıştan sadece günler önce Red Bull koltuğuna oturtulan 18 yaşındaki Max Verstappen, Mercedes pilotlarının ilk tur temasının ardından liderliğe ortak oldu. İki pit stop stratejisiyle son 32 tur boyunca Kimi Räikkönen\'in DRS baskısına direnerek tarihin en genç yarış kazanan pilotu unvanını aldı.',
      lapOrDetailEn: 'Aged 18 years, 228 days · Defended P1 for 32 laps',
      lapOrDetailTr: '18 yaş 228 günlükken · 32 tur boyunca liderliği korudu',
      tag: 'Record Breaker',
    },
  ],
  baku: [
    {
      id: 'ricciardo-2017-triple-overtake',
      year: 2017,
      titleEn: 'Ricciardo’s Three-Car Outbraking into Turn 1',
      titleTr: 'Ricciardo’nun 1. Virajdaki Üçlü Frenajı',
      heroDriver: 'Daniel Ricciardo',
      storyEn:
        'In one of the most volatile street races of the hybrid era, Daniel Ricciardo made an unscheduled early stop for brake debris and dropped to 17th. Following a Safety Car restart, he slipstreamed past Felipe Massa, Lance Stroll, and Nico Hülkenberg in a single braking move into Turn 1, charging on to an improbable victory.',
      storyTr:
        'Hibrit dönemin en kaotik sokak yarışında Daniel Ricciardo, fren kanalına giren parça yüzünden erkenden pite girerek 17. sıraya düştü. Güvenlik aracı yeniden başlangıcında 1. viraj frenajında tek hamlede Felipe Massa, Lance Stroll ve Nico Hülkenberg\'in içine dalarak yarışı kazandı.',
      lapOrDetailEn: 'P17 → P1 · Three cars passed into Turn 1 braking',
      lapOrDetailTr: '17. → 1. · 1. viraj frenajında üç aracı birden geçiş',
      tag: 'Braking Mastery',
    },
    {
      id: 'perez-2021-blowout-drama',
      year: 2021,
      titleEn: '320 km/h Blowout & The Standing Restart Sprint',
      titleTr: '320 km/s Lastik Patlaması ve İki Turluk Sprint',
      heroDriver: 'Sergio Pérez',
      storyEn:
        'With four laps remaining, race leader Max Verstappen suffered a catastrophic 320 km/h tyre failure along the main straight. Following a red-flag standing restart, Lewis Hamilton inadvertently left his "brake magic" setting activated, locking up into the Turn 1 escape road and handing Sergio Pérez his maiden Red Bull win.',
      storyTr:
        'Yarışın bitimine dört tur kala lider giden Max Verstappen, ana düzlükte 320 km/s hızla sol arka lastiğinin patlamasıyla kaza yaptı. Kırmızı bayrak sonrası durarak kalkışta Lewis Hamilton "brake magic" ayarını açık unutunca 1. viraj kaçış yoluna kilitlendi ve zafer Sergio Pérez\'e kaldı.',
      lapOrDetailEn: 'Two-lap sprint restart · Turn 1 lock-up drama',
      lapOrDetailTr: 'İki turluk sprint kalkışı · 1. virajda frenaj dramı',
      tag: 'Sprint Drama',
    },
  ],
};

/** True when the circuit has lore moments; the page renders the lore card only then. */
export function hasCircuitLore(circuitId: string): boolean {
  return getCircuitLoreMoments(circuitId).length > 0;
}

export function getCircuitLoreMoments(circuitId: string): CircuitLoreMoment[] {
  const norm = circuitId.toLowerCase().replace(/-/g, '_');
  return (
    CIRCUIT_LORE[norm] ||
    CIRCUIT_LORE[circuitId.toLowerCase()] ||
    []
  );
}
