# AGENT — QA SPRINT — 2026-06-09

Üç aşamalı QA/polish sprint. Her aşama kendi commit'i, her aşama sonu `npm run build` sıfır hata.

---

## AŞAMA 1 — Görsel sprint doğrulama (commit yok: değişiklik gerekmedi)

Beş özelliğin tamamı **VAR / ÇALIŞIYOR** bulundu; düzeltme gerekmedi.

| # | Özellik | Durum | Kanıt |
|---|---------|-------|-------|
| 1.1 | Hero slipstream (3 paralel çizgi) | ✅ VAR | `AtmosphericHero.tsx` 3 streak div (`hero-light-streak`, `-2`, `-3`); `globals.css` 3 selector + `@keyframes hero-streak` mevcut |
| 1.2 | Circuit lap line | ✅ ÇALIŞIYOR | `CircuitLapLine.tsx`: SVG fetch + `DOMParser` + `getTotalLength()` + `stroke-dashoffset` animasyon; `role="img"` + `aria-label`; load fail → `SafeImage` fallback. `public/circuits/` altında 24 gerçek SVG var. `app/circuits/[id]/page.tsx` component'i kullanıyor |
| 1.3 | Calendar card tilt | ✅ VAR | `TiltCard.tsx`: `onMouseMove` bağlı, `perspective: '600px'` set, MAX_TILT 8°, `prefers-reduced-motion` guard. `SeasonExplorer.tsx:677` kullanıyor |
| 1.4 | Constructor bar sweep | ✅ VAR | `AnimatedBar.tsx` + `AnimatedBarGroup`: `useInViewOnce` (IntersectionObserver) ile tetikleniyor; `BentoConstructorsTile.tsx` mobilde `axis="horizontal"`, desktop'ta `axis="vertical"` |
| 1.5 | Countdown flip | ✅ VAR | `FlipDigit.tsx`: `mounted` ref hydration gate, `memo`'lu, her rakam ayrı `FlipDigit`; `BentoCountdown.tsx` her digit'i ayrı render ediyor |

**Not:** Aşama 1'de kod değişikliği olmadığı için boş commit atılmadı (boş commit anti-pattern). Doğrulama bu logda kayıtlı.

---

## AŞAMA 2 — Geçmiş sezon pilot/takım asset düzeltmesi (commit e4dcdcf)

### 2.1 Fazla pilot — KÖK NEDEN: yok (yanlış alarm)
- `app/season/page.tsx` → `getSeasonData(year)` → `getDriverStandings(driverData)` çağırıyor; **hardcode pilot listesi yok**, padding yok. Render tamamen standings-driven.
- Geçmiş sezonlarda 20'den fazla satır görünmesi mümkün ama bu **doğru**: sezon içi pilot değişiklikleri (yedek sürücüler) standings'te ayrı satır olarak yer alır ve hepsi o sezon puan almıştır. Liste kırpılmamalı — kırpmadık.

### 2.2 Eksik asset fallback — DÜZELTİLDİ
- **Önce:** `driverIconSrc()/teamIconSrc()` null dönünce UI hiçbir şey göstermiyordu (`: null`); slug çözülüp dosya 404 olunca `SafeImage` generic `/placeholder.svg` gösteriyordu.
- **Çözüm:** `components/ui/AssetFallback.tsx` (yeni) — tasarım dilinde rozet: `#131313` bg, `#ff1801` 2px border-left, IBM Plex Mono kod/baş harf. Driver için FIA kodu, takım için ad baş harfleri.
- `SafeImage.tsx`'e opsiyonel `fallbackNode` prop'u eklendi (geriye dönük uyumlu) → 404 durumunda da generic placeholder yerine rozete düşüyor.
- `SeasonExplorer.tsx`'te driver avatar (mobil 32px, desktop 28px, recap podium 36px) ve constructor logo (32px) slotlarında hem null hem 404 yolu rozete bağlandı. Ad zaten görünür olan inline 14/22px team logoları kasıtlı sade bırakıldı (çift kimlik clutter olmasın).

### 2.3 Sezon uyumu — KÖK NEDEN: yok (zaten doğru)
- `SeasonExplorer.tsx` tüm asset çağrılarında görüntülenen yılı (`data.year` / `year`) geçiriyor — `driverIconSrc(code, name, year)`, `teamIconSrc(name, year)`. CURRENT_SEASON sabiti geçilmiyor. (Dosya önceki görevde güncellenmiş; doğru.)

---

## AŞAMA 3 — a11y + testler + Lighthouse (commit 2de88b3)

### 3.1 A11y
- **focus-visible:** `globals.css`'e global kural eklendi: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` — native + `role="button"`/`tabIndex` elementleri kapsar.
- **EntityDrawer açan satırlar** (SeasonExplorer, 3 adet): `aria-haspopup="dialog"` + açıklayıcı `aria-label` (ör. "Lewis Hamilton, Ferrari, 90 points — open details").
- **FlipDigit:** `sr-only` ile güncel değeri okunabilir hale getirildi; animasyonlu flip katmanları `aria-hidden` (parçalı/çift okuma önlendi).
- **AnimatedBar:** dekoratif fill `aria-hidden` — sayısal değer/puan zaten bitişik metinde gösteriliyor, çift duyuru önlendi.
- **CircuitLapLine:** zaten `role="img"` + `aria-label` (Aşama 1).
- **alt taraması:** Tüm `<Image>` kullanımı `SafeImage` üzerinden (`alt` zorunlu tip) — eksik alt yok. 26 `alt=""` örneğinin tamamı bitişik metin etiketli dekoratif ikonlar → doğru a11y pratiği.

### 3.2 Testler — 15 test, 15 PASS
- **Tooling:** `vitest@^3` + `@vitejs/plugin-react` kuruldu (jsdom zaten vardı). `vitest.config.ts` (node env, `@/` alias). `package.json` script: `test`, `test:watch`.
- **tests/aggregate.test.ts** (4): `processFeeds` saf çekirdeği test edildi (network'lü `aggregate()` yerine) — dedupe (aynı canonicalUrl → tek, en yeni), boş feed → `[]`, non-F1 eleme, newest-first sıralama. *Not: "maxItems limiti" `aggregate()`'in slice'ı; network-bound olduğu için bu seviyede test edilmedi — `processFeeds` maxItems almaz.*
- **tests/f1Calendar.test.ts** (6): `isRaceDone` (gelecek→false, geçmiş→true, geçersiz tarih→false); `roundSuffixToSnapshotType` (`results`/`qualifying`/`driverStandings` doğru map; `telemetry`→null).
- **tests/f1-icons.test.ts** (5): `driverIconSrc` bilinmeyen kod+ad yok→null, bilinen→sezon path, sezon param yansıması; `teamIconSrc` bilinmeyen→null, sezon param yansıması.

**Brief ↔ kod çelişkileri (kasıtlı, koda göre yazıldı):**
1. Brief: `roundSuffixToSnapshotType("results-1") → "results"`. **Gerçek:** kod numerik-sufiksli disk-path artefactlarını bilerek **null** döndürür (`_\d+$` reddi; DB'ye sızmasını engellemek için). Test gerçek davranışı assert eder.
2. Brief: `driverIconSrc(bilinmeyen) → null`. **Gerçek:** serbest metin ad verilirse resolver iyimser Ergast id path'i üretir (404 → SafeImage fallback). Gerçek null vakası: ad/id olmadan bilinmeyen kod. Test buna göre düzeltildi.

### 3.3 Lighthouse — MANUEL GEREKLİ
- playwright/puppeteer **kurulu değil** → otomatik ölçüm atlandı. **Lighthouse: manuel ölçüm gerekli.**
- Yapılan statik kontrol: tek above-fold raster LCP görseli `NewsFeaturedHero` zaten `priority` set. Diğer hero'lar (home, season) CSS/SVG katman — raster LCP yok, `priority` gerekmiyor.

### 3.4 Final
- `npm run build`: ✅ Compiled successfully, TypeScript ✅, 48/48 sayfa.
- `npx vitest run`: ✅ 15/15 pass.
- Boş alt taraması: dekoratif dışında boş alt yok.

---

## Özet tablo

| Aşama | Bulgu | Aksiyon | Commit |
|-------|-------|---------|--------|
| 1 | 5/5 özellik mevcut | — (doğrulama) | yok |
| 2 | Asset null/404 fallback eksik | AssetFallback + SafeImage.fallbackNode | e4dcdcf |
| 3 | focus-visible yok, aria eksik, test yok | focus ring + aria + 15 test | 2de88b3 |
| 4 | — | bu log | (sıradaki) |

**Test sonucu:** 15 test / 15 pass (3 dosya).
**A11y:** focus-visible eklendi; FlipDigit/AnimatedBar/entity-row aria düzeltildi; eksik alt yok.
**Lighthouse:** manuel gerekli (tooling yok); hero priority statik kontrolü temiz.

## Sonraki adım önerisi
1. **Lighthouse:** Vercel deploy sonrası prod URL'de `npx lighthouse` veya Chrome DevTools ile LCP/CLS/INP + a11y skoru ölç. İstenirse `@playwright/test` + `playwright lighthouse` CI'a eklenebilir.
2. **2026 DB snapshot:** geçmiş görevdeki content-invalid F1DB placeholder'ları sync-f1 cron (`scope=season`) ile canlı veriye güncellenince hem `—` fallback'leri hem her-render proxy maliyeti kalkar.
3. **Test kapsamı:** staleness (`snapshotStaleness.ts`) ve `isSeasonSnapshotContentInvalid` için birim test eklenebilir (regresyon kalkanı).
