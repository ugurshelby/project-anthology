# F1 Takım Renkleri — 2026 Güncelleme

## Yapılanlar
- Düz metin `Colors` dosyası kaldırıldı; yerine `config/team-colors.ts` TypeScript modülü eklendi.
- 2026 grid: 11 takım (Cadillac yeni, Audi Sauber/Kick Sauber yerine).
- `components/f1Data.ts`: canlı API rengi yoksa `resolveTeamUiColor()` fallback.
- `.cursor/rules/CURSOR.md`: sezonluk güncelleme hatırlatması eklendi.

## Değişen dosyalar
- `config/team-colors.ts` (yeni)
- `components/f1Data.ts`
- `.cursor/rules/CURSOR.md`
- `Colors` (silindi)

## Build
- Next.js derleme başarılı; mevcut `@vercel/node` tip hatası build'i durduruyor (önceden var).

## Sonraki adım
- Livery lansmanları sonrası Audi titanium / Cadillac tonları ince ayar.
