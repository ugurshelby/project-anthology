import { Story } from '../types';

// OPTIMIZATION NOTE:
// Added '?q=80&w=1600&auto=format&fit=crop' to all Unsplash URLs.
// This forces WebP format, reduces quality slightly for speed, and limits width to 1600px.

export const mockStories: Story[] = [
  // 1. THE SENNA LEGEND
  {
    id: 'senna-monaco',
    title: 'The Divine Lap',
    subtitle: 'Ayrton Senna’s transcendental qualification lap at Monaco, 1988. A moment where man and machine became one, before the crash that brought him back to earth.',
    year: '1988',
    category: 'Legend',
    // Abstract Speed/Blur - Yellow tones
    heroImage: '/images/1988_McLaren-Honda_MP4_4_Goodwood,_2009.jpeg', 
    content: [
      { type: 'paragraph', text: 'Monaco is not a race track; it is a cage. To drive fast here is to dance with a knife. In 1988, Ayrton Senna did not just drive; he entered a state of consciousness that few athletes ever reach. The car was an extension of his nervous system.' },
      { type: 'quote', text: 'I was no longer driving the car consciously. I was driving it by a kind of instinct, only I was in a different dimension.', author: 'Ayrton Senna' },
      { type: 'paragraph', text: 'He was two seconds faster than his teammate, Alain Prost. In Formula 1, two seconds is not a gap; it is a lifetime. It is the difference between talent and divinity.' },
      // Close up of a vintage wheel/cockpit
      { type: 'image', src: '/images/Ayrton_Senna_1988_Canada.jpg', caption: 'MP4/4, Senna 1988.', layout: 'full' },
      { type: 'heading', text: 'The Crash' },
      { type: 'paragraph', text: 'And then, silence. At Portier, just before the tunnel, the concentration broke. The McLaren hit the barrier. Senna did not return to the pits. He walked straight to his apartment in Monaco and disappeared for hours. Perfection is fragile.' }
    ]
  },

  // 2. HUNT VS LAUDA
  {
    id: 'hunt-lauda',
    title: 'Fire & Ice',
    subtitle: 'The 1976 season was not just a championship battle; it was a philosophical war between James Hunt and Niki Lauda.',
    year: '1976',
    category: 'Rivalry',
    // Vintage grain, dark atmosphere
    heroImage: '/images/James_Hunt_-_Dutch_GP_1976.jpg',
    content: [
      { type: 'heading', text: 'Blueprints and Cigarettes' },
      { type: 'paragraph', text: 'Lauda calculated risk with a pencil; Hunt calculated pleasure with a cigarette. In 1976, the paddock felt like a courtroom. The cars were loud, but the verdicts were louder.' },
      { type: 'image', src: '/images/James_Hunt_-_Dutch_GP_1976.jpg', caption: 'Hunt in the rain, Zandvoort.', layout: 'landscape' },
      { type: 'paragraph', text: 'On Sunday mornings, Hunt wore chaos like a suit. Lauda wore discipline. Their laps were the same sentence written in two handwritings.' },
      { type: 'heading', text: 'The Ring' },
      { type: 'paragraph', text: 'At the Nürburgring, the track bit back. Steel met fire. Lauda\'s return six weeks later was not heroic in the Hollywood sense—it was a negotiation with pain, a handshake with mortality.' },
      { type: 'image', src: '/images/Niki_Lauda_-_Ferrari_312T2_heads_towards_the_swimming_pool_complex_at_the_1977_Monaco_GP.jpg', caption: 'Lauda Ferrari 312T2.', layout: 'portrait' },
      { type: 'heading', text: 'Championship as Philosophy' },
      { type: 'paragraph', text: 'The title did not crown the faster man; it crowned the framework. Hunt won the points. Lauda won the argument that bravery is not stupidity. The season wrote itself into F1\'s bones.' }
    ]
  },

  // 3. MASSA 2008
  {
    id: 'massa-2008',
    title: 'The 39-Second Champion',
    subtitle: 'Interlagos, 2008. Felipe Massa crossed the line as the World Champion. Thirty-nine seconds later, history was rewritten in the final corner.',
    year: '2008',
    category: 'Tragedy',
    // Rain, Lights, Blur
    heroImage: '/images/Massa_Brazil_2008.jpg',
    content: [
      { type: 'heading', text: 'Interlagos Weather Front' },
      { type: 'paragraph', text: 'São Paulo hung heavy with rain. The grandstands shook when the engines fired—wet air carrying petrol and electricity. Ferrari red glowed against the slate sky. Men in ponchos banged the hoardings. Mothers covered children\'s ears. The circuit was a lung breathing water.' },
      { type: 'image', src: '/images/Massa_Brazil_2008.jpg', caption: 'Interlagos grid in the rain.', layout: 'landscape' },
      { type: 'paragraph', text: 'Felipe Massa launched clean. Visibility was a rumor, grip a superstition. Through the Senna S, he felt the car bite and release, a heartbeat rhythm under his hands. Each lap cut a groove into the storm.' },
      { type: 'heading', text: 'The Switch' },
      { type: 'paragraph', text: 'On worn slicks, Timo Glock became a question mark. Hamilton, visor speckled with rain, was not chasing a driver—he was chasing a destiny that kept slipping two car lengths ahead. The penultimate corners turned into a courtroom.' },
      { type: 'image', src: '/images/Raikkonen_Brazil_2008.jpg', caption: 'Ferrari cutting through spray.', layout: 'portrait' },
      { type: 'quote', text: 'Is that Glock? Is that Glock going slowly?', author: 'Martin Brundle' },
      { type: 'paragraph', text: 'Massa crossed the line a champion. Thirty-nine seconds later, Hamilton slipped past Glock at the last turn. The garage stopped breathing. The noise collapsed into a single syllable of disbelief.' },
      { type: 'heading', text: 'Dignity' },
      { type: 'paragraph', text: 'On the podium, rain streaked his face like film grain. He beat his chest once, not in anger but in affirmation. The crowd did not chant points; they chanted a name. History measured him not by the trophy but by the manner in which he carried defeat.' },
      { type: 'image', src: '/images/Massa_Brazil_2008_Podium.jpg', caption: 'Massa on the podium, rain and light.', layout: 'full' }
    ]
  },

  // 4. SCHUMACHER ERA
  {
    id: 'schumacher-ferrari',
    title: 'The Red Baron',
    subtitle: 'How Michael Schumacher rebuilt the church of Ferrari and turned it into an empire of efficiency.',
    year: '2000',
    category: 'Dynasty',
    // Red Car, Speed
    heroImage: '/images/Michael_Schumacher_Ferrari_2004.jpg',
    content: [
      { type: 'heading', text: 'Maranello Bells' },
      { type: 'paragraph', text: 'For twenty-one years, the church at Maranello waited. Schumacher did not just win; he reorganised a nation\'s faith into process. Pit stops became liturgy. Monday debriefs, penance.' },
      { type: 'image', src: '/images/Scuderia_Ferrari_F2004.jpg', caption: 'Ferrari F2004 silhouette.', layout: 'landscape' },
      { type: 'paragraph', text: 'He knew how to make a factory listen. Mechanics trained like athletes. Engineers slept with spreadsheets. The car was less a machine than a ritual performed at 18,000 rpm.' },
      { type: 'heading', text: 'Dynasty' },
      { type: 'paragraph', text: 'From 2000 to 2004, the sport bent around a single centre of gravity. The title runs were not inevitable; they were constructed—lap by lap, checklists stacked like bricks.' },
      { type: 'image', src: '/images/Michael_Schumacher_Ferrari_2004.jpg', caption: 'Schumacher era, red dominance.', layout: 'portrait' },
      { type: 'quote', text: 'I’ve always believed that you should never, ever give up and you should always keep fighting even when there’s only the slightest chance.', author: 'Michael Schumacher' },
      { type: 'image', src: '/images/Italian_F1_-_Monza_-_Ank_Kumar_05.jpg', caption: 'The Tifosi at Monza.', layout: 'full' }
    ]
  },

  // 5. SPA 2000
  {
    id: 'hakkinen-schumacher',
    title: 'The Zonta Overtake',
    subtitle: 'Spa-Francorchamps. 200mph. A backmarker in the middle. Two of the greatest drivers in history made a choice.',
    year: '2000',
    category: 'Combat',
    // Eau Rouge / Track vibe
    heroImage: '/images/Mika_Häkkinen_2000_United_States_Grand_Prix.jpg',
    content: [
      { type: 'heading', text: 'Knife Edge' },
      { type: 'paragraph', text: 'Spa is a geography lesson taught with velocity. Häkkinen read Schumacher\'s lines like scripture, waiting for the parishioner to blink.' },
      { type: 'image', src: '/images/Mika_Häkkinen_1.jpg', caption: 'Häkkinen, focus through Eau Rouge.', layout: 'landscape' },
      { type: 'paragraph', text: 'Approaching Zonta, the universe narrowed to three cars and one choice. The tyres drew calligraphy at 300 km/h. Left for Schumacher. Right for Häkkinen.' },
      { type: 'heading', text: 'The Split' },
      { type: 'paragraph', text: 'They passed on either side of a man trying to stay alive. It was not aggression; it was clarity. The move remains a lecture on decision under pressure.' },
      { type: 'image', src: '/images/Michael_Schumacher,_Ferrari_F2001_(8968595731)_(cropped).jpg', caption: 'Schumacher, the constant adversary.', layout: 'portrait' }
    ]
  },

  // 6. HAMILTON 2021
  {
    id: 'hamilton-silverstone',
    title: 'Copse Corner',
    subtitle: 'Lewis Hamilton vs Max Verstappen. A rivalry reaching its boiling point at 180mph on British soil.',
    year: '2021',
    category: 'Modern Era',
    // Carbon fiber, modern tech
    heroImage: '/images/Lewis_Hamilton_on_his_victory_lap_(14634946913).jpg',
    content: [
      { type: 'paragraph', text: 'The collision heard around the world. It wasn\'t just an accident; it was inevitable. Two immovable objects colliding at high velocity.' },
      { type: 'quote', text: 'This is not tennis. This is life and death.', author: 'Toto Wolff' }
    ]
  },

  // 7. CANADA 2011
  {
    id: 'button-canada',
    title: 'The Longest Race',
    subtitle: 'Last place. Punctures. Collisions. Rain delays. And yet, Jenson Button refused to lose.',
    year: '2011',
    category: 'Miracle',
    // Heavy Rain / Wet Asphalt
    heroImage: '/images/2011_Canadian_GP_-_Winner.jpg',
    content: [
      { type: 'heading', text: 'Weather System' },
      { type: 'paragraph', text: 'Montreal became a lake. Radios hissed. Strategy turned into jazz—improvisation with tyres and timing. Button fell to last, and then began the long arithmetic of recovery.' },
      { type: 'image', src: '/images/2011_Canadian_GP_-_Winner.jpg', caption: 'Parc Jean-Drapeau under rain.', layout: 'landscape' },
      { type: 'heading', text: 'The Hunt' },
      { type: 'paragraph', text: 'He absorbed penalties, touched cars, and kept the rhythm. On the final lap, Vettel hesitated. Button did not. The river delivered him to the flag first.' },
      { type: 'image', src: '/images/640px-2011_Canadian_GP_-_Hamilton-Webber.jpg', caption: 'Button, soaked and relentless.', layout: 'portrait' }
    ]
  },

  // 8. FANGIO 1957
  {
    id: 'fangio-nurburgring',
    title: 'The Green Hell',
    subtitle: 'Juan Manuel Fangio was 46 years old. He was racing against boys. He taught them a lesson they would never forget.',
    year: '1957',
    category: 'Myth',
    // Black and White / Vintage
    heroImage: '/images/Maserati_250F_(Juan_Fangio).jpg',
    content: [
      { type: 'heading', text: 'The Pit Gamble' },
      { type: 'paragraph', text: 'The Nürburgring was a cathedral of trees and fear. When the pit stop went wrong, Fangio returned to the track with the sort of silence only great men carry. The car spoke through vibration rather than sound.' },
      { type: 'image', src: '/images/Maserati_250F_at_Goodwood_2010.jpg', caption: 'Maserati 250F lines and muscle.', layout: 'landscape' },
      { type: 'paragraph', text: 'The 250F danced on the edge of the tires. He carved the forest with nine straight lap records, not a fury but a precision—each apex a signature, each exit a threat.' },
      { type: 'heading', text: 'The Chase' },
      { type: 'paragraph', text: 'Hawthorn and Collins were boys sprinting ahead of a storm. Fangio was the weather. In the Karussell, he laid the car on its side, chalk dust and rubber stinging his throat. The crowd felt the air pressure change.' },
      { type: 'image', src: '/images/Maserati_250F_(Juan_Fangio).jpg', caption: 'Fangio and the 250F.', layout: 'portrait' },
      { type: 'quote', text: 'I have never driven that fast before in my life and I don’t think I will ever be able to do it again.', author: 'Juan Manuel Fangio' },
      { type: 'heading', text: 'The Echo' },
      { type: 'paragraph', text: 'When he made the pass, the forest did not explode; it exhaled. Decades later, drivers still speak of the lap as if it were a myth told by campfire. It was not bravado. It was geometry with blood in it.' }
    ]
  },

  // 9. DIJON 1979
  {
    id: 'dijon-1979',
    title: 'The Duel',
    subtitle: 'Villeneuve vs Arnoux. Five laps of wheel-to-wheel chaos that defined respect.',
    year: '1979',
    category: 'Combat',
    heroImage: '/images/640px-Dijon-Prenois1.jpg',
    content: [
      { type: 'heading', text: 'Home Victory, Battle Behind' },
      { type: 'paragraph', text: 'Jabouille\'s Renault won for France and for the turbo. Behind him, Villeneuve and Arnoux wrote a manifesto about courage and control.' },
      { type: 'image', src: '/images/Ferrari_312T4_-_Jody_Scheckter_at_the_1979_Belgian_Grand_Prix,_Zolder_(51632958993).jpg', caption: 'Villeneuve\'s 312T4.', layout: 'landscape' },
      { type: 'paragraph', text: 'They touched wheels, slid off, rejoined, and refused to concede space that did not exist. It was violence without malice; an argument conducted at 200 km/h.' },
      { type: 'image', src: '/images/Renault_RS10,_GIMS_2019,_Le_Grand-Saconnex_(GIMS1205).jpg', caption: 'Arnoux in the RS10.', layout: 'portrait' },
      { type: 'heading', text: 'Respect' },
      { type: 'paragraph', text: 'Villeneuve finished second by two tenths. Arnoux smiled. The crowd understood: sometimes the greatest victory is shared.' }
    ]
  },

  // 10. IMOLA 1994
  {
    id: 'imola-1994',
    title: 'The Black Weekend',
    subtitle: 'Ratzenberger and Senna. Safety re-written in grief at Tamburello.',
    year: '1994',
    category: 'Tragedy',
    heroImage: '/images/Imola_Circuit,_1998_-_Pit_and_main_straight.jpg',
    content: [
      { type: 'heading', text: 'Omen' },
      { type: 'paragraph', text: 'Barrichello flew. Ratzenberger fell. The paddock met in whispers about safety that was decades late. Senna carried the weight like a visible shadow.' },
      { type: 'image', src: '/images/AyrtonSennaMemorialAtImola.jpg', caption: 'Senna memorial, Parco delle Acque Minerali.', layout: 'portrait' },
      { type: 'heading', text: 'Tamburello' },
      { type: 'paragraph', text: 'At lap six, the world changed at a concrete wall. The broadcast did not need words. The sport would never be the same.' },
      { type: 'image', src: '/images/Autodromo_aerea_poster.jpg', caption: 'Imola, old flow, new scars.', layout: 'landscape' },
      { type: 'paragraph', text: 'From that day, safety was not an option; it was a promise. Two names—Roland and Ayrton—are the reason modern drivers get to grow old.' }
    ]
  },

  // 11. BRAWN GP 2009
  {
    id: 'brawn-2009',
    title: 'The Phoenix',
    subtitle: 'From ashes to titles. The improbable geometry of the BGP 001.',
    year: '2009',
    category: 'Miracle',
    heroImage: '/images/640px-Jenson_Button_(Brawn_BGP_001)_on_Sunday_at_2009_Abu_Dhabi_Grand_Prix.jpg',
    content: [
      { type: 'heading', text: 'Buyout and Belief' },
      { type: 'paragraph', text: 'Honda left. Ross Brawn stayed. A Mercedes engine found a home, and a double diffuser found a loophole. The paddock laughed until Australia.' },
      { type: 'image', src: '/images/640px-Jenson_Button_(Brawn_BGP_001)_on_Sunday_at_2009_Abu_Dhabi_Grand_Prix.jpg', caption: 'BGP001 lines, white and neon.', layout: 'portrait' },
      { type: 'heading', text: 'Six of Seven' },
      { type: 'paragraph', text: 'Button won six of the first seven. Barrichello held the centre. By Brazil, a team that should not have existed owned the year.' },
      { type: 'image', src: '/images/Barrichello_2009_British_GP_2.jpg', caption: "Button's 2009 motif.", layout: 'landscape' }
    ]
  }
];
