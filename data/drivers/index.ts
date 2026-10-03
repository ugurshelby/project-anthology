/**
 * Editorial profiles for the current grid, in the Apex house voice
 * (docs/F1_Anlati_Stil_Kilavuzu.md): a thesis in the first lines, facts that
 * can be checked, one short sentence that lands. Every claim here was checked
 * against the F1 history index or is a widely documented fact; statistics that
 * change (wins, podiums, points) live in the data, not in this prose.
 *
 * English is the base text; `tr` holds the Turkish version of the same profile.
 */

export interface DriverLoreText {
  /** One short paragraph. */
  bio: string;
  /** Up to 4 concrete milestones ("year: event"). */
  milestones: string[];
  /** One checkable detail; empty when there is nothing safe to add. */
  lore: string;
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
    bio: 'Lewis Hamilton reached Formula 1 in 2007 and missed the title by a single point in his first season. He did not wait long: in 2008 he took it on the last lap in Brazil. The move to Mercedes in 2013 looked like a gamble and became the most dominant stretch of the hybrid era, six more titles by 2020 and seven in all. In 2025 he started again, in Ferrari red.',
    milestones: [
      '2008: first title, by one point, settled on the last lap in Brazil',
      '2013: leaves McLaren for Mercedes',
      '2020: seventh title, level with Michael Schumacher',
      '2025: first season at Ferrari',
    ],
    lore: 'He won his sixth Grand Prix, Canada 2007, and took pole position in the same weekend.',
    tr: {
      bio: 'Lewis Hamilton 2007\'de Formula 1\'e geldi ve ilk sezonunda şampiyonluğu tek puanla kaçırdı. Beklemedi: 2008\'de Brezilya\'nın son turunda kazandı. 2013\'te Mercedes\'e geçişi bir kumar gibi görünüyordu; hibrit çağının en baskın dönemine dönüştü. 2020\'ye kadar altı şampiyonluk daha, toplamda yedi. 2025\'te yeniden başladı, bu kez Ferrari kırmızısıyla.',
      milestones: [
        '2008: ilk şampiyonluk, tek puanla, Brezilya\'nın son turunda belirlendi',
        '2013: McLaren\'dan Mercedes\'e geçiş',
        '2020: yedinci şampiyonluk, Michael Schumacher\'e eşitlik',
        '2025: Ferrari\'de ilk sezon',
      ],
      lore: 'İlk galibiyetini altıncı Grand Prix\'sinde, 2007 Kanada\'da aldı; aynı hafta sonu pole pozisyonunu da kazandı.',
    },
  },
  {
    driverId: 'max_verstappen',
    number: 1,
    nationality: 'Dutch',
    born: 1997,
    bio: 'Max Verstappen reached Formula 1 at 17, carrying a surname that was already known in the paddock, and answered it quickly. At Spain in 2016, on his first race for Red Bull, he won and became the youngest Grand Prix winner there has been. His first title came on the final lap of the final race in 2021. The next three needed no such drama.',
    milestones: [
      '2015: debut with Toro Rosso at 17',
      '2016: wins the Spanish GP on his Red Bull debut, aged 18 years and 228 days',
      '2021: first title, decided in the Abu Dhabi finale',
      '2023: 19 wins from 22 races, the most in a single season',
    ],
    lore: 'He won 15 races in 2022 and 19 in 2023. No driver had won more than 13 in a season before him.',
    tr: {
      bio: 'Max Verstappen 17 yaşında Formula 1\'e geldi; soyadı paddock\'ta zaten bilinen biriydi ve cevabını hızla verdi. 2016\'da İspanya\'da, Red Bull\'daki ilk yarışında kazandı ve bugüne kadarki en genç Grand Prix galibi oldu. İlk şampiyonluğu 2021\'de, sezonun son yarışının son turunda geldi. Sonraki üçü için böyle bir dramaya gerek kalmadı.',
      milestones: [
        '2015: 17 yaşında Toro Rosso ile ilk yarış',
        '2016: Red Bull\'daki ilk yarışında İspanya GP\'sini kazanır, 18 yıl 228 gün',
        '2021: ilk şampiyonluk, Abu Dabi finalinde belirlendi',
        '2023: 22 yarışın 19\'unu kazanır, tek sezondaki en yüksek sayı',
      ],
      lore: '2022\'de 15, 2023\'te 19 yarış kazandı. Ondan önce hiçbir sürücü bir sezonda 13\'ten fazla yarış kazanmamıştı.',
    },
  },
  {
    driverId: 'leclerc',
    number: 16,
    nationality: 'Monégasque',
    born: 1997,
    bio: 'Charles Leclerc grew up in Monaco, in the shadow of the circuit he would one day be judged on. Formula 2 champion in 2017, Sauber rookie in 2018, he moved to Ferrari in 2019 and won his first two Grands Prix back to back, at Spa and Monza, ending Ferrari\'s nine-year wait for a home win. The title has stayed just out of reach. His speed over one lap has not.',
    milestones: [
      '2017: Formula 2 champion',
      '2019: wins Belgium and Italy in consecutive races',
      '2021: pole position at Monaco, then a failed driveshaft before the start',
      '2024: wins Monaco, finally at home',
    ],
    lore: 'Ferrari had not won at Monza since Fernando Alonso in 2010. Leclerc ended the wait in 2019, from pole.',
    tr: {
      bio: 'Charles Leclerc Monako\'da, bir gün üzerinden değerlendirileceği pistin gölgesinde büyüdü. 2017 Formula 2 şampiyonu, 2018 Sauber çaylağı; 2019\'da Ferrari\'ye geçti ve ilk iki Grand Prix\'sini art arda, Spa ve Monza\'da kazanarak Ferrari\'nin dokuz yıllık evinde galibiyet hasretine son verdi. Şampiyonluk hep bir adım ötede kaldı. Tek turdaki hızı hiç kalmadı.',
      milestones: [
        '2017: Formula 2 şampiyonu',
        '2019: Belgika ve İtalya\'yı art arda kazanır',
        '2021: Monako\'da pole, sonra start öncesi kırılan aks',
        '2024: Monako\'yu kazanır, sonunda kendi evinde',
      ],
      lore: 'Ferrari Monza\'da 2010\'da Fernando Alonso\'dan beri kazanamamıştı. Leclerc bu beklemeyi 2019\'da, pole\'dan başlayarak bitirdi.',
    },
  },
  {
    driverId: 'norris',
    number: 4,
    nationality: 'British',
    born: 1999,
    bio: 'Lando Norris spent his first five seasons as the driver everyone said would win, one day. The day was Miami 2024, his 110th start. He finished that year as runner-up while McLaren took its first constructors\' title since 1998, and in 2025 he went one better and became champion, by two points. The long climb from midfield to the top is McLaren\'s story as much as his.',
    milestones: [
      '2019: debut with McLaren at 19',
      '2024: first win, Miami GP, in his 110th start',
      '2024: McLaren constructors\' champions, the first since 1998',
      '2025: world champion by two points',
    ],
    lore: 'He first stood on a podium in 2020, at the Austrian Grand Prix, aged 20, in only his second race of that season.',
    tr: {
      bio: 'Lando Norris ilk beş sezonunu, herkesin "bir gün kazanır" dediği sürücü olarak geçirdi. O gün, 110. yarışında, 2024 Miami\'ydi. O yılı ikinci olarak bitirirken McLaren 1998\'den beri ilk Markalar Şampiyonluğu\'nu aldı; 2025\'te bir adım daha attı ve iki puan farkla şampiyon oldu. Orta sıradan zirveye uzanan bu uzun tırmanış, onunki kadar McLaren\'ın da hikâyesi.',
      milestones: [
        '2019: 19 yaşında McLaren ile ilk yarış',
        '2024: ilk galibiyet, Miami GP, 110. yarışında',
        '2024: McLaren Markalar Şampiyonu, 1998\'den beri ilk',
        '2025: iki puan farkla dünya şampiyonu',
      ],
      lore: 'İlk podyumuna 2020\'de, 20 yaşında, o sezonun yalnızca ikinci yarışı olan Avusturya GP\'sinde çıktı.',
    },
  },
  {
    driverId: 'piastri',
    number: 81,
    nationality: 'Australian',
    born: 2001,
    bio: 'Oscar Piastri won Formula 3 in 2020 and Formula 2 in 2021, each time as a rookie. In 2022 he waited as Alpine\'s reserve while a contract dispute went to the Contract Recognition Board, which ruled for McLaren. He joined in 2023, won the Qatar sprint, and took his first Grand Prix in Hungary in 2024. The patience paid back quickly.',
    milestones: [
      '2020: Formula 3 champion in his rookie season',
      '2021: Formula 2 champion in his rookie season',
      '2023: McLaren debut, sprint win in Qatar',
      '2024: first Grand Prix win, Hungary',
    ],
    lore: 'Qatar 2023 gave him both in one weekend: the sprint win on Saturday and his first Grand Prix podium on Sunday.',
    tr: {
      bio: 'Oscar Piastri 2020\'de Formula 3\'ü, 2021\'de Formula 2\'yi kazandı; ikisini de çaylak sezonunda. 2022\'de, sözleşme anlaşmazlığı Sözleşme Tanıma Kurulu\'na gidip McLaren lehine sonuçlanırken Alpine\'in yedeği olarak bekledi. 2023\'te McLaren\'a katıldı, Katar sprintini kazandı, 2024\'te Macaristan\'da ilk Grand Prix\'sini aldı. Sabrın karşılığı hızlı geldi.',
      milestones: [
        '2020: çaylak sezonunda Formula 3 şampiyonu',
        '2021: çaylak sezonunda Formula 2 şampiyonu',
        '2023: McLaren ile ilk sezon, Katar sprint galibiyeti',
        '2024: ilk Grand Prix galibiyeti, Macaristan',
      ],
      lore: 'Katar 2023 ikisini aynı hafta sonuna sığdırdı: cumartesi sprint galibiyeti, pazar günü ilk Grand Prix podyumu.',
    },
  },
  {
    driverId: 'russell',
    number: 63,
    nationality: 'British',
    born: 1998,
    bio: 'George Russell won GP3 in 2017 and Formula 2 in 2018, both at the first attempt, then spent three seasons at the back with Williams. In 2021 he finished second in the rain-shortened Belgian Grand Prix. A permanent Mercedes seat followed in 2022, and with it his first win, in Brazil. The apprenticeship was long; the speed was never in doubt.',
    milestones: [
      '2017: GP3 champion',
      '2018: Formula 2 champion',
      '2020: leads the Sakhir GP as a Mercedes stand-in, finishes ninth',
      '2022: first win, Brazil, in his first season as a Mercedes driver',
    ],
    lore: 'At the 2020 Sakhir Grand Prix, standing in for Hamilton, he led most of the race. A pit-stop mix-up and a late puncture took the win away.',
    tr: {
      bio: 'George Russell 2017\'de GP3\'ü, 2018\'de Formula 2\'yi ilk denemede kazandı, ardından üç sezon Williams\'la grubun arkasında yarıştı. 2021\'de yağmurla kısalan Belçika Grand Prix\'sini ikinci bitirdi. 2022\'de kalıcı bir Mercedes koltuğu geldi, onunla birlikte ilk galibiyeti, Brezilya\'da. Çıraklık uzundu; hızından kimsenin şüphesi yoktu.',
      milestones: [
        '2017: GP3 şampiyonu',
        '2018: Formula 2 şampiyonu',
        '2020: Mercedes vekili olarak Sakhir GP\'sinde liderlik, dokuzuncu bitiriş',
        '2022: Mercedes\'teki ilk sezonunda ilk galibiyet, Brezilya',
      ],
      lore: '2020 Sakhir Grand Prix\'sinde Hamilton\'ın yerine yarışırken yarışın büyük bölümünde lider gitti. Bir pit karışıklığı ve geç gelen patlak lastik galibiyeti elinden aldı.',
    },
  },
  {
    driverId: 'alonso',
    number: 14,
    nationality: 'Spanish',
    born: 1981,
    bio: 'Fernando Alonso is the long argument of Formula 1: can the best driver of a generation be measured by the titles he did not win? He won two, in 2005 and 2006 with Renault, and ended the Schumacher years. He lost a third to Sebastian Vettel by three points in 2012, in a Ferrari that had no business being there. He is still on the grid, now with Aston Martin, into his forties.',
    milestones: [
      '2001: debut with Minardi',
      '2003: first win, Hungary, youngest winner at the time',
      '2005 and 2006: back-to-back titles with Renault',
      '2012: runner-up by three points with Ferrari',
    ],
    lore: 'He came back in 2021 after two years away and finished third in Qatar, his first podium in seven years.',
    tr: {
      bio: 'Fernando Alonso Formula 1\'in uzun tartışmasıdır: bir kuşağın en iyi sürücüsü, kazanamadığı şampiyonluklarla mı ölçülür? İki tane kazandı, 2005 ve 2006\'da Renault ile ve Schumacher yıllarını kapattı. Üçüncüsünü 2012\'de Sebastian Vettel\'e üç puan farkla kaybetti, orada olmaması gereken bir Ferrari ile. Kırklı yaşlarına girerken hâlâ gridde, şimdi Aston Martin\'le.',
      milestones: [
        '2001: Minardi ile ilk yarış',
        '2003: ilk galibiyet, Macaristan, o günün en genç galibi',
        '2005 ve 2006: Renault ile art arda şampiyonluk',
        '2012: Ferrari ile üç puanla ikincilik',
      ],
      lore: '2021\'de iki yıllık aranın ardından döndü ve Katar\'da üçüncü oldu; yedi yıl sonraki ilk podyumuydu.',
    },
  },
  {
    driverId: 'antonelli',
    number: 12,
    nationality: 'Italian',
    born: 2006,
    bio: 'Andrea Kimi Antonelli reached Formula 1 at 18 and was handed the most watched seat of 2025: the Mercedes drive Lewis Hamilton had just left. Born in Bologna in 2006, he went from Italian Formula 4 in 2022 to Formula Regional Europe in 2023 and a single season of Formula 2 in 2024, then straight to the top. Few rookies have started with so little time to be a rookie.',
    milestones: [
      '2022: Italian Formula 4 champion',
      '2023: Formula Regional Europe champion',
      '2024: one season in Formula 2 with Prema',
      '2025: Formula 1 debut with Mercedes at 18',
    ],
    lore: 'Mercedes announced him in late August 2024, before his Formula 2 season had ended.',
    tr: {
      bio: 'Andrea Kimi Antonelli Formula 1\'e 18 yaşında geldi ve 2025\'in en çok izlenen koltuğunu devraldı: Lewis Hamilton\'ın yeni bıraktığı Mercedes koltuğu. 2006\'da Bologna\'da doğdu; 2022\'de İtalyan Formula 4\'ten 2023\'te Formula Regional Europe\'a, 2024\'te tek sezonluk Formula 2\'ye, oradan doğrudan zirveye çıktı. Az sayıda çaylak, çaylak olmaya bu kadar az zamanla başlamıştır.',
      milestones: [
        '2022: İtalyan Formula 4 şampiyonu',
        '2023: Formula Regional Europe şampiyonu',
        '2024: Prema ile tek sezonluk Formula 2',
        '2025: 18 yaşında Mercedes ile Formula 1\'e ilk adım',
      ],
      lore: 'Mercedes onu, Formula 2 sezonu daha bitmeden, Ağustos 2024\'ün sonunda açıkladı.',
    },
  },
  {
    driverId: 'sainz',
    number: 55,
    nationality: 'Spanish',
    born: 1994,
    bio: 'Carlos Sainz Jr. is the son of a two-time rally world champion and the kind of driver teams keep coming back to: Toro Rosso, Renault, McLaren, Ferrari, Williams. He took his first podium in Brazil in 2019, his first win at Silverstone in 2022, and added Australia in 2024 just weeks after surgery for appendicitis. Reliable is a word he has made sound like praise.',
    milestones: [
      '2015: debut with Toro Rosso',
      '2019: first podium, Brazil, with McLaren',
      '2022: first win and first pole, Silverstone, with Ferrari',
      '2024: wins Australia weeks after appendicitis surgery',
    ],
    lore: 'Ferrari had announced Hamilton for 2025 in February 2024. Sainz still won in Melbourne a few weeks later.',
    tr: {
      bio: 'Carlos Sainz Jr. iki kez dünya ralli şampiyonu olmuş bir babanın oğlu ve takımların yeniden aradığı türden bir sürücü: Toro Rosso, Renault, McLaren, Ferrari, Williams. İlk podyumunu 2019\'da Brezilya\'da, ilk galibiyetini 2022\'de Silverstone\'da aldı; 2024\'te apandisit ameliyatından haftalar sonra Avustralya\'yı da ekledi. "Güvenilir" sözcüğünü bir övgüye çevirdi.',
      milestones: [
        '2015: Toro Rosso ile ilk yarış',
        '2019: McLaren ile ilk podyum, Brezilya',
        '2022: Ferrari ile ilk galibiyet ve ilk pole, Silverstone',
        '2024: apandisit ameliyatından haftalar sonra Avustralya\'yı kazanır',
      ],
      lore: 'Ferrari, Hamilton\'ı 2025 için Şubat 2024\'te açıklamıştı. Sainz yine de birkaç hafta sonra Melbourne\'de kazandı.',
    },
  },
  {
    driverId: 'stroll',
    number: 18,
    nationality: 'Canadian',
    born: 1998,
    bio: 'Lance Stroll came to Formula 1 in 2017 as the European Formula 3 champion of the year before, and he has carried one question ever since: how much of this is his father\'s money? His father, Lawrence, leads the group that owns Aston Martin\'s team. The record answers in part. He has three podiums, one pole position in the wet at Turkey in 2020, and a place on the grid that he has kept for years.',
    milestones: [
      '2016: European Formula 3 champion',
      '2017: debut with Williams, podium in Baku',
      '2020: pole position at the Turkish Grand Prix',
      '2021: Aston Martin\'s first season under its own name',
    ],
    lore: 'The team he drives for was Racing Point in 2019 and 2020 and became Aston Martin in 2021: same garage, new name.',
    tr: {
      bio: 'Lance Stroll 2017\'de, bir önceki yılın Avrupa Formula 3 şampiyonu olarak Formula 1\'e geldi ve o günden beri tek bir soruyu taşıyor: bunun ne kadarı babasının parası? Babası Lawrence, Aston Martin takımının sahibi olan grubun başında. Kayıtlar soruyu kısmen yanıtlıyor: üç podyum, 2020 Türkiye\'de ıslak pistte bir pole pozisyonu ve yıllardır korunan bir grid yeri.',
      milestones: [
        '2016: Avrupa Formula 3 şampiyonu',
        '2017: Williams ile ilk yarış, Bakü\'de podyum',
        '2020: Türkiye Grand Prix\'sinde pole pozisyonu',
        '2021: Aston Martin\'in kendi adıyla ilk sezonu',
      ],
      lore: 'Yarıştığı takım 2019 ve 2020\'de Racing Point idi, 2021\'de Aston Martin oldu: aynı garaj, yeni isim.',
    },
  },
  {
    driverId: 'colapinto',
    number: 43,
    nationality: 'Argentine',
    born: 2003,
    bio: 'Franco Colapinto brought Argentina back to Formula 1 after more than two decades. Called up by Williams at Monza in 2024 to replace Logan Sargeant, he scored points in only his second race, in Baku, with an eighth place. In 2025 he moved to Alpine. Grandstands in Buenos Aires paid attention before the rest of the world did.',
    milestones: [
      '2024: Williams debut at Monza',
      '2024: eighth in Baku, points in his second race',
      '2025: joins Alpine mid-season',
    ],
    lore: 'No Argentine had started a Formula 1 Grand Prix since Gastón Mazzacane in 2001.',
    tr: {
      bio: 'Franco Colapinto, Arjantin\'i yirmi yılı aşkın bir aradan sonra Formula 1\'e geri getirdi. 2024\'te Monza\'da Logan Sargeant\'ın yerine Williams\'a çağrıldı ve yalnızca ikinci yarışında, Bakü\'de sekizinci olarak puan aldı. 2025\'te Alpine\'e geçti. Buenos Aires\'in tribünleri dünyanın geri kalanından önce fark etti.',
      milestones: [
        '2024: Monza\'da Williams ile ilk yarış',
        '2024: Bakü\'de sekizincilik, ikinci yarışında puan',
        '2025: sezon ortasında Alpine\'e geçiş',
      ],
      lore: '2001\'de Gastón Mazzacane\'den beri hiçbir Arjantinli Formula 1 Grand Prix\'sine çıkmamıştı.',
    },
  },
  {
    driverId: 'lindblad',
    number: 41,
    nationality: 'British',
    born: 2007,
    bio: 'Arvid Lindblad was born in London in 2007 to a Swedish father and an Indian mother, races under the British flag, and is the youngest driver on the 2026 grid. He comes from Red Bull\'s junior programme, which has a long record of promoting drivers early and judging them quickly. He enters with a clean sheet and very little time to fill it.',
    milestones: [
      '2007: born in London',
      '2026: Formula 1 debut with Racing Bulls',
    ],
    lore: '',
    tr: {
      bio: 'Arvid Lindblad 2007\'de Londra\'da, İsveçli bir baba ile Hintli bir annenin çocuğu olarak doğdu, Britanya bayrağı altında yarışıyor ve 2026 gridinin en genç sürücüsü. Sürücüleri erken yükseltip çabuk değerlendirme geleneği olan Red Bull gençlik programından geliyor. Sayfası boş, onu doldurmak için de çok az zamanı var.',
      milestones: [
        '2007: Londra\'da doğum',
        '2026: Racing Bulls ile Formula 1\'e ilk adım',
      ],
      lore: '',
    },
  },
  {
    driverId: 'gasly',
    number: 10,
    nationality: 'French',
    born: 1996,
    bio: 'Pierre Gasly\'s career is a lesson in what a demotion can do. GP2 champion in 2016, promoted to Red Bull in 2019 and sent back to Toro Rosso after twelve races, he answered with a podium in Brazil that year and a win at Monza in 2020 for AlphaTauri, in a race stopped by a red flag. Since 2023 he has raced for Alpine. The setback became the story.',
    milestones: [
      '2016: GP2 champion',
      '2019: promoted to Red Bull, demoted after twelve races',
      '2019: second place in Brazil',
      '2020: wins the Italian Grand Prix',
    ],
    lore: 'Monza 2020 was the first Grand Prix win for a French driver since Olivier Panis at Monaco in 1996.',
    tr: {
      bio: 'Pierre Gasly\'nin kariyeri, bir tenzilin neler yapabileceğinin dersi. 2016 GP2 şampiyonu, 2019\'da Red Bull\'a terfi etti ve on iki yarış sonra Toro Rosso\'ya geri gönderildi; o yıl Brezilya\'da podyumla, 2020\'de AlphaTauri ile Monza\'da kırmızı bayrakla kesilen bir yarışta galibiyetle cevap verdi. 2023\'ten beri Alpine\'de yarışıyor. Gerilemenin kendisi hikâye oldu.',
      milestones: [
        '2016: GP2 şampiyonu',
        '2019: Red Bull\'a terfi, on iki yarış sonra geri gönderilme',
        '2019: Brezilya\'da ikincilik',
        '2020: İtalya Grand Prix\'sini kazanır',
      ],
      lore: 'Monza 2020, 1996 Monako\'da Olivier Panis\'ten beri bir Fransız sürücünün ilk Grand Prix galibiyetiydi.',
    },
  },
  {
    driverId: 'hadjar',
    number: 6,
    nationality: 'French',
    born: 2004,
    bio: 'Isack Hadjar\'s first Grand Prix ended before it began: he crashed on the formation lap in Melbourne in 2025. Five months later he was on the podium at Zandvoort. Runner-up in Formula 2 in 2024, he earned a Red Bull seat for 2026 by showing that the first lap of his career was a bad day, not a verdict.',
    milestones: [
      '2024: Formula 2 runner-up',
      '2025: crashes on the formation lap of his debut race in Melbourne',
      '2025: third place at the Dutch Grand Prix',
      '2026: moves up to Red Bull',
    ],
    lore: '',
    tr: {
      bio: 'Isack Hadjar\'ın ilk Grand Prix\'si başlamadan bitti: 2025\'te Melbourne\'de ısınma turunda kaza yaptı. Beş ay sonra Zandvoort\'ta podyumdaydı. 2024 Formula 2 ikincisi; kariyerinin ilk turunun bir hüküm değil, kötü bir gün olduğunu göstererek 2026 için Red Bull koltuğunu kazandı.',
      milestones: [
        '2024: Formula 2 ikincisi',
        '2025: ilk yarışının ısınma turunda Melbourne\'da kaza',
        '2025: Hollanda Grand Prix\'sinde üçüncülük',
        '2026: Red Bull\'a terfi',
      ],
      lore: '',
    },
  },
  {
    driverId: 'bearman',
    number: 87,
    nationality: 'British',
    born: 2005,
    bio: 'Oliver Bearman made his Formula 1 debut at 18 in Saudi Arabia in 2024, called in when Carlos Sainz was taken to hospital with appendicitis. He had less than a day to prepare. He finished seventh for Ferrari and scored points on debut. A full-time seat at Haas followed for 2025, which is what a performance like that is for.',
    milestones: [
      '2024: Ferrari substitute at the Saudi Arabian Grand Prix, seventh place',
      '2024: Haas appearance in Azerbaijan',
      '2025: full-time Formula 1 seat with Haas',
    ],
    lore: '',
    tr: {
      bio: 'Oliver Bearman Formula 1\'e 2024\'te Suudi Arabistan\'da 18 yaşında çıktı; Carlos Sainz apandisitle hastaneye kaldırılınca çağrıldı. Hazırlanmak için bir günden az zamanı vardı. Ferrari ile yedinci bitirdi ve ilk yarışında puan aldı. 2025 için Haas\'ta tam zamanlı koltuk geldi; böyle bir performans tam bunun içindir.',
      milestones: [
        '2024: Suudi Arabistan Grand Prix\'sinde Ferrari vekili, yedincilik',
        '2024: Azerbaycan\'da Haas ile yarış',
        '2025: Haas ile tam zamanlı Formula 1 koltuğu',
      ],
      lore: '',
    },
  },
  {
    driverId: 'bortoleto',
    number: 5,
    nationality: 'Brazilian',
    born: 2004,
    bio: 'Gabriel Bortoleto won Formula 3 in 2023 and Formula 2 in 2024, the same ladder Piastri climbed before him. He entered Formula 1 in 2025 with Sauber, the first Brazilian on the grid since Felipe Massa retired in 2017, and in 2026 stays with the same team as it becomes Audi. Few drivers get to grow up alongside a project of this size.',
    milestones: [
      '2023: Formula 3 champion',
      '2024: Formula 2 champion',
      '2025: Formula 1 debut with Sauber',
      '2026: stays as the team becomes Audi',
    ],
    lore: '',
    tr: {
      bio: 'Gabriel Bortoleto 2023\'te Formula 3\'ü, 2024\'te Formula 2\'yi kazandı; Piastri\'nin ondan önce çıktığı aynı merdiven. 2025\'te Sauber ile Formula 1\'e girdi, 2017\'de Felipe Massa\'nın emekliliğinden beri gridde ilk Brezilyalı oldu; 2026\'da takım Audi\'ye dönüşürken aynı takımda kalıyor. Az sayıda sürücü, bu ölçekte bir projeyle birlikte büyüme şansı bulur.',
      milestones: [
        '2023: Formula 3 şampiyonu',
        '2024: Formula 2 şampiyonu',
        '2025: Sauber ile Formula 1\'e ilk adım',
        '2026: takım Audi olurken kadroda kalır',
      ],
      lore: '',
    },
  },
  {
    driverId: 'albon',
    number: 23,
    nationality: 'Thai',
    born: 1996,
    bio: 'Alexander Albon was born in London, races under the Thai flag, and has already lived two careers. Promoted to Red Bull after twelve races at Toro Rosso in 2019, he took two podiums in 2020 and lost the seat anyway. He spent 2021 on the sidelines as a reserve, then came back with Williams in 2022 and became the backbone of the team. A comeback is a harder thing than a debut.',
    milestones: [
      '2019: promoted to Red Bull after twelve races at Toro Rosso',
      '2020: two podiums with Red Bull',
      '2021: a year out as reserve driver',
      '2022: returns with Williams',
    ],
    lore: '',
    tr: {
      bio: 'Alexander Albon Londra\'da doğdu, Tayland bayrağı altında yarışıyor ve şimdiden iki kariyer yaşadı. 2019\'da Toro Rosso\'daki on iki yarışın ardından Red Bull\'a terfi etti, 2020\'de iki podyum aldı ve yine de koltuğu kaybetti. 2021\'i yedek sürücü olarak kenarda geçirdi, 2022\'de Williams ile döndü ve takımın belkemiği oldu. Geri dönüş, ilk adımdan daha zordur.',
      milestones: [
        '2019: Toro Rosso\'daki on iki yarıştan sonra Red Bull\'a terfi',
        '2020: Red Bull ile iki podyum',
        '2021: yedek sürücü olarak bir yıl ara',
        '2022: Williams ile dönüş',
      ],
      lore: '',
    },
  },
  {
    driverId: 'hulkenberg',
    number: 27,
    nationality: 'German',
    born: 1987,
    bio: 'Nico Hülkenberg carried a record nobody wants: the most starts without a podium. GP2 champion in 2009, pole position in the rain at Brazil in 2010 as a Williams rookie, winner of Le Mans in 2015 with Porsche, he kept being fast in cars that were not. In 2025, with Sauber, he finally stood on a podium at Silverstone after more than two hundred and thirty starts.',
    milestones: [
      '2009: GP2 champion',
      '2010: pole position at the Brazilian Grand Prix with Williams',
      '2015: wins the 24 Hours of Le Mans',
      '2025: first podium, Silverstone, with Sauber',
    ],
    lore: '',
    tr: {
      bio: 'Nico Hülkenberg kimsenin istemediği bir rekoru taşıdı: podyuma çıkmadan en çok yarış. 2009 GP2 şampiyonu, 2010\'da Williams çaylağı olarak Brezilya\'da yağmurda pole, 2015\'te Porsche ile Le Mans galibi; hızlı olmayan araçlarda hızlı olmaya devam etti. 2025\'te Sauber ile Silverstone\'da, iki yüz otuzdan fazla yarışın ardından sonunda bir podyuma çıktı.',
      milestones: [
        '2009: GP2 şampiyonu',
        '2010: Williams ile Brezilya Grand Prix\'sinde pole pozisyonu',
        '2015: 24 Saat Le Mans\'ı kazanır',
        '2025: Sauber ile ilk podyum, Silverstone',
      ],
      lore: '',
    },
  },
  {
    driverId: 'bottas',
    number: 77,
    nationality: 'Finnish',
    born: 1989,
    bio: 'Valtteri Bottas spent five years at Mercedes as the second driver in a car good enough to win everything, and made a career out of being exactly good enough to keep it there. Ten Grand Prix wins, second in the championship in 2019, five constructors\' titles with the team. He then reinvented himself at Alfa Romeo and Sauber, and in 2026 joins the new Cadillac team.',
    milestones: [
      '2013: debut with Williams',
      '2017: first win, Russia, in his first season at Mercedes',
      '2017 to 2021: five constructors\' titles with Mercedes',
      '2026: Cadillac\'s first season',
    ],
    lore: 'Mercedes signed him in January 2017 to replace Nico Rosberg, who had retired as world champion weeks earlier.',
    tr: {
      bio: 'Valtteri Bottas beş yıl Mercedes\'te, her şeyi kazanmaya yetecek bir araçta ikinci sürücü olarak yarıştı ve kariyerini tam o koltukta kalacak kadar iyi olmak üzerine kurdu. On Grand Prix galibiyeti, 2019\'da şampiyonada ikincilik, takımla beş Markalar Şampiyonluğu. Sonra Alfa Romeo ve Sauber\'de kendini yeniden kurdu; 2026\'da yeni Cadillac takımına katılıyor.',
      milestones: [
        '2013: Williams ile ilk yarış',
        '2017: Mercedes\'teki ilk sezonunda ilk galibiyet, Rusya',
        '2017–2021: Mercedes ile beş Markalar Şampiyonluğu',
        '2026: Cadillac\'ın ilk sezonu',
      ],
      lore: 'Mercedes onu, haftalar önce şampiyon olarak emekli olan Nico Rosberg\'in yerine Ocak 2017\'de imzaladı.',
    },
  },
  {
    driverId: 'lawson',
    number: 30,
    nationality: 'New Zealander',
    born: 2002,
    bio: 'Liam Lawson earned his Formula 1 debut as an emergency substitute: five races for AlphaTauri in 2023 when Daniel Ricciardo broke a hand, with points in Singapore. A full season took until 2025, and it began at Red Bull and, after two races, turned into a swap back to Racing Bulls. He has made a habit of being ready when the phone rings.',
    milestones: [
      '2023: five races for AlphaTauri, points in Singapore',
      '2024: returns for the final rounds with RB',
      '2025: two races at Red Bull, then back to Racing Bulls',
    ],
    lore: '',
    tr: {
      bio: 'Liam Lawson Formula 1\'e acil bir vekil olarak girdi: 2023\'te Daniel Ricciardo\'nun eli kırılınca AlphaTauri ile beş yarış ve Singapur\'da puan. Tam bir sezon 2025\'e kadar sürdü; Red Bull\'da başladı ve iki yarış sonra Racing Bulls\'a geri dönüşle sonuçlandı. Telefon çaldığında hazır olmayı alışkanlık hâline getirdi.',
      milestones: [
        '2023: AlphaTauri ile beş yarış, Singapur\'da puan',
        '2024: sezon sonunda RB ile geri dönüş',
        '2025: Red Bull\'da iki yarış, ardından Racing Bulls\'a dönüş',
      ],
      lore: '',
    },
  },
  {
    driverId: 'ocon',
    number: 31,
    nationality: 'French',
    born: 1996,
    bio: 'Esteban Ocon won the European Formula 3 title in 2014 and reached Formula 1 in 2016 with Manor. He lost his seat once and got it back through persistence. In Hungary in 2021, in a race reshuffled by a first-corner collision, he won for Alpine. It is the only Grand Prix victory of his career so far. In 2025 he moved to Haas.',
    milestones: [
      '2014: European Formula 3 champion',
      '2016: debut with Manor',
      '2021: first win, Hungary, with Alpine',
      '2025: joins Haas',
    ],
    lore: '',
    tr: {
      bio: 'Esteban Ocon 2014\'te Avrupa Formula 3 şampiyonluğunu kazandı ve 2016\'da Manor ile Formula 1\'e geldi. Bir kez koltuğunu kaybetti ve ısrarla geri aldı. 2021\'de Macaristan\'da, ilk virajdaki bir çarpışmayla yeniden karışan bir yarışta Alpine ile kazandı. Kariyerinin şimdilik tek Grand Prix galibiyeti. 2025\'te Haas\'a geçti.',
      milestones: [
        '2014: Avrupa Formula 3 şampiyonu',
        '2016: Manor ile ilk yarış',
        '2021: Alpine ile ilk galibiyet, Macaristan',
        '2025: Haas\'a katılır',
      ],
      lore: '',
    },
  },
  {
    driverId: 'perez',
    number: 11,
    nationality: 'Mexican',
    born: 1990,
    bio: 'Sergio Pérez is the driver who makes tyres last. His first podium, second place in Malaysia in 2012, came from exactly that: patience on rubber that his rivals were burning through. He won his first Grand Prix for Racing Point in Sakhir in 2020, after dropping to last place on lap one, and went on to win with Red Bull between 2021 and 2024, including Monaco and Singapore in 2022. In 2026 he joins Cadillac.',
    milestones: [
      '2011: debut with Sauber',
      '2012: first podium, Malaysia',
      '2020: first win, Sakhir, with Racing Point',
      '2022: wins Monaco and Singapore with Red Bull',
    ],
    lore: '',
    tr: {
      bio: 'Sergio Pérez lastiği ayakta tutan sürücüdür. İlk podyumu, 2012 Malezya\'daki ikincilik, tam bundan geldi: rakiplerin yaktığı lastikte sabır. İlk Grand Prix\'sini 2020\'de Sakhir\'de Racing Point ile, ilk turda sonuncu sıraya düştükten sonra kazandı; 2021 ile 2024 arasında Red Bull ile de kazandı, 2022\'de Monako ve Singapur dahil. 2026\'da Cadillac\'a katılıyor.',
      milestones: [
        '2011: Sauber ile ilk yarış',
        '2012: ilk podyum, Malezya',
        '2020: Racing Point ile ilk galibiyet, Sakhir',
        '2022: Red Bull ile Monako ve Singapur\'u kazanır',
      ],
      lore: '',
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
