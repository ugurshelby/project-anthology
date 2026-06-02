# CURSOR — İçerik çıkarma ve Supabase seed (2025-05-31)

## Özet

✅ **Tamamlananlar**
- `data-old` → `migration-source/` kopyası (storyMetadata, storyContent, radioArchive.js)
- `npm run extract:migration` ile 17 hikaye + 14 radio JSON üretildi
- `npm run seed:stories` / `npm run seed:radio` başarılı
- Supabase MCP doğrulama: `stories` = 17, `radio_moments` = 14

## Sayılar

| Kaynak | JSON | Supabase |
|--------|------|----------|
| Hikayeler | 17 (`public/data/stories/*.json` + `index.json`) | 17 |
| Radio | 14 (`public/data/radio/index.json`) | 14 |

## Hero image mapping

Slug → `/images/stories/full|landscape|portrait/{n}.png` eşlemesi script içinde `HERO_IMAGE_BY_SLUG` ile uygulandı (1–17). DB örneği: `senna-monaco` → `full/1.png`, `sort_order` 0.

Kaynak metadata’daki `heroImage` (eski dosya yolları) artık kullanılmıyor; kapaklar numaralı PNG setine yönlendiriliyor.

## Hatalar

- İlk çalıştırmada `storyMetadata` regex’i tip annotasyonu yüzünden başarısız oldu → `[^=]*` ile düzeltildi.
- Seed script değişikliği gerekmedi; mevcut `seed-stories.ts` / `seed-radio.ts` yeni JSON yollarını okudu.

## Sonraki adım

- İsteğe bağlı: `tags` alanı kaynakta yoktu; boş dizi yazıldı.
- `npm run extract:migration` içerik güncellemelerinde tekrar çalıştırılabilir.

## Değiştirilen / eklenen dosyalar

- `migration-source/*`
- `scripts/extract-from-migration-source.ts`
- `package.json` (`extract:migration`)
- `public/data/stories/*` (17 + index)
- `public/data/radio/index.json`
