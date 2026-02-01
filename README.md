<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Project Anthology: The F1 Narrative

Sinematik, editoryal bir Formula 1 tarihi keşfi. Arşiv hikayeleri, galeri, zaman çizelgesi ve haber bölümü ile tek sayfa uygulama.

## Gereksinimler

- **Node.js** (v18+ önerilir)

## Yerelde Çalıştırma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. (Opsiyonel) Ortam değişkenleri için [.env.example](.env.example) dosyasını `.env` olarak kopyalayıp düzenleyin.
3. Geliştirme sunucusunu başlatın (API + Vite birlikte; haber sayfası için gerekli):
   ```bash
   npm run dev
   ```
   Sadece frontend: `npm run dev:vite`

## Test

```bash
# Birim testleri (Vitest)
npm run test:run

# E2E testleri (Playwright)
npm run test:e2e

# Tüm testler + birleşik rapor
npm run test:all:report
```

Detaylı raporlama için [TEST_REPORTING_GUIDE.md](TEST_REPORTING_GUIDE.md) kılavuzuna bakın.

## Build

```bash
# Production build
npm run build

# Build + bundle size kontrolü
npm run build:check
```

## Deploy

Production deploy adımları, ortam değişkenleri ve post-deploy checklist için **[DEPLOYMENT.md](DEPLOYMENT.md)** kılavuzuna bakın.
