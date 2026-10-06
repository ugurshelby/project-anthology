---
name: accesslint-audit
description: Accessibility and WCAG 2.2 AA audit skill for contrast, keyboard focus, screen readers, and touch targets across Apex.
---

# AccessLint Audit (Apex Layer 5 — Erişilebilirlik & WCAG Denetimi)

Bu yetkinlik; Apex genelindeki tüm sayfa ve bileşenlerin WCAG 2.2 AA standartlarına tam uyumunu garanti eder.

## Denetim Eksenleri

1. **Renk Kontrastı (WCAG AA):**
   - Normal metin: Arka plan ile minimum `4.5:1` kontrast oranı.
   - Büyük metin (18pt+ veya 14pt bold): Minimum `3:1` kontrast oranı.
   - UI kontrolleri ve ikonlar: Minimum `3:1` kontrast oranı.
2. **Klavye Erişilebilirliği & Görünür Odak:**
   - Sayfadaki her etkileşimli öğeye `Tab` tuşuyla kesintisiz erişilebilmeli.
   - Görünür odak halkası (`outline: 2px solid var(--accent)` veya yüksek kontrastlı halka) asla gizlenmemeli (`outline: none` yasak).
3. **Ekran Okuyucu Desteği (ARIA & Semantik HTML):**
   - Görsel kartlarda açıklayıcı `aria-label`.
   - İstatistik ve telemetri tablolarında doğru `th`, `td` ve `scope` etiketleri.
4. **Hareket Duyarlılığı:**
   - `@media (prefers-reduced-motion: reduce)` ile tüm animasyonların zararsızlaştırılması.
