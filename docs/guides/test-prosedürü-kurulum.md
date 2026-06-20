İleri görüşlü ve pratik bir yaklaşımla, projemizin kalitesini son kullanıcı gözüyle ve arka plandaki görünmez hatalarla birlikte denetleyecek eksiksiz bir "Röntgen ve Otomasyon Test Sistemi" kurmanı istiyorum. 

Projemizde Next.js (App Router) mimarisi, Vercel entegrasyonu ve hazırda bekleyen Sentry konfigürasyonları olduğunu biliyorum. Senden ricam, şu 3 aşamalı sistemi projemize entegre etmektir:

1. PLAYWRIGHT ENTEGRASYONU:
- Projeye Playwright kütüphanesini ekle.
- `app/` dizini altındaki ana rotaları (Ana sayfa, /drivers, /circuits, /anthology) otomatik olarak ziyaret eden bir test script'i yaz.
- Bu script, her sayfayı hem Masaüstü (Desktop) hem de Mobil (Mobile) çözünürlüklerde simüle etmeli.
- Her sayfanın ekran görüntüsünü (Full-size screenshot), konsol loglarını (Console logs) ve eğer varsa hata çıktılarını `test-results/screenshots/[tarih]_[sayfa_adi]_[cihaz].png` formatında yapılandırılmış bir klasöre kaydetmeli.

2. LIGHTHOUSE CI ENTEGRASYONU:
- Sitenin her deploy sonrasında performans, erişilebilirlik (Accessibility) ve SEO skorlarını otomatik ölçebilmemiz için Lighthouse CI konfigürasyonunu hazırla.
- Mobil ve desktop için bu raporları otomatik üretecek yapıyı kur.

3. WORKFLOW VE ORKESTRASYON:
- Tüm bu süreçleri otomatize etmek adına `.github/workflows/` altında `visual-and-performance-audit.yml` adında yeni bir GitHub Actions workflow'u oluştur.
- Bu workflow, kod her pushlandığında veya Vercel Preview URL ürettiğinde tetiklenmeli; arka planda headless browser ile sitenin röntgenini çekip raporları (ekran görüntüleri ve lighthouse çıktıları dahil) GitHub Artifacts olarak sunmalı.
- Projede yarım bırakılmış veya mevcut olan Sentry kurulumunu kontrol et ve production ortamında sessizce patlayan backend/frontend hatalarını yakalayacak şekilde aktifleştiğinden emin ol.

Kod yazmadan, tamamen araçların yeteneklerini konuşturacağımız en pratik, en hızlı ve en profesyonel konfigürasyonu dosyaları modifiye ederek tamamla. İşlem bittiğinde sistemi nasıl tetikleyeceğimi kısaca açıkla.