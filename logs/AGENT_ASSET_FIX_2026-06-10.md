# AGENT — Asset/Build Fix Sprint — 2026-06-10

Paralel çalışma: Cursor aynı anda asset/renk işleri yapıyordu (public/drivers, public/teams SVG, config/team-colors.ts, assets/, MISSING_ASSETS.md). Bunlara **dokunulmadı**.

## Ne yapıldı

### 1. CSP — frame-src eklendi
- `next.config.ts` içindeki CSP dizisine `frame-src 'self' https://vercel.live` eklendi (font-src ile connect-src arası).
- `script-src` ve `connect-src` **değiştirilmedi**.
- Amaç: Vercel Live (preview yorum/feedback toolbar) iframe'lerinin CSP tarafından bloklanmaması.

### 2. Submodule sorunu → ZATEN ÇÖZÜLMÜŞ (Cursor tarafından)
- **Kök neden (doğrulandı):** `assets/f1-circuits` git'te gitlink (mode `160000`) olarak kayıtlıydı ama `.gitmodules` yoktu → Vercel "Failed to fetch one or more git submodules".
- **Tespit:** Hiçbir kaynak dosya `assets/f1-circuits`'i import etmiyor (grep boş). Runtime `public/circuits/` (24 SVG, commit'li) kullanıyor — submodule'den bağımsız.
- **DURUM:** Bu sprint sırasında Cursor paralelde `a51e207` commit'i ("fix: normalize driver slug special characters") ile submodule'ü zaten düz dosya ağacına çevirmiş. HEAD'de (`fbd4950`) `assets/f1-circuits` artık `040000 tree` (gitlink değil). Benim aynı işlemim (`git rm --cached` + inner `.git` sil + `git add`) **no-op** oldu (stage edilecek fark yok). Çözüm A doğruydu, sadece Cursor önce uyguladı.
- **Net sonuç:** gitlink yok, `.gitmodules` yok → Vercel submodule fetch denemeyecek. Ayrı commit'e gerek kalmadı.

### 3. Driver slug resolver — özel karakter normalizasyonu
- `lib/assets/f1-icons.ts`:
  - Yeni `normalizeDiacritics()` helper: Unicode NFD + combining mark temizliği (ä→a, é→e, ü→u, ö→o, ñ→n…), ß→ss, ø→o, đ→d, ł→l, nokta/apostrof temizliği (jr.→jr), alt çizgi normalizasyonu.
  - `ERGAST_SLUG_ALIASES`'e özel karakterli güvenlik-ağı girdileri eklendi. **ÖNEMLİ düzeltme:** Asset dosyaları disk'te surname-only (raikkonen.svg, perez.svg, hulkenberg.svg, sainz.svg) — bu yüzden aliaslar tam `kimi_raikkonen` formuna değil, gerçek dosya adına (surname) map ediliyor:
    - `kimi_räikkönen` / `kimi_raikkonen` → `raikkonen`
    - `sergio_pérez` → `perez`
    - `nico_hülkenberg` → `hulkenberg`
    - `carlos_sainz_jr.` / `carlos_sainz_jr` → `sainz`
  - `slugFromDriverId`, `slugFromSurname`, `ergastIdFromName` ve `resolveDriverSlug`'ın `_` dalı: alias → normalize → alias zinciriyle aksanlı isimleri ASCII basename'e indiriyor.
- Test: `tests/f1-icons.test.ts`'e 5 yeni diacritic regresyon testi eklendi (Räikkönen→raikkonen, Pérez→perez, Hülkenberg→hulkenberg, "Sainz Jr." trailing-dot, ASCII-only path garantisi).

### 4. sync-radio cron tetiklendi
- `curl.exe -X GET .../api/cron/sync-radio -H "Authorization: Bearer <CRON_SECRET_KEY>"`
- **Sonuç: HTTP 200** — `{ source: openf1, year: 2026, sessions: 30, upserted: 82, skipped: 26, errors: ["session 11428: OpenF1 exhausted retries for drivers"], durationMs: 95831 }`
- 82 radio moment upsert edildi. 1 session'da geçici OpenF1 retry tükenmesi (rate-limit kaynaklı, non-fatal).

## Değişen dosyalar (bu ajan tarafından commit edilen)
- `next.config.ts` (CSP frame-src) — commit `427742d`
- `lib/assets/f1-icons.ts` (normalizeDiacritics + alias + resolver dalları) — commit `aa26ee9`
- `tests/f1-icons.test.ts` (5 yeni test) — commit `aa26ee9`
- `logs/AGENT_ASSET_FIX_2026-06-10.md` (bu log)

> Not: `assets/f1-circuits/**` (gitlink → düz dosya) Cursor'un `a51e207` commit'inde zaten yapılmıştı; bu ajan dokunmadı. Cursor'un lane'indeki dosyalara (`app/layout.tsx`, `package.json`, `package-lock.json`, `assets/scripts/`, `config/team-colors.ts`, `public/drivers|teams/`) **dokunulmadı**.

## Çalıştırılan komutlar
- `git rm --cached assets/f1-circuits` + `rm -rf assets/f1-circuits/.git` + `git add assets/f1-circuits`
- `npm run build` → **exit 0, sıfır hata** (48/48 statik sayfa üretildi)
- `npx vitest run` → **20/20 test geçti**
- sync-radio cron curl → HTTP 200

## Karşılaşılan sorunlar ve çözümleri
- **Build lock:** İlk `npm run build` "Another next build process is already running" verdi. Sebep: Cursor'un paralel `next build`'i (PID 77576) çalışıyordu. Cursor'un işini bozmamak için process'i **öldürmedim**; bitmesini bekleyip (background poll) sonra kendi build'imi çalıştırdım.
- **Alias hedefi yanlışlığı:** İlk sürümde aliaslar `sergio_perez` gibi tam forma map ediliyordu; disk kontrolü asset'lerin surname-only olduğunu gösterince (perez.svg) surname'e düzeltildi — aksi halde 404 üretirdi.

## Sonraki adım
- Cursor'un asset rename işi bitince, yeni eklenen pilotların disk basename'leri ile resolver'ın ürettiği slug'ları çapraz doğrula (özellikle 2026 kadrosu).
- Vercel'da bir sonraki deploy'da submodule hatasının gittiğini build log'undan teyit et.
