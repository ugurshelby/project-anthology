# Apex Design System — Architecture & Style Reference (`apex-design.md`)

> **Nihai Otorite:** Bu doküman, Apex (Project Anthology) platformunun tek ve bağlayıcı tasarım anayasasıdır.  
> Temel felsefesi: Apple'ın rafine tasarım ilkeleri (kısıtlama, optik tipografi, yay fiziği, akışkan yüzeyler) ile Formula 1 motor sporlarının yüksek kontrastlı, teknik ve sinematik ruhunun sentezidir.  
> **Temel Amaç ve Vizyon:** `docs/vision/apex-vision.md`  
> **Tarih:** 2026-10-05

---

## 1. Tasarım Felsefesi ve Çekirdek İlkeler

Apex'in tasarım dili; gürültüden arındırılmış, karanlık bir garajda çalışan yüksek hassasiyetli bir telemetri ekranı ile Apple'ın minimalist donanım ve yazılım estetiğini bir araya getirir.

| İlke | Apple İlkesi | Apex Uygulaması |
| :--- | :--- | :--- |
| **Kısıtlama (Restraint)** | Tek bir mavi switch kuralı | Yalnızca tek bir global aksiyon rengi: **Apex Red** (`#ff1801`). Aşırı süsleme, neon ve anlamsız gradyanlar yasaktır. |
| **Optik Tipografi** | SF Pro negative tracking | Başlık büyüdükçe daralan negatif harf aralığı (Barlow Condensed), gövdede yüksek okunabilirlik (Inter/Geist), telemetride monospaced veri (JetBrains Mono). |
| **Akışkan Yüzeyler** | Translucent Materials & Frost | Derin koyu zemin üzerine `backdrop-filter: blur(20px)` ile oturan cam plakalar, `rgba(255,255,255,0.08)` hairline sınırlar ve üst kenar ışık çizgileri (inset highlight). |
| **Yay Fiziği (Spring Motion)** | Kütle, sertlik ve sönümleme | Mekanik lineer geçişler yerine interruptible (kesintiye uğrayabilir) yay fiziği; sayfa geçişlerinde View Transitions. |
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

Apex, Apple'ın yüksek kontrastlı koyu mod (Dark Mode First) felsefesini kullanır. Saf siyah (`#000000`) yerine gözü yormayan derin nötrler ve tek bir imza kırmızısı hakimdir.

### 3.1 Zemin ve Yüzeyler

| Token | Değer | Rol & Kullanım |
| :--- | :--- | :--- |
| `--bg` | `#0a0a0a` | Birincil sayfa zemini (OLED dostu, hafif sıcak koyu) |
| `--surface` | `#121212` | Standart bento kartları, paneller ve kapalı yüzeyler |
| `--surface-raised` | `#1c1c1c` | Hover durumları, açılır menüler, modal zeminleri |
| `--surface-glass` | `rgba(255, 255, 255, 0.05)` | Apple translucent cam yüzey (`backdrop-blur: 20px`) |
| `--hairline` | `rgba(255, 255, 255, 0.08)` | Minimum kart sınırları, ayırıcı çizgiler |
| `--hairline-raised` | `rgba(255, 255, 255, 0.16)` | Odaklanan veya aktif olan kart sınırları |

### 3.2 Vurgu ve Aksiyon (Interactive Accent)

| Token | Değer | Rol & Kullanım |
| :--- | :--- | :--- |
| `--accent` | `#ff1801` | **Apex Red** — Birincil etkileşim, canlı seans, aktif sekme |
| `--accent-hover` | `#e01500` | Buton ve link hover durumu |
| `--accent-subtle` | `rgba(255, 24, 1, 0.12)` | Kırmızı rozet arka planı, seans canlılık halesi |
| `--accent-border` | `rgba(255, 24, 1, 0.35)` | Seçili öğe veya odak sınırı |

### 3.3 Tipografik Kontrast (WCAG 2.2 AA)

| Token | Değer | Kontrast | Rol |
| :--- | :--- | :--- | :--- |
| `--text-hi` | `#fafafa` | 19.5:1 | Büyük başlıklar, pilot isimleri, puan rakamları |
| `--text` | `#e0e0e0` | 15.6:1 | Gövde metinleri, makale paragrafları |
| `--text-mid` | `#a3a3a3` | 8.5:1 | Alt başlıklar, ikincil etiketler, meta bilgiler |
| `--text-low` | `#737373` | 4.7:1 | Dipnotlar, devre dışı elemanlar, pasif simgeler |

### 3.4 Telemetri Durum Renkleri (FIA & F1 Standartları)

| Token | Değer | Anlam |
| :--- | :--- | :--- |
| `--telemetry-purple` | `#b356fe` | En Hızlı Tur / En Hızlı Sektör (Purple Sector) |
| `--telemetry-green` | `#00d26a` | Kişisel En İyi Sektör / Sıralama Kazanımı (Green Sector) |
| `--telemetry-yellow` | `#fecb00` | Sarı Bayrak / Sektör İçi Zaman Kaybı |
| `--telemetry-red` | `#ff3b30` | Kırmızı Bayrak / Kaza / DNF |

---

## 4. Tipografi Sistemi ve Optik Ölçekleme

Apex, hiyerarşik netlik için 3 font ailesi kullanır:

1. **Barlow Condensed (`--font-condensed`):** Başlıklar, editoryal afişler, büyük yarış numaraları.
2. **Inter / Geist / system-ui (`--font-sans`):** Gövde metinleri, navigasyon, düğmeler, açıklamalar.
3. **JetBrains Mono (`--font-mono`):** Telemetri, zaman farkları, tur süreleri, teknik parametreler (`tabular-nums`).

### 4.1 Optik Harf Aralığı Kuralı (Apple Negative Tracking)

Büyük başlıklar font büyüdükçe optik olarak gevşer; bunu önlemek için eksi harf aralığı uygulanır:

| Stil | Boyut | Satır Yüksekliği | Letter Spacing | Font & Ağırlık |
| :--- | :--- | :--- | :--- | :--- |
| `.display-hero` | 56px–72px | 1.05 | `-0.03em` | Barlow Condensed 700 |
| `.headline-lg` | 34px–48px | 1.10 | `-0.02em` | Barlow Condensed 700 |
| `.headline-md` | 24px–32px | 1.18 | `-0.015em` | Barlow Condensed 600 |
| `.body-lg` | 18px–20px | 1.45 | `-0.015em` | Sans (Inter) 400 |
| `.body-md` | 15px–16px | 1.50 | `-0.011em` | Sans (Inter) 400 |
| `.label-caps` | 11px–12px | 1.30 | `+0.06em` | Mono / Sans 600 (Uppercase) |
| `.data-tabular` | 13px–15px | 1.20 | `0.00em` | JetBrains Mono (Tabular) |
| `.hero-number` | 48px–80px | 1.00 | `-0.035em` | Barlow Condensed 800 |

---

## 5. Spacing, Geometri ve Cam Yüzeyler

### 5.1 Boşluk Izgarası (4px / 8px Sistemi)
- **Mikro boşluklar:** `4px`, `8px`, `12px` (Rozetler, ikon-metin aralıkları)
- **Bileşen içi:** `16px`, `20px`, `24px` (Kart padding'leri)
- **Bölüm arası:** `48px`, `64px`, `80px` (Masaüstü sayfa dikey ritmi)
- **Maksimum genişlik:** `1440px` (`--container-max`)

### 5.2 Yarıçap (Border Radius)
- **Kartlar & Paneller:** `12px` ila `16px` (`--radius-lg: 16px`, `--radius: 12px`)
- **İç Elemanlar & Resimler:** `8px` ila `10px`
- **Etiketler & Haplar (Pills):** `9999px` (Tam yuvarlak)

### 5.3 Apple Cam Malzeme Spesifikasyonu
```css
.apex-glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
```

---

## 6. Hareket, Fizik ve Geçişler (Motion Physics)

Mekanik CSS `ease-in-out` geçişleri yerine Apple'ın fizik tabanlı yay parametreleri esastır:

```ts
export const APEX_MOTION = {
  spring: {
    type: 'spring',
    mass: 0.8,
    stiffness: 200,
    damping: 25,
  },
  snappy: {
    type: 'spring',
    mass: 0.6,
    stiffness: 280,
    damping: 30,
  },
  reduced: {
    duration: 0.01,
  },
};
```

- **Sayfa Geçişleri:** View Transitions API ile kesintisiz shared-element geçişi.
- **Kullanıcı Hareketi Kesintisi (Interruptible):** Kullanıcı tıklamayı geri aldığında veya hızlı kaydırdığında animasyon donmaz, yeni yöne yumuşakça uçar.
- **Erişilebilirlik:** `@media (prefers-reduced-motion: reduce)` altında animasyonlar sıfırlanır.

---

## 7. Veri Yoğun Sayfalar (Telemetri & Zamanlama Kuralı)

`industrial-brutalist-ui` yetkinliğinden yalnızca **bilgi yoğunluğu ve monospaced disiplin** alınır; brutalist görsel karmaşa yasaktır.

1. **Zaman Tabloları:**
   - Satır yüksekliği: Kompakt (`36px`–`42px`).
   - Sütunlar: Sürücü, Takım Rengi Çubuğu (`w-1 rounded-full`), Tur Zamanı (`1:23.456`), Sektörler (`S1: 28.1 · S2: 29.4 · S3: 25.9`), Delta (`+0.124`).
2. **Klavye ve Dokunma Erişilebilirliği:**
   - Masaüstünde tam klavye navigasyonu (`Tab` ve ok tuşları).
   - Mobilde minimum dokunma alanı: `44x44px`.
