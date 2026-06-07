# AGENT LOG — Tam Sağlık Kontrolü (Health Check)

**Tarih:** 2026-06-07
**Agent:** Claude Code (Opus 4.8)
**Tür:** Salt-okunur tanı — **hiçbir kod değişikliği yapılmadı**
**Branch:** main · son commit `7fac832`

Bu rapor sıralı 8 başlıkta tam sağlık kontrolünü kapsar. Bulgular üç renkte:
🔴 **Kritik** (aksiyon gerekli) · 🟡 **Uyarı** (izlenmeli/iyileştirme) · 🟢 **Sağlıklı**.

---

## 🔴 KRİTİK BULGULAR

### K1 — `/season`, `/circuits`, `/anthology` build-time'da DONUYOR (static prerender)
Build route tablosu:
```
ƒ /            (dynamic, revalidate=0)   ✓
ƒ /news        (dynamic, revalidate=0)   ✓
○ /season      (STATIC — build'de donmuş) ❌
○ /circuits    (STATIC — build'de donmuş) ❌
○ /anthology   (STATIC — build'de donmuş) ❌
```
Bu üç sayfa `f1_snapshots` / `stories` / `radio_moments` okuyor ama **hiçbirinde
`export const revalidate` yok** → Next.js varsayılanı ile build anında statik prerender
ediliyorlar. Cron DB'yi günlük güncelliyor (sync-f1 07:00, sync-news 06:00, sync-radio 08:00 UTC)
ama bu sayfalar **bir sonraki deploy'a kadar eski veriyi gösterir**.
- Bu, `plans/v1.2-polish.md` **A bölümünün (A1/A2/A3)** tam olarak çözmek için açtığı sorundur —
  plan maddeleri hâlâ `[ ]` işaretsiz, yani **yapılmamış**.
- **Etki:** Standings/calendar/recap ve yeni story/radio içeriği canlıda gecikir.
- **Çözüm (plan A4):** üç sayfaya `export const revalidate = 900;` (15dk ISR) ekle.
  `/news` `0` kalmalı (en kritik tazelik). Kod değişikliği bu görevin kapsamı dışında — sadece raporlandı.

---

## 🟡 UYARILAR

### U1 — news_cache bugün güncellenmemiş olabilir
`news_cache` en yeni `cached_at` = **2026-06-06T23:07 UTC**. Bugün 2026-06-07.
sync-news günde bir 06:00 UTC'de çalışmalı. Bu kontrol anında ya cron henüz çalışmadı
ya da çalıştı fakat yeni haber bulamadı. **İzlenmeli:** yarın `cached_at` 2026-06-07 olmalı.
Not: `/news` `revalidate=0` olduğu için DB güncellenince sayfa anında taze olur (K1'den etkilenmez).

### U2 — public/stories/ içinde 3 başıboş (stray) klasör
`public/stories/` altında 17 gerçek story slug'ının yanında 3 artık klasör var:
`Full 1280x720`, `Landscape 1280x720`, `Portrait 1280x1707` (görsel export artığı).
17 gerçek story'nin **hepsi** tam (`full/landscape/portrait` alt klasörleri dolu — doğrulandı).
Stray klasörler işlevsel zarar vermez ama `public/` klasörünü kirletir ve deploy'a gider.
**Öneri:** silinmeli (kapsamı bu görevin dışında).

### U3 — Vercel prod cron ortam değişkeni manuel teyit gerekli
`CRON_SECRET_KEY` `.env.local`'de var ve **lokal auth tam çalışıyor** (aşağıda Y9).
Vercel'in otomatik cron'unun aynı Bearer'ı gönderebilmesi için `CRON_SECRET_KEY`'in
**Vercel dashboard env'inde** de tanımlı olması gerekir. Bu oturumda Vercel env okunamadı.
⚠️ **MANUEL AKSİYON:** Vercel → Project → Settings → Environment Variables içinde
`CRON_SECRET_KEY` var mı teyit et. Yoksa zamanlanmış cron'lar 401 alır (manuel curl çalışır).

### U4 — `/api/f1-season` sözleşmesi görev örneğinden farklı (defect değil)
Görevdeki örnek `?season=2026&type=standings_drivers` bu route'ta **400** döner.
Route gerçekte `?path=` whitelist'i kullanır (SSRF-hardened proxy). Doğru çağrı
`?path=2026/driverStandings` → **200** + geçerli `MRData` (22 sürücü). Route **sağlıklı**;
yalnız görev metnindeki örnek URL formatı route'un sözleşmesiyle eşleşmiyor.

### U5 — `circuits` DB tablosu boş (0 satır) — tasarım gereği
`circuits` tablosu 0 satır. Ancak circuit sayfaları bu tablodan değil, `f1_snapshots`
calendar snapshot'ı + statik `data/circuits/facts.ts` + SVG manifest'ten besleniyor
(`lib/data/circuits.ts` doğrulandı). Yani **boşluk bir defect değil**; tablo şu an
render yolunda kullanılmıyor. İleride kullanılacaksa seed gerekir — bilgi amaçlı not.

### U6 — Lint: 1 aktif uyarı (kod kalitesi)
`components/home/BentoLastRaceTile.tsx:11` — `'code' is assigned a value but never used`.
Zararsız ama temizlenebilir. Diğer 3 uyarı yalnız `old-versions-valuable-files/` (referans, excluded).

---

## 🟢 SAĞLIKLI

### Y1 — Build & TypeScript
- `npm run build` → **exit 0**, `✓ Compiled successfully in 22.4s`, **0 TS hatası**.
- 17 route üretildi; sitemap.xml / robots.txt / opengraph-image endpoint'leri mevcut.

### Y2 — Lint
- `npm run lint` → **0 error**, 4 warning (1 aktif U6 + 3 referans dosyası). Hata yok.

### Y3 — Database satır sayıları
| Tablo | Satır | Durum |
|---|---|---|
| f1_snapshots | 213 | 🟢 dolu |
| stories | 17 | 🟢 17/17 |
| radio_moments | 46 | 🟢 dolu |
| news_cache | 167 | 🟢 dolu |
| circuits | 0 | 🟡 U5 (tasarım gereği boş) |

### Y4 — f1_snapshots season × type dağılımı (2018–2026)
```
season  calendar  qualifying  results  sprint  std_drivers  std_constructors
2018       1         21         ·        ·          1             1
2019       1         21         ·        ·          1             1
2020       1         17         ·        ·          1             1
2021       1         22         ·        ·          1             1
2022       1         22         ·        ·          1             1
2023       1         22         ·        ·          1             1
2024       1         24         ·        ·          1             1
2025       1         24         ·        ·          1             1
2026       1          5         5        3          1             1   (sezon devam ediyor)
```
🟢 Her sezon calendar + qualifying + iki standings içeriyor. 2026 in-season: results/sprint
verisi mevcut (round 5/6'ya kadar). Tutarlı ve beklenen şekil.

### Y5 — news_cache cached_at aralığı
- En eski: `2026-06-04T18:59:16 UTC`
- En yeni: `2026-06-06T23:07:53 UTC`  (bkz. U1 — bugünün güncellemesi izlenmeli)

### Y6 — Partial unique index
- `idx_f1_snapshots_season_type_no_round` migration `20260606000001_partial_unique_index.sql`'de
  TANIMLI: `CREATE UNIQUE INDEX ... ON (season, type) WHERE round IS NULL`.
- `supabase migration list` → **Local = Remote = 20260606000001** (uygulanmış, prod'da canlı).
- Round-NULL doğrulaması: standings_drivers / standings_constructors / calendar her biri
  **tam 9 satır** (= sezon başına 1, 2018–2026). **Duplikat YOK** → index etkili çalışıyor.
  (Bkz. `anthology-f1snapshots-null-dupe` hafıza notu — sorun çözülmüş durumda.)

### Y7 — API Routes (prod build, localhost:3100)
| Route | Sonuç |
|---|---|
| `GET /api/f1-season?path=2026/driverStandings` | 🟢 200 + MRData (22 sürücü) |
| `GET /sitemap.xml` | 🟢 200 (24 circuit + story loc) |
| `GET /robots.txt` | 🟢 200 |
| `GET /api/cron/sync-f1` (auth'lu) | 🟢 200 (bkz. Y9) |

### Y8 — Sayfa rotaları (localhost:3100, prod build)
| Rota | Sonuç |
|---|---|
| `/` | 🟢 200 |
| `/anthology` | 🟢 200 |
| `/news` | 🟢 200 |
| `/circuits` | 🟢 200 |
| `/season` | 🟢 200 |
| `/tech-glossary` | 🟢 200 |
| `/anthology/senna-monaco` | 🟢 200 |
| `/anthology/hunt-lauda` | 🟢 200 |
| `/circuits/ca-1978` | ⚪ 404 — **geçersiz ID** (gerçek değil) |
| `/circuits/mc-1929` | ⚪ 404 — **geçersiz ID** (gerçek değil) |

**Not (circuit 404):** `ca-1978` / `mc-1929` Ergast circuit ID'si DEĞİL — uydurma. Gerçek
ID'ler Ergast slug'ları: `monaco`, `villeneuve` (Kanada), `silverstone`, `monza`, `spa`...
Bunların **hepsi 200** döndü (test edildi). Geçersiz ID'de 404 doğru `notFound()` davranışı.
Toplam 22 geçerli circuit ID sitemap'te listeli.

### Y9 — Cron Auth
Kod: `app/api/cron/sync-f1/route.ts:54` → `header === \`Bearer ${process.env.CRON_SECRET_KEY}\``.
| İstek | Beklenen | Sonuç |
|---|---|---|
| sync-f1 — token YOK | 401 | 🟢 401 |
| sync-f1 — YANLIŞ token | 401 | 🟢 401 |
| sync-news — token YOK | 401 | 🟢 401 |
| sync-news — YANLIŞ token | 401 | 🟢 401 |
| sync-f1 — DOĞRU token (`?scope=live`) | 200 | 🟢 200 |

`CRON_SECRET_KEY` `.env.local`'de yüklü ve koddaki kontrolle eşleşiyor. Lokal auth tam.
(Vercel prod env teyidi → U3 manuel aksiyon.)

### Y10 — Güvenlik Header'ları (canlı: project-anthology-five.vercel.app, HTTP 200)
| Header | Durum |
|---|---|
| `X-Frame-Options: SAMEORIGIN` | 🟢 |
| `X-Content-Type-Options: nosniff` | 🟢 |
| `Content-Security-Policy` (tam politika) | 🟢 |
| `Cross-Origin-Opener-Policy: same-origin` | 🟢 |
| `Referrer-Policy: strict-origin-when-cross-origin` | 🟢 (bonus) |
| `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | 🟢 (bonus) |

CSP `connect-src`: self + Supabase + Sentry + Vercel insights + Jolpica + OpenF1.
Lokal prod build header'ları canlıyla **birebir** eşleşiyor.

### Y11 — Statik Varlıklar
| Klasör | Beklenen | Bulunan | Durum |
|---|---|---|---|
| `public/drivers/*.svg` | 22 | **24** | 🟢 (2 fazla, eksik yok) |
| `public/teams/*.svg` | 11 | **11** | 🟢 |
| `public/circuits/*.svg` | 24 | **24** | 🟢 |
| `public/stories/` (gerçek slug klasörü) | 17 | **17** | 🟢 (her biri full/landscape/portrait DOLU) |
| `public/stories/` stray klasör | 0 | **3** | 🟡 U2 |

### Y12 — Veri Tazeliği (revalidate değerleri)
| Dosya | Beklenen | Gerçek | Durum |
|---|---|---|---|
| `app/season/page.tsx` | 900 | **(yok)** → static | 🔴 K1 |
| `app/circuits/page.tsx` | 900 | **(yok)** → static | 🔴 K1 |
| `app/anthology/page.tsx` | 900 | **(yok)** → static | 🔴 K1 |
| `app/news/page.tsx` | 0 | **0** | 🟢 |
| `app/page.tsx` (home) | — | **0** | 🟢 |

---

## Çalıştırılan komutlar (özet)
- `npm run build` → exit 0 (route tablosu + prerender markerları incelendi)
- `npm run lint` → 0 error / 4 warning
- DB: Supabase REST (service role, salt-okuma) ile satır sayısı, season×type, cached_at, round-NULL
- `npx supabase migration list` → partial unique index Local=Remote teyidi
- `npm run start` (:3100) + curl: 10 sayfa rotası, 4 API/cron rota, cron auth (401×4 + 200×1)
- `curl -I` canlı prod → 6 güvenlik header'ı
- PowerShell: drivers/teams/circuits/stories varlık sayımı + variant bütünlüğü

## Temizlik
Tüm geçici dosyalar (`scripts/_healthcheck-db.ts`, `logs/_healthcheck_*.txt`) silindi;
:3100 sunucusu durduruldu. Kalıcı değişiklik **yok** (bu rapor hariç).

---

## 📋 Türkçe Özet

✅ **Tamamlananlar:** Build (exit 0, 0 TS hata), lint (0 error), DB sağlıklı (213/17/46/167 satır,
season×type tutarlı, partial unique index canlı, duplikat yok), 8/8 gerçek sayfa rotası 200,
API + sitemap + robots 200, cron auth tam (401/200), 6 güvenlik header'ı canlıda mevcut,
statik varlıklar tam (17 story full/landscape/portrait dolu).

⚠️ **Manuel aksiyon gerekenler:**
- **U3:** Vercel dashboard'da `CRON_SECRET_KEY` env var'ı teyit et (otomatik cron 401 riski).
- **U1:** Yarın `news_cache.cached_at` 2026-06-07 oldu mu izle (sync-news cron sağlığı).

❌ **Açık/eksik (kod aksiyonu — bu görevin kapsamı dışında, sadece raporlandı):**
- **K1 (KRİTİK):** `/season` `/circuits` `/anthology` static prerender → cron sonrası donuyor.
  Plan A1/A2/A3 yapılmamış. Çözüm: üç sayfaya `export const revalidate = 900`.
- **U2:** `public/stories/` 3 stray klasör silinmeli.
- **U6:** `BentoLastRaceTile.tsx:11` kullanılmayan `code` değişkeni.

📁 **Değiştirilen dosyalar:** Yalnız `logs/AGENT_HEALTH_CHECK_2026-06-07.md` (bu rapor). Başka değişiklik yok.

## Sonraki adım
1. **K1** önceliklendir (plan A bölümü, en küçük diff / en büyük etki).
2. U3 Vercel env teyidi (cron prod güvenilirliği).
3. U2 + U6 hızlı temizlik.
