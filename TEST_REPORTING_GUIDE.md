# Test Sonuçları ve Loglama Kılavuzu

Bu proje, tüm test sonuçlarını ve loglarını otomatik olarak kaydeden kapsamlı bir test raporlama sistemi içerir.

## 🎯 Özellikler

- ✅ **Otomatik Rapor Oluşturma**: Testler çalıştırıldığında otomatik olarak JSON ve Markdown raporları oluşturulur
- ✅ **Birleştirilmiş Raporlar**: Vitest ve Playwright sonuçları tek bir raporda birleştirilir
- ✅ **Detaylı Loglama**: Tüm test execution logları kaydedilir
- ✅ **Kolay Erişim**: `LATEST_REPORT.md` dosyası her zaman en son sonuçları gösterir
- ✅ **Proje Bazlı Analiz**: Playwright testleri tarayıcı/proje bazında analiz edilir

## 📁 Dosya Yapısı

```
test-results/
├── logs/                          # Test execution logs
│   └── test-log-2026-01-29T12-30-45.log
├── coverage/                      # Coverage reports
├── vitest-report-*.json          # Vitest JSON raporları
├── vitest-report-*.md            # Vitest Markdown raporları
├── playwright-report-*.json      # Playwright JSON raporları
├── playwright-report-*.md        # Playwright Markdown raporları
├── combined-report-*.json        # Birleştirilmiş JSON raporları
├── combined-report-*.md          # Birleştirilmiş Markdown raporları
├── LATEST_REPORT.md              # En son birleştirilmiş rapor (Markdown)
└── LATEST_REPORT.json            # En son birleştirilmiş rapor (JSON)

playwright-report/                 # Playwright HTML raporu (proje kökünde)
```

## 🚀 Kullanım

### Testleri Çalıştırma ve Rapor Oluşturma

```bash
# Sadece unit testleri (Vitest)
npm run test:run

# Sadece E2E testleri (Playwright)
npm run test:e2e

# Tüm testleri çalıştır ve rapor oluştur
npm run test:all:report

# Sadece rapor oluştur (mevcut test sonuçlarından)
npm run test:report
```

### Raporları Görüntüleme

```bash
# En son birleştirilmiş raporu görüntüle (Markdown)
cat test-results/LATEST_REPORT.md

# JSON formatında görüntüle (jq ile formatlanmış)
cat test-results/LATEST_REPORT.json | jq

# Tüm raporları listele
ls -lh test-results/*.md
ls -lh test-results/*.json

# Test loglarını görüntüle
tail -f test-results/logs/test-log-*.log
```

### Windows PowerShell'de

```powershell
# En son raporu görüntüle
Get-Content test-results\LATEST_REPORT.md

# JSON raporu görüntüle
Get-Content test-results\LATEST_REPORT.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Tüm raporları listele
Get-ChildItem test-results\*.md
Get-ChildItem test-results\*.json
```

## 📊 Rapor İçeriği

### Overall Summary (Genel Özet)
- Toplam test sayısı
- Başarılı testler (sayı ve yüzde)
- Başarısız testler
- Atlanan testler
- Toplam süre

### Vitest Section (Unit Tests)
- Test suite'leri
- Başarısız testler (hata mesajları ile)
- Her suite için istatistikler

### Playwright Section (E2E Tests)
- Tarayıcı/proje bazında breakdown
- Başarısız testler (hata mesajları ile)
- Her test dosyası için istatistikler

### Recommendations (Öneriler)
- Başarısız testler için öncelikli aksiyonlar
- İyileştirme önerileri

## 🔍 Örnek Rapor Yapısı

```markdown
# Test Results Report

## 📊 Overall Summary
| Metric | Value |
|--------|-------|
| Total Tests | 252 |
| ✅ Passed | 83 (33%) |
| ❌ Failed | 169 (67%) |
| ⏭️  Skipped | 0 |
| ⏱️  Total Duration | 245s |

## 🧪 Vitest (Unit Tests)
...

## 🎭 Playwright (E2E Tests)
...

## 💡 Recommendations
1. Fix Failed Tests: 169 test(s) need attention
2. Review Error Messages: Check test logs for detailed error information
3. Improve Stability: Consider increasing timeouts for flaky tests
```

## 📝 Log Formatı

Test logları JSON formatında saklanır:

```json
{
  "timestamp": "2026-01-29T12:30:45.123Z",
  "level": "info",
  "message": "Test execution started",
  "context": {
    "testFile": "story-modal.spec.ts",
    "browser": "chromium"
  }
}
```

## 🎯 CI/CD Entegrasyonu

GitHub Actions workflow'unuzda:

```yaml
- name: Run tests
  run: npm run test:all:report

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
    retention-days: 30

- name: Display test summary
  run: cat test-results/LATEST_REPORT.md
```

## 🔧 Yapılandırma

### Vitest Reporter Yapılandırması
`vitest.config.ts` dosyasında:
- JSON reporter: `test-results/vitest-results.json`
- Custom JSON reporter: `scripts/test-reporters/vitest-json-reporter.ts`
- Markdown reporter: `scripts/test-reporters/vitest-markdown-reporter.ts`

### Playwright Reporter Yapılandırması
`playwright.config.ts` dosyasında:
- HTML reporter: `test-results/playwright-html/`
- JSON reporter: `test-results/playwright-results.json`
- Custom JSON reporter: `scripts/test-reporters/playwright-json-reporter.ts`
- Markdown reporter: `scripts/test-reporters/playwright-markdown-reporter.ts`

## 💡 İpuçları

1. **Hızlı Özet**: `LATEST_REPORT.md` dosyasını her zaman kontrol edin
2. **Detaylı Analiz**: JSON raporlarını programatik olarak analiz edebilirsiniz
3. **Log Takibi**: Test loglarını gerçek zamanlı olarak takip edin
4. **Geçmiş Karşılaştırma**: Timestamp'li raporlar ile geçmiş sonuçları karşılaştırın
5. **CI Integration**: Test sonuçlarını CI/CD pipeline'ınıza entegre edin

## 🐛 Sorun Giderme

### Raporlar oluşturulmuyor
```bash
# Test-results klasörünün var olduğundan emin olun
mkdir -p test-results

# Testleri tekrar çalıştırın
npm run test:all:report
```

### JSON parse hatası
```bash
# Rapor dosyalarını kontrol edin
cat test-results/vitest-report-*.json | jq
cat test-results/playwright-report-*.json | jq
```

### Log dosyaları görünmüyor
```bash
# Log klasörünün var olduğundan emin olun
mkdir -p test-results/logs

# Test logger'ın çalıştığından emin olun
# (Testler çalıştırıldığında otomatik olarak log oluşturulur)
```

## 📚 Daha Fazla Bilgi

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Test Results README](./test-results/README.md)
