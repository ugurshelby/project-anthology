# Apex Design System — Architecture & Style Reference (`apex-design.md`)

> **Nihai Otorite:** Bu doküman, Apex (Project Anthology) platformunun tek ve bağlayıcı tasarım anayasasıdır.  
> Temel felsefesi: Apple'ın rafine tasarım ilkeleri (kısıtlama, optik tipografi, yay fiziği, akışkan yüzeyler) ile Formula 1 motor sporlarının yüksek kontrastlı, teknik ve sinematik ruhunun sentezidir.  
> **Temel Amaç ve Vizyon:** `docs/vision/apex-vision.md`  
> **Tarih:** 2026-10-05 · **Token ve tipografi koda göre düzeltildi:** 2026-10-09

---

## 1. Tasarım Felsefesi ve Çekirdek İlkeler

Apex'in tasarım dili; gürültüden arındırılmış, karanlık bir garajda çalışan yüksek hassasiyetli bir telemetri ekranı ile Apple'ın minimalist donanım ve yazılım estetiğini bir araya getirir.

| İlke | Apple İlkesi | Apex Uygulaması |
| :--- | :--- | :--- |
| **Kısıtlama (Restraint)** | Tek bir mavi switch kuralı | Yalnızca tek bir global aksiyon rengi: **Apex Red** (`#ff1801`). Aşırı süsleme, neon ve anlamsız gradyanlar yasaktır. |
| **Optik Tipografi** | SF Pro negative tracking | Başlık büyüdükçe daralan negatif harf aralığı (Barlow Condensed), gövdede yüksek okunabilirlik (Inter), telemetride monospaced veri (JetBrains Mono). |
| **Akışkan Yüzeyler** | Translucent Materials & Frost | Derin koyu zemin üzerinde `--surface` kartlar, `--hairline` sınırlar, ortam gölgesi ve üst kenar ışık çizgisi. Gerçek `backdrop-filter` yalnızca tekil, görsel üstü yüzeylerde (§5.3). |
| **Yay Fiziği (Spring Motion)** | Kütle, sertlik ve sönümleme | Mekanik lineer geçişler yerine interruptible (kesintiye uğrayabilir) yay fiziği; sayfa geçişlerinde View Transitions (hedef, §6). |
| **Yüksek Bilgi Yoğunluğu** | Dashboard disiplini | Sadece telemetri ve zamanlama tablolarında filtrelenmiş brutalist monospaced bilgi yoğunluğu; kart içinde kart yığılması yok. |

---

## 2. Beş Katmanlı Skill Orkestrasyon Mimarisi

Tasarım araçlarının çelişmesini engellemek için kurulan bağlayıcı katman hiyerarşisi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TEMEL TASARIM OTORİTESİ (Foundational)                                    │
│    `apple-design` — Tipografi disiplini, akışkan yüzeyler, yay fiziği       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. BİLEŞEN & YERLEŞİM (Execution)                                           │
│    `high-end-visual-design` + `minimalist-ui` — Rafine kartlar, bento grid   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. VERİ YOĞUN SAYFALAR (Telemetry & Timing)                                 │
│    `industrial-brutalist-ui` (Filtrelenmiş) — Yalnızca monospaced yoğunluk   │
│    (Brutalist görsel estetik yasaktır, Apple tasarım dili içine gömülür)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. HAREKET & GEÇİŞLER (Motion)                                              │
│    `react-view-transitions` + Framer Motion — Kesintiye uğrayabilir yaylar   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. KALİTE DENETİMİ (Audit)                                                  │
│    `ui-ux-pro-max` + `accesslint-audit` — WCAG 2.2 AA, kontrast ve ergonomi │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Renk Mimarisi ve Token'lar

> **Token'ların tek kaynağı koddur: `app/globals.css` (`:root` ve `@theme inline`).** Bu bölüm ve `docs/design/tokens.json` onun aynasıdır; ayrışırlarsa kod doğrudur ve doküman aynı commit'te düzeltilir. `docs/design/apex-design-language.md` token tekrarlamaz, buraya bağlanır.

Apex karanlık mod öncelikli çalışır. Saf siyah (`#000000`) yerine derin nötrler ve tek bir imza kırmızısı kullanılır.

### 3.1 Zemin ve Yüzeyler (kodda var)

| Token | Değer | Rol & Kullanım |
| :--- | :--- | :--- |
| `--bg` | `#0a0a0a` | Birincil sayfa zemini |
| `--surface` | `#141414` | Bento kartları, paneller |
| `--surface-raised` | `#1c1c1c` | Hover, açılır menü, modal zemini |
| `--hairline` | `#262626` | Kart sınırları, ayırıcı çizgiler (opak; cam üstünde de aynı ton) |

### 3.2 Vurgu (kodda var)

| Token | Değer | Rol & Kullanım |
| :--- | :--- | :--- |
| `--accent` | `#ff1801` | **Apex Red** — tek global aksiyon rengi: birincil etkileşim, canlı seans, aktif sekme. Değerin kaynağı `config/team-colors.ts` |
| `--team-primary` / `--team-secondary` / `--team-accent` | varsayılan `--bg` / `--accent` / `--accent` | Takım temalı sayfalarda kök elemanın `style`'ı ile ezilir |

Hover, yumuşak arka plan ve odak sınırı için ayrı token yok; bunlar `--accent` üzerinden opaklıkla (`bg-accent/10`, `border-accent/40` gibi) üretilir.

### 3.3 Metin ve Kontrast (kodda var, WCAG 2.2 AA)

Kontrast oranları `--bg` / `--surface` / `--surface-raised` zeminlerine göre hesaplanmıştır (2026-10-09).

| Token | Değer | `--bg` | `--surface` | `--surface-raised` | Rol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--text-hi` | `#ffffff` | 19.8:1 | 18.4:1 | 17.0:1 | Büyük başlıklar, pilot isimleri, puan rakamları |
| `--text` | `#e6e6e6` | 15.9:1 | 14.8:1 | 13.7:1 | Gövde metinleri |
| `--text-mid` | `#A1A6AE` | 8.1:1 | 7.5:1 | 7.0:1 | Alt başlıklar, ikincil etiketler, meta |
| `--text-low` | `#8A8F98` | 6.1:1 | 5.7:1 | 5.2:1 | Dipnotlar, pasif öğeler |

### 3.4 Telemetri Durum Renkleri (henüz token değil)

Bu renkler kodda bileşen içinde sabit hex olarak kullanılıyor (`components/circuit/CircuitElevationProfile.tsx`, `components/season/ResultsTable.tsx`, `components/standings/GarageTeamPanel.tsx`). Token'a taşınmaları açık iştir; o zamana kadar yeni kod aynı değerleri kullanır, yeni ton eklemez.

| Önerilen token | Değer | Anlam |
| :--- | :--- | :--- |
| `--telemetry-purple` | `#b356fe` | En hızlı tur / sektör |
| `--telemetry-green` | `#00d26a` | Kişisel en iyi / pozisyon kazancı |
| `--telemetry-yellow` | `#fecb00` | Sarı bayrak / zaman kaybı |
| `--telemetry-red` | `#ff3b30` | Kırmızı bayrak / kaza / DNF / pozisyon kaybı |

Renk hiçbir zaman tek bilgi taşıyıcısı değildir: yanında ikon, işaret (`+`/`−`) veya metin bulunur.

---

## 4. Tipografi Sistemi ve Optik Ölçekleme

Apex, hiyerarşik netlik için 3 font ailesi kullanır (`next/font`, `app/layout.tsx`):

1. **Barlow Condensed (`--font-condensed`):** Başlıklar, editoryal afişler, büyük yarış numaraları.
2. **Inter (`--font-body`):** Gövde metinleri, navigasyon, düğmeler, açıklamalar.
3. **JetBrains Mono (`--font-mono`):** Telemetri, zaman farkları, tur süreleri, etiketler (`tabular-nums`).

### 4.1 Tip Ölçeği (kodda var, `app/globals.css`)

Büyük başlıklarda negatif harf aralığı uygulanır (Apple optik tracking ilkesi); etiketlerde pozitif.

| Sınıf | Boyut | Satır Yüksekliği | Letter Spacing | Font & Ağırlık |
| :--- | :--- | :--- | :--- | :--- |
| `.display-hero` | `clamp(40px, 12vw, 120px)` | 0.92 | `-0.02em` | Barlow Condensed 700 |
| `.headline-lg` | `clamp(34px, 4vw, 48px)` | 1.05 | `-0.01em` | Barlow Condensed 600 |
| `.headline-md` | `clamp(24px, 2.6vw, 32px)` | 1.1 | — | Barlow Condensed 600 |
| `.body-lg` | 18px | 1.75 | — | Inter 400 |
| `.body-md` | 16px | 1.5 | — | Inter 400 |
| `.body-sm` | 14px | 1.5 | — | Inter 400 |
| `.data-tabular` | 14px | 1.43 | `-0.01em` | JetBrains Mono 500, `tabular-nums` |
| `.label-caps` | 12px | 1.33 | `+0.1em` | JetBrains Mono 700, büyük harf |
| `.hero-number` | kullanım yerinde verilir | 0.9 | `-0.02em` | Barlow Condensed 700, `tabular-nums` |

---

## 5. Spacing, Geometri ve Yüzeyler

### 5.1 Boşluk Izgarası (4px / 8px Sistemi)
- **Mikro boşluklar:** `4px`, `8px`, `12px` (Rozetler, ikon-metin aralıkları)
- **Kart içi:** `--card-pad` `24px` (mobil), `--card-pad-md` `32px` (md+)
- **Bölüm arası:** `48px`, `64px`, `80px` (Masaüstü sayfa dikey ritmi)
- **Maksimum genişlik:** `1440px` (`--container-max`)

### 5.2 Yarıçap (kodda var)
- **Kartlar & büyük container'lar:** `16px` (`--radius-lg`, Tailwind `rounded-card`)
- **Buton & çip:** `8px` (`--radius`, Tailwind `rounded-chip`)
- **Etiketler & haplar:** `9999px` (`--radius-pill`)

### 5.3 Kart Yüzeyi ve Cam
Standart kart (`components/bento/BentoCard.tsx`): `--surface` + 1px `--hairline` + `16px` radius + ortam gölgesi. Kartlarda **gerçek `backdrop-filter` kullanılmaz** (kaydırma performansı, vizyonun 2. önceliği); "cam" hissi gölge ve üst kenar ışığıyla taklit edilir. Gerçek bulanıklık yalnızca arkasında görsel olan tekil yüzeylerde kullanılır (ör. `DriverProfileHero` mobil paneli) ve sayfa başına bir veya iki öğeyle sınırlıdır.

---

## 6. Hareket, Fizik ve Geçişler (Motion Physics)

Kodda var: `framer-motion` bağımlılığı ve `app/globals.css` içindeki `prefers-reduced-motion` blokları. Ortak bir yay parametresi sabiti henüz yok; aşağıdaki değerler **hedeftir** ve yeni hareket kodu bunları kullanır. Sabit eklendiğinde (önerilen yer `lib/motion.ts`) bu bölüm ona bağlanır.

```ts
export const APEX_MOTION = {
  spring: { type: 'spring', mass: 0.8, stiffness: 200, damping: 25 },
  snappy: { type: 'spring', mass: 0.6, stiffness: 280, damping: 30 },
  reduced: { duration: 0.01 },
};
```

- **Kesintiye uğrayabilir hareket:** Kullanıcı yön değiştirdiğinde animasyon donmaz, yeni hedefe yumuşakça döner.
- **Sayfa geçişleri:** View Transitions API hedeftir; henüz uygulanmadı.
- **Erişilebilirlik:** `@media (prefers-reduced-motion: reduce)` altında animasyonlar sıfırlanır (zorunlu).

---

## 7. Veri Yoğun Sayfalar (Telemetri & Zamanlama Kuralı)

`industrial-brutalist-ui` yetkinliğinden yalnızca **bilgi yoğunluğu ve monospaced disiplin** alınır; brutalist görsel karmaşa yasaktır.

1. **Zaman Tabloları:**
   - Satır yüksekliği: Kompakt (`36px`–`42px`).
   - Sütunlar: Sürücü, Takım Rengi Çubuğu (`w-1 rounded-full`), Tur Zamanı (`1:23.456`), Sektörler (`S1: 28.1 · S2: 29.4 · S3: 25.9`), Delta (`+0.124`).
2. **Klavye ve Dokunma Erişilebilirliği:**
   - Masaüstünde tam klavye navigasyonu (`Tab` ve ok tuşları).
   - Mobilde minimum dokunma alanı: `44x44px`.
