Bu döküman direkt geliştirici tarafından yazıldı bu en temel otoritedir.Buradaki yazılanlar master planda yazanlarla çelişirse acil eylem planı önceliklidir.

İlk olarak senden istediğim projemizdeki skilleri ve bunları kurulumlarını yapman: docs\design\skills klasöründe ihtiyacın olacak tüm skiller var ve önce bunları temizleyerek başlayacaksın. 

### 1. Apex Vizyon ve Misyonu

* **Vizyon (Nereye Ulaşmak İstiyoruz?):** Motor sporları tutkusunu ve zengin F1 mirasını; arka planda saat mekanizması hassasiyetinde çalışan veri mimarisiyle, gecikmesiz, akıcı ve editoryal derinliği yüksek bir arayüzde birleştiren; Formula 1 kültürünün dijital başvuru ve deneyim merkezi olmak.
* **Misyon (Bunu Nasıl ve Ne İnşa Ederek Yapıyoruz?):** 1950'den günümüze tüm F1 verisini, yarış takvimlerini, teknik düzenlemeleri, ikonik araçları ve insan hikayelerini; telif riski barındırmayan temiz görsel varlıklar, yüksek performanslı web mimarisi ve ödün vermeyen bir kullanıcı deneyimi ile erişilebilir kılmak.

---

### 2. Tasarım dili yeniden kurulumu ve /docs/design yapılandırması

Bu konudaki kurulum ve orkestrasyon tamamlanmıştır: `docs/design/apex-design.md`, `docs/design/tokens.json` ve `docs/design/skills/` mimarisi kurulmuştur. 

---

#### 3. Kusursuz Saat (Harmonik Cron ve Caching Mimarisi)

* **Zaman Senkronizasyonu:** `lib/f1Calendar.ts` yarış haftası moduna girdiğinde `OpenF1` live-timing proxy'si dinamik olarak kenar önbellek (`s-maxage=3`, `stale-while-revalidate`) ile devreye girmeli.


* **Snapshot & Ingest Ayrımı:** Statik tarih verisi (1950–günümüz) SQLite/JSON bundle veya Supabase DB'den okunurken; canlı sezon standings ve grid verisi yarış tamamlandığında tek seferlik idempotent event-trigger ile DB'ye snapshotlanmalı. Kullanıcı asla harici API'nin yanıt süresini beklememeli.