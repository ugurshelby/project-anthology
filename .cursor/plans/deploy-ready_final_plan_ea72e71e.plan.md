# Deploy Öncesi Kontrol – Tamamlandı

## Genel Kontrol Sonucu

| Kontrol | Durum |
|--------|--------|
| Production build | ✅ Başarılı (~29s) |
| Unit testler (Vitest) | ✅ 41 geçti, 1 skip (timeout testi) |
| Lint | ✅ Hata yok |
| Eski referanslar (ambient, teams, teamUtils) | ✅ Temiz |

**Sonuç:** Proje deploy için hazır.

---

## Deploy Adımları (Vercel)

### 1. Repo ve Vercel

1. Değişiklikleri commit edip GitHub’a pushlayın.
2. [Vercel Dashboard](https://vercel.com/dashboard) → **New Project** → GitHub repo’nuzu seçin.
3. Vercel otomatik algılar: **Build Command** `npm run build`, **Output** `dist`.

### 2. Ortam Değişkenleri (opsiyonel)

- `VITE_CLOUDINARY_CLOUD_NAME` – Cloudinary (opsiyonel)
- `VITE_SENTRY_DSN` – Sentry (opsiyonel)
- `VITE_DEBUG` – `false` (opsiyonel)

### 3. Deploy

- **Deploy** butonuna tıklayın; build biter bitmez canlı URL verilir.
- `vercel.json` zaten ayarlı: SPA rewrite, güvenlik header’ları, cache.

### 4. Build Komutu

Vercel’de build komutu:

```bash
npm run build
```

Bu komut sırayla `images:gen`, `images:optimize-story-38-40` ve `vite build` çalıştırır.

### 5. Özel Domain (isterseniz)

Vercel: Project Settings → Domains → kendi domain’inizi ekleyin.

---

## Notlar

- **Favicon:** `/images/favicon.ico` ve `/images/favicon.svg` kullanılıyor; `public/images/` içinde olmalı.
- **Story görselleri:** `public/images/` altında Full, Landscape, Portrait klasörleri kullanılıyor.
- **E2E:** İsterseniz deploy sonrası `npm run test:e2e` ile production URL’e karşı da çalıştırabilirsiniz.

Detaylı adımlar için: `DEPLOYMENT.md`.
