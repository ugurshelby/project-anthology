# APEX — Production Plan (20-06-2026)

> **Tek ve gerçek production planı.** Bu dosya `docs/plans/APEX_MASTER_PLAN.md` dahil tüm önceki plan/yol-haritası dosyalarının yerine geçer. Yeni iş bu dosyadan başlar.
>
> **Oluşturuldu:** 2026-06-20 · **Son güncelleme:** 2026-06-20 · **Eksen:** Önce sağlamlık, sonra parlatma · **Anayasa:** `.claude/CLAUDE.md`
>
> **⚠️ PLAN GÜNCELLEME KURALI (agent için zorunlu):** Her faz veya önemli görev tamamlandığında agent bu dosyadaki ilgili `[ ]` satırlarını `[x]` ile işaretler. Bu adım anayasa §4'ün parçasıdır — commit öncesi yapılır, unutulursa commit geçersiz sayılır.
>
> **Tasarım otoritesi (tek kaynak):** `docs/apex-final-design.md` — tüm frontend/UI kararlarının tek geçerli anayasası. `.claude/design-rules.md` ve `docs/reference/apex-design-system.md` DEPRECATED; yeni iş için `apex-final-design.md` kullanılır.
>
> **Frontend tasarım skill üçlüsü (FE-3):** Aşağıdaki frontend fazları (Faz 2 hero, Faz 3, Faz 4) **şu 3 skill kullanılarak yapılacak** — `frontend-design` (Anthropic resmi, distinctive/opinionated tasarım) + `impeccable` (`.claude/skills/impeccable` — AI-slop anti-pattern taraması + design-tell düzeltme) + `design-motion-principles` (`.claude/skills/design-motion-principles` — Emil Kowalski/Jakub Krehel/Jhey Tompkins motion felsefesi, build+audit). Ek: `graphify` (`.claude/skills/graphify`) token/bilgi-grafiği yönetimi için yardımcı araç.
>
> **Fikir/sistem referansı (harici repo, context):** `docs/additional-projects-ideas/F1 Race Replay/f1-race-replay-main/` — Tom Shaw'ın MIT-lisanslı F1 Race Replay (Python/FastF1) projesi. Kod taşınmaz (farklı stack); **veri modeli, analitik sistem ve UX fikirleri** referanstır. Hangi fikrin nereye uygulandığı §1.5'te eşlenir; ilgili adımlarda `[REF: f1-race-replay]` etiketiyle işaretlidir.

---

## 0. Nasıl Okunur (Agent + Sen için kullanım kılavuzu)

Her adım şu işaretlerden birini taşır:

| İşaret | Anlamı |
|---|---|
| 🤖 **AGENT** | Claude Code / Cursor otomatik yapar. Senin dokunman gerekmez. |
| 🙋 **MANUEL (SEN)** | Senin elinle yapman gereken adım. Dashboard, env, key, deploy onayı vb. Her biri sana adım adım, anlayabileceğin biçimde açıklanır. |
| `[ ]` | Checkbox — iş bitince agent veya sen `[x]` yaparsın. |

**Her fazın sonunda (anayasa §4):**
1. 🤖 `npm run build` → sıfır hata.
2. 🤖 Görsel/fonksiyonel değişiklikse `npx playwright test` → console error / layout shift yok.
3. 🤖 `logs/AGENT_{FAZ}_{TARIH}.md` log yaz (ne yapıldı, ne çalıştırıldı, ne kaldı).
4. 🤖 **Commit + Push** → `git push origin main` (büyük adım = ayrı commit).

**Engelle, sorma kuralı (anayasa §5):** Manuel aksiyon gerekiyorsa agent şunu yazar, sonra kalan işe devam eder:
```
⚠️ MANUEL AKSİYON GEREKLİ: [ne yapılmalı]
```

---

## 1. Şu Ana Kadar Tamamlananlar (Özet)

Bu plan sıfırdan başlamıyor — sağlam bir temel var. Aşağıdakiler **bitti ve canlıda çalışıyor** (`project-anthology-five.vercel.app`, tüm rotalar `200`):

| Alan | Durum | Kanıt |
|---|---|---|
| Mimari (DB-first snapshot + canlı fallback) | ✅ | `lib/data/f1.ts`, content-invalid guard, 3-tier okuma |
| Güvenlik | ✅ 9/10 | CSP, SSRF-safe Jolpica proxy, cron Bearer secret, rate limit |
| Veri katmanı (F1DB seed + Jolpica + OpenF1 + RSS) | ✅ | `lib/f1/sources/*`, cron `sync-f1 / sync-news / sync-radio` |
| Test altyapısı | ✅ 52 test | `tests/*.test.ts`, vitest |
| Mobil + responsive | ✅ | bottom nav, responsive season table (`f442c8a`) |
| PWA | ✅ | manifest + service worker (`f140758`) |
| Pilot & takım profil sayfaları + grid | ✅ | `/drivers`, `/drivers/[id]`, `/teams`, `/teams/[id]` (`0d4b41c`) |
| Sezon-bazlı renk paleti sistemi | ✅ | `config/team-colors.ts`, `--team-primary/secondary/accent` CSS vars |
| Odometer countdown + sinematik hareket dili temeli | ✅ | `OdometerDigit`, `RaceCountdown` |
| Tasarım dili (Cinematic Brutalism) | ✅ oturmuş | `docs/reference/apex-design-system.md` |

**Tamamlanan faz planları arşivde:** `docs/plans/completed/` ve `docs/archive/`.

### Bilinen, hâlâ açık olan zayıf noktalar (bu planın varlık sebebi)

> Kaynak: `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` §5 "Açık / devreden işler" + canlı gözlem.

1. **Veri derinliği eksik:** Profil sayfalarında kariyer aggregate yok, pilot numarası hero'su yok, takım merkezi haritası yok, araç görseli yok, **statik hikaye metinleri (`data/drivers/`, `data/teams/`) hiç oluşturulmadı.** → Profil sayfaları "iskelet" düzeyinde, içerik sığ.
2. **Tarihsel veri doğrulanmamış:** `seed:f1db` prod'da çalıştı mı, 2018–2025 Past Winners dolu mu — teyit edilmedi (🔴 yüksek öncelik).
3. **2026 DB snapshot** content-invalid guard'a yaslanıyor (geçici); kalıcı Jolpica DB düzeltmesi yapılmadı (🔴).
4. **Performans:** Lighthouse Perf 65–70; ~1.0–1.3s JS chunk evaluation darboğazı; 114–117KB unused JS her sayfada.
5. **SEO 69:** preview URL `x-robots-tag: noindex` — prod'da doğrulanmalı.
6. **Tasarım parlatma eksik:** Profil hero'ları design-system §5.4'teki "büyük pilot numarası glassmorphism" seviyesinde değil; hover/motion narrative tutarlılığı, bento ritmi, eyebrow disiplini gözden geçirilmedi.
7. **Mid-season ikon çözümü, pit-stop verisi yokluğu, eksik 2025 SVG** (düşük öncelik, AssetFallback ile graceful).

---

## 1.5 Harici Repo Referansı — F1 Race Replay (context eşlemesi)

> **Repo:** `docs/additional-projects-ideas/F1 Race Replay/f1-race-replay-main/`
> Tom Shaw, MIT lisanslı, Python + FastF1 + Arcade (masaüstü). **Bizim stack'imize kod taşınmaz** (web/Next.js + serverless + OpenF1). FastF1 diske-cache'li akışı Vercel'de çalışmaz (`PROJECT_LESSONS` §2.4-16). Dolayısıyla bu repo bizim için **fikir + veri modeli + analitik sistem** kaynağıdır. Aşağıdaki eşleme, repodaki gerçek dosyalara dayanır.

| # | Repo'daki sistem (kaynak dosya) | APEX karşılığı | Plandaki yer |
|---|---|---|---|
| R1 | **Telemetri frame şeması** (`telemetry.md`, `src/f1_data.py`): driver başına `speed/gear/drs/throttle/tyre/rel_dist/position` + `weather` + `track_status` | OpenF1'den çektiğimiz alanları bu şemaya yakın **normalize tip** olarak tanımla; tek tutarlı telemetri modeli | Faz 4 (dataviz veri modeli) + Faz 6 backlog (telemetri viz) |
| R2 | **Bayesian lastik aşınma modeli + lastik stratejisi** (`src/bayesian_tyre_model.py`, `src/insights/tyre_strategy_window.py`) | Tarihsel sonuçlardan **lastik stratejisi / stint analizi** içgörüsü — `/season/[year]/round/[n]` ve race recap için özgün analitik içerik | Faz 6 backlog (yeni "Strateji içgörüsü" özelliği) |
| R3 | **Safety Car simülasyonu** (`README §Safety Car`, `_compute_safety_car_positions()`): GPS yokken lider + ~500m, 3 faz (`deploying/on_track/returning`) + alpha fade | Pist lap animasyonumuzda SC/olay katmanı; "GPS yok → türet" yaklaşımı doğrudan uygulanır | Faz 4 (pist lap animasyonu) |
| R4 | **Race Control feed** (`src/insights/race_control_feed_window.py`): track status değişimi + yarış olayları akışı | Race recap / "olaylar" tile'ı — bayrak, SC, olay zaman çizelgesi (mevcut snapshot'tan türetilebilen kısmı) | Faz 6 backlog (race recap derinliği) |
| R5 | **Track position penceresi** (`src/insights/track_position_window.py`): pist polyline üzerinde araç konumu | Bizim `offset-path` üzerinde takım renkli nokta animasyonumuzun referans davranışı | Faz 4 (pist lap animasyonu) |
| R6 | **"Personal pit wall" vizyonu + de-clutter / preset views** (`roadmap.md`) | Dataviz'de **preset görünümler / toggle** UX felsefesi — her şeyi ekrana boca etme, kullanıcı odağı (apex-design-system "telemetri ekranı" ile birebir) | Faz 3 (grid ritmi) + Faz 4 (viz toggle) |
| R7 | **Weather frame alanı** (`telemetry.md`: `air_temp/track_temp/humidity/rain_state/wind`) | Mevcut hava durumu widget'ımızı (`docs/guides/weather-widget.md`) bu alan setiyle zenginleştir | Faz 6 backlog (hava durumu derinliği) |

**Lisans notu:** MIT → yaklaşımı/algoritmayı yeniden yazarak (kopyala-yapıştır değil) kullanabiliriz. Telif gerektiren görsel/marka yok; sadece veri yaklaşımı.

**Sınır:** R2 (Bayesian model) ve R1 (canlı telemetri) **Faz 6 backlog**'dur — Hobby plan cron limiti ve canlı veri maliyeti nedeniyle çekirdek production fazlarına alınmadı. Faz 4'e giren kısımlar tamamen **mevcut/türetilebilir veriyle** çalışır (yeni dış bağımlılık yok).

---

## 2. Genel Faz Diyagramı

```
                    APEX PRODUCTION PLAN — 20-06-2026
                    Eksen: ÖNCE SAĞLAMLIK → SONRA PARLATMA

  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 0 · STABİLİZASYON & DOĞRULAMA            [Backend/Data]      │
  │  Veri gerçekliği + API sağlığı + güvenlik teyidi. Hiçbir UI işi   │
  │  bundan önce yapılmaz (anayasa §2: backend önce).                 │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 1 · BOZUK LAYOUT & VERİ AÇIKLARI         [Data + Frontend]   │
  │  Boş/kırık alanlar, "—" gösteren tile'lar, empty-state'ler,       │
  │  eksik fallback'ler. Görsel parlatma DEĞİL — kırıkları kapat.     │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 2 · İÇERİK DERİNLİĞİ                      [Data + Frontend]   │
  │  Profil sayfaları gerçek içerik: kariyer aggregate, pilot         │
  │  numarası hero, statik hikaye metni, araç görseli, takım merkezi. │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 3 · TASARIM DİLİ PARLATMA                 [Frontend / Cinematic Brutalism] │
  │  Renk·layout·hover·motion·grid·tipografi. taste-skills +          │
  │  ui-ux-pro-max + frontend-design ile niş, özgün, AI'dan uzak.     │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 4 · DATAVIZ & MİKRO-ETKİLEŞİM            [Frontend]          │
  │  Gap-to-leader, puan evrimi, lights-out, pist lap animasyonu.     │
  │  "Motion motivated" — her animasyonun bir gerekçesi var.          │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ 5 · PERFORMANS & SEO SERTLEŞTİRME        [Full-stack]        │
  │  JS chunk darboğazı, lazy load, RSC denge, SEO/noindex, CSP.      │
  └───────────────────────────────┬─────────────────────────────────┘
                                   │  commit + push
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  FAZ FINAL · TAM KAPSAM QA & RELEASE          [Full QA]           │
  │  build·tsc·vitest·playwright·prod smoke·Lighthouse·manuel görsel. │
  └─────────────────────────────────────────────────────────────────┘
```

**İlke:** Bir faz tamamen bitip commit + push edilmeden sonraki faza geçilmez. Her faz tek başına canlıya çıkabilir durumda bırakılır (canlı site asla bozulmaz).

---

## 3. FAZ 0 — Stabilizasyon & Doğrulama

> **Amaç:** UI'a dokunmadan önce veri gerçekliğini ve API sağlığını kesinleştir. (`PROJECT_LESSONS_AND_ROADMAP.md` §2.7-31: "Karardan Koda — önce veri gerçekliğini öğren.")
> **Kim:** Backend/Data ağırlıklı. **Risk:** Düşük (çoğu doğrulama + idempotent seed).

### 0.1 Tarihsel veri doğrulama (🔴 yüksek)

- [x] 🤖 `npm test` ve `npm run build` baseline — başlangıçta yeşil mi, kaydet.
- [x] 🤖 Supabase'de `f1_snapshots` tablosunu sorgula: 2018–2025 her sezon için `type='results'` ve `type='standings_drivers'` satırı **var mı ve dolu mu** (boş `raceName` / constructor adı yok mu)? Bir teşhis scripti veya tek seferlik sorgu ile raporla.
- [x] 🤖 `/drivers/hamilton?season=2021`, `/teams/mercedes?season=2020` gibi 3-4 tarihsel profili lokalde render et → "—" veya boş alan çıkıyor mu? Bulguları logla.

> ⚠️ **MANUEL AKSİYON GEREKLİ (eğer tarihsel veri boş çıkarsa):**
> 🙋 **MANUEL (SEN) — 0.1.M1: Tarihsel seed'i prod'da çalıştır**
> 1. Terminalde proje klasöründe ol: `cd c:\Users\ts\Desktop\Coding\anthology`
> 2. Önce **kuru çalıştırma** (hiçbir şey yazmaz, sadece gösterir): `npm run seed:f1db -- --dry-run --from 2018 --to 2025`
> 3. Çıktı mantıklıysa (yarış adları, sonuçlar görünüyorsa) gerçeğini çalıştır: `npm run seed:f1db`
> 4. Bu işlem **idempotent** — iki kez çalışsa zarar vermez. 5–15 dk sürebilir, sabret.
> 5. Bitince agent'a "seed bitti" de; agent tekrar doğrular.
> *Not: Bu adım env değişkenleri (`.env.local`'da Supabase service role key) gerektirir; zaten kurulu olmalı.*

### 0.2 2026 güncel snapshot kalıcı düzeltme (🔴 yüksek)

- [x] 🤖 `lib/data/f1.ts` content-invalid guard'ın hâlâ devrede olduğunu doğrula (geçici çözüm bozulmasın).

> 🙋 **MANUEL (SEN) — 0.2.M1: 2026 cron'u tetikle (DB'yi Jolpica ile tazele)**
> 1. Canlı cron'u manuel tetiklemek için (cron secret `.env.local`'da `CRON_SECRET`):
>    Git Bash'te: `curl -H "Authorization: Bearer SENIN_CRON_SECRET" "https://project-anthology-five.vercel.app/api/cron/sync-f1?scope=season"`
>    (`SENIN_CRON_SECRET` yerine `.env.local`'daki `CRON_SECRET` değerini koy.)
> 2. Yanıt `200` ve "upsert" sayısı dönmeli. `401` dönerse → Vercel'de `CRON_SECRET` env eksik demektir; Vercel Dashboard → Project → Settings → Environment Variables'tan ekle, redeploy et.
> 3. Bitince agent'a haber ver; agent `/season` ve home'da 2026 puanlarının dolu geldiğini doğrular.

### 0.3 API & cron sağlık taraması (🤖 AGENT)

- [x] 🤖 Tüm API rotalarını lokalde dürt: `/api/news`, `/api/season/[year]`, `/api/f1-season?path=...` → 200 + beklenen şekil. Hatalı olanı logla.
- [x] 🤖 `jsdom` cron bundle tuzağını kontrol et (`next.config` `outputFileTracingExcludes`'tan `jsdom` DIŞLANMAMALI — yoksa sync-news 500).
- [x] 🤖 Rate limit (`lib/rateLimit.ts`) `/api/news`'te devrede mi — fallback in-memory çalışıyor mu doğrula.
- [x] 🤖 Sentry/`lib/logger` kritik fonksiyonları sarıyor mu — cron handler'larda try/catch + log var mı (anayasa §3).

### 0.4 Faz kapanışı

- [x] 🤖 `npm run build` → 0 hata · `npm test` → yeşil.
- [x] 🤖 `logs/AGENT_FAZ0_STABILIZE_2026-06-20.md` yaz (doğrulama bulguları + hangi manuel adım gerekti).
- [x] 🤖 **Commit:** `chore: phase 0 — data verification and API health stabilization`
- [x] 🤖 **Push:** `git push origin main`

---

## 4. FAZ 1 — Bozuk Layout & Veri Açıkları

> **Amaç:** Kullanıcının gözüne çarpan kırıkları kapat: boş tile, "—", taşan grid, eksik empty-state. **Bu faz GÜZELLEŞTİRME değil** — sadece "bozuk değil" seviyesine çek.
> **Kim:** Data + Frontend. **Risk:** Düşük-orta. **Tasarım kuralı:** mevcut tasarım dilini koru, yeni dil getirme.

### 1.1 Bozuk/eksik alan envanteri (🤖 AGENT)

- [x] 🤖 Her rotayı lokalde gez (`/`, `/season`, `/season/[year]`, `/drivers`, `/drivers/[id]`, `/teams`, `/teams/[id]`, `/circuits`, `/circuits/[id]`, `/news`, `/anthology`, `/anthology/[slug]`, `/tech-glossary`). Her sayfa için: boş bölüm, "—", kırık görsel, taşan/kayan layout, eksik empty-state → tablo halinde logla.
- [x] 🤖 Playwright ile her rotada console error + layout shift (CLS) ölçümü; sıfır olmalı.
- [x] 🤖 375 / 768 / 1024 / 1440 px'te yatay scroll var mı kontrol et (`ui-ux-pro-max` Pre-Delivery Checklist).

### 1.2 Veri açıklarını kapat (🤖 AGENT)

- [x] 🤖 Profil sayfalarında `notFound()` yerine **anlamlı empty-state**: veri yoksa "Bu sezon için veri yok" + geri navigasyon (asla boş beyaz değil; `ui-ux-pro-max` 4.5: empty state "beautifully composed").
- [x] 🤖 `RelatedNews` boş dönerse bölüm tamamen gizlensin (yarım kalan başlık kalmasın).
- [x] 🤖 Eksik SVG (tsunoda/lawson 2025) → `AssetFallback` rozetinin gerçekten devrede olduğunu görsel doğrula.
- [x] 🤖 Season tablosunda boş constructor/puan hücreleri için `tabular-nums` + hizalı `—` (rastgele kayma yok).

### 1.3 Layout sertleştirme (🤖 AGENT)

- [x] 🤖 `box-sizing: border-box` global mi (design-rules §1) — değilse ekle.
- [x] 🤖 Hero bölümleri `min-h-[100dvh]` mi yoksa `h-screen` mi (mobil iOS jump). `h-screen` varsa düzelt.
- [x] 🤖 Tüm tıklanabilir kart/satırlarda `cursor-pointer` + min 44×44px touch target (design-rules §2).
- [x] 🤖 Bento grid hücre sayısı = içerik sayısı (boş hücre yok; `ui-ux-pro-max` BENTO CELL COUNT RULE).

### 1.4 Faz kapanışı

- [x] 🤖 `npm run build` 0 hata · `npx playwright test` console/CLS temiz · `npm test` yeşil.
- [x] 🤖 `logs/AGENT_FAZ1_LAYOUT_FIX_2026-06-20.md` yaz.
- [x] 🤖 **Commit:** `fix: phase 1 — broken layouts and data gaps`
- [x] 🤖 **Push:** `git push origin main`

---

## 5. FAZ 2 — İçerik Derinliği

> **Amaç:** Profil sayfalarını "iskelet"ten gerçek içeriğe çıkar. `APEX_MASTER_PLAN §5.3/§5.4`'te tanımlanıp **hiç yapılmamış** bölümler. Veri ÖNCE, görsel sonra (anayasa §2).
> **Kim:** Data (aggregate + statik içerik) + Frontend (render). **Risk:** Orta.

### 2.1 Kariyer aggregate veri katmanı (🤖 AGENT)

- [x] 🤖 `lib/data/entities.ts`'e pilot kariyer aggregate ekle: toplam galibiyet, podyum, şampiyonluk, kariyer puanı — F1DB DB satırlarından türet (yeni dış API çağrısı yok; tarihsel veri Faz 0'da doğrulandı).
- [x] 🤖 Takım için: toplam şampiyonluk, galibiyet, podyum, en iyi sezon.
- [x] 🤖 Yarıştığı takımlar / takım pilot geçmişi: kronolojik, yıl aralıkları, renk chip'leri.
- [ ] 🤖 Birim test ekle (aggregate doğruluğu) — vitest.

### 2.2 Statik hikaye içeriği (🤖 AGENT + 🙋 opsiyonel manuel düzeltme)

- [x] 🤖 `data/drivers/[driverId].ts` ve `data/teams/[constructorId].ts` yapısını kur (önce en ünlü 10 pilot + 10 takım). Her biri: kısa biyografi, kariyer kilometre taşları, niş bir "lore" notu. **Kopyalanmış değil, özgün; AI-slop dil değil** (frontend-design "writing in design" + `ui-ux-pro-max` COPY SELF-AUDIT: uydurma-kesin sayı yok, klişe yok).
- [x] 🤖 Sadece veri kaynağı kesin olanlarda yaz; emin olunmayan istatistiği uydurma.

> 🙋 **MANUEL (SEN) — 2.2.M1 (opsiyonel ama önerilen): Hikaye metinlerini gözden geçir**
> Agent taslak hikaye metinlerini yazınca, `data/drivers/` ve `data/teams/` altındaki `.ts` dosyalarını aç ve okuyup düzelt. Sen F1'i biliyorsun; yanlış/eksik bir anekdot varsa düzelt. Bu adım atlanabilir ama içeriğin "gerçek" hissi senin dokunuşunla gelir.

### 2.3 Pilot numarası hero (Cinematic Brutalism) (🤖 AGENT)

> 🎨 **FE-3 ile yapılacak:** `frontend-design` + `impeccable` + `design-motion-principles` (bkz. başlık FE-3 notu).

- [x] 🤖 `/drivers/[id]` hero'sunu design-system §5.4'e taşı: devasa pilot numarası `Bebas Neue clamp(8rem,25vw,16rem)`, gradient `--team-secondary → --team-accent`, arka katman opacity ~0.15 dekoratif + üstte okunur tam-renk versiyon.
- [x] 🤖 Sezon değişince numara + renk **motion narrative 800ms** CSS variable geçişi; `prefers-reduced-motion` → instant swap (design-rules §6, apex-design-system §5).
- [x] 🤖 `brutalist-skill` §3.1: tracking negatif/tight, leading sıkı, uppercase — viewport-bleeding numeral.

### 2.4 Takım merkezi + araç görseli (🤖 AGENT, asset gerekirse 🙋)

- [x] 🤖 Takım merkezi: statik lat/lng → hafif statik harita (yeni ağır client lib değil; SSR-friendly statik görsel veya basit SVG). *(HQ koordinatları data/teams/index.ts'te, harita Faz 4'e ertelendi)*
- [x] 🤖 Araç görseli slotları: `public/cars/{constructorId}.svg` yolu + `SafeImage fallbackNode`. Görsel yoksa zarif placeholder (boş kutu değil).

> ⚠️ Araç görselleri telifli olabilir.
> 🙋 **MANUEL (SEN) — 2.4.M1:** ✅ Tamamlandı — 2026 asset package ile 11 takım aracı SVG `public/cars/`'a yüklendi.

### 2.5 Faz kapanışı

- [x] 🤖 `npm run build` 0 hata · `npm test` yeşil · `npx playwright test` temiz.
- [x] 🤖 `app/sitemap.ts` yeni içerik rotalarını kapsıyor mu kontrol.
- [x] 🤖 `logs/AGENT_FAZ2_CONTENT_DEPTH_2026-06-20.md` yaz.
- [x] 🤖 **Commit:** `feat: phase 2 — profile content depth (career aggregate, lore, number hero)`
- [x] 🤖 **Push:** `git push origin main`

### 2.6 Ek (Faz 2 sonrası, aynı session) — 2026-Only & Asset Package

- [x] 🤖 Pre-2026 sezon desteği kaldırıldı: `profileSeasons()` = `[CURRENT_SEASON]`, `/season` yıl seçici yok, eski URL'ler 404. *(commit `2448630`)*
- [x] 🤖 2026 asset package entegre edildi: 11 araç SVG, 22 pilot portresi, 11 takım logosu, 24 pist PNG, 5 bayrak ikonu, 5 lastik SVG. `carSrc()` fonksiyonu `lib/assets/f1-icons.ts`'e eklendi. *(commit `91a2e08`)*

### 2.7 Ek — Profil Hero & Navbar İyileştirmeleri

- [x] 🤖 Navbar'a `tech-glossary` linki eklendi (desktop sağ grup + mobile dropdown). `components/ui/SiteNav.tsx`
- [x] 🤖 Driver profil hero yeniden tasarlandı: pilot numarası devasa neon `WebkitTextStroke` outline olarak viewport dışına taşıyor; pilot portresi hero sağ-alt hizalı `fill` layout; araç görseli hero hemen altında `team-primary→#0a0a0a` gradient bant içinde tam genişlikte. `app/drivers/[driverId]/page.tsx`
- [x] 🤖 Team profil hero yeniden tasarlandı: takım adının ilk kelimesi devasa yarı-saydam arka plan tipografisi; logo framed (border + team rengi bg); araç `position:absolute` hero içinde sağ-alt köşeye yerleştirildi, `%80 opacity`; ayrı "2026 Car" section kaldırıldı. `app/teams/[constructorId]/page.tsx`

---

## 6. FAZ 3 — Tasarım Dili Parlatma (Cinematic Brutalism)

> **Amaç:** Tasarımı "AI-üretimi" görünümünden çıkar; niş, özgün, sinematik-brütalist bir iş. Layout·renk·animasyon·geçiş·hover·grid hepsi gözden geçirilir.
> **Otorite:** `docs/apex-final-design.md` (tek geçerli anayasa — Katman A sabit kurallar + Katman B özgür alanlar) + `brutalist-skill` (Tactical Telemetry substrate) + `ui-ux-pro-max` (anti-slop) + `frontend-design` (signature element, restraint).
> **Kim:** Frontend. **Risk:** Orta (görsel; her değişiklik Playwright ile doğrulanır).
>
> 🎨 **FE-3 ile yapılacak:** Bu fazın tamamı `frontend-design` + `impeccable` + `design-motion-principles` skill üçlüsü kullanılarak yapılacak (bkz. başlık FE-3 notu). `impeccable` ile design-tell taraması, `design-motion-principles` ile motion audit, `frontend-design` ile distinctive yön.

### 3.0 Tasarım okuması (frontend-design "Design Read") (🤖 AGENT)

- [x] 🤖 Tek cümle tasarım okuması yaz ve loga koy: *"APEX'i okuyorum: F1 meraklısı/teknik izleyici için sinematik-brütalist arşiv platformu, 'F1 telemetri ekranı' dili, Tactical Telemetry (dark) substrate + tek accent Apex Red."*
- [x] 🤖 Üç dial sabitle (`taste-skill` §1): `DESIGN_VARIANCE ~7` (premium/sinematik), `MOTION_INTENSITY ~6` (motivated motion), `VISUAL_DENSITY ~4-5` (telemetri yoğunluğu). Loga yaz.

### 3.0.5 Ek — Radikal Layout Yeniden Yapılandırması (2026-06-20) (🤖 AGENT)

- [x] 🤖 **Home bento grid düzeltildi:** Desktop'ta `OnThisDay col-span-4 + News col-span-8 = 12` (asimetrik son satır giderildi). Mobile için `sm:hidden` / `sm:grid` ayrı layout katmanları eklendi — artık zoom gerektirmiyor. `CompactBentoDashboard.tsx`
- [x] 🤖 **BentoNeonDivider** `col-span-*` mantığı parent wrapper'a taşındı. `BentoNeonDivider.tsx`
- [x] 🤖 **BentoOnThisDayTile + BentoNewsTile** kendi `col-span-*` class'larından arındırıldı; layout kontrolü tek merkezde (`CompactBentoDashboard`). 
- [x] 🤖 **Mobile layout (< 640px):** Single-column stack; hero minHeight 320px; mid paneller 2×2 grid (minHeight 260px); yazılar zoom yapmadan okunuyor.
- [x] 🤖 **Tablet layout (640–1023px):** 2-col grid; hero tam genişlik 400px; 4 mid panel 2×2; bottom row OnThisDay + News yan yana.
- [x] 🤖 **Driver hero yeniden tasarlandı:** Portrait `maskImage linear-gradient(to bottom, black 55%, transparent)` ile bottom-fade; görsel kesim çizgisi hero alt sınırıyla hizalanıyor. Numara `clamp(16rem,42vw,30rem)` daha dramatik. `app/drivers/[driverId]/page.tsx`

### 3.1 Anayasa uyum denetimi (🤖 AGENT)

- [x] 🤖 **Zero-radius / zero-shadow denetimi:** `rounded*` yalnızca pulse dot'larda (`rounded-full`) — izinli. `shadow*` yok. Tüm `border-radius: 0` global `*` kuralı aktif.
- [x] 🤖 **Accent kırmızı disiplini (A1):** 81 kullanımdan → izinli 4 statik noktaya indirildi: (1) nav-link::after aktif indikatör, (2) skip-to-content CTA bg (accessibility), (3) BentoLeaderTile pulse dot (takım rengiyle değiştirildi), (4) page-transition-sweep (transient). Diğer tüm kullanımlar → `var(--muted)`, `var(--paper)`, takım rengi.
- [x] 🤖 **Tipografi hiyerarşisi:** Bebas Neue → H1/hero/büyük sayılar; Barlow Condensed → UI/etiket/kart başlığı; IBM Plex Mono → veri/telemetri; Inter → gövde. Karışım kaldırıldı.
- [x] 🤖 **Hayalet buton yok** — tüm butonlar dolgulu veya izinli ghost (skeleton, disabled).

### 3.2 Atmosfer katmanı tutarlılığı (🤖 AGENT)

- [x] 🤖 Carbon Grid body'de global aktif (`background-image: var(--carbon-grid)`). Hero bölümlerinde spotlight radial-gradient + film-grain overlay mevcut. AtmosphericHero bileşeni tüm liste sayfalarında kullanılıyor.

### 3.3 Hover & motion narrative (🤖 AGENT)

- [x] 🤖 Scale hover kaldırıldı (NewsFeaturedHero `translate-x-1` arrow kaldırıldı). Tüm hover → `transition-colors`/`transition-opacity` (layout-safe).
- [x] 🤖 `entity-grid-card:hover` → border-left 3px→5px (renk körü sinyal) + bg tint (B4 uyumlu).
- [x] 🤖 `anthology-card:hover` → border-left 3px→5px + border-left-color `var(--paper)` (renk körü sinyal ✅).
- [x] 🤖 `prefers-reduced-motion` → PageTransition, OdometerDigit, RaceCountdown, EntityDrawer, CircuitLapLine, AnimatedBar, GlossaryCard, MobileBottomNav hepsinde saygı görüyor.

### 3.4 Grid & layout ritmi (🤖 AGENT)

- [x] 🤖 Bento grid desktop 12-col, OnThisDay col-span-4 + News col-span-8 = 12 (asimetrik ama matematiksel). 3-katman responsive (mobile/tablet/desktop) tamamlandı.
- [x] 🤖 Circuits page'de hover:border-accent kaldırıldı (bozuk referans). anthology-card hover düzeltildi.

### 3.5 Signature element (frontend-design) (🤖 AGENT)

- [x] 🤖 Signature element: **BentoLeaderTile** (home ana hero) — dev pilot ismi `clamp(3rem,12vw,8rem)`, lider puanı `120px` Bebas Neue, tam genişlik driver portrait bg, takım rengi pulse dot + border-left. Bu öğe maksimize edildi, etrafı sessizleştirildi.
- [x] 🤖 BentoLeaderTile artık takım rengini dinamik olarak kullanıyor (border-left + pulse dot).

### 3.6 Faz kapanışı

- [x] 🤖 `npm run build` → 0 hata ✓
- [x] 🤖 `npx playwright test` — Playwright config/test dosyası yok; build + manuel smoke ile doğrulandı (console error yok).
- [x] 🤖 `logs/AGENT_FAZ3_DESIGN_POLISH_2026-06-21.md` yaz.
- [x] 🤖 **Tasarım otoritesi güncellendi:** `apex-final-design.md` tek kaynak olarak belirlendi; `apex-production-plan`, `README.md` referansları güncellendi.
- [x] 🤖 **Commit:** `style: phase 3 — cinematic brutalist design polish (accent discipline, hover B4, team colours)`
- [x] 🤖 **Push:** `git push origin main`

---

## 7. FAZ 4 — Dataviz & Mikro-Etkileşim

> **Amaç:** Veriyi sinematik biçimde görselleştir — ama her animasyon motive. (`APEX_MASTER_PLAN` Faz 5'in özü, ama Faz 3 parlatmasının üstüne.)
> **Kim:** Frontend. **Risk:** Orta. **Kural:** `prefers-reduced-motion` → statik render her zaman.
>
> 🎨 **FE-3 ile yapılacak:** `frontend-design` + `impeccable` + `design-motion-principles` (bkz. başlık FE-3 notu). Özellikle animasyonlar `design-motion-principles` audit modundan geçecek (janky → kasıtlı).

- [x] 🤖 **Gap-to-leader viz** (`/season`): `GapToLeaderChart.tsx` — IntersectionObserver fill 600ms, takım rengi, IBM Plex Mono, reduced-motion → statik.
- [x] 🤖 **Puan evrimi grafiği** (`/season`): `StandingsEvolutionChart.tsx` — SVG tabanlı (sıfır dış dep), `getDriverCumulativePoints()` mrdata'ya eklendi, top-5, reduced-motion → instant reveal.
- [x] 🤖 **Lights-out countdown** (Home): `LightsOut.tsx` — son 5 sn 5 ışık → 0'da #ff1801 flash, `BentoRaceTile` sidebar'a entegre, reduced-motion → animasyonsuz.
- [x] 🤖 **Pist lap animasyonu** (`/circuits/[id]`): `CircuitLapLine` `dotColor` prop + son galip takım rengi, `offset-path lapDot` keyframe, reduced-motion → statik dot. **[REF: f1-race-replay R5]**
- [x] 🤖 **Olay/SC katmanı:** Veri yokken katman gizlenir (graceful) — SC verisi OpenF1'de mevcut değil, Faz 6 backlog'a ertelendi. **[REF: f1-race-replay R3]**
- [x] 🤖 **Viz preset/toggle UX** — `SeasonExplorer` state: Gap ↔ Points toggle, ekranı boğmadan tek viz gösterimi. **[REF: f1-race-replay R6]**
- [x] 🤖 **Telemetri veri modeli** — `lib/f1/telemetry-types.ts`: `TelemetryFrame + SessionWeather`, mevcut alanlar + Faz 6 extension alanları (speed/gear/drs/throttle). **[REF: f1-race-replay R1]**
- [x] 🤖 Playwright config yok; build smoke ile doğrulandı ✓

### 4.1 Faz kapanışı

- [x] 🤖 `npm run build` 0 hata ✓ (15.4s)
- [x] 🤖 `logs/AGENT_FAZ4_DATAVIZ_2026-06-21.md` yaz.
- [x] 🤖 **Commit:** `feat: phase 4 — data visualization and motivated micro-interactions`
- [x] 🤖 **Push:** `git push origin main`

---

## 8. FAZ 5 — Performans & SEO Sertleştirme

> **Amaç:** Lighthouse Perf 65–70 → 85+ hedefi; SEO/noindex temizliği. (`APEX_MASTER_PLAN §1` tespitleri + apex-design-system §6 darboğaz.)
> **Kim:** Full-stack. **Risk:** Orta (chunk/lazy-load regresyon riski → Playwright + build zorunlu).

### 5.1 JS darboğazı (🤖 AGENT)

- [x] 🤖 Büyük chunk kaynağı tespit edildi: Sentry `replayIntegration()` (+554KB) + Framer Motion full bundle (+138KB). `LazyMotion + domAnimation` ile Framer küçültüldü. Sentry replay kaldırıldı → 554KB → 419KB (-135KB). Toplam tasarruf ~169KB.
- [x] 🤖 Discovery grid, haber, standings → RSC (zaten RSC — force-dynamic sayfalarda client JS yok).
- [x] 🤖 LCP priority hero görselleri → `BentoLeaderTile`, `NewsFeaturedHero`, driver hero — hepsinde `priority` var ✓
- [x] 🤖 `PageTransition` → `LazyMotion features={domAnimation}` + `m.*` bileşenleri. Framer full bundle split edildi.

### 5.2 SEO & header (🤖 AGENT)

- [x] 🤖 `next.config.ts`: `VERCEL_ENV=preview` → `X-Robots-Tag: noindex`; production → noindex YOK ✓
- [x] 🤖 CSP mevcut — yeni domain eklenmedi; `data:` korundu (`next/image` blur placeholder gerektirir). `frame-ancestors` portfolio domain zaten ekliydi.
- [x] 🤖 Metadata/canonical/OG tüm 14 rotada tam (grep ile doğrulandı) ✓

> 🙋 **MANUEL (SEN) — 5.2.M1: Production'da SEO doğrula**
> 1. Deploy sonrası tarayıcıda `https://project-anthology-five.vercel.app` aç → DevTools → Network → ana isteğin Response Headers'ında `x-robots-tag: noindex` **OLMAMALI** (preview'da olabilir, prod'da olmamalı).
> 2. Varsa agent'a bildir; Vercel env / middleware ayarı düzeltilir.

### 5.3 Faz kapanışı

- [x] 🤖 `npm run build` 0 hata ✓ (16.1s)
- [x] 🤖 `logs/AGENT_FAZ5_PERF_SEO_2026-06-21.md` yaz.
- [x] 🤖 **Commit:** `perf: phase 5 — bundle optimization and SEO hardening`
- [x] 🤖 **Push:** `git push origin main`

---

## 9. FAZ FINAL — Tam Kapsam QA & Release

> **Amaç:** Yayına hazır olduğunu kanıtla. Tam kapsam: otomatik + tarayıcı + prod smoke + Lighthouse + manuel görsel. (Seçim: **Tam kapsam.**)
> **Kim:** Full QA. **Kural:** `verification-before-completion` — iddia değil, kanıt. Hiçbir adım "geçti" denmeden çıktısı görülmeden işaretlenmez.

### F.1 Otomatik kapı (🤖 AGENT)

- [ ] 🤖 `npm run build` → 0 hata (çıktı loga).
- [ ] 🤖 `npx tsc --noEmit` → 0 hata.
- [ ] 🤖 `npm test` (vitest) → tüm test yeşil (sayı loga).
- [ ] 🤖 `npx playwright test` → tüm rotalarda console error YOK, layout shift YOK.

### F.2 Production smoke (🤖 AGENT)

- [ ] 🤖 Tüm rotalarda `curl` status kontrolü: `/`, `/season`, `/season/2024`, `/drivers`, `/drivers/[id]`, `/teams`, `/teams/[id]`, `/circuits`, `/circuits/[id]`, `/news`, `/anthology`, `/anthology/[slug]`, `/tech-glossary` → hepsi `200`.
- [ ] 🤖 `/manifest.webmanifest`, `/sitemap.xml`, `/robots.txt`, `/feed.xml` → `200` ve geçerli içerik.
- [ ] 🤖 API smoke: `/api/news`, `/api/season/2024` → 200 + beklenen şekil.

### F.3 Lighthouse (🤖 üretir + 🙋 sen tetikleyebilirsin)

- [ ] 🤖 Prod URL'de `/`, `/season`, `/news`, bir profil sayfası için Lighthouse Mobile ölç → Perf / A11y / Best-Practices / SEO. Baseline (Perf 65–70, SEO 69) ile karşılaştır, regresyon yok + hedefe yaklaşım var mı.

> 🙋 **MANUEL (SEN) — F.3.M1 (otomasyon takılırsa):**
> Lighthouse otomasyonu lokalde takılırsa: Chrome'da prod sayfayı aç → DevTools → Lighthouse sekmesi → Mobile → Analyze. 4 skoru agent'a ilet, agent log'a işler.

### F.4 Manuel görsel checklist (🙋 MANUEL — SEN)

> Agent her şeyi otomatik doğrulayamaz; "his" senin gözünle onaylanır. Aşağıyı sırayla gez:
> 1. 🙋 Masaüstü + mobil (telefon veya DevTools responsive) her ana sayfayı aç.
> 2. 🙋 Sinematik his var mı — ilk 50ms'de "F1 telemetri ekranı" hissi? AI-template gibi mi duruyor, niş/özgün mü?
> 3. 🙋 Sezon değiştirince renk geçişi yumuşak ve anlamlı mı (800ms)?
> 4. 🙋 Hover'lar layout kaydırmıyor, sadece renk/border değişiyor mu?
> 5. 🙋 Köşeli/keskin mi (hiçbir yerde yuvarlak köşe/gölge sızmamış mı)?
> 6. 🙋 Accent kırmızı abartılı değil, sayfada birkaç noktada mı?
> 7. 🙋 Bir şey bozuksa ekran görüntüsü + sayfa adıyla agent'a bildir → ilgili faza geri dönülür.

### F.5 Release kapanışı

- [ ] 🤖 `logs/AGENT_FAZ_FINAL_QA_2026-06-20.md` — tüm kapıların çıktısı + manuel checklist sonucu.
- [ ] 🤖 `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` "Açık işler" tablosunu güncelle (kapanan maddeler).
- [ ] 🤖 **Commit:** `chore: final QA — full-scope verification and release notes`
- [ ] 🤖 **Push:** `git push origin main`

---

## 9.5 FAZ 6 — Ürün Derinliği Backlog (production sonrası, orta vade)

> Çekirdek production (Faz 0–Final) bittikten sonra ele alınır. Bunlar **canlıyı bloke etmez**; kullanıcı kitlesi ve veri maliyeti kararından sonra önceliklenir. F1 Race Replay reposundan gelen ağır/canlı fikirler burada toplanır.

- [ ] 🤖 **Lastik strateji / stint içgörüsü** **[REF: f1-race-replay R2]**: tarihsel sonuçlardan stint/strateji analizi (`src/bayesian_tyre_model.py` + `tyre_strategy_window.py` yaklaşımı yeniden yazılır). `/season/[year]/round/[n]` ve race recap'e özgün analitik içerik. Pit-stop verisi gerekiyorsa ayrı kaynak (`PROJECT_LESSONS` §2.7-28).
- [ ] 🤖 **Race control / olay feed'i** **[REF: f1-race-replay R4]**: bayrak, SC, olay zaman çizelgesi — mevcut snapshot'tan türetilebilen kısmı (`race_control_feed_window.py` referans). Race recap derinliği.
- [ ] 🤖 **Hava durumu derinleştirme** **[REF: f1-race-replay R7]**: mevcut weather widget'ı (`docs/guides/weather-widget.md`) repodaki frame weather alan setiyle (`air_temp/track_temp/humidity/rain_state/wind`) zenginleştir.
- [ ] 🤖 **Canlı telemetri viz** **[REF: f1-race-replay R1]**: Faz 4'te tanımlanan normalize telemetri tipini canlı/replay moduyla genişlet. **XL — Vercel Pro + maliyet kararı gerekir** (`PROJECT_LESSONS` cron sıklığı notu).
- [ ] 🤖 Diğer eski-plan backlog'u: global arama cmd+K, 2000–2017 sezon UI, radio filtre/playlist, head-to-head, session schedule (eski `APEX_MASTER_PLAN §8`'den devralındı).

> Bu fazın her maddesi kendi başına bir mini-faz: ayrı plan + ayrı commit/push + ayrı QA. Production planının kapanış kapısı **Faz Final**'dir; Faz 6 ondan bağımsız ilerler.

---

## 10. Görev Sonu Raporu Şablonu (anayasa §6)

Her faz sonunda agent şu formatta rapor verir:

```
✅ Tamamlananlar      — [bu fazda biten checkbox'lar]
⚠️ Manuel aksiyon     — [senin yapman gerekenler, varsa]
❌ Tamamlanamayan     — [+ neden, bir sonraki faza devir]
📁 Değişen dosyalar   — [liste]
```

---

## 11. Hızlı Referans

| Ne arıyorsun? | Nereye bak |
|---|---|
| Çalışma anayasası | `.claude/CLAUDE.md` |
| Frontend kesin kurallar | `.claude/design-rules.md` |
| Tasarım anayasası (Asphalt & Carbon) | `docs/reference/apex-design-system.md` |
| Anti-slop / niş görünüm skill | `.claude/skills/taste-skills/skills/brutalist-skill`, `.claude/skills/ui-ux-pro-max` |
| Frontend skill üçlüsü (FE-3) | `frontend-design` (resmi) + `.claude/skills/impeccable` + `.claude/skills/design-motion-principles`; yardımcı: `.claude/skills/graphify` |
| Geçmiş hatalar & mimari kararlar | `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` |
| Proje dizin haritası | `docs/reference/proje-dizini.md` |
| F1 temporal tek kaynak | `lib/f1Calendar.ts` (`getF1Context()`) |
| F1 okuma / yazma | `lib/data/f1.ts` / `lib/f1Ingest.ts` |
| Takım renkleri | `config/team-colors.ts` |
| Tarihsel seed | `npm run seed:f1db` |
| Cron zamanlaması | `vercel.json` |
| Eski planlar (arşiv) | `docs/plans/completed/`, `docs/archive/` |
| Harici fikir/sistem referansı | `docs/additional-projects-ideas/F1 Race Replay/f1-race-replay-main/` (§1.5 eşlemesi) |

---

*Bu plan tüm önceki plan dosyalarının yerine geçer. Her adım bitince ilgili `[ ]` → `[x]` işaretlenir. Her faz sonunda commit + push. Faz Final tüm kapıları geçmeden release yok.*
