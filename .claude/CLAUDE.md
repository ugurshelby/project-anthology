# Çalışma Anayasası

> **Frontend durumu (2026-06-21):** Frontend tamamen sıfırlandı ve yeniden inşa edilecek.
> `components/` silindi; `app/**/page.tsx` sayfaları veri çağrılarını + metadata'yı koruyan
> iskelet placeholder'lara indirildi; `app/globals.css` yalnızca token + reset içeriyor.
> Backend, veri katmanı, mimari, metin içerikleri (`data/`) ve `public/` assetleri korundu.
> Yeni frontend tasarım dili kullanıcı tarafından verilecek — hazır bir tasarım anayasası YOK.

## 1. Başlamadan Önce
- `docs/reference/proje-dizini.md` oku.
- `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` — geçmiş hatalar + mimari kararlar.
- Sezon/yıl/takım/pilot belirsizse: `lib/f1Calendar` → `getF1Context()`.
- Frontend işlerinde TEK tasarım otoritesi: `design/design.md`.
- ⚠️ `design/stitch-design-pack/DESIGN.md` BİZİM DEĞİL — Stitch'in otomatik ürettiği, eski
  kırmızı-tonlu Material paletli bir taslaktır. ASLA referans alma, palet/karar çekme.
  Yalnız `design/design.md` geçerlidir.

## 2. Sırayla Çalış
- Backend ve mimari önce, frontend sonra.
- Değiştirmeden önce ilgili dosyayı oku.
- Silmeden önce yedekle veya uyar.

## 3. Sabit Kurallar (Backend & Mimari)
- Sezon/takım/pilot hardcode yok — tek kaynak `lib/f1Calendar`.
- Dış API çağrıları server-side; client'a API key sızmaz.
- Supabase: server-side service role, client-side anon.
- Env var: hem `.env.local` hem Vercel dashboard'da.
- Kritik fonksiyonlar Sentry / `lib/logger` ile sarılı.
- F1 snapshot okuma `lib/data/f1.ts` (3-tier), yazma `lib/f1Ingest.ts`.
- Asset path çözümleme `lib/assets/f1-icons.ts` (sezon parametresi zorunlu).
- Yorum değil kod; gereksiz açıklama yazma.

## 4. Her Değişiklik Sonrası (sırayla)
1. `npm run build` → sıfır hata.
2. `npx tsc --noEmit` → sıfır hata. Backend/data değişikliğinde `npm test` (vitest) → yeşil.
3. `logs/AGENT_{KONU}_{TARIH}.md` yaz (ne yapıldı, ne çalıştırıldı, ne kaldı).
4. Commit (açıklayıcı mesaj; büyük adım = ayrı commit).

## 5. Engelle, Sorma
Manuel aksiyon gerekiyorsa (Supabase dashboard, Vercel env, API key vb.):
```
⚠️ MANUEL AKSİYON GEREKLİ: [ne yapılmalı]
```
yaz, sonra devam et.

## 6. Görev Sonu Raporu (Türkçe)
```
✅ Tamamlananlar
⚠️ Manuel aksiyon gerekenler
❌ Tamamlanamayan + neden
📁 Değişen dosyalar
```
