# Mobil bug fix turu + yeni özellikler (push bildirimleri, pist haritaları)

Efendim APK'yı test etti, ekran görüntüleriyle 13 maddelik bug listesi ve
yeni özellik önerileri verdi. Sezon arşivi (geçmiş sezonlar, çok büyük DB
işi) bilinçli olarak bu turun dışında tutuldu — ayrı bir oturumda ele
alınacak.

## Kapsam

### A. Bug fix'ler (13 madde, doğrudan uygulanacak — ayrı onay gerektirmiyor)

1. Logo kontrastı — McLaren/Aston Martin/Cadillac logoları koyu kartlarda
   kayboluyor. Fix: logo container'lara sabit açık chip arka plan (beyaz
   ~%8-10 opacity), tüm takım logoları aynı zeminde tutarlı otursun.
2. Lindblad numarası "#-" gösteriyor — gerçek numara (30/38, doğrulanacak)
   veri katmanına eklenecek.
3. Anthology detay (Steinmetz Diamond): aynı Jaguar/Monaco hero görseli
   makale içinde 3 kez tekrarlıyor — kök neden bulunup görsel seçim
   mantığı düzeltilecek.
4. Görsel üstü beyaz başlık okunurluğu düşük — gradient overlay eklenecek.
5. Anthology liste: kart açıklamaları karakter sınırında kesiliyor
   ("hi...") — kelime bazlı truncate + "...".
6. Kategori etiketi (MODERN ERA vb.) görselle çakışıyor — badge'e
   zemin/backdrop eklenecek.
7. News: bir kart tamamen siyah/boş render oluyor — fallback görsel
   tanımlanacak.
8. News: kaynak adı iki kez tekrarlıyor (badge + tarih satırı) —
   tekrar temizlenecek.
9. News: kart boyutları tutarsız — sabit grid mantığı (ilk 3 büyük,
   sonrası 2'li grid).
10. Puan renk kodlaması: P2 kırmızı "hata" çağrışımı yapıyor — nötr puan
    rengi (beyaz/gri), takım rengi sadece kenar çizgisinde.
11. Geri sayım formatı karışık ("6 DAYS 03:31:00") — tek tip format.
12. Navigasyon: bazı sayfalarda geri ok var, bazılarında yok — header
    davranışı standardize edilecek (hangi sayfa tipinde geri ok
    gösterileceği netleştirilip uygulanacak).
13. News/Anthology ikonları görsel olarak çok benziyor — ayırt edici
    ikon seçilecek.

**Ayrıca (kapsam kararı, bug değil):** Grid ve Season sekmeleri neredeyse
aynı veri/görseli gösteriyor. Karar: Grid = kart/profil görünümü (pilot/
takım kartları, foto+numara+renk — "kim kim" keşfi), Season = kompakt
sıralama listesi + takvim ("durum ne" özeti). Web'de bu ayrımın izleri
zaten var (Grid → DriverCard/TeamCard, Season → StandingsCard) — mobile
buna paritelenecek.

### B. Push bildirimleri (mobile + backend)

**Mevcut durum (önceki turdan hazır):** client zaten Expo push token alıp
`/api/push/register`'a kaydediyor (`lib/notifications.ts`,
`app/api/push/register/route.ts`, `push_subscriptions` tablosu,
`expo-server-sdk` kurulu). **Eksik olan tek şey: gönderme tarafı.**

**Yeni: `/api/cron/notify-sessions`** — Vercel cron, her 5-10 dakikada bir:
- `f1Calendar.ts`'deki seans saatlerini kontrol eder.
- Başlamasına ~30 dakika kalan bir seans varsa, `push_subscriptions`
  tablosunu `preferences[sessionType] === true` olan kayıtlara göre
  filtreler ve Expo SDK (`expo-server-sdk`, zaten `package.json`'da) ile
  gönderir.
- Aynı seansa birden fazla göndermemek için basit bir dedupe: yeni bir
  küçük tablo veya `push_subscriptions` yanına eklenecek bir
  "son bildirilen seans" izleme mekanizması (implementasyon planında
  netleşecek).

**Sıralama değişikliği bildirimi:** mevcut `sync-f1` cron'unun akışına
eklenir. Yeni snapshot alındıktan sonra, driver veya constructor
şampiyonluk lideri bir önceki snapshot'a göre değiştiyse tek bir push
gönderilir. Her puan değişikliğinde değil, sadece liderlik değiştiğinde.

**Onay noktası:** `vercel.json`'a yeni bir cron satırı eklemek production
konfigürasyon değişikliği — küçük ama Bölüm 7 (güvenlik kapıları)
gereği, bu adımdan önce Efendim'e bildirilecek.

### C. Pist haritaları (mobile)

Mobile'ın circuit detay sayfası (`app/circuit/[id].tsx`) zaten
`facts.ts`'ten uzunluk/tur rekoru/karakter metnini gösteriyor, ama gerçek
görsel pist çizimi yok. Web'in circuits redesign'ında (`02cd51e`)
kullanılan gerçek pist/circuit fotoğrafı (`circuitCoverSrc`) aynı
glassmorphic kart tasarımıyla mobile'a taşınacak — iki platform arasında
görsel parite.

### Kapsam dışı (bu turda YOK)

- **Sezon arşivi** (geçmiş sezonlar dropdown, web+mobile) — büyük DB işi,
  ayrı bir konuşmada ele alınacak. Hafızaya not düşülecek.
- **Paylaşılabilir kartlar** — bu turda seçilmedi.
- **Ana ekran widget'ı** — önceki turda ertelenmişti (Expo'da resmi
  desteklenmiyor, native modül + prebuild gerekir), bu turda da
  seçilmedi, ertelenmiş kalıyor.

## Doğrulama

Her madde: `tsc --noEmit` + mobile `expo export --platform android` (veya
web `npm run build`) temiz, ayrı commit. Push bildirimleri için gerçek
cihazda test mümkün değilse (dev ortamı), en azından Expo push token
formatı ve cron mantığı statik olarak doğrulanacak — gerçek bildirim
teslimatı Efendim'in kendi cihazında test etmesiyle onaylanacak.
