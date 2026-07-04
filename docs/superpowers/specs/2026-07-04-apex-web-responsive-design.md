# Apex Web Responsive Design — Spec

> **Tarih:** 2026-07-04
> **Yöntem:** Superpowers Visual Companion (brainstorming skill)
> **Durum:** Onaylandı — implementasyon bekliyor

---

## Özet

Project Anthology web arayüzü için Efendim Visual Companion üzerinden üç katmanlı tasarım kararı verdi. Canlı Vercel sitesinin mobil görünümü yetersizdi; yeni yön **sinematik yoğunluk** (mobil poster) + **split cinema** (masaüstü) kombinasyonudur.

---

## Onaylanan Kararlar

### Faz 0 — Tasarım Dili

| Seçenek | Karar |
|---|---|
| A Sinematik Editöryel | ✅ **Seçildi** |
| B Apex Refined | — |
| C Premium Minimal | — |

### Faz 1b — Mobil Kabuk

| Seçenek | Karar |
|---|---|
| 1 Cinematic Frame+ | — |
| 2 Balanced Cinema | — |
| 3 Poster Dense | ✅ **Seçildi** |

**Poster Dense özellikleri:**
- Hero ~42vh, header yok (home)
- Flat standings list (kart kabuğu yok)
- Accent pill aktif tab
- Yoğun veri, uzun scroll kabul edilebilir

### Faz 2 — Masaüstü Ana Sayfa

| Seçenek | Karar |
|---|---|
| A Poster Top + 3 Kolon | — |
| B Split Cinema | ✅ **Seçildi** |
| C Bento Poster Grid | — |

**Split Cinema özellikleri:**
- Sol 55% poster hero + countdown
- Sağ 45% scroll veri sütunu (standings + news)
- Üst sticky horizontal nav
- Mobil Poster Dense ile görsel dil uyumu

---

## Kabul Kriterleri

### Mobil (< 768px)

- [ ] Hero taşmıyor; başlık `clamp(40px, 12vw, 48px)` civarı
- [ ] İçerik tab-bar altında kalmıyor (`pb ≥ 88px`)
- [ ] Yatay scroll yok (`overflow-x: hidden` ihlali yok)
- [ ] 5 tab + More erişimi (Teams, Circuits, News, Glossary)
- [ ] Standings satırları takım renk çubuğu + avatar ile okunaklı (min 44px touch)
- [ ] WCAG kontrast 4.5:1 (text on surface)

### Masaüstü (≥ 1024px)

- [ ] Ana sayfa 55/45 split; hero min 60vh
- [ ] Sağ sütun bağımsız scroll
- [ ] Nav tüm rotaları kapsıyor
- [ ] LCP hedefi ≤ 2.5s (hero image priority)

### Ortak

- [ ] `prefers-reduced-motion` geçerli
- [ ] Token'lar `apex-design-language.md` ile uyumlu
- [ ] Mevcut veri katmanı (`lib/data/*`) değişmeden çalışıyor

---

## Uygulama Planı (özet)

| Adım | İş | Dosyalar |
|---|---|---|
| 1 | Mobil shell fix | `MobileNav.tsx`, `layout.tsx`, `globals.css` |
| 2 | `SplitHomeLayout` + `PosterHero` | `components/layout/`, `components/home/` |
| 3 | Home page refactor | `app/page.tsx` |
| 4 | Tablet breakpoint | `SplitHomeLayout` md variant |
| 5 | Diğer sayfa şablonları | Sonraki Visual Companion oturumu |

---

## Mockup Arşivi

Visual Companion dosyaları (gitignore altında):

```
.superpowers/brainstorm/43964-*/content/
  01-design-language.html
  02-mobile-shell.html
  03-mobile-shell-detailed.html  ← mobil onay
  04-desktop-layout-detailed.html ← masaüstü onay
```

---

## Sonraki Adım

Efendim spec'i onayladıktan sonra `WEB-UI` implementasyonuna geçilir. İlk hedef: **mobil responsive fix + home Split Cinema/Poster Dense**.
