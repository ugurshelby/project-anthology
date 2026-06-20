# Çalışma Anayasası
/graphify skill'ini kullanarak token tasarrufu ve kalite dengesini sağla.
## 1. Başlamadan Önce
- `docs/reference/proje-dizini.md` oku.
- Frontend işiyse: `docs/reference/apex-design-system.md` ve `.cursor/rules/design-rules.md` oku.
- Sezon/yıl/takım/pilot belirsizse: `lib/f1Calendar` → `getF1Context()`.

## 2. Sırayla Çalış
- Backend ve mimari önce, frontend sonra.
- Değiştirmeden önce ilgili dosyayı oku.
- Silmeden önce yedekle veya uyar.

## 3. Sabit Kurallar
- Sezon/takım/pilot hardcode yok — tek kaynak `lib/f1Calendar`.
- Dış API çağrıları server-side; client'a API key sızmaz.
- Supabase: server-side service role, client-side anon.
- Env var: hem `.env.local` hem Vercel dashboard'da.
- Kritik fonksiyonlar Sentry / `lib/logger` ile sarılı.
- Yorum değil kod; gereksiz açıklama yazma.

## 4. Her Değişiklik Sonrası (sırayla)
1. `npm run build` → sıfır hata.
2. Görsel/fonksiyonel değişiklikse: `npx playwright test` → console error / layout shift yok.
3. `logs/AGENT_{KONU}_{TARIH}.md` yaz.
4. **`docs/apex-production-plan-20-06-2026.md` güncelle** — tamamlanan görevlerin `[ ]`'ini `[x]` yap. Commit öncesi yapılır, atlanamaz.
5. Commit (açıklayıcı mesaj; büyük adım = ayrı commit).

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