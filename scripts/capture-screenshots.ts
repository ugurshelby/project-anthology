/**
 * Apex (Project Anthology) — Otomatik Arayüz Ekran Görüntüsü Yakalama Motoru
 *
 * Sitenin temsilci şablon sayfalarını (desktop, tablet, mobile) gezerek:
 * 1. Lazy-loading ve .bento-deferred elemanlarını otomatik scroll ile tetikler.
 * 2. Tüm görsellerin indirilmesini ve render olmasını bekler.
 * 3. 'screenshots/<sayfa>/<cihaz>-viewport.png' ve '<cihaz>-full.png' olarak kaydeder.
 *
 * Kullanım:
 *   npm run screenshots
 *   npx tsx scripts/capture-screenshots.ts
 *   npx tsx scripts/capture-screenshots.ts http://localhost:3000
 */

import { chromium, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PROD_SITE_URL } from '../lib/data/siteUrl';

const BASE_URL = process.env.BASE_URL || process.argv[2] || PROD_SITE_URL;
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots');

const DEVICES = [
  {
    name: 'desktop',
    width: 1440,
    height: 900,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: 'tablet',
    width: 768,
    height: 1024,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  },
] as const;

const PAGES = [
  { id: '01-ana-sayfa', path: '/tr', label: 'Ana Sayfa (Hero & Son Durum)' },
  { id: '02-grid-2026', path: '/tr/grid', label: '2026 Grid (11 Takım 22 Pilot)' },
  { id: '03-pilotlar-listesi', path: '/tr/drivers', label: 'Pilotlar Dizini' },
  { id: '04-pilot-detay-alonso', path: '/tr/drivers/alonso', label: 'Pilot Detay (Fernando Alonso)' },
  { id: '05-takimlar-listesi', path: '/tr/teams', label: 'Takımlar Dizini' },
  { id: '06-takim-detay-ferrari', path: '/tr/teams/ferrari', label: 'Takım Detay (Scuderia Ferrari)' },
  { id: '07-pistler-listesi', path: '/tr/circuits', label: 'Pistler Dizini (Apple Fluid Kartlar)' },
  { id: '08-pist-detay-monza', path: '/tr/circuits/monza', label: 'Pist Detay & Telemetri (Monza)' },
  { id: '09-sezon-2026', path: '/tr/season/2026', label: '2026 Sezon Takvimi & Puan Durumu' },
  { id: '10-sezon-2024-tarihce', path: '/tr/season/2024', label: '2024 Tarihçe Sezon Detayı' },
  { id: '11-haberler-akisi', path: '/tr/news', label: 'Haberler Akışı' },
  { id: '12-hikayeler-arsivi', path: '/tr/anthology', label: 'Anthology Hikayeler Listesi' },
  { id: '13-hikaye-detay-senna', path: '/tr/anthology/senna-monaco', label: 'Hikaye Detay (Senna Monaco 1988)' },
  { id: '14-ikonik-araclar', path: '/tr/machinery', label: 'Machinery İkonik Araçlar Dizini' },
  { id: '15-arac-detay-mp4-4', path: '/tr/machinery/mclaren-mp4-4', label: 'Araç Detay (McLaren MP4/4)' },
  { id: '16-teknik-sozluk', path: '/tr/tech-glossary', label: 'Teknik F1 Sözlüğü' },
];

/**
 * Sayfanın baştan aşağı tüm resimlerinin ve deferred içeriklerinin yüklenmesini garantiler.
 */
async function ensurePageFullyLoaded(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');

  try {
    // 6 saniyeye kadar ağ sessizliği bekle (canlı sayaç/telemetri varsa aşarsa sorun değil)
    await page.waitForLoadState('networkidle', { timeout: 6000 });
  } catch {
    // Timeout durumunda devam et
  }

  // 1. Kademeli aşağı kaydırma (Lazy load ve .bento-deferred tetiklemesi)
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let currentPosition = 0;
      const step = 350;
      const timer = setInterval(() => {
        const maxScroll = document.body.scrollHeight;
        window.scrollBy(0, step);
        currentPosition += step;

        if (currentPosition >= maxScroll) {
          clearInterval(timer);
          resolve();
        }
      }, 70);
    });
  });

  // 2. DOM'daki tüm <img> etiketlerinin indirildiğini doğrula
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((res) => {
          img.addEventListener('load', () => res(), { once: true });
          img.addEventListener('error', () => res(), { once: true });
          setTimeout(() => res(), 2500); // Maksimum 2.5 sn fallback
        });
      })
    );
  });

  // 3. En üste geri dön ve animasyonların yerleşmesini bekle
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`📸 Apex Ekran Görüntüsü Yakalama Başlatılıyor`);
  console.log(`🌐 Hedef Host: ${BASE_URL}`);
  console.log(`📁 Kayıt Klasörü: ${OUTPUT_DIR}`);
  console.log(`📄 Temsilci Sayfa Sayısı: ${PAGES.length}`);
  console.log(`📱 Cihazlar: ${DEVICES.map((d) => d.name).join(', ')}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  let totalCaptured = 0;
  const startTime = Date.now();

  try {
    for (const pageItem of PAGES) {
      const pageDir = path.join(OUTPUT_DIR, pageItem.id);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }

      console.log(`\n🔍 [${pageItem.id}] ${pageItem.label}`);
      const targetUrl = `${BASE_URL.replace(/\/$/, '')}${pageItem.path}`;

      for (const device of DEVICES) {
        process.stdout.write(`   └─ 📱 ${device.name.padEnd(8)} (${device.width}x${device.height})... `);

        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height },
          isMobile: device.isMobile,
          hasTouch: device.hasTouch,
          userAgent: device.isMobile
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            : undefined,
        });

        const page = await context.newPage();

        try {
          const response = await page.goto(targetUrl, {
            waitUntil: 'commit',
            timeout: 30000,
          });
          if (!response || response.status() >= 400) {
            throw new Error(`HTTP ${response?.status() ?? 'yok'}: ${targetUrl}`);
          }

          // Akıllı yükleme & lazy load beklemesi
          await ensurePageFullyLoaded(page);

          // 1. Viewport (İlk Ekran) Yakalama
          const viewportPath = path.join(pageDir, `${device.name}-viewport.png`);
          await page.screenshot({
            path: viewportPath,
            fullPage: false,
          });

          // 2. Full-Page (Tüm Sayfa Baştan Aşağı) Yakalama
          const fullPath = path.join(pageDir, `${device.name}-full.png`);
          await page.screenshot({
            path: fullPath,
            fullPage: true,
          });

          process.stdout.write(`✅ Kaydedildi (Viewport & Full)\n`);
          totalCaptured += 2;
        } catch (error) {
          process.stdout.write(`❌ Hata: ${(error as Error).message}\n`);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n======================================================`);
  console.log(`🎉 Tamamlandı!`);
  console.log(`📸 Toplam Kaydedilen Görsel: ${totalCaptured}`);
  console.log(`⏱️ Süre: ${durationSec} saniye`);
  console.log(`📂 Klasör Yolu: ${OUTPUT_DIR}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
