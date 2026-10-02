/**
 * Short editorial notes for the team DNA section. Keyed by constructor id
 * (the lineage head or any member). Only facts we are sure of; the stage
 * timeline itself (names, years, engines, results) is generated from the F1DB
 * index, so these notes never repeat numbers.
 */

export interface TeamDnaNote {
  en: string;
  tr: string;
}

export const TEAM_DNA_NOTES: Readonly<Record<string, TeamDnaNote>> = {
  ferrari: {
    en: 'Founded by Enzo Ferrari, Scuderia Ferrari is the only team to have entered every Formula 1 World Championship season since the series began in 1950.',
    tr: 'Enzo Ferrari tarafından kurulan Scuderia Ferrari, 1950\'de başlayan Formula 1 Dünya Şampiyonası\'nın her sezonuna katılmış tek takım.',
  },
  mclaren: {
    en: 'Founded by New Zealander Bruce McLaren, the team entered Formula 1 in 1966 and has stayed on the grid ever since.',
    tr: 'Yeni Zelandalı Bruce McLaren tarafından kurulan takım, 1966\'da Formula 1\'e girdi ve o günden beri gridde.',
  },
  williams: {
    en: 'Frank Williams built the team from the ground up. Williams Grand Prix Engineering, formed with designer Patrick Head, began racing in 1978.',
    tr: 'Frank Williams takımı sıfırdan kurdu. Tasarımcı Patrick Head ile kurulan Williams Grand Prix Engineering, 1978\'de yarışmaya başladı.',
  },
  'red-bull': {
    en: 'Jackie Stewart founded Stewart Grand Prix with Ford in 1997. Ford rebranded it as Jaguar Racing in 2000, and Red Bull bought the team at the end of 2004 and raced it as Red Bull Racing from 2005.',
    tr: 'Jackie Stewart, 1997\'de Ford ile Stewart Grand Prix\'yi kurdu. Ford takımı 2000\'de Jaguar Racing\'e dönüştürdü; Red Bull 2004 sonunda takımı satın aldı ve 2005\'ten itibaren Red Bull Racing olarak yarıştırdı.',
  },
  mercedes: {
    en: 'Mercedes-Benz raced as a works team in 1954 and 1955, then left. Today\'s team grew out of Tyrrell, which became British American Racing, then Honda, then Brawn GP, before Mercedes returned as a works team in 2010.',
    tr: 'Mercedes-Benz 1954 ve 1955\'te fabrika takımı olarak yarıştı, sonra ayrıldı. Bugünkü takım Tyrrell\'den doğdu: sırasıyla British American Racing, Honda ve Brawn GP oldu; Mercedes 2010\'da fabrika takımı olarak geri döndü.',
  },
  alpine: {
    en: 'A lineage of reinventions: Toleman became Benetton, then Renault, then Lotus F1, then Renault again, and since 2021 the team races as Alpine, the Renault group\'s sports brand.',
    tr: 'Yeniden doğuşların soyağacı: Toleman, Benetton\'a, ardından Renault\'ya, Lotus F1\'e, tekrar Renault\'ya dönüştü; 2021\'den beri Renault grubunun spor markası Alpine adıyla yarışıyor.',
  },
  'aston-martin': {
    en: 'The team entered Formula 1 as Jordan in 1991, and has since been Midland, Spyker, Force India, Racing Point and, from 2021, Aston Martin.',
    tr: 'Takım Formula 1\'e 1991\'de Jordan olarak girdi; sonrasında Midland, Spyker, Force India, Racing Point oldu ve 2021\'den itibaren Aston Martin adıyla yarışıyor.',
  },
  'racing-bulls': {
    en: 'Minardi\'s small Italian team was bought by Red Bull and became Toro Rosso, then AlphaTauri, RB and Racing Bulls: Red Bull\'s second team.',
    tr: 'Minardi\'nin küçük İtalyan takımı Red Bull tarafından satın alındı ve sırasıyla Toro Rosso, AlphaTauri, RB ve Racing Bulls oldu: Red Bull\'un ikinci takımı.',
  },
  audi: {
    en: 'Sauber entered Formula 1 in 1993, worked with BMW, raced as Alfa Romeo and as Kick Sauber, and became Audi\'s works team in 2026.',
    tr: 'Sauber 1993\'te Formula 1\'e girdi, BMW ile çalıştı, Alfa Romeo ve Kick Sauber adlarıyla yarıştı ve 2026\'da Audi\'nin fabrika takımı oldu.',
  },
  haas: {
    en: 'Founded by American businessman Gene Haas, the team joined the grid in 2016.',
    tr: 'Amerikalı iş insanı Gene Haas tarafından kurulan takım, 2016\'da gridde yerini aldı.',
  },
  cadillac: {
    en: 'General Motors\' Cadillac brand joined as the eleventh team in 2026.',
    tr: 'General Motors\'un Cadillac markası, 2026\'da on birinci takım olarak katıldı.',
  },
  lotus: {
    en: 'Founded by Colin Chapman, Team Lotus raced from 1958 to 1994 and pioneered ideas such as the monocoque chassis and ground effect.',
    tr: 'Colin Chapman tarafından kurulan Team Lotus, 1958\'den 1994\'e kadar yarıştı; monokok şasi ve zemin etkisi gibi fikirlerin öncüsü oldu.',
  },
  tyrrell: {
    en: 'Ken Tyrrell\'s team raced under its own name from 1970 and won titles with Jackie Stewart. Its entry later became British American Racing, Honda, Brawn and Mercedes.',
    tr: 'Ken Tyrrell\'in takımı 1970\'ten itibaren kendi adıyla yarıştı ve Jackie Stewart ile şampiyonluklar kazandı. Takımın lisansı sonradan British American Racing, Honda, Brawn ve Mercedes oldu.',
  },
  brabham: {
    en: 'Founded by three-time champion Jack Brabham and designer Ron Tauranac, Brabham won the 1966 title in a car bearing its founder\'s name.',
    tr: 'Üç kez şampiyon Jack Brabham ve tasarımcı Ron Tauranac tarafından kurulan Brabham, 1966 şampiyonluğunu kurucusunun adını taşıyan bir araçla kazandı.',
  },
  cooper: {
    en: 'Cooper\'s mid-engined cars changed the shape of Grand Prix racing and won both championships in 1959 and 1960.',
    tr: 'Cooper\'ın orta motorlu araçları Grand Prix yarışının şeklini değiştirdi ve 1959 ile 1960\'ta iki şampiyonluğu da kazandı.',
  },
  vanwall: {
    en: 'Tony Vandervell\'s Vanwall won the first Constructors\' Championship in 1958.',
    tr: 'Tony Vandervell\'in Vanwall\'ı, 1958\'de ilk Markalar Şampiyonası\'nı kazandı.',
  },
  matra: {
    en: 'The French team won the 1969 championship with Jackie Stewart, in cars run by Ken Tyrrell.',
    tr: 'Fransız takım, Ken Tyrrell\'in işlettiği araçlarla 1969 şampiyonluğunu Jackie Stewart ile kazandı.',
  },
  maserati: {
    en: 'Maserati raced in Formula 1 from 1950 to 1960 and carried Juan Manuel Fangio to his 1957 title.',
    tr: 'Maserati 1950\'den 1960\'a kadar Formula 1\'de yarıştı ve Juan Manuel Fangio\'yu 1957 şampiyonluğuna taşıdı.',
  },
};
