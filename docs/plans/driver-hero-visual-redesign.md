# Pilot Hero Görsel Yeniden Tasarımı — antigravity için Brief

> **Durum:** Efendim'in talebiyle hazırlandı (2026-09-28 fotoğrafsız politika kararının doğrudan devamı).
> Bu bir uygulama planı değil, bir **tasarım brief'i** — nihai görsel karar antigravity'nin.
> Backend/mimari (Claude) tarafı tamam: veri, renkler, tipografi token'ları hazır ve kararlı.

---

## 1. Sorun

`components/profile/DriverProfileHero.tsx` — pilot detay sayfasının (`/drivers/[driverId]`) hero'su —
sağ tarafta büyük, maskeli bir pilot fotoğrafı kesiti (%62-68 genişlik) göstermek üzere tasarlanmıştı.
2026-09-28'de tüm pilot fotoğrafları telif riski nedeniyle kaldırıldı (`driverIconSrc()` artık hep
`null` döner — bkz. commit `398739f`). Bu bileşende fotoğraf alanı şöyle korunmuş:

```tsx
{imageSrc ? (
  <div className="... büyük maskeli kesit ...">
    <ApexImage src={imageSrc} kind="driver" .../>
  </div>
) : null}
```

`imageSrc` artık hep `null` olduğu için bu blok **hiç render olmuyor** — sayfa kırık değil ama sağ taraf
tamamen boş (sadece arka plan gradyanı). Ekran görüntüsü: [logs/2026-09-28.md] içindeki tarayıcı testinde
görüldü — başlık ve istatistikler düzgün, ama kompozisyonun "dergi kapağı" hissi eksik.

**Kapsam dışı — zaten çözülü:** Aynı sorunun görüldüğü diğer her yer zaten düzgün fallback gösteriyor,
dokunmaya gerek yok:
- `components/bento/DriverAvatar.tsx` — baş harf monogramı zaten var, iyi çalışıyor.
- `components/standings/GridDriverStandings.tsx`, `ChampionshipPulse.tsx`, `SeasonTitleFightHero.tsx` —
  `ApexImage` doğrudan `src` alıyor, `null` olduğunda kendi `ApexFallback`'ine düşüyor (rozet: baş harfler
  + takım rengi).
- `components/profile/TeamGarageHero.tsx` — takım araç kesiti için zaten `<ApexFallback kind="car"/>`
  ile açık fallback var, iyi görünüyor (`/teams/red_bull` ekran görüntüsünde doğrulandı).
- Takım logosu rozetleri (`GarageTeamPanel`, `DriverMachineryCard`, `ProfileHero`, `TeamGarageHero`) —
  `kind="team"` ile düzeltildi, her yerde takım rengi + kısa kod gösteriyor.

**Bu brief sadece `DriverProfileHero.tsx`'in boş kalan sağ-kesit alanı için.**

---

## 2. Sabit kısıtlar (pazarlık konusu değil)

| Kısıt | Neden |
|---|---|
| **Gerçek fotoğraf yok** | Telif/kişilik hakkı — kaynak/lisans belgelenemeyen hiçbir insan fotoğrafı kullanılamaz |
| **AI-üretilmiş görsel yok** | Efendim'in açık kararı (2026-09-28) |
| **Tamamen veri-güdümlü olmalı** | Yeni bir pilot (örn. 2027 kadro değişikliği) geldiğinde elle hiçbir şey eklenmemeli — isim, kod, numara, takım rengi zaten canlı veriden geliyor (bkz. §3) |
| **Apex tasarım diline uymalı** | `docs/design/apex-design-language.md` — karanlık sinematik, Apex Red accent, Barlow Condensed + JetBrains Mono, AI slop yasak (saf siyah/neon/generic gradient yok) |
| **Responsive** | Mobil zaten glass-panel + tam genişlik başlık kullanıyor (fotoğrafsız da makul görünüyor) — bu brief öncelikle **masaüstü sağ-kesit** alanı için; mobilde ek bir eleman gerekmeyebilir |

---

## 3. Elinizde hazır olan veri (ek fetch gerekmez)

`DriverProfileHero` şu an şu prop'ları zaten alıyor: `kicker`, `title` (tam isim), `meta`, `bigNumber`
(pilot numarası), `editorialTagline`. Ayrıca sayfa (`app/[locale]/drivers/[driverId]/page.tsx`) context'inde
`driverCode`, `constructorName`, ve `--team-primary`/`--team-secondary`/`--team-accent` CSS değişkenleri
(`lib/theme.ts` `teamThemeVars()` ile zaten set edilmiş, sayfa `style={theme}` ile sarmalı) mevcut.
Gerekirse `driverCode`/`constructorId` prop olarak `DriverProfileHero`'ya eklenebilir (basit prop-threading).

---

## 4. Yeniden kullanılabilir mevcut yapı taşları

Sıfırdan başlamayın — proje zaten bu sorunu başka yerlerde çözmüş:

- **`lib/assets/team-pattern.ts`** — takım başına ayırt edici, salt-CSS mikro-doku (`diagonal`, `grid`,
  `chevron`, `dots`, `hatch`, `arrows` — takım kimliğine göre otomatik seçilir). Şu an `GarageTeamPanel`'de
  arka plan olarak kullanılıyor. Sıfır asset, sıfır maliyet, her takım için otomatik.
- **`components/media/ApexFallback.tsx`** (`markFrom()`) — isimden/koddan baş harf/kod çıkarma mantığı
  (`"Max Verstappen"` → `"MV"`, `"VER"` → `"VER"` olduğu gibi kalır). Bu component küçük rozetler için
  tasarlandı ama mantığı (initials extraction) büyük bir kompozisyonda da kullanılabilir.
- **`components/bento/DriverAvatar.tsx`** (`initials()`) — aynı mantığın ikinci, bağımsız bir uygulaması;
  referans olarak bakılabilir (baş harf + hafif takım rengi wash, "asla boş daire" prensibi — design.md §6).
- **Mevcut `bigNumber` watermark'ı** — `DriverProfileHero` içinde zaten dev bir outline numara render
  ediyor (z-0, arka planda). Bu zaten güçlü bir "fotoğrafsız hero" unsuru; yeni tasarım bunu tamamlayıcı
  ya da ana unsur olarak büyütebilir.
- **`--team-secondary` / `--team-primary` / `--team-accent`** CSS değişkenleri — her pilot sayfasında zaten
  set edili, JS'e dokunmadan salt CSS ile takım rengine göre boyanabilir.

---

## 5. Yön önerileri (antigravity karar verir / karıştırır)

Üç somut yön — hiçbiri zorunlu değil, bunlar başlangıç noktası:

### Yön A — "Numara Öne Çıkar" (en editöryel, en az iş)
Mevcut `bigNumber` watermark'ını kompozisyonun ana görseli yap — sağdaki boş alanı kaldır, başlık +
numara + istatistikleri tam genişlik bir "dergi kapağı" düzenine al (bkz. `TeamGarageHero`'nun zaten
yaptığı gibi ortalı büyük tipografi). En sade çözüm, en az risk, mevcut kodun çoğu korunur.

### Yön B — "Dev Monogram Kesit" (mevcut kompozisyona en sadık)
Fotoğrafın durduğu yere (`PORTRAIT_MASK` ile maskelenen sağ %62-68 kesit) devasa bir pilot kodu/baş harf
tipografisi yerleştir — `ApexFallback`'teki `markFrom()` mantığının çok büyütülmüş hali, aynı gradient
maskeyle (üstten/alttan yumuşak geçiş) arka plana karışsın. Kompozisyon aynı kalır, sadece "fotoğraf" yerine
"tipografik heykel" olur.

### Yön C — "Doku + Numara Hibriti" (en soyut, en az "sahte fotoğraf" hissi)
Kesit alanını `teamPatternStyle()`'dan gelen takım dokusuyla doldur (dikey bir panel şeklinde, mevcut
maskeyle), üzerine `bigNumber`'ı büyük outline olarak bindir, köşeye küçük pilot kodu rozeti koy. Fotoğraf
taklit etmeye çalışmaz, kendi soyut dilini kurar — glossary CAD-blueprint estetiğine yakın bir "teknik
şema" hissi verebilir.

**Öneri değil, gözlem:** B, mevcut layout/animasyon/responsive kodun en büyük kısmını koruduğu için en
düşük riskli — ama A veya C daha "kendine has" bir kimlik kurabilir. Karar tamamen antigravity'nin.

---

## 6. Kabul kriterleri

- [ ] Hiçbir gerçek fotoğraf, hiçbir AI-üretilmiş görsel kullanılmıyor.
- [ ] Yeni bir pilot (henüz `data/drivers/index.ts`'te lore'u olmayan biri dahil) sayfaya girdiğinde otomatik
      çalışıyor — elle hiçbir asset/config eklemeye gerek yok.
- [ ] Masaüstünde sağ taraf artık boş değil, kompozisyon "tamamlanmış" hissettiriyor.
- [ ] Mobilde regresyon yok (mevcut glass-panel + başlık düzeni zaten iyi durumda, dokunulması opsiyonel).
- [ ] `docs/design/apex-design-language.md`'deki token'lar (renk, tipografi, radius) dışına çıkılmıyor.
- [ ] `npm run build`/`lint`/`test` yeşil kalıyor.

---

## 7. Referans

| Konu | Kaynak |
|---|---|
| Fotoğrafsız politika kararı | commit `398739f`, `docs/vision/technical.md` "Görsel politikası" |
| Tasarım dili | `docs/design/apex-design-language.md` |
| Sorunlu bileşen | `components/profile/DriverProfileHero.tsx` |
| İyi çalışan emsal | `components/profile/TeamGarageHero.tsx`, `components/bento/DriverAvatar.tsx` |
| Yeniden kullanılabilir yapı taşları | `lib/assets/team-pattern.ts`, `components/media/ApexFallback.tsx` |
| Çağıran sayfa | `app/[locale]/drivers/[driverId]/page.tsx` |
