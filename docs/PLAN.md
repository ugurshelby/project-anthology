# Anthology (Apex) — Ana Üretim Planı

> **Amaç:** Projenin uzun vadeli iş akışını izleyen ana plan. Tamamlananlar kısa özetle korunur;
> devam eden ve sıradaki fazlar yüksek seviyede tanımlanır.
>
> **Canlı URL:** `https://project-anthology-five.vercel.app`
> **Branch:** `feat/apex-frontend-rebuild`
>
> **Son güncelleme:** 2026-06-26

---

## TAMAMLANMIŞ FAZLAR

| Faz | Özet | Commit |
|-----|------|--------|
| **Platform Altyapısı** | Next.js 16 + Supabase + Vercel deploy; 3 cron (sync-news, sync-f1, sync-radio); `lib/f1Calendar` tek temporal kaynak | Phase 0–8 |
| **Veri Katmanı** | F1DB seed (1950→), Jolpica canlı sync, OpenF1 radyo, RSS haber aggregate; 3-tier fallback okuma katmanı; staleness guard | Phase 5FIX/5FIX2 |
| **DB Güvenlik** | RLS + service_role ayrımı; CRON_SECRET timing-safe auth; Upstash rate-limit; CSP + HSTS header'ları | `be5df1b` |
| **Push Bildirim Backend** | `/api/push/register` + `/api/cron/notify`; `push_subscriptions` tablosu; Expo token validasyonu; anon RLS revoke | `4496084` |
| **Frontend Sıfırlama** | Tüm `components/` silindi; `app/**/page.tsx` iskelet placeholder'a indirildi; `app/globals.css` token + reset | 2026-06-21 |
| **Mobil Uygulama (12 Task)** | Expo SDK 56 + Expo Router 4; 5 tab (Home, Season, Profiles, Anthology, News+Glossary); pilot/takım/hikaye detay ekranları; push bildirim tercihleri; EAS build config | `7c14742` |
| **Mobil Güvenlik Fix** | `push_subscriptions` anon RLS revoked; `Expo.isExpoPushToken()` validasyonu eklendi | `4496084` |
| **Docs Temizliği** | F1 Race Replay (57 Python dosyası), stale frontend planı, mükerrer proje-dizini silindi | `bed0905` |

---

## AKTİF DURUM

### 🟠 EAS Build — Çözüm Bekliyor (MANUEL)

`mobile/` klasörü `anthology/` monoreposunun içinde olduğu için EAS arşivi 858 MB çıkıyor.

**Uygulanan fix:** `.easignore` genişletildi — `../node_modules/`, `../.next/`, `../.git/` eklendi (`9de2b2d`).

**Bir sonraki adım:** Aşağıdaki komutu çalıştır ve arşiv boyutunu gözlemle:

```bash
cd mobile
eas build --platform android --profile preview
```

Eğer hâlâ > 200 MB gelirse → `eas.json`'a `"projectRoot": "."` + `"buildDir": "../"` monorepo konfigürasyonu dene.  
Son çare: `mobile/` klasörünü standalone repo olarak kopyala.

---

### ⚠️ MANUEL AKSİYON GEREKLİ

1. **Vercel deploy** — Push bildirim backend değişikliklerini (vercel.json 4. cron + `/api/push/*`) production'a push et.
2. **EAS CLI güncelle** — `npm install -g eas-cli` (mevcut: 20.4.0, güncel değil).

---

## SIRADAKI FAZLAR

### FAZ WEB-UI — Web Frontend Yeniden İnşa (🤖 AGENT)

Frontend tamamen sıfırlandı (`components/` silindi, sayfalar iskelet). Yeni tasarım dili `design/design.md`'den gelir.

**Ön koşul:** Kullanıcı `design/design.md`'yi teslim etmiş olmalı.

- **WEB-UI.A:** Tasarım token'ları + temel atomlar (Button, Card, Typography, Badge)
- **WEB-UI.B:** Layout (Header/Nav/Footer) + global animasyon sistemi
- **WEB-UI.C:** Home sayfası — bento dashboard, race countdown, standings özeti, son haberler
- **WEB-UI.D:** Season sayfası — standings tablosu, takvim, round detay
- **WEB-UI.E:** Profiles — pilot/takım listeleri + detay sayfaları
- **WEB-UI.F:** Anthology — hikaye kartları + parallax detay
- **WEB-UI.G:** News + Tech Glossary
- **WEB-UI.H:** Lighthouse audit (LCP ≤ 2.5 s, CLS < 0.1, a11y ≥ 95)

Alt-plan: `docs/superpowers/plans/` (oluşturulduğunda buraya ref verilecek)

---

### FAZ MOBİL-OTA — OTA Update & Store (🔴 MANUEL + 🤖)

EAS build başarıyla alındıktan sonra:

- **MOBİL-OTA.A:** Expo Go veya preview build cihazda test
- **MOBİL-OTA.B:** App Store / Google Play hesap kurulumu (manuel)
- **MOBİL-OTA.C:** Production build + submit (`eas submit`)

---

### FAZ VERİ-GÜNCELLİK — DB & Cron Sağlık Kontrolü (🤖 AGENT)

- 2026 sezon snapshot'ı Jolpica ile güncelle (content-invalid guard geçici çözüm, kalıcı DB doldurması yapılmalı)
- `seed:f1db` production'da çalıştırıldı mı? Past Winners 2018–2025 dolu mu?
- Push bildirim cron (`/api/cron/notify`) canlı test

Alt-plan: `docs/plans/veri-guncellik.md` (gerektiğinde oluşturulacak)

---

### FAZ STATS — Gelişmiş İstatistikler (🤖 AGENT)

- Pit-stop verisi için ayrı kaynak entegrasyonu (şu an season records'ta yok)
- Tarihsel takım renkleri genişletme (`team-colors.ts` yalnız 2026 grid)
- Mid-season iki-takımlı pilot resolver (team-aware slug)

---

## TEKNİK BORÇ

| Madde | Tetik |
|-------|-------|
| GitHub Actions race-aware hourly cron | Billing kararı + `CRON_SECRET_KEY` secret ekleme |
| Pit-stop verisi | Ayrı kaynak (şu an yok) |
| 2025 eksik driver SVG (tsunoda, lawson) | AssetFallback OK, kalıcı fix opsiyonel |
| `public/stories/` 3 stray klasör | `Full 1280x720` export artığı, silinebilir |
| Playwright e2e test suite | Lighthouse ve a11y otomasyonu için gerekli |
| Upstash env → Vercel dashboard | `UPSTASH_REDIS_REST_URL` + `_TOKEN` hâlâ eksik mi? |

---

## REFERANS DOSYALAR

| Dosya | İçerik |
|-------|--------|
| `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` | Tekrarlanmaması gereken hatalar + mimari kararlar |
| `docs/reference/proje-dizini.md` | Kök dizin haritası + katman açıklamaları |
| `docs/reference/mimari.md` | Backend mimarisi, veri akışı, API rotaları |
| `docs/superpowers/specs/2026-06-25-mobile-app-design.md` | Mobil uygulama tasarım spec'i |
| `docs/superpowers/plans/2026-06-25-mobile-app.md` | Mobil uygulama 12-task implementasyon planı |
| `docs/guides/weather-widget.md` | Hava durumu widget teknik notu |
| `design/design.md` | Web frontend TEK tasarım otoritesi |
| `lib/f1Calendar.ts` | F1 temporal tek kaynak |
| `mobile/.easignore` | EAS build dışlama listesi |
| `supabase/migrations/` | DB migration'ları |
| `vercel.json` | Cron zamanlaması |
