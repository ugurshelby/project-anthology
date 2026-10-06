# README — `docs/design/` Kullanım Kılavuzu

> **Tasarım Otoritesi:** Apex için bağlayıcı tasarım anayasası `docs/design/apex-design.md` (Apple tasarım prensipleri sentezi) ve `docs/design/apex-design-language.md`'dir. Resmi token tanımları `docs/design/tokens.json` dosyasındadır.  
> **Temel Amaç ve Vizyon:** `docs/vision/apex-vision.md`  
> **Son güncelleme:** 2026-10-06

---

## 1. Klasör Yapısı

```
docs/design/
├── README.md                      ← Bu dosya (kılavuz & dizin)
├── apex-design.md                 ← MASTER TASARIM SİSTEMİ (Tek anayasa)
├── apex-design-language.md        ← Apex görsel dili ve kabuk kararları
├── tokens.json                    ← W3C formatında resmi tasarım token'ları
├── universal-design-principles.md ← Evrensel UX ilkeleri (arkaplan)
├── ux-laws-reference.md           ← Davranışsal UX yasaları (arkaplan)
├── premium-design-philosophy.md   ← Premium tasarım felsefesi (arkaplan)
├── tasarim-skilleri-rehberi.md    ← Tasarım yetkinlikleri kullanım notları
└── skills/                        ← Onaylı 5 katmanlı tasarım skilleri
    ├── apple-design/              ← Katman 1: Temel Otorite (Foundational)
    ├── high-end-visual-design/    ← Katman 2: Bileşen & Yerleşim (Execution)
    ├── minimalist-ui/             ← Katman 2: Bileşen & Yerleşim (Execution)
    ├── industrial-brutalist-ui/   ← Katman 3: Telemetri & Zamanlama (Filtrelenmiş)
    ├── react-view-transitions/    ← Katman 4: Hareket & Geçişler (Motion)
    ├── ui-ux-pro-max/             ← Katman 5: Kalite & Ergonomi Denetimi (Audit)
    └── accesslint-audit/          ← Katman 5: WCAG 2.2 AA Erişilebilirlik Denetimi
```

---

## 2. Tasarım Sistemi Hiyerarşisi

1. **Birincil Otorite (`apex-design.md`):**  
   Tipografi ölçekleri (Barlow Condensed optik negatif tracking, Inter gövde, JetBrains Mono telemetri), renk skalası (Apex Red `#ff1801`, OLED zemin `#0a0a0a`), Apple cam yüzeyleri (`backdrop-blur: 20px`), yay fiziği (Framer Motion springs) ve telemetri yoğunluk kuralları buradan okunur.
2. **Kabuk & Sayfa Düzeni (`apex-design-language.md`):**  
   Masaüstü Split Cinema ve Mobil Poster Dense düzenleri, safe-area ve tab-bar mimarisi.
3. **Resmi Token'lar (`tokens.json`):**  
   Tüm CSS/Tailwind değişkenlerinin W3C uyumlu tek kaynağı.
4. **Katmanlı Skill Orkestrasyonu (`skills/`):**  
   Tasarım araçlarının birbiriyle çelişmesini engelleyen 5 katmanlı yapı.
