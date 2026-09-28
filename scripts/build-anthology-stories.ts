import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StoryContentRecord } from '../data/stories/types';

export const stories: StoryContentRecord[] = [
  // 01. senna-monaco
  {
    slug: 'senna-monaco',
    title: 'The Divine Lap',
    titleTr: 'Kırılgan Kusursuzluk',
    subtitle: 'Monaco, 1988. Senna on the limit in the MP4/4, Prost on the data—and two seconds between two philosophies before the crash at Portier.',
    subtitleTr: '1988 Monaco, Senna’nın ilahi bir boyuta geçişi değil; bir takım arkadaşını psikolojik olarak yok etme arzusunun mekanik disiplini ezdiği ve kusursuzluğun kibrine yenildiği gündür.',
    year: '1988',
    category: 'Legend',
    heroImage: '/stories/senna-monaco/landscape/01.png',
    blocks: [
      {
        type: 'paragraph',
        text: 'Monaco is never a circuit; it is an unforgiving corridor, a cage of steel and painted curbs where margin of error does not exist. Speed here is not an act of bravery, but an obsessive spatial memory measured in millimeters. On Saturday, May 14, 1988, when Ayrton Senna flashed across the timing line in qualifying, the chronometer stopped at 1:23.998. Alain Prost, strapped into the identical McLaren MP4/4 with the identical twin-turbo Honda V6, sat in second place, 1.427 seconds adrift. In modern Grand Prix racing, that is not a gap; it is an epoch.'
      },
      {
        type: 'quote',
        text: 'I was no longer driving the car consciously. I was driving it by a kind of instinct, only I was in a different dimension.',
        author: 'Ayrton Senna'
      },
      {
        type: 'paragraph',
        text: 'Mythology insists Senna stepped into an ethereal, religious dimension that afternoon—driving through an out-of-body instinct that transcended physics. The telemetry tells a far colder, more human truth. That lap was an act of psychological warfare designed to break the spirit of the reigning double world champion across the garage. Senna wanted to dismantle Prost’s composure until nothing remained. Yet on the opposite side of the partition, Prost did not unravel. The Frenchman understood the long mathematics of a sixteen-race calendar. He understood that points are paid on Sunday afternoon, not Saturday morning, and that burning tires and grazing armcos for vanity yields nothing at the season’s end. Prost was not timid; he was simply rational.'
      },
      {
        type: 'image',
        src: '/stories/senna-monaco/full/01.png',
        caption: 'McLaren-Honda MP4/4, Senna on the streets of Monte Carlo, 1988.',
        layout: 'full'
      },
      {
        type: 'heading',
        text: 'The Fracture at Portier'
      },
      {
        type: 'paragraph',
        text: 'By Sunday, the gap was an avalanche. By Lap 67, Senna held a monstrous fifty-four-second advantage over Prost. With victory uncontested, Ron Dennis keyed the pit-to-car radio: "Ayrton, relax. Slow down. The race is won." In a racing car operating at the knife’s edge, dropping concentration by five percent is far more lethal than pushing for the ultimate tenth. The rhythm fractured. As Senna backed off, the weight transfer under braking shifted by fractions. Entering Portier—the slow, deceptive right-hander before the tunnel—the inside front tire clipped the armco by half an inch. The suspension sheared instantly. The chassis swung into the wall. The engine stalled into dead silence.'
      },
      {
        type: 'paragraph',
        text: 'Senna did not take off his helmet. He did not return to the pit lane to debrief. He stepped over the barriers, walked past the marshals without a word, and headed straight up the hill to his apartment on Boulevard Princesse Grace. While Prost climbed the podium to claim maximum points, Senna sat in a locked room in the dark. Perfection is not an armor; it is a pane of glass that shatters the moment you look away.'
      }
    ],
    blocksTr: [
      {
        type: 'paragraph',
        text: 'Monaco bir yarış pisti değildir; iki buçuk kilometrelik bir koridor, hata payı sıfıra indirilmiş beton bir kafestir. Bu dar sokaklarda hızlı gitmek cesaretle değil, otomobilin genişliğini milimetrelerle ezberlemekle ilgilidir. 14 Mayıs 1988 Cumartesi günü Ayrton Senna sıralama turlarında damalı bayrağın altından geçtiğinde, kronometreler 1:23.998’i gösteriyordu. İkinci sıradaki Alain Prost ile arasındaki fark tam 1.427 saniyeydi. Aynı McLaren MP4/4, aynı Honda turbo motoru ve arada Formula 1 standartlarında bir ömür kadar uzun bir uçurum.'
      },
      {
        type: 'quote',
        text: 'Otomobili artık bilinçli olarak sürmüyordum. Farklı bir boyutta, saf bir içgüdüyle gidiyordum.',
        author: 'Ayrton Senna'
      },
      {
        type: 'paragraph',
        text: 'Popüler anlatı, Senna’nın o öğleden sonra ilahi bir boyuta geçtiğini ve otomobili kendi bilincinin ötesinde bir güçle sürdüğünü söyler. Gerçek ise çok daha dünyevi ve çok daha acımasızdı. Bu derece, bir aşkınlığın değil; aynı garajı paylaştığı adamı zihinsel olarak felç etme hırsının eseriydi. Senna, iki dünya şampiyonluğu bulunan Prost’un elinden sadece ilk cebi değil, yarışma arzusunu da almak istiyordu. Oysa garajın diğer tarafında oturan Fransız, telemetri çıktısına bakarken ne dehşete kapılmıştı ne de paniklemişti. Alain Prost bir şampiyonanın tek bir cumartesi günü kazanılmayacağını, puan cetvelinin gösterişli turlara değil pazar finişlerine prim verdiğini bilecek kadar kıdemliydi. Frenlerini korudu, şanzıman dişlilerine saygı gösterdi ve beklemeyi seçti. Prost korkak değildi; yalnızca yarışın ekonomisini biliyordu.'
      },
      {
        type: 'image',
        src: '/stories/senna-monaco/full/01.png',
        caption: 'McLaren-Honda MP4/4, Senna Monaco sokaklarında, 1988.',
        layout: 'full'
      },
      {
        type: 'heading',
        text: 'Portier’de Kırılan Cam'
      },
      {
        type: 'paragraph',
        text: 'Pazar günü yarış başladığında fark biriken bir çığ gibi büyüdü. 67. tura gelindiğinde Senna, ikinci sıradaki Prost’un tam elli dört saniye önündeydi. Takım patronu Ron Dennis telsize uzandı ve o meşhur talimatı verdi: "Ayrton, yavaşla. Yarış bitti, sadece aracı eve getir." Bazen en tehlikeli an, bir pilotun zihnindeki gerilimin aniden düşürüldüğü andır. Ritmi bozulan bir yarış otomobili, cam gibi kırılganlaşır. Senna gaz pedalındaki baskıyı milimetrik olarak gevşettiğinde, viraj girişlerindeki ağırlık transferi değişti. Tünel çıkışındaki şikan geride kalmış, Portier virajının dar sağ apeksi yaklaşmıştı. Bir anlık dikkat kaybı, bariyerin iç yüzeyine hafif bir dokunuş ve McLaren’ın sol ön süspansiyonu un ufak oldu. Otomobil durdu. Motor sustu.'
      },
      {
        type: 'paragraph',
        text: 'Senna kaskını çıkarmadı. Garaja dönmedi. Pist görevlilerinin uzattığı eli görmezden gelerek bariyerin üzerinden atladı ve birkaç yüz metre ötedeki dairesine doğru sessizce yürüdü. McLaren garajı zaferi kutlarken, o telefonunu kapatmış, karanlık bir odada oturuyordu. Kusursuzluk, bir zırh değil; çatladığı anda parçalanan ince bir camdı.'
      }
    ]
  },

  // 02. hunt-lauda
  {
    slug: 'hunt-lauda',
    title: 'Fire & Ice',
    titleTr: 'Hesap Defteri ve Yangın',
    subtitle: 'The 1976 season was not just a championship battle; it was a philosophical war between James Hunt and Niki Lauda.',
    subtitleTr: '1976 sezonu bir zıtlıklar şovu değil; hayatı soğuk bir olasılık hesabı olarak gören bir akılla, hayatta kalmanın bedelini ödeyen bir iradenin sessiz mutabakatıdır.',
    year: '1976',
    category: 'Rivalry',
    heroImage: '/stories/hunt-lauda/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Paddock as an Actuarial Office'
      },
      {
        type: 'paragraph',
        text: 'The 1976 paddock was less an arena of sport than a cold actuarial office where mortal stakes were settled every fortnight. Niki Lauda approached motor racing with a mechanical pencil and a slide rule, calculating that an accident risk above twenty percent was bad business. James Hunt absorbed that same ambient terror through dry humor, loose ties, and cigarettes behind the pit wall. The press painted it as an opera of fire and ice, discipline against bohemian abandon. In truth, 1976 was never about personal enmity; it was a brutal negotiation over the price of staying alive.'
      },
      {
        type: 'image',
        src: '/stories/hunt-lauda/landscape/02.png',
        caption: 'Hunt in the rain, Zandvoort.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Lauda was clinically detached, yet he was never devoid of fear. He simply refused to romanticize it. On the morning of August 1 at the Nürburgring, with drizzle coating the fourteen-mile expanse of the Eifel mountains, Lauda stood before the drivers’ briefing and urged a collective boycott. The circuit was unmanageable; safety crews were stationed too far apart, and the mathematical probability of a fatal failure was unacceptable. A vote was called. Lauda lost by a single ballot. Hunt and several peers suspected political maneuvering—an attempt by the championship leader to neutralize a track that favored McLaren. In the shark tank of the 1970s, their suspicion was entirely rational.'
      },
      {
        type: 'heading',
        text: 'The Ledger Closes at Bergwerk'
      },
      {
        type: 'paragraph',
        text: 'Two hours later, approaching Bergwerk, the Ferrari’s rear suspension failed. The machine snapped into the embankment and erupted in flames. The physiological horror of those minutes belongs to clinical records, not editorial prose. What matters to history is what occurred forty-two days later at Monza. With raw grafts weeping blood beneath his fireproof balaclava and his eyelids surgically reconstructed, Lauda stepped back into the 312T2 and finished fourth in the Italian Grand Prix. It was not a theatrical display of bravado; it was an act of cold mental hygiene. He knew that if he did not sit back in the fire, fear would govern the rest of his life.'
      },
      {
        type: 'image',
        src: '/stories/hunt-lauda/portrait/01.png',
        caption: 'Lauda alongside the Ferrari 312T2.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'The reckoning concluded at Fuji beneath a violent deluge where spray swallowed the back straight whole. After two laps, Lauda guided his Ferrari into the pit lane, switched off the ignition, and unbuckled his harness. When team manager Mauro Forghieri offered to invent an electrical failure to save face, Lauda refused: "No. My life is worth more than a title." Hunt drove through the mist to finish third, clinching the championship by a solitary point. The Englishman earned the crown, but Lauda walked away with the moral architecture of modern racing: proving that true courage is knowing precisely when to leave the table.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Bir Muhasebe Odası Olarak Padok'
      },
      {
        type: 'paragraph',
        text: '1976 yılının padoku bir spor müsabakasından çok, her pazar can bedeli ödenen bir muhasebe odasını andırıyordu. Niki Lauda riski bir kurşun kalem ve hesap makinesiyle ölçüyor; pistteki her tehlikenin karşısına yüzde yirmilik bir kabul edilebilir kayıp payı koyuyordu. James Hunt ise aynı riski garaj arkasında içilen bir sigaranın dumanıyla karşılıyordu. Tribünler bu rekabeti "ateş ile buzun", disiplin ile sorumsuzluğun kavgası olarak izledi. Oysa o sezonun asıl meselesi karakter zıtlığı değil; ölümün eşiğinde yapılan bir matematik pazarlığıydı.'
      },
      {
        type: 'image',
        src: '/stories/hunt-lauda/landscape/02.png',
        caption: 'Hunt Zandvoort yağmurunda McLaren kokpitinde.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Lauda soğuk bir profesyoneldi ama korkusuz değildi; sadece olasılıkların rasyonel sınırlarına inanıyordu. 1 Ağustos 1976’da Nürburgring’in 22 kilometrelik yeşil cehenneminde yağmur çiselerken, Lauda pilotlar toplantısında yarışı boykot etmeyi önerdi. Pist çok uzundu, itfaiye ve ambulansların kaza yerine ulaşması dakikalar alıyordu ve o günün hava koşullarında kaza ihtimali kabul edilebilir risk marjının çok üzerindeydi. Oylama yapıldı; Lauda bir oyla kaybetti. James Hunt da dahil olmak üzere rakipleri, onun şampiyona liderliğini korumak için taktik yaptığını düşündü. Karşı cephenin bu şüphesi haksız değildi; Formula 1 padoğunda kimse bir diğerinin zayıflığına merhamet göstermezdi.'
      },
      {
        type: 'heading',
        text: 'Bergwerk’te Kapanan Defter'
      },
      {
        type: 'paragraph',
        text: 'İki saat sonra, Bergwerk virajında Ferrari’nin arka süspansiyonu kırıldığında hesap defteri kapandı. Alevler kokpiti sardı. Lauda içeride sıkıştı. Mekanik bir travmanın ayrıntısını deşmek bu hikâyeye bir şey katmaz. Önemli olan, altı hafta sonra Monza’da gerçekleşen şeydi. Yüzündeki yanık sargılarından hâlâ kan sızan, göz kapakları kırpılamayacak kadar gerilmiş bir adam yeniden kokpite girdi ve İtalya Grand Prix’sini dördüncü bitirdi. Bu Hollywood usulü bir cesaret gösterisi değildi; Lauda’nın kendi zihnine ve korkusuna kestiği mecburi bir faturaydı. Korkuyu yenmenin tek yolu, onu üreten mekanizmanın içine yeniden oturmaktı.'
      },
      {
        type: 'image',
        src: '/stories/hunt-lauda/portrait/01.png',
        caption: 'Lauda, Ferrari 312T2 başında.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Mevsimin sonu Fuji’de, gökyüzünün yere indiği bir muson yağmurunda geldi. Lauda ikinci turun sonunda Ferrari’sini pit yoluna çekti, emniyet kemerlerini çözdü ve arabadan indi. Mauro Forghieri ona mekanik bir arıza yalanı uydurmayı teklif ettiğinde Lauda başını salladı: "Hayır. Hava delice. Hayatım bir dünya şampiyonluğundan daha değerli." Hunt o gün üçüncü oldu ve şampiyonluğu bir puan farkla kazandı. Kupayı İngiliz aldı; ancak Formula 1’e hayatın ucuz bir kumar olmadığını, gerektiğinde masadan kalkabilmenin en büyük yarışçılık erdemi olduğunu öğreten adam, garajda montunu giyip sessizce havaalanına doğru yola çıkmıştı.'
      }
    ]
  },

  // 03. massa-2008
  {
    slug: 'massa-2008',
    title: 'The 39-Second Champion',
    titleTr: 'Otuz Dokuz Saniyelik Hükümranlık',
    subtitle: 'Interlagos, 2008. Felipe Massa crossed the line as the World Champion. Thirty-nine seconds later, history was rewritten in the final corner.',
    subtitleTr: '2008 Brezilya, bir pilotun şampiyonluğu son virajda kaybetmesinin trajedisi değil; sporun en acımasız anında sergilenen asaletin bir kupadan daha kalıcı bir miras bıraktığının belgesidir.',
    year: '2008',
    category: 'Tragedy',
    heroImage: '/stories/massa-2008/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'Interlagos Weather Front'
      },
      {
        type: 'paragraph',
        text: 'On November 2, 2008, the leaden sky above Interlagos did not merely threaten rain; it set a mechanical hourglass in motion. For Felipe Massa, the arithmetic was crystalline: win his home Grand Prix before a roaring paulista crowd, and hope Lewis Hamilton crossed the line sixth or worse. For Hamilton, fifth place was sufficient to secure his maiden title. Collective memory frames that afternoon as a cruel lottery decided in the final braking zone. In reality, the championship was not lost in Interlagos; it had already slipped through Ferrari’s fingers across months of compounding errors—a severed fuel rig in Singapore and an engine expiring three laps from home in Budapest.'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/landscape/02.png',
        caption: 'Interlagos grid beneath the gathering storm.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Yet across those seventy-one laps, Massa produced the defining drive of his life. Launching cleanly from pole position through the spray, he navigated the treacherous Senna \'S\' with microscopic precision. When the heavens broke six laps from the checkered flag, pit walls plunged into high-stakes gambling. McLaren brought Hamilton in for intermediate tires. Toyota left Timo Glock out on dry slicks. It was neither a conspiracy nor a wild gamble; for a midfield constructor chasing constructor points, track position in wet-dry flux was a cold, justifiable calculus.'
      },
      {
        type: 'heading',
        text: 'The Vanishing Title'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/portrait/01.png',
        caption: 'Ferrari F2008 cutting through the spray.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'Is that Glock? Is that Glock going slowly?',
        author: 'Martin Brundle'
      },
      {
        type: 'paragraph',
        text: 'Massa met the checkered flag first. The grandstands erupted into pandemonium. The Ferrari garage dissolved into tears of ecstasy. For thirty-nine seconds, Felipe Massa was the Champion of the World. As the seconds bled away, Glock’s grooved dry tires surrendered entirely to the pooling water on the climb out of Junção. The Toyota was a raft on ice. Hamilton sighted the sliding car, darted down the inside, claimed fifth place, and crossed the line. In the Ferrari garage, the celebration imploded mid-gasp. Joy curdled into paralysis. A global crown had evaporated within the span of a single exhale.'
      },
      {
        type: 'heading',
        text: 'The Measure of Dignity'
      },
      {
        type: 'paragraph',
        text: 'Yet the true climax of that afternoon took place not on the tarmac, but on the podium. Standing beneath the deluge with tears mixing with champagne, Massa thumped his fist against his heart, acknowledging his people with unbroken dignity. He offered no scapegoats, lodged no grievances, and directed no blame toward Glock. The trophy was flown to Woking; but the grace with which Massa absorbed defeat remains the enduring monument of 2008.'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/full/01.png',
        caption: 'Massa on the podium, rain, tears, and unbroken pride.',
        layout: 'full'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Interlagos’un Üzerindeki Saat'
      },
      {
        type: 'paragraph',
        text: 'São Paulo’nun nemli göğü 2 Kasım 2008 Pazar günü Interlagos’un üzerine çöktüğünde, griddeki yirmi pilot sadece birbirleriyle değil, tropik bir fırtınanın saatiyle yarışıyordu. Felipe Massa için matematik basitti: Kendi evinde, binlerce Brezilyalının uğultusu altında yarışı kazanacak ve Lewis Hamilton’ın altıncı veya daha geride bitirmesini bekleyecekti. Hamilton içinse beşincilik yetiyordu. Spor tarihi bu yarışı son virajda el değiştiren bir piyango gibi hatırlar. Oysa şampiyonluk o pazar günü kaybedilmedi; sezon boyunca Singapur pit yolunda kopan bir yakıt hortumunun ve Budapeşte’de bitime üç tur kala patlayan bir motorun sessiz faizleriyle tüketildi.'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/landscape/02.png',
        caption: 'Fırtına öncesi Interlagos start düzlüğü.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Massa, kariyerinin en kusursuz pazar gününü sürüyordu. Islak asfalttan yükselen buharın içinde pole pozisyonundan kalktı, ilk viraj karmaşasından sıyrıldı ve 71 tur boyunca arkasına tek bir şüphe bile bırakmadı. Ferrari F2008 yağmurun altında bir cerrah hassasiyetiyle aktı. Yarışın bitimine altı tur kala başlayan sağanak yağmur, strateji masalarını bir kumarhaneye çevirdi. McLaren Hamilton’ı pite çağırıp geçiş lastiklerini takarken, Toyota garajı Timo Glock’u kuru zemin lastikleriyle pistte bıraktı. Bu bir sabotaj veya mucize arayışı değildi; arka sıralardaki bir takımın puan barajına tutunabilmek için aldığı rasyonel bir risk kararıydı.'
      },
      {
        type: 'heading',
        text: 'Otuz Dokuz Saniyenin Sonu'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/portrait/01.png',
        caption: 'Ferrari F2008 su perdesini yarıyor.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'O Glock mu? Glock yavaş mı gidiyor?',
        author: 'Martin Brundle'
      },
      {
        type: 'paragraph',
        text: 'Massa damalı bayrağın altından birinci geçti. Tribünler patladı. Ferrari pit duvarında kollar havaya kalktı. Tam otuz dokuz saniye boyunca Felipe Massa, Formula 1 Dünya Şampiyonuydu. Kronometrenin ibresi akarken, pistin en uzak noktasında, son viraj olan Junção yokuşunda Glock’un tutunması sıfıra inmişti. Kuru zemin hamurları su birikintilerinin üzerinde bir su kayağına döndü. Hamilton içeriden süzüldü, beşinciliği aldı ve çizgiyi geçti. Ferrari garajındaki sevinç çığlığı bir salise içinde dondu; mekanikerlerin yüzündeki zafer ifadesi yerini boş bir sessizliğe bıraktı. Bir şampiyonluk, bir nefes alma süresinde buharlaşmıştı.'
      },
      {
        type: 'heading',
        text: 'Podyumdaki Asalet'
      },
      {
        type: 'paragraph',
        text: 'Fakat bu hikâyenin zirvesi son viraj değil, podyum basamağıdır. Gözlerinde biriken yaşları gizlemeyen, tulumunun göğsündeki Ferrari şahlanan atını yumruklayarak kendi halkını selamlayan Massa, yenilgiyi taşırken gösterdiği vakarla o gün Hamilton’dan daha büyük bir anıt dikti. Ne Glock’u suçladı, ne talihe küfretti. Kupa İngiltere’ye gitti; ancak o otuz dokuz saniyenin öğrettiği asalet, Formula 1 tarihinin hafızasına silinmez bir harfle kazındı.'
      },
      {
        type: 'image',
        src: '/stories/massa-2008/full/01.png',
        caption: 'Massa podyumda, yağmur ve gözyaşları içinde göğsünü yumrukluyor.',
        layout: 'full'
      }
    ]
  },

  // 04. schumacher-ferrari
  {
    slug: 'schumacher-ferrari',
    title: 'The Red Dawn',
    titleTr: 'Maranello Çanları',
    subtitle: 'Todt, Brawn, and a factory finally run like a clock—not one driver alone—turning Maranello into an empire of process.',
    subtitleTr: 'Ferrari’nin yirmi bir yıllık şampiyonluk hasretinin bitişi tek bir dâhinin karizmatik kurtarıcılığı değil; duygusal bir İtalyan klanının, anglo-sakson metodolojisi ve mikronluk bir saat disipliniyle yeniden inşa edilmesidir.',
    year: '2000',
    category: 'Dynasty',
    heroImage: '/stories/schumacher-ferrari/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'Maranello Belfry'
      },
      {
        type: 'paragraph',
        text: 'The bells of the San Biagio church in Maranello had an ancient understanding with the racing factory down the road: they rang whenever a Ferrari won a Grand Prix. Yet following Jody Scheckter’s title in 1979, the belfry fell silent regarding a Drivers\' World Championship for twenty-one unbroken years. Romantic lore loves to cast Michael Schumacher as a solitary titan arriving in 1996 to resurrect a broken empire on sheer willpower. The narrative is cinematic, but it fundamentally insults the craft of engineering. Schumacher was not an isolated savior; he was the escapement wheel in an Anglo-French mechanism engineered by Jean Todt, Ross Brawn, and Rory Byrne.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/landscape/02.png',
        caption: 'Ferrari assembly line and telemetry.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Ferrari\'s failure across the 1980s and 1990s was never a lack of passion; it was passion devouring procedural rigor. When Schumacher arrived, the Scuderia operated like a Renaissance court—volatile, paranoid, and technically undisciplined. Todt placed an iron shield between the Italian press and the garage. Brawn introduced a culture of ruthless operational arithmetic. Schumacher ran nocturnal test marathons under floodlights at Fiorano, logging thousands of kilometers until the tolerances between driver and telemetry were microscopic. The humiliation of Jerez in 1997 and the snapped tibia at Stowe in 1999 did not dismantle the project; they merely tightened the gear train.'
      },
      {
        type: 'heading',
        text: 'The Clock Strikes at Suzuka'
      },
      {
        type: 'paragraph',
        text: 'The reckoning crystallized on October 8, 2000, beneath a brooding sky at Suzuka. The Grand Prix was a sprint race measured across pit-stop cycles between Schumacher and Mika Häkkinen. As light rain began to grease the asphalt, Brawn keyed the radio: "Michael, it’s down to you now. Push." Over the next three out-laps, Schumacher drove with metronomic violence, carving tenths from the wet curbs. The second pit stop was executed in under seven seconds. When the Ferrari slipped out of the pit exit centimeters ahead of the McLaren, the deadlock was broken.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/portrait/01.png',
        caption: 'Schumacher era, relentless scarlet dominance.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'I’ve always believed that you should never, ever give up and you should always keep fighting even when there’s only the slightest chance.',
        author: 'Michael Schumacher'
      },
      {
        type: 'paragraph',
        text: 'The raw sobs over the radio after the finish line did not sound like the myth of the stoic German champion. When the bells of San Biagio finally tolled that Sunday evening, Maranello filled the streets in tears. It was not the coronation of a lone hero; it was the final, triumphant ticking of a clockwork machine that had taken five relentless years to assemble.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/full/01.png',
        caption: 'The Tifosi flood the main straight at Monza.',
        layout: 'full'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'San Biagio’nun Sessizliği'
      },
      {
        type: 'paragraph',
        text: 'Maranello’daki San Biagio kilisesinin çanları, Formula 1 yarışını bir Ferrari kazandığı her pazar günü çalardı. Ancak 1979’da Jody Scheckter’in kazandığı şampiyonluktan sonra, o çanlar bir dünya şampiyonluğu için tam yirmi bir yıl boyunca sustu. Popüler spor hafızası, Michael Schumacher’in 1996’da İtalya’ya gelip enkaz halindeki bir fabrikayı tek başına ayağa kaldırdığını anlatmayı sever. Bu anlatı gösterişlidir ama mühendislik gerçeğini ıskalar. Schumacher bir kurtarıcı değil; Jean Todt, Ross Brawn ve Rory Byrne’ın kurduğu devasa mekanik saatin akrebiydi.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/landscape/02.png',
        caption: 'Ferrari montaj hattı ve telemetri disiplini.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Ferrari’nin sorunu yeteneksizlik değil; tutkunun rasyonel planlamayı boğduğu feodal bir kaos ortamıydı. Schumacher Maranello’ya adım attığında, otomobilin motor bloğu ile şasisi arasındaki toleranslar bile İngiliz rakiplerinin fersah fersah gerisindeydi. Yapılan ilk iş, fabrikanın kapılarını basına kapatıp Fiorano test pistine gece projektörleri yerleştirmek oldu. Schumacher günde yüz elli tur atıyor, debriyaj pedallarının direncini gramla ölçüyor, mekanikerlerle sabahın dördünde makarna yiyordu. Jean Todt yönetim kurulunun siyasi baskısını göğsünde yumuşatırken, Ross Brawn pit duvarını bir satranç tahtasına çevirdi. 1997 Jerez’deki diskalifiye ve 1999 Silverstone’da kırılan kaval kemiği bu dişlileri durduramadı; aksine toleransları daha da sıkılaştırdı.'
      },
      {
        type: 'heading',
        text: 'Suzuka’da Çalışan Çarklar'
      },
      {
        type: 'paragraph',
        text: 'Kader anı 8 Ekim 2000’de, Suzuka’nın nemli asfaltında geldi. Yarış Schumacher ile Mika Häkkinen arasında, pit stop aralıklarında geçen bir düelloydu. Yağmur hafifçe çiselerken Brawn telsize uzandı: "Michael, önün boş, elindeki her şeyi ver." Sonraki üç turda Ferrari telemetrisi, her virajda limitin sınırında dönen bir makinenin ritmik nabzını kaydetti. Pit stop üç saniye sürdü. Schumacher pit çıkışında Häkkinen’in önüne burnunu uzattığında, yirmi bir yıllık pas çözülmüştü.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/portrait/01.png',
        caption: 'Schumacher, kırmızı tulumuyla kokpitte.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'En küçük bir ihtimal bile olsa asla pes etmemeniz ve savaşmaya devam etmeniz gerektiğine her zaman inandım.',
        author: 'Michael Schumacher'
      },
      {
        type: 'paragraph',
        text: 'Damalı bayrak geçtiğinde telsizden duyulan hıçkırık, Alman bir sporcunun soğukluğuna ait değildi. O gün San Biagio kilisesinin çanları nihayet çaldığında, kasaba halkı meydana döküldü. Kazanılan zafer bir adamın mucizesi değildi; dağılmış yüzlerce çarkın, tek bir saniyenin binde biri için aynı anda dönmeyi öğrenmesiydi.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-ferrari/full/01.png',
        caption: 'Tifosi, Monza düzlüğünü kırmızı bir denize çeviriyor.',
        layout: 'full'
      }
    ]
  },

  // 05. hakkinen-schumacher
  {
    slug: 'hakkinen-schumacher',
    title: 'The Zonta Overtake',
    titleTr: 'İğne Deliği',
    subtitle: 'Spa-Francorchamps. 200mph. A backmarker in the middle. Two of the greatest drivers in history made a choice.',
    subtitleTr: 'Spa 2000’deki efsanevi geçiş bir çılgınlık ya da gözü karalık değil; 300 km/s süratte iki büyük ustanın aynı milisaniyede yaptığı geometrik bir satranç hamlesidir.',
    year: '2000',
    category: 'Combat',
    heroImage: '/stories/hakkinen-schumacher/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Precision of Kemmel'
      },
      {
        type: 'paragraph',
        text: 'When Ardennes moisture settles into the tarmac of Spa-Francorchamps, the margin for error narrows to the millimeter thickness of a skid block. On August 27, 2000, Michael Schumacher and Mika Häkkinen contested a duel devoid of cheap theatrics, driven solely by supreme spatial discipline. Schumacher led in the scarlet Ferrari, sending plumes of spray and titanium sparks into the pine forest as he bottomed out through Eau Rouge. Häkkinen stalked him in the silver McLaren, reading the line like scripture.'
      },
      {
        type: 'image',
        src: '/stories/hakkinen-schumacher/landscape/02.png',
        caption: 'Häkkinen entering Eau Rouge flat out.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Folklore remembers the pass on Lap 40 as a stroke of reckless, heart-in-the-mouth bravado. In truth, it was a cold, calculated answer to an intimidation tactic deployed just sixty seconds earlier. On Lap 39, Häkkinen had drafted the Ferrari down the Kemmel Straight and feinted right. Schumacher reacted with predatory instinct, chopping aggressively across at 190 mph to squeeze the McLaren toward the damp grass. It was ruthless, pushing the outer frontier of racing etiquette, but entirely logical for a driver defending a world title. Häkkinen lifted. The clash was averted, but the territorial line was drawn.'
      },
      {
        type: 'heading',
        text: 'Splitting the Atom at 200 mph'
      },
      {
        type: 'paragraph',
        text: 'One lap later, the choreography reset. Häkkinen took Eau Rouge flat out, the MP4/15 bottoming violently before launching onto the climb. At the crest of Kemmel, an obstacle appeared: the white BAR-Honda of Ricardo Zonta, cruising squarely down the center of the track. Schumacher sized up the lapped car, pulled left into the conventional dry tow, and moved to close the door. He assumed the chessboard was locked. Häkkinen saw only the eye of a needle.'
      },
      {
        type: 'paragraph',
        text: 'To Zonta’s right lay a strip of damp, marbles-strewn asphalt that no sane racing driver would touch at 200 mph. Lifting meant defeat; committing meant gambling with physics. Without flinching, Häkkinen flicked the McLaren to the dirty inside line, sandwiching the bewildered Zonta between them, and arrived at the braking zone of Les Combes with clean track ahead. Zonta later admitted he simply held his breath, paralyzed as two titans cleaved past him on either shoulder.'
      },
      {
        type: 'image',
        src: '/stories/hakkinen-schumacher/portrait/01.png',
        caption: 'Schumacher, the immovable adversary.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'In parc fermé, Häkkinen cornered Schumacher, gesturing calmly with an outstretched finger, quietly debriefing the defense from the lap before. Schumacher listened, nod tight, eyes guarded. There was no shouting, no melodrama. Just two master surgeons acknowledging the precise moment where geometry overrode fear.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Ardenler’de Açılan Hesap'
      },
      {
        type: 'paragraph',
        text: 'Ardenler ormanının nemi Spa-Francorchamps pistinin asfaltına sindiğinde, hata payı otomobilin tabanındaki ahşap plakanın kalınlığı kadar azalır. 27 Ağustos 2000 Pazar günü koşulan Belçika Grand Prix\'sinde Michael Schumacher ve Mika Häkkinen, Formula 1 tarihinin en temiz ama en acımasız psikolojik savaşlarından birini veriyordu. Schumacher kırmızı Ferrari’siyle öndeydi; Eau Rouge virajını her dönüşte tabanı yere vuran kıvılcımlarla aydınlatıyordu. Häkkinen ise gümüş McLaren’ıyla avını adım adım takip ediyordu.'
      },
      {
        type: 'image',
        src: '/stories/hakkinen-schumacher/landscape/02.png',
        caption: 'Häkkinen Eau Rouge tırmanışında odaklanmış halde.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Genel kabul, bu yarışın kaderinin 40. turda Kemmel düzlüğündeki çılgınca bir cesaret patlamasıyla çözüldüğünü varsayar. Oysa o geçiş bir cesaret gösterisi değil, bir turun öncesinde yaşanan bir hayal kırıklığının soğukkanlı intikamıydı. 39. turun sonunda Häkkinen, aynı düzlükte Schumacher’in sağından geçmeyi denemişti. Alman pilot hiç tereddüt etmedi; 310 km/s hızla giderken direksiyonunu sağa kırdı ve Fin pilotu çimlerin sınırına, ıslak kerblere doğru itti. Bu sportmenlik sınırlarını zorlayan ama şampiyonluk yarışında taviz vermeyen rasyonel bir savunmaydı. Häkkinen ayağını gazdan çekmek zorunda kaldı. Kaza olmamıştı ama mesaj netti: Buradan geçemezsin.'
      },
      {
        type: 'heading',
        text: 'Zonta Sandviçi'
      },
      {
        type: 'paragraph',
        text: 'Bir tur sonra, aynı virajlar yeniden dönüldü. Eau Rouge tam gaz geçildi, tekerlekler havaya kalktı ve Kemmel düzlüğüne çıkıldı. Bu kez ufukta beyaz bir engel belirdi: Tur yiyen BAR-Honda pilotu Ricardo Zonta, yolun tam ortasındaydı. Schumacher Zonta’yı gördü, hava koridorundan çıktı ve alışılmış olanı yaptı: Sol taraftaki kuru yarış çizgisine daldı. Kapıyı kapattığını düşünüyordu. Häkkinen’in önünde sadece bir iğne deliği kalmıştı.'
      },
      {
        type: 'paragraph',
        text: 'Zonta’nın sağındaki ıslak, pis ve tekinsiz asfalt. Bir saliselik tereddüt, iki aracın birden bariyerlere saplanması demekti. Häkkinen tereddüt etmedi. Direksiyonu sağa yatırdı, Zonta’nın otomobilini sağdan biçti ve Les Combes virajının frenleme noktasına Schumacher’in yarım boy önünde girdi. Zonta aynasında bir anlığına kırmızı bir gölge, diğer anında gümüş bir şimşek görmüş ve donup kalmıştı.'
      },
      {
        type: 'image',
        src: '/stories/hakkinen-schumacher/portrait/01.png',
        caption: 'Schumacher, yarış sonrası sessizliği.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Yarıştan sonra kapalı parkta iki adam yan yana durdu. Häkkinen parmağını kaldırıp Schumacher’e bir önceki turun hesabını sakin, fısıltı gibi bir sesle sordu. Schumacher sadece başını salladı. O gün Spa’da konuşulan şey motor gücü değildi. Üç yüz kilometre hızla giden iki cerrahın, aynı neşter darbesine verdikleri kusursuz yanıttı.'
      }
    ]
  },

  // 06. hamilton-silverstone
  {
    slug: 'hamilton-silverstone',
    title: 'Copse Corner',
    titleTr: 'Kırılma Noktası',
    subtitle: 'Copse, 2021. Mercedes and Red Bull, two championship cars, one corner—and a collision the factories would argue about for months.',
    subtitleTr: '2021 Silverstone’daki temas bir sabotaj veya acemilik değil; modern Formula 1’in iki alfa karakterinin birbirine yol vermeyi reddettiği, aerodinamik sınır ile fiziksel inatlaşmanın kaçınılmaz çarpışmasıdır.',
    year: '2021',
    category: 'Modern Era',
    heroImage: '/stories/hamilton-silverstone/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Territorial Battle'
      },
      {
        type: 'paragraph',
        text: 'On July 18, 2021, the summer heat over Northamptonshire was thick, amplified by the suffocating roar of 140,000 partisan spectators lining Silverstone’s banking. Nine rounds into the campaign, Max Verstappen and Red Bull had seized command of the championship, dismantling the calm predictability of the hybrid era. For Lewis Hamilton, his home Grand Prix was not merely a fixture on the calendar; it was the Alamo of Mercedes\' seven-year supremacy. Tabloid culture would subsequently reduce the afternoon to moral extremes—an act of dirty driving on one side, an act of destiny on the other. In truth, what occurred at Copse was neither: it was the kinetic collision of two identical magnetic poles forced into the same space.'
      },
      {
        type: 'image',
        src: '/stories/hamilton-silverstone/full/01.png',
        caption: 'Hamilton’s victory lap before 140,000 home spectators, Silverstone 2021.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'The opening lap was an unprecedented exhibition of psychological trench warfare. From the lights out, neither man yielded an inch of tarmac. They banged wheels through Abbey, drafted down the Wellington Straight, and leaned on each other’s sidepods into Brooklands. Formula 1 drivers operate on unspoken territorial codes; yielding the corner on Lap 1 writes a psychic surrender that lingers for the remainder of a title fight. Verstappen, armed with ruthless momentum, drove with the arrogance of an heir apparent. Hamilton, bearing the weight of a decade’s legacy, knew that backing down in front of his home crowd meant forfeiting the title in July.'
      },
      {
        type: 'heading',
        text: 'The 51G Reckoning'
      },
      {
        type: 'paragraph',
        text: 'Exiting Woodcote at 180 mph, with the cars drawn toward Copse like falling meteors, the ledger demanded closure. Copse is a ferocious, blind right-hander taken in sixth gear with a mere feather of the throttle. Hamilton lunged down the inside, his front wheel drawing alongside Verstappen’s sidepod, though not fully pinned to the apex curb. Verstappen turned in from the outside, giving racing room by the letter of the law, but aggressively claiming the corner’s trajectory. The aerodynamic disturbance between the two floors created a localized vacuum. Hamilton’s front-left rim touched the Red Bull’s right-rear tire.'
      },
      {
        type: 'paragraph',
        text: 'The impact was sharp, followed by the terrifying sight of a car turned projectile. Verstappen struck the tire wall at 51G—an impact violent enough to knock the wind and clarity from a human body. The red flag fell. While Verstappen was transported to hospital for cautionary checks, Hamilton served a ten-second penalty, dismantled the deficit through metronomic sector times, hunted down Charles Leclerc’s Ferrari with two laps remaining, and took the flag.'
      },
      {
        type: 'quote',
        text: 'This is not tennis. This is life and death.',
        author: 'Toto Wolff'
      },
      {
        type: 'paragraph',
        text: 'The jubilation on the podium and the quiet rage inside the hospital ward were two halves of the same dark coin. It was not sabotage, nor was it recklessness. It was the unavoidable casualty of two alpha predators arriving at the same apex, neither possessing the vocabulary to brake first.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Baskı ve Hakimiyet Savaşı'
      },
      {
        type: 'paragraph',
        text: '18 Temmuz 2021 Pazar günü Silverstone’da hava sıcaktı; tribünleri dolduran 140 bin İngiliz taraftarın yarattığı gürültü ise pistin üzerindeki havayı daha da ağırlaştırıyordu. Sezonun ilk dokuz yarışı geride kalmış, Red Bull ve Max Verstappen şampiyona liderliğini ele geçirmişti. Lewis Hamilton için kendi evinde koşulan bu yarış, bir podyum mücadelesinden öte, yedi yıllık Mercedes hegemonyasının dağılmasını durdurma savaşıydı. Medya olayı sonradan "bir cinayet teşebbüsü" ile "vatansever bir zafer" arasına sıkıştıracaktı. Oysa Copse virajında yaşananlar ne kahramanlıktı ne de suç; iki mıknatısın aynı kutbunun zorla birbirine yaklaştırılmasıydı.'
      },
      {
        type: 'image',
        src: '/stories/hamilton-silverstone/full/01.png',
        caption: 'Hamilton Silverstone tribünleri önünde zafer turunda, 2021.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Yarışın ilk turu, modern motor sporlarının gördüğü en şiddetli psikolojik güç gösterisiydi. İlk virajdan itibaren Hamilton ve Verstappen birbirlerine santimetrelerle yaklaştı. Düzlüklerde tekerlek tekerleğe gittiler, Brooklands’de yan yana fren yaptılar, Luffield’da bordürleri parçalarcasına birbirlerini ittiler. Kimse ayağını gazdan çekmiyordu. Çünkü Formula 1’de bir kez geri adım atarsanız, o sezon bir daha asla öne geçemezdiniz. Verstappen gençti, tavizsizdi ve psikolojik üstünlüğü elinde tutuyordu. Hamilton ise kıdemliydi; kendi evinde teslim olmanın şampiyonayı zihnen bitireceğini biliyordu.'
      },
      {
        type: 'heading',
        text: 'Copse’ta 51G'
      },
      {
        type: 'paragraph',
        text: 'Woodcote virajından 290 km/s hızla çıkıp Copse’a doğru yöneldiklerinde kader mühürlendi. Copse, altıncı viteste dönülen, frenin sadece bir anlık hafif dokunuşla yapıldığı kör ve hızlı bir sağ virajdır. Hamilton içeriden hamle yaptı; ön kanadı Verstappen’in arka tekerleğinin yanındaydı ama apeksi tam yakalayamamıştı. Verstappen dışarıdan virajı döndü, rakibine yer bıraktığını düşünüyordu ancak virajı ona hediye etmeye hiç niyeti yoktu. İki otomobilin aerodinamik tabanları birbirini itti. Hamilton’ın sol ön tekerleği, Red Bull’un sağ arka jantına dokundu.'
      },
      {
        type: 'paragraph',
        text: 'Temasın sesi motor kükremesini bastırdı. Verstappen’in otomobili 51G’lik bir kuvvetle lastik bariyerlere gömüldü. Bu, bir insanın bilincini kapatacak kadar sert bir darbeydi. Kırmızı bayrak çıktı. Verstappen hastaneye götürülürken, Hamilton on saniyelik cezasını çekti, yarışın kalanında her turunu bir sıralama turu gibi sürdü ve bitime iki tur kala Ferrari’yi geçerek kazandı.'
      },
      {
        type: 'quote',
        text: 'Bu tenis değil. Bu ölüm kalım meselesi.',
        author: 'Toto Wolff'
      },
      {
        type: 'paragraph',
        text: 'Podyumda sallanan İngiliz bayrağı ile hastane odasındaki televizyon ekranı arasında derin bir uçurum vardı. O gün Silverstone’da olan şey, kasti bir darbe değildi. Şampiyonluk için yarışan iki büyük yırtıcının, aynı dar patikada yan yana yürümeyi reddetmesinin kaçınılmaz bedeliydi.'
      }
    ]
  },

  // 07. button-canada
  {
    slug: 'button-canada',
    title: 'The Longest Race',
    titleTr: 'Montreal Seli',
    subtitle: 'Last place. Punctures. Collisions. Rain delays. And yet, Jenson Button refused to lose.',
    subtitleTr: '2011 Kanada, bir pilotun şans eseri kazandığı bir kaos yarışı değil; değişken koşullarda ritmini hiç kaybetmeyen bir ustanın, baskı altındaki mükemmeliyetçiliği son turda çökertmesidir.',
    year: '2011',
    category: 'Miracle',
    heroImage: '/stories/button-canada/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'Weather System and Waiting Rooms'
      },
      {
        type: 'paragraph',
        text: 'On June 12, 2011, the Île Notre-Dame ceased to be an automobile circuit and became a drowned marshland. Clocked at four hours, four minutes, and thirty-nine seconds, the 2011 Canadian Grand Prix stands as the longest race in Formula 1 history—less a sporting event than an endurance trial against a relentless deluge. When Jenson Button crossed the finish line to take victory, his ledger showed six pit visits, a drive-through penalty, an intra-team collision with Lewis Hamilton that eliminated his teammate, a clash with Fernando Alonso, and a puncture that dropped him dead last to twenty-first position.'
      },
      {
        type: 'image',
        src: '/stories/button-canada/landscape/02.png',
        caption: 'Circuit Gilles Villeneuve under torrential rain.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'To dismiss this triumph as a fluke of safety-car chaos is to misunderstand the sublime craft of wet-weather driving. Button never possessed the ferocious, raw qualifying violence of Senna or Hamilton. His gift belonged to the fingertips—an uncanny, tactile sensitivity on damp, greasy asphalt where grip fluctuates from corner to corner. While a two-hour red flag turned the garages into waiting rooms, McLaren’s strategists wrestled with radar screens. When racing resumed, Button was at the tail of the field. Yet while others fought the elements with brute steering input, Button treated the MP4-26 like an instrument, feeling the drying line before the computers registered it. Lap by lap, he picked off the field with clinical patience.'
      },
      {
        type: 'heading',
        text: 'The Final Kilometer'
      },
      {
        type: 'paragraph',
        text: 'The climax was withheld until the final three kilometers. Sebastian Vettel had orchestrated an immaculate season in the Red Bull, leading all sixty-nine preceding laps with imperious authority. But as Button closed the deficit at nearly two seconds a lap, the silence of Vettel’s mirrors grew deafening. Entering Turn 6 on the seventieth and final lap, the German drifted a tire onto the damp fringe of the curb. It was a microscopic error—a momentary snap of oversteer—but enough to break the car’s momentum.'
      },
      {
        type: 'image',
        src: '/stories/button-canada/portrait/01.png',
        caption: 'Button, soaked and relentless on the podium.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Button did not hesitate. He carved underneath and vanished into the spray toward the checkered flag. The roar from the grandstands as the drenched McLaren crossed the line carried genuine awe. Montreal that afternoon offered an enduring lesson: you cannot conquer a storm with anger. The driver who survives the flood is not the one who assaults the water, but the one who learns to breathe within it.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Dört Saatlik Tufan'
      },
      {
        type: 'paragraph',
        text: '12 Haziran 2011 Pazar günü Montreal’deki Notre Dame Adası, bir yarış pistinden çok gökyüzünün yere indiği bir bataklığı andırıyordu. Dört saat dört dakikalık süresiyle Formula 1 tarihinin en uzun Grand Prix’si olarak kayıtlara geçen bu mücadele, bir dayanıklılık testinden öte, suyun ve asfaltın dilini anlama sınavıydı. Jenson Button o gün damalı bayrağın altından birinci geçtiğinde arkasında altı pit ziyareti, bir pitten geçme cezası, takım arkadaşı Lewis Hamilton ile çarpışma, Fernando Alonso ile temas ve yarışın bir bölümünde sonunculuğa (21. sıra) kadar gerileyiş vardı.'
      },
      {
        type: 'image',
        src: '/stories/button-canada/landscape/02.png',
        caption: 'Gilles Villeneuve Pisti sel suları altında.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Böylesi bir zaferi "şans" veya "kaosun hediyesi" olarak nitelendirmek, Button’ın ıslak zemin zanaatına haksızlık etmektir. Button asla gridin en saf, en patlayıcı hızına sahip pilotu olmadı. Ancak zemin ne kuru ne de tam ıslakken; yani lastiklerin tutunma ile su kayağı arasında gidip geldiği o gri alanda, direksiyonu parmak uçlarıyla tutan bir piyanist gibiydi. McLaren pit duvarı sağanak nedeniyle yarış iki saat durdurulduğunda strateji tablolarını çöpe atmıştı. Yeniden start verildiğinde Button en arkadaydı ama panik yapmadı. Lastiklerini soğutmadan, nehir gibi akan pist yüzeyinde kuru çizgileri ilk o hissetti. Araçları tek tek, bir balıkçının sabrıyla ayıkladı.'
      },
      {
        type: 'heading',
        text: 'Son Turun Çatlağı'
      },
      {
        type: 'paragraph',
        text: 'Yarışın düğümü son tura kadar çözülmedi. Lider Sebastian Vettel, Red Bull’uyla kusursuz bir sezon geçiriyordu. O pazar da baştan sona yarışı domine etmişti. Ancak Button aynasında tur başına iki saniye eriyen bir farkla belirdiğinde, genç şampiyonun zihnindeki kusursuz ritim bozuldu. 70. turda, altıncı viraja girerken Vettel otomobilinin arkasını hafifçe ıslak çizgiye kaptırdı. Küçük bir kontra, çimlere taşan bir tekerlek ve otomobilin dengesi bir anlığına dağıldı.'
      },
      {
        type: 'image',
        src: '/stories/button-canada/portrait/01.png',
        caption: 'Button, sırılsıklam ve zafer sarhoşu.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Button fren yapmadı. İçeriden aktı ve damalı bayrağa doğru süzüldü. Damalı bayrak sallandığında padoğun hissettiği şey şaşkınlık değil, bir ferahlamaydı. Çünkü Montreal o gün kanıtlamıştı ki; ne kadar hızlı olursanız olun, fırtınayla kavga edemezsiniz. Fırtınada hayatta kalanlar, suyun akışına karşı kürek çekenler değil, onun ritmine saygı duyanlardır.'
      }
    ]
  },

  // 08. fangio-nurburgring
  {
    slug: 'fangio-nurburgring',
    title: 'The Green Hell',
    titleTr: 'Yeşil Cehennemin Heykeltıraşı',
    subtitle: 'Juan Manuel Fangio was 46 years old. He was racing against boys. He taught them a lesson they would never forget.',
    subtitleTr: '1957 Nürburgring, yaşlanan bir ustanın gençliğe karşı kazandığı nostaljik bir zafer değil; aklın, mekanik sınırların ve korkunun ötesine geçen bir sürüşün spora bıraktığı ulaşılamaz son standarttır.',
    year: '1957',
    category: 'Myth',
    heroImage: '/stories/fangio-nurburgring/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Actuarial Gamble in the Eifel'
      },
      {
        type: 'paragraph',
        text: 'On August 4, 1957, the twenty-two-kilometer labyrinth of the Nürburgring gathered to watch a masterclass by a forty-six-year-old Juan Manuel Fangio. Ranged against him were Ferrari’s youthful British charges, Peter Collins and Mike Hawthorn—men half his age driving with unburdened ferocity. Fangio had plotted his strategy with artisan precision: start on half-tanks in the lightweight Maserati 250F, build an unassailable cushion, execute a mid-race fuel stop, and control the closing stages. History books lazily label what followed as a miraculous comeback. In truth, it was the methodical chiseling of a sporting monument by a craftsman willing to risk his life on every stroke.'
      },
      {
        type: 'image',
        src: '/stories/fangio-nurburgring/landscape/02.png',
        caption: 'Maserati 250F balancing on the razor edge of grip.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'The pivot of destiny came down to a stripped wheel nut in the Maserati pit. When Fangio peeled in on Lap 12, he held a comfortable thirty-second lead. But as mechanics fumbled, dropped the rear lug into the grass, and struggled with the fuel rig, seconds bled away into catastrophe. By the time the Argentine was push-started back onto the circuit, Collins and Hawthorn were disappearing into the Eifel mist, forty-eight seconds to the good. With ten laps remaining, conventional arithmetic decreed the race lost.'
      },
      {
        type: 'heading',
        text: 'Nine Lap Records in the Mist'
      },
      {
        type: 'paragraph',
        text: 'Fangio tightened his goggles, eased into the throttle, and descended into the forest. What transpired across those final ten laps remains unmatched in the annals of motorsport. Fangio began driving not against the Ferraris, but against the geometry of the track itself. He took blind bends in a gear higher than thought possible, dropping wheels into the drainage ditches to pivot the 250F on its axis, and pitching the machine through the Karussell with brutal precision. He broke the lap record nine times, ultimately lowering his own pole position benchmark by an astonishing eight seconds. It was not recklessness; it was total, terrifying clarity.'
      },
      {
        type: 'image',
        src: '/stories/fangio-nurburgring/portrait/01.png',
        caption: 'Juan Manuel Fangio after the epic chase.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'I have never driven that fast before in my life and I don’t think I will ever be able to do it again.',
        author: 'Juan Manuel Fangio'
      },
      {
        type: 'paragraph',
        text: 'With two laps remaining, he hunted down the scarlet Ferraris like a phantom. He dispatched Collins on the dirt shoulder through a high-speed sweep, then slipped underneath Hawthorn with wheels skimming the hedges. When he took the checkered flag, his face was blackened with grease, brake dust, and sweat, his palms blistering through the string-backed gloves. He had clinched his fifth World Championship, yet in the paddock his reflection was devoid of bravado. Fangio had carved his masterpiece from the basalt rock of the Green Hell. The sculpture remains untouched.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Eifel’de Açılan Fark'
      },
      {
        type: 'paragraph',
        text: '4 Ağustos 1957 günü Nürburgring’in 22 kilometrelik vahşi ormanı, 46 yaşındaki Juan Manuel Fangio’yu izlemek için toplanmıştı. Karşısında Ferrari’nin iki genç İngiliz aslanı vardı: Peter Collins ve Mike Hawthorn. Fangio onların babası yaşındaydı. Maserati 250F’i hafif bir yakıt yüküyle başlatıp arayı açmayı, ardından pitte benzin alıp yarışı kontrol etmeyi planlamıştı. Spor tarihi bu yarışı genellikle Fangio’nun "inanılmaz geri dönüşü" diye adlandırır. Oysa o öğleden sonra yaşanan şey bir geri dönüş değil; bir taş ustasının kendi şaheserini yaratırken çekici mermere değil, kendi hayatına vurmasıydı.'
      },
      {
        type: 'image',
        src: '/stories/fangio-nurburgring/landscape/02.png',
        caption: 'Maserati 250F Eifel virajlarında süzülüyor.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Yarışın dönüm noktası, Maserati garajındaki o meşum pit stop oldu. 12. turda Fangio pite girdiğinde Ferrari’lerin yarım dakika önündeydi. Ancak mekanikerler arka tekerleğin bijonunu yere düşürdü, yakıt hortumu takıldı ve saniyeler bir kabus gibi aktı. Arjantinli kokpitten çıktığında Collins ve Hawthorn’un tam kırk sekiz saniye gerisindeydi. Geriye sadece on tur kalmıştı ve Nürburgring’de tur başına beş saniye kapatmak, mantık kurallarına göre imkânsızdı.'
      },
      {
        type: 'heading',
        text: 'Art Arda Dokuz Pist Rekoru'
      },
      {
        type: 'paragraph',
        text: 'Fangio kaskının kayışını sıktı, debriyaja bastı ve ormana daldı. Sonraki on tur boyunca yaşananlar, yarışçılık sınırlarının fizikten metafiziğe geçtiği tek andır. Fangio her virajı bir öncekinden daha hızlı döndü. Normalde vites küçültülen virajları tam gaz geçti, otomobili hendeklerin içindeki çakıllara fırlattı, Karussell virajının beton oluklarına Maserati’yi adeta bir kama gibi vurdu. Kendi kırdığı pist rekorunu art arda dokuz kez geliştirdi; en hızlı turunda rekoru tam sekiz saniye birden aşağı çekti. Bu bir hırs patlaması değildi; kusursuz bir konsantrasyonun yarattığı trans haliydi.'
      },
      {
        type: 'image',
        src: '/stories/fangio-nurburgring/portrait/01.png',
        caption: 'Fangio, zafer sonrası yüzündeki yağ ve terle.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'Hayatımda hiçbir zaman bu kadar hızlı sürmedim. Ve bir daha asla böyle süremem.',
        author: 'Juan Manuel Fangio'
      },
      {
        type: 'paragraph',
        text: 'Bitime iki tur kala iki kırmızı Ferrari’nin arasına girdi. Önce Collins’i viraj içinde çimlerden geçerek ekarte etti; bir tur sonra da Hawthorn’u düzlükte arkasında bıraktı. Damalı bayrağı geçtiğinde yüzü egzoz isi ve kauçuk tozuyla kaplıydı. Otomobilden indi, elleri titriyordu. Kariyerinin beşinci ve son dünya şampiyonluğunu mühürlemişti ama o akşam gazetecilere söylediği söz zafer sarhoşluğu taşımıyordu. Fangio o gün Nürburgring’in sert kayalarını yontarak Formula 1’in zirvesine bir heykel dikti. O heykel orada öylece duruyor. Çünkü o günden sonra hiç kimse, bir yarış otomobilinde sınırın bu kadar derinine inip oradan sağ çıkamadı.'
      }
    ]
  },

  // 09. dijon-1979
  {
    slug: 'dijon-1979',
    title: 'The Duel',
    titleTr: 'Centilmenler Kılıcı',
    subtitle: 'Villeneuve vs Arnoux. Five laps of wheel-to-wheel chaos that defined respect.',
    subtitleTr: '1979 Dijon’daki efsanevi ikincilik savaşı bir sokak kavgası veya intihar girişimi değil; 200 km/s hızla kılıç tokuşturan iki ustanın birbirinin canına duyduğu mutlak güven ve zarafettir.',
    year: '1979',
    category: 'Combat',
    heroImage: '/stories/dijon-1979/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'Home Victory, Epic Battle Behind'
      },
      {
        type: 'paragraph',
        text: 'On July 1, 1979, as the checkered flag fell over Dijon-Prenois, Jean-Pierre Jabouille steered his Renault RS10 across the line to claim the first turbocharged victory in Formula 1 history. The national anthem blared and factory executives wept. Yet the hundred thousand spectators lining the hills of Burgundy, and the millions watching across the globe, barely noticed the victor. History had turned its gaze backward, transfixed by a savage, wheel-banging waltz for second place between Gilles Villeneuve’s Ferrari and René Arnoux’s Renault.'
      },
      {
        type: 'image',
        src: '/stories/dijon-1979/landscape/02.png',
        caption: 'Villeneuve sliding the Ferrari 312T4.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Motorsport lore lazily brands those final three laps as madness—a street brawl between two reckless daredevils. In truth, it was the highest order of professional trust ever recorded at 130 miles per hour. By Lap 77, both machines were mechanically exhausted. The tires on Villeneuve’s Ferrari 312T4 were shredded carcasses offering zero lateral grip, his brake pedal soft to the floorboard. Arnoux’s Renault suffered fuel-feed hiccups, the turbo coughing unevenly through the sweepers. They were two wounded gladiators arriving at the closing stages with broken blades. Villeneuve dived inside, locking all four wheels in a cloud of blue smoke. Arnoux held the outside, lunged back down the hill, and reclaimed the line. Wheels locked, rims clattered against rims, suspension arms flexed, yet neither yielded.'
      },
      {
        type: 'heading',
        text: 'Fencing at Two Hundred Kilometers per Hour'
      },
      {
        type: 'paragraph',
        text: 'There was zero malice in the violence. Neither man crowded the other onto the grass; at every entry and every exit, exactly one car’s width of tarmac was offered and honored. Foils parried and clashed, yet neither point sought blood. Exiting the final corner sideways, Villeneuve carried half a nosecone’s margin across the timing stripe, taking second by 0.24 seconds. On the deceleration lap, they pulled alongside and exchanged weary waves beneath open visors.'
      },
      {
        type: 'image',
        src: '/stories/dijon-1979/portrait/01.png',
        caption: 'René Arnoux in the cockpit of the Renault RS10.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'In the paddock, they embraced like brothers who had survived the same trench. Decades later, Arnoux would reflect with quiet reverence: "I could not have done that with any other man alive. Only Gilles." Dijon demonstrated that victory is not the exclusive domain of the trophy. In contesting an honorable defeat, two craftsmen etched their names into eternity.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Gölgede Kalan Turbo Zaferi'
      },
      {
        type: 'paragraph',
        text: '1 Temmuz 1979 Pazar günü Fransa’nın Dijon-Prenois pistinde damalı bayrak sallandığında, Jean-Pierre Jabouille Renault’suna ve Fransa’ya Formula 1 tarihindeki ilk turbo motorlu zaferini kazandırmıştı. Fabrika ağlıyor, Fransız marşı çalıyordu. Ancak o gün tribündeki yüz bin kişinin ve televizyon başındaki milyonların hafızasına kazınan şey kazanan otomobil olmadı. Bütün dünya, arkada ikincilik için birbirinin tekerleğine vuran Gilles Villeneuve’ün kırmızı Ferrari’si ile René Arnoux’nun sarı Renault’sunu izliyordu.'
      },
      {
        type: 'image',
        src: '/stories/dijon-1979/landscape/02.png',
        caption: 'Villeneuve, Ferrari 312T4 ile virajda kontrada.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Spor medyası bu üç turu sıklıkla bir "çılgınlık", kontrolünü kaybetmiş iki adamın "sokak kavgası" olarak yazar. Oysa o sahne vahşetin değil, spor tarihinin gördüğü en rafine centilmenlik mutabakatının eseriydi. Yarışın bitimine üç tur kala iki otomobilin de mekanik ömrü tükenmişti. Villeneuve’ün Ferrari 312T4’ünün lastikleri tamamen bitmiş, fren pedalları tabana yapışmıştı. Arnoux’nun Renault’sunda ise turbo basıncı tekleme yapıyor, yakıt sistemi hava çekiyordu. İki yaralı makine, Dijon’un inişli çıkışlı virajlarında yan yana geldi. 77. turda Villeneuve içeriden daldı, lastiklerini kilitledi ve dumanlar içinde virajı döndü. Bir sonraki virajda Arnoux dışarıdan kontrayla yanıt verdi. Tekerlekler birbirine çarptı; süspansiyon kolları esnedi ama hiçbiri ayağını gazdan çekmedi.'
      },
      {
        type: 'heading',
        text: 'Kılıçların Zarafeti'
      },
      {
        type: 'paragraph',
        text: 'O temaslarda en ufak bir öfke veya hile yoktu. Biri diğerini pist dışındaki çimlere itmedi; virajı dönerken rakibine tam bir lastik payı bıraktı. Kılıçlar defalarca birbirine çarptı ama hiçbiri göğse saplanmadı. Son virajdan çıkarken Villeneuve çeyrek boy öndeydi ve çizgiyi 0.24 saniye farkla ikinci geçti. Otomobiller yavaşlayıp yan yana geldiğinde iki pilot kasklarının altından birbirine gülümsedi.'
      },
      {
        type: 'image',
        src: '/stories/dijon-1979/portrait/01.png',
        caption: 'René Arnoux Renault RS10 kokpitinde.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Podyum arkasında birbirlerine sarıldıklarında ikisinin de tulumları ter ve kauçuk kokuyordu. Arnoux yıllar sonra o anı tek bir cümleyle özetleyecekti: "O yarışta Gilles dışında dünyadaki başka hiçbir pilota o kadar güvenemezdim." Dijon, zaferin sadece kupayla ölçülmediğini; bazen bir ikincilik kavgasının, kaybedenin de onurunu koruduğu sürece bir sporun ruhunu nasıl sonsuza dek mühürleyebileceğini gösterdi.'
      }
    ]
  },

  // 10. imola-1994
  {
    slug: 'imola-1994',
    title: 'The Black Weekend',
    titleTr: 'Tamburello’nun Gölgesi',
    subtitle: 'Ratzenberger and Senna. Safety re-written in grief at Tamburello.',
    subtitleTr: '1994 Imola, bir pistin kaderi veya mistik bir trajedi değil; elektronik güvenlik ağları kaldırılmış dengesiz otomobillerle insan hayatı arasındaki uçurumun görmezden gelindiği sistemsel bir ihmalin faturasıdır.',
    year: '1994',
    category: 'Tragedy',
    heroImage: '/stories/imola-1994/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Premonition'
      },
      {
        type: 'paragraph',
        text: 'On the morning of May 1, 1994, spring sun broke across the Santerno river, yet the paddock at Imola sat beneath an suffocating, leaden pall. Death had already taken residence in the garage. On Friday, Rubens Barrichello’s Jordan launched off the curb at the Variante Bassa, violently impacting the catch-fencing in a crash that knocked him senseless. On Saturday, during qualifying, Roland Ratzenberger’s Simtek suffered a front-wing structural failure and impacted the concrete wall at the Villeneuve corner at 195 mph, killing the Austrian rookie instantly.'
      },
      {
        type: 'image',
        src: '/stories/imola-1994/portrait/01.png',
        caption: 'Senna memorial, Parco delle Acque Minerali, Imola.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Ayrton Senna was among the first to reach the medical center. He wept openly, and on Sunday morning gathered his peers to revive the dormant Grand Prix Drivers\' Association. Romantic mythology prefers to cast Senna as a tragic mystic marching willingly toward an inescapable fate. The reality was a cold institutional failure. For the 1994 season, the governing body had abruptly outlawed active suspension, traction control, and electronic safety nets without dialing back cornering velocities. The resulting generation of cars were twitchy, aerodynamically unstable beasts. The Williams FW16 was blindingly fast but possessed a razor-thin operational window. Senna knew his cockpit was compromised; the steering column had been hastily cut, shortened, and welded to grant him ergonomic clearance.'
      },
      {
        type: 'heading',
        text: 'Tamburello and the Awakening'
      },
      {
        type: 'paragraph',
        text: 'On Lap 7, moments after the safety car pulled in, the field charged down to Tamburello. Approaching the flat-out left-hander at 190 mph, the modified steering shaft failed. The FW16 tracked straight off the tarmac. Senna stood on the brakes, shedding speed down to 131 mph, but the run-off was a narrow strip of grass bordering a bare concrete retaining wall. The impact sheared the right-hand chassis. A rogue suspension arm pierced the visor.'
      },
      {
        type: 'image',
        src: '/stories/imola-1994/landscape/01.png',
        caption: 'Imola circuit, old flow and permanent scars.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'When medical teams cleared the wrecked monocoque, they found a furled Austrian flag tucked into the footwell. Senna had intended to wave it on his victory lap in memory of Ratzenberger. The legacy carved into the concrete at Tamburello that black afternoon was not romantic destiny; it was a furious, long-overdue safety revolution. The modern crash structures, HANS devices, and vast asphalt run-offs that allow today’s generation to grow old were bought with the lives of two men on a weekend when the sport finally grew a conscience.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Santerno Üzerindeki Kurşun Ağırlığı'
      },
      {
        type: 'paragraph',
        text: '1 Mayıs 1994 sabahı Imola’daki Santerno nehrinin kıyısına bahar güneşi vuruyordu; ancak padok, üzerine çöken kurşun ağırlığındaki bir gölgenin altındaydı. O hafta sonu Formula 1 padoğuna ölüm çoktan sızmıştı. Cuma günü Rubens Barrichello’nun Jordan’ı bordürden havalanıp tel örgülere saplanmış, genç Brezilyalı ölümün kıyısından dönmüştü. Cumartesi günü ise Roland Ratzenberger’in Simtek’i, kırılan ön kanadın tabanın altına girmesiyle 314 km/s hızla Villeneuve virajının beton duvarına çarpmış ve Avusturyalı pilot hayatını kaybetmişti.'
      },
      {
        type: 'image',
        src: '/stories/imola-1994/portrait/01.png',
        caption: 'Senna anıtı, Parco delle Acque Minerali, Imola.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Ayrton Senna kaza yerine giden ilk kişiydi. Gözyaşlarını tutamamış, pazar sabahı yapılan pilotlar toplantısında güvenlik komisyonunu yeniden kurmak için imza toplamıştı. Popüler mitoloji, Senna’nın o gün yarışmak istemediğini ama kaderine boyun eğerek kokpite girdiğini anlatır. Gerçek ise kader değil; sporu yöneten kurumların, televizyon sözleşmelerinin ve takım baskılarının yarattığı ağır bir sistemsel körlüktü. 1994 sezonunda aktif süspansiyon ve çekiş kontrolü gibi sürüş yardımları aniden yasaklanmış, otomobiller aerodinamik açıdan bıçak sırtı, dengesiz canavarlara dönüşmüştü. Williams FW16 hızlıydı ama viraj girişlerinde öngörülemez tepkiler veriyordu. Senna, aracın direksiyon milinin kokpit içinde daha rahat edebilmek için daraltılıp yeniden kaynatıldığını biliyordu.'
      },
      {
        type: 'heading',
        text: 'Tamburello’nun Vicdanı'
      },
      {
        type: 'paragraph',
        text: 'Yarışın yedinci turunda, güvenlik aracının pistten çıkmasından hemen sonra Tamburello virajına girildi. 305 km/s hızla dönülen o sol virajda Williams’ın direksiyon mili kırıldı. Otomobil teğet geçti. Senna frene bastı, hızı 211 km/s’ye kadar düşürdü ancak beton duvar ile pist arasında kaçış alanı yoktu. Çarpışmanın şiddeti otomobili parçaladı. Süspansiyon kolunun kaskı delip geçtiği o an, Formula 1 için bir devrin bittiği andı.'
      },
      {
        type: 'image',
        src: '/stories/imola-1994/landscape/01.png',
        caption: 'Imola pisti, eski akış ve derin yaralar.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Kokpitten çıkarılan enkazın içinden katlanmış bir Avusturya bayrağı çıktı. Senna, yarışı bitirdiğinde Ratzenberger için o bayrağı sallamayı planlamıştı. O pazar günü Tamburello’nun duvarında can veren iki pilotun mirası, bugün griddeki her gencin sağ salim evine dönebilmesini sağlayan modern güvenlik standartlarıdır. Kural kitapları, ancak insan kanıyla yazıldığında ciddiyet kazanıyordu.'
      }
    ]
  },

  // 11. brawn-2009
  {
    slug: 'brawn-2009',
    title: 'The Phoenix',
    titleTr: 'Beyaz Mucizenin Boşluğu',
    subtitle: 'From ashes to titles. The improbable geometry of the BGP 001.',
    subtitleTr: 'Brawn GP’nin 2009 şampiyonluğu bir peri masalı değil; kural kitabındaki gri bir virgülü keşfeden bir avuç mühendisin, endüstriyel devleri iflasın küllerinden vurduğu mimari bir zekâ zaferidir.',
    year: '2009',
    category: 'Miracle',
    heroImage: '/stories/brawn-2009/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The One-Pound Buyout'
      },
      {
        type: 'paragraph',
        text: 'In December 2008, as the global credit crunch froze corporate boardrooms, Honda called an emergency press conference in Tokyo and unceremoniously pulled the plug on its Formula 1 program. The Brackley factory was slated for liquidation, hundreds of personnel faced redundancies, and an entire season’s development stood destined for the scrap heap. Ross Brawn and Nick Fry acquired the operation for a token single pound sterling. Unbranded, devoid of commercial sponsors, and dressed in plain virgin white with fluorescent yellow accents, the car that emerged in the spring of 2009 carried the greatest technical irony in Grand Prix history.'
      },
      {
        type: 'image',
        src: '/stories/brawn-2009/portrait/01.png',
        caption: 'BGP 001 lines, virgin white and neon accents.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Folk memory paints Brawn GP as a whimsical Cinderella fairy tale. The paddock engineers knew it was a masterclass in forensic regulatory interpretation. The sweeping 2009 aerodynamic overhaul had aimed to slash cornering downforce by severely capping the height and length of the rear diffuser. Yet deep within the technical working group, Brawn’s engineers had exploited an ambiguous phrasing in the regulations regarding suspension cut-outs. By channeling air through a secondary upper deck, they birthed the "double diffuser." It generated vortex stability and rear-axle suction that rivals could not fathom. Ferrari, Red Bull, and Renault filed furious protests with the FIA court of appeal. Brawn remained unbothered. He had not broken the law; he had simply read the blueprint with sharper eyes.'
      },
      {
        type: 'heading',
        text: 'Six of Seven and Survival'
      },
      {
        type: 'paragraph',
        text: 'When the BGP 001 rolled out for qualifying in Melbourne, the silence in pit lane was absolute. Jenson Button and Rubens Barrichello locked out the front row by half a second. Button swept the Grand Prix, and proceeded to win six of the opening seven rounds. The team operated on a knife-edge: there was no wind-tunnel development budget, no fleet of spare tubs, and mechanics salvaged damaged wings with structural resin. When Red Bull and McLaren finally copied the geometry mid-season and slashed the pace advantage, Button defended his points cushion with microscopic racecraft.'
      },
      {
        type: 'image',
        src: '/stories/brawn-2009/landscape/02.png',
        caption: 'Button celebrating the 2009 World Championship in Brazil.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'The title was sealed in Brazil, Button slicing through the midfield to secure fifth. Amidst the tears in the garage, the plain white car sat cooling in parc fermé without a major manufacturer badge on its flanks. Brawn GP had demonstrated that industrial monoliths are not invincible. Sometimes, victory belongs to the mind that spots the keystone hidden in the blank spaces of the rulebook.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Bir Sterlinlik İmparatorluk'
      },
      {
        type: 'paragraph',
        text: '2008 yılının Aralık ayında küresel finans krizi patlak verdiğinde, Honda Motor Company tek bir basın bülteniyle Formula 1’den derhal çekildiğini açıkladı. Brackley’deki fabrikanın kapısına kilit vurulmak üzereydi; yüzlerce mühendis işsiz kalma tehdidiyle karşı karşıyaydı ve takımın geleceği bir hurda değerindeydi. Ross Brawn ve Nick Fry, takımı sembolik bir bedelle—tam bir İngiliz sterlinine—satın aldı. Sponsoru olmayan, boyanacak parası bulunmadığı için saf beyaz ve fosforlu sarı çizgilerle piste çıkan bu otomobilin ardında spor tarihinin en büyük ironisi yatıyordu: İflas eden bir devin külleri, kural kitabının en kusursuz mimarisini doğurmuştu.'
      },
      {
        type: 'image',
        src: '/stories/brawn-2009/portrait/01.png',
        caption: 'BGP 001 çizgileri, beyaz ve fosforlu sarı.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Çoğu insan 2009 Brawn GP destanını duygusal bir "Külkedisi masalı" olarak okur. Oysa bu zafer duyguların değil, kural kitabındaki bir boşluğun zaferiydi. 2009 kuralları yere basma kuvvetini azaltmak için arka difüzörlerin yüksekliğini sınırlamıştı. Ancak Brawn’ın aerodinami ekibi, kural metnindeki bir ifade boşluğunu fark etti: Tabanın altındaki hava akışını iki katmanlı bir kanal sistemiyle tahliye etmek yasaklanmamıştı. "Çift difüzör" adı verilen bu tasarım, BGP 001’e rakiplerinin yanına bile yaklaşamayacağı bir viraj tabanı tutunması kazandırdı. Ferrari, McLaren ve Renault federasyona protesto mektupları yağdırırken, Brawn sakinliğini korudu. Kural ihlali yoktu; sadece kuralı herkesten daha dikkatli okuyan bir zekâ vardı.'
      },
      {
        type: 'heading',
        text: 'Yedi Yarışta Altı Zafer'
      },
      {
        type: 'paragraph',
        text: 'Sezonun ilk yarışı Avustralya’da otomobiller sıralama turlarına çıktığında padok sessizliğe gömüldü. Jenson Button ve Rubens Barrichello ilk iki cebi kapattı. Pazar günü Button yarışı baştan sona lider götürdü. İlk yedi yarışın altısını kazandı. Takımın yedek parçası yoktu, test yapacak bütçesi kalmamıştı; bir kaza durumunda aracı toplayacak karbon fiber kanat bile bulunamıyordu. Sezonun ikinci yarısında Red Bull ve diğer devler çift difüzörü kopyalayıp farkı kapattığında, Button aradaki puan yastığını bir santim bile deldirmeden savundu.'
      },
      {
        type: 'image',
        src: '/stories/brawn-2009/landscape/02.png',
        caption: 'Button’ın Brezilya’daki şampiyonluk sevinci.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Şampiyonluk Interlagos’ta, Button’ın arkalardan gelip beşinci olduğu yarışta ilan edildi. Garajda şampanya patlarken tulumunda hâlâ tek bir büyük sponsor logosu bulunmayan o beyaz otomobil kapalı parkta duruyordu. Brawn GP, bütçelerin ve dev fabrikaların her zaman kazanamayacağını; kuralların yazdığı kelimelerin arkasındaki boşluğu gören bir aklın, milyar dolarlık imparatorlukları dize getirebileceğini kanıtlamıştı.'
      }
    ]
  },

  // 12. schumacher-1994-spain
  {
    slug: 'schumacher-1994-spain',
    title: 'The Fifth Gear Symphony',
    titleTr: 'Tek Telin Direnci',
    subtitle: 'A gearbox jammed in fifth. A race that should have ended in the pits. Michael Schumacher rewrote the laws of physics to bring a broken machine home in second place.',
    subtitleTr: '1994 Barselona’da Schumacher’in beşinci viteste finişe ulaşması mekanik bir tesadüf değil; otomobili bir bütün olarak zihninde modelleyen bir pilotun, fizik kurallarını viraj çizgileriyle yeniden yazmasıdır.',
    year: '1994',
    category: 'Technical Mastery',
    heroImage: '/stories/schumacher-1994-spain/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Jam at Lap 21'
      },
      {
        type: 'paragraph',
        text: 'On May 29, 1994, the tarmac at the Circuit de Catalunya was baking under late-spring sunshine. Michael Schumacher and his Benetton B194 held imperious command of the Spanish Grand Prix, building an effortless gap over the field across the opening twenty laps. Then, on Lap 21, a hydraulic valve jammed. The bespoke Benetton sequential gearbox locked dead in fifth gear. Under standard racing doctrine, this was an open invitation to enter the pit lane, switch off the engine, and preserve the machinery. Modern Grand Prix cars are not engineered to operate on a single ratio; at slow speeds the engine stalls, on straights it suffocates against the rev-limiter.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/full/01.png',
        caption: 'Schumacher piloting the Benetton B194 in Spain, 1994.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Schumacher refused to retire. On the pit wall, race engineer Pat Symonds stared at the telemetry in disbelief. Schumacher had not plummeted to the back; he was circulating a mere three seconds off his prime pace. The German was rewriting the operational geometry of the car in real time. To negotiate tight corners like the La Caixa hairpin without stalling the Ford Zetec V8, he altered his racing lines completely—sacrificing the apex to carry high rolling momentum and using controlled understeer to keep engine revs above 7,000 rpm.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/portrait/01.png',
        caption: 'Cockpit controls and wheel, Circuit de Catalunya.',
        layout: 'portrait'
      },
      {
        type: 'heading',
        text: 'The Geometry of a Single Ratio'
      },
      {
        type: 'paragraph',
        text: 'The machine had become a violin with three broken strings. Schumacher simply played on the remaining one. The acid test lay in the pit stops. Launching a stationary Formula 1 chassis from a dead stop in fifth gear without detonating the carbon clutch plate borders on mechanical impossibility. The crew held their breath. Schumacher feathered the clutch pedal with surgical sensitivity, the engine bogged, shuddered, tires smoked, and the B194 crept forward into the pit exit without stalling. He completed forty-four of the sixty-five laps trapped in that solitary gear.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/landscape/02.png',
        caption: 'Benetton B194 Ford Zetec V8 exhaust fire.',
        layout: 'landscape'
      },
      {
        type: 'quote',
        text: 'I had to drive the whole race in fifth gear. It was like driving a truck.',
        author: 'Michael Schumacher'
      },
      {
        type: 'paragraph',
        text: 'Damon Hill swept past to claim victory for Williams, yet when the checkered flag dropped, the paddock rose in unanimous applause for the runner-up. Schumacher pulled into parc fermé, calf muscles locked in severe cramps from fighting the pedals. Barcelona that afternoon had witnessed more than mechanical endurance; it had seen an analytical mind bend physical law when the machinery had already surrendered.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: '21. Turdaki Kilitlenme'
      },
      {
        type: 'paragraph',
        text: '29 Mayıs 1994 Pazar günü Barselona’daki Circuit de Catalunya pistinde hava açık, zemin pürüzsüzdü. Michael Schumacher ve Benetton B194’ü ilk yirmi tur boyunca yarışı mutlak bir hakimiyetle önde götürüyordu. Ancak 21. turda, vites kutusundan gelen metalik bir ses her şeyi değiştirdi. Hidrolik sistem iflas etmiş, şanzıman beşinci viteste kilitlenip kalmıştı. Normal şartlarda bu arıza, bir pilotun pite girip motoru durdurması ve yarıştan çekilmesi için yeterli bir gerekçeydi. Çünkü Formula 1 araçları tek viteste yürümek üzere tasarlanmamıştır; yavaş virajlarda motor boğulur, düzlükte ise devir yetmez.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/full/01.png',
        caption: 'Schumacher Benetton B194 ile İspanya virajlarında, 1994.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Schumacher pite dönmeyi reddetti. Pit duvarındaki mühendisi Pat Symonds telemetri ekranına baktığında bir an gözlerine inanamadı. Schumacher yavaşlamıyordu; sadece tur başına üç saniye kaybetmişti. Alman pilot, Barselona’nın dar virajlarını stop etmeden dönebilmek için sürüş geometrisini baştan aşağı yeniden icat etmişti. Yavaş şikanlara geniş açıyla giriyor, apeks noktasında otomobili kaydırarak devrin 7.000 devir/dakikanın altına düşmesini engelliyor, viraj çıkışlarında ise debriyajı ayağıyla hafifçe kaydırarak tork üretiyordu.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/portrait/01.png',
        caption: 'Direksiyon ve kokpit kumandaları, Barselona 1994.',
        layout: 'portrait'
      },
      {
        type: 'heading',
        text: 'Tek Telli Keman'
      },
      {
        type: 'paragraph',
        text: 'Otomobil, tek teli kalmış bir kemana dönmüştü. Ve Schumacher o tek telle çalmaya devam ediyordu. En kritik sınav pit stop anıydı. Beşinci viteste kalkan bir yarış otomobili, debriyaj balatasını birkaç saniyede yakıp kül edebilirdi. Benetton mekanikerleri nefeslerini tuttu. Schumacher debriyajı milimetrik bir hassasiyetle bıraktı, motor hafifçe öksürdü, lastikler duman çıkardı ve araç stop etmeden pit yolundan ayrıldı. 65 turun tam 44’ünü tek bir viteste koştu.'
      },
      {
        type: 'image',
        src: '/stories/schumacher-1994-spain/landscape/02.png',
        caption: 'Benetton B194 egzozundan yükselen alevler.',
        layout: 'landscape'
      },
      {
        type: 'quote',
        text: 'Tüm yarışı beşinci viteste sürmek zorunda kaldım. Tır kullanmak gibiydi.',
        author: 'Michael Schumacher'
      },
      {
        type: 'paragraph',
        text: 'Damon Hill Williams’ıyla yarışı kazandı; ancak damalı bayrak sallandığında padoğun alkışı ikinci sıradaki Benetton içindi. Schumacher kokpitten indiğinde ayak bilekleri kramp içindeydi. O gün Katalunya’da sergilenen şey sadece fiziksel bir dayanıklılık değildi; bir pilotun makineyle kurduğu diyaloğun, mekanik bir enkazı dahi podyuma taşıyabilecek kadar derin bir zekâya dayanabileceğinin kanıtıydı.'
      }
    ]
  },

  // 13. collins-fangio-1956
  {
    slug: 'collins-fangio-1956',
    title: 'The Ultimate Sacrifice',
    titleTr: 'Emanet Taht',
    subtitle: 'Peter Collins handed over his car—and his world title—to Juan Manuel Fangio. A ghost of chivalry from an era when honor was worth more than gold.',
    subtitleTr: '1956 Monza’da Peter Collins’in otomobilini Fangio’ya devretmesi bir saflık veya zayıflık değil; genç bir yarışçının, şampiyonluk madalyasının üstünde tuttuğu feodal ve aristokratik bir onur anlayışının spora son vedasıdır.',
    year: '1956',
    category: 'Honor',
    heroImage: '/stories/collins-fangio-1956/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'Monza Banking and Broken Arms'
      },
      {
        type: 'paragraph',
        text: 'On September 2, 1956, beneath the sun blazing down upon the perilous concrete banking of Monza, the World Championship hung suspended between three men. Juan Manuel Fangio held the advantage in points, yet his youthful Ferrari teammate Peter Collins and Maserati’s Jean Behra retained a viable mathematical claim to the crown. Collins was twenty-five years old—dashing, ferociously quick, and poised on the brink of becoming Britain’s first World Champion. Under the sporting code of the era, a driver whose car suffered mechanical failure could commandeer a teammate\'s chassis, with points split equally between them.'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/full/01.png',
        caption: 'Collins and Fangio, Monza 1956.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Midway through the Italian Grand Prix, the steering arm on Fangio’s Lancia-Ferrari D50 snapped. The Argentine limped into the pits, climbed out, and removed his goggles. His championship appeared dead. Ferrari summoned their second driver, Luigi Musso, ordering him to yield his car to Fangio. Musso flatly refused, electing to fight for a home victory at Monza. It was an entirely professional and defensible decision; in motorsport, self-preservation is paramount. As Fangio stood resigned behind the pit barrier, Collins pitted on Lap 35 for a scheduled tire inspection.'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/landscape/02.png',
        caption: 'Ferrari D50 drifting across the Monza banking.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'Take It, Maestro'
      },
      {
        type: 'paragraph',
        text: 'Collins stepped out of the cockpit. He caught sight of Fangio standing silently in the shade, helmet in hand. There was no radio mandate. Enzo Ferrari had issued no decree demanding a sacrifice from his British charge. Collins did not hesitate. Willingly throwing away his own chance at the world title, he approached the maestro, laid a hand upon his shoulder, and offered his car: "Take it, Maestro. The race is yours."'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/portrait/01.png',
        caption: 'Collins handing his car over to Fangio, 1956.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'I would have done the same for him.',
        author: 'Peter Collins'
      },
      {
        type: 'paragraph',
        text: 'Fangio climbed into Collins\' seat with quiet astonishment, re-entered the contest, finished second, and secured his fourth consecutive world crown. Collins stood on the pit wall in his stained linen overalls, lit a cigarette, and watched his car cross the line. When journalists pressed him on why he had surrendered immortality, Collins smiled softly: "I am only twenty-five. I have plenty of time to win championships. Fangio deserves to keep his crown." Cruel history would deny Collins that promised time; two years later, he was killed amidst the birch trees of the Nürburgring. Yet his surrender at Monza remains the high watermark of sporting nobility—an echo from an era when personal honor outweighed the cold gleam of silver.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Monza’nın Beton Eğimleri'
      },
      {
        type: 'paragraph',
        text: '2 Eylül 1956 Pazar günü Monza’nın yüksek eğimli beton virajları güneşin altında titrerken, Formula 1 dünya şampiyonluğu üç adamın avuçları arasındaydı. Juan Manuel Fangio puan tablosunun tepesindeydi; ancak arkasından gelen genç takım arkadaşı Peter Collins ile Fransız Jean Behra matematiksel olarak şampiyonluk yarışının içindeydi. Collins 25 yaşındaydı; yakışıklı, hızlı ve Britanya tarihinin ilk Formula 1 Dünya Şampiyonu olmanın eşiğinde duran bir yetenekti. O günün kurallarına göre yarış sırasında aracı bozulan bir pilot, takım arkadaşının otomobilini devralabiliyor ve puanlar iki sürücü arasında paylaşılıyordu.'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/full/01.png',
        caption: 'Collins ve Fangio, Monza padokunda, 1956.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Yarışın ortasında Fangio’nun Ferrari D50’sinin direksiyon kolu kırıldı. Arjantinli usta otomobili güçlükle pite getirdi, kenara çekildi ve kaskını çıkardı. Şampiyonluk elinden kayıp gitmişti. Ferrari’nin diğer pilotu Luigi Musso pite çağrıldı; ancak İtalyan sürücü kendi evinde, Monza’da liderlik mücadelesi verirken otomobilini kimseye vermeyi kabul etmedi. Bu profesyonel ve anlaşılabilir bir tavırdı; bir pilot için kendi zaferi her şeyden önce gelirdi. Fangio garajın arkasında sessizce beklerken, 35. turda Peter Collins rutin lastik değişimi için pit alanına girdi.'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/landscape/02.png',
        caption: 'Ferrari D50 Monza eğimli virajında süzülüyor.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'Otur Maestro, Yarış Senin'
      },
      {
        type: 'paragraph',
        text: 'Collins kokpitten indi. Fangio’nun köşede, gözlerinde derin bir kederle durduğunu gördü. Hiçbir takım emri yoktu. Enzo Ferrari bile genç İngiliz’e böyle bir fedakarlığı dayatmamıştı. Collins bir an bile tereddüt etmedi. Kendi şampiyonluk şansını çöpe atarak Fangio’ya doğru yürüdü, elini omzuna koydu ve o unutulmaz jesti yaptı: "Otur Maestro, yarış senin."'
      },
      {
        type: 'image',
        src: '/stories/collins-fangio-1956/portrait/01.png',
        caption: 'Collins otomobilini Fangio’ya teslim ediyor, 1956.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'O da benim için aynısını yapardı.',
        author: 'Peter Collins'
      },
      {
        type: 'paragraph',
        text: 'Fangio şaşkınlıkla kokpite bindi, direksiyonu devraldı ve yarışı ikinci sırada bitirerek beşinci dünya şampiyonluğunu kazandı. Collins ise pit duvarında, beyaz gömleğiyle bir sigara yakıp finişi izledi. Gazeteciler yarıştan sonra neden böyle bir şey yaptığını sorduklarında, Collins sakin bir sesle cevap verdi: "Ben henüz gencim, önümde kazanacak çok zaman var. O ise bu unvanı fazlasıyla hak etmiş bir efsane." Kader, Collins’e o vaat ettiği zamanı vermedi; iki yıl sonra Nürburgring’in ağaçları arasında hayatını kaybetti. Fakat 1956 Monza’da sergilenen o sessiz feragat, sporun henüz sponsorlara ve kurumsal sözleşmelere boğulmadığı o romantik çağdan kalan en asil şövalyelik nişanı olarak tarihteki yerini aldı.'
      }
    ]
  },

  // 14. monaco-1982
  {
    slug: 'monaco-1982',
    title: 'The Chaos Theory',
    titleTr: 'Monte Carlo Ruleti',
    subtitle: 'Rain, oil, and failing engines. A final lap where the lead changed like a deck of cards, proving that in the streets of Monte Carlo, the track always wins.',
    subtitleTr: '1982 Monaco, bir beceriksizlik komedisi değil; Monte Carlo sokaklarının mekanik kibri nasıl acımasızca yuttuğunu ve zaferin bazen sadece hayatta kalan son tekerleğe bahşedildiğini gösteren bir kader tablosudur.',
    year: '1982',
    category: 'Chaos',
    heroImage: '/stories/monaco-1982/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Shuffling of the Deck'
      },
      {
        type: 'paragraph',
        text: 'On Sunday, May 23, 1982, as salt spray blew off the harbor and misted the yachts of Monte Carlo, the Grand Prix appeared resolved. Alain Prost, cruising in his factory Renault turbo, held an imperious lead with three laps remaining. Broadcasters were reciting their concluding remarks, and the princely box was preparing chilled champagne. But the Principality does not adhere to boardroom itineraries. With three miles left to run, a capricious coastal drizzle coated the tarmac, turning the historic streets into a slick, polished roulette table.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/full/01.png',
        caption: 'Monaco GP 1982 final lap chaos across the streets.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'What unfolded across the final seventy-two hours of racing was not sport; it was an implosion of mechanical certainty. On Lap 74, Prost aqua-planed through the harbor chicane, the Renault snapping into the barriers and scattering carbon across the waterfront. Riccardo Patrese inherited the lead in his Brabham, only to spin on oil at the Loews hairpin sixty seconds later, stalling on the curb. The poisoned chalice passed to Didier Pironi’s Ferrari. Pironi climbed toward the tunnel, but emerged from the darkness coasting in silence, his battery dead.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/landscape/02.png',
        caption: 'Didier Pironi coasting from the tunnel with dead electricals.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'The Empty Checkered Flag'
      },
      {
        type: 'paragraph',
        text: 'Behind him, Andrea de Cesaris swept toward destiny in his Alfa Romeo, only to sputter to an agonizing halt at Mirabeau with an empty fuel tank. Derek Daly then led in a battered Williams, unaware that his fractured gearbox had seized completely, leaving him stranded on the harbor approach. There was no leader on the road. At the start-finish straight, clerk of the course stood with checkered flag in hand, staring into empty asphalt. The broadcast booth fell silent. Nobody knew whom to crown.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/portrait/01.png',
        caption: 'Riccardo Patrese, the bewildered victor of 1982.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Down at Loews, marshals pushed Patrese’s stranded Brabham off the racing line to clear the corner. Rolling downhill, Patrese popped the clutch; the Cosworth DFV sparked back to life. He negotiated the debris-littered final mile, crossed the timing stripe, and parked in the pit lane entirely unaware that he had won. He was pushed toward the royal podium in a state of sheer disbelief. Monaco had not crowned a driver that afternoon; it had simply eliminated every rival. In the casino of Monte Carlo, the house always wins; sometimes, it merely allows the last surviving pawn to sweep the chips.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Havaya Saçılan İskambil Destesi'
      },
      {
        type: 'paragraph',
        text: '23 Mayıs 1982 Pazar günü Akdeniz’den esen rüzgâr Monaco limanını döverken, yarışın bitimine üç tur kala kimse tarihin en tuhaf pazar günlerinden birine tanıklık edeceğini düşünmüyordu. Alain Prost, hafif siklet Renault turbosuyla yarışı baştan sona domine etmişti ve damalı bayrağa doğru sakin adımlarla ilerliyordu. Spor spikerleri zafer konuşmalarını hazırlamış, prenslik locası şampanyaları soğutmaya başlamıştı. Ancak Monaco bir yarış pisti değildir; sokağın kuralları mühendislik simülasyonlarına boyun eğmez. Son üç turda başlayan hafif yağmur, asfaltı bir kumarhane masasının kadifesi gibi kayganlaştırdı.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/full/01.png',
        caption: 'Monaco GP 1982, son tur karmaşası sokaklara yayılıyor.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Son iki turda yaşananlar, bir yarış değil; kartların havaya saçıldığı bir rulet oyunuydu. 74. turda Prost, liman şikanında su birikintisine bastı, savruldu ve bariyerlere çarparak yarış dışı kaldı. Liderlik Riccardo Patrese’nin Brabham’ına geçti. Ancak Patrese daha zaferin ağırlığını kavrayamadan Loews virajında spin attı; otomobil stop etti ve yolun kenarında kaldı. Liderlik bu kez Ferrari’siyle Didier Pironi’ye geçti. Pironi tünelin karanlığına girdi; fakat pili bitmiş bir oyuncak gibi tünelin çıkışında yavaşladı. Ferrari’nin aküsü iflas etmişti.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/landscape/02.png',
        caption: 'Didier Pironi tünel çıkışında elektrik arızasıyla duruyor.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'Havada Kalan Damalı Bayrak'
      },
      {
        type: 'paragraph',
        text: 'Pironi yolda kalırken arkadan gelen Alfa Romeo pilotu Andrea de Cesaris liderliğe yükseldi; ancak o da Mirabeau virajında benzini bittiği için durdu. Derek Daly lider gidiyordu; fakat birkaç tur önce kırdığı arka kanadı ve parçalanan vites kutusu son turda tamamen kilitlendi. Pistte lider kalmamıştı. Damalı bayrağı elinde tutan yarış direktörü, finiş çizgisinde şaşkınlıkla boş asfalta bakıyordu. Kime el sallayacağını kimse bilmiyordu.'
      },
      {
        type: 'image',
        src: '/stories/monaco-1982/portrait/01.png',
        caption: 'Riccardo Patrese, kazandığını bilmeyen şampiyon.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'O sırada Loews yokuşunun kenarında bekleyen Patrese, pist görevlilerinin otomobili tehlikeli bir noktadan çıkarmak için ittiğini fark etti. Yokuş aşağı ivmelenen Brabham’ın debriyajını bıraktı, motor yeniden ateşlendi. İtalyan pilot çizgiyi geçtiğinde kazandığından habersizdi; garaja döndüğünde podyumun tepesine çağrılınca gözlerine inanamadı. Monaco o gün kimseye şampiyonluk vadetmedi. Monte Carlo ruletinde masa her zaman kazanır; geriye kalanlar ise sadece masadan kalkmayı başaran son şanslılardır.'
      }
    ]
  },

  // 15. jerez-1997
  {
    slug: 'jerez-1997',
    title: 'The Triple Zero',
    titleTr: 'Kırılan Kristal',
    subtitle: 'Three drivers, one exact time to the thousandth of a second. A mathematical impossibility that set the stage for F1\'s most controversial collision.',
    subtitleTr: '1997 Jerez, bir anlık hırsla yapılmış bir kaza değil; saf hızıyla kaybedeceğini anlayan bir şampiyonun, kendi ahlaki mirasını bir viraj apeksinde un ufak eden kaçınılmaz trajedisidir.',
    year: '1997',
    category: 'Rivalry',
    heroImage: '/stories/jerez-1997/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The 1:21.072 Synchrony'
      },
      {
        type: 'paragraph',
        text: 'On Saturday, October 25, 1997, as qualifying closed for the European Grand Prix at Jerez, the timing monitors displayed what appeared to be a computer malfunction: 1:21.072. Jacques Villeneuve set the time first. Twenty minutes later, Michael Schumacher matched it precisely. In the dying moments, Heinz-Harald Frentzen clocked the identical thousandth. Three drivers, three chassis, synchronized to within a millisecond. It was an astronomical anomaly—a Greek chorus establishing the stage for the definitive moral crisis of modern Formula 1.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/full/01.png',
        caption: 'Villeneuve, Schumacher, and Frentzen: 1:21.072 timing board.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Schumacher carried a one-point championship advantage into Sunday, but as the fuel loads burned off, the raw long-run superiority of the Williams FW19 became undeniable. By Lap 48, the German’s Goodyear tires were blistering under lateral load, and Villeneuve closed the gap like an inevitable tide. Down the long back straight toward the sharp Dry Sack hairpin, Villeneuve slipped into the slipstream, darted to the inside, and braked on the absolute limit. It was an immaculate, textbook maneuver; the Canadian held the apex.'
      },
      {
        type: 'heading',
        text: 'The Chop at Dry Sack'
      },
      {
        type: 'paragraph',
        text: 'In that fraction of a second, the mirror fractured. Realizing that pace alone could not defend his crown, Schumacher turned sharply into the corner, aiming his right-front wheel directly at the Williams’s radiator pod. It was not a racing collision; it was the desperate resurrection of the ruthless reflex that had eliminated Damon Hill in Adelaide three years earlier. But the gravel trap of Jerez offered no salvation. The Ferrari glanced off the Williams, spun across the curb, and beached itself helplessly in the dust. Schumacher gunned the engine; the rear wheels spun futilely in the sand.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/landscape/02.png',
        caption: 'The contact at Dry Sack that decided the 1997 World Championship.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Villeneuve nursed his punctured sidepod across the line in third place to claim the World Championship. Schumacher climbed out of the stranded machine, trudging back down the service road without removing his helmet. Weeks later, the FIA stripped him of his second place in the 1997 Drivers\' Championship—a total administrative expulsion.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/portrait/01.png',
        caption: 'Jacques Villeneuve celebrating Williams’s championship triumph.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'What shattered at Dry Sack was far more significant than a piece of Italian suspension steel. It was the immaculate crystal of Schumacher\'s sporting genius, irrevocably cracked by a refusal to accept the dignity of defeat.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Binde Birlik Mucize'
      },
      {
        type: 'paragraph',
        text: '25 Ekim 1997 Cumartesi günü İspanya’nın Jerez pistinde sıralama turları bittiğinde, zaman ekranında beliren rakam bir baskı hatası gibi duruyordu: 1:21.072. Jacques Villeneuve ilk turunda bu dereceyi yaptı; yirmi dakika sonra Michael Schumacher aynı dereceyi yaptı; seansın bitimine az bir süre kala Heinz-Harald Frentzen de aynı dereceyi yaptı. Saniyenin binde birine kadar üç otomobil, aynı zaman dilimine kilitlenmişti. Matematiksel ihtimali milyonda bir olan bu eşitlik, Formula 1 tanrılarının pazar günkü nihai hesaplaşma için kurduğu kusursuz bir sahneydi.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/full/01.png',
        caption: 'Villeneuve, Schumacher ve Frentzen: 1:21.072 eşitliği.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Schumacher şampiyonada bir puan öndeydi; ancak yarış pazar günü başladığında Williams’ın saf yarış temposunun Ferrari’den üstün olduğu kısa sürede anlaşıldı. 48. tura gelindiğinde Schumacher lastiklerinin aşınmasıyla mücadele ediyor, arkasındaki Villeneuve ise bir gölge gibi yaklaşıyordu. Dry Sack virajına doğru inen uzun düzlükte Kanadalı pilot hava koridorundan çıktı, geç frenle içeri daldı ve otomobilinin burnunu Ferrari’nin yanına soktu. Hamle temizdi, viraj çizgisi Villeneuve’ündü.'
      },
      {
        type: 'heading',
        text: 'Dry Sack’ta Çatlayan Ayna'
      },
      {
        type: 'paragraph',
        text: 'O anda Schumacher’in zihnindeki ayna çatladı. Saf hızla kazanamayacağını anladığı o salisede, direksiyonunu sola, Villeneuve’ün Williams’ının yan radyatörüne doğru kırdı. Bu refleksif bir temas değildi; 1994 Adelaide’de Damon Hill’e karşı işe yaramış o ilkel içgüdünün son hamlesiydi. Ancak Jerez’in çakıl havuzu affetmedi. Ferrari’nin tekerleği Williams’ın gövdesine çarptı, sekerek çakıllara gömüldü ve asılı kaldı. Schumacher gaza bastı ama arka tekerlekler boşlukta döndü.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/landscape/02.png',
        caption: 'Dry Sack virajında şampiyonluğu belirleyen temas.',
        layout: 'landscape'
      },
      {
        type: 'paragraph',
        text: 'Villeneuve yaralı otomobiliyle yola devam etti, yarışı üçüncü bitirerek dünya şampiyonluğunu kazandı. Schumacher ise otomobilinden indi, kaskını çıkarmadan çakılların üzerinde yürüdü. FIA birkaç hafta sonra onu sezonun tüm şampiyonasından diskalifiye etti; puanları silindi.'
      },
      {
        type: 'image',
        src: '/stories/jerez-1997/portrait/01.png',
        caption: 'Jacques Villeneuve, Williams şampiyonluğunu kutluyor.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'O gün Dry Sack virajında kırılan şey sadece bir Ferrari süspansiyonu değildi. Spor tarihinin en büyük dehalarından birinin, kaybetmenin vakarını taşıyamadığı o anda kendi kusursuzluk kristaline indirdiği ölümcül darbeydi.'
      }
    ]
  },

  // 16. senna-donington-1993
  {
    slug: 'senna-donington-1993',
    title: 'The Ghost of Donington',
    titleTr: 'Islak Tuval',
    subtitle: 'Donington, 1993. Active Williams versus a McLaren in the rain—and Senna\'s opening lap as intimidation made visible.',
    subtitleTr: 'Donington 1993’ün açılış turu uhrevi bir sihirbazlık değil; teknolojik olarak geride kalmış bir ustanın, suyun ve asfaltın dinamiklerini elektronik beyinlerden daha hızlı hesaplayabildiği saf yarış zekâsıdır.',
    year: '1993',
    category: 'Legend',
    heroImage: '/stories/senna-donington-1993/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Fluid Canvas'
      },
      {
        type: 'paragraph',
        text: 'On Easter Sunday, April 11, 1993, a cold, brooding deluge settled over the undulating contours of Donington Park. On paper, the European Grand Prix was decided before the engines fired. The Williams-Renault FW15C was the most sophisticated piece of aerodynamic and electronic weaponry ever devised in Grand Prix history, boasting active ride-height suspension, traction control, and an anti-lock braking system that rendered human error obsolete. Alain Prost and Damon Hill commanded the front row. Ayrton Senna sat fourth in a customer McLaren MP4/8 powered by an underpowered, normal-breathing Ford V8.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/full/01.png',
        caption: 'Senna carving through the spray on Lap 1, Donington 1993.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Legend celebrates Senna’s opening tour that morning as an act of divine mysticism. The reality was a sublime lesson in friction mechanics executed by an artist reading a fluid canvas. At the extinguish of the red lights, Senna suffered excessive wheelspin, immediately dropping to fifth behind Michael Schumacher’s Benetton. What followed over the next three miles remains the benchmark of tactile improvisation. Approaching Redgate, while his peers tiptoed around the traditional, rubber-slicked racing line, Senna steered directly onto the oily, unused outer rim of the circuit. He understood what computer models could not calculate: rain washes the racing rubber into frictionless grease, leaving virgin asphalt on the periphery rich with mechanical grip. He swept around Schumacher before the apex.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/landscape/02.png',
        caption: 'McLaren MP4/8 creating rooster tails down the Craner Curves.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'The Anatomy of a Masterpiece'
      },
      {
        type: 'paragraph',
        text: 'Descending through the Craner Curves, he carved down the inside of Karl Wendlinger’s Sauber with unearthly momentum. At the Old Hairpin, he dispatched Damon Hill’s Williams on the outside curb, spray exploding from his rear wing. Only his arch-rival remained. Entering the Melbourne Hairpin, Prost braked defensively, but Senna committed down the sodden inside line, claiming the apex with zero steering correction. By the time the pack exited Goddard\'s to complete Lap 1, Senna was in the lead. He had dismantled four world-class drivers in under ninety seconds.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/portrait/01.png',
        caption: 'Ayrton Senna with the iconic Donington trophy.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'That first lap was the best lap of my life.',
        author: 'Ayrton Senna'
      },
      {
        type: 'paragraph',
        text: 'Throughout the afternoon, Senna’s tactical clairvoyance never wavered; he even set the fastest lap of the Grand Prix by deliberately driving through the pit lane, exploiting a quirk in the circuit’s layout that shaved distance off the lap. When the checkered flag fell, he had lapped the entire field up to second-placed Damon Hill, with Prost a full lap in arrears. Donington settled an ancient argument: regardless of how omnipotent electronic algorithms become, they will always remain blind to the tactile conversation between human skin and falling rain.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Teknolojiye Karşı Parmak Uçları'
      },
      {
        type: 'paragraph',
        text: '11 Nisan 1993 Pazar günü Leicestershire’daki Donington Park üzerine çöken kasvetli gökyüzü, Formula 1 için soğuk bir yağmur bırakıyordu. Kâğıt üzerinde yarış başlamadan bitmiş gibiydi. Williams-Renault FW15C, sporda o güne kadar üretilmiş en ileri teknolojiye sahipti; aktif süspansiyonu, çekiş kontrolü ve sofistike telemetrisiyle McLaren’ın müşteri tipi standart Ford motorunu kullanan MP4/8’ini sıradan bir araca dönüştürüyordu. Alain Prost ve Damon Hill ilk çizgiyi kapatmıştı. Ayrton Senna ise dördüncü cepten kalkıyordu.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/full/01.png',
        caption: 'Senna, Donington 1993’ün açılış turunda su perdesini yarıyor.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Spor anlatısı, Senna’nın o günkü ilk turunu doğaüstü bir "tanrısal dokunuş" olarak kutsar. Oysa o tur, bir fırça ustasının suyun hareketini okuma kabiliyetinden ibaretti. Işıklar söndüğünde Senna kötü bir kalkış yaptı ve Michael Schumacher’in Benetton’ına geçilerek beşinciliğe geriledi. Ancak Redgate virajına girerken mucize başladı. Senna, diğer pilotların su birikintilerinden kaçarak kullandığı klasik yarış çizgisini tamamen terk etti. Pisti bir ressamın ıslak tuvali gibi gördü. Virajın en dışındaki, kimsenin cesaret edemediği kauçuksuz ve temiz asfalt şeridine yöneldi. Orada daha fazla tutunma vardı. Önce Schumacher’i dışarıdan avladı.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/landscape/02.png',
        caption: 'McLaren MP4/8 Craner virajlarında su püskürtüyor.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'Doksan Saniyede Dört Şah'
      },
      {
        type: 'paragraph',
        text: 'Viraj çıkışında Karl Wendlinger’in Sauber’ini bir heykeltıraş hassasiyetiyle içeriden kesti. Craner Curves inişinde herkes frene dokunurken o gazı açık tuttu; Damon Hill’in Williams’ının yanından su sıçratarak geçti. Geriye sadece ezeli rakibi kalmıştı: Alain Prost. Melbourne Hairpin virajına yaklaşırken Fransız pilot henüz aynasını kontrol edemeden, sarı kask içeriden içeriye doğru bir mızrak gibi daldı. Senna virajı döndüğünde liderdi. Beş pilotu, yağmurun altında kırk saniye içinde ayıklamıştı.'
      },
      {
        type: 'image',
        src: '/stories/senna-donington-1993/portrait/01.png',
        caption: 'Ayrton Senna Donington Sonic kupasıyla.',
        layout: 'portrait'
      },
      {
        type: 'quote',
        text: 'O ilk tur, hayatımın en iyi turuydu.',
        author: 'Ayrton Senna'
      },
      {
        type: 'paragraph',
        text: 'O pazar günü koşulan yarışta Senna, pit alanının pistten daha kısa bir mesafe sunduğunu fark ederek en hızlı turunu bile pit yolundan geçerek kaydetti. Damalı bayrak sallandığında Prost’a bir tur, üçüncü sıradaki araca ise iki tur bindirmişti. Donington, teknolojinin ve milyon dolarlık yazılımların asla satın alamayacağı bir şeyi kanıtladı: Otomobil ne kadar akıllı olursa olsun, yağmur damlasının asfalttaki dansını sadece parmak uçlarıyla hisseden bir insan yönetebilir.'
      }
    ]
  },

  // 17. jaguar-monaco-diamond
  {
    slug: 'jaguar-monaco-diamond',
    title: 'The $300,000 Mistake: The Lost Diamond of Monaco',
    titleTr: 'Monte Carlo Serabı',
    subtitle: '2004 Monaco GP. A Jaguar F1 nose. A Steinmetz diamond worth a fortune. One crash at Loews. The Mediterranean—or the streets of Monte Carlo—swallowed it forever.',
    subtitleTr: 'Jaguar’ın burnundaki pırlantanın kayboluşu talihsiz bir kaza değil; pazarlama gösterisinin yarışma zarafetini ezdiği modern Formula 1’de, sokağın kurumsal kibre kestiği üç yüz bin dolarlık alaycı bir faturadır.',
    year: '2004',
    category: 'Myth',
    heroImage: '/stories/jaguar-monaco-diamond/landscape/01.png',
    blocks: [
      {
        type: 'heading',
        text: 'The Red Carpet Publicity Stunt'
      },
      {
        type: 'paragraph',
        text: 'On May 23, 2004, the customary paddock aroma of high-octane fuel and scorched carbon fiber at Monaco was adulterated by Hollywood vanity. To promote the heist film Ocean’s Twelve, Jaguar Racing had embedded two flawless, un-cut diamonds supplied by the jeweler Steinmetz into the nosecones of its green R5 chassis. Valued at three hundred thousand dollars apiece, the gems sat exposed at the prow of the cars, winking obscenely beneath the Mediterranean sunshine. In an arena where designers spend millions to eliminate grams, an engineering team had ballasted a race car for a red-carpet publicity stunt.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/full/01.png',
        caption: 'Jaguar R5 nose with the Steinmetz diamond, Monaco 2004.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Monte Carlo possesses an ancient distaste for institutional hubris. On the opening lap, navigating the congested bottleneck of the Loews hairpin—the slowest and most unforgiving turn on the international calendar—Austrian rookie Christian Klien miscalculated his braking zone by two inches. The green nose struck the outer armco head-on. The carbon-composite crumple structure shattered instantly, and the precious nosecone fractured into shards across the tarmac. Klien abandoned the car, ducked beneath the tire wall, and retreated to the motorhome.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/landscape/02.png',
        caption: 'Christian Klien, Jaguar R5, Loews hairpin crash, Monaco 2004.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'The Missing Stone'
      },
      {
        type: 'paragraph',
        text: 'The crowning absurdity commenced once the wreckage was dragged away. Under strict FIA safety regulations, team personnel are forbidden from accessing an active circuit until the Grand Prix concludes. For the next two agonizing hours, Jaguar executives paced the pit lane while seventy-seven laps of Grand Prix traffic pounded past the Loews apex at full racing speed, hot tires scattering carbon dust and debris into the curbs and gutters.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/portrait/01.png',
        caption: 'The enigma of the lost Steinmetz gem.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'When the checkered flag finally waved, Jaguar mechanics dashed up the hill to sift through the gutters with flashlights. The diamond was gone. It was neither found in the retaining barriers, nor recovered from the municipal drains, nor fished out of the harbor. Whether it vanished into the pocket of an anonymous marshal, found its way into a fan’s souvenir jacket, or was swept into the street-sweeper’s hopper remains one of the paddock’s unresolved enigmas. Jaguar abandoned Formula 1 six months later, selling the entire operation to a beverage manufacturer for a nominal fee. The missing stone remains the ultimate monument to motorsport vanity. In the unforgiving streets of the Principality, those who mistake the altar of racing for a film set are invariably relieved of their jewels.'
      }
    ],
    blocksTr: [
      {
        type: 'heading',
        text: 'Hollywood Şatafatı ve Asfalt'
      },
      {
        type: 'paragraph',
        text: '23 Mayıs 2004 Pazar günü Monaco padoğunda motor yağının kokusuna garip bir Hollywood şatafatı karışmıştı. Gişe filmi Ocean’s Twelve’in tanıtımı için Jaguar Racing, iki yeşil otomobilinin burnuna Steinmetz tarafından sağlanan kusursuz birer elmas yerleştirmişti. Her biri üç yüz bin dolar değerinde olan bu taşlar, karbon fiber burun konisinin tam ortasında, Akdeniz güneşinin altında parıldıyordu. Yarış takımları ağırlığı gramla hesaplarken, Jaguar podyumda değil, magazin sayfalarında kazanmanın peşindeydi.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/full/01.png',
        caption: 'Jaguar R5 burnundaki Steinmetz pırlantası, Monaco 2004.',
        layout: 'full'
      },
      {
        type: 'paragraph',
        text: 'Monaco sokakları ise gösterişten hoşlanmaz; kibri affetmeyen bir hafızası vardır. Yarışın ilk turunda, gridin en yavaş ve en affetmez noktası olan Loews firketesine girildiğinde Avusturyalı çaylak Christian Klien, arkadan gelen trafiğin içinde fren noktasını birkaç santim kaçırdı. Yeşil Jaguar’ın burnu doğrudan bariyerlere çarptı. Karbon fiber un ufak oldu, süspansiyon kırıldı ve üç yüz bin dolarlık elmas parçalanan burun konisiyle birlikte asfalta savruldu. Klien otomobilden indi, omuz silkti ve yürüyüp gitti.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/landscape/02.png',
        caption: 'Christian Klien Jaguar R5 ile Loews bariyerlerinde, Monaco 2004.',
        layout: 'landscape'
      },
      {
        type: 'heading',
        text: 'Asfaltın Yuttuğu Hazine'
      },
      {
        type: 'paragraph',
        text: 'İroninin zirvesi kazadan sonra yaşandı. Formula 1 güvenlik protokollerine göre, yarış devam ederken takımların piste çıkıp parça araması kesinlikle yasaktı. Jaguar yöneticileri ve sponsor temsilcileri, iki saat boyunca pit duvarında tırnaklarını yiyerek yarışın bitmesini bekledi. Otomobiller o virajdan yetmiş yedi kez daha geçti; yüzlerce sıcak lastik, savrulan enkazın ve dökülen taşların üzerinden 250 km/s hızla akıp gitti.'
      },
      {
        type: 'image',
        src: '/stories/jaguar-monaco-diamond/portrait/01.png',
        caption: 'Monte Carlo’nun kayıp Steinmetz elması muamması.',
        layout: 'portrait'
      },
      {
        type: 'paragraph',
        text: 'Yarış bittiğinde mekanikerler firketeye koştu; ancak asfalt çoktan temizlenmişti. Elmas yoktu. Ne bariyerin arkasında, ne çöp kutularında, ne de Akdeniz’in dibinde bulundu. Bir pist görevlisinin cebine mi girdi, yoksa Monakolu bir temizlik işçisinin süpürgesinde mi kayboldu, hiçbir zaman aydınlatılamadı. Jaguar o sezonun sonunda Formula 1’den çekildi ve fabrikayı bir içecek şirketine devretti. O kayıp taş, Formula 1 tarihinin en pahalı halkla ilişkiler faturası olarak kaldı. Çünkü Monte Carlo, gösteriş budalalarına her zaman aynı dersi verirdi: Pisti bir sahneye dönüştürmeye kalkanlar, eninde sonunda kendi dekorlarının altında ezilirler.'
      }
    ]
  }
];

function main() {
  const targetFile = resolve(__dirname, '../data/stories/content.ts');
  const code = `/**
 * Tracked source of truth for the 17 F1 Anthology stories.
 * Authored in accordance with docs/F1_Anlati_Stil_Kilavuzu.md & Editorial Constitution.
 * Dual-language supported: English longform journalism + Turkish "ev sesi".
 */
import type { StoryContentRecord } from './types';

export const storyContent: StoryContentRecord[] = ${JSON.stringify(stories, null, 2)};
`;

  writeFileSync(targetFile, code, 'utf-8');
  console.log(`Successfully updated ${stories.length} dual-language anthology stories in ${targetFile}`);
}

main();
