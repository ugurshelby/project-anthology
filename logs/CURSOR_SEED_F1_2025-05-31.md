# CURSOR — F1 Snapshots Seed

**Tarih:** 2025-05-31  
**Görev:** `scripts/seed-f1-snapshots.ts` ile `public/data/f1/` → Supabase `f1_snapshots` + `circuits`

---

## ✅ Tamamlananlar

- `scripts/seed-f1-snapshots.ts` oluşturuldu
- `package.json` → `"seed:f1": "tsx scripts/seed-f1-snapshots.ts"`
- `dotenv`, `tsx` devDependency eklendi
- Seed çalıştırıldı (`.env.local` service role key mevcut)

### Type eşlemesi

| Kaynak | `f1_snapshots.type` | `round` |
|--------|----------------------|---------|
| `driverStandings.json` | `standings_drivers` | `null` |
| `constructorStandings.json` | `standings_constructors` | `null` |
| `calendar.json` | `calendar` | `null` |
| `rounds/{n}/results.json` | `results` | `{n}` |
| `rounds/{n}/qualifying.json` | `qualifying` | `{n}` |
| `rounds/{n}/results-1.json` vb. | dosya adı (suffix) | `{n}` |
| `circuits/{id}/{year}.json` | `circuit` | JSON `round` |

### Conflict davranışı

- **2022–2024:** `ignoreDuplicates: true` (ON CONFLICT DO NOTHING)
- **2025:** normal upsert (ON CONFLICT DO UPDATE — `data`, `fetched_at`)

### Sezon başına eklenen kayıt

| Sezon | Eklenen | Atlanan | Güncellenen |
|-------|---------|---------|-------------|
| 2022 | 141 | 0 | 0 |
| 2023 | 141 | 0 | 0 |
| 2024 | 146 | 0 | 0 |
| 2025 | 0 | 0 | 147 |
| **Toplam f1_snapshots** | **428** | **0** | **147** |

- **circuits tablosu:** 29 pist güncellendi
- **Toplam `f1_snapshots` satır:** **575**

### Supabase MCP doğrulama

```sql
SELECT season, type, COUNT(*) FROM f1_snapshots
GROUP BY season, type ORDER BY season, type;
```

Sonuç: 575 satır, 4 sezon × (calendar + standings×2 + circuit×29 + round dosyaları)

---

## ❌ Hatalar

Yok.

---

## 📁 Değiştirilen dosyalar

- `scripts/seed-f1-snapshots.ts` (yeni)
- `package.json`
- `package-lock.json`
- `logs/CURSOR_SEED_F1_2025-05-31.md` (bu dosya)

---

## Sonraki adım

- `api/f1-db.ts` → `f1_snapshots` tablosuna migrate et (legacy `f1_season_snapshots` / `f1_round_snapshots` kaldır)
