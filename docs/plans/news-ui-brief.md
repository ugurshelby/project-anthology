# Haber Arayüzü — Brief (Antigravity)

> Durum: **taslak, onay bekliyor.** Onaylanana kadar uygulama yok.
> Bu brief, önceki `news-stories-ui-handoff.md`'nin yerine geçmez; haber arayüzünü baştan düşünmek için çerçeve verir.

## 1. Sistem özeti

Arka plan beş kaynaktan (The Race, Autosport, Motorsport.com, BBC Sport F1, RaceFans) haber toplar, aynı olayı yazanları tek **hikâyede** birleştirir ve her hikâye için özgün bir İngilizce + Türkçe başlık/özet yazar. Sonuç `news_stories` tablosuna gider. Hikâye başına şunlar vardır: başlık, özet (EN/TR), en iyi kapak görseli (yoksa boş), hikâyeyi yazan kaynakların listesi ve her birinin makale linki, yayın zamanı.

- Her saat çalışır; yeni veya değişen hikâye yeniden yazılır. Ziyaretçi hiçbir şeyi tetiklemez.
- Hikâye ilk göründüğünde kaynağın kendi metniyle olabilir, sonra özgün metinle değişir (aynı `id`).
- Son 7 gün saklanır; eskisi silinir.
- Görseli olmayan hikâye mümkündür. Yer tutucu görsel üretilmez.

## 2. Kısıtlar (pazarlığa kapalı)

- Arayüz haber hattını **tetikleyemez** (cron/sync/yazım uçlarına çağrı yok).
- Veri yalnızca `lib/data/news.ts` fonksiyonlarından (`getLatestNews`, `getNewsById`, `NewsItem`) okunur. Doğrudan RSS, kaynak siteler veya yapay zekâ çağrısı yok.
- Dokunulmayacak alanlar: `lib/news/*`, `app/api/cron/*`, `supabase/migrations/*`, `lib/data/news.ts`, `.github/workflows/*`, `.env*`.
- Kaynak metni arayüzde kopyalanmaz; gösterilen yalnızca hikâyenin kendi başlığı/özeti ve kaynak linkleridir.
- **Commit ve push yok.** Değişiklikler çalışma ağacında kalır.
- Yapılan her anlamlı iş `logs/YYYY-AA-GG.md`'ye 1-2 satırla yazılır.

## 3. Açık bırakılanlar

Aşağıdakilerin tamamı Antigravity'nin kararıdır: sayfa yapısı (liste, ana sayfa yerleşimi, hero), kaç haber ve nasıl gösterileceği, detay sayfası, kaynak atfının biçimi, görselsiz hikâyenin sunumu, TR/EN davranışı, boş/yükleniyor durumları ve diğer tüm UX kararları.

Tasarım dili: `docs/design/apex-design-language.md` (ayrıca `docs/design/design.md/web-design.md`, `docs/design/premium-design-philosophy.md`). Mevcut bileşenlerle kopukluk yaratılmaz.

## 4. Çıktı kriterleri

Bitti sayılması için:

- [ ] `npm run lint` 0 hata, `npm test` tamamı yeşil, `npm run build` 0 hata
- [ ] Apex tasarım diline uyum (token'lar, tipografi, boşluk, AI-slop yok); neye uyulduğu raporda dosya adıyla belirtilir
- [ ] Her hikâye için kaynaklara atıf ve çalışan dış linkler
- [ ] Görselsiz, tek kaynaklı, çok kaynaklı, çok uzun başlıklı ve TR çevirisi eksik hikâye durumlarının her biri kırılmadan görünür
- [ ] 375 / 768 / 1280 px ekran görüntüleri
- [ ] Erişilebilirlik: WCAG AA kontrast, klavye ile gezinme, `prefers-reduced-motion`
- [ ] Veri yokken (boş tablo) sayfalar kırılmaz

## 5. Geri rapor

Kısa ve üç başlıkta:

1. **Yaptıkları** — değişen dosyalar ve sonuç
2. **Doğrulayamadıkları** — çalıştırılamayan, görülemeyen veya yalnızca varsayılan şeyler
3. **Varsayımları** — brief'te yazmayan, kendi verdiği kararlar ve gerekçesi
