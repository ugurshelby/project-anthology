# AGENT LOG — FAZ 6 Görsel QA & Mobil Sertleştirme
**Tarih:** 2026-06-21
**Commit:** `fix: phase 6 — mobile render bugs, news hierarchy, accent discipline`
**Skill üçlüsü:** frontend-design + impeccable (audit) + ui-ux-pro-max. `design-sync` kullanılmadı (claude.ai design-system senkronu; lokal CSS/layout işine uygun değil).

---

## Kaynak
12 rota × desktop (1440) + iPhone 14 Pro Max (430@3x) tam-kapsam görsel denetim. Kullanıcı sayfa-sayfa bulgu raporu verdi; en kritik üç madde: (1) Season mobil tam-ekran kırmızı bug, (2) News hiyerarşi/ASSET, (3) puan renkleri A1.

---

## En kritik bug: "kırmızı blok" — kök sebep analizi

**Belirti:** `/season` mobilde hero'nun sağ yarısında tam-ekran saf kırmızı dikdörtgen. Desktop'ta yok.

**Teşhis süreci (sistematik-debugging):**
1. `overflow-x` zaten `hidden` → taşma değil.
2. `elementFromPoint(kırmızı)` → transparan `hero-content` döndü → DOM elementi değil, paint artefaktı (`pointer-events:none` katman).
3. Inline `feTurbulence` grain şüphesi → CSS data-URI'ye çevrildi → bug devam etti (yanlış hedef).
4. `hero-red-glow` şüphesi → `transparent` keyword düzeltildi, sonra linear'a çevrildi → bug devam etti.
5. **Katman izolasyon testi (DPR=2):** her `.hero-layer` tek tek `display:none` + screenshot. `hero-spotlight-right` gizlenince blok gitti.
6. **Kök sebep:** `radial-gradient(circle at 85% 15%, …)` formu mobil Chromium DPR≥2'de **solid renkli dikdörtgen** olarak raster'lanıyor — ve rengi de bozuyor (beyaz spotlight → kırmızı blok). GPU rasterizer bug'ı.

**Çözüm:** Tüm konumlandırılmış-radial atmosfer gradyanları dikey `linear-gradient`'e çevrildi. Aynı bug ailesi başka hero'larda da vardı (önleyici düzeltildi):
- `AtmosphericHero`: spotlight L/R + red-glow katmanları kaldırıldı → `.atmospheric-hero` background stack'ine linear ramp olarak katlandı (ekstra compositing surface + `isolation:isolate` artefaktı da elendi).
- `NewsFeaturedHero`: `radial-gradient(ellipse at bottom, …transparent…)` → linear; inline `feTurbulence` grain kaldırıldı.
- `home-atmosphere-*`: 3 radial → linear; inline grain → CSS data-URI tile.
- `profile-hero-glow` (driver/team detay): `radial(circle at 50% 120%)` → linear.

**Doğrulama:** prod build + Playwright DPR=3, `/season /news /drivers/[id] /teams/[id] /` → kırmızı blok tüm hero'larda gitti.

---

## Diğer düzeltmeler

### A1 (renk disiplini)
- `/drivers`, `/teams` grid puanları + season "Records" değerleri takım renginde → `var(--paper)`. Takım rengi sol-kenar şerit + bg tint'te korundu.
- GlossaryCard `+` ikonu + aliases `var(--accent)` (kırmızı) → `+` açık `--paper` / kapalı `--muted`, aliases `--muted`.

### A4 (kontrast)
- Circuits round/tarih `--muted` → `--paper` (9px → 10px).
- StoryCard kategori etiketi (MIRACLE·2011) `--muted` → `--paper` + medium weight + tracking artışı.
- News kart meta tarih/kaynak kontrastı yükseltildi.

### B3 / hiyerarşi
- **News kademe sistemi:** featured hero + max 6 görselli orta kart ("Latest") + görselsiz kompakt tek-satır liste ("More Headlines"). ASSET placeholder kartları kaldırıldı (`hasRealImage` ayrımı).
- **Circuits bento veriye bağlandı:** featured hücre = yaklaşan ilk yarış (`nextCircuitIndex`, `CircuitCard.done`), "NEXT" rozeti. `index % 6` rastgeleliği kaldırıldı.

### Hero boş alan
- `AtmosphericHero.compact` prop (`min-h-dvh` → `46vh`); liste sayfalarına uygulandı.
- Driver-detail hero `minHeight` clamp düşürüldü (340→300 / 540→460).

### Empty-state
- Anthology "Run seed/cron" dev mesajları → kullanıcı dostu empty-state; Radio Moments boşsa bölüm gizlenir.

---

## Değişen dosyalar
- `components/ui/AtmosphericHero.tsx` — compact prop + spotlight/red-glow katmanları kaldırıldı
- `components/ui/NewsFeaturedHero.tsx` — radial→linear glow, inline grain kaldırıldı
- `components/home/HomeAtmosphere.tsx` — inline grain kaldırıldı
- `app/globals.css` — atmosfer gradyanları radial→linear, grain CSS data-URI, compact hero, BOM temizlendi
- `app/news/page.tsx` — kademe hiyerarşi sistemi
- `app/drivers/page.tsx`, `app/teams/page.tsx` — puan off-white + compact hero
- `app/circuits/page.tsx` — veri-bağlı bento + NEXT rozeti + meta kontrast + compact hero
- `app/season/page.tsx`, `app/tech-glossary/page.tsx`, `app/anthology/page.tsx` — compact hero / empty-state
- `app/drivers/[driverId]/page.tsx` — hero minHeight
- `components/season/SeasonExplorer.tsx` — record değerleri off-white
- `components/ui/GlossaryCard.tsx` — + ikon/aliases nötrlendi
- `app/anthology/_components/StoryCard.tsx` — kategori etiketi kontrastı
- `lib/data/circuits.ts` — `CircuitCard.done`, `nextCircuitIndex`, veri-bağlı `circuitGridSpan`

## Kapılar
- `npm run build` → 0 hata ✓
- `npx tsc --noEmit` → 0 hata ✓
- `npm test` → 52/52 ✓
- Görsel: `test-results/screenshots/21-06-2026/{desktop,mobile}/` (12+12)

## Devredilen
- Home B3 Anthology tile entegrasyonu (regresyon riski → ayrı tur)
- Takım logosu kontrastı, pist SVG normalize, BoxBox widget canlılığı (düşük öncelik)
