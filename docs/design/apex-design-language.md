# Apex Design Language — Project Anthology

> **Otorite:** Bu dosya Apex'e özel tasarım kararlarının tek kaynağıdır.
> Genel prensipler: `docs/design/design.md/` · Visual Companion oturumu: 2026-07-04.
>
> **Son güncelleme:** 2026-07-04

---

## 1. Marka Özü: Sinematik Editöryel (Onaylı — Faz 0)

F1 poster ve motorsport editoryalinin karanlık, yüksek kontrastlı dili.

| İlke | Kural |
|---|---|
| Atmosfer | Karanlık nötr taban, dramatik hero, ölçülü Apex Red accent |
| Tipografi kahraman | Barlow Condensed büyük başlıklar + JetBrains Mono veri/etiket |
| Veri yoğunluğu | Standings ve haberler ön planda; kart kabuğu minimum |
| AI slop yasak | Saf siyah, neon, generic gradient, template hissi yok |
| Hareket | `prefers-reduced-motion` zorunlu; accent animasyonları ölçülü |

### Token'lar (mevcut `app/globals.css` ile uyumlu)

```css
--bg: #0a0a0a;
--surface: #141414;
--surface-raised: #1c1c1c;
--hairline: #262626;
--text-hi / --text / --text-mid / --text-low
--accent: #ff1801;  /* Apex Red — tek global accent */
--radius-lg: 16px; --radius: 8px;
--container-max: 1440px;
```

### Tipografi ölçeği

| Sınıf | Kullanım | Mobil | Masaüstü |
|---|---|---|---|
| `.display-hero` | Yarış/poster başlık | 40–48px | 56–72px |
| `.headline-lg` | Sayfa başlığı | 28–34px | 34–48px |
| `.headline-md` | Kart başlığı | 20–24px | 24–32px |
| `.label-caps` | Eyebrow, sekme, meta | 10–12px | 10–12px |
| `.data-tabular` | Puan, süre, sıra | 12–14px | 13–14px |
| `.hero-number` | Büyük puan rakamı | 40–56px | 48–80px |

---

## 2. Mobil Kabuk — Poster Dense (Onaylı — Faz 1b)

**Referans mockup:** `.superpowers/brainstorm/.../03-mobile-shell-detailed.html` seçenek 3.

### Yapı

| Bölüm | Davranış |
|---|---|
| **Header** | Ana sayfada yok — yalnızca status bar + logo inline (opsiyonel). İç sayfalarda minimal geri + başlık. |
| **Hero** | ~42vh (≈270px @ 375px), tam genişlik, circuit gradient overlay, countdown altında |
| **İçerik** | Flat standings listesi — kart kabuğu yok, satır + takım renk çubuğu |
| **Alt nav** | Sabit 72px + safe-area 20px; aktif sekme **accent pill** (kırmızı arka plan) |
| **Padding** | `main` alt: `pb-[88px]` (tab-bar + safe-area) |

### Tab-bar sekmeleri (5)

`Home` · `Season` · `Drivers` · `Anthology` · `More` (Teams, Circuits, News, Glossary sheet/menu)

### Breakpoint

`< md` (768px) — Poster Dense mobil kabuk aktif.

---

## 3. Masaüstü Kabuk — Split Cinema (Onaylı — Faz 2)

**Referans mockup:** `.superpowers/brainstorm/.../04-desktop-layout-detailed.html` seçenek B.

### Ana sayfa layout (≥ lg, 1024px+)

```
┌─────────────────────────────────────────────────────────┐
│  APEX    Season · Drivers · Teams · Circuits · News …   │  ← sticky nav 52px
├──────────────────────┬──────────────────────────────────┤
│                      │  Driver Standings (scroll)       │
│   POSTER HERO        │  ─────────────────────────────   │
│   ~55% genişlik      │  1. Verstappen  156              │
│   Monaco GP          │  2. Norris      142              │
│   Countdown          │  …                               │
│                      │  The Wire (haber listesi)        │
│                      │  ~45% genişlik                   │
└──────────────────────┴──────────────────────────────────┘
```

| Alan | Ölçü / kural |
|---|---|
| Split oranı | `grid-cols-[1.1fr_0.9fr]` veya `55% / 45%` |
| Hero sol | Min-height 60vh, gradient + circuit texture, büyük condensed başlık |
| Veri sağ | `overflow-y-auto`, standings + news stack, hairline ayırıcılar |
| Nav | Tam horizontal link seti (mevcut `NAV_ITEMS`) |
| Alt nav | Yok — footer normal |

### Tablet (md–lg)

Hero üstte ~35vh, altta 2 kolon standings + news (Poster Top'a geçiş — implementasyonda `md:grid` ile).

### Mobil (< md)

Poster Dense kabuk — Split Cinema devre dışı.

---

## 4. Sayfa Şablonları (sonraki faz — henüz onaylanmadı)

| Şablon | Sayfalar | Not |
|---|---|---|
| **Dashboard** | `/` | Split Cinema (desktop) / Poster Dense (mobile) |
| **Sezon Hub** | `/season`, round detay | Ayrı Visual Companion oturumu |
| **Liste** | drivers, teams, circuits, news, anthology, glossary | Flat yoğun liste mobil |
| **Detay/Hero** | driver, team, circuit, story | Profil hero + veri |

---

## 5. Uygulama Öncelikleri

1. **Mobil fix (acil):** `pb` safe-area, hero `clamp()` mobil, horizontal scroll kaldır, tab-bar 5 sekme + More menu
2. **Home refactor:** `app/page.tsx` — Split Cinema desktop, Poster Dense mobile
3. **Layout bileşenleri:** `PosterHero`, `DataColumn`, `MobileTabBar` (pill active), `SplitHomeLayout`
4. **Responsive test:** 375px, 390px, 768px, 1024px, 1440px

---

## 6. İlişkili Dosyalar

| Dosya | İçerik |
|---|---|
| `docs/superpowers/specs/2026-07-04-apex-web-responsive-design.md` | Tam spec + kabul kriterleri |
| `app/globals.css` | Token kaynağı |
| `config/team-colors.ts` | Takım renk çubukları |
| `components/layout/` | Header, MobileNav, BentoGrid (refactor hedefi) |
