# Apex Projesi — Misyon ve Eksiklikler Denetim Raporu

> **Referans:** `docs/vision/apex-vision.md` (Temel Vizyon & Misyon Belgesi)  
> **Tarih:** 2026-10-05  
> **Durum:** Brownfield Denetimi (Mevcut Durum Analizi ve İyileştirme Planı)

Bu döküman, kurucunun vizyonunda belirtilen misyon hedefleri doğrultusunda projenin mevcut durumunu, tespit edilen eksiklikleri ve bu misyonun nasıl gerçekleştirileceğini en sade haliyle ortaya koyar.

---

## 1. Genel Durum Özeti

Apex'in temel omurgası kurulmuş ve yayındadır. Ancak kullanıcı deneyiminde güçlü hissedilen alanlar ile tamamlanması gereken kritik boşluklar arasında belirgin bir fark vardır:

- **En Güçlü Yönümüz:** Derin hikaye anlatımı ([Anthology](../app/[locale]/anthology)), editoryal ton, pilot ve takım profil sayfalarındaki zenginlik ve [DriverHeroGraphic](../components/profile/DriverProfileHero.tsx) ile sıfır telif riskiyle üretilen özgün prosedürel CAD/tipografik görsel dil.
- **Kritik Eksiklikler:** Sezon takibinin statik kalması, efsanevi araçlar (Machinery) bölümünün henüz hiç var olmaması, pist sayfalarının görsel ve telemetrik olarak boş hissettirmesi, regülasyonların araç karakteristiğine etkisini anlatan teknik sözlük derinliğinin eksikliği ve telif temizliği sonrası doğan genel görsel kuruluk.

---

## 2. Misyon Maddelerine Göre Mevcut Durum & Boşluklar

### 2.1 Veri Mimarisi ve Altyapı (Kusursuz Saat Mekanizması)
- **Mevcut Durum:** ✅ Güçlü. Supabase veri katmanı, Vercel cron'ları ve GitHub Actions (`sync-f1-race-aware.yml`, `notify-sessions.yml`) ile 1950–2026 arası 77 sezonluk F1DB arşivi entegre. OpenF1 canlı zamanlama proxy'si edge-cache ve stampede korumasına sahip.
- **Eksik/Gereken:** 2026 sezonu canlı Jolpica snapshot dolumunun kesintisiz sürmesi; yarış haftasında canlı push bildirim cron'unun uçtan uca doğrulanması.

### 2.2 Kültür ve Anlatı (Anthology & İkonik Araçlar)
- **Mevcut Durum:** ⚠️ Kısmen tamam. 17 adet yüksek editoryal kalitede uzun okuma hikayesi yayında.
- **Eksik/Gereken:** 
  1. **İkonik Araçlar (Machinery) Sayfası Yok:** Ferrari F2004, McLaren MP4/4, Williams FW14B, Brawn BGP 001, Lotus 72, Red Bull RB19 gibi sporu ve regülasyonları baştan yazan makineler için ne bir veri modeli ne de özel bir vitrin sayfası mevcut.
  2. **Görsel Lisansları:** `public/stories` altındaki 56 görselin açık telif kayıtları tamamlanmalı veya yerlerine doğrulanmış kamu malı (Public Domain) / telifsiz teknik CAD çizimleri konulmalı.

### 2.3 Eksikleri Kapatma ve İterasyon

#### A) Sezon Takibi, Puan Durumları ve Grid
- **Mevcut Durum:** Sezon ve grid sayfaları mevcut (`/season`, `/season/[year]`, `/grid`). Takım bazlı renkler ve pilot listeleri çalışıyor.
- **Eksik/Gereken:** 
  - Sayfa salt tablo hissi veriyor; yarış yarış şampiyona liderlik salınımını gösteren dinamik bir **puan ilerleme grafiği (progression chart)** eksik.
  - Grid sayfasında aynı takımın iki pilotunun sıralama ve yarış düellosunu gösteren **Head-to-Head (H2H)** telemetrisi eksik.
  - Yarış sonuçlarında grid başlangıcı ile bitiriş arasındaki **pozisyon kazanım deltası (+/-)** eksik.

#### B) Pist Detay Sayfaları (Circuits)
- **Mevcut Durum:** 24 pist için temel statik bilgiler (`data/circuits/facts.ts`), son kazananlar ve hava durumu var.
- **Eksik/Gereken:** 
  - **Görsel Boşluk:** Pist kapak görseli (`circuitCoverSrc`) şu an kodda bilerek `null` dönüyor; harita alanı boş bir cam kutu ve küçük beyaz bir çizgiden ibaret.
  - **Eksik Telemetri:** İrtifa farkı (elevation profile: Spa Eau Rouge, Spielberg T3), fren sertliği derecesi, asfalt aşınması, DRS aktivasyon bölgeleri ve hız tuzakları yok.
  - **Pist Hikayesi (Lore):** O pistte gerçekleşmiş tarihi anlar (ör. Senna Monaco 1988, Häkkinen Spa 2000) sayfaya işlenmemiş.

#### C) Tech Glossary & Regülasyonlar
- **Mevcut Durum:** 11 teknik şema ikonu ve Pirelli lastik kartları ile temel sözlük sayfası yayında.
- **Eksik/Gereken:** 
  - Regülasyonların sporu nasıl şekillendirdiğini gösteren **"Dönemler & Kurallar"** boyutu eksik (Ör: 1994 aktif süspansiyon yasağı, 2009 çift difüzör boşluğu, 2014 turbo-hibrit, 2022 zemin etkisi/yunuslama).
  - Terimlerin son kullanıcıya doğrudan araç karakteristikleri ve sürüş hissi üzerinden açıklanması eksik.

#### D) Görsel Ekosistemi (En Kritik İhtiyaç)
- **Mevcut Durum:** Telif riski taşıyan tüm izinsiz pilot/takım fotoğrafları başarıyla temizlendi. Pilot sayfasına eklenen `DriverHeroGraphic` (CAD dokusu + tipografik anıt) sıfır telifle harika bir estetik sundu.
- **Eksik/Gereken:** Aynı felsefenin pistlere (teknik topoğrafya ve CAD pist şemaları) ve efsanevi araçlara (aerodinamik silüetler ve CAD tel kafes çizimleri) yayılması gerekiyor.

---

## 3. Bu Misyonu Nasıl Gerçekleştirebiliriz? (Uygulama Yol Haritası)

Misyonu saat gibi işleyen, hızlı ve estetik bir bütüne ulaştırmak için önerilen 4 fazlı uygulama planı:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PİSTLER & GÖRSEL DİRİLİŞ                                                │
│ - Boş cover yerine yüksek çözünürlüklü teknik CAD pist/sektör mimarisi     │
│ - İrtifa profili (elevation), frenleme yükü, DRS bölgeleri                 │
│ - Pistin tarihi efsane anları (Lore kartları)                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. MACHINERY (İKONİK ARAÇLAR KOLEKSİYONU)                                   │
│ - Yeni veri modülü: `data/machinery/` (F2004, MP4/4, FW14B, BGP001 vb.)     │
│ - Sayfa mimarisi: `/machinery` vitrini ve araç detay sayfaları              │
│ - Mühendislik dehası, şasi/motor mimarisi, aerodinamik CAD silüetleri      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. YAŞAYAN SEZON & GRİD DİNAMİKLERİ                                         │
│ - Şampiyona puan ilerleme grafiği (interaktif / SVG dalga çizgileri)        │
│ - Takım içi pilot düellosu (Qualifying & Race H2H sayaçları)                │
│ - Grid pozisyon değişim deltası (+/- sıralama kazanımı)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. TECH GLOSSARY 2.0 (REGÜLASYONLAR & ÇAĞLAR)                              │
│ - "Regülasyonlar Çağları Nasıl Değiştirdi?" rehber modülü                  │
│ - Terimler, araçlar ve Anthology hikayeleri arasında çift yönlü bağ        │
│ - Lastik hamurlarının termal çalışma pencereleri anlatımı                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

Bu yol haritası tamamlandığında Apex; arkasında kusursuz işleyen veri çarkıyla, hiçbir takılma yaşamayan optimize performansıyla ve telif riski taşımayan özgün teknik-estetik görsel kimliğiyle kurucunun vizyonundaki ideal durumuna kavuşacaktır.
