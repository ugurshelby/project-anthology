# E2E Tests (Playwright)

Bu klasör, Playwright kullanılarak yazılmış End-to-End (E2E) testlerini içerir.

## Neden E2E Testleri Kritik?

Bu proje sinematik animasyonlar ve Framer Motion geçişleri üzerine kurulu. Unit testler (Vitest) kodun doğru çalıştığını kontrol eder, ancak:

- **Animasyonların gerçek tarayıcılarda çalışıp çalışmadığını** test edemez
- **Farklı cihaz/tarayıcı kombinasyonlarında** sorunları yakalayamaz
- **Kullanıcı flow'larının** tam olarak çalıştığını doğrulayamaz
- **Performans sorunlarını** (layout shifts, animation jank) tespit edemez

E2E testler bu eksiklikleri kapatır ve production'da sorun çıkmasını önler.

## Test Dosyaları

### `navigation.spec.ts`
- Navigation flow testleri (Timeline, Gallery, News)
- Menu açma/kapama
- Logo ile home'a dönme

### `story-modal.spec.ts`
- Story modal açma/kapama
- Modal animasyonları
- Progress bar
- Story navigation (arrow keys)
- Body scroll lock

### `animations.spec.ts`
- Framer Motion animasyon testleri
- Modal open/close animasyonları
- Menu animasyonları
- Progress bar animasyonları
- Reduced motion desteği

### `keyboard-shortcuts.spec.ts`
- Keyboard navigation
- Escape key (close modals)
- Arrow keys (navigate stories)
- Space, Home, End keys
- Question mark (shortcuts modal)

### `image-loading.spec.ts`
- Lazy loading
- Image preloading
- Responsive images
- Error handling
- Loading states (shimmer)

### `scroll-behavior.spec.ts`
- Virtual scrolling
- Infinite scroll loading
- Smooth scroll behavior
- Scroll position persistence

## Çalıştırma

### Tüm testleri çalıştır
```bash
npm run test:e2e
```

### UI modunda çalıştır (interaktif)
```bash
npm run test:e2e:ui
```

### Debug modunda çalıştır
```bash
npm run test:e2e:debug
```

### Headed modda çalıştır (tarayıcı görünür)
```bash
npm run test:e2e:headed
```

### Belirli bir test dosyasını çalıştır
```bash
npx playwright test e2e/story-modal.spec.ts
```

### Belirli bir tarayıcıda çalıştır
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Mobile viewport'ta çalıştır
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## CI/CD Entegrasyonu

GitHub Actions workflow'u (`.github/workflows/e2e-tests.yml`) otomatik olarak:
- Her push ve PR'da testleri çalıştırır
- Test sonuçlarını raporlar
- Başarısız testlerin screenshot ve video'larını yükler

## Test Stratejisi

### Kritik User Flow'lar
1. **Story Modal Flow**: Kullanıcı bir story'yi açıp kapatabilmeli
2. **Navigation Flow**: Tüm sayfalar arasında gezinme çalışmalı
3. **Keyboard Shortcuts**: Tüm kısayollar çalışmalı
4. **Animations**: Animasyonlar sorunsuz çalışmalı

### Tarayıcı/Device Coverage
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Android), Safari (iOS)
- Tablet: iPad Pro

### Performance Checks
- Animasyonlar 60fps'de çalışmalı
- Layout shifts olmamalı
- Image loading optimize olmalı

## Best Practices

1. **Test Isolation**: Her test bağımsız çalışmalı
2. **Wait Strategies**: `waitForLoadState`, `waitForTimeout` kullan
3. **Selectors**: Stable selector'lar kullan (data-testid tercih edilir)
4. **Timeouts**: Animasyonlar için yeterli timeout ver
5. **Error Handling**: Graceful degradation test et

## Troubleshooting

### Testler çok yavaş
- `workers` sayısını artır (local'de)
- Gereksiz `waitForTimeout`'ları kaldır
- Test'leri paralel çalıştır

### Testler flaky (bazen başarısız)
- Timeout'ları artır
- `waitForLoadState('networkidle')` kullan
- Animasyonlar için daha uzun bekleme süreleri

### Screenshot/Video görünmüyor
- `playwright.config.ts`'de `screenshot` ve `video` ayarlarını kontrol et
- CI'da artifact upload'ı kontrol et

## Gelecek İyileştirmeler

- [ ] Visual regression testing (screenshot comparison)
- [ ] Performance testing (Lighthouse integration)
- [ ] Accessibility testing (axe-core integration)
- [ ] Cross-browser testing (Sauce Labs/BrowserStack)
