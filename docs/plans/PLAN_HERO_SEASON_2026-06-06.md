# PLAN — AtmosphericHero büyütme + Season sayfası veri/UI onarımı
**Tarih:** 2026-06-06 · **Sorumlu:** Claude Code · **Branch:** main (doğrudan)

## Bağlam
Stitch referans tasarımı (Season Tracker — F1 Tracker/Archive) görsel olarak incelendi: sinematik
büyük hero (sürücü lideri başlığı), driver standings tablosu (takım rengi sol accent, lider vurgulu),
constructor bar chart (takım rengi barlar), last race recap (P1/P2/P3, pole, fastest lap, tyre),
race calendar kartları. DESIGN_SYSTEM.md "Atmospheric Hero Layers" stack sırası SSOT.

---

## SORUN 1 — AtmosphericHero sinematik değil

### Teşhis
- `components/ui/AtmosphericHero.tsx`: `min-height: 280px` (globals.css), içerik `py-12` ile üstte küçük.
- Katman stack'i DESIGN_SYSTEM sırasına UYUYOR (grid→spotlight L/R→red glow→grain→streak→content) ✅
  ama yükseklik ve içerik hizası sinematik değil.
- Sayfalar hero başlığını kendi `font-display text-[...]` ile veriyor — tutarsız:
  `/` clamp(3,12vw,5), `/anthology` clamp(3,12vw,8), `/season|/circuits|/news|/radio` sabit `2.5rem`.

### Düzeltme
1. `app/globals.css` `.atmospheric-hero`: `min-height: 100vh` (→ `min-height: 100svh` mobil güvenli),
   flex kolon, içerik alt-orta: `justify-content: flex-end`. `.hero-content` alt padding `pb-20`.
2. `AtmosphericHero.tsx`: content wrapper `flex flex-col justify-end` + `pb-20`, `min-h` korunur.
   `prefers-reduced-motion` zaten streak'te var — bozulmayacak; yeni animasyon eklenmiyor.
3. Hero başlık ölçeğini tek standARda çek: `clamp(4rem,14vw,10rem)`. Her sayfanın hero `<h1>`'i
   bu clamp'e güncellenir (sabit `2.5rem` olanlar dahil). 7 sayfa: `/ /anthology /season /circuits
   /radio /news /tech-glossary`.

### Etki
Tüm sayfalarda hero 100vh olur, başlık büyür, içerik alt-orta hizalanır. Kırılma riski: hero altı
içerik 100vh aşağı kayar (kabul — sinematik istendi).

---

## SORUN 2 — Season sayfası "No standings" + zayıf UI

### Kök neden (DOĞRULANDI)
DB'de 2026 verisi VAR ama `(season=2026, round=NULL, type=standings_drivers)` için **2 satır** var
(id 223 + 231). Postgres `UNIQUE(season,round,type)` round NULL iken NULL'ları distinct sayar →
duplikasyon engellenmemiş. `lib/data/f1.ts` `.maybeSingle()` birden fazla satırda PostgREST hatası
döndürür → `result.error` dolu → fonksiyon `null` → sayfa "No standings".
Aynı durum `standings_constructors` (2 satır) ve `calendar` (2 satır) için de geçerli.

### Düzeltme (karar: İKİSİ DE)
1. **Okuma katmanı** (`lib/data/f1.ts`): season + round snapshot okumalarında `.maybeSingle()` →
   `.order('fetched_at', { ascending: false }).limit(1).maybeSingle()` (en güncel satır; duplikat
   varsa patlamaz). Round-level fetch de aynı şekilde sağlamlaştırılır.
2. **DB temizliği**: her `(season, round, type)` grubunda en yeni `fetched_at` hariç eskileri sil
   (service role REST ile, idempotent script). 2026 standings_drivers/constructors/calendar duplikatları.
3. **Yeni helper'lar** (`lib/f1/mrdata.ts`): `getConstructorStandings()`, `getLastRaceResult()`
   (P1/P2/P3 + fastest lap), `getQualifyingPole()` — hepsi saf, MrData → tipli satır.
4. **Veri akışı** (`app/season/page.tsx`): RSC'de paralel fetch: calendar, standings_drivers,
   standings_constructors, son biten round'un results + qualifying. DB → (yoksa) proxy zaten f1.ts'te.

### UI yeniden inşa (`app/season/page.tsx` — RSC; client yalnız interaktif)
- **Hero**: SORUN 1 clamp başlık. Lider sürücü adı varsa eyebrow/HUD'a yansıtılır (opsiyonel, veri varsa).
- **Driver Standings tablosu**: sıra no, pilot (sol kenar `border-left` takım rengi), takım, puan.
  Lider satırı accent vurgulu. Takım rengi `config/team-colors.ts` `resolveTeamUiColor(constructorName)`.
- **Constructor Standings**: pure CSS yatay bar chart. Bar genişliği = puan/maxPuan. Renk = takım `ui`.
  0 radius (design system). Saf RSC, client gerekmez.
- **Race Calendar**: yatay kaydırılabilir kart listesi (`overflow-x-auto flex`), her kart: round no +
  GP adı + tarih + durum (tamamlandı/yaklaşıyor — `isRaceDone`/tarih ile). Snap opsiyonel.
- **Last Race Recap**: son biten round'un P1/P2/P3 + pole + fastest lap. Veri yoksa bölüm gizlenir.
- Tüm fetch RSC'de. İnteraktif parça (yatay scroll) saf CSS → client component GEREKMEZ.

---

## Dosya envanteri
| Dosya | Değişiklik |
|---|---|
| `app/globals.css` | `.atmospheric-hero` 100vh + flex justify-end; `.hero-content` pb |
| `components/ui/AtmosphericHero.tsx` | content wrapper flex/justify-end/pb-20 |
| `app/page.tsx`,`anthology`,`season`,`circuits`,`radio`,`news`,`tech-glossary` page.tsx | hero h1 clamp(4rem,14vw,10rem) |
| `lib/data/f1.ts` | maybeSingle → order+limit(1); season & round fetch |
| `lib/f1/mrdata.ts` | getConstructorStandings, getLastRaceResult, getQualifyingPole |
| `app/season/page.tsx` | UI tam yeniden inşa (4 bölüm) |
| `scripts/dedupe-f1-snapshots.ts` | duplikat temizlik (bir kez çalıştır) |

## Doğrulama (DoD)
- [ ] `npm run build` → exit 0, TS sıfır hata
- [ ] Season sayfası standings + calendar + recap gösteriyor (lokal prod fetch ile)
- [ ] Tüm 7 sayfada hero 100vh + büyük başlık
- [ ] commit → push origin main

## Anti-pattern guard (Masterplan Karar D)
- RSC fetch, client'a ham veri yok ✅ · hardcode sezon yok (`CURRENT_SEASON`) ✅
- service-role yalnız temizlik script'inde (server-side) ✅ · 0 radius/shadow korunur ✅
