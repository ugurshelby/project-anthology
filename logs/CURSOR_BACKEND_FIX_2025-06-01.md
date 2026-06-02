# CURSOR BACKEND FIX LOG

Tarih: 2025-06-01  
Konu: Backend audit blocker düzeltmeleri (`f1-live` path validation + `test:data` env loading)

## ✅ Düzeltilen sorunlar

1. **`/api/f1-live` path validation düzeltildi**
   - `app/api/f1-live/route.ts` içinde `path` parametresi artık `?` üzerinden ayrıştırılıyor.
   - Validation artık query'siz base path üzerinde yapılıyor (`sessions?session_key=latest` -> `sessions`).
   - Aşağıdaki OpenF1 base path allowlist eklendi ve zorunlu hale getirildi:
     - `sessions`, `drivers`, `position`, `intervals`, `stints`, `pit`, `car_data`, `laps`, `race_control`, `weather`
   - Inline query parametreleri (`path` içindeki query) upstream OpenF1 isteğine forward ediliyor.
   - Test sonucu: `GET /api/f1-live?path=sessions?session_key=latest` -> **200** ve JSON payload (array).

2. **`test:data` için `.env.local` yükleme sorunu giderildi**
   - `scripts/test-data-layer.ts` başına:
     - `import { config } from 'dotenv'`
     - `config({ path: '.env.local' })`
   - Env'in modül importlarından önce etkili olması için data modülleri dinamik import ile yüklendi.
   - `scripts/load-env.ts` güncellendi:
     - Elle parse yerine `dotenv` ile `.env.local` ve `.env` (fallback) yükleniyor.
   - `dotenv` dependency kontrol edildi: mevcut (ek kurulum gerekmedi).

## ❌ Hala devam eden hatalar

- Bu çalışma kapsamında devam eden hata tespit edilmedi.

## Çalıştırılan doğrulamalar

- `curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3000/api/f1-live?path=sessions?session_key=latest"` -> `200`
- `npm run test:data` -> **PASS**
  - Stories: `17`
  - Radio: `14`
  - Circuits: `29`
- `npm run build` -> **PASS**

## Değiştirilen dosyalar

- `app/api/f1-live/route.ts`
- `scripts/test-data-layer.ts`
- `scripts/load-env.ts`
- `logs/CURSOR_BACKEND_FIX_2025-06-01.md`
