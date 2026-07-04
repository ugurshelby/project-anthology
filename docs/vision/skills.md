# Skill Referansı — Project Anthology

> Tetikleyici → skill eşlemesi. Cursor'da ilgili skill dosyasını okuyup uygula.
> Kural dosyası: `.cursor/rules/CURSOR.mdc` Bölüm 5 (özet tablo).

**Son güncelleme:** 2026-07-04

---

## Tasarım & UI

| Tetikleyici | Skill | Ne zaman |
|---|---|---|
| Yeni bileşen / sıfırdan UI | `high-end-visual-design` | Web veya mobil yeni UI parçası |
| Tasarım review / denetim | `ui-ux-pro-max` | Mevcut arayüz kalite kontrolü |
| Mevcut sayfayı premium'a çekme | `redesign-existing-projects` | Brownfield UI iyileştirme |
| Estetik yön / anti-template | `frontend-design`, `design-taste-frontend` | Genel görsel yön kararı |
| GSAP motion + editorial | `gpt-taste` | Hareketli editoryal sayfalar |
| Data-heavy / brutalist | `industrial-brutalist-ui` | Dashboard, yoğun veri UI |
| Temiz minimal | `minimalist-ui` | Sade arayüz |
| Web referans görsel | `imagegen-frontend-web` | Mockup/asset üretimi |
| Mobil referans görsel | `imagegen-frontend-mobile` | Mobil mockup |
| Görselden kod | `image-to-code` | Screenshot → implementasyon |
| Marka kimliği | `brandkit` | Renk, tipografi, marka sistemi |
| Sayfa geçişi animasyon | `react-view-transitions` | Shared element transitions |

**Not:** Tasarım skill'leri aktifken `docs/design/` ilham kaynağıdır; mevcut dille çelişme yaratma.

---

## Geliştirme & Altyapı

| Tetikleyici | Skill |
|---|---|
| React/Next perf, bundle | `react-best-practices`, `composition-patterns` |
| React Native / Expo | `react-native-skills` |
| Supabase DB/Auth/RLS | `supabase`, `supabase-postgres-best-practices` |
| Erişilebilirlik audit | `accesslint-audit`, `accesslint-scan`, `accesslint-diff` |
| Tam dosya çıktısı (placeholder yok) | `full-output-enforcement` |
| UI guideline denetimi | `web-design-guidelines` |

---

## Proje-Özel Skill Konumları

| Skill | Yol (proje-level) |
|---|---|
| impeccable | `.claude/skills/impeccable/` |
| stitch-skill | `.claude/skills/stitch-skill/` |
| taste-skills | `.claude/skills/taste-skills/skills/` |

User-level skill'ler Cursor `available_skills` listesinden okunur.

---

## Yeni Skill Ekleme

Efendim yeni skill kurduğunda veya işe yarayan bir skill keşfedildiğinde:
1. Bu dosyaya satır ekle
2. `.cursor/rules/CURSOR.mdc` Bölüm 5 tablosunu güncelle
3. `logs/YYYY-AA-GG.md`'ye not düş
