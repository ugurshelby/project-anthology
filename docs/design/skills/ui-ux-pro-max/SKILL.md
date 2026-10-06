---
name: ui-ux-pro-max
description: Comprehensive UI/UX quality control, Apple design discipline verification, visual hierarchy, and ergonomics audit for Apex.
---

# UI/UX Pro Max (Apex Layer 5 — Kalite Denetimi)

Bu yetkinlik; Apex bileşenlerinin ve sayfalarının Apple tasarım disiplinine, görsel netliğe, bilgi hiyerarşisine ve ergonomik standartlara uygunluğunu denetler.

## Denetim Kontrol Listesi

1. **Apple Tasarım Disiplini:**
   - [ ] Saf siyah (`#000000`) yerine sıcak/derin nötrler (`#0a0a0a`, `#121212`, `#1c1c1c`) kullanılmış mı?
   - [ ] Kart köşeleri ve yüzey sınırları Apple yarıçap (`12px` - `16px`) ve ince hairline (`rgba(255,255,255,0.08)`) ile sınırlandırılmış mı?
   - [ ] Kart içinde kart (card-inside-card) yığılmasından kaçınılmış mı?
2. **Tipografi ve Optik Denge:**
   - [ ] Başlıklarda negatif tracking (`letter-spacing: -0.015em` ila `-0.03em`) uygulanmış mı?
   - [ ] Gövde metinleri minimum 15-16px ve 1.4-1.5 satır yüksekliğinde mi?
   - [ ] Sayısal veriler, zamanlar ve telemetriler tabular font (`JetBrains Mono` / `font-mono tabular-nums`) ile hizalı mı?
3. **Dokunma ve Ergonomi (Fitts Yasası):**
   - [ ] Mobilde tüm interaktif öğeler (butonlar, sekme pilleri, linkler) en az `44x44px` dokunma alanına sahip mi?
   - [ ] Başparmak erişim bölgesi (Thumb Zone): Sık kullanılan aksiyonlar alt navigasyon ve ekranın alt 2/3'lük kısmında mı?
4. **Görsel Sessizlik ve Odak:**
   - [ ] Apex Red (`#ff1801`) yalnızca aksiyon ve aktif durumlarda ölçülü kullanılmış mı?
   - [ ] Neon veya aşırı parlak süsleme gradyanları yasak.
