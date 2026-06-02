# Legacy Codebase & Valuable Files Reference

Bu klasör, projenin geçmiş versiyonlarında geliştirilmiş başarılı mantıksal mimarileri (*gold nuggets*) ve performans/tasarım tıkanıklıklarına yol açan kusurlu yapıları (*technical debt*) barındırır. 

**AI Agent'lar İçin Kesin Kural:** Yeni bir `feature` geliştirmeden veya `backend/database` mimarisini kurmadan önce bu dosyayı ve ilgili eski kodları analiz edin. Ancak buradaki kodları doğrudan kopyalamayın, sadece mantıksal referans (*architectural pattern*) olarak kullanın.

---

## 📂 Dosya Envanteri ve Kritik Çıkarımlar (Inventory & Takeaways)

### 1. `newsService.ts` (Haberler Servisi)
- **Amacı:** RSS akışlarını yöneten ve istemci tarafında optimize içerik sunan servis katmanı.
- **Neleri Örnek Almalısınız?** - `stale-while-revalidate` (SWR) stratejisi kusursuz çalışıyor. Veriyi `localStorage` üzerinde `news_cache_v2` anahtarı ile tutarak anında boyama (*first paint*) sağlıyor.
  - `warmNewsOnLoad()` gibi arka planda tetiklenen *fire-and-forget* mekanizması, kullanıcı sayfaya girmeden önbelleği ısıtıyor (*cache warmup*).
  - Ağ hatalarına karşı `FALLBACK_NEWS_URL` statik yedek planı başarılı bir *fail-safe* örneğidir.
- **Yeni Projeye Adaptasyon:** Bu mantık, Next.js App Router mimarisine taşınmalı ve diğer statik veri akışları için genel bir *utility function* haline getirilmelidir.

### 2. `sync-f1-snapshots.mjs` & `sync-f1-to-supabase.mjs` (Veri Senkronizasyonu)
- **Amacı:** Jolpica (Ergast) API'sinden yarış takvimi, puan durumları ve sonuçları çekerek Supabase veritabanına yazan scriptler.
- **Neleri Örnek Almalısınız?**
  - Jolpica API endpoint entegrasyon mantığı, döngülerle sezon ve raund verilerini süzme biçimi doğrudur.
  - Supabase üzerindeki `UPSERT` (varsa güncelle, yoksa ekle) sorgu yapıları veri tutarlılığı için referans alınmalıdır.
- **Neleri Değiştirmelisiniz (Kritik Hata)?** Aşağıdaki "Kaçınılması Gereken Kusurlar" bölümünü okuyun.

---

## 🚫 Kaçınılması Gereken Mimari Kusurlar (Architectural Flaws to Avoid)

Eski sistemdeki `Season` sayfasının çökmesine ve hantallığa neden olan yapısal hatalar şunlardır, **kesinlikle tekrarlanmamalıdır:**

1. **Vite / Client-Side Rendering (CSR) Bağımlılığı:** Eski sistem bir React + Vite SPA (Single Page Application) projesiydi. Yoğun veri setlerini tarayıcıda yönetmeye çalışmak performansı öldürdü. Yeni mimaride her şey **Next.js Server Components (RSC)** ile sunucuda render edilmelidir.
2. **Disk I/O Darboğazı (Disk I/O Bottleneck):** Eski scriptler veriyi API'den alıp önce yerel diske JSON olarak yazıyor (`public/data/f1/`), ardından diskten okuyup Supabase'e gönderiyordu. Bu çift adımlı süreç büyük bir hamallıktır.
3. **Vercel / Serverless Uyumsuzluğu:** Vercel gibi `Serverless` platformlarda dosya sistemine (*file system*) yazma izni kısıtlı ve geçicidir. Bu nedenle eski scriptler Vercel üzerinde otomatik bir `Cron Job` olarak çalışamaz.

---

## ⚡ Agent'lar İçin Yeni Yol Haritası (Action Plan)

### Claude Code (Backend & Automation Tasks)
- **Direct Ingestion & In-Memory Processing:** `sync-f1` mantığını birleştirin. API'den gelen veriyi diske hiç yazmadan doğrudan bellek içinde (*in-memory*) parse edip Supabase'e gönderin.
- **Vercel Cron Job:** Bu birleştirilmiş senkronizasyon kodunu `app/api/cron/sync-f1/route.ts` altına entegre ederek edge fonksiyonuna dönüştürün.

### Cursor (Frontend & UI Tasks)
- **State Temizliği:** Eski `SeasonTracker.tsx` ve `LiveTiming.tsx` içindeki hantal istemci durum yönetimlerini (*client-side state*) tamamen terk edin.
- **Design System Entegrasyonu:** Tüm arayüzü `docs/DESIGN_SYSTEM.md` içindeki kurallara (Bebas Neue tipografisi, `#ff1801` accent rengi, `Atmospheric Hero Layers`) sadık kalarak, placeholder asset'lerle sıfırdan inşa edin.