# APEX — Senin Yol Haritanın

> Bu dosya, implementasyon sonrası Claude ile yaptığın geliştirme sohbetinin **senin gözünden** okunabilir halidir.  
> Kod yazmadan önce neyi, neden ve hangi sırayla düşünmen gerektiğini anlatır.  
> Cursor / Claude Code’a vereceğin mini promptlar da içinde.

**Neredesin?** Site teknik olarak ~%85–90 hazır. Launch edilebilir; kalan iş çoğunlukla **manuel deploy**, **hukuki hijyen**, **mobil cilası** ve **görsel/asset katmanı**.

---

## Bu haritayı nasıl kullanırsın?

1. **Yukarıdan aşağı oku** — fazlar bilinçli sıralı.
2. Bir kutuda **“Karar ver”** yazıyorsa, kod yazmadan önce seçim yap.
3. **“Manuel”** kutuları sen yaparsın (Vercel, domain, Lighthouse, Figma export vb.).
4. **“Prompt”** kutularını olduğu gibi Cursor’a yapıştırabilirsin; gerekirse dosya yollarını ekle.
5. **“Dış araç”** kutularında deneme serbest — beğenmediğin çıktıyı at, yeniden dene.

Efor kodu: **S** = birkaç saat–1 gün · **M** = birkaç gün–1 hafta · **L** = haftalar

---

## Faz 0 — Launch’a kadar (1–2 gün)

Bunlar bitmeden “canlıdayız” deme. Çoğu kod değil, panel işi.

### 0.1 Deploy ve cron

| # | Ne yapıyorsun | Tür |
|---|---------------|-----|
| 1 | `git push origin main` | Manuel |
| 2 | Vercel → Settings → Environment Variables → `CRON_SECRET` ekle (değer = mevcut `CRON_SECRET_KEY` ile aynı). Production + Preview. Save → Redeploy | Manuel |
| 3 | Deploy sonrası cron testi (200 dönmeli): `curl.exe -H "Authorization: Bearer DEGER" "https://project-anthology-five.vercel.app/api/cron/sync-f1?scope=season"` | Manuel |
| 4 | Canlıda round sayfası: `/season/2026/round/6` — Monaco sonuçları, qualifying, sprint açılıyor mu? | Manuel test |

### 0.2 Performans kaydı

| # | Ne yapıyorsun | Tür |
|---|---------------|-----|
| 5 | Chrome DevTools → Lighthouse → Mobile → `/` ve `/season` skorlarını not al (referans için sakla) | Manuel |

### 0.3 Hukuki hijyen (tek commit’lik iş — Cursor’a ver)

Footer veya About’a şunları ekle:

- `Not affiliated with Formula 1®`
- `Historical data: F1DB (CC-BY-4.0)` + link

**Prompt:**

```
Footer'a F1 disclaimer ve F1DB CC-BY-4.0 atıfı ekle.
Metin: "Not affiliated with Formula 1®" ve "Historical data: F1DB (CC-BY-4.0)".
Mevcut footer stiline uy, pre-plans/DESIGN_SYSTEM.md accent kurallarına uy.
```

### 0.4 Haber görselleri — karar ver

BBC görselleri hotlink riski taşıyor. Üç yol:

| Seçenek | Anlamı |
|---------|--------|
| **A** | Sadece BBC kaynağı (diğerlerini görselsiz) |
| **B** | Hiç hotlink yok — kartlarda metin + kaynak rozeti, görsel yok |
| **C** | Kendi ürettiğin soyut placeholder (takım rengi + başlık harfi) |

Karar vermeden kod sprint’i başlatma.

**Prompt (B seçeneği örneği):**

```
News kartlarında dış kaynak görsel hotlink'ini kaldır.
Görsel yoksa takım/etiket rengine göre tipografik fallback kart göster.
```

### 0.5 Domain (hazırsan)

`apex.racing` veya benzeri al → Vercel’a bağla → `PROD_SITE_URL` + `NEXT_PUBLIC_SITE_URL` güncelle.  
Yapmazsan canonical ve OG URL’ler `vercel.app` kalır; site yine çalışır.

### 0.6 Opsiyonel: Upstash rate limit

Sadece “API’yi scrape ederler” endişen varsa:

1. upstash.com → ücretsiz Redis
2. Vercel env: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
3. Cursor’a `/api/news` dağıtık rate limit bağlat

**Faz 0 bitti sayılır:** cron 200, round sayfası OK, disclaimer/atıf canlıda, haber görsel stratejisi seçildi.

---

## Faz 1 — Mobil web (önce bu, app değil)

Native app düşünmeden önce mobil **web**’i düzelt. BoxBox da önce web/PWA mantığıyla büyüdü.

### Neden önemli?

Council ve UX raporu: `pre-plans/DESIGN_SYSTEM.md` içinde **bottom nav + hamburger** spec var; kodda yok. `SiteNav` tüm linkleri küçük ekranda da gösteriyor — sıkışık ve amatör hissettiriyor.

### Karar ver (P0)

Spec’teki rotalar (Home / Season / Circuits / Radio / More) ile gerçek IA (Anthology / News / Circuits / Season / Glossary) uyuşmuyor. İki yol:

| Yol | Ne yaparsın |
|-----|-------------|
| **1 — Spec’i kodla** | Bottom nav’ı güncel rotalara göre uyarlayıp implement et |
| **2 — Spec’i güncelle** | Mevcut üst nav’ı mobilde iyileştir; DESIGN_SYSTEM’i gerçeğe yaz |

Hangisini seçersen seç, **tek kaynak** olsun (spec veya kod — ikisi birden çelişmesin).

### Mobil checklist (Cursor sprint — S/M)

- [ ] Touch hedefleri min **44px** (Apple HIG; spec 64px bottom bar)
- [ ] Sezon tablosu: yatay scroll yerine **kart layout** veya özet + detay
- [ ] `--mobile-nav-height: 64px` token’ı kullanılsın (şu an ölü token)
- [ ] Bottom nav varsa içerik `padding-bottom` ile nav altında kalmasın
- [ ] `prefers-reduced-motion` — mevcut hook’lara uy

**Prompt:**

```
pre-plans/DESIGN_SYSTEM.md mobil bottom nav spec'ini oku.
MobileBottomNav component'i ekle ve layout'a bağla.
Rotalar: Home (/), Season (/season), Circuits (/circuits), Anthology (/anthology), More (drawer: News, Glossary).
Mobilde SiteNav sadece logo + hamburger; linkler bottom nav ve More drawer'da.
Touch target min 44px, --mobile-nav-height kullan.
```

**Referans ara:** Dribbble → “F1 mobile dashboard”, BoxBox App Store ekran görüntüleri (kopyalama değil — bilgi mimarisi için).

**Faz 1 bitti sayılır:** Telefonda tek elle gezilebiliyorsun; sezon verisi okunaklı; nav kararı spec’te net.

---

## Faz 2 — PWA (ücretsiz “app hissi”) — S

App Store’a girmeden telefona kurulabilir site.

### Ne kazanırsın?

- Ana ekrana ekle
- İsteğe bağlı offline shell
- İleride push bildirimi (yarış geri sayımı vb.)

### Manuel / araç

- `next-pwa` veya Next 16’nın önerdiği PWA pattern — dokümantasyona bak
- `manifest.json`: isim **APEX**, tema rengi `#ff1801`, ikonlar (512×512 PNG — Figma veya basit SVG export)

**Prompt:**

```
Siteyi PWA yap: manifest.json, theme-color, apple-touch-icon.
next-pwa veya projeye uygun güncel PWA yaklaşımını kullan.
Offline: en azından shell + statik sayfalar; API cache agresif olmasın.
```

**Faz 2 bitti sayılır:** iPhone/Android “Add to Home Screen” çalışıyor; ikon ve splash düzgün.

---

## Faz 3 — UI’ı “profesyonel” hissettir — M dalgalar

Mevcut dil güçlü: karanlık, sinematik, 0 radius, `#ff1801` accent. Seviye atlatacak olan **veri hikâyesi** ve **mikro hareket**.

### 3.1 Veri görselleştirme (yüksek etki)

| Özellik | Ne hissettirir | Veri elinde mi? | Efor |
|---------|----------------|-----------------|------|
| **Puan evrimi grafiği** | Sezon boyunca çizgilerin yarışması | Kısmen — round standings türetmek gerekebilir | M |
| **Gap visualization** | Lidere uzaklık çubukları | Evet (standings) | S–M |
| **Bump chart** | Grid → finish pozisyon değişimi | Evet (`results` snapshot) | M |

**İlham (ücretsiz):** Dribbble “F1 dashboard”, Behance “racing UI”, The Ringer veri hikâyeleri.

**Prompt (gap viz):**

```
Season sayfasına "Gap to leader" yatay bar visualization ekle.
Her pilot için lidere saniye/puan farkı; takım rengi sol border glow.
Recharts veya mevcut AnimatedBar pattern'ine uy. prefers-reduced-motion'a saygı.
```

### 3.2 Mikro-etkileşimler (S)

- Sayılar: mevcut `FlipDigit` / count-up’ı daha fazla yerde kullan
- Kart hover: `border-left` takım rengi glow
- Skeleton → içerik: stagger fade (zaten plan dosyasında var — `.cursor/plans/visual_sprint_animations_de3f79dc.plan.md`)

**Prompt:**

```
StoryCard ve season kartlarına hover'da takım/pilot renginde border-left glow ekle.
Skeleton'dan içeriğe 50ms stagger. DESIGN_SYSTEM: shadow yok, sadece border/glow.
```

### 3.3 Tipografi cilası (S — çoğu CSS)

```css
font-variant-numeric: tabular-nums;
```

Sayaç ve tablolarda rakamlar zıplamasın. Büyük istatistiklerde outline text (saf CSS).

**Faz 3:** Tek seferde hepsini yapma. Önce **bir tane “vay” özelliği** (puan evrimi veya gap viz) → canlıya al → sonra mikro cilalar.

---

## Faz 4 — Görsel assetler (BoxBox seviyesi, telif güvenli)

En yaratıcı kısım. Burada **dış araç denemek normal** — bir pilot büstü beğenmezsen yeniden üret.

### Telif — ezberle

| Güvenli | Riskli |
|---------|--------|
| Kendi stilize SVG/illüstrasyon | Gerçek takım logoları |
| Takım **renkleri** (logo değil) | Pilot yüz fotoğrafları |
| Pist **şekli** (coğrafi gerçek) | F1 resmi fontu / F1 logo |
| Kask geometrisi + renk **blokları** (sponsor yazısı yok) | Birebir sponsor logoları |

BoxBox yüz kullanmaz; **kask + tulum** kullanır — sen de aynı strateji.

### 4.1 Pilot büstleri (kask + tulum) — M, en yüksek görsel ROI

**Strateji:** Tek SVG şablon → pilot başına sadece renk paleti değiştir.

Elindeki altyapı:

- `data/season-rosters.json`
- `config/constructor-palette.json` / `config/team-colors.ts`
- `public/drivers/{season}/` klasör yapısı

**İş akışı:**

1. Figma veya Cursor ile **bir** omuz hizası büst şablonu (kask + tulum silüeti)
2. Şablonu SVG olarak kaydet
3. Script veya Cursor ile 22 pilot × renk şeması üret (sponsor → düz renk blok)
4. `SVGOMG` ile optimize et
5. `driverIconSrc()` ile uyumlu dosya adları

**Prompt (şablon):**

```
Omuz hizası pilot büst SVG üret: stilize, yüz yok, kask + yarış tulumu.
Geometric flat style, F1 realistic değil. Tek renk outline + 2-3 fill alanı (kask, tulum, detay).
viewBox sabit, 64x64 ve 128x128 scale'de okunaklı. Sponsor logo yok, sadece renk blokları.
```

**Prompt (otomasyon):**

```
config/team-colors.ts ve season roster'a göre pilot SVG'lerini üret.
Tek bust-template.svg'den fill renklerini değiştiren Node script yaz.
Çıktı: public/drivers/2026/{slug}.svg
```

**Dış araçlar:** Figma (ücretsiz), Inkscape, SVGOMG, isteğe bağlı Vectorizer.ai (raster → vektör; sonra el ile sadeleştir)

### 4.2 Takım “logoları” (soyut amblem) — M

Gerçek logo yok. Mevcut 3 harf kodu + renk bloğu iyi başlangıç.

İstersen her takıma **soyut sembol** (Ferrari → köşeli form, McLaren → hız çizgisi gibi — kalkan kopyası değil).

**Prompt:**

```
Her constructor için soyut geometrik amblem SVG (logo kopyası değil).
3 harf kodu + constructor palette rengi. public/teams/2026/{slug}.svg
```

### 4.3 Pist üzerinde dönen pilotlar — M (dekoratif) / XL (gerçek replay)

**Basit versiyon (önce bunu):** `assets/f1-circuits` GeoJSON → SVG path → CSS `offset-path` ile renkli noktalar döner. Veri şart değil; eşit aralıklı 20 nokta bile etkileyici.

**Gelişmiş versiyon:** OpenF1 `location` endpoint — tek yarış replay (Monaco demo).

**Prompt (dekoratif):**

```
Circuit detay sayfasına pist SVG overlay ekle.
GeoJSON'dan path al; üzerinde takım renkli circle'lar offset-path ile yavaş dönsün.
Hover'da pilot kodu tooltip. prefers-reduced-motion'da statik noktalar.
Referans: assets/f1-circuits ve mevcut circuits/[id] sayfası.
```

### 4.4 Arşiv sezonları (2000–2017 UI)

Asset’ler büyük ölçüde hazır; UI 2018’den başlıyor. Seed + sezon pill’leri genişletme — ürün değeri yüksek, görsel tutarlılık için pilot/takım SVG’leri o yıllar için de gerekir.

**Faz 4 bitti sayılır:** Grid’de yüz fotoğrafı yok; kasklı büstler ve renk amblemleri tutarlı; en az bir pistte “canlı harita” dekoru var.

---

## Faz 5 — Sayaç ve hava durumu (“havalı” canlı veri) — S/M

Open-Meteo zaten bağlı (`circuits/[id]`). Eksik olan **sunum**.

### 5.1 Lights-out geri sayım — S

Yarışa kalan sürede son 5 saniye: 5 kırmızı ışık tek tek yanar, 0’da söner → “lights out”.

**Prompt:**

```
Next race countdown'a F1 start lights konsepti ekle.
Son 5 saniyede 5 kırmızı lamba sırayla yanar; 0'da hepsi söner ve kısa flash.
prefers-reduced-motion: normal sayısal countdown kalsın.
```

### 5.2 Hava durumu overlay — S

- Yağmur olasılığı: pist SVG üstünde animasyonlu damla/nokta
- Rüzgar: pist haritasında yön oku
- Saatlik forecast: mini bar chart (Open-Meteo hourly)

**Prompt:**

```
Circuit weather panelini güçlendir: pist SVG üzerinde rain probability overlay,
rüzgar yönü oku, saatlik forecast mini bar chart. Mevcut Open-Meteo entegrasyonunu kullan.
```

---

## Faz 6 — Kopyalanmayı “önleme” (gerçekçi beklenti)

**Gerçek:** Tarayıcıya giden frontend tamamen gizlenemez. Panik etme.

### Asıl kalelerin (zaten iyi)

- Veritabanı + kürasyon sunucuda — en değerli şey bu
- Cron auth’lu
- 17 anthology hikâyesi, radio kürasyonu, sezon asset arşivi — **emoğu kopyalamak zor**

### Yap

- Repo’da lisans: kod “All rights reserved”, içerik telif notu
- `robots.txt` API’leri zaten koruyor
- SVG’lere hafif metadata / imza (isteğe bağlı)
- Upstash rate limit (Faz 0.6)

### Yapma

- JS obfuscation
- Sağ tık engelleme

**Moat stratejisi:** BoxBox klonlayan çok oldu; kazanan kopya değil **üst üste biriken emek**. Senin moat: anthology + radio + estetik + kürasyon.

---

## Faz 7 — Gerçek mobil uygulama (şimdilik ertele)

| Aşama | Ne | Ne zaman |
|-------|-----|----------|
| **1** | Mobil web mükemmel | Şimdi (Faz 1) |
| **2** | PWA | Faz 2 |
| **3** | Capacitor (WebView sarmalayıcı) | PWA kullanıcısı varsa |
| **4** | React Native + Expo | Ciddi kitlesi olursa |

**Capacitor:** Mevcut Next sitesini paketler — en düşük efor.  
**Expo:** BoxBox kalitesi ama UI sıfırdan.

---

## Launch sonrası — ürün dalgası (değer sırası)

Council roadmap ile uyumlu; sohbette tekrar vurgulananlar:

| # | Özellik | Değer | Efor | Not |
|---|---------|:-----:|:----:|-----|
| 1 | Pilot profil `/drivers/[id]` | 9 | M | EntityDrawer’ı sayfaya terfi |
| 2 | Takım profil | 8 | M | Tarihsel renk + roster |
| 3 | Global arama `Cmd+K` | 8 | M | Pilot, pist, hikâye, glossary, radio |
| 4 | 2000–2017 sezon UI | 7 | M | Seed + asset audit |
| 5 | Radio filtre & playlist | 7 | S | `radio_moments` hazır |
| 6 | Rota bazlı OG görselleri | SEO | M | Paylaşım kartları |
| 7 | `/season/[year]` yıl segmentleri | SEO | L | Uzun vade |

---

## Önerilen sıra (tek bakışta)

```
Faz 0  Launch manuel + disclaimer + haber görsel kararı     [1–2 gün]
Faz 1  Mobil web + nav kararı                                 [S/M]
Faz 2  PWA                                                    [S]
Faz 4  Pilot büst şablonu + otomasyon                         [M] ← görsel patlama
Faz 4  Pist üzerinde dönen noktalar (dekoratif)               [M]
Faz 3  Puan evrimi veya gap viz                               [M]
Faz 5  Lights-out countdown                                   [S]
Faz 5  Hava overlay cilası                                    [S]
Faz 0  Upstash (ihtiyaç varsa)                                [S]
Faz 7  Capacitor (talep varsa)                                [L]
       Pilot sayfaları + arama                                 [M]
```

---

## Hızlı prompt kütüphanesi

Kopyala-yapıştır; bağlama göre dosya ekle.

**Genel kural:**

```
Her frontend işinde önce pre-plans/DESIGN_SYSTEM.md oku.
Accent yalnız #ff1801, border-radius 0, box-shadow yok.
prefers-reduced-motion hook'unu kullan.
```

**Footer hukuk:**

```
Footer: "Not affiliated with Formula 1®" + F1DB CC-BY-4.0 atıfı.
```

**Mobil nav:**

```
DESIGN_SYSTEM mobil spec + güncel IA (Anthology, News, Circuits, Season, Glossary).
Bottom nav + More drawer implement et.
```

**Pilot SVG:**

```
Kasklı büst SVG, yüz yok, sponsor yok, renk blokları. 22 pilot için palette script.
```

**Pist animasyon:**

```
Circuit SVG + offset-path ile takım renkli noktalar, hover tooltip.
```

**Countdown:**

```
F1 start lights — son 5 saniye kırmızı lambalar, 0'da söner.
```

---

## Projeyi patlatmadan büyütme kuralları

1. **Önce karar, sonra sprint** — mobil nav ve haber görseli gibi P0 kararları Cursor’a bırakma.
2. **Bir “vay” özelliği → deploy → ölç** — Lighthouse ve telefonunda bak.
3. **Asset’te şablon + otomasyon** — 22 pilotu tek tek elle çizme.
4. **Telif checklist’ini her görselde geç** — logo ve yüz yok.
5. **Manuel adımları atlama** — cron ve env yanlışsa her şey eski veri gösterir.
6. **Eski sohbet ham metni** — gerekirse arşiv için `claude-chat.md` saklanabilir; günlük iş bu dosya.

---

## İlgili dosyalar

| Dosya | Ne için |
|-------|---------|
| `pre-plans/DESIGN_SYSTEM.md` | Görsel kurallar SSOT |
| `docs/council/06-roadmap.md` | Ürün özellik envanteri |
| `docs/plans/PLAN_COUNCIL_FINAL_2026-06-11.md` | Son implementasyon sprint’i |
| `MISSING_ASSETS.md` | Eksik görsel listesi |
| `docs/ASSETS.md` | Asset pipeline notları |

---

*Son güncelleme: 2026-06-11 — Kaynak: `claude-chat.md` sohbet özeti + council raporları*
