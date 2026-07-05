# Design: Driver/Team Hero Redesign + Grid/Home Polish

> Kaynak: Efendim'in ilettiği "APEX PROJECT — UI/UX AUDIT" direktifi (4 madde).
> Tasarım otoritesi: `docs/design/apex-design-language.md` (Sinematik Editöryel, Apex Red, Barlow Condensed + JetBrains Mono). Bu redesign o dilin **dışına çıkmaz** — yeni font/renk eklemez, mevcut token'ları (`--bg`, `--surface`, `--accent`, `--team-secondary` vb.) kullanır.
> Kapsam: yalnızca kök Next.js web (`mobile/` hariç).

---

## Doğrulanan Gerçek Durum (kod incelemesiyle)

Direktifteki 4 iddiadan ikisi kodda **doğrulanamadı** — bunları olduğu gibi bırakıyoruz, gerçek olan ikisine odaklanıyoruz:

| Direktif maddesi | Durum |
|---|---|
| 1. Drivers grid — sağda dev boşluk (max-width eksik) | ❌ Kodda yok — `DriversGridPage` zaten `PageShell` içinde (`max-w-[var(--container-max)] mx-auto`). Küçük bir görsel tutarlılık işi var (aşağıda). |
| 1. Russell/Hülkenberg asset karışıklığı | ❌ Doğrulanamadı — `lib/assets/f1-icons.ts` eşleme mantığı doğru, `public/drivers/2026/russell.svg` ve `hulkenberg.svg` farklı hash/boyutta, ayrı dosyalar. Gerçek bir görsel karışıklık varsa ayrı bir görsel QA turu gerekir (bu redesign kapsamı dışında). |
| 2. Driver hero — kutu hissi, kesim çizgisi belirgin, sayı offset | ✅ **Gerçek.** `ProfileHero.tsx` hâlâ `border border-hairline bg-surface` kartı; mask-image/derinlik hiç yok. |
| 3. Team hero — araba "yapıştırma sticker" hissi | ✅ **Gerçek.** Aynı `ProfileHero` kullanılıyor, radial glow yok ama kart hissi orada da var. |
| 4. Home hero — kontrast/boşluk | 🟡 **Kısmen** — `PosterHero.tsx`'te zaten güçlü bir scrim var (`from-bg via-bg/50 to-bg/20`). Küçük bir derinlik/kontrast iyileştirmesi yeterli, büyük refactor gerekmiyor.

Bu doküman yalnızca **gerçek** bulgular (2, 3) + küçük polish (1, 4) için bir plan sunar.

---

## 1. Yeni `ProfileHero` — Sinematik Katmanlı Hero

Mevcut `components/profile/ProfileHero.tsx` tamamen yeniden yazılır (aynı prop arayüzü korunur, `driverId`/`team` sayfaları değişmez kalır).

### Yapı (z-index katmanları)

```
Z-0   Arka plan: --team-secondary'den --bg'ye dikey/radial gradient + dev soluk arka plan numarası (bigNumber)
Z-10  Sürücü/araba görseli — mask-image ile alttan yumuşak eriyor
Z-20  Ön plan: kicker + başlık + meta + stat çocukları (children)
```

### Görsel detaylar

- **Kart kabuğu kaldırılıyor:** `border border-hairline bg-surface rounded-[var(--radius-lg)]` gidiyor. Yerine tam genişlik, kenar sınırı olmayan bir `section`.
- **Arka plan gradient:** `bg-gradient-to-b from-[var(--team-secondary)]/25 via-black/40 to-[var(--bg)]` — takım rengi üstte hafif sızıyor, alta doğru tamamen `--bg`'ye eriyor (sayfanın geri kalanıyla kaynaşıyor, "kutu" hissi bitiyor).
- **Arka plan numarası (bigNumber):** Artık sağa itilmiş değil, **sürücü görselinin tam arkasında ortalanmış** (`absolute inset-0 flex items-center justify-center`), opaklık %5-8 (`text-text-hi/[0.06]`), z-0.
- **Sürücü görseli mask-image:** Görsel container'ına inline style:
  ```css
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 96%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 96%);
  ```
  Bu, sürücünün bel-kesim düz çizgisini görünmez kılar, altta `--bg`'ye eriyor.
- **Masaüstü ölçek:** Sürücü görseli mobilde `h-64`, masaüstünde `lg:h-[420px]` civarına büyütülüyor (mevcut `h-48 md:h-64` çok küçüktü — direktifteki "scale-miniaturized" tespiti burada **doğru**, `ProfileHero.tsx:70` `aspect-[3/4] h-48 md:h-64` masaüstünde de görece küçük kalıyor).
- **Başlık boyutu korunuyor** (`clamp(48px, 8vw, 104px)`), ama artık arka plandaki numara ve görselle aynı kompozisyonel eksende (üst üste binen değil, katmanlı derinlik).

### Team hero varyantı (`imageKind="car"`)

- Araba görseli yatayda, alt sınıra yakın (`object-bottom`), altında keskin radial glow yerine **yatay, alçak opaklıklı linear gradient** (`bg-gradient-to-t from-[var(--team-secondary)]/15 to-transparent`, blur ile yumuşatılmış) — "sticker" hissi yerine zemine oturmuş his.
- Takım logosu, araba görselinin üstünde ortalanmış (`absolute left-1/2 -translate-x-1/2 top-6`).
- İki pilotun numarası logoyu simetrik flankeliyor: `justify-between` içinde sol/sağ `hero-number` span'leri — bu **yeni bir prop** gerektiriyor (`flankNumbers?: [string, string]`), yalnızca team sayfasında kullanılacak.

### Erişilebilirlik / performans notları

- `prefers-reduced-motion` zaten proje genelinde saygı görüyor (CLAUDE.md kuralı) — bu redesign'da yeni bir animasyon eklenmiyor (yalnızca statik gradient/mask), o yüzden ek bir guard gerekmiyor.
- `mask-image` yalnızca CSS, GPU-safe (transform/opacity değil ama layout'u tetiklemiyor, tek seferlik paint).
- Görsel `Image` component'i `fill` + `sizes` kullanmaya devam ediyor (mevcut davranış korunuyor).

---

## 2. Drivers Grid — Küçük Polish

- `DriverCard` içindeki `DriverAvatar`'a sabit `aspect-square` container eklenir (şu an `size={64}` sabit px, konteynerde aspect zorlaması yok — büyük ekranlarda/farklı görsel oranlarında hafif distorsiyon riski).
- Grid zaten `max-w` içinde — dokunulmuyor.
- Asset karışıklığı iddiası bu redesign'ın kapsamında **çözülmüyor** (kodda doğrulanamadı); ayrı bir görsel QA/asset denetimi önerilir.

## 3. Home Hero — Küçük Polish

- `PosterHero.tsx`'teki mevcut çift gradient (`from-bg via-bg/50 to-bg/20` + `from-[#2a0a0a]/80`) korunuyor, üstüne düşük opaklı bir üçüncü katman: alt kısımda (metin bindiği bölge) hafif ek karartma (`bg-gradient-to-t from-black/60 via-black/10 to-transparent`, yalnızca metin bloğunun arkasında, `absolute inset-x-0 bottom-0 h-2/3`) — parlak gökyüzü/tribün bölgesinde başlık okunabilirliğini garantiye alır.
- Sağ kolondaki (`HomeDataColumn`) boş alan sorunu — `flex flex-col` + `justify-between` yerine içerik doğal akışta bırakılıyor zaten (`overflow-y-auto`); bu doğrulanmadıkça (görsel erişimim yok) dokunulmuyor, düşük öncelik.

---

## Değişecek Dosyalar

| Dosya | Değişiklik |
|---|---|
| `components/profile/ProfileHero.tsx` | Tam yeniden yazım — kart kabuğu kaldırma, z-index katmanları, mask-image, `flankNumbers` prop (opsiyonel) |
| `app/teams/[constructorId]/page.tsx` | `ProfileHero`'ya `flankNumbers={[d1.number, d2.number]}` geçirme |
| `components/standings/GridCards.tsx` (`DriverCard`) | `DriverAvatar` sarmalayıcısına `aspect-square` |
| `components/home/PosterHero.tsx` | Üçüncü hafif karartma katmanı eklenmesi |

**Değişmeyecek:** `app/drivers/page.tsx`, `BentoGrid`/`PageShell`, design token'ları (`app/globals.css`), font/renk sistemi.

---

## Test / Doğrulama Planı

- `npx tsc --noEmit` ve mevcut Vitest suite (component testi olmadığı için görsel regresyon testi yok — bu proje için normal).
- Manuel görsel doğrulama: dev server + tarayıcı (bu ortamda Chrome DevTools MCP bağlı değil; mümkünse Efendim tarayıcıda kontrol eder, ya da bir sonraki oturumda bağlanınca ben doğrularım).
- `prefers-reduced-motion` ve WCAG kontrast kontrolü: yeni gradient katmanlarının metin kontrastını düşürmediğinden emin olunur (metin zaten `--text-hi` beyaz, arkası artık daha koyu gradient — kontrast artıyor, azalmıyor).
