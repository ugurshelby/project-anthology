/**
 * Optimized Image Path Resolver
 * 
 * Maps original image filenames to optimized PNG files in layout-specific folders.
 * Images are numbered 1-40 based on their order in IMAGE_INVENTORY.md
 * Supports Cloudinary CDN integration when configured via VITE_CLOUDINARY_CLOUD_NAME
 */

import { getCDNImageURL, isCDNEnabled } from './imageCDN';
import { logger } from './logger';

// Image number mapping based on user-provided descriptions
// Format: original filename -> image number (1-21)
// Görsel açıklamalarına göre eşleştirme:
// 1: Ayrton Senna McLaren MP4/4 (1988)
// 2: James Hunt 1976 şampiyonluk kupası
// 3: Niki Lauda'nın 1970'lerdeki Ferrari 312T serisiyle pistteki mücadelesi
// 4: Felipe Massa'nın 2008 Brezilya GP'de şampiyonluğu kaybettiği anın podyumdaki hüzünlü yansıması
// 5: Kimi Räikkönen Ferrari F2008
// 6: Felipe Massa 2008 Brezilya GP podyumu
// 7: Schumacher döneminin simgeleri olan Ferrari F2002 ve F2004 araçlarının sergilendiği retrospektif
// 8: Michael Schumacher'in 2000'li yılların başındaki mutlak dominasyonunu yansıtan pist üstü sürüşü
// 9: Michael Schumacher'in 1996 İspanya GP zaferi; Ferrari ile kazandığı ilk yağmur altındaki efsanevi birincilik podyumu
// 10: Mika Häkkinen Mercedes-Benz "Silver Arrow"
// 11: Michael Schumacher Ferrari (2000-2004)
// 12: Jenson Button McLaren-Mercedes (2011-2012)
// 13: Vettel ve McLaren yağmur altında
// 14: Maserati 250F (1950'ler)
// 15: Fangio ve Maserati 250F
// 16: Gilles Villeneuve Ferrari 312T
// 17: Rene Arnoux Renault RS10
// 18: Ayrton Senna Imola anıtı
// 19: Mugello pisti kuş bakışı
// 20: Jenson Button Brawn BGP 001
// 21: Brawn GP neon yeşili detayları
// 22: Lewis Hamilton'ın 2021 Silverstone GP'deki zaferi; Hamilton-Verstappen çarpışması sonrası zafer turu
// 23: Michael Schumacher Benetton B194 Spain 1994 (Ana Aksiyon)
// 24: Schumacher Spain 1994 cockpit steering wheel (Detay/Vibe)
// 25: Benetton B194 flames exhaust Spain 1994 (Teknik Estetik)
// 26: Peter Collins Juan Manuel Fangio Monza 1956 (İkonik Kare)
// 27: Ferrari D50 Monza 1956 track action (Tarihi Doku)
// 28: Collins giving car to Fangio 1956 archive (Anlatı Odaklı)
// 29: Monaco GP 1982 final lap chaos (Geniş Açı)
// 30: Riccardo Patrese Brabham Monaco 1982 win (Kutlama)
// 31: Didier Pironi Ferrari Monaco 1982 stalled (Dram)
// 32: Villeneuve Schumacher Frentzen 1:21.072 timing (Matematiksel Kanıt)
// 33: Schumacher Villeneuve Jerez 1997 crash contact (Kritik An)
// 34: Jacques Villeneuve Williams 1997 Jerez celebration (Sonuç)
// 35: Ayrton Senna Donington 1993 rain opening lap (Atmosferik)
// 36: Senna McLaren MP4/8 Donington water spray (Görsel Şölen)
// 37: Ayrton Senna Donington 1993 Sonic trophy (Kült Detay)
// 38: Jaguar Monaco 2004 diamond nose (Publicity Stunt)
// 39: Jaguar Monaco 2004 Klien Loews crash (Impact)
// 40: Jaguar Monaco 2004 lost diamond / mystery (Mystery)
const imageNumberMap: Record<string, number> = {
  // Kapak görselleri ve hikaye içi görseller (duplicate key'ler kaldırıldı)
  '/1988_McLaren-Honda_MP4_4_Goodwood,_2009.jpeg': 1, // senna-monaco: Ayrton Senna McLaren MP4/4
  '/Ayrton_Senna_1988_Canada.jpg': 1, // senna-monaco: Ayrton Senna McLaren MP4/4 (kapak ile aynı)
  '/James_Hunt_-_Dutch_GP_1976.jpg': 2, // hunt-lauda: James Hunt 1976 şampiyonluk
  '/Niki_Lauda_-_Ferrari_312T2_heads_towards_the_swimming_pool_complex_at_the_1977_Monaco_GP.jpg': 3, // hunt-lauda: Niki Lauda'nın Ferrari 312T serisiyle mücadelesi
  '/Massa_Brazil_2008_Podium.jpg': 4, // massa-2008: Felipe Massa'nın şampiyonluğu kaybettiği anın podyumdaki hüzünlü yansıması
  '/Raikkonen_Brazil_2008.jpg': 5, // massa-2008: Kimi Räikkönen Ferrari F2008
  '/Massa_Brazil_2008.jpg': 6, // massa-2008: Felipe Massa 2008 Brezilya GP podyumu
  '/Scuderia_Ferrari_F2004.jpg': 7, // schumacher-ferrari: Ferrari F2002 ve F2004 retrospektif
  '/Michael_Schumacher_Ferrari_2004.jpg': 8, // schumacher-ferrari: Michael Schumacher'in mutlak dominasyonu
  '/Michael_Schumacher,_Ferrari_F2001_(8968595731)_(cropped).jpg': 8, // hakkinen-schumacher: Michael Schumacher (8 numaralı görselin farklı açısı)
  '/Italian_F1_-_Monza_-_Ank_Kumar_05.jpg': 9, // schumacher-ferrari: Michael Schumacher'in 1996 İspanya GP zaferi (Ferrari ile ilk yağmur altındaki birincilik podyumu)
  '/Mika_Häkkinen_2000_United_States_Grand_Prix.jpg': 10, // hakkinen-schumacher: Mika Häkkinen Mercedes-Benz
  '/Mika_Häkkinen_1.jpg': 10, // hakkinen-schumacher: Mika Häkkinen (kapak ile aynı)
  '/2011_Canadian_GP_-_Winner.jpg': 12, // button-canada: Jenson Button McLaren-Mercedes
  '/640px-2011_Canadian_GP_-_Hamilton-Webber.jpg': 13, // button-canada: Vettel ve McLaren yağmur altında
  '/Maserati_250F_at_Goodwood_2010.jpg': 14, // fangio-nurburgring: Maserati 250F (1950'ler)
  '/Maserati_250F_(Juan_Fangio).jpg': 15, // fangio-nurburgring: Fangio ve Maserati 250F
  '/640px-Dijon-Prenois1.jpg': 16, // dijon-1979: Gilles Villeneuve Ferrari 312T
  '/Ferrari_312T4_-_Jody_Scheckter_at_the_1979_Belgian_Grand_Prix,_Zolder_(51632958993).jpg': 16, // dijon-1979: Gilles Villeneuve Ferrari 312T (kapak ile aynı)
  '/Renault_RS10,_GIMS_2019,_Le_Grand-Saconnex_(GIMS1205).jpg': 17, // dijon-1979: Rene Arnoux Renault RS10
  '/AyrtonSennaMemorialAtImola.jpg': 18, // imola-1994: Ayrton Senna Imola anıtı
  '/Autodromo_aerea_poster.jpg': 19, // imola-1994: Mugello pisti kuş bakışı
  '/640px-Jenson_Button_(Brawn_BGP_001)_on_Sunday_at_2009_Abu_Dhabi_Grand_Prix.jpg': 20, // brawn-2009: Jenson Button Brawn BGP 001
  '/Barrichello_2009_British_GP_2.jpg': 21, // brawn-2009: Brawn GP neon yeşili detayları
  '/Lewis_Hamilton_on_his_victory_lap_(14634946913).jpg': 22, // hamilton-silverstone: Lewis Hamilton'ın 2021 Silverstone GP'deki zaferi (Hamilton-Verstappen çarpışması sonrası zafer turu)
  '/Schumacher_Benetton_B194.jpg': 23, // schumacher-1994-spain: Michael Schumacher Benetton B194 Spain 1994 (Ana Aksiyon)
  '/Schumacher_Spain_1994_cockpit.jpg': 24, // schumacher-1994-spain: Schumacher Spain 1994 cockpit steering wheel (Detay/Vibe)
  '/Benetton_B194_exhaust.jpg': 25, // schumacher-1994-spain: Benetton B194 flames exhaust Spain 1994 (Teknik Estetik)
  '/Collins_Fangio_Monza_1956.jpg': 26, // collins-fangio-1956: Peter Collins Juan Manuel Fangio Monza 1956 (İkonik Kare)
  '/Ferrari_D50_Monza_1956.jpg': 27, // collins-fangio-1956: Ferrari D50 Monza 1956 track action (Tarihi Doku)
  '/Collins_giving_car_Fangio_1956.jpg': 28, // collins-fangio-1956: Collins giving car to Fangio 1956 archive (Anlatı Odaklı)
  '/Monaco_GP_1982_Patrese.jpg': 29, // monaco-1982: Monaco GP 1982 final lap chaos (Geniş Açı)
  '/Patrese_Brabham_Monaco_1982.jpg': 30, // monaco-1982: Riccardo Patrese Brabham Monaco 1982 win (Kutlama)
  '/Pironi_Ferrari_Monaco_1982.jpg': 31, // monaco-1982: Didier Pironi Ferrari Monaco 1982 stalled (Dram)
  '/Villeneuve_Schumacher_Jerez_1997.jpg': 32, // jerez-1997: Villeneuve Schumacher Frentzen 1:21.072 timing (Matematiksel Kanıt)
  '/Schumacher_Villeneuve_Jerez_crash.jpg': 33, // jerez-1997: Schumacher Villeneuve Jerez 1997 crash contact (Kritik An)
  '/Villeneuve_Williams_Jerez_1997.jpg': 34, // jerez-1997: Jacques Villeneuve Williams 1997 Jerez celebration (Sonuç)
  '/Senna_Donington_1993_Rain.jpg': 35, // senna-donington-1993: Ayrton Senna Donington 1993 rain opening lap (Atmosferik)
  '/Senna_MP4_8_Donington_spray.jpg': 36, // senna-donington-1993: Senna McLaren MP4/8 Donington water spray (Görsel Şölen)
  '/Senna_Donington_1993_trophy.jpg': 37, // senna-donington-1993: Ayrton Senna Donington 1993 Sonic trophy (Kült Detay)
  '/Jaguar_Monaco_2004_diamond.jpg': 38, // jaguar-monaco-diamond: Jaguar R5 nose with Steinmetz diamond (Publicity Stunt)
  '/Jaguar_Monaco_2004_Klien_crash.jpg': 39, // jaguar-monaco-diamond: Christian Klien Loews crash (Impact)
  '/Jaguar_Monaco_2004_diamond_lost.jpg': 40, // jaguar-monaco-diamond: Lost diamond mystery (Mystery)
};

// Folder paths for different layouts – story görselleri images/stories altında
const folderPaths = {
  full: 'stories/Full 1280x720',
  landscape: 'stories/Landscape 1280x720',
  portrait: 'stories/Portrait 1280x1707',
  hero: 'stories/Landscape 1280x720',
};

/**
 * Get optimized image path based on original filename and layout
 * @param originalPath Original image path (e.g., '/image.jpg')
 * @param layout Layout type: 'full' | 'landscape' | 'portrait' | 'hero'
 * @param isMobile Deprecated - kept for compatibility but no longer used
 * @returns Optimized PNG image path (CDN URL if enabled, otherwise local path)
 */
export const getOptimizedImagePath = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape',
  isMobile?: boolean
): string => {
  const imageNumber = imageNumberMap[originalPath];
  
  if (!imageNumber) {
    // Fallback to original path if not found in map
    logger.warn(`Image not found in map: ${originalPath}`);
    return originalPath;
  }

  const folder = folderPaths[layout];
  const localPath = `/images/${folder}/${imageNumber}.png`;
  
  // Use CDN if enabled, otherwise return local path
  if (isCDNEnabled()) {
    // Determine width based on layout
    let width: number;
    switch (layout) {
      case 'portrait':
        width = 1280;
        break;
      case 'full':
      case 'landscape':
      case 'hero':
      default:
        width = 1280;
        break;
    }
    
    return getCDNImageURL(localPath, {
      width,
      format: 'auto',
      quality: 85,
    });
  }
  
  return localPath;
};

/**
 * Get mobile version of optimized image
 */
export const getMobileOptimizedImage = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape'
): string => {
  return getOptimizedImagePath(originalPath, layout, true);
};

/**
 * Get desktop version of optimized image
 */
export const getDesktopOptimizedImage = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape'
): string => {
  return getOptimizedImagePath(originalPath, layout, false);
};

/**
 * Generate responsive srcSet for an image
 * Returns srcSet string with multiple sizes for different screen densities
 */
export const getResponsiveSrcSet = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape'
): string => {
  const imageNumber = imageNumberMap[originalPath];
  if (!imageNumber) return '';

  const folder = folderPaths[layout];
  const basePath = `/images/${folder}/${imageNumber}.png`;

  if (isCDNEnabled()) {
    // Use CDN with responsive sizes
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map((width) => {
        const url = getCDNImageURL(basePath, {
          width,
          format: 'auto', // Auto format (WebP/AVIF based on browser)
          quality: 85,
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  // Local images: return single size (responsive images handled by browser)
  return `${basePath} 1280w`;
};

/**
 * Get image with AVIF support (modern browsers)
 * Returns object with src, srcSet, and sizes attributes
 */
export const getResponsiveImageAttributes = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape'
): {
  src: string;
  srcSet?: string;
  sizes?: string;
} => {
  const src = getDesktopOptimizedImage(originalPath, layout);
  const srcSet = getResponsiveSrcSet(originalPath, layout);

  // Determine sizes attribute based on layout
  let sizes: string;
  switch (layout) {
    case 'portrait':
      sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
      break;
    case 'full':
      sizes = '100vw';
      break;
    case 'landscape':
    case 'hero':
    default:
      sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1280px';
      break;
  }

  return {
    src,
    srcSet: srcSet || undefined,
    sizes,
  };
};

/**
 * Generate AVIF srcSet for modern browsers
 * Returns srcSet string with AVIF format support
 */
export const getAVIFSrcSet = (
  originalPath: string,
  layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape'
): string => {
  const imageNumber = imageNumberMap[originalPath];
  if (!imageNumber) return '';

  const folder = folderPaths[layout];
  const basePath = `/images/${folder}/${imageNumber}.png`;

  if (isCDNEnabled()) {
    // Use CDN with AVIF format
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map((width) => {
        const url = getCDNImageURL(basePath, {
          width,
          format: 'avif', // AVIF format for modern browsers
          quality: 80, // Slightly lower quality for AVIF (better compression)
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  // Local images: return empty (AVIF conversion would need build-time processing)
  return '';
};
