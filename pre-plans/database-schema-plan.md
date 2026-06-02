# PLAN: Database Schema (Next.js + Supabase)

> **Kaynak gerçekliği:** Bu plan boş bir sayfadan yazılmadı. `project-anthology/`
> içinde halihazırda çalışan bir şema var:
> [`supabase/migrations/001_initial_schema.sql`](../project-anthology/supabase/migrations/001_initial_schema.sql)
> ve buna eşlenen TypeScript tipleri
> [`types/database.ts`](../project-anthology/types/database.ts).
> Eski `old-versions-valuable-files/001_f1_snapshots.sql` ise **superseded**
> (eski iki-tablolu model). Aşağıdaki plan; eski şemadaki ilişkileri koruyarak,
> mevcut şemayı *referans gerçeklik* kabul eder ve onun üstüne optimizasyon /
> eksik kapatma adımlarını tanımlar.

---

## 0. İki şemanın karşılaştırması (neden mevcut model doğru)

| Konu | Legacy (`001_f1_snapshots.sql`) | Mevcut (`001_initial_schema.sql`) | Karar |
|---|---|---|---|
| F1 snapshot saklama | **İki tablo**: `f1_season_snapshots` (PK `year, resource_type`) + `f1_round_snapshots` (PK `year, round, suffix`) | **Tek tablo**: `f1_snapshots`, `UNIQUE(season, round, type)`, `round` nullable | Mevcut model korunur. Tek tablo, sezon (round NULL) ve round verisini aynı yerde tutar → daha az JOIN, tek `upsert` yolu. |
| Mükerrer round dosyaları | `suffix` serbest metin: `results`, `results-1`, `results-2`, `qualifying`, `qualifying-1` ayrı satırlar | `type` normalize ediliyor (`roundSuffixToSnapshotType`) → `results-1/-2` hepsi `results` | Mevcut model korunur, normalization **migration'a taşınmalı** (bkz. §3.2). |
| `updated_at` | Manuel `updated_at` kolonu | `fetched_at` + trigger'lı `updated_at` (stories/circuits) | Mevcut model korunur. |
| RLS | Sadece snapshot tabloları | Tüm tablolar; `published` bazlı public read | Mevcut model korunur. |

**Sonuç:** Eski `001_f1_snapshots.sql` migration'ı yeni projeye **taşınmaz**.
Mantığı (Ergast `MRData` zarfını `jsonb` olarak saklamak, yıl/round/tip üçlüsü
ile tekilleştirmek) zaten `f1_snapshots` içinde yaşıyor.

---

## 1. Mevcut tablolar (referans — değişmez çekirdek)

Aşağıdaki beş tablo `001_initial_schema.sql` içinde tanımlı ve korunacak:

- **`stories`** — anthology hikayeleri. `slug` UNIQUE, `content jsonb`, `published` flag, `sort_order`.
- **`radio_moments`** — telsiz anları. `slug` UNIQUE, `driver`/`team`/`constructor_id`, `year`/`round`/`gp_name`.
- **`circuits`** — pist editöryel + agregasyon. PK `id text` (Ergast `circuitId`), `data jsonb` (yıllara göre özet).
- **`f1_snapshots`** — Ergast/Jolpica `MRData` snapshot'ları. `UNIQUE(season, round, type)`, `data jsonb`, `source`.
- **`news_cache`** — haber önbelleği. `url` UNIQUE, `published_at`, `summary`, `tags`.

### 1.1 Tipler / data types (mevcut — doğru)
- F1 ham veri → `jsonb` (`f1_snapshots.data`, `circuits.data`, `stories.content`). Ergast zarfı şekil değiştirebildiği için relational'a açmak yerine `jsonb` saklamak **bilinçli ve doğru** bir karar.
- Tarihler → `timestamptz` (`published_at`, `fetched_at`, `created_at`).
- Sayısal alanlar → `integer` / `numeric` (`lap_length_km numeric`).
- Diziler → `text[]` (`tags`, `character_tags`).
- `overtaking_difficulty` → `CHECK (BETWEEN 1 AND 5)` — domain constraint korunur.

---

## 2. Eski şemadan korunan ilişkiler (preserved relations)

Eski sistem **gerçek foreign key kullanmıyordu** — ilişkiler "soft" idi (string `circuitId`,
`constructorId` ile eşleşme). Bu kasıtlıydı çünkü Ergast verisi dış kaynak ve referans
bütünlüğü garanti edilemez. Yeni şemada bu soft ilişkiler **belgelenir ve indekslenir**,
ama sert FK constraint'ler yalnızca *bizim ürettiğimiz* tablolar arasında kurulur.

Mantıksal (logical) ilişki haritası:

```
circuits.id (text, "monaco")
   ▲
   │ soft ref (Ergast circuitId — jsonb içinde)
   │
f1_snapshots.data->Circuit->circuitId      radio_moments.constructor_id ──► team-colors.ts (config, DB değil)
f1_snapshots (season, round) ──────────────► radio_moments (year, round)   [soft, raporlama amaçlı]
```

### 2.1 Eklenebilecek sert FK'ler (opsiyonel, düşük riskli)
- `radio_moments.constructor_id` → bir `constructors` tablosu **yok** (renkler `config/team-colors.ts`'de). FK kurma; bunun yerine §4'teki opsiyonel `constructors` tablosu değerlendirilir.
- `radio_moments` → `circuits`: telsiz anı bir piste bağlıysa `circuit_id text REFERENCES circuits(id)` eklenebilir. **Öneri:** `ON DELETE SET NULL`. Düşük öncelik.

---

## 3. Optimizasyonlar (mevcut şemanın üstüne — migration `002`)

Yeni bir migration dosyası: `project-anthology/supabase/migrations/002_optimizations.sql`.
Aşağıdaki maddeler additive'dir; mevcut veriyi bozmaz.

### 3.1 Eksik index'ler (performans — kritik)
Mevcut index'ler: `idx_f1_snapshots_season`, `idx_f1_snapshots_type`, `idx_news_cache_published`.
Eklenecekler:

```sql
-- En sık erişim deseni: tek sezonun tek tipi (season + round IS NULL + type).
-- f1.ts → fetchSeasonSnapshotTyped tam da bunu sorguluyor.
CREATE INDEX IF NOT EXISTS idx_f1_snapshots_season_type
  ON public.f1_snapshots (season, type);

-- Round bazlı erişim (fetchRoundSnapshot): season+round+type üçlüsü.
CREATE INDEX IF NOT EXISTS idx_f1_snapshots_season_round_type
  ON public.f1_snapshots (season, round, type);

-- stories / radio_moments public listeleme: published + sıralama kolonu.
CREATE INDEX IF NOT EXISTS idx_stories_published_sort
  ON public.stories (published, sort_order);
CREATE INDEX IF NOT EXISTS idx_radio_published_year
  ON public.radio_moments (published, year DESC);

-- news_cache: tag araması yapılacaksa GIN.
CREATE INDEX IF NOT EXISTS idx_news_cache_tags
  ON public.news_cache USING GIN (tags);
```

> **Neden:** Mevcut tek-kolon index'ler `season=X AND type=Y` kombinasyonunda
> partial olarak çalışıyor; composite index sorgu planlayıcının tek index ile
> çözmesini sağlar. `(season, round, type)` zaten UNIQUE constraint ile geliyor
> olabilir — migration'da `IF NOT EXISTS` ile çift tanımdan kaçınılır.

### 3.2 `type` değerlerinin kanonikleştirilmesi (data integrity — kritik)
**Tespit edilen drift:** Aynı kavram için üç farklı `type` etiketi dolaşıyor:

| Kavram | Seed script (`seed-f1-snapshots.ts`) | Legacy/read path (`f1.ts` STANDINGS_TYPES) |
|---|---|---|
| Pilot puanı | `standings_drivers` | `driverStandings` |
| Takım puanı | `standings_constructors` | `constructorStandings` |

`f1.ts` şu an iki ismi de deneyerek bunu *runtime'da maskeliyor* — bu teknik borç.
Migration ile tek kanonik değere normalize et ve **bir CHECK constraint ile dondur**:

```sql
-- Kanonik tipler. Eski satırları normalize et:
UPDATE public.f1_snapshots SET type = 'standings_drivers'      WHERE type = 'driverStandings';
UPDATE public.f1_snapshots SET type = 'standings_constructors' WHERE type = 'constructorStandings';
UPDATE public.f1_snapshots SET type = 'results'    WHERE type ~ '^results-\d+$';
UPDATE public.f1_snapshots SET type = 'qualifying' WHERE type ~ '^qualifying-\d+$';

ALTER TABLE public.f1_snapshots
  ADD CONSTRAINT f1_snapshots_type_check
  CHECK (type IN (
    'calendar', 'standings_drivers', 'standings_constructors',
    'results', 'qualifying', 'sprint', 'circuit'
  ));
```

Ardından `f1.ts` içindeki `STANDINGS_TYPES = ['standings_drivers', 'driverStandings']`
çift-deneme mantığı **tek değere indirilir** ve `roundSuffixToSnapshotType` ingestion
yazımında zorunlu hale gelir (bkz. data-ingestion-plan §3).

### 3.3 `news_cache` yazım yolunun bağlanması (missing relation — kritik)
**Tespit:** `news_cache` tablosu ve onu okuyan `lib/data/news.ts` var; ama tabloya
**hiçbir şey yazmıyor**. `/api/news` her istekte RSS'i in-memory işliyor, DB'ye hiç
dokunmuyor. Yani tablo şu an ölü bir relation.

Şema tarafında gereken (ingestion tarafı data-ingestion-plan §4'te):
- `news_cache.url` zaten UNIQUE → Cron job `upsert(..., { onConflict: 'url' })` ile güvenle yazar.
- Eski TTL/temizlik mantığını desteklemek için opsiyonel retention index:

```sql
-- Eski haberleri süpürmek için (Cron temizliği): cached_at üstünden.
CREATE INDEX IF NOT EXISTS idx_news_cache_cached_at
  ON public.news_cache (cached_at);
```

### 3.4 `f1_snapshots.fetched_at` üstünde staleness sorgusu
Cron job "hangi sezon/round bayatladı" sorgusunu hızlı yapabilsin diye:

```sql
CREATE INDEX IF NOT EXISTS idx_f1_snapshots_fetched_at
  ON public.f1_snapshots (fetched_at);
```

---

## 4. Opsiyonel normalleştirme (gelecek — `003`, şimdi DEĞİL)

Bunlar **YAGNI sınırında**; yalnızca ihtiyaç netleşirse açılır. Karar belgesi olarak
buraya yazılıyor ki ileride yeniden tartışılmasın.

- **`constructors` tablosu**: `id text PK`, `display_name`, renk kolonları.
  - *Lehte:* `radio_moments.constructor_id` için gerçek FK; renklerin tek kaynağı DB olur.
  - *Aleyhte:* Renkler şu an `config/team-colors.ts`'de ve sezon başı manuel güncelleniyor (dosyadaki SEASONAL MAINTENANCE notu). DB'ye taşımak bu akışı bozar.
  - **Karar:** Şimdilik **reddedildi**. `team-colors.ts` SSOT kalır.
- **`drivers` tablosu**: Pilot listesi `f1Calendar.ts` (`CURRENT_DRIVERS_2025`) + Ergast snapshot'larında. Ayrı tablo gereksiz duplikasyon yaratır. **Reddedildi.**
- **`results` jsonb → relational `race_results`**: Pilot başı satır. Analitik sorgu (örn. "X pilotunun kariyer podi sayısı") gerekirse değerli. Şu an UI Ergast zarfını doğrudan tüketiyor. **Ertelendi.**

---

## 5. RLS & güvenlik (mevcut — korunur, bir not)

- Tüm tablolarda RLS açık. Public `SELECT` yalnızca `published = true` (stories/radio) veya `true` (circuits/snapshots/news).
- Yazma **yalnızca `service_role`** (`auth.role() = 'service_role'`). Cron job ve seed script service-role key ile yazar; anon key asla yazamaz.
- **Doğrulama notu:** `getSupabaseAdmin()` ([`lib/supabase.ts`](../project-anthology/lib/supabase.ts)) service key yoksa **anon key'e düşüyor**. Bu okuma için kabul edilebilir ama **yazma yolunda (Cron/seed) anon'a düşmek RLS'e takılır** — ingestion kodu service key'in varlığını sert şekilde doğrulamalı (seed script bunu `main()` başında yapıyor; Cron route'u da yapmalı).

---

## 6. Uygulama sırası (migration checklist)

- [ ] `002_optimizations.sql` oluştur (§3.1 index'ler).
- [ ] `002` içine `type` normalize UPDATE'leri + CHECK constraint (§3.2).
- [ ] `002` içine `news_cache` + `fetched_at` index'leri (§3.3, §3.4).
- [ ] `supabase db push` (veya MCP) ile uygula; `npm run build` ve `scripts/test-data-layer.ts` ile doğrula.
- [ ] `f1.ts` STANDINGS_TYPES'ı tek kanonik değere indir (constraint sonrası).
- [ ] `types/database.ts`'e `news_cache` Insert tipinin yazım yolunda kullanıldığını teyit et.
- [ ] **Anti-pattern guard:** Hiçbir yeni migration eski iki-tablolu (`f1_season_snapshots`/`f1_round_snapshots`) modeli geri getirmez.

---

## 7. Kaçınılması gereken şema anti-pattern'leri (özet)

1. **İki-tablolu snapshot modeline geri dönmek** (legacy). Tek `f1_snapshots` tablosu korunur.
2. **Ham Ergast verisini erken relational'a açmak.** `jsonb` saklama bilinçli; UI zarfı doğrudan tüketiyor.
3. **`type` için serbest metin.** CHECK constraint ile kanonik küme zorunlu.
4. **Dış kaynak verisine sert FK.** Ergast `circuitId`/`constructorId` soft ref kalır.
5. **`news_cache`'i okuyup hiç yazmamak** (mevcut ölü relation). Cron yazımı bağlanır.
6. **Yazma yolunda anon key'e sessizce düşmek.** Service-role zorunlu doğrulanır.
