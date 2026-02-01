// Normalized image path mappings
// Converts complex filenames to clean, URL-safe paths
// Handles special characters, spaces, and case-sensitivity issues

export const normalizeImagePath = (filename: string): string => {
  if (!filename) return '';
  
  // Remove leading slash if present
  let normalized = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // Replace spaces, underscores, and special characters with hyphens
  normalized = normalized
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/_/g, '-')             // Underscores to hyphens
    .replace(/[()]/g, '')           // Remove parentheses
    .replace(/[&]/g, 'and')         // & to 'and'
    .replace(/[,]/g, '')             // Remove commas
    .replace(/[àáâãäå]/gi, 'a')     // Normalize accented characters
    .replace(/[èéêë]/gi, 'e')
    .replace(/[ìíîï]/gi, 'i')
    .replace(/[òóôõö]/gi, 'o')
    .replace(/[ùúûü]/gi, 'u')
    .replace(/[ç]/gi, 'c')
    .replace(/[ñ]/gi, 'n')
    .replace(/[ä]/gi, 'a')
    .replace(/[ö]/gi, 'o')
    .replace(/[ü]/gi, 'u')
    .replace(/-+/g, '-')            // Multiple hyphens to single
    .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens
    .toLowerCase();                  // Convert to lowercase
  
  return `/${normalized}`;
};

// Image path mapping: old path -> normalized path
export const imagePathMap: Record<string, string> = {
  '/1988_McLaren-Honda_MP4_4_Goodwood,_2009.jpeg': '/1988-mclaren-honda-mp4-4-goodwood-2009.jpeg',
  '/James_Hunt_-_Dutch_GP_1976.jpg': '/james-hunt-dutch-gp-1976.jpg',
  '/Massa_Brazil_2008.jpg': '/massa-brazil-2008.jpg',
  '/Michael_Schumacher_Ferrari_2004.jpg': '/michael-schumacher-ferrari-2004.jpg',
  '/Mika_Häkkinen_2000_United_States_Grand_Prix.jpg': '/mika-hakkinen-2000-united-states-grand-prix.jpg',
  '/Lewis_Hamilton_on_his_victory_lap_(14634946913).jpg': '/lewis-hamilton-on-his-victory-lap-14634946913.jpg',
  '/2011_Canadian_GP_-_Winner.jpg': '/2011-canadian-gp-winner.jpg',
  '/Maserati_250F_(Juan_Fangio).jpg': '/maserati-250f-juan-fangio.jpg',
  '/640px-Dijon-Prenois1.jpg': '/640px-dijon-prenois1.jpg',
  '/Imola_Circuit,_1998_-_Pit_and_main_straight.jpg': '/imola-circuit-1998-pit-and-main-straight.jpg',
  '/640px-Jenson_Button_(Brawn_BGP_001)_on_Sunday_at_2009_Abu_Dhabi_Grand_Prix.jpg': '/640px-jenson-button-brawn-bgp-001-on-sunday-at-2009-abu-dhabi-grand-prix.jpg',
  '/Ayrton_Senna_1988_Canada.jpg': '/ayrton-senna-1988-canada.jpg',
  '/Niki_Lauda_-_Ferrari_312T2_heads_towards_the_swimming_pool_complex_at_the_1977_Monaco_GP.jpg': '/niki-lauda-ferrari-312t2-heads-towards-the-swimming-pool-complex-at-the-1977-monaco-gp.jpg',
  '/Raikkonen_Brazil_2008.jpg': '/raikkonen-brazil-2008.jpg',
  '/Massa_Brazil_2008_Podium.jpg': '/massa-brazil-2008-podium.jpg',
  '/Scuderia_Ferrari_F2004.jpg': '/scuderia-ferrari-f2004.jpg',
  '/Italian_F1_-_Monza_-_Ank_Kumar_05.jpg': '/italian-f1-monza-ank-kumar-05.jpg',
  '/Mika_Häkkinen_1.jpg': '/mika-hakkinen-1.jpg',
  '/Michael_Schumacher,_Ferrari_F2001_(8968595731)_(cropped).jpg': '/michael-schumacher-ferrari-f2001-8968595731-cropped.jpg',
  '/640px-2011_Canadian_GP_-_Hamilton-Webber.jpg': '/640px-2011-canadian-gp-hamilton-webber.jpg',
  '/Maserati_250F_at_Goodwood_2010.jpg': '/maserati-250f-at-goodwood-2010.jpg',
  '/Ferrari_312T4_-_Jody_Scheckter_at_the_1979_Belgian_Grand_Prix,_Zolder_(51632958993).jpg': '/ferrari-312t4-jody-scheckter-at-the-1979-belgian-grand-prix-zolder-51632958993.jpg',
  '/Renault_RS10,_GIMS_2019,_Le_Grand-Saconnex_(GIMS1205).jpg': '/renault-rs10-gims-2019-le-grand-saconnex-gims1205.jpg',
  '/AyrtonSennaMemorialAtImola.jpg': '/ayrton-senna-memorial-at-imola.jpg',
  '/Autodromo_aerea_poster.jpg': '/autodromo-aerea-poster.jpg',
  '/Barrichello_2009_British_GP_2.jpg': '/barrichello-2009-british-gp-2.jpg',
};

// Get normalized path (fallback to original if not in map)
export const getImagePath = (originalPath: string): string => {
  if (!originalPath) return '';
  const normalized = imagePathMap[originalPath] || normalizeImagePath(originalPath);
  return normalized;
};
