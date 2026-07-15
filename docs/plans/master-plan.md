# Anthology (Apex) — Master Plan

> Agent'ın tek plan kaynağı. Yeni iş buraya madde eklenir, bitince `[x]` işaretlenir.
> Eski detaylı faz geçmişi: `docs/PLAN.md` (2026-06-26 snapshot).
>
> **Canlı:** https://project-anthology-five.vercel.app
> **Son güncelleme:** 2026-07-04

---

## Mevcut Durum (Brownfield)

| Alan | Durum |
|---|---|
| Web backend + veri katmanı | ✅ Çalışıyor (Supabase, 3 cron + notify) |
| Web frontend | 🟡 Bileşenler var; tasarım dili onaylandı — mobil responsive fix + home refactor sırada |
| Mobil (Expo 56) | ✅ 5 tab + detay ekranları; EAS build boyutu sorunu açık |
| Tasarım otoritesi | ✅ `docs/design/apex-design-language.md` + `docs/design/design.md/` |

**Kritik kısıt:** `lib/f1Calendar.ts` tek temporal kaynak; sezon/pilot/takım hardcode yok.

---

## Açık İşler

### 🔴 Manuel — Efendim aksiyonu

- [x] Vercel production deploy (push bildirim gönderme tarafı) — 2026-07-15, `49bda3f`
- [ ] **Railway cron kur:** `apex-notify-sessions-cron` servisi (5-10dk schedule, `SITE_URL`+`CRON_SECRET`). Kod/kalıp hazır (`railway/apex-notify-sessions-cron/`); panelden servis oluşturmak Efendim'de. NOT: `vercel.json`'a cron EKLENMEDİ (Hobby = 1 cron/gün).
- [x] EAS build test: preview APK alındı — 2026-07-15, build `6e9bd8f1`

### 🟠 EAS Build — Monorepo arşiv boyutu

- [x] `.easignore` genişletildi (`../node_modules/`, `../.next/`, `../.git/`)
- [x] Preview build al — upload 858 MB → **1.2 MB'a düştü**, sorun çözüldü (2026-07-15)

### 🤖 WEB-UI — Web responsive + home refactor

**Tasarım onaylandı (2026-07-04):** Sinematik A · Mobil Poster Dense · Masaüstü Split Cinema.
Spec: `docs/design/apex-design-language.md`

- [x] WEB-UI.0: Visual Companion tasarım kararları (dil + mobil kabuk + desktop home)
- [x] WEB-UI.1: Mobil shell fix (pb safe-area, hero clamp, tab-bar 5+More, overflow-x)
- [x] WEB-UI.2: `SplitHomeLayout` + `PosterHero` bileşenleri
- [x] WEB-UI.3: Home refactor (`app/page.tsx`) — Split Cinema desktop / Poster Dense mobile
- [ ] WEB-UI.4: Tablet breakpoint (md)
- [ ] WEB-UI.5: Season sayfası layout (Visual Companion Faz 3)
- [ ] WEB-UI.6: Liste şablonu (drivers, teams, circuits, news, anthology, glossary)
- [ ] WEB-UI.7: Detay şablonu (driver, team, circuit, story)
- [ ] WEB-UI.8: Lighthouse (LCP ≤2.5s, CLS <0.1, a11y ≥95)

### 🤖 VERİ-GÜNCELLİK

- [ ] 2026 sezon snapshot Jolpica ile kalıcı DB doldurması
- [ ] Production `seed:f1db` — Past Winners 2018–2025 dolu mu?
- [~] Push bildirim cron: endpoint `/api/cron/notify-sessions` canlıda (401 auth OK), `notified_sessions` tablosu uygulandı. Canlı uçtan-uca test Railway cron kurulunca yapılabilir.

### 🤖 MOBİL-OTA (EAS build sonrası)

- [ ] Cihazda Expo Go / preview test
- [ ] App Store / Google Play hesap (manuel)
- [ ] Production build + `eas submit`

---

## Teknik Borç

| Madde | Tetik |
|---|---|
| GitHub Actions race-aware hourly cron | Billing + `CRON_SECRET_KEY` secret |
| Pit-stop verisi | Ayrı kaynak gerekli |
| 2025 eksik driver SVG (tsunoda, lawson) | AssetFallback OK |
| `public/stories/` stray klasörler | Silinebilir |
| Playwright e2e suite | Lighthouse/a11y otomasyonu |
| Upstash env Vercel'de | `UPSTASH_REDIS_REST_URL` + `_TOKEN` |

---

## Referans

| Dosya | İçerik |
|---|---|
| `docs/reference/proje-dizini.md` | Dizin haritası |
| `docs/reference/mimari.md` | Backend mimarisi |
| `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` | Tuzaklar + kararlar |
| `docs/vision/technical.md` | Agent teknik özet |
| `docs/design/apex-design-language.md` | Apex özel tasarım dili (onaylı kararlar) |
| `docs/design/design.md/` | Genel tasarım prensipleri |
