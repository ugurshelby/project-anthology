# APEX — Master Plan v2.0
> Oluşturulma: 2026-06-12  
> Kaynak: Council raporları (01-06) + FINAL-PLAN + YOL_HARITASI + design-anayasa + sohbet sentezi  
> Bu dosya tüm eski plan dosyalarının yerine geçer.

---

## 0. Proje Durumu (Başlangıç Noktası)

| Boyut | Durum | Not |
|---|---|---|
| Güvenlik | ✅ 9/10 | Kritik açık yok; CSP nonce backlog |
| SEO | ⚠️ 7/10 | noindex header preview URL'e sızıyor — production'da doğrula; metadata tamam |
| Mimari | ✅ 9/10 | DB-first snapshot, fallback testli |
| Test | ✅ 8.5/10 | 43 test geçiyor |
| Performans | ⚠️ 7/10 | Lighthouse ölçüldü: Perf 65-70, SEO 69 (noindex bug), Best Pract 92, A11y 96-100 |
| Tasarım bütünlüğü | ✅ 9/10 | Mobil bottom nav + responsive season table (`f442c8a`) |
| Ürün değeri | ✅ 8/10 | Pilot/takım profil sayfaları + grid (`0d4b41c`) |

**Eski plan dosyaları silinecek:**
```
docs/council/      → tüm 0X-*.md → arşive taşı veya sil
docs/plans/PLAN_COUNCIL_FINAL_2026-06-11.md → sil
YOL_HARITASI.md → bu dosya yerini aldı
```

---

## 1. Acil Manuel Aksiyonlar — TAMAMLANDI ✅

| # | İş | Durum | Not |
|---|---|---|---|
| M1 | `git push origin main` | ✅ | `ded3824` — origin/main ile senkron |
| M2 | Vercel → `CRON_SECRET` env ekle → Redeploy | ✅ | All Environments, updated 2026-06-12 |
| M3 | Cron sync-f1 manuel tetik → 200 | ✅ | 18 upsert, 0 hata, 20.6s |
| M4 | Lighthouse Mobile ölçümü | ✅ | Sonuçlar `logs/lighthouse/` klasöründe |
| M5 | Domain alma | ⏳ | Ertelendi — şimdilik Vercel subdomain yeterli |
| M6 | Haber görsel kararı | ✅ | Mevcut strateji korunuyor: RSS kaynaklarından gelen görsel URL'leri aynen kullanılır |

### M4 Lighthouse Baseline (2026-06-12, Mobile, Preview URL)

| Sayfa | Perf | A11y | Best Pract. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 65 | 100 | 92 | 69 | 3.2 s | 1,300 ms | 0 |
| `/season` | 70 | 96 | 92 | 69 | 2.3 s | 1,770 ms | 0 |
| `/news` | 65 | 100 | 92 | 69 | 3.7 s | 1,190 ms | 0 |

**Tespit edilen sorunlar (öncelik sırasıyla):**

1. **SEO 69 — `x-robots-tag: noindex`** → Preview URL'de middleware noindex header gönderiyor. Production URL'de (`project-anthology-five.vercel.app`) doğrulanması gerekiyor. Faz 0'da fix.
2. **Perf 65-70 — TBT yüksek (1,190–1,770 ms)** → `_next/static/chunks/2gauvx3zirkbg.js` chunk'ı her sayfada 1,000-1,300ms JS evaluation + 114-117KB unused JS. Büyük ihtimalle Framer Motion veya benzeri büyük library lazy load edilmiyor. Faz 5 sonrası ele alınacak.
3. **Best Practices 92 — `data:` URI CSP violation** → `next.config.ts` CSP'de `data:` izni yok. Faz 0'da fix.
4. **Best Practices 92 — Source maps yok** → Production için normal, dokunulmayacak.

---

## 2. Faz 0 — Launch Hazırlığı (1–2 gün)

### 2.1 Hukuki hijyen (Claude Code — S)

```
Footer'a ekle:
- "Not affiliated with Formula 1®"
- "Historical data: F1DB (CC-BY-4.0)" + link
Mevcut footer stiline ve DESIGN_SYSTEM.md kurallarına uy.
Commit: "chore: legal disclaimer and attribution"
```

### 2.2 Haber görsel stratejisi (Claude Code — S)

M6 kararına göre prompt ver:
```
News kartlarında dış görsel hotlink stratejisini M6 kararına göre uygula.
[A: Sadece ichef.bbci.co.uk kalsın] veya
[B: Görsel yok, tipografik fallback] veya  
[C: takım rengi + ilk harf placeholder SVG]
```

### 2.3 Backlog — opsiyonel ama önerilen

| Madde | Prompt | Efor |
|---|---|---|
| Upstash rate limit | `app/api/news → dağıtık rate limit. Upstash Redis env: UPSTASH_REDIS_REST_URL + TOKEN` | S |
| Preview deploy noindex | `middleware.ts → VERCEL_ENV=preview → X-Robots-Tag: noindex` | S |

---

## 3. Faz 1 — Mobil Web (Cursor — M) ✅

**Karar:** DESIGN_SYSTEM spec gerçek IA'ya güncellendi (Home / Season / Circuits / Anthology / More → News, Glossary). **Commit:** `f442c8a`.

### Cursor prompt:
```
pre-plans/DESIGN_SYSTEM.md mobil bottom nav spec'ini oku ve güncelle.
Rotalar: Home(/), Season(/season), Circuits(/circuits), Anthology(/anthology), More drawer (News, Glossary).
MobileBottomNav component ekle → app/layout.tsx'e bağla.
Mobilde SiteNav: logo + hamburger only; linkler bottom nav'da.
Touch target min 44px. --mobile-nav-height: 64px token kullan.
SeasonExplorer tablosunu mobilde kart layout'a çevir.
prefers-reduced-motion uyumlu.
Commit: "feat: mobile bottom nav + responsive season table"
```

### Mobil checklist:
- [x] Touch target min 44px
- [x] Bottom nav spec ile IA uyumlu
- [x] Sezon tablosu mobilde okunabilir
- [x] `--mobile-nav-height` token kullanılıyor
- [x] Tüm animasyonlar reduced-motion uyumlu

### Odometer countdown (Cursor — S) ✅

Home BentoCountdown + circuit detay sayacı — mekanik dikey kaydırma (`OdometerDigit`), üç durumlu `RaceCountdown` (countdown / live 4h / completed), `getLiveOrNextRace`. **Commit:** `feat: odometer countdown — mechanical scroll digit animation, circuit page integration`.

- [x] Home tile embedded countdown
- [x] Circuit sayfası yaklaşan yarış koşullu sayaç
- [x] `prefers-reduced-motion` anında swap
- [x] Kilit flash kaldırıldı (mekanik his)

---

## 4. Faz 2 — PWA (Claude Code — S)

```
Siteyi PWA yap:
- public/manifest.json: name "APEX", short_name "APEX", theme_color "#ff1801", background_color "#0a0a0a"
- 512x512 ve 192x192 PNG ikonlar (kırmızı chevron logosu — mevcut SVG'yi export et)
- app/layout.tsx'e manifest link ve apple-touch-icon
- next-pwa veya Next.js 16 PWA pattern kullan
- Offline: shell + statik sayfalar cache; API endpoint'leri cache etme
Commit: "feat: PWA manifest and service worker"
```

---

## 5. Faz 3 — Pilot & Takım Profil Sayfaları ✅

**Commit:** `0d4b41c` — `feat: driver and team profile pages + EntityDrawer navigation refactor`

**Bu fazın önceliği yüksek — YOL_HARITASI'ndaki değer 9/10.**

### 5.1 Mimari Karar

`EntityDrawer` → sayfa olarak terfi.
- `/drivers/[driverId]` → pilot profil sayfası
- `/teams/[constructorId]` → takım profil sayfası
- `/drivers` → tüm güncel sezon pilotları grid'i
- `/teams` → tüm güncel sezon takımları grid'i

Mevcut `EntityDrawer` kaldırılmayacak; sayfadan geri dönülünce drawer kapanır gibi davranır. Sayfalar `Link` ile açılır — `window.open` değil.

---

### 5.2 Sezon Bazlı Renk Paleti Sistemi

**Tüm profil sayfaları bu sistemi kullanır.**

Her takım için `config/team-colors.ts` içine sezon bazlı palette eklenmeli:

```ts
// Her takım için geçmiş sezon renkleri
interface SeasonPalette {
  primary: string;   // 60% — koyu arka plan tonu
  secondary: string; // 30% — takım ana rengi
  accent: string;    // 10% — vurgu / glow rengi
}

// Örnek:
'mclaren': {
  2026: { primary: '#0d0a06', secondary: '#FF8000', accent: '#FFB366' },
  2024: { primary: '#0d0a06', secondary: '#FF8000', accent: '#FFB366' },
  2010: { primary: '#0a0a0f', secondary: '#C0C0C0', accent: '#E8E8E8' }, // silver era
  2007: { primary: '#0f0a0a', secondary: '#CC0000', accent: '#FF3333' }, // red era
}
```

**Motion narrative renk geçişi (design-anayasa prensibi):**
- Kullanıcı sezon değiştirdiğinde sayfa renkleri `transition: 800ms` ile yeni sezon paletine geçer
- `prefers-reduced-motion`: instant swap
- CSS custom properties üzerinden: `--team-primary`, `--team-secondary`, `--team-accent`

---

### 5.3 Takım Profil Sayfası — `/teams/[constructorId]`

**Hero bölümü (60-30-10 kuralı + lüks hissi):**
```
ARKA PLAN: --team-primary (koyu ton, %60)
  + carbon grid (mevcut pattern)
  + radial glow bottom: --team-secondary %12 opacity
  + film grain overlay (mevcut)
  + light streak: --team-secondary rengi

HİYERARŞİ (üstten alta):
  eyebrow: "CONSTRUCTOR" — IBM Plex Mono 9px muted
  takım adı: Bebas Neue clamp(4rem,10vw,7rem) — TEXT PRIMARY
  sezon badge: --team-secondary renk chip
  
SOL PANEL: Takım rozeti / soyut amblem SVG
SAĞ PANEL: Güncel sezon standings chip'leri
```

**İçerik bölümleri:**
1. **Sezon seçici** — pill tablar (2026 default, geriye doğru)
   - Seçim değişince renk paleti `motion narrative` ile geçiş
2. **Sezon standings** — o sezondaki constructor championship sonucu + puan
3. **O sezondaki pilotlar** — kasklı büst ikonları + isimler
4. **Tüm zamanlar istatistikleri** — şampiyonluklar, galibiyetler, podyumlar
5. **Takım hikayesi** — `data/teams/[constructorId].ts` statik içerik (önce en ünlü 5-10 takım)
6. **Takım merkezi haritası** — `app/teams/[id]` içinde statik lat/lng → simple embed veya statik görsel
7. **En öne çıkan 5 araç görseli** — `public/cars/[constructorId]/[year].webp` (önce top-5 tarihi araç)
8. **İlgili haberler** — sadece güncel sezonda (2026) constructor adı içeren haberlerden 3 kart
   - `news_cache` tablosundan `title ILIKE '%mclaren%'` filtresi
   - Mevcut haber kart komponenti aynen kullanılır
9. **Bağlantılı anthology hikayeleri** — `stories` tablosundan tag eşleşmesi

---

### 5.4 Pilot Profil Sayfası — `/drivers/[driverId]`

**Hero bölümü — tasarımın kalbi:**
```
BÜYÜK NUMARA: Bebas Neue clamp(8rem,25vw,16rem)
  → Glassmorphism + gradient: --team-secondary → --team-accent
  → Derinlik: backdrop-filter blur(8px), subtle border
  → Opacity: 0.15 base (dekoratif arka plan katmanı)
  → Üzerinde: gerçek renk + glow

ÜSTÜNDE: pilot adı Bebas Neue clamp(2.5rem,6vw,5rem)
  → Letter-spacing 0.04em

EYEBROW: "DRIVER · [TAKIM ADI] · [SEZON]" IBM Plex Mono 9px muted
SAĞDA: pilot büst SVG (kasklı, yüz yok) — büyük, hero boyutunda
```

**İçerik bölümleri:**
1. **Sezon seçici** — Hamilton 2026 → 2025 → ... → 2007
   - Seçim değişince:
     - CSS `--team-primary/secondary/accent` yeni takım rengine geçer (motion narrative 800ms)
     - Pilot numarası güncellenir (F1'de sezon değişince numara değişebilir — 2014 öncesi şasi no)
     - Büst SVG güncellenir (o sezonki takım rengi)
2. **O sezondaki standings** — pozisyon, puan, galibiyetler, podyumlar
3. **Kariyer özeti** — toplam galibiyetler, şampiyonluklar, kariyer puanı (F1DB aggregate)
4. **Yarıştığı takımlar** — kronolojik sıra, yıl aralıkları, takım renk chip'leri
5. **Pilot hikayesi** — `data/drivers/[driverId].ts` statik içerik (önce top 20 tarihi pilot)
6. **Kask ve tulum renk şeması** — o sezondaki renk paletinin görsel temsili
7. **İlgili haberler** — 3 kart, aynı mantık (constructor'dan farklı)
8. **Bağlantılı anthology hikayeleri**

---

### 5.5 Drivers & Teams Grid Sayfaları

**`/drivers` sayfası:**
```
Başlık: "2026 DRIVERS" hero
Güncel grid — 22 pilot kart
Her kart: büst SVG + isim + takım + numara + puan
Hover: takım rengi border-left glow
Tıkla: /drivers/[driverId]
```

**`/teams` sayfası:**
```
Başlık: "2026 CONSTRUCTORS" hero
11 takım kart (2026)
Her kart: takım amblemi + isim + puan + pilot ikonları
Hover: takım rengi glow
Tıkla: /teams/[constructorId]
```

Her iki sayfa da navbar'a eklenir. DESIGN_SYSTEM güncellenir.

---

### 5.6 Haberler Entegrasyonu (Pilot & Takım Sayfaları)

**Sadece güncel sezon (2026) için aktif.** Tarihsel sezon seçilince haber bölümü gizlenir.

```ts
// lib/data/news.ts içine eklenecek
async function getNewsForEntity(
  entityName: string, 
  entityType: 'driver' | 'constructor',
  maxItems: number = 3
): Promise<NewsItem[]>
// news_cache tablosundan: title ILIKE '%${entityName}%'
// Fallback: aggregate() ile canlı RSS filtresi
```

Kart komponenti: mevcut `BentoNewsTile` veya news page kartı aynen kullanılır. Tasarım dili tutarlı kalır.

---

### 5.7 Claude Code için Sprint Prompt'u

```
APEX pilot ve takım profil sayfaları sprintı.

Önce oku: pre-plans/DESIGN_SYSTEM.md, docs/ASSETS.md,
config/team-colors.ts, lib/assets/f1-icons.ts

## Aşama 1 — Sezon bazlı renk paleti altyapısı ✅
config/team-colors.ts'e SeasonPalette interface'i ekle.
Mevcut 2026 renkleri primary/secondary/accent olarak yeniden yapılandır.
Seçilmiş 5 takım için tarihsel palette ekle (en az 3 farklı dönem):
McLaren, Ferrari, Mercedes, Red Bull, Williams.
CSS custom property sistemi: --team-primary, --team-secondary, --team-accent
Commit: "feat: season-aware team color palette system"

## Aşama 2 — Takım profil sayfası ✅
app/teams/[constructorId]/page.tsx oluştur (RSC).
Hero: 60-30-10 renk kuralı (design-anayasa.md oku), lüks atmospheric hero.
İçerik: sezon seçici, standings, o sezon pilotlar, istatistikler, haberler (3 kart).
Haberler: lib/data/news.ts'e getNewsForEntity() ekle; news_cache ILIKE filtresi.
motion narrative: sezon değişince CSS variables 800ms geçiş; reduced-motion instant.
generateMetadata: canonical, OG, twitter.
Commit: "feat: team profile page with season-aware colors"

## Aşama 3 — Pilot profil sayfası ✅
app/drivers/[driverId]/page.tsx oluştur (RSC).
Hero: büyük pilot numarası glassmorphism + gradient (--team-secondary → --team-accent).
Numara opacity 0.15 arka plan + üstte tam renk versiyon.
Pilot adı numaranın altında hiyerarşik.
Sezon değişince numara + renkler motion narrative ile güncellenir.
İçerik: sezon seçici, o sezon stats, kariyer özeti, takım geçmişi, haberler (3 kart).
Commit: "feat: driver profile page with dynamic team colors"

## Aşama 4 — Grid sayfaları ✅
app/drivers/page.tsx — 22 pilot grid, güncel sezon.
app/teams/page.tsx — 11 takım grid, güncel sezon.
Her kart hover'da takım rengi border-left glow.
Navbar'a "Drivers" ve "Teams" linkleri ekle veya mevcut Season altına dropdown.
DESIGN_SYSTEM.md güncelle: yeni sayfalar ve renk sistemi belgelensin.
Commit: "feat: drivers and teams grid pages + navbar update"

## Aşama 5 — Mevcut season/EntityDrawer entegrasyonu ✅
SeasonExplorer'daki pilot/takım satırları /drivers/[id] ve /teams/[id]'ye link olsun.
EntityDrawer yerine sayfa açılsın (yeni sekme değil, normal navigasyon).
Home bento'daki standings pill'leri de aynı link mantığı.
Commit: "refactor: EntityDrawer → profile page navigation"

## Doğrulama
npm run build sıfır hata · npm test yeşil
Yeni sayfalar sitemap.ts'e eklendi mi kontrol et.
logs/AGENT_PROFILE_PAGES_2026-06.md yaz.
```

---

## 6. Faz 4 — Görsel Asset Üretimi (Cursor + Manuel)

### 6.1 Pilot büst SVG şablonu (Cursor — M)

```
Tek omuz hizası pilot büst SVG şablonu üret:
- Stilize, yüz yok, kask + yarış tulumu
- Geometric flat style, F1 realistic değil
- Outline + 3 fill alan: kask, tulum gövde, tulum detay
- viewBox="0 0 80 80", 64px ve 128px scale'de okunaklı
- Sponsor logo yok — sadece renk blokları
Kaydet: assets/templates/bust-template.svg

Ardından Node.js script yaz:
- config/team-colors.ts ve season-rosters.json'dan palette al
- bust-template.svg fill renklerini değiştir
- Çıktı: public/drivers/{season}/{slug}.svg
- 2026 grid için tüm pilotları üret
Commit: "feat: driver bust SVG template and generation script"
```

### 6.2 Takım soyut amblem (Cursor — M)

```
Her constructor için soyut geometrik amblem SVG üret.
Gerçek logo kopyası değil — renk + form çağrışımı.
3 harf kodu + constructor palette rengi.
viewBox="0 0 40 40", clean ve ölçeklenebilir.
Çıktı: public/teams/{season}/{slug}.svg
2026 tüm takımlar için üret.
Commit: "feat: abstract team emblems"
```

### 6.3 Pist üzerinde dönen pilotlar (Cursor — M)

```
Circuit detay sayfasına (/circuits/[id]) dekoratif pist overlay ekle:
- assets/f1-circuits GeoJSON'dan SVG path üret (zaten var)
- Pist path üzerinde takım renkli circle'lar
- CSS offset-path animasyonu, eşit aralıklı 20 nokta
- Hover'da pilot kodu tooltip (IBM Plex Mono)
- prefers-reduced-motion: statik noktalar, animasyon yok
- Performans: will-change kaldırıldı sonra; passive event listeners
Commit: "feat: circuit lap animation overlay"
```

---

## 7. Faz 5 — Veri Görselleştirme (Cursor — M)

### 7.1 Gap visualization (Season sayfası — S/M)

```
Season sayfasına Driver Standings altına "Gap to Leader" viz ekle:
- Her pilot için lidere puan farkı yatay bar
- Bar rengi: takım rengi (team-colors.ts)
- Lider: kırmızı bar, full genişlik
- Animasyon: IntersectionObserver ile soldan dolar (AnimatedBar pattern)
- Değer: IBM Plex Mono sağa hizalı
- prefers-reduced-motion: static render
Commit: "feat: gap to leader visualization"
```

### 7.2 Puan evrimi grafiği (Season sayfası — M)

```
Season sayfasına round bazlı puan evrimi grafiği ekle:
- X ekseni: round 1..N, Y ekseni: kümülatif puan
- Her pilot için çizgi, takım rengi
- Recharts LineChart kullan (mevcut dependency)
- Sadece top 5 pilot göster (kalabalık olmasın)
- Hover: round adı + puan
- Veri: mevcut standings snapshot'larından türet
- prefers-reduced-motion: animasyon yok, statik render
Not: Bu için round bazlı standings history snapshot'ı gerekebilir (yeni type: 'standings_history')
Commit: "feat: championship points evolution chart"
```

### 7.3 Lights-out countdown (Home — S)

```
BentoCountdown bileşenini güncelle:
- Son 5 saniyede: 5 kırmızı F1 start ışığı sırayla yanar (her 1s'de bir)
- 0'da: tüm ışıklar söner + kısa #ff1801 flash
- Sadece yarışa 5 saniye kalınca tetiklenir, öncesinde normal countdown
- prefers-reduced-motion: normal sayısal countdown
- Işıklar: 5 adet 12px circle, #cc0000 → glow animasyonu
Commit: "feat: lights-out countdown animation"
```

---

## 8. Faz 6 — Ürün Derinliği (Orta Vade)

Öncelik sırasıyla:

| # | Özellik | Değer | Efor | Bağımlılık |
|---|---|---|---|---|
| 1 | **Global arama cmd+K** | 9 | M | Supabase full-text index; pilot, pist, hikaye, glossary |
| 2 | **2000–2017 sezon UI** | 7 | M | F1DB seed genişletme; sezon pill'leri; asset audit |
| 3 | **Radio filtre & playlist** | 7 | S | `radio_moments` hazır; client UI filter |
| 4 | **Anthology ↔ yarış embed** | 7 | M | Story metadata + snapshot join |
| 5 | **Head-to-head karşılaştırma** | 7 | M | results DB aggregate; iki pilot seçici |
| 6 | **Session schedule (FP/Q/R)** | 6 | S | CalendarRace sessions typed; home + circuit tile |
| 7 | **Open-Meteo race forecast** | 6 | S | Hourly forecast mini chart |
| 8 | **Tarihsel pist layout seçici** | 6 | M | GeoJSON yıl varyantları; SVG picker UI |

---

## 9. Faz 7 — Uzun Vade

| Özellik | Değer | Efor | Not |
|---|---|---|---|
| Hafta sonu canlı mod (OpenF1 leaderboard) | 9 | XL | Vercel Pro cron + SSE/WebSocket |
| Telemetri / sector viz | 8 | XL | OpenF1 extended + canvas/WebGL |
| Türkçe i18n | 7 | L | next-intl; çeviri + routing; TR haber kaynağı |
| Kullanıcı katmanı (favoriler, kayıtlı radio) | 5 | L | Supabase Auth + RLS |
| Vercel Pro geçişi (15 dk cron) | 6 | — | Billing kararı |
| Capacitor (gerçek native app) | — | L | Faz 1+2 sonrası; kitle varsa |
| React Native + Expo | — | XL | Ciddi kullanıcı kitlesi sonrası |

---

## 10. Design Anayasası — Apex'e Uyarlama

`design-anayasa.md` prensiplerinin Apex'teki karşılığı:

| Prensip | Apex Uygulaması |
|---|---|
| 50ms Halo Etkisi | AtmosphericHero + slipstream: ilk görüntüde sinematik his |
| Bilişsel akıcılık | Bento grid; her tile tek sorumluluk; 0 radius; net hiyerarşi |
| Beyaz boşluk lüksü | 80px section gap desktop; içerik genişliği 1180px |
| 60-30-10 renk | `--team-primary` bg, `--team-secondary` marka, `#ff1801` accent |
| Motion narrative | Sezon değişince takım rengi 800ms CSS variable geçişi |
| Glassmorphism 2.0 | Pilot numarası hero: backdrop-blur + gradient overlay |
| Tabular nums | `font-variant-numeric: tabular-nums` — tüm sayaç ve tablo |
| Mikro etkileşimler | OdometerDigit + RaceCountdown ✅, AnimatedBar, TiltCard, CalendarScroller |
| Hiç stok fotoğraf | Kasklı büst SVG; soyut amblem; pist SVG — hepsi özgün üretim |
| Performans = tasarım | will-change disiplini; LCP priority; ISR/dynamic dengesi |

**Yeni DESIGN_SYSTEM eklemeleri** (bir sonraki Cursor sprint'inde güncellenir):
```
## Team Color System
- CSS variables: --team-primary (60%), --team-secondary (30%), --team-accent (10%)
- Default (no team context): #0a0a0a / #ff1801 / #cc1400
- Transition: 800ms ease on season change; instant on prefers-reduced-motion

## Driver Number Hero
- Bebas Neue, clamp(8rem,25vw,16rem)
- Glassmorphism layer: backdrop-blur(8px), 0.15 opacity fill
- Gradient: --team-secondary → --team-accent
- Solid version layered on top for legibility

## Profile Page Hero
- Same atmospheric layers as existing hero
- Bottom glow: --team-secondary instead of #ff1801
- Light streak: --team-secondary at 30% opacity
```

---

## 11. Eski Dosyaların Kaderi

Claude Code'a ver:
```
Aşağıdaki tamamlanmış plan dosyalarını sil veya docs/archive/ klasörüne taşı:
- docs/council/01-security.md
- docs/council/02-performance.md
- docs/council/03-seo.md
- docs/council/04-architecture.md
- docs/council/05-ux-design.md
- docs/council/06-roadmap.md
- docs/council/00-FINAL-PLAN.md
- docs/plans/PLAN_COUNCIL_FINAL_2026-06-11.md

Koru (aktif referans):
- pre-plans/DESIGN_SYSTEM.md (her sprintte kullanılıyor)
- docs/ASSETS.md (asset pipeline)
- MISSING_ASSETS.md (hâlâ güncel)
- APEX_MASTER_PLAN.md (bu dosya)

Commit: "chore: archive completed council plan files"
```

---

## 12. Özet Zaman Çizelgesi

```
Hafta 1:
  M1-M6 Manuel aksiyonlar                              [sen]
  Faz 0: Disclaimer + haber görsel                     [Claude Code, S]
  Faz 1: Mobil nav + responsive ✅                     [Cursor, M]

Hafta 2:
  Faz 2: PWA ✅ (`f140758`)                                   [Claude Code, S]
  Faz 3, Aşama 1-2: Renk paleti + takım sayfası ✅            [Claude Code, M]

Hafta 3:
  Faz 3, Aşama 3-4: Pilot sayfası + grid'ler ✅               [Claude Code, M]
  Faz 3, Aşama 5: EntityDrawer → sayfa nav ✅                 [Claude Code, S]

Hafta 4:
  Faz 4: Pilot büst + amblem + pist animasyon           [Cursor, M]
  Faz 5: Gap viz + puan grafiği + lights-out            [Cursor, M]

Sonrası (backlog):
  Faz 6: Global arama, radio filtre, head-to-head      [M dalgalar]
  Faz 7: Canlı mod, i18n, native app                   [XL — kitle sonrası]
```

---

## 13. Araç Dağılımı

| Görev | Kim | Neden |
|---|---|---|
| Backend, data layer, cron, migration, API | **Claude Code** | Terminal, build, test otomasyonu |
| Frontend UI, animasyon, SVG, CSS | **Cursor** | Çoklu model, görsel iterasyon |
| Tasarım referansı, wireframe | **Stitch** | F1 Tracker (2945783334156170940), F1 Archive (10690481427201095334) |
| Karmaşık mimari karar / cross-cutting | **Claude (bu sohbet)** | Bağlam birikimi |
| Önemli final review | **Fable 5** | En güçlü; yüksek efor kararları için |

---

*Bu plan tüm önceki plan dosyalarının yerine geçer. Her sprint sonunda ilgili satırları ✅ olarak işaretle.*
